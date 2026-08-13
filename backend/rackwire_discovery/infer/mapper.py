"""
mapper.py — map confirmed devices onto the RackWire planner group schema.

Purpose: translate a confirmed `device` store row (plus its gathered facts)
into the planner device-library group payload defined by HANDOFF §6, and
translate LLDP `neighbor` rows into planner link records.

Input:  plain dicts / lists — store rows (snake_case keys) and the
        deviceFacts dict assembled by the orchestrator (camelCase keys,
        notably facts["ports"] = [{ifName, speedMbps, poe, ...}, ...]).
Output: plain JSON-serializable dicts/lists with EXACTLY the planner's key
        names. No DB access, no network I/O — pure functions, unit-testable.

Note on provenance: the group payload itself carries no measured-vs-inferred
flag (the planner schema has no field for it). The operator-facing
measured/inferred distinction is surfaced by the console from the
`inference` audit rows, not from this payload.
"""

import logging
import re

from .. import const

logger = logging.getLogger("rackwire.discovery.infer.mapper")

# Glyph (lucide-ish icon name) per classification. Anything unlisted gets
# the neutral "box" glyph rather than guessing.
_GLYPH_BY_CLASS = {
    "switch": "network",
    "router": "router",
    "ap": "wifi",
    "server": "server",
    "printer": "printer",
    "camera": "cctv",
    "pdu": "plug",
    "ups": "plug",
}
_DEFAULT_GLYPH = "box"

# Sensible default link speed (Gbps) by classification, used only when no
# port carries a measured ifSpeed. Conservative modern-baseline values:
# infrastructure gear defaults to 1 GbE; low-bandwidth endpoints to 0.1.
_DEFAULT_GBPS_BY_CLASS = {
    "switch": 1,
    "router": 1,
    "firewall": 1,
    "ap": 1,
    "server": 1,
    "printer": 0.1,
    "camera": 0.1,
    "pdu": 0.1,
    "ups": 0.1,
}
_DEFAULT_GBPS = 1  # fallback for unknown / unlisted classifications


def _slugFor(device):
    """Build a stable, URL/key-safe slug for the group key `k`.

    Prefers the MAC (globally stable), falls back to the IP, then to the
    row id. Non-alphanumerics collapse to dashes so the key is safe as a
    planner group key and stays identical across re-scans of the same box.
    """
    basis = device.get("mac") or device.get("ip") or str(device.get("id", "unknown"))
    slug = re.sub(r"[^a-z0-9]+", "-", str(basis).lower()).strip("-")
    return "dev-" + (slug or "unknown")


def _labelFor(device):
    """Human-facing label: hostname when known, else 'Vendor ip' / bare ip."""
    hostname = device.get("hostname")
    if hostname:
        return hostname
    vendor = device.get("vendor")
    ip = device.get("ip") or "unknown"
    return "{} {}".format(vendor, ip) if vendor else ip


