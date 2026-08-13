"""
routes.py — HTTP handlers and the route table.

Purpose: translate validated requests into store/orchestrator/inference calls
and shape JSON responses. Input: (ctx, regexMatch, body) per handler. Output:
(status, payload). buildRoutes() returns the (method, pattern, handler) table
consumed by wsgi.App.

Handlers stay thin: validation + delegation. Scanning, inference, and mapping
live in the scan/ and infer/ packages.
"""

import ipaddress
import re
import threading

from .. import const
from ..util import nowIso, subnetAllowed
from ..scan import orchestrator
from ..infer import deterministic, claude as claudeInfer, mapper


# Scan runs execute off-thread so the POST returns immediately with a runId.
# A module-level registry lets a cancel request signal an in-flight run.
_runThreads = {}
_runCancels = {}


def buildRoutes():
    """Compile the route table once at startup. Output: list of tuples."""
    r = lambda p: re.compile("^" + p + "$")
    return [
        ("GET", r(r"/api/discovery/health"), health),
        ("POST", r(r"/api/discovery/scan"), startScan),
        ("GET", r(r"/api/discovery/scans"), listScans),
        ("GET", r(r"/api/discovery/scan/(?P<id>\d+)"), getScan),
        ("POST", r(r"/api/discovery/scan/(?P<id>\d+)/cancel"), cancelScan),
        ("GET", r(r"/api/discovery/devices"), listDevices),
        ("GET", r(r"/api/discovery/devices/(?P<id>\d+)"), getDevice),
        ("POST", r(r"/api/discovery/devices/(?P<id>\d+)/infer"), inferDevice),
        ("POST", r(r"/api/discovery/devices/(?P<id>\d+)/confirm"), confirmDevice),
        ("POST", r(r"/api/discovery/devices/(?P<id>\d+)/associate"), associateDevice),
        ("POST", r(r"/api/discovery/devices/(?P<id>\d+)/reject"), rejectDevice),
        ("POST", r(r"/api/discovery/plan/build"), buildPlan),
        ("GET", r(r"/api/discovery/topology"), topology),
        ("GET", r(r"/api/discovery/devices/(?P<id>\d+)/candidate"), deviceCandidate),
        ("GET", r(r"/api/discovery/library"), listLibrary),
        ("POST", r(r"/api/discovery/library"), commitLibraryModel),
    ]


# -- handlers -------------------------------------------------------------

def health(ctx, match, body):
    """Liveness + tool/inference availability, and a fresh CSRF token."""
    cfg = ctx["config"]
    payload = {
        "status": "ok",
        "version": _version(),
        "tools": orchestrator.toolAvailability(),
        "claudeEnabled": cfg.claudeEnabled,
        "csrf": ctx["app"].issueCsrf(),
    }
    return 200, payload


def startScan(ctx, match, body):
    """
    Start a scan run. Body: {subnet?, options?}. subnet must be within the
    operator-authorized ranges (config.allowedSubnets); an omitted subnet uses
    the host-local default derived by the orchestrator.
    """
    cfg = ctx["config"]
    store = ctx["store"]
    subnet = (body or {}).get("subnet")
    options = (body or {}).get("options", {})

    if subnet is None:
        subnet = orchestrator.defaultSubnet()
        if not subnet:
            return 400, {"error": "no_subnet",
                         "detail": "could not derive a local subnet; specify one"}

    # Authorization gate applies to EVERY target, including the auto-derived
    # host-local subnet: the host's own network is only scannable if the
    # operator listed it in RACKWIRE_ALLOWED_SUBNETS. Absence is not consent.
    if not subnetAllowed(subnet, cfg.allowedSubnets):
        return 403, {"error": "subnet_forbidden",
                     "detail": f"{subnet} is outside authorized ranges"}

    # Size guard: reject an oversized CIDR before any probe runs so an
    # accidental /8 cannot spawn a runaway sweep.
    tooBig = _subnetTooBig(subnet)
    if tooBig:
        return 400, {"error": "subnet_too_large", "detail": tooBig}

    initiatedBy = _identity(ctx)
    runId = store.createScanRun(nowIso(), subnet, initiatedBy, options)

    cancelFlag = threading.Event()
    _runCancels[runId] = cancelFlag
    t = threading.Thread(
        target=_runScanJob,
        args=(ctx, runId, subnet, options, cancelFlag),
        name=f"scan-{runId}",
        daemon=True,
    )
    _runThreads[runId] = t
    t.start()
    return 201, {"runId": runId, "subnet": subnet, "status": "running"}


