"""
lldp.py — LLDP neighbor derivation from the SNMP LLDP-MIB.

Purpose: assemble one neighbor record per remote entry in a device's LLDP
remote-systems table (lldpRemTable). lldpctl is intentionally absent on the
target host; everything here rides on SNMP walks performed by scan/snmp.py.
Input: target IP string plus the service Config object (SNMP credentials come
from config, inside snmp.snmpWalk). Output: a list of plain JSON-serializable
dicts, one per remote neighbor:

    {"localPort": str|None, "remoteChassisId": str|None,
     "remotePortId": str|None, "remoteSysName": str|None,
     "remoteSysDescr": str|None, "remoteCaps": str|None, "source": "lldp"}

Contract notes (DISCOVERY-DESIGN.md §3):
  - No DB access, no store import — the orchestrator persists.
  - Never raises: a device with no LLDP-MIB (or no SNMP at all) yields []
    quietly; unexpected walk failures log a warning and yield [].

Index mechanics: lldpRemTable rows are indexed by
(lldpRemTimeMark.lldpRemLocalPortNum.lldpRemIndex), so every walked value
arrives with a 3-component OID suffix like "0.4.1". Values sharing that full
suffix belong to the same remote entry; the middle component is the local
port number, resolved to a name via lldpLocPortId when available.
"""

import logging

from .. import const
from . import snmp

logger = logging.getLogger("rackwire.discovery.lldp")

# lldpRemSysCapEnabled is a BITS value: one flag per bit, MSB-first within
# each octet (RFC 2578 BITS encoding). Bit index -> capability name.
_CAP_NAMES = (
    "other",          # bit 0
    "repeater",       # bit 1
    "bridge",         # bit 2
    "wlanAccessPoint",  # bit 3
    "router",         # bit 4
    "telephone",      # bit 5
    "docsisCableDevice",  # bit 6
    "stationOnly",    # bit 7
)


def _walkPairs(ip, baseOid, config):
    """Walk one OID subtree and normalize the result to a list of
    (suffix, value) string pairs, where suffix is the index portion of the
    OID relative to baseOid (leading dot stripped).

    Tolerates snmp.snmpWalk returning either a {oid: value} dict or an
    iterable of (oid, value) pairs; the OID may be full or already relative.
    Any failure or unrecognized shape degrades to [] with a warning — a host
    without the LLDP-MIB simply produces an empty walk, which is normal and
    logged at debug only inside snmp.py."""
    try:
        walked = snmp.snmpWalk(ip, baseOid, config)
    except Exception as exc:  # scanner contract: never let SNMP errors escape
        logger.warning("snmpWalk failed for %s %s: %s", ip, baseOid, exc)
        return []
    if not walked:
        return []
    if isinstance(walked, dict):
        items = walked.items()
    else:
        try:
            items = [(oid, value) for oid, value in walked]
        except (TypeError, ValueError):
            logger.warning("unexpected snmpWalk result shape for %s %s: %r",
                           ip, baseOid, type(walked))
            return []
    pairs = []
    base = baseOid.lstrip(".")
    for oid, value in items:
        suffix = str(oid).lstrip(".")
        # Reduce a full OID to its index suffix; leave already-relative
        # suffixes ("0.4.1") untouched.
        if suffix.startswith(base):
            suffix = suffix[len(base):].lstrip(".")
        if not suffix:
            continue  # scalar/malformed row — nothing to key a neighbor on
        pairs.append((suffix, str(value)))
    return pairs


def _decodeCaps(rawValue):
    """Best-effort decode of lldpRemSysCapEnabled into a short readable
    string like "bridge+router". Input: the walked value (typically a
    hex-string such as "28 00" or "0x2800"). Output: joined capability names,
    or the raw value unchanged when the bytes cannot be parsed, or None for
    an empty value. Raw passthrough is acceptable per the module contract."""
    if rawValue is None:
        return None
    text = rawValue.strip()
    if not text:
        return None
    # Normalize "0x2800" / "28 00" / "28:00" into a flat hex-digit string.
    hexText = text.lower().removeprefix("0x").replace(":", " ").replace(" ", "")
    try:
        capBytes = bytes.fromhex(hexText)
    except ValueError:
        return text  # not hex (net-snmp may render it oddly) — pass raw
    names = []
    for bitIndex in range(len(capBytes) * 8):
        # BITS: bit 0 is the most-significant bit of the first octet.
        octet = capBytes[bitIndex // 8]
        if octet & (0x80 >> (bitIndex % 8)):
            names.append(_CAP_NAMES[bitIndex] if bitIndex < len(_CAP_NAMES)
                         else "bit%d" % bitIndex)
    return "+".join(names) if names else text


def _localPortNames(ip, config):
    """Walk lldpLocPortId to map localPortNum (str) -> port-id string.
    Best-effort: an empty map just means localPort stays None."""
    names = {}
    for suffix, value in _walkPairs(ip, const.OID_LLDP_LOC_PORT_ID, config):
        # lldpLocPortTable is indexed by the bare port number; take the first
        # suffix component defensively in case an agent appends extras.
        portNum = suffix.split(".")[0]
        if portNum and value:
            names[portNum] = value
    return names


def neighbors(ip, config):
    """Derive LLDP neighbors for one device from its SNMP LLDP-MIB.

    Input: ip (str), config (Config — SNMP credentials/options).
    Output: list of neighbor dicts (see module docstring). Returns [] quietly
    for hosts without LLDP-MIB support; never raises.
    """
    # Walk each remote-table column we care about. Column -> output key.
    columnPlan = (
        (const.OID_LLDP_REM_CHASSIS_ID, "remoteChassisId"),
        (const.OID_LLDP_REM_PORT_ID, "remotePortId"),
        (const.OID_LLDP_REM_SYS_NAME, "remoteSysName"),
        (const.OID_LLDP_REM_SYS_DESC, "remoteSysDescr"),
        (const.OID_LLDP_REM_SYS_CAP, "remoteCaps"),
    )
    # entries: full index suffix (timeMark.localPortNum.remIndex) -> dict of
    # collected column values. Insertion order preserves agent row order.
    entries = {}
    for baseOid, key in columnPlan:
        for suffix, value in _walkPairs(ip, baseOid, config):
            entry = entries.setdefault(suffix, {})
            entry[key] = value
    if not entries:
        # Normal for non-LLDP devices — quiet by contract.
        return []

    portNames = _localPortNames(ip, config)
    results = []
    for suffix, entry in entries.items():
        indexParts = suffix.split(".")
        # Middle component of (timeMark.localPortNum.remIndex). Agents that
        # emit a nonstandard index shape simply get localPort=None.
        localPortNum = indexParts[1] if len(indexParts) >= 3 else None
        localPort = portNames.get(localPortNum) if localPortNum else None
        results.append({
            "localPort": localPort,
            "remoteChassisId": entry.get("remoteChassisId"),
            "remotePortId": entry.get("remotePortId"),
            "remoteSysName": entry.get("remoteSysName"),
            "remoteSysDescr": entry.get("remoteSysDescr"),
            "remoteCaps": _decodeCaps(entry.get("remoteCaps")),
            "source": "lldp",
        })
    logger.info("lldp: %s reported %d neighbor(s)", ip, len(results))
    return results
