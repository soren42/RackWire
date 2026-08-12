"""Deterministic device classification from already-gathered facts.

Purpose:
    Turn the merged fact dict produced by scan/orchestrator.py (deviceFacts)
    into a classification proposal without any network I/O and without any
    Claude API call. Pure function of its input: same facts in, same result
    out, every time. This is the first-line inference engine (design §4.1);
    infer/claude.py is only consulted when our confidence is low.

Input:
    A plain dict of facts:
        {ip, mac, vendor, hostname, osGuess, sysDescr, sysObjectId, snmpOk,
         ports: [...],                       # SNMP ifTable rows
         services: [{port, proto, service, product, version, banner}, ...],
         neighbors: [...]}                   # LLDP adjacency rows
    Every key is optional; missing/None/empty values simply contribute no
    signal. The function is total — it never raises on malformed facts.

Output:
    {"classification": str,   # one of CLASSIFICATIONS (falls back "unknown")
     "role": str|None,        # short hint: "core"|"access"|"edge"|"endpoint"|...
     "confidence": float,     # 0..1, rises as independent signals agree
     "signals": [str]}        # human-readable audit trail of what fired

House rules honored: stdlib only, camelCase identifiers, no scanner imports,
no store import, no subprocess, no secrets touched or logged.
"""

import logging

from ..const import PORT_FINGERPRINTS

log = logging.getLogger("rackwire.discovery.infer.deterministic")

# ---------------------------------------------------------------------------
# Vocabulary
# ---------------------------------------------------------------------------

# The closed set of classifications this engine may emit. Order matters only
# as the deterministic tie-breaker (earlier wins on equal scores).
CLASSIFICATIONS = (
    "switch", "router", "firewall", "ap", "server", "host", "printer",
    "camera", "pdu", "ups", "voip", "iot", "nas", "appliance", "unknown",
)

# --- OUI vendor hints ------------------------------------------------------
# Substring (lowercased) of the OUI vendor string -> candidate classifications
# with per-class weights. A vendor hint alone is weak-to-moderate evidence:
# e.g. Ubiquiti makes both APs and switches, so it votes for both and lets the
# other signal families break the tie.
VENDOR_HINTS = (
    # (substring, ((classification, weight), ...))
    ("axis",        (("camera", 0.55),)),
    ("hikvision",   (("camera", 0.55),)),
    ("dahua",       (("camera", 0.55),)),
    ("reolink",     (("camera", 0.55),)),
    ("apc",         (("ups", 0.45), ("pdu", 0.40))),
    ("schneider",   (("ups", 0.35), ("pdu", 0.35))),
    ("eaton",       (("ups", 0.45), ("pdu", 0.40))),
    ("tripp",       (("ups", 0.40), ("pdu", 0.40))),  # Tripp Lite
    ("cyberpower",  (("ups", 0.45),)),
    ("ubiquiti",    (("ap", 0.35), ("switch", 0.30))),
    ("mikrotik",    (("router", 0.40), ("switch", 0.30))),
    ("cisco",       (("switch", 0.30), ("router", 0.30))),
    ("juniper",     (("router", 0.35), ("switch", 0.30))),
    ("arista",      (("switch", 0.45),)),
    ("aruba",       (("ap", 0.35), ("switch", 0.30))),
    ("ruckus",      (("ap", 0.45),)),
    ("fortinet",    (("firewall", 0.50),)),
    ("palo alto",   (("firewall", 0.50),)),
    ("sonicwall",   (("firewall", 0.50),)),
    ("watchguard",  (("firewall", 0.50),)),
    ("netgear",     (("switch", 0.30),)),
    ("tp-link",     (("switch", 0.25), ("ap", 0.25))),
    ("d-link",      (("switch", 0.25),)),
    ("synology",    (("nas", 0.55),)),
    ("qnap",        (("nas", 0.55),)),
    ("western digital", (("nas", 0.40),)),
    ("hewlett packard", (("printer", 0.20), ("server", 0.20))),  # ambiguous
    ("brother",     (("printer", 0.50),)),
    ("lexmark",     (("printer", 0.50),)),
    ("kyocera",     (("printer", 0.45),)),
    ("epson",       (("printer", 0.45),)),
    ("canon",       (("printer", 0.40),)),
    ("supermicro",  (("server", 0.45),)),
    ("dell",        (("server", 0.30), ("host", 0.20))),
    ("polycom",     (("voip", 0.50),)),
    ("yealink",     (("voip", 0.50),)),
    ("grandstream", (("voip", 0.45),)),
    ("snom",        (("voip", 0.50),)),
    ("espressif",   (("iot", 0.55),)),
    ("shelly",      (("iot", 0.55),)),
    ("tuya",        (("iot", 0.55),)),
    ("sonos",       (("iot", 0.45),)),
    ("philips",     (("iot", 0.30),)),          # Hue bridges et al.
    ("raspberry",   (("host", 0.35), ("iot", 0.25))),
    ("intel",       (("host", 0.15),)),         # very weak: NICs everywhere
    ("vmware",      (("server", 0.45),)),
    ("proxmox",     (("server", 0.45),)),
    ("apple",       (("host", 0.35),)),
    ("microsoft",   (("host", 0.30),)),
)