def _runScanJob(ctx, runId, subnet, options, cancelFlag):
    """Background scan worker. Persists results, then classifies each device."""
    cfg = ctx["config"]
    store = ctx["store"]
    try:
        orchestrator.runScan(
            subnet=subnet,
            options=options,
            config=cfg,
            store=store,
            cancelFlag=cancelFlag,
            runId=runId,
        )
        # Deterministic classification pass, scoped to just the devices THIS
        # run observed (last_run_id == runId) — a re-scan of one subnet must
        # not reclassify unrelated devices from earlier runs. Each pass records
        # an inference audit row so the console can show what fired and when.
        for dev in store.listDevices(runId=runId):
            facts = orchestrator.deviceFacts(store, dev["id"])
            result = deterministic.classify(facts)
            store.recordInference(dev["id"], "deterministic", None, facts,
                                  result, nowIso())
            store.setDeviceClassification(
                dev["id"], result["classification"], result.get("role"),
                result.get("confidence"), "deterministic",
            )
        status = "cancelled" if cancelFlag.is_set() else "done"
        store.finishScanRun(runId, nowIso(), status)
    except Exception as exc:  # noqa: BLE001 — record failure, never crash worker
        store.finishScanRun(runId, nowIso(), "error", error=str(exc))
    finally:
        _runCancels.pop(runId, None)
        _runThreads.pop(runId, None)


def listScans(ctx, match, body):
    return 200, {"scans": ctx["store"].listScanRuns()}


def getScan(ctx, match, body):
    run = ctx["store"].getScanRun(int(match.group("id")))
    if not run:
        return 404, {"error": "not_found", "detail": "scan run"}
    return 200, {"scan": run}


def cancelScan(ctx, match, body):
    runId = int(match.group("id"))
    flag = _runCancels.get(runId)
    if not flag:
        return 404, {"error": "not_found", "detail": "no running scan"}
    flag.set()
    return 200, {"runId": runId, "status": "cancelling"}


def listDevices(ctx, match, body):
    environ = ctx["environ"]
    qs = _query(environ)
    runId = None
    if qs.get("run"):
        try:
            runId = int(qs["run"])
        except ValueError:
            return 400, {"error": "bad_run", "detail": "run must be an integer"}
    return 200, {"devices": ctx["store"].listDevices(
        status=qs.get("status"), runId=runId)}


def getDevice(ctx, match, body):
    store = ctx["store"]
    deviceId = int(match.group("id"))
    dev = store.getDevice(deviceId)
    if not dev:
        return 404, {"error": "not_found", "detail": "device"}
    dev["ports"] = store.getPorts(deviceId)
    dev["services"] = store.getServices(deviceId)
    dev["neighbors"] = store.getNeighbors(deviceId)
    dev["inferences"] = store.getInferences(deviceId)
    association = store.getDeviceAssociation(deviceId)
    dev["association"] = association
    dev["libraryId"] = association["library_id"] if association else None
    return 200, {"device": dev}


def inferDevice(ctx, match, body):
    """
    Run/refresh inference for one device. Body: {useClaude?}. Deterministic runs
    always; Claude runs when requested AND enabled, or when deterministic
    confidence is below threshold and Claude is enabled. Result is stored and
    returned but does NOT change device status — a human still confirms.
    """
    cfg = ctx["config"]
    store = ctx["store"]
    deviceId = int(match.group("id"))
    dev = store.getDevice(deviceId)
    if not dev:
        return 404, {"error": "not_found", "detail": "device"}

    facts = orchestrator.deviceFacts(store, deviceId)
    detResult = deterministic.classify(facts)
    store.recordInference(deviceId, "deterministic", None, facts, detResult,
                          nowIso())
    store.setDeviceClassification(
        deviceId, detResult["classification"], detResult.get("role"),
        detResult.get("confidence"), "deterministic",
    )

    claudeResult = None
    wantClaude = bool((body or {}).get("useClaude"))
    lowConfidence = (detResult.get("confidence") or 0) < const.CONFIDENCE_THRESHOLD
    if cfg.claudeEnabled and (wantClaude or lowConfidence):
        claudeResult = claudeInfer.infer(facts, cfg)
        if claudeResult is not None:
            store.recordInference(deviceId, "claude", cfg.claudeModel, facts,
                                  claudeResult, nowIso())

    return 200, {"deterministic": detResult, "claude": claudeResult}