def toGroup(device, facts):
    """Map a confirmed device row + its facts to a planner group payload.

    device: store `device` row dict (classification, role, mac, ip,
            hostname, vendor, id, ...).
    facts:  deviceFacts dict; facts.get("ports") is a list of port dicts
            with optional "speedMbps" (int) and "poe" (truthy) keys.
            May be None/empty — every field degrades to a sane default.

    Returns a dict with exactly the HANDOFF §6 group-schema keys.
    """
    classification = (device.get("classification") or "").lower()

    # Ports drive gbps / poe / conn. Facts may legitimately be absent
    # (SNMP-blind device) — treat that the same as an empty port list.
    ports = (facts or {}).get("ports") or []

    # Precedence for every hardware figure: MEASURED (from the ifTable) first,
    # then the operator-CONFIRMED value adopted at confirm time (confirmed_*),
    # then a conservative class default. Confirmed specs are how an accepted
    # Claude/heuristic guess reaches the plan (routes.confirmDevice writes them).
    confGbps = _numOr(device.get("confirmed_gbps"))
    confWatts = _numOr(device.get("confirmed_watts"))
    confAmps = _numOr(device.get("confirmed_amps"))
    confPorts = _numOr(device.get("confirmed_ports"))
    confPoe = device.get("confirmed_poe")

    # Max measured port speed wins; else confirmed; else a class default.
    speeds = []
    for port in ports:
        speed = port.get("speedMbps")
        if isinstance(speed, (int, float)) and speed > 0:
            speeds.append(speed)
    if speeds:
        gbps = max(speeds) / 1000
    elif confGbps is not None:
        gbps = confGbps
    else:
        gbps = _DEFAULT_GBPS_BY_CLASS.get(classification, _DEFAULT_GBPS)

    # PoE: any measured PoE port trumps everything; else the confirmed flag.
    if ports:
        poe = any(port.get("poe") for port in ports)
    else:
        poe = bool(confPoe)

    # Connector count: measured ifTable size, else the confirmed port count.
    conn = len(ports) if ports else (int(confPorts) if confPorts else None)

    return {
        "k": _slugFor(device),
        "label": _labelFor(device),
        "glyph": _GLYPH_BY_CLASS.get(classification, _DEFAULT_GLYPH),
        "count": 1,
        "rows": 1,
        # Prefer the explicit RackWire role hint; fall back to classification.
        "role": device.get("role") or device.get("classification"),
        "gbps": gbps,
        # Power comes only from a confirmed spec (discovery cannot measure it
        # without a PDU/power-MIB pass) — null when the operator did not set it.
        "watts": confWatts,
        "amps": confAmps,
        "volts": None,
        "poe": poe,
        "poeW": None,
        "domain": const.DOMAIN_BY_CLASS.get(classification, "other"),
        "conn": conn,
    }


# Library `kind` vocabulary (matches the built-in window.RW.DEVICES entries).
# Discovery classifications collapse onto these; anything unmapped stays as the
# classification string so the operator can correct it rather than lose it.
_KIND_BY_CLASS = {
    "switch": "switch",
    "router": "gateway",
    "firewall": "gateway",
    "ap": "ap",
    "server": "server",
    "host": "server",
    "nas": "server",
    "printer": "printer",
    "camera": "camera",
    "pdu": "power",
    "ups": "power",
    "voip": "appliance",
    "iot": "appliance",
    "appliance": "appliance",
    "unknown": "other",
}


def _librarySlug(vendor, model, device):
    """Stable, key-safe library id. Prefers vendor+model (so the same model
    discovered twice collapses to one library entry), falling back to the
    device slug when the model is unknown."""
    basis = " ".join(p for p in (vendor, model) if p).strip()
    if not basis:
        return _slugFor(device)  # e.g. 'dev-<mac>' — unique per box, not per model
    slug = re.sub(r"[^a-z0-9]+", "-", basis.lower()).strip("-")
    return "disc-" + (slug or "model")


def _dataPortGroups(device, facts, inference):
    """Synthesize the planner port-group list for a discovered device.

    Measured ifTable ports (grouped by speed+PoE) win; absent those, a single
    group is built from the confirmed/inferred port count, link speed and PoE
    flag. Returns a list of group dicts in the planner schema. Discovery sees
    almost exclusively copper Ethernet, so the connector defaults to rj45 —
    the operator corrects fibre/other in the validation panel.
    """
    ports = (facts or {}).get("ports") or []
    groups = []

    # Measured path: coalesce identical (speedMbps, poe) ports into one group so
    # a 24-port switch becomes "24 × 1 GbE", not 24 singleton groups.
    if ports:
        buckets = {}
        order = []
        for port in ports:
            speed = port.get("speedMbps")
            gbps = (speed / 1000) if isinstance(speed, (int, float)) and speed > 0 else None
            poe = bool(port.get("poe"))
            key = (gbps, poe)
            if key not in buckets:
                buckets[key] = 0
                order.append(key)
            buckets[key] += 1
        for idx, key in enumerate(order):
            gbps, poe = key
            groups.append(_portGroup(f"p{idx + 1}", buckets[key], gbps, poe))
        return groups

    # Inferred path: one group from the confirmed/inferred count + speed + PoE.
    confPorts = _numOr(device.get("confirmed_ports"))
    guessPorts = _numOr((inference or {}).get("portsGuess"))
    count = int(confPorts or guessPorts or 0)
    if count <= 0:
        return groups  # nothing measured or guessed — leave ports for the operator
    confGbps = _numOr(device.get("confirmed_gbps"))
    guessGbps = _numOr((inference or {}).get("gbps"))
    gbps = confGbps or guessGbps
    confPoe = device.get("confirmed_poe")
    poe = bool(confPoe) if confPoe is not None else bool((inference or {}).get("poe"))
    groups.append(_portGroup("p1", count, gbps, poe))
    return groups