# --- sysDescr / sysObjectID substring hints --------------------------------
# SNMP self-description is the strongest single source we have: the device is
# telling us what it is. Weights are correspondingly higher.
SYS_HINTS = (
    ("junos",        (("router", 0.60),)),
    ("ios-xe",       (("switch", 0.55), ("router", 0.40))),
    ("ios xr",       (("router", 0.60),)),
    ("cisco ios",    (("switch", 0.45), ("router", 0.45))),
    ("nx-os",        (("switch", 0.60),)),
    ("catalyst",     (("switch", 0.60),)),
    ("nexus",        (("switch", 0.55),)),
    ("fortigate",    (("firewall", 0.70),)),
    ("fortios",      (("firewall", 0.70),)),
    ("pan-os",       (("firewall", 0.70),)),
    ("pfsense",      (("firewall", 0.65),)),
    ("opnsense",     (("firewall", 0.65),)),
    ("routeros",     (("router", 0.60),)),
    ("edgeos",       (("router", 0.55),)),
    ("edgeswitch",   (("switch", 0.60),)),
    ("unifi",        (("ap", 0.40), ("switch", 0.35))),
    ("airos",        (("ap", 0.60),)),
    ("access point", (("ap", 0.60),)),
    ("wireless",     (("ap", 0.30),)),
    ("procurve",     (("switch", 0.60),)),
    ("aruba",        (("switch", 0.35), ("ap", 0.35))),
    ("switch",       (("switch", 0.45),)),
    ("router",       (("router", 0.45),)),
    ("firewall",     (("firewall", 0.50),)),
    ("jetdirect",    (("printer", 0.65),)),
    ("laserjet",     (("printer", 0.65),)),
    ("printer",      (("printer", 0.55),)),
    ("apc web/snmp", (("ups", 0.55),)),
    ("smart-ups",    (("ups", 0.65),)),
    ("rack pdu",     (("pdu", 0.70),)),
    ("pdu",          (("pdu", 0.50),)),
    ("ups",          (("ups", 0.45),)),
    ("network camera", (("camera", 0.65),)),
    ("ipcam",        (("camera", 0.55),)),
    ("synology",     (("nas", 0.60),)),
    ("qnap",         (("nas", 0.60),)),
    ("truenas",      (("nas", 0.60),)),
    ("freenas",      (("nas", 0.60),)),
    ("esxi",         (("server", 0.60),)),
    ("proxmox",      (("server", 0.60),)),
    ("windows server", (("server", 0.55),)),
    ("linux",        (("server", 0.20), ("host", 0.20))),  # weak: Linux is everywhere
    ("windows",      (("host", 0.30),)),
)

# sysObjectID enterprise-arc prefixes -> weak vendor-family evidence. The arc
# only pins the enterprise, not the product line, so weights stay modest.
SYS_OBJECT_ID_HINTS = (
    (".1.3.6.1.4.1.9.",     (("switch", 0.25), ("router", 0.25))),  # Cisco
    (".1.3.6.1.4.1.2636.",  (("router", 0.30),)),                   # Juniper
    (".1.3.6.1.4.1.12356.", (("firewall", 0.40),)),                 # Fortinet
    (".1.3.6.1.4.1.25461.", (("firewall", 0.40),)),                 # Palo Alto
    (".1.3.6.1.4.1.318.",   (("ups", 0.35), ("pdu", 0.30))),        # APC
    (".1.3.6.1.4.1.534.",   (("ups", 0.35), ("pdu", 0.30))),        # Eaton
    (".1.3.6.1.4.1.41112.", (("ap", 0.30), ("switch", 0.25))),      # Ubiquiti
    (".1.3.6.1.4.1.14988.", (("router", 0.35),)),                   # MikroTik
    (".1.3.6.1.4.1.11.",    (("switch", 0.20), ("printer", 0.15))), # HP
    (".1.3.6.1.4.1.6574.",  (("nas", 0.45),)),                      # Synology
    (".1.3.6.1.4.1.30966.", (("switch", 0.30),)),                   # Netonix
    (".1.3.6.1.4.1.4526.",  (("switch", 0.25),)),                   # Netgear
)