def confirmDevice(ctx, match, body):
    """
    Human accepts a device's classification AND the hardware specs that will
    reach the plan. Body (all optional):
      classification, role      — override the inferred class/role (source=manual)
      gbps, watts, amps, ports, poe — explicit confirmed specs (override wins)
      acceptInferenceId         — the specific inference row being accepted;
                                  default is the latest Claude inference.

    Confirming is the human-in-the-loop gate: any spec the operator does not
    set explicitly is adopted from the inference they are confirming, that
    inference row is marked accepted (audit), and the values are written to the
    device's confirmed_* columns so mapper.toGroup carries them into the plan.
    Only after this is the device eligible for import.
    """
    store = ctx["store"]
    deviceId = int(match.group("id"))
    dev = store.getDevice(deviceId)
    if not dev:
        return 404, {"error": "not_found", "detail": "device"}
    override = body or {}

    if override.get("classification") or override.get("role"):
        store.setDeviceClassification(
            deviceId,
            override.get("classification", dev["classification"]),
            override.get("role", dev["role"]),
            dev["confidence"],
            "manual",
        )

    # Explicit operator-entered specs take precedence; a present-but-None value
    # is ignored (nothing to confirm), a present False poe is honoured.
    specs = {}
    for key in ("gbps", "watts", "amps", "ports", "poe"):
        if key in override and override[key] is not None:
            specs[key] = override[key]

    # Pick the inference the operator is accepting: an explicit id if given,
    # else the most recent Claude inference (the one that carries spec guesses).
    inferenceRow = None
    acceptId = override.get("acceptInferenceId")
    if acceptId is not None:
        for row in store.getInferences(deviceId):
            if row["id"] == acceptId:
                inferenceRow = row
                break
    else:
        inferenceRow = store.getLatestInference(deviceId, engine="claude")

    if inferenceRow is not None:
        inferred = _loadJson(inferenceRow.get("output_json"))
        # Fill only the specs the operator did not set by hand. portsGuess maps
        # onto the confirmed physical-port count.
        adopt = {
            "gbps": inferred.get("gbps"),
            "watts": inferred.get("watts"),
            "amps": inferred.get("amps"),
            "ports": inferred.get("portsGuess"),
            "poe": inferred.get("poe"),
        }
        for key, value in adopt.items():
            if key not in specs and value is not None:
                specs[key] = value
        store.acceptInference(inferenceRow["id"], _identity(ctx), nowIso())

    if specs:
        store.setDeviceConfirmedSpecs(deviceId, specs)

    store.setDeviceStatus(deviceId, const.STATUS_CONFIRMED)
    return 200, {"deviceId": deviceId, "status": const.STATUS_CONFIRMED,
                 "confirmedSpecs": specs}


def rejectDevice(ctx, match, body):
    store = ctx["store"]
    deviceId = int(match.group("id"))
    if not store.getDevice(deviceId):
        return 404, {"error": "not_found", "detail": "device"}
    store.setDeviceStatus(deviceId, const.STATUS_REJECTED)
    return 200, {"deviceId": deviceId, "status": const.STATUS_REJECTED}


def associateDevice(ctx, match, body):
    """Persist the library definition chosen for a discovered device.

    Association is the terminal step of planner placement: it records the
    selected library id with provenance and advances the queue row to imported.
    The library id may name either a built-in client definition or a
    server-backed discovery definition, so existence is deliberately not
    constrained to the server's library table.
    """
    store = ctx["store"]
    deviceId = int(match.group("id"))
    if not store.getDevice(deviceId):
        return 404, {"error": "not_found", "detail": "device"}
    libraryId = _cleanLibraryId((body or {}).get("libraryId"))
    if libraryId is None:
        return 400, {"error": "invalid_library_id",
                     "detail": "libraryId must be a valid planner model id"}
    association = store.associateDevice(
        deviceId, libraryId, nowIso(), _identity(ctx),
    )
    return 200, {"deviceId": deviceId, "libraryId": libraryId,
                 "status": const.STATUS_IMPORTED,
                 "association": association}


