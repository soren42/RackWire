"""
orchestrator.py — coordinate a full scan run and assemble inference facts.

Purpose: sequence the leaf scanners across a subnet, persist results to the
store, and expose the helpers the API layer needs (tool availability, default
subnet, per-device fact assembly). Input: subnet + config + store. Output: rows
written to the store; no return value from runScan.

This module owns concurrency and persistence. The leaf scanners (arp, ping,
portscan, snmp, lldp, oui) stay pure — they take a target and return dicts.
"""

import ipaddress
import logging
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

from .. import const
from ..util import nowIso
from . import arp, ping, portscan, snmp, lldp, oui


log = logging.getLogger("rackwire.discovery.scan")


def toolAvailability():
    """
    Report which scanner binaries are present. Input: none. Output: dict of
    toolName -> bool. The console surfaces this so an operator sees why a given
    signal (e.g. SNMP) is missing.
    """
    return {
        "nmap": os.path.exists(const.TOOL_NMAP),
        "snmpwalk": os.path.exists(const.TOOL_SNMPWALK),
        "snmpget": os.path.exists(const.TOOL_SNMPGET),
        "arp-scan": os.path.exists(const.TOOL_ARPSCAN),
        "ping": os.path.exists(const.TOOL_PING),
        "ip": os.path.exists(const.TOOL_IP),
    }


def defaultSubnet():
    """
    Derive the host's own primary IPv4 subnet, so an operator can scan "my
    network" without typing a CIDR. Input: none. Output: CIDR string or None.

    Uses `ip -o -f inet addr show` and picks the first non-loopback network.
    Never falls back to a broad range — returns None if nothing sane is found.
    """
    try:
        out = subprocess.run(
            [const.TOOL_IP, "-o", "-f", "inet", "addr", "show"],
            capture_output=True, text=True, timeout=5, check=False,
        ).stdout
    except (OSError, subprocess.SubprocessError) as exc:
        log.warning("defaultSubnet: `ip addr` failed: %s", exc)
        return None
    for line in out.splitlines():
        parts = line.split()
        # Format: "<idx>: <ifname> inet <cidr> ..."
        for i, tok in enumerate(parts):
            if tok == "inet" and i + 1 < len(parts):
                cidr = parts[i + 1]
                try:
                    net = ipaddress.ip_interface(cidr).network
                except ValueError:
                    continue
                if not net.is_loopback and net.prefixlen <= 30:
                    return str(net)
    return None


def runScan(subnet, options, config, store, cancelFlag, runId=None):
    """
    Execute a full scan across `subnet`, persisting devices/ports/services/
    neighbors as they are found.

    Input:  subnet (CIDR), options (dict), config (Config), store (Store),
            cancelFlag (threading.Event — set to abort), runId (recorded on
            each device as provenance).
    Output: none (side effects in the store).

    Sequence: arp + ping liveness -> per-host nmap + SNMP system -> ifTable +
    LLDP for SNMP-capable hosts -> OUI vendor. Concurrency is bounded; a set
    cancelFlag drains in-flight work and stops launching new hosts.
    """
    live = _liveness(subnet, config, cancelFlag)
    log.info("scan %s: %d live hosts", subnet, len(live))

    # Clamp concurrency to a sane hard ceiling: a misconfigured env must not be
    # able to launch thousands of threads.
    requested = getattr(config, "hostConcurrency", const.DEFAULT_HOST_CONCURRENCY)
    concurrency = max(1, min(int(requested or 1), const.MAX_HOST_CONCURRENCY))
    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = {}
        for ip in sorted(live):
            if cancelFlag.is_set():
                break
            futures[pool.submit(_probeHost, ip, live[ip], config)] = ip
        for fut in as_completed(futures):
            ip = futures[fut]
            try:
                facts, ports, services, neighbors, gathered = fut.result()
            except Exception as exc:  # noqa: BLE001 — one host must not fail run
                log.warning("probe %s failed: %s", ip, exc)
                continue
            deviceId = store.upsertDevice(nowIso(), facts, runId=runId)
            # Replace a signal's rows ONLY when this probe actually gathered it,
            # so a host that answered SNMP with an empty ifTable clears stale
            # ports, while a host we never reached over SNMP keeps its last-known
            # ports instead of being wiped. `gathered` distinguishes the two.
            if "ports" in gathered:
                store.replacePorts(deviceId, ports)
            if "services" in gathered:
                store.replaceServices(deviceId, services)
            if "neighbors" in gathered:
                store.replaceNeighbors(deviceId, neighbors)
            if cancelFlag.is_set():
                # Persist the result already in hand, then stop: cancel any
                # not-yet-started probes and quit draining promptly.
                for pending in futures:
                    pending.cancel()
                log.info("scan %s: cancelled after %s", subnet, ip)
                break


