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
        ("POST", r(r"/api/discovery/devices/(?P<id>\d+)/reject"), rejectDevice),
        ("POST", r(r"/api/discovery/plan/build"), buildPlan),
        ("GET", r(r"/api/discovery/topology"), topology),
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


# -- helpers --------------------------------------------------------------

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