def buildPlan(ctx, match, body):
    """
    Build a planner payload from confirmed devices. Body: {deviceIds?} (default:
    all confirmed). Returns {groups, links} shaped for the RackWire host API;
    the console pushes it into the planner iframe. Marks devices imported.
    """
    store = ctx["store"]
    ids = (body or {}).get("deviceIds")
    confirmed = store.listDevices(status=const.STATUS_CONFIRMED)
    if ids:
        idSet = set(int(i) for i in ids)
        confirmed = [d for d in confirmed if d["id"] in idSet]

    groups = []
    for dev in confirmed:
        facts = orchestrator.deviceFacts(store, dev["id"])
        group = mapper.toGroup(dev, facts)
        groups.append(group)
        store.recordImport(dev["id"], group, nowIso())
        store.setDeviceStatus(dev["id"], const.STATUS_IMPORTED)

    links = mapper.linksFrom(store.allNeighbors(), confirmed)
    return 200, {"groups": groups, "links": links}


def topology(ctx, match, body):
    """Nodes + edges from LLDP neighbor data, for the console's topology view."""
    store = ctx["store"]
    devices = store.listDevices()
    nodes = [
        {"id": d["id"], "ip": d["ip"], "name": d["hostname"] or d["ip"],
         "classification": d["classification"]}
        for d in devices
    ]
    edges = mapper.linksFrom(store.allNeighbors(), devices)
    return 200, {"nodes": nodes, "edges": edges}


def deviceCandidate(ctx, match, body):
    """Recommend a gear-library model for one discovered device.

    Combines the observed facts with the most recent inference (Claude's
    make/model recommendation when enabled; deterministic otherwise) into a
    candidate window.RW.DEVICES entry the operator validates in the planner.
    Also reports whether an equivalent model already exists in the RackWire
    library, so the panel can offer "associate existing" instead of a duplicate.

    Output: {candidate, recommendation, match}. `candidate` is the pre-filled
    library model; `recommendation` is the raw guess + provenance for the UI
    badge; `match` is an existing library id (or null).
    """
    store = ctx["store"]
    deviceId = int(match.group("id"))
    dev = store.getDevice(deviceId)
    if not dev:
        return 404, {"error": "not_found", "detail": "device"}

    facts = orchestrator.deviceFacts(store, deviceId)

    # Selection runs a fresh deterministic inference and, when available, a
    # fresh Claude inference. The newest row is therefore the correct result:
    # Claude when that call succeeded, deterministic when it failed. Preferring
    # any historical Claude row here would resurrect stale recommendations.
    inferenceRow = store.getLatestInference(deviceId)
    inference = _loadJson(inferenceRow.get("output_json")) if inferenceRow else {}
    engine = inferenceRow.get("engine") if inferenceRow else "none"

    candidate = mapper.toLibraryModel(dev, facts, inference)

    # Match against the already-committed library: same id (vendor+model slug)
    # is the strongest signal an equivalent model is on file.
    match_ = None
    if store.getLibraryModel(candidate["id"]):
        match_ = candidate["id"]

    recommendation = {
        "vendorGuess": inference.get("vendorGuess") or dev.get("vendor"),
        "modelGuess": inference.get("modelGuess") or dev.get("hostname"),
        "nameGuess": inference.get("nameGuess"),
        "classification": dev.get("classification"),
        "confidence": inference.get("confidence") if inference else dev.get("confidence"),
        "rationale": inference.get("rationale"),
        "source": engine,
        "ip": dev.get("ip"),
        "mac": dev.get("mac"),
    }
    return 200, {"candidate": candidate, "recommendation": recommendation,
                 "match": match_}


def listLibrary(ctx, match, body):
    """All RackWire gear-library models, in window.RW.DEVICES shape. The planner
    merges these into its built-in catalog at load so discovered gear is
    placeable across projects."""
    return 200, {"library": ctx["store"].listLibrary()}