def _portGroup(key, count, gbps, poe):
    """One Ethernet port group in the planner schema. gbps may be None (unknown
    link rate); PoE is expressed as the planner's 'poe+' string when present."""
    speedLabel = f"{_trimNum(gbps)} GbE" if gbps else "Ethernet"
    label = f"{count}× {speedLabel}" + (" PoE" if poe else "")
    group = {
        "k": key,
        "label": label,
        "glyph": "rj45",
        "count": count,
        "rows": 2 if count > 6 else 1,
        "role": "lan",
        "domain": "net",
        "conn": "rj45",
    }
    if gbps:
        group["gbps"] = gbps
    if poe:
        group["poe"] = "poe+"
    return group


def _powerInGroup(watts):
    """A single AC power-in group, added when a wattage is known so the plan's
    power budget accounts for the device. glyph/conn mirror the built-in
    library's IEC inlet convention."""
    return {
        "k": "pwr",
        "label": f"Power IN{f' · {_trimNum(watts)} W' if watts else ''}",
        "glyph": "iec_in",
        "count": 1,
        "rows": 1,
        "role": "power-in",
        "watts": watts,
        "domain": "power",
        "conn": "iec",
    }


def toLibraryModel(device, facts, inference=None):
    """Build a full planner device-library DEFINITION from a discovered device.

    Unlike toGroup (which emits ONE summary group for a plan), this emits the
    complete window.RW.DEVICES entry — id, vendor, name, model, kind, ru, drawW,
    poeBudgetW and a synthesized groups[] — so a confirmed device can be
    committed to the gear library and reused. It is the CANDIDATE the operator
    validates; nothing here is authoritative until they commit it.

    device:    store device row (classification, vendor, hostname, ip, mac,
               confirmed_* specs, id).
    facts:     deviceFacts dict (facts["ports"] drives measured groups).
    inference: the accepted/most-recent inference dict (vendorGuess, modelGuess,
               nameGuess, portsGuess, gbps, watts, poe, ...), or None. Claude
               fills make/model; without it the fields degrade to the OUI vendor
               and hostname, and the operator types the rest.

    Returns a dict in planner device-def shape.
    """
    inference = inference or {}
    classification = (device.get("classification") or "").lower()

    # Make/model/name: inference first (Claude's recommendation), then the
    # observed OUI vendor / hostname, then a generic placeholder the operator
    # overrides. This is a RECOMMENDATION — the panel lets the human correct it.
    vendor = inference.get("vendorGuess") or device.get("vendor") or ""
    model = inference.get("modelGuess") or device.get("hostname") or ""
    name = (inference.get("nameGuess") or _libraryName(vendor, model, device))

    watts = _numOr(device.get("confirmed_watts")) or _numOr(inference.get("watts"))

    groups = _dataPortGroups(device, facts, inference)
    if watts:
        groups.append(_powerInGroup(watts))

    poe = any(g.get("poe") for g in groups)

    return {
        "id": _librarySlug(vendor, model, device),
        "vendor": vendor or None,
        "name": name,
        "model": model or None,
        "kind": _KIND_BY_CLASS.get(classification, classification or "other"),
        "ru": 0,  # discovery cannot measure rack units; operator sets it
        "drawW": watts or 0,
        "poeBudgetW": _numOr(inference.get("watts")) if poe else None,
        "note": _libraryNote(device, inference),
        "source": "discovery",
        "groups": groups,
    }


