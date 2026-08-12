"""
arp.py — ARP sweep: MAC <-> IP discovery for a target CIDR.

Purpose: wrap the system `arp-scan` binary to enumerate layer-2 neighbors on
the scanned segment, falling back to the kernel neighbor table (`ip neigh`)
when arp-scan is unavailable or unprivileged. Input: a CIDR string plus the
service Config object. Output: a list of plain dicts {"ip": str, "mac": str}
with MACs normalized to lowercase aa:bb:cc:dd:ee:ff.

Contract notes (DISCOVERY-DESIGN.md §3):
  - No DB access, no store import — the orchestrator persists.
  - argv-list subprocess calls only, mandatory timeout, absolute tool paths.
  - A missing/failed tool degrades gracefully: warning + empty result, never
    an exception out of sweepArp().
  - arp-scan needs raw sockets (CAP_NET_RAW). A permission failure is logged
    with the remediation (run deploy/install.sh, which setcaps the scanners)
    and treated as an empty result; the `ip neigh` fallback still runs.
"""

import ipaddress
import logging
import re
import subprocess

from .. import const

logger = logging.getLogger("rackwire.discovery.arp")

# Matches a 6-octet MAC in either aa:bb:cc:dd:ee:ff or aa-bb-cc-dd-ee-ff form.
_MAC_RE = re.compile(r"^([0-9a-fA-F]{1,2}[:-]){5}[0-9a-fA-F]{1,2}$")

# stderr fragments that indicate arp-scan lacked raw-socket privilege.
_PERM_HINTS = ("operation not permitted", "permission denied", "must be root",
               "you need to be root", "cap_net_raw")


def _normalizeMac(rawMac):
    """Normalize a MAC to lowercase colon-separated, zero-padded octets.
    Input: raw MAC string (colon or dash separated). Output: normalized
    string, or None when the input is not a plausible 6-octet MAC."""
    rawMac = rawMac.strip().lower()
    if not _MAC_RE.match(rawMac):
        return None
    octets = re.split(r"[:-]", rawMac)
    # Zero-pad each octet: some tools emit "0:c:29:..." style short octets.
    return ":".join(octet.zfill(2) for octet in octets)


def _validIp(rawIp):
    """Return the canonical IPv4 address string, or None if not parseable."""
    try:
        return str(ipaddress.ip_address(rawIp.strip()))
    except ValueError:
        return None


def _runTool(argv, timeoutSec):
    """Run one scanner subprocess. Input: argv list + timeout seconds.
    Output: CompletedProcess, or None on any launch/timeout failure (logged).
    Never raises — graceful degradation is the module contract."""
    try:
        return subprocess.run(
            argv,
            capture_output=True,
            text=True,
            timeout=timeoutSec,
        )
    except FileNotFoundError:
        logger.warning("tool not found: %s — install it or fix const.py path",
                       argv[0])
    except subprocess.TimeoutExpired:
        logger.warning("tool timed out after %ss: %s", timeoutSec, argv[0])
    except OSError as exc:
        # Covers exec-permission and other launch-time OS failures.
        logger.warning("tool failed to launch (%s): %s", exc, argv[0])
    return None


def _parseArpScan(stdout):
    """Parse `arp-scan -x` plain output ("ip\\tmac\\tvendor" per line).
    Input: stdout text. Output: list of {"ip", "mac"} dicts; malformed lines
    are skipped silently (arp-scan mixes in blank/summary lines)."""
    results = []
    for line in stdout.splitlines():
        fields = line.split("\t")
        if len(fields) < 2:
            continue
        ip = _validIp(fields[0])
        mac = _normalizeMac(fields[1])
        if ip is None or mac is None:
            continue  # summary noise or a line we cannot trust
        results.append({"ip": ip, "mac": mac})
    return results


def _sweepArpScan(cidr, config):
    """Run arp-scan against the CIDR. Input: cidr + Config. Output: list of
    {"ip", "mac"}. Empty on any failure; a privilege failure gets an
    actionable operator-facing warning."""
    # --localnet would ignore an arbitrary CIDR; pass the CIDR as the target.
    # -q suppresses vendor decode work we don't need; -x gives bare
    # "ip\tmac\tvendor" lines with no header/footer to parse around.
    argv = [const.TOOL_ARPSCAN, "-q", "-x", cidr]
    proc = _runTool(argv, const.TIMEOUT_ARPSCAN)
    if proc is None:
        return []
    stderrLower = (proc.stderr or "").lower()
    if proc.returncode != 0:
        if any(hint in stderrLower for hint in _PERM_HINTS):
            logger.warning(
                "arp-scan lacks raw-socket privilege on this host — grant "
                "CAP_NET_RAW on %s (run deploy/install.sh, which setcaps the "
                "scanners); falling back to `ip neigh`",
                const.TOOL_ARPSCAN,
            )
        else:
            logger.warning("arp-scan exited %d for %s: %s",
                           proc.returncode, cidr,
                           (proc.stderr or "").strip()[:200])
        return []
    return _parseArpScan(proc.stdout or "")


def _sweepIpNeigh(cidr, config):
    """Read the kernel neighbor table via `ip neigh` and keep entries inside
    the target CIDR. Input: cidr + Config. Output: list of {"ip", "mac"}.
    This sees only hosts the kernel already talked to — a complement to the
    active arp-scan sweep, and the sole source when arp-scan is unusable."""
    try:
        network = ipaddress.ip_network(cidr, strict=False)
    except ValueError:
        logger.warning("invalid CIDR for ip-neigh fallback: %r", cidr)
        return []
    proc = _runTool([const.TOOL_IP, "neigh", "show"], const.TIMEOUT_ARPSCAN)
    if proc is None:
        return []
    if proc.returncode != 0:
        logger.warning("`ip neigh` exited %d: %s", proc.returncode,
                       (proc.stderr or "").strip()[:200])
        return []
    results = []
    for line in (proc.stdout or "").splitlines():
        # Format: "<ip> dev <if> lladdr <mac> <STATE>". Entries without an
        # lladdr (FAILED/INCOMPLETE) carry no MAC and are skipped.
        tokens = line.split()
        if "lladdr" not in tokens:
            continue
        ip = _validIp(tokens[0]) if tokens else None
        if ip is None:
            continue
        try:
            if ipaddress.ip_address(ip) not in network:
                continue  # neighbor on some other segment
        except ValueError:
            continue
        macIdx = tokens.index("lladdr") + 1
        if macIdx >= len(tokens):
            continue
        mac = _normalizeMac(tokens[macIdx])
        if mac is None:
            continue
        results.append({"ip": ip, "mac": mac})
    return results


def sweepArp(cidr, config):
    """ARP-sweep a CIDR for live MAC<->IP pairs.

    Input: cidr (str, e.g. "192.168.1.0/24"), config (Config — unused today,
    accepted per the scanner contract for future credentials/options).
    Output: list of {"ip": str, "mac": str}, deduplicated by IP, MACs
    normalized lowercase. Never raises; failures degrade to fewer results.
    """
    seenByIp = {}
    # Primary: active arp-scan sweep of the segment.
    for row in _sweepArpScan(cidr, config):
        seenByIp[row["ip"]] = row
    # Supplement: kernel neighbor table catches hosts arp-scan missed (and is
    # the only source when arp-scan is missing/unprivileged). arp-scan's
    # fresh answers win on IP collision, so setdefault.
    for row in _sweepIpNeigh(cidr, config):
        seenByIp.setdefault(row["ip"], row)
    logger.info("arp sweep of %s found %d hosts", cidr, len(seenByIp))
    return list(seenByIp.values())
