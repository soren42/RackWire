"""
ping.py — ICMP liveness sweep across a CIDR.

Purpose: establish which hosts in a subnet answer ICMP echo, in parallel,
without ever wedging a scan run. One `ping -c 1 -W 1 <ip>` subprocess per
candidate host, fanned out through a bounded thread pool.

Input:  a CIDR string (e.g. "10.20.0.0/24") and the service Config object
        (accepted for contract uniformity with the other scanners; ping needs
        no credentials or options from it today).
Output: list of plain dicts {"ip": str, "alive": bool, "rttMs": float|None}.
        Only responding hosts are returned — the orchestrator unions this with
        the arp sweep and only reads alive entries anyway.

Contract notes (DISCOVERY-DESIGN.md §3):
  - Scanners never touch the DB and never import store.
  - argv-list subprocess only, absolute tool path from const, mandatory timeout.
  - A missing/failed ping binary degrades to an empty result + logged warning.
"""

import ipaddress
import logging
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

from .. import const

log = logging.getLogger("rackwire.discovery.ping")

# Hard cap on enumerated hosts: a /22 worth (1022 usable). Anything larger is
# a mistyped CIDR or an abuse of the sweep — we truncate rather than fan out.
MAX_HOSTS = 1022

# Thread-pool width. Each worker blocks on one 1-second-wait ping, so 64 keeps
# a full /22 sweep under ~1 minute worst case without stressing the host.
MAX_WORKERS = 64

# "time=0.42 ms" from ping's reply line. Locale/format tolerant enough for
# iputils and busybox; parsing is best-effort — a miss yields rttMs=None.
_RTT_RE = re.compile(r"time[=<]([\d.]+)\s*ms")


def _pingOne(ip):
    """Ping a single IP once. Returns {"ip", "alive", "rttMs"} — never raises.

    alive is simply returncode == 0. rttMs is parsed from the "time=X ms"
    fragment when present (some targets/ping builds omit it); None on miss.
    """
    try:
        proc = subprocess.run(
            [const.TOOL_PING, "-c", "1", "-W", "1", ip],
            capture_output=True,
            text=True,
            timeout=const.TIMEOUT_PING,
        )
    except subprocess.TimeoutExpired:
        # ping's own -W should expire first; this is the belt-and-braces cap.
        return {"ip": ip, "alive": False, "rttMs": None}
    except OSError as exc:
        # Binary missing/not executable. Warn once per host is noisy but the
        # sweep still completes; the health endpoint reports tool absence.
        log.warning("ping unavailable for %s: %s", ip, exc)
        return {"ip": ip, "alive": False, "rttMs": None}

    alive = proc.returncode == 0
    rttMs = None
    if alive:
        match = _RTT_RE.search(proc.stdout)
        if match:
            try:
                rttMs = float(match.group(1))
            except ValueError:
                rttMs = None  # malformed number — keep alive, drop the rtt
    return {"ip": ip, "alive": alive, "rttMs": rttMs}


def sweepPing(cidr, config):
    """Sweep a CIDR with single-shot pings; return alive hosts only.

    Input: cidr string, Config object (unused today; contract uniformity).
    Output: list of {"ip": str, "alive": bool, "rttMs": float|None} for hosts
    that answered. Bad CIDR or missing tool -> empty list + logged warning.
    """
    try:
        network = ipaddress.ip_network(cidr, strict=False)
    except ValueError as exc:
        log.warning("sweepPing: invalid CIDR %r: %s", cidr, exc)
        return []

    # Enumerate candidate hosts, capped at a /22 worth so an accidental /8
    # cannot wedge the run. Truncation is loud, never silent.
    targets = []
    for host in network.hosts():
        if len(targets) >= MAX_HOSTS:
            log.warning(
                "sweepPing: %s exceeds %d hosts; truncating sweep at %s",
                cidr, MAX_HOSTS, targets[-1],
            )
            break
        targets.append(str(host))

    if not targets:
        # e.g. a /32 has no .hosts() under some forms; ping the address itself.
        targets = [str(network.network_address)]

    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(_pingOne, ip) for ip in targets]
        for future in as_completed(futures):
            row = future.result()  # _pingOne never raises
            if row["alive"]:
                results.append(row)

    log.info("sweepPing: %s -> %d/%d alive", cidr, len(results), len(targets))
    return results
