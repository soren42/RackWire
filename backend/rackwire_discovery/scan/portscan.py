"""
portscan.py — nmap service + OS detection for a single host.

Purpose: wrap the system `nmap` binary to enumerate open TCP services (with
product/version banners) and to guess the operating system of one host, then
reduce nmap's XML into plain dicts the orchestrator can persist.

Input:  a single IP string plus the service Config object (accepted for
        contract uniformity with the other scanners; portscan takes no
        credentials from it today).
Output: a dict shaped
        {"ip": str, "osGuess": str|None, "hostname": str|None,
         "services": [{"port": int, "proto": "tcp", "service": str|None,
                       "product": str|None, "version": str|None,
                       "banner": str|None}],
         "raw": <compact dict of parsed facts>}
        or None when nmap could not run at all.

Contract notes (DISCOVERY-DESIGN.md §3):
  - No DB access, no store import — the orchestrator persists.
  - argv-list subprocess only, absolute tool path from const, mandatory timeout.
  - A missing/failed tool degrades gracefully: warning + None/partial, never an
    exception out of scanHost().
  - `nmap -O` needs raw-socket privilege (root/CAP_NET_RAW). On a permission
    failure we retry WITHOUT -O so the -sV service scan still yields results,
    logging that OS detection was skipped and returning a partial result.

This mirrors the nmap flags used by the SolariNet enrichment port
(nmap_enrich.py); the logic is duplicated here, never called across services —
independence is a hard constraint (DISCOVERY-DESIGN.md §0).
"""

import logging
import subprocess
import xml.etree.ElementTree as ET

from .. import const

log = logging.getLogger("rackwire.discovery.portscan")

# stderr/stdout fragments that indicate nmap lacked the raw-socket privilege
# that -O (OS detection) requires. Matched case-insensitively.
_PERM_HINTS = (
    "requires root privileges",
    "requires privileged",
    "operation not permitted",
    "you requested a scan type which requires root",
    "only root",
    "tcp/ip fingerprinting.*which requires root",
    "os scan requires root",
    "root privileges",
)


def _buildArgv(ip, withOs):
    """Assemble the nmap argv list. Input: target ip, withOs flag. Output: the
    argv list. -oX - emits XML to stdout; -sV probes service/version; -O adds
    OS detection (dropped on the privilege-fallback retry)."""
    argv = [const.TOOL_NMAP, "-sV"]
    if withOs:
        argv.append("-O")
    argv += [
        "--top-ports", str(const.NMAP_TOP_PORTS),
        "-T4",
        "--host-timeout", f"{const.TIMEOUT_NMAP_HOST}s",
        "-oX", "-",
        ip,
    ]
    return argv


def _runNmap(argv):
    """Run one nmap invocation. Input: argv list. Output: CompletedProcess, or
    None on any launch/timeout failure (logged). Never raises — graceful
    degradation is the module contract. The subprocess timeout is the per-host
    nmap ceiling plus a 30s grace so nmap's own --host-timeout expires first."""
    try:
        return subprocess.run(
            argv,
            capture_output=True,
            text=True,
            timeout=const.TIMEOUT_NMAP_HOST + 30,
        )
    except FileNotFoundError:
        log.warning("nmap not found: %s — install it or fix const.py path",
                    argv[0])
    except subprocess.TimeoutExpired:
        log.warning("nmap timed out after %ss for target %s",
                    const.TIMEOUT_NMAP_HOST + 30, argv[-1])
    except OSError as exc:
        log.warning("nmap failed to launch (%s): %s", exc, argv[0])
    return None


def _looksLikePrivilegeError(proc):
    """True when nmap's output indicates -O needs root that we don't have.
    Input: CompletedProcess. Output: bool. Checks stderr and stdout since nmap
    prints the privilege complaint to either depending on version/context."""
    blob = ((proc.stderr or "") + " " + (proc.stdout or "")).lower()
    return any(hint in blob for hint in _PERM_HINTS)


def _text(node):
    """Attribute helper: return a stripped non-empty string or None. Input: a
    raw attribute value (str or None). Output: cleaned str, or None when the
    value is missing or blank — nmap emits empty attributes we treat as absent."""
    if node is None:
        return None
    value = node.strip()
    return value or None


def _buildBanner(product, version, extrainfo):
    """Join the service descriptor fragments into one human banner string.
    Input: product/version/extrainfo (each str|None). Output: the joined
    non-empty parts as one space-separated str, or None when all are absent."""
    parts = [p for p in (product, version, extrainfo) if p]
    return " ".join(parts) if parts else None