def _liveness(subnet, config, cancelFlag):
    """
    Union of arp and ping results. Input: subnet, config. Output: dict of
    ip -> {"mac": mac|None}. arp gives us MACs; ping catches hosts that ignore
    arp-scan or live off-segment behind a router.
    """
    hosts = {}
    if os.path.exists(const.TOOL_ARPSCAN):
        for row in arp.sweepArp(subnet, config):
            if cancelFlag.is_set():
                break
            hosts.setdefault(row["ip"], {})["mac"] = row.get("mac")
    if os.path.exists(const.TOOL_PING):
        for row in ping.sweepPing(subnet, config):
            if cancelFlag.is_set():
                break
            if row.get("alive"):
                hosts.setdefault(row["ip"], {}).setdefault("mac", None)
    return hosts


def _probeHost(ip, arpInfo, config):
    """
    Gather all signals for one host. Input: ip, arpInfo ({mac}), config.
    Output: (facts, ports, services, neighbors, gathered) ready to persist,
    where `gathered` is the set of signal categories actually collected
    ({"services"}, {"ports","neighbors"}, ...). The caller uses it to tell a
    genuinely-empty result apart from a signal that was never attempted, so a
    re-scan clears stale rows only when it truly re-observed that signal.

    Runs in a worker thread; must be self-contained and swallow no errors
    silently — it logs and returns partial data so one flaky host degrades
    gracefully instead of aborting the run.
    """
    mac = arpInfo.get("mac")
    facts = {
        "ip": ip,
        "mac": mac,
        "vendor": oui.vendorFor(mac) if mac else None,
        "provenance": "scan",
        "raw": {},
    }

    ports, services, neighbors = [], [], []
    gathered = set()

    # nmap: OS guess + open services.
    if os.path.exists(const.TOOL_NMAP):
        scan = portscan.scanHost(ip, config)
        if scan:
            facts["osGuess"] = scan.get("osGuess")
            facts["hostname"] = scan.get("hostname")
            services = scan.get("services", [])
            facts["raw"]["nmap"] = scan.get("raw")
            gathered.add("services")

    # SNMP: system identity, then ifTable + LLDP if the agent answers.
    if os.path.exists(const.TOOL_SNMPGET):
        system = snmp.querySystem(ip, config)
        if system:
            facts["snmpOk"] = True
            facts["sysDescr"] = system.get("sysDescr")
            facts["sysObjectId"] = system.get("sysObjectId")
            facts["hostname"] = facts.get("hostname") or system.get("sysName")
            ports = snmp.queryIfTable(ip, config)
            neighbors = lldp.neighbors(ip, config)
            gathered.add("ports")
            gathered.add("neighbors")

    return facts, ports, services, neighbors, gathered


def deviceFacts(store, deviceId):
    """
    Assemble the fact bundle inference consumes for one device.

    Input:  store, deviceId. Output: dict merging device columns with its
    ports, open services, and neighbors. This is the single shape both
    deterministic and Claude inference read, so their inputs stay identical.
    """
    dev = store.getDevice(deviceId) or {}
    # Ports come back from the store in snake_case column names; the inference
    # layer (deterministic.py, claude.py, mapper.py) reads camelCase keys
    # (speedMbps, ifName, ...). Normalize here so measured bandwidth/PoE are
    # not silently dropped by a key mismatch.
    ports = [
        {
            "ifIndex": p.get("if_index"),
            "ifName": p.get("if_name"),
            "ifDescr": p.get("if_descr"),
            "speedMbps": p.get("if_speed_mbps"),
            "adminStatus": p.get("admin_status"),
            "operStatus": p.get("oper_status"),
            "physMac": p.get("phys_mac"),
            "poe": bool(p.get("poe")),
        }
        for p in store.getPorts(deviceId)
    ]
    return {
        "ip": dev.get("ip"),
        "mac": dev.get("mac"),
        "vendor": dev.get("vendor"),
        "hostname": dev.get("hostname"),
        "osGuess": dev.get("os_guess"),
        "sysDescr": dev.get("sys_descr"),
        "sysObjectId": dev.get("sys_object_id"),
        "snmpOk": bool(dev.get("snmp_ok")),
        "ports": ports,
        "services": store.getServices(deviceId),
        "neighbors": store.getNeighbors(deviceId),
    }