# --- port-fingerprint bucket -> classification vote ------------------------
# PORT_FINGERPRINTS (const.py) maps port -> a coarse bucket. Translate each
# bucket into classification votes. Buckets that are informational rather than
# identifying ("snmp") or ambiguous ("appliance" on 80/443 — everything has a
# web UI) carry low or zero weight.
FINGERPRINT_VOTES = {
    "printer":  (("printer", 0.50),),
    "camera":   (("camera", 0.50),),
    "voip":     (("voip", 0.45),),
    "iot":      (("iot", 0.40),),
    "bmc":      (("server", 0.45),),   # a BMC (623) fronts server hardware
    "host":     (("host", 0.25),),
    "network":  (("switch", 0.15), ("router", 0.15)),  # telnet: legacy gear
    "appliance": (("appliance", 0.10),),  # near-noise: mgmt web UI
    "snmp":     (),                       # SNMP presence proves nothing here
}

# nmap service-name substrings that back up specific classes even when the
# port number is nonstandard (e.g. RTSP on 8554).
SERVICE_NAME_VOTES = (
    ("rtsp",       (("camera", 0.40),)),
    ("jetdirect",  (("printer", 0.50),)),
    ("ipp",        (("printer", 0.40),)),
    ("sip",        (("voip", 0.40),)),
    ("mqtt",       (("iot", 0.40),)),
    ("ipmi",       (("server", 0.40),)),
    ("netbios",    (("host", 0.20),)),
    ("microsoft-ds", (("host", 0.20),)),
    ("vmware",     (("server", 0.45),)),
    ("iscsi",      (("nas", 0.40),)),
    ("nfs",        (("nas", 0.35), ("server", 0.20))),
    ("afp",        (("nas", 0.35),)),
)

# LLDP remote-capability keywords (from lldpRemSysCap) -> what the *neighbor*
# claims to be. When the facts carry caps for this device itself (some
# orchestrator merges do), the same table applies via the "self" path below.
LLDP_CAP_VOTES = (
    ("bridge",    (("switch", 0.45),)),
    ("router",    (("router", 0.45),)),
    ("wlan",      (("ap", 0.50),)),        # wlanAccessPoint
    ("access point", (("ap", 0.50),)),
    ("telephone", (("voip", 0.50),)),
    ("station",   (("host", 0.20),)),
)

# Infrastructure classes for role derivation.
INFRA_CLASSES = frozenset(("switch", "router", "firewall", "ap"))


# ---------------------------------------------------------------------------
# Small helpers (all total: bad input -> neutral value, never an exception)
# ---------------------------------------------------------------------------

def _asStr(value):
    """Coerce a fact field to a lowercase string; None/non-str -> ''."""
    if isinstance(value, str):
        return value.lower()
    return ""


def _asList(value):
    """Coerce a fact field to a list; anything else -> []."""
    if isinstance(value, list):
        return value
    return []


def _vote(scores, signals, classification, weight, signalText):
    """Record one signal: accumulate its weight under classification and
    append the human-readable audit string. Unknown class names are dropped
    with a warning so a table typo cannot poison the result."""
    if classification not in CLASSIFICATIONS:
        log.warning("deterministic: vote for unknown class %r ignored", classification)
        return
    scores.setdefault(classification, []).append(float(weight))
    signals.append(signalText)


def _combine(weights):
    """Combine independent signal weights for one class into a confidence.

    Uses noisy-OR (1 - prod(1 - w)): each additional agreeing signal raises
    confidence with diminishing returns, and the result stays strictly < 1
    unless a signal is itself certain. Deterministic and order-independent.
    """
    remaining = 1.0
    for w in weights:
        # Clamp defensively so a bad table weight can't push us out of [0,1].
        w = min(max(w, 0.0), 0.99)
        remaining *= (1.0 - w)
    return 1.0 - remaining


# ---------------------------------------------------------------------------
# Signal families
# ---------------------------------------------------------------------------