def commitLibraryModel(ctx, match, body):
    """Commit a validated gear-library model (the human-in-the-loop gate).

    Body: a planner device-def dict (name, vendor, model, kind, ru, drawW,
    poeBudgetW, note, groups[]) plus optional deviceId provenance. Every field
    is sanitized here and any client id is ignored — this is a mutation endpoint
    reachable by any same-origin client, so nothing from the body is trusted
    verbatim. Returns the stored model in canonical shape.
    """
    store = ctx["store"]
    try:
        model = _sanitizeLibraryModel(body or {})
    except ValueError as exc:
        return 400, {"error": "invalid_model", "detail": str(exc)}
    if model is None:
        return 400, {"error": "invalid_model",
                     "detail": "a name and at least one group are required"}
    deviceId = None
    rawDeviceId = (body or {}).get("deviceId")
    if rawDeviceId is not None:
        try:
            deviceId = int(rawDeviceId)
        except (TypeError, ValueError):
            deviceId = None
    existing = store.getLibraryModel(model["id"])
    if existing and not _sameLibraryIdentity(existing, model):
        return 409, {"error": "library_id_collision",
                     "detail": "vendor/model resolves to an existing different model"}
    modelId = store.upsertLibraryModel(model, nowIso(), deviceId=deviceId)
    return 200, {"model": store.getLibraryModel(modelId)}


# -- helpers --------------------------------------------------------------

# The device-def fields a client may set on a committed library model. Anything
# outside this set is dropped — a mutation endpoint never trusts the body shape.
_LIB_STR_FIELDS = ("name", "vendor", "model", "kind", "note")
_LIB_NUM_FIELDS = ("ru", "drawW", "poeBudgetW", "budgetW", "circuitA", "circuitV")
# The whitelisted keys of a single port group, with their coercion kind.
_GROUP_STR_KEYS = ("k", "label", "glyph", "role", "domain", "conn", "poe")
_GROUP_NUM_KEYS = ("count", "rows", "gbps", "watts", "amps", "volts", "poeW",
                   "poeDrawW")
_GROUP_BOOL_KEYS = ("batt",)

_MODEL_NUM_LIMITS = {
    "ru": (0, 100), "drawW": (0, 1_000_000),
    "poeBudgetW": (0, 1_000_000), "budgetW": (0, 1_000_000),
    "circuitA": (0, 10_000), "circuitV": (0, 10_000),
}
_GROUP_NUM_LIMITS = {
    "count": (1, 512), "gbps": (0, 1_600),
    "watts": (0, 1_000_000), "amps": (0, 10_000),
    "volts": (0, 10_000), "poeW": (0, 1_000_000),
    "poeDrawW": (0, 1_000_000),
}
_MAX_GROUPS = 64


def _sanitizeLibraryModel(body):
    """Coerce an untrusted body into a safe library model, or None if invalid.

    Enforces the whitelist above, derives a key-safe id from vendor+model, and
    requires a name plus at least one sanitized group (a model with no ports
    cannot be placed meaningfully).
    """
    import re
    name = _cleanText(body.get("name"))
    rawGroups = _asList(body.get("groups"))
    if len(rawGroups) > _MAX_GROUPS:
        raise ValueError(f"groups may contain at most {_MAX_GROUPS} entries")
    groups = [g for g in (_sanitizeGroup(x) for x in rawGroups) if g is not None]
    if not name or not groups:
        return None

    model = {"name": name, "groups": groups, "source": "discovery"}
    for key in _LIB_STR_FIELDS:
        if key == "name":
            continue
        val = _cleanText(body.get(key))
        if val is not None:
            model[key] = val
    for key in _LIB_NUM_FIELDS:
        val = _boundedNum(body.get(key), key, *_MODEL_NUM_LIMITS[key])
        if val is not None:
            model[key] = val
    if isinstance(body.get("isBattery"), bool):
        model["isBattery"] = body["isBattery"]

    # The server owns identity: edited vendor/model determine the id. Ignoring
    # a candidate's stale client id prevents the operator from changing fields
    # while accidentally overwriting the originally suggested model.
    basis = " ".join(p for p in (model.get("vendor"), model.get("model"))
                     if p).strip() or name
    slug = re.sub(r"[^a-z0-9]+", "-", basis.lower()).strip("-")
    slug = slug or "model"
    model["id"] = slug if slug.startswith("disc-") else "disc-" + slug
    return model