def _libraryName(vendor, model, device):
    """Human label for a library entry: 'Vendor Model', else the device label."""
    parts = " ".join(p for p in (vendor, model) if p).strip()
    return parts or _labelFor(device)


def _libraryNote(device, inference):
    """Provenance note: where it came from and (if any) the model's rationale."""
    ip = device.get("ip") or "unknown"
    rationale = (inference or {}).get("rationale") or ""
    base = f"Discovered at {ip}"
    return f"{base} · {rationale}" if rationale else base


def _trimNum(value):
    """Render a number without a trailing '.0' (1.0 -> '1', 2.5 -> '2.5')."""
    try:
        num = float(value)
    except (TypeError, ValueError):
        return str(value)
    return str(int(num)) if num == int(num) else str(num)


def _numOr(value):
    """Coerce a stored spec to a positive number, or None. Guards against the
    empty strings / junk a hand-edited DB row might carry."""
    if isinstance(value, bool) or value is None:
        return None
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    return num if num > 0 else None


def _normMac(value):
    """Normalize a MAC-ish string to bare lowercase hex for comparison.

    LLDP chassis IDs arrive in many spellings (aa:bb:.., AA-BB-.., aabb..).
    Returns None for values that are not 12 hex digits once stripped, so
    non-MAC chassis subtypes (network address, ifName, local) never
    accidentally match.
    """
    if not value:
        return None
    stripped = re.sub(r"[^0-9a-fA-F]", "", str(value))
    return stripped.lower() if len(stripped) == 12 else None


def linksFrom(neighbors, devices):
    """Resolve LLDP neighbor rows into planner links between known devices.

    neighbors: store `neighbor` rows (snake_case: device_id,
               remote_sys_name, remote_chassis_id, local_port).
    devices:   store `device` rows (id, hostname, mac, ip).

    Matches remote_sys_name against device hostname (case-insensitive,
    also on the short name before the first dot) and remote_chassis_id
    against device MAC. Neighbors that resolve to no known device — or to
    the local device itself — are skipped silently; discovery routinely
    hears LLDP from gear outside the scanned subnet.

    Returns [{"from": localDeviceId, "to": remoteDeviceId, "kind": "net"}]
    with duplicates (same pair, either direction) collapsed.
    """
    # Build lookup indexes once: hostname (full + short label) and MAC.
    byName = {}
    byMac = {}
    for dev in devices:
        devId = dev.get("id")
        if devId is None:
            continue
        hostname = dev.get("hostname")
        if hostname:
            name = str(hostname).lower()
            byName.setdefault(name, devId)
            byName.setdefault(name.split(".")[0], devId)
        mac = _normMac(dev.get("mac"))
        if mac:
            byMac.setdefault(mac, devId)

    links = []
    seenPairs = set()
    for neighbor in neighbors:
        localId = neighbor.get("device_id")
        if localId is None:
            continue

        # sys-name match first (most human-verifiable), chassis MAC second.
        remoteId = None
        sysName = neighbor.get("remote_sys_name")
        if sysName:
            key = str(sysName).lower()
            remoteId = byName.get(key) or byName.get(key.split(".")[0])
        if remoteId is None:
            remoteId = byMac.get(_normMac(neighbor.get("remote_chassis_id")))

        if remoteId is None or remoteId == localId:
            # Unresolvable or self-referential adjacency: skip per contract.
            continue

        # LLDP is bidirectional — both ends report the link. Deduplicate on
        # the unordered pair so the planner gets one edge per adjacency.
        pair = (min(localId, remoteId), max(localId, remoteId))
        if pair in seenPairs:
            continue
        seenPairs.add(pair)
        links.append({"from": localId, "to": remoteId, "kind": "net"})

    return links
