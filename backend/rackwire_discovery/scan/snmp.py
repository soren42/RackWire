"""
snmp.py — snmpget/snmpwalk wrappers: system group + ifTable collection.

Purpose: wrap the net-snmp command-line tools to gather the SNMP system group
(sysDescr/sysObjectID/sysName) and the interface table (ifTable/ifXTable) from
a single host. Input: an IP string plus the service Config object (which
carries the SNMP credentials — v2c community or v3 user/auth/priv). Output:
plain JSON-serializable dicts/lists with the exact key names in the contract.

Also exposes the reusable low-level helpers snmpGet(ip, oid, config) and
snmpWalk(ip, oid, config) so lldp.py can drive the LLDP-MIB walks without
duplicating auth-argument or output-parsing logic.

Contract notes (DISCOVERY-DESIGN.md §3, §3.1):
  - No DB access, no store import — the orchestrator persists.
  - argv-list subprocess calls only, mandatory timeout, absolute tool paths.
  - A non-responding host is NORMAL (most devices are SNMP-silent): return
    None / [] quietly at debug level, never raise, never spam warnings.
  - NEVER log the community string or v3 keys — the credential argv is
    excluded from every log line by construction.
"""

import logging
import re
import subprocess

from .. import const

logger = logging.getLogger("rackwire.discovery.snmp")

# net-snmp stdout markers meaning "the agent answered but has no such value".
# These arrive on stdout with exit code 0, so they must be filtered by text.
_NO_SUCH_MARKERS = (
    "No Such Object",
    "No Such Instance",
    "No more variables left",  # end-of-MIB walk on an empty subtree
)

# ifOperStatus / ifAdminStatus enumerations we care about (RFC 2863). Values
# beyond up/down (testing, dormant, ...) are passed through as their raw
# integer string so nothing is silently lost.
_STATUS_MAP = {"1": "up", "2": "down"}

# Matches one hex octet, used when normalizing ifPhysAddress output.
_HEX_OCTET_RE = re.compile(r"^[0-9a-fA-F]{1,2}$")


# --- Credential handling ---------------------------------------------------

def _authArgs(config):
    """Build the snmpget/snmpwalk credential argv from config.

    Input: Config. Output: list of argv tokens, or None when the config is
    unusable (e.g. v3 selected but no user) — callers treat None as "cannot
    query, return empty". The returned list contains secrets: it must NEVER
    be logged or embedded in an error message.
    """
    version = (config.snmpVersion or "2c").strip().lower()
    if version in ("2c", "2", "1"):
        # v1 collapses to v2c handling; "-v 1" only if explicitly asked.
        flag = "1" if version == "1" else "2c"
        if not config.snmpCommunity:
            logger.warning("snmp v%s selected but no community configured", flag)
            return None
        return ["-v", flag, "-c", config.snmpCommunity]
    if version == "3":
        if not config.snmpV3User:
            logger.warning("snmp v3 selected but no v3 user configured")
            return None
        argv = ["-v", "3", "-u", config.snmpV3User]
        hasAuth = bool(config.snmpV3AuthProto and config.snmpV3AuthKey)
        hasPriv = bool(config.snmpV3PrivProto and config.snmpV3PrivKey)
        # Security level follows what credentials are actually present.
        if hasAuth and hasPriv:
            argv += ["-l", "authPriv",
                     "-a", config.snmpV3AuthProto, "-A", config.snmpV3AuthKey,
                     "-x", config.snmpV3PrivProto, "-X", config.snmpV3PrivKey]
        elif hasAuth:
            argv += ["-l", "authNoPriv",
                     "-a", config.snmpV3AuthProto, "-A", config.snmpV3AuthKey]
        else:
            argv += ["-l", "noAuthNoPriv"]
        return argv
    logger.warning("unsupported snmp version in config: %r", config.snmpVersion)
    return None