def _scoreVendor(facts, scores, signals):
    """OUI vendor substring hints."""
    vendor = _asStr(facts.get("vendor"))
    if not vendor:
        return
    for needle, votes in VENDOR_HINTS:
        if needle in vendor:
            for cls, w in votes:
                _vote(scores, signals, cls, w,
                      "vendor '%s' matched '%s' -> %s" % (facts.get("vendor"), needle, cls))
            # First (most specific by table order) match wins; stop so
            # "hewlett packard" doesn't also fire a hypothetical "packard".
            break


def _scoreSysDescr(facts, scores, signals):
    """SNMP sysDescr / sysObjectID substring hints. Multiple sysDescr hints
    may fire (e.g. 'cisco ios' + 'catalyst') — that agreement is the point."""
    sysDescr = _asStr(facts.get("sysDescr"))
    if sysDescr:
        for needle, votes in SYS_HINTS:
            if needle in sysDescr:
                for cls, w in votes:
                    _vote(scores, signals, cls, w,
                          "sysDescr contains '%s' -> %s" % (needle, cls))
    sysObjectId = _asStr(facts.get("sysObjectId"))
    if sysObjectId:
        # Normalize a possibly missing leading dot for prefix matching.
        if not sysObjectId.startswith("."):
            sysObjectId = "." + sysObjectId
        for prefix, votes in SYS_OBJECT_ID_HINTS:
            if sysObjectId.startswith(prefix):
                for cls, w in votes:
                    _vote(scores, signals, cls, w,
                          "sysObjectID under %s -> %s" % (prefix, cls))
                break  # enterprise arcs are disjoint; one prefix suffices


def _scoreServices(facts, scores, signals):
    """Open-port fingerprints (const.PORT_FINGERPRINTS) plus nmap service-name
    hints. Each distinct port votes once; duplicate rows are deduped."""
    seenPorts = set()
    seenNames = set()
    for svc in _asList(facts.get("services")):
        if not isinstance(svc, dict):
            continue
        port = svc.get("port")
        if isinstance(port, int) and port not in seenPorts:
            seenPorts.add(port)
            bucket = PORT_FINGERPRINTS.get(port)
            if bucket is not None:
                for cls, w in FINGERPRINT_VOTES.get(bucket, ()):
                    _vote(scores, signals, cls, w,
                          "open port %d (%s) -> %s" % (port, bucket, cls))
        # Service/product names catch nonstandard ports (RTSP on 8554 etc.).
        nameBlob = "%s %s" % (_asStr(svc.get("service")), _asStr(svc.get("product")))
        for needle, votes in SERVICE_NAME_VOTES:
            if needle in nameBlob and needle not in seenNames:
                seenNames.add(needle)
                for cls, w in votes:
                    _vote(scores, signals, cls, w,
                          "service '%s' on port %s -> %s" % (needle, port, cls))


def _scoreTopology(facts, scores, signals):
    """Interface-count and LLDP-neighbor evidence.

    A device exposing many ifTable rows and holding an LLDP remote table is
    almost always network infrastructure: only bridges/routers populate
    LLDP-MIB remote entries at scale. remoteCaps strings, when present on this
    device's own record (orchestrator merges the caps a neighbor advertised
    *about* us onto the device), are used directly.
    """
    ports = _asList(facts.get("ports"))
    neighbors = _asList(facts.get("neighbors"))
    portCount = len(ports)
    neighborCount = len(neighbors)

    if portCount >= 8 and neighborCount >= 1:
        _vote(scores, signals, "switch", 0.45,
              "%d ifTable ports + %d LLDP neighbors -> switch" % (portCount, neighborCount))
    elif portCount >= 8:
        _vote(scores, signals, "switch", 0.25,
              "%d ifTable ports -> switch-ish" % portCount)
    elif neighborCount >= 2:
        # Few interfaces but multiple LLDP adjacencies: routed box.
        _vote(scores, signals, "router", 0.25,
              "%d LLDP neighbors on few ports -> router-ish" % neighborCount)

    # Capabilities the device itself advertises (if the orchestrator attached
    # them, e.g. facts["neighbors"][n]["localCaps"] merged upward, or a top
    # level "remoteCaps" reflected from a peer's view of this device).
    selfCaps = _asStr(facts.get("remoteCaps"))
    if selfCaps:
        for needle, votes in LLDP_CAP_VOTES:
            if needle in selfCaps:
                for cls, w in votes:
                    _vote(scores, signals, cls, w,
                          "LLDP capabilities contain '%s' -> %s" % (needle, cls))