def _parseServices(root):
    """Extract open ports from a parsed nmap XML tree.
    Input: the <nmaprun> Element. Output: list of service dicts. Only ports in
    state=open are kept; closed/filtered ports carry no service facts we want."""
    services = []
    # A single-host scan yields one <host>, but iterate defensively.
    for host in root.findall("host"):
        ports = host.find("ports")
        if ports is None:
            continue
        for port in ports.findall("port"):
            state = port.find("state")
            if state is None or state.get("state") != "open":
                continue
            try:
                portId = int(port.get("portid"))
            except (TypeError, ValueError):
                continue  # malformed portid — skip rather than trust it
            proto = _text(port.get("protocol")) or "tcp"
            svc = port.find("service")
            name = product = version = extrainfo = None
            if svc is not None:
                name = _text(svc.get("name"))
                product = _text(svc.get("product"))
                version = _text(svc.get("version"))
                extrainfo = _text(svc.get("extrainfo"))
            services.append({
                "port": portId,
                "proto": proto,
                "service": name,
                "product": product,
                "version": version,
                "banner": _buildBanner(product, version, extrainfo),
            })
    return services


def _parseOsGuess(root):
    """Pick the highest-accuracy OS name from nmap's <os><osmatch> entries.
    Input: the <nmaprun> Element. Output: OS name str, or None when nmap made
    no match (common without -O or against a stealthy host)."""
    best = None
    bestAccuracy = -1
    for host in root.findall("host"):
        osNode = host.find("os")
        if osNode is None:
            continue
        for match in osNode.findall("osmatch"):
            name = _text(match.get("name"))
            if name is None:
                continue
            try:
                accuracy = int(match.get("accuracy") or "0")
            except ValueError:
                accuracy = 0
            if accuracy > bestAccuracy:
                bestAccuracy = accuracy
                best = name
    return best


def _parseHostname(root):
    """Pull the first hostname nmap resolved for the host.
    Input: the <nmaprun> Element. Output: hostname str, or None when nmap has
    no name (unresolved / no reverse DNS)."""
    for host in root.findall("host"):
        hostnames = host.find("hostnames")
        if hostnames is None:
            continue
        for hostname in hostnames.findall("hostname"):
            name = _text(hostname.get("name"))
            if name is not None:
                return name
    return None


def _parseXml(xmlText, ip):
    """Parse nmap XML into the result dict.
    Input: XML text from nmap -oX -, the target ip. Output: the result dict, or
    None when the XML is unparseable (nmap emitted nothing usable)."""
    try:
        root = ET.fromstring(xmlText)
    except ET.ParseError as exc:
        log.warning("nmap XML unparseable for %s: %s", ip, exc)
        return None

    services = _parseServices(root)
    osGuess = _parseOsGuess(root)
    hostname = _parseHostname(root)

    return {
        "ip": ip,
        "osGuess": osGuess,
        "hostname": hostname,
        "services": services,
        # Compact provenance snapshot: the reduced facts, not the full XML.
        "raw": {
            "osGuess": osGuess,
            "hostname": hostname,
            "serviceCount": len(services),
            "services": services,
        },
    }


def scanHost(ip, config):
    """Service- and OS-scan a single host with nmap.

    Input: ip (str), config (Config — unused today; accepted per the scanner
    contract for future options). Output: the result dict described in the
    module docstring, or None when nmap could not run at all. Never raises.

    Privilege handling: the first attempt includes -O (OS detection). If nmap
    reports it needs root for that, we retry WITHOUT -O so the -sV service scan
    still succeeds, log that OS detection was skipped, and return a partial
    result (osGuess will be None).
    """
    # First attempt: full service + OS scan.
    argv = _buildArgv(ip, withOs=True)
    proc = _runNmap(argv)
    if proc is None:
        # nmap missing/timed out/failed to launch — already logged.
        return None

    # nmap exits non-zero on a privilege problem (among others). If the output
    # says -O needs root, drop -O and retry so services still come back.
    if proc.returncode != 0 and _looksLikePrivilegeError(proc):
        log.warning(
            "nmap -O needs raw-socket privilege on this host — grant "
            "CAP_NET_RAW on %s (run deploy/install.sh, which setcaps the "
            "scanners); retrying %s WITHOUT OS detection (service scan only)",
            const.TOOL_NMAP, ip,
        )
        proc = _runNmap(_buildArgv(ip, withOs=False))
        if proc is None:
            return None

    if proc.returncode != 0:
        # Non-privilege failure. nmap may still have emitted partial XML on
        # stdout (e.g. host-timeout); try to parse it, but record the error.
        log.warning("nmap exited %d for %s: %s", proc.returncode, ip,
                    (proc.stderr or "").strip()[:200])

    if not (proc.stdout or "").strip():
        log.warning("nmap produced no XML output for %s", ip)
        return None

    return _parseXml(proc.stdout, ip)