def _sanitizeGroup(raw):
    """Whitelist-coerce one port group. Output: dict or None (dropped)."""
    if not isinstance(raw, dict):
        return None
    group = {}
    for key in _GROUP_STR_KEYS:
        val = _cleanText(raw.get(key))
        if val is not None:
            group[key] = val
    for key in _GROUP_NUM_KEYS:
        if key == "rows":
            continue
        val = _boundedNum(raw.get(key), key, *_GROUP_NUM_LIMITS[key])
        if val is not None:
            group[key] = val
    for key in _GROUP_BOOL_KEYS:
        if isinstance(raw.get(key), bool):
            group[key] = raw[key]
    # A group must at least name itself and carry a count to render.
    if "count" not in group:
        group["count"] = 1
    rows = _boundedNum(raw.get("rows"), "rows", 1, group["count"])
    if rows is not None:
        group["rows"] = rows
    return group if group.get("label") or group.get("k") else None


def _boundedNum(value, field, minimum, maximum):
    """Parse an optional finite number and reject values outside a field's
    rendering-safe domain. count, rows, and ru must be whole numbers."""
    num = _num(value)
    if num is None:
        if value is None:
            return None
        raise ValueError(f"{field} must be a finite number")
    if num < minimum or num > maximum:
        raise ValueError(f"{field} must be between {minimum} and {maximum}")
    if field in ("count", "rows", "ru") and num != int(num):
        raise ValueError(f"{field} must be a whole number")
    return int(num) if field in ("count", "rows", "ru") else num


def _sameLibraryIdentity(left, right):
    """True when a derived-id collision refers to the same vendor/model."""
    fields = ("vendor", "model") if (left.get("vendor") or right.get("vendor")
                                      or left.get("model") or right.get("model")) else ("name",)
    return all((left.get(k) or "").strip().casefold()
               == (right.get(k) or "").strip().casefold() for k in fields)


def _cleanLibraryId(value):
    """Validate a planner definition id without changing its identity."""
    if not isinstance(value, str):
        return None
    value = value.strip()
    if not value or len(value) > 120:
        return None
    return value if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]*", value) else None


def _asList(value):
    return value if isinstance(value, list) else []


def _cleanText(value, limit=200):
    """Trim a string field; None for empties/non-strings. Bounds length so a
    hostile body cannot store an unbounded blob."""
    if not isinstance(value, str):
        return None
    text = value.strip()
    if not text:
        return None
    return text if len(text) <= limit else text[:limit].rstrip()


def _num(value):
    """Parse a finite, non-negative number; None otherwise. Rejects bools."""
    import math
    if value is None or isinstance(value, bool):
        return None
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(num) or num < 0:
        return None
    return int(num) if num == int(num) else num


def _subnetTooBig(subnet):
    """Return a human message if `subnet` enumerates more than the allowed host
    count, else None. A bare host or malformed value passes (treated as one
    address by the caller's later validation)."""
    try:
        net = ipaddress.ip_network(subnet, strict=False)
    except ValueError:
        return None  # not a CIDR; liveness/allow-list handle the malformed case
    if net.num_addresses > const.MAX_SCAN_HOSTS:
        return (f"{subnet} enumerates {net.num_addresses} addresses; the limit "
                f"is {const.MAX_SCAN_HOSTS}. Scan a smaller range.")
    return None


def _loadJson(text):
    """Parse a stored JSON string into a dict; {} on empty/invalid input."""
    import json
    if not text:
        return {}
    try:
        obj = json.loads(text)
    except (ValueError, TypeError):
        return {}
    return obj if isinstance(obj, dict) else {}


def _version():
    from .. import __version__
    return __version__


def _identity(ctx):
    """Operator identity for provenance. Same-origin session on xenon; a fuller
    auth model is the hardening backlog item. REMOTE_USER when Apache sets it."""
    return ctx["environ"].get("REMOTE_USER") or "operator"


def _query(environ):
    """Parse the query string into a flat dict. Output: {k: v}."""
    from urllib.parse import parse_qs
    raw = environ.get("QUERY_STRING", "")
    return {k: v[0] for k, v in parse_qs(raw).items()}