def _runSnmp(tool, outputFlags, ip, oid, config):
    """Run one snmpget/snmpwalk invocation.

    Input: absolute tool path, output-format flags (e.g. ["-Oqv"]), target ip,
    OID, Config. Output: stdout text on success, or None on any failure
    (missing tool, timeout, non-zero exit, bad credentials config).
    Never raises. Log lines carry only tool/ip/oid — never the credential
    argv, so secrets cannot leak into logs.
    """
    authArgs = _authArgs(config)
    if authArgs is None:
        return None
    # -r 1: one retry; -t 3: 3s per attempt. Bounded well inside TIMEOUT_SNMP
    # so the subprocess timeout is a backstop, not the normal exit path.
    argv = ([tool] + authArgs
            + ["-r", "1", "-t", "3", "-On"] + outputFlags
            + [ip, oid])
    try:
        proc = subprocess.run(
            argv,
            capture_output=True,
            text=True,
            timeout=const.TIMEOUT_SNMP,
        )
    except FileNotFoundError:
        logger.warning("tool not found: %s — install net-snmp or fix const.py "
                       "path", tool)
        return None
    except subprocess.TimeoutExpired:
        # Should be rare given -r/-t; the host is badly wedged, not just quiet.
        logger.debug("snmp subprocess timeout for %s %s", ip, oid)
        return None
    except OSError as exc:
        logger.warning("snmp tool failed to launch (%s): %s", exc, tool)
        return None
    if proc.returncode != 0:
        # Exit 1 with "Timeout" on stderr is the everyday "host is not an SNMP
        # agent" case — normal, so debug level only. No credential in the line.
        logger.debug("%s exited %d for %s %s", tool, proc.returncode, ip, oid)
        return None
    return proc.stdout or ""


# --- Reusable low-level API (also consumed by lldp.py) ---------------------

def snmpGet(ip, oid, config):
    """GET a single scalar OID from a host.

    Input: ip (str), oid (str, numeric leading-dot form), config (Config).
    Output: the value as a stripped string, or None when the host is silent,
    the OID is absent, or the tool failed. Never raises.
    """
    stdout = _runSnmp(const.TOOL_SNMPGET, ["-Oqv"], ip, oid, config)
    if stdout is None:
        return None
    value = stdout.strip()
    if not value or any(marker in value for marker in _NO_SUCH_MARKERS):
        return None
    # -Oqv wraps octet strings in quotes; unwrap for a clean value.
    if len(value) >= 2 and value[0] == '"' and value[-1] == '"':
        value = value[1:-1]
    return value


def snmpWalk(ip, oid, config):
    """WALK a table subtree on a host.

    Input: ip (str), oid (str, numeric base OID), config (Config).
    Output: list of (oidSuffix, value) tuples, where oidSuffix is the portion
    of each returned OID after the base (leading dot stripped, e.g. "3" for
    ifIndex 3, or "0.5.2" for LLDP composite indices) and value is the
    stripped string value. Empty list on any failure. Never raises.
    """
    stdout = _runSnmp(const.TOOL_SNMPWALK, ["-Oq"], ip, oid, config)
    if stdout is None:
        return []
    base = oid if oid.startswith(".") else "." + oid
    results = []
    for line in stdout.splitlines():
        line = line.strip()
        if not line or any(marker in line for marker in _NO_SUCH_MARKERS):
            continue
        # -Oq format: "<numeric-oid> <value>". Value may itself contain
        # spaces (sysDescr, hex strings), so split once only.
        parts = line.split(" ", 1)
        fullOid = parts[0]
        value = parts[1].strip() if len(parts) > 1 else ""
        if not fullOid.startswith(base + "."):
            # A walk that ran past the subtree, or noise — skip, don't guess.
            continue
        suffix = fullOid[len(base) + 1:]
        # -Oq quotes octet-string values; unwrap like snmpGet does.
        if len(value) >= 2 and value[0] == '"' and value[-1] == '"':
            value = value[1:-1]
        results.append((suffix, value))
    return results


# --- Value normalizers -----------------------------------------------------

def _normalizeMac(rawValue):
    """Normalize an ifPhysAddress value to lowercase aa:bb:cc:dd:ee:ff.

    net-snmp renders phys addresses variously as "0:c:29:aa:bb:cc" (display
    hint) or "0 c 29 aa bb cc" (raw hex string), octets not always padded.
    Input: raw string. Output: normalized MAC, or None when the value is
    empty / not a plausible 6-octet address (e.g. loopback's empty string).
    """
    if not rawValue:
        return None
    octets = re.split(r"[:\s-]+", rawValue.strip())
    if len(octets) != 6 or not all(_HEX_OCTET_RE.match(o) for o in octets):
        return None
    return ":".join(o.lower().zfill(2) for o in octets)


def _mapStatus(rawValue):
    """Map an ifAdminStatus/ifOperStatus value to "up"/"down".

    net-snmp renders enums in several ways depending on MIB availability and
    output flags: a bare integer ("1"), the label ("up"), or the combined
    form ("up(1)"). All three normalize here. Other defined states (testing,
    dormant, ...) pass through as their lowercase label; empty -> None."""
    if not rawValue:
        return None
    value = rawValue.strip()
    # Combined "label(number)" — prefer the number, the stable machine form.
    combined = re.match(r"^[a-zA-Z]+\((\d+)\)$", value)
    if combined:
        return _STATUS_MAP.get(combined.group(1), value.lower())
    if value.isdigit():
        return _STATUS_MAP.get(value, value)
    return value.lower()