def _scoreOsGuess(facts, scores, signals):
    """nmap OS guess: weak corroboration only (nmap -O is often wrong)."""
    osGuess = _asStr(facts.get("osGuess"))
    if not osGuess:
        return
    osHints = (
        ("ios", (("switch", 0.20), ("router", 0.20))),
        ("junos", (("router", 0.25),)),
        ("routeros", (("router", 0.25),)),
        ("windows server", (("server", 0.30),)),
        ("windows", (("host", 0.20),)),
        ("linux", (("host", 0.10), ("server", 0.10))),
        ("embedded", (("iot", 0.15),)),
        ("freebsd", (("firewall", 0.10), ("server", 0.10))),  # pfSense-adjacent
        ("printer", (("printer", 0.35),)),
        ("camera", (("camera", 0.35),)),
    )
    for needle, votes in osHints:
        if needle in osGuess:
            for cls, w in votes:
                _vote(scores, signals, cls, w,
                      "osGuess contains '%s' -> %s" % (needle, cls))
            break  # one OS family per guess; avoid 'windows'+'windows server' double-fire


# ---------------------------------------------------------------------------
# Role derivation
# ---------------------------------------------------------------------------

def _deriveRole(classification, facts):
    """Short role hint for the winning classification, else None.

    - switch: "core" when heavily meshed (many LLDP adjacencies), else "access"
    - router/firewall: "edge"
    - ap: "access"
    - server/nas: "endpoint" (rack endpoint from a cabling standpoint)
    - host/printer/camera/voip/iot: "endpoint"
    - pdu/ups/appliance/unknown: no useful hint
    """
    neighborCount = len(_asList(facts.get("neighbors")))
    if classification == "switch":
        return "core" if neighborCount >= 4 else "access"
    if classification in ("router", "firewall"):
        return "edge"
    if classification == "ap":
        return "access"
    if classification in ("server", "nas", "host", "printer", "camera", "voip", "iot"):
        return "endpoint"
    return None


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def classify(facts):
    """Classify a device from gathered facts. Deterministic and total.

    Args:
        facts: dict per orchestrator.deviceFacts (see module docstring).
               Anything non-dict is treated as an empty fact set.

    Returns:
        {"classification": str, "role": str|None,
         "confidence": float, "signals": [str]}
    """
    if not isinstance(facts, dict):
        log.warning("deterministic.classify: non-dict facts (%s); returning unknown",
                    type(facts).__name__)
        facts = {}

    scores = {}    # classification -> [weight, ...]
    signals = []   # audit trail, in evaluation order (stable)

    # Each family is independent evidence; evaluation order is fixed so the
    # signals list (and any tie-break below) is reproducible.
    _scoreVendor(facts, scores, signals)
    _scoreSysDescr(facts, scores, signals)
    _scoreServices(facts, scores, signals)
    _scoreTopology(facts, scores, signals)
    _scoreOsGuess(facts, scores, signals)

    if not scores:
        return {"classification": "unknown", "role": None,
                "confidence": 0.0, "signals": ["no signals fired"]}

    # Combine per-class, then pick the winner. Ties break on the fixed
    # CLASSIFICATIONS order so the result never depends on dict ordering.
    combined = {cls: _combine(ws) for cls, ws in scores.items()}
    best = max(combined, key=lambda cls: (combined[cls], -CLASSIFICATIONS.index(cls)))
    confidence = combined[best]

    # Contested calls deserve less confidence: if the runner-up is close, the
    # evidence disagrees and a human (or Claude) should look. Scale down by
    # the margin instead of pretending the noisy-OR total settled it.
    others = [v for cls, v in combined.items() if cls != best]
    if others:
        runnerUp = max(others)
        if runnerUp > 0.0 and confidence > 0.0:
            margin = (confidence - runnerUp) / confidence   # 0 (dead heat) .. 1
            # Blend: never cut below 55% of the raw score, full score at margin 1.
            confidence *= 0.55 + 0.45 * margin
            if margin < 0.34:
                signals.append("contested: runner-up %.2f vs winner %.2f, confidence reduced"
                               % (runnerUp, combined[best]))

    confidence = round(min(max(confidence, 0.0), 1.0), 3)

    return {
        "classification": best,
        "role": _deriveRole(best, facts),
        "confidence": confidence,
        "signals": signals,
    }