def _toInt(rawValue):
    """Parse an integer-valued SNMP string. Output: int or None (never raises
    on the junk some agents emit). Tolerates a trailing unit or an enum
    "label(number)" wrapper by extracting the first signed integer."""
    if rawValue is None:
        return None
    text = str(rawValue).strip()
    try:
        return int(text)
    except ValueError:
        match = re.search(r"-?\d+", text)
        return int(match.group()) if match else None


# --- High-level scanner API ------------------------------------------------

def querySystem(ip, config):
    """Query the SNMP system group of one host.

    Input: ip (str), config (Config). Output:
      {"sysDescr": str|None, "sysObjectId": str|None, "sysName": str|None,
       "snmpOk": bool}
    or None when the host did not answer sysDescr at all (SNMP-silent — the
    normal case for most hosts). snmpOk is True iff sysDescr came back.
    """
    sysDescr = snmpGet(ip, const.OID_SYS_DESCR, config)
    if sysDescr is None:
        # No point burning two more timeouts on a host that won't talk.
        return None
    return {
        "sysDescr": sysDescr,
        "sysObjectId": snmpGet(ip, const.OID_SYS_OBJECT_ID, config),
        "sysName": snmpGet(ip, const.OID_SYS_NAME, config),
        "snmpOk": True,
    }


def queryIfTable(ip, config):
    """Walk the interface table (ifTable + ifXTable) of one host.

    Input: ip (str), config (Config). Output: list of
      {"ifIndex": int, "ifName": str|None, "ifDescr": str|None,
       "speedMbps": int|None, "adminStatus": str|None, "operStatus": str|None,
       "physMac": str|None, "poe": bool}
    one dict per interface, sorted by ifIndex. Empty list when the host is
    SNMP-silent or has no ifTable. Never raises.

    speedMbps prefers ifHighSpeed (already in Mbps, and the only accurate
    figure above 4.29 Gbps where 32-bit ifSpeed saturates); falls back to
    ifSpeed / 1_000_000. poe stays False — there is no standard PoE OID in
    this gather; a vendor-MIB pass may set it later.
    """
    # Walk each column; every walk is indexed by the trailing ifIndex integer,
    # which is the join key across ifTable and ifXTable columns.
    ifDescrRows = snmpWalk(ip, const.OID_IF_DESCR, config)
    if not ifDescrRows:
        # No ifDescr column => no usable ifTable (or host went quiet). Skip
        # the remaining walks; this is the normal silent-host exit.
        return []
    ifNameRows = snmpWalk(ip, const.OID_IF_NAME, config)
    speedRows = snmpWalk(ip, const.OID_IF_SPEED, config)
    highSpeedRows = snmpWalk(ip, const.OID_IF_HIGH_SPEED, config)
    adminRows = snmpWalk(ip, const.OID_IF_ADMIN_STATUS, config)
    operRows = snmpWalk(ip, const.OID_IF_OPER_STATUS, config)
    physRows = snmpWalk(ip, const.OID_IF_PHYS_ADDRESS, config)

    def byIndex(rows):
        """Index a column's (suffix, value) rows by ifIndex int; suffixes that
        are not a bare integer (unexpected here) are dropped."""
        out = {}
        for suffix, value in rows:
            idx = _toInt(suffix)
            if idx is not None:
                out[idx] = value
        return out

    names = byIndex(ifNameRows)
    speeds = byIndex(speedRows)
    highSpeeds = byIndex(highSpeedRows)
    admins = byIndex(adminRows)
    opers = byIndex(operRows)
    phys = byIndex(physRows)

    interfaces = []
    for idx, descr in sorted(byIndex(ifDescrRows).items()):
        # Speed: ifHighSpeed is already Mbps; ifSpeed is bits/sec. A zero
        # ifHighSpeed on a down/virtual interface falls through to ifSpeed.
        speedMbps = None
        high = _toInt(highSpeeds.get(idx, ""))
        if high:
            speedMbps = high
        else:
            bps = _toInt(speeds.get(idx, ""))
            if bps:
                speedMbps = bps // 1_000_000
        interfaces.append({
            "ifIndex": idx,
            "ifName": names.get(idx) or None,
            "ifDescr": descr or None,
            "speedMbps": speedMbps,
            "adminStatus": _mapStatus(admins.get(idx)),
            "operStatus": _mapStatus(opers.get(idx)),
            "physMac": _normalizeMac(phys.get(idx, "")),
            "poe": False,
        })
    logger.debug("ifTable walk of %s yielded %d interfaces", ip, len(interfaces))
    return interfaces
