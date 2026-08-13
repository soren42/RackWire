"""
test_discovery.py — offline unit tests for the pure pieces of RackWire Discovery.

Purpose: exercise store.py (SQLite DAL), scan/oui.py, infer/deterministic.py,
infer/mapper.py, util.py, and infer/claude.py WITHOUT any live network, any
real subprocess, or any external service. Input: nothing (fixtures are inline).
Output: pytest pass/fail.

Run with:  cd backend && python3 -m pytest -q

Self-contained by design: no conftest.py required. `python3 -m pytest` puts the
cwd (backend/) on sys.path, which makes `rackwire_discovery` importable; the
sys.path insert below keeps the file runnable from other cwds too.
"""

import inspect
import io
import json
import os
import re
import sys

import pytest

# Defensive: make backend/ importable even when pytest is invoked from a
# different working directory than backend/.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rackwire_discovery import util
from rackwire_discovery.config import Config
from rackwire_discovery.infer import claude, deterministic, mapper
from rackwire_discovery.scan import oui, orchestrator, snmp
from rackwire_discovery.store import Store


# ---------------------------------------------------------------------------
# Fixtures (plain, conftest-free)
# ---------------------------------------------------------------------------

@pytest.fixture()
def store():
    """Fresh in-memory Store per test — no filesystem, no shared state."""
    s = Store(dbPath=":memory:")
    yield s
    s.close()


NOW1 = "2026-08-12T10:00:00+00:00"
NOW2 = "2026-08-12T11:00:00+00:00"

# A switch-like observed-fact bundle: SNMP self-description + many interfaces
# + LLDP adjacency all agree. Deterministic classify should be confident.
SWITCH_FACTS = {
    "ip": "10.0.0.2",
    "mac": "00:1B:0D:11:22:33",
    "vendor": "Cisco Systems",
    "sysDescr": "Cisco IOS Software, Catalyst 2960X Software",
    "sysObjectId": ".1.3.6.1.4.1.9.1.1208",
    "snmpOk": True,
    "ports": [{"ifIndex": i, "ifName": "Gi1/0/%d" % i} for i in range(1, 25)],
    "neighbors": [
        {"localPort": "Gi1/0/1", "remoteSysName": "core-sw"},
        {"localPort": "Gi1/0/2", "remoteSysName": "ap-attic"},
    ],
}


# ---------------------------------------------------------------------------
# store.py
# ---------------------------------------------------------------------------

def test_storeSchemaCreates(store):
    """Idempotent schema: every contract table exists after construction."""
    # Tests may peek at the private connection to verify DDL — production
    # code never does (store.py is the sole SQL speaker per the contract).
    tables = {
        row["name"]
        for row in store._query(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )
    }
    for expected in ("scan_run", "device", "port", "open_service",
                     "neighbor", "inference", "import_map"):
        assert expected in tables, "missing table %s" % expected


def test_storeScanRunLifecycle(store):
    """createScanRun -> running; finishScanRun -> done with timestamps."""
    runId = store.createScanRun(NOW1, "10.0.0.0/24", "jason", {"topPorts": 100})
    run = store.getScanRun(runId)
    assert run["status"] == "running"
    assert run["subnet"] == "10.0.0.0/24"
    store.finishScanRun(runId, NOW2, "done")
    run = store.getScanRun(runId)
    assert run["status"] == "done"
    assert run["finished_at"] == NOW2


def test_upsertDeviceIdempotent(store):
    """Same MAC re-scanned -> same row id, first_seen kept, last_seen advances."""
    facts = {"mac": "00:1B:0D:11:22:33", "ip": "10.0.0.2", "hostname": "sw1"}
    idA = store.upsertDevice(NOW1, facts)
    idB = store.upsertDevice(NOW2, facts)
    assert idA == idB, "re-scan of the same MAC must not create a new device"
    dev = store.getDevice(idA)
    assert dev["first_seen"] == NOW1, "first_seen must be preserved"
    assert dev["last_seen"] == NOW2, "last_seen must advance"
    assert len(store.listDevices()) == 1


def test_upsertDeviceAdditiveRescanPreservesSnmpOk(store):
    """A later SNMP-blind scan must not erase snmp_ok or known identity.

    snmp_ok only ratchets up; None-valued fields in a later scan leave the
    previously observed values in place (additive update contract).
    """
    devId = store.upsertDevice(NOW1, {
        "mac": "00:1B:0D:11:22:33", "ip": "10.0.0.2",
        "hostname": "sw1", "vendor": "Cisco Systems",
        "sysDescr": "Catalyst", "snmpOk": True,
    })
    # Second scan: SNMP unreachable, hostname unresolved — sparse facts.
    store.upsertDevice(NOW2, {"mac": "00:1B:0D:11:22:33", "ip": "10.0.0.9",
                              "snmpOk": False})
    dev = store.getDevice(devId)
    assert dev["snmp_ok"] == 1, "snmp_ok must ratchet, never regress"
    assert dev["hostname"] == "sw1", "unobserved fields must not be erased"
    assert dev["vendor"] == "Cisco Systems"
    assert dev["sys_descr"] == "Catalyst"
    assert dev["ip"] == "10.0.0.9", "newly observed IP should update"


def test_replacePortsServicesNeighbors(store):
    """replace* fully supersedes the prior set (re-scan semantics)."""
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:33"})

    store.replacePorts(devId, [
        {"ifIndex": 1, "ifName": "Gi1/0/1", "speedMbps": 1000, "poe": True},
        {"ifIndex": 2, "ifName": "Gi1/0/2", "speedMbps": 100},
    ])
    ports = store.getPorts(devId)
    assert [p["if_index"] for p in ports] == [1, 2]
    assert ports[0]["if_speed_mbps"] == 1000
    assert ports[0]["poe"] == 1 and ports[1]["poe"] == 0

    # Replacement drops the old rows entirely.
    store.replacePorts(devId, [{"ifIndex": 3, "ifName": "Gi1/0/3"}])
    assert [p["if_index"] for p in store.getPorts(devId)] == [3]

    store.replaceServices(devId, [
        {"port": 22, "service": "ssh"},
        {"port": 443, "service": "https", "product": "nginx"},
    ])
    services = store.getServices(devId)
    assert [s["port"] for s in services] == [22, 443]
    assert services[0]["proto"] == "tcp", "proto defaults to tcp"
    store.replaceServices(devId, [])
    assert store.getServices(devId) == []

    store.replaceNeighbors(devId, [
        {"localPort": "Gi1/0/1", "remoteSysName": "core-sw",
         "remoteChassisId": "AA:BB:CC:00:11:22"},
    ])
    neighbors = store.getNeighbors(devId)
    assert len(neighbors) == 1
    assert neighbors[0]["remote_sys_name"] == "core-sw"
    assert neighbors[0]["source"] == "lldp"


def test_recordInferenceAndImport(store):
    """Inference audit rows and the import map round-trip through the DAL."""
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:33"})
    infId = store.recordInference(
        devId, "deterministic", None,
        {"vendor": "Cisco Systems"},
        {"classification": "switch", "confidence": 0.8},
        NOW1,
    )
    rows = store.getInferences(devId)
    assert len(rows) == 1 and rows[0]["id"] == infId
    assert rows[0]["engine"] == "deterministic"
    assert rows[0]["accepted"] == 0, "inference is advisory until accepted"

    store.acceptInference(infId, "jason", NOW2)
    accepted = store.getInferences(devId)[0]
    assert accepted["accepted"] == 1
    assert accepted["accepted_by"] == "jason"

    importId = store.recordImport(devId, {"k": "dev-sw1", "domain": "net"}, NOW2)
    assert isinstance(importId, int) and importId > 0


# ---------------------------------------------------------------------------
# scan/oui.py
# ---------------------------------------------------------------------------

def test_vendorForKnownPrefix():
    """A known OUI resolves to its vendor across common MAC spellings."""
    assert oui.vendorFor("B8:27:EB:12:34:56") == "Raspberry Pi Foundation"
    assert oui.vendorFor("b8-27-eb-12-34-56") == "Raspberry Pi Foundation"
    assert oui.vendorFor("b827.eb12.3456") == "Raspberry Pi Foundation"
    assert oui.vendorFor("00000c000001") == "Cisco Systems"


def test_vendorForLocallyAdministered():
    """Locally-administered / multicast / malformed MACs carry no vendor."""
    # x2 in the first octet sets the locally-administered bit.
    assert oui.vendorFor("02:00:00:11:22:33") is None
    # Odd first octet = multicast, not a device address.
    assert oui.vendorFor("01:00:5E:00:00:01") is None
    # Malformed inputs never raise, always None.
    assert oui.vendorFor("not-a-mac") is None
    assert oui.vendorFor(None) is None


# ---------------------------------------------------------------------------
# infer/deterministic.py
# ---------------------------------------------------------------------------

def test_classifySwitchBundle():
    """Agreeing vendor + sysDescr + topology facts -> confident 'switch'."""
    result = deterministic.classify(SWITCH_FACTS)
    assert result["classification"] == "switch"
    assert result["confidence"] >= 0.5, (
        "multiple agreeing signals should yield decent confidence, got %r"
        % result["confidence"]
    )
    assert result["role"] in ("core", "access")
    assert result["signals"], "audit trail must record which signals fired"


def test_classifyEmptyBundle():
    """No facts -> 'unknown' at zero confidence, never an exception."""
    result = deterministic.classify({})
    assert result["classification"] == "unknown"
    assert result["confidence"] == 0.0
    assert result["role"] is None


def test_classifyPrinterPort():
    """Open 9100/tcp (JetDirect) is the canonical printer fingerprint."""
    result = deterministic.classify({
        "ip": "10.0.0.42",
        "services": [{"port": 9100, "proto": "tcp", "service": "jetdirect"}],
    })
    assert result["classification"] == "printer"
    assert result["confidence"] > 0.3


# ---------------------------------------------------------------------------
# infer/mapper.py
# ---------------------------------------------------------------------------

def test_toGroupConfirmedSwitch():
    """A confirmed switch maps to a net-domain group with glyph + poe."""
    device = {
        "id": 7,
        "mac": "00:1B:0D:11:22:33",
        "ip": "10.0.0.2",
        "hostname": "sw1.lab.akoria.net",
        "vendor": "Cisco Systems",
        "classification": "switch",
        "role": "access",
        "status": "confirmed",
    }
    facts = {"ports": [
        {"ifName": "Gi1/0/1", "speedMbps": 1000, "poe": True},
        {"ifName": "Gi1/0/2", "speedMbps": 100, "poe": False},
    ]}
    group = mapper.toGroup(device, facts)

    # Exact key set per the HANDOFF §6 group schema — no extras, no omissions.
    assert set(group) == {"k", "label", "glyph", "count", "rows", "role",
                          "gbps", "watts", "amps", "volts", "poe", "poeW",
                          "domain", "conn"}
    assert group["domain"] == "net"
    assert group["glyph"] == "network"
    assert group["poe"] is True, "any PoE-capable port must reflect on the group"
    assert group["gbps"] == 1.0, "max measured port speed wins (1000 Mbps -> 1.0)"
    assert group["conn"] == 2
    assert group["label"] == "sw1.lab.akoria.net"
    assert group["k"].startswith("dev-")


def test_linksFromResolvesBySysName():
    """An LLDP neighbor naming a known device's hostname resolves to a link."""
    devices = [
        {"id": 1, "hostname": "sw1.lab.akoria.net", "mac": "00:1B:0D:11:22:33"},
        {"id": 2, "hostname": "core-sw", "mac": "00:1C:73:AA:BB:CC"},
    ]
    neighbors = [
        # sw1 hears core-sw; short-vs-FQDN spelling must still match.
        {"device_id": 1, "local_port": "Gi1/0/1",
         "remote_sys_name": "CORE-SW", "remote_chassis_id": None},
        # core-sw hears sw1 back — same physical link, must deduplicate.
        {"device_id": 2, "local_port": "Eth1",
         "remote_sys_name": "sw1", "remote_chassis_id": None},
        # A neighbor outside the scanned set resolves to nothing: skipped.
        {"device_id": 1, "local_port": "Gi1/0/9",
         "remote_sys_name": "mystery-box", "remote_chassis_id": None},
    ]
    links = mapper.linksFrom(neighbors, devices)
    assert links == [{"from": 1, "to": 2, "kind": "net"}]


# ---------------------------------------------------------------------------
# util.py
# ---------------------------------------------------------------------------

def test_subnetAllowed():
    """In-range True; out-of-range False; empty allow-list denies everything."""
    allowed = ("10.0.0.0/16", "192.168.1.0/24")
    assert util.subnetAllowed("10.0.5.0/24", allowed) is True
    assert util.subnetAllowed("192.168.1.77", allowed) is True
    assert util.subnetAllowed("172.16.0.0/24", allowed) is False
    assert util.subnetAllowed("8.8.8.8", allowed) is False
    assert util.subnetAllowed("10.0.5.0/24", ()) is False, "empty list = deny"
    assert util.subnetAllowed("garbage", allowed) is False


# ---------------------------------------------------------------------------
# infer/claude.py
# ---------------------------------------------------------------------------

def test_claudeInferDisabledWithoutKey(monkeypatch):
    """Empty anthropicApiKey -> infer returns None; no network is attempted.

    The module is authored in parallel — importorskip keeps this suite green
    until it lands, then enforces the degrade-gracefully contract (§4.2).
    """
    claude = pytest.importorskip("rackwire_discovery.infer.claude")

    # Trap any attempted HTTP call: the contract says no key => no network.
    def _noNetwork(*args, **kwargs):  # pragma: no cover - must never run
        raise AssertionError("claude.infer attempted network I/O without a key")
    import urllib.request
    monkeypatch.setattr(urllib.request, "urlopen", _noNetwork)
    # Belt and braces: an env-reading implementation must also see no key.
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    cfg = Config(anthropicApiKey="", claudeEnabled=False)
    facts = {"ip": "10.0.0.99", "vendor": None, "services": []}

    # The design contract pins infer(deviceFacts); the house rules pass the
    # Config object. Adapt to whichever signature the parallel author chose.
    params = inspect.signature(claude.infer).parameters
    if len(params) >= 2:
        result = claude.infer(facts, cfg)
    else:
        result = claude.infer(facts)
    assert result is None, "missing API key must degrade to None, not raise"


def test_claudeValidateIsStrict():
    """_validate coerces model output to the contract: unknown class -> unknown,
    string 'false' -> False (not truthy), negative/NaN numerics -> None,
    confidence clamped. Guards the plan from bad model output."""
    out = claude._validate({
        "classification": "totally-made-up",
        "poe": "false",          # truthy under bool(); must resolve to False
        "gbps": -5,              # negative link speed is impossible
        "watts": "nan",
        "confidence": 2.0,       # out of range
    })
    assert out["classification"] == "unknown"
    assert out["poe"] is False
    assert out["gbps"] is None
    assert out["watts"] is None
    assert out["confidence"] == 1.0

    ok = claude._validate({
        "classification": "Switch",  # case-insensitive, in-vocab
        "poe": True, "portsGuess": 48, "gbps": 10, "confidence": 0.7,
    })
    assert ok["classification"] == "switch"
    assert ok["poe"] is True and ok["portsGuess"] == 48 and ok["gbps"] == 10.0


# ---------------------------------------------------------------------------
# orchestrator.deviceFacts — camelCase normalization contract
# ---------------------------------------------------------------------------

def test_deviceFactsNormalizesPortsToCamelCase(store):
    """deviceFacts must hand inference camelCase port keys (speedMbps/ifName),
    not the store's snake_case columns — otherwise measured bandwidth/PoE are
    silently dropped by mapper.toGroup."""
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:33",
                                      "ip": "10.0.0.2"})
    store.replacePorts(devId, [
        {"ifIndex": 1, "ifName": "Gi1/0/1", "ifDescr": "uplink",
         "speedMbps": 1000, "adminStatus": "up", "operStatus": "up",
         "physMac": "aa:bb:cc:dd:ee:ff", "poe": True},
    ])
    facts = orchestrator.deviceFacts(store, devId)
    port = facts["ports"][0]
    assert port["speedMbps"] == 1000
    assert port["ifName"] == "Gi1/0/1"
    assert port["poe"] is True

    # And that shape flows through the mapper to a real gbps / conn.
    dev = store.getDevice(devId)
    dev["classification"] = "switch"
    group = mapper.toGroup(dev, facts)
    assert group["gbps"] == 1.0 and group["conn"] == 1 and group["poe"] is True


def test_confirmedSpecsReachPlanWithoutPorts():
    """When no ifTable was gathered, operator-confirmed specs (adopted from
    inference at confirm time) must still populate the plan group."""
    device = {
        "id": 9, "classification": "pdu", "role": "pdu",
        "confirmed_gbps": 1, "confirmed_watts": 350.0, "confirmed_amps": 3.2,
        "confirmed_ports": 8, "confirmed_poe": 0,
    }
    group = mapper.toGroup(device, {"ports": []})
    assert group["gbps"] == 1
    assert group["watts"] == 350.0
    assert group["amps"] == 3.2
    assert group["conn"] == 8
    assert group["poe"] is False


# ---------------------------------------------------------------------------
# store run-provenance + confirm flow
# ---------------------------------------------------------------------------

def test_listDevicesByRunProvenance(store):
    """last_run_id lets a classification pass scope to just this run's devices."""
    a = store.upsertDevice(NOW1, {"mac": "00:11:11:11:11:11"}, runId=100)
    b = store.upsertDevice(NOW1, {"mac": "00:22:22:22:22:22"}, runId=200)
    run100 = {d["id"] for d in store.listDevices(runId=100)}
    assert run100 == {a}
    assert b not in run100


def test_confirmDeviceAdoptsClaudeInference(store):
    """Confirming a device with no explicit specs adopts the latest Claude
    inference into confirmed_* AND marks that inference accepted (the
    human-in-the-loop gate that carries AI guesses into the plan)."""
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:33",
                                      "ip": "10.0.0.2"})
    infId = store.recordInference(
        devId, "claude", "claude-sonnet-5", {},
        {"classification": "switch", "gbps": 10, "watts": 120,
         "portsGuess": 48, "poe": True},
        NOW1,
    )
    ctx = {"store": store, "environ": {}}
    match = re.match(r"(?P<id>\d+)", str(devId))
    status, payload = routes.confirmDevice(ctx, match, {})

    assert status == 200 and payload["status"] == "confirmed"
    dev = store.getDevice(devId)
    assert dev["status"] == "confirmed"
    assert dev["confirmed_gbps"] == 10
    assert dev["confirmed_watts"] == 120
    assert dev["confirmed_ports"] == 48
    assert dev["confirmed_poe"] == 1
    assert store.getInferences(devId)[0]["accepted"] == 1, "inference accepted"
    # The adopted specs then reach the plan group.
    dev["classification"] = "switch"
    group = mapper.toGroup(dev, {"ports": []})
    assert group["gbps"] == 10 and group["watts"] == 120 and group["conn"] == 48


def test_confirmDeviceExplicitOverrideWins(store):
    """An explicit spec in the confirm body beats the inferred value."""
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:33"})
    store.recordInference(devId, "claude", "m", {},
                          {"classification": "switch", "watts": 120}, NOW1)
    ctx = {"store": store, "environ": {}}
    match = re.match(r"(?P<id>\d+)", str(devId))
    routes.confirmDevice(ctx, match, {"watts": 200})
    assert store.getDevice(devId)["confirmed_watts"] == 200


def test_associationPersistsAndMakesQueueRowTerminal(store):
    """Placement records the chosen library definition durably and advances
    the discovery row out of the open review queue."""
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:44",
                                      "ip": "10.0.0.9"})
    ctx = {"store": store, "environ": {"REMOTE_USER": "tester"}}
    match = re.match(r"(?P<id>\d+)", str(devId))

    status, payload = routes.associateDevice(
        ctx, match, {"libraryId": "core-switch-48"},
    )
    assert status == 200 and payload["status"] == "imported"
    assert store.getDevice(devId)["status"] == "imported"
    assert store.getDeviceAssociation(devId)["library_id"] == "core-switch-48"
    assert store.getDeviceAssociation(devId)["associated_by"] == "tester"

    status, detail = routes.getDevice(ctx, match, {})
    assert status == 200 and detail["device"]["libraryId"] == "core-switch-48"
    openIds = {d["id"] for d in store.listDevices()
               if d["status"] in ("discovered", "confirmed")}
    assert devId not in openIds


def test_associationIsIdempotentAndReassociationIsAudited(store):
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:55"})
    ctx = {"store": store, "environ": {}}
    match = re.match(r"(?P<id>\d+)", str(devId))

    routes.associateDevice(ctx, match, {"libraryId": "switch-a"})
    first = store.getDeviceAssociation(devId)
    routes.associateDevice(ctx, match, {"libraryId": "switch-a"})
    assert store.getDeviceAssociation(devId)["id"] == first["id"]
    routes.associateDevice(ctx, match, {"libraryId": "switch-b"})
    assert store.getDeviceAssociation(devId)["library_id"] == "switch-b"
    rows = store._query(
        "SELECT library_id, deleted_at FROM device_model_association "
        "WHERE device_id=? ORDER BY id", (devId,),
    )
    assert rows[0]["library_id"] == "switch-a" and rows[0]["deleted_at"]
    assert rows[1]["library_id"] == "switch-b" and rows[1]["deleted_at"] is None


def test_browserBackendAssociationRoundTrip(monkeypatch):
    """Exercise the same HTTP transaction the planner uses: POST association,
    reload detail, then reload the device list and apply the browser's open-row
    predicate. The selected libId survives and the row does not reappear."""
    monkeypatch.setenv("RACKWIRE_DB_PATH", ":memory:")
    from rackwire_discovery.wsgi import App
    app = App(config=Config(dbPath=":memory:", sessionSecret="test-secret"))
    devId = app.store.upsertDevice(
        NOW1, {"mac": "00:1B:0D:11:22:88", "ip": "10.0.0.12"},
    )
    token = app.issueCsrf()

    def request(method, path, body=None):
        raw = json.dumps(body or {}).encode("utf-8") if body is not None else b""
        environ = {
            "REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
            "CONTENT_LENGTH": str(len(raw)), "wsgi.input": io.BytesIO(raw),
            "HTTP_X_RACKWIRE_CSRF": token,
        }
        response = {}
        data = b"".join(app(environ, lambda status, headers: response.update(
            status=status, headers=headers,
        )))
        return int(response["status"].split()[0]), json.loads(data)

    status, placed = request(
        "POST", f"/api/discovery/devices/{devId}/associate",
        {"libraryId": "core-switch-48"},
    )
    assert status == 200 and placed["libraryId"] == "core-switch-48"
    _, detail = request("GET", f"/api/discovery/devices/{devId}")
    assert detail["device"]["libraryId"] == "core-switch-48"
    _, listing = request("GET", "/api/discovery/devices")
    openRows = [d for d in listing["devices"]
                if d["status"] in ("discovered", "confirmed")]
    assert all(d["id"] != devId for d in openRows)
    app.store.close()


# ---------------------------------------------------------------------------
# snmp enum / integer parsing
# ---------------------------------------------------------------------------

def test_snmpStatusAndIntParsing():
    """_mapStatus and _toInt tolerate bare-int, label, and label(number) forms
    from mixed-vendor net-snmp output."""
    assert snmp._mapStatus("1") == "up"
    assert snmp._mapStatus("2") == "down"
    assert snmp._mapStatus("up(1)") == "up"
    assert snmp._mapStatus("down(2)") == "down"
    assert snmp._mapStatus("up") == "up"
    assert snmp._mapStatus("testing(3)") == "testing(3)"
    assert snmp._mapStatus("") is None

    assert snmp._toInt("1000") == 1000
    assert snmp._toInt("1000 Mbps") == 1000
    assert snmp._toInt("up(1)") == 1
    assert snmp._toInt(None) is None
    assert snmp._toInt("junk") is None


# ---------------------------------------------------------------------------
# wsgi CSRF token
# ---------------------------------------------------------------------------

def test_csrfTokenSignedAndTimeBounded(monkeypatch):
    """issueCsrf mints a token validCsrf accepts; tampering or a forged token
    is rejected; the signature covers the timestamp."""
    # Importing wsgi runs a module-level `application = App()` that opens the
    # configured DB; point it at an in-memory DB so the import has no prod
    # filesystem dependency during the test.
    monkeypatch.setenv("RACKWIRE_DB_PATH", ":memory:")
    from rackwire_discovery.wsgi import App
    app = App(config=Config(dbPath=":memory:", sessionSecret="unit-test-secret"))
    token = app.issueCsrf()
    assert app.validCsrf(token) is True
    assert app.validCsrf("") is False
    assert app.validCsrf("no-dots") is False
    assert app.validCsrf(token + "tamper") is False

    # A forged token with the right shape but wrong signature is rejected.
    nonce, issued, _mac = token.split(".")
    forged = f"{nonce}.{issued}.{'0' * 64}"
    assert app.validCsrf(forged) is False
    app.store.close()


# ---------------------------------------------------------------------------
# gear library — store DAL, mapper.toLibraryModel, and the /library routes
# ---------------------------------------------------------------------------

def test_libraryUpsertRoundTrip(store):
    """A committed model round-trips through the DAL in planner shape, updates
    in place on re-commit, and preserves created_at / device provenance."""
    model = {
        "id": "disc-acme-sw24", "name": "ACME SW24", "vendor": "ACME",
        "model": "SW24", "kind": "switch", "ru": 1, "drawW": 30,
        "poeBudgetW": 180, "note": "discovered",
        "groups": [{"k": "p1", "label": "24× 1 GbE", "count": 24, "gbps": 1,
                    "domain": "net", "conn": "rj45"}],
        # An extra device-def field not broken out into a column must survive.
        "circuitA": 15,
    }
    modelId = store.upsertLibraryModel(model, NOW1, deviceId=42)
    assert modelId == "disc-acme-sw24"

    got = store.getLibraryModel(modelId)
    assert got["name"] == "ACME SW24" and got["vendor"] == "ACME"
    assert got["kind"] == "switch" and got["drawW"] == 30
    assert got["groups"][0]["count"] == 24
    assert got["circuitA"] == 15, "extra device-def fields survive the JSON bag"
    assert got["source"] == "discovery"
    # NULL scalars are dropped, not surfaced as explicit null.
    assert "deleted_at" not in got

    # listLibrary returns it; a second commit updates in place (no duplicate).
    assert len(store.listLibrary()) == 1
    model["drawW"] = 35
    store.upsertLibraryModel(model, NOW2)
    assert len(store.listLibrary()) == 1
    assert store.getLibraryModel(modelId)["drawW"] == 35


def test_toLibraryModelMeasuredPortsCoalesced():
    """Measured ifTable ports collapse into groups by (speed, PoE); a full
    device-def with a power group is produced from confirmed watts."""
    device = {"id": 3, "mac": "00:1B:0D:AA:BB:CC", "ip": "10.0.0.5",
              "hostname": "sw-lab", "vendor": "ACME",
              "classification": "switch", "confirmed_watts": 30.0}
    facts = {"ports": (
        [{"speedMbps": 1000, "poe": True}] * 12
        + [{"speedMbps": 1000, "poe": False}] * 4
        + [{"speedMbps": 10000, "poe": False}] * 2
    )}
    lib = mapper.toLibraryModel(device, facts, {"modelGuess": "SW-18"})

    assert lib["kind"] == "switch"
    assert lib["model"] == "SW-18"
    assert lib["id"] == "disc-acme-sw-18"
    # 3 port groups (1G-PoE, 1G, 10G) + 1 power-in group.
    portGroups = [g for g in lib["groups"] if g["domain"] == "net"]
    powerGroups = [g for g in lib["groups"] if g["domain"] == "power"]
    assert len(portGroups) == 3 and len(powerGroups) == 1
    counts = sorted(g["count"] for g in portGroups)
    assert counts == [2, 4, 12]
    assert any(g.get("poe") == "poe+" for g in portGroups)
    assert powerGroups[0]["watts"] == 30.0


def test_toLibraryModelInferredDegradesWithoutClaude():
    """With no ports measured and no Claude, the candidate degrades to the OUI
    vendor + a single synthesized port group from the inferred count."""
    device = {"id": 4, "ip": "10.0.0.6", "vendor": "Ubiquiti",
              "hostname": "ap-attic", "classification": "ap"}
    # Deterministic-only: inference carries no make/model, just a port guess.
    lib = mapper.toLibraryModel(device, {"ports": []},
                                {"portsGuess": 1, "gbps": 2.5, "poe": False})
    assert lib["vendor"] == "Ubiquiti"
    assert lib["model"] == "ap-attic"      # falls back to hostname
    assert lib["kind"] == "ap"
    netGroups = [g for g in lib["groups"] if g["domain"] == "net"]
    assert len(netGroups) == 1 and netGroups[0]["count"] == 1
    assert netGroups[0]["gbps"] == 2.5


def test_claudeValidateMakeModel():
    """_validate surfaces make/model/name and rejects the 'unknown'/empty
    spellings a model emits when it cannot name a device."""
    out = claude._validate({
        "classification": "switch", "vendorGuess": "  Cisco ",
        "modelGuess": "Catalyst 2960X", "nameGuess": "unknown",
    })
    assert out["vendorGuess"] == "Cisco"        # trimmed
    assert out["modelGuess"] == "Catalyst 2960X"
    assert out["nameGuess"] is None             # 'unknown' -> None


def test_deviceCandidateAndCommitRoute(store):
    """The candidate route recommends a library model from the latest inference;
    committing it then makes a subsequent candidate report a match."""
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:33",
                                      "ip": "10.0.0.2", "vendor": "ACME"})
    store.setDeviceClassification(devId, "switch", "access", 0.9, "deterministic")
    store.recordInference(
        devId, "claude", "claude-sonnet-5", {},
        {"classification": "switch", "vendorGuess": "ACME",
         "modelGuess": "SW-24", "portsGuess": 24, "gbps": 1, "poe": True,
         "watts": 30, "confidence": 0.8, "rationale": "24 GbE + LLDP"},
        NOW1,
    )
    ctx = {"store": store, "environ": {}, "config": None}
    match = re.match(r"(?P<id>\d+)", str(devId))

    status, payload = routes.deviceCandidate(ctx, match, {})
    assert status == 200
    cand = payload["candidate"]
    assert cand["vendor"] == "ACME" and cand["model"] == "SW-24"
    assert cand["id"] == "disc-acme-sw-24"
    assert payload["recommendation"]["source"] == "claude"
    assert payload["match"] is None, "nothing committed yet"

    # Commit the (validated) candidate, then re-request: now it matches.
    body = dict(cand)
    body["deviceId"] = devId
    status, payload = routes.commitLibraryModel(ctx, None, body)
    assert status == 200 and payload["model"]["id"] == "disc-acme-sw-24"

    status, payload = routes.deviceCandidate(ctx, match, {})
    assert payload["match"] == "disc-acme-sw-24"


def test_selectionInferenceUsesFreshClaudeResult(store, monkeypatch):
    """The selection transaction records deterministic + Claude and candidate
    construction consumes the newest successful Claude row."""
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:66",
                                      "ip": "10.0.0.10", "vendor": "Old"})
    store.recordInference(devId, "claude", "old", {},
                          {"vendorGuess": "Stale", "modelGuess": "S-1"}, NOW1)
    fresh = {"classification": "switch", "vendorGuess": "Fresh",
             "modelGuess": "F-24", "portsGuess": 24, "confidence": 0.9}
    monkeypatch.setattr(routes.claudeInfer, "infer", lambda facts, cfg: fresh)
    cfg = Config(claudeEnabled=True, anthropicApiKey="test", claudeModel="test")
    ctx = {"store": store, "environ": {}, "config": cfg}
    match = re.match(r"(?P<id>\d+)", str(devId))

    status, result = routes.inferDevice(ctx, match, {"useClaude": True})
    assert status == 200 and result["claude"] == fresh
    rows = store.getInferences(devId)
    assert [rows[0]["engine"], rows[1]["engine"]] == ["claude", "deterministic"]
    _, payload = routes.deviceCandidate(ctx, match, {})
    assert payload["candidate"]["vendor"] == "Fresh"
    assert payload["candidate"]["model"] == "F-24"
    assert payload["recommendation"]["source"] == "claude"


def test_selectionInferenceFallsBackToFreshDeterministic(store, monkeypatch):
    """A Claude failure never revives an older Claude make/model."""
    from rackwire_discovery.api import routes
    devId = store.upsertDevice(NOW1, {"mac": "00:1B:0D:11:22:77",
                                      "ip": "10.0.0.11", "vendor": "Current"})
    store.recordInference(devId, "claude", "old", {},
                          {"vendorGuess": "Stale", "modelGuess": "S-1"}, NOW1)
    monkeypatch.setattr(routes.claudeInfer, "infer", lambda facts, cfg: None)
    cfg = Config(claudeEnabled=True, anthropicApiKey="test", claudeModel="test")
    ctx = {"store": store, "environ": {}, "config": cfg}
    match = re.match(r"(?P<id>\d+)", str(devId))

    status, result = routes.inferDevice(ctx, match, {"useClaude": True})
    assert status == 200 and result["claude"] is None
    _, payload = routes.deviceCandidate(ctx, match, {})
    assert payload["recommendation"]["source"] == "deterministic"
    assert payload["candidate"]["vendor"] == "Current"
    assert payload["candidate"]["model"] != "S-1"


def test_commitLibraryModelRejectsAndSanitizes(store):
    """commitLibraryModel requires a name + a group, drops unknown keys, and
    derives a key-safe id when the client did not pin one."""
    from rackwire_discovery.api import routes
    ctx = {"store": store, "environ": {}, "config": None}

    # Missing groups -> 400.
    status, _ = routes.commitLibraryModel(ctx, None, {"name": "No Ports"})
    assert status == 400

    # Unknown top-level key and unknown group key are stripped; id derived.
    status, payload = routes.commitLibraryModel(ctx, None, {
        "name": "Widget", "vendor": "ACME", "model": "W1",
        "evil": "DROP TABLE device", "drawW": "45",
        "groups": [{"k": "p1", "label": "2× 1 GbE", "count": 2,
                    "gbps": 1, "junk": "x"}],
    })
    assert status == 200
    stored = payload["model"]
    assert stored["id"] == "disc-acme-w1"
    assert "evil" not in stored
    assert stored["drawW"] == 45          # coerced from string
    assert "junk" not in stored["groups"][0]

    # Client identity is ignored; edited vendor/model own the derived id.
    _, seedish = routes.commitLibraryModel(ctx, None, {
        "id": "core-switch-48", "name": "Impostor", "vendor": "Safe",
        "model": "Edited",
        "groups": [{"k": "p1", "label": "1 GbE", "count": 1}],
    })
    assert seedish["model"]["id"] == "disc-safe-edited"
    _, roundtrip = routes.commitLibraryModel(ctx, None, {
        "id": "disc-stale-value", "name": "Catalyst", "vendor": "Cisco",
        "model": "C9200",
        "groups": [{"k": "p1", "label": "1 GbE", "count": 1}],
    })
    assert roundtrip["model"]["id"] == "disc-cisco-c9200"


def test_commitLibraryModelCollisionReturns409(store):
    """Distinct edited identities that slug to the same id never overwrite."""
    from rackwire_discovery.api import routes
    ctx = {"store": store, "environ": {}, "config": None}
    group = [{"k": "p1", "label": "Ethernet", "count": 1}]
    status, _ = routes.commitLibraryModel(ctx, None, {
        "name": "First", "vendor": "AC-ME", "model": "SW 1", "groups": group,
    })
    assert status == 200
    status, payload = routes.commitLibraryModel(ctx, None, {
        "name": "Second", "vendor": "AC ME", "model": "SW-1", "groups": group,
    })
    assert status == 409 and payload["error"] == "library_id_collision"
    assert store.getLibraryModel("disc-ac-me-sw-1")["name"] == "First"


@pytest.mark.parametrize("field,value", [
    ("count", 10_000_000), ("count", 0), ("count", 1.5),
    ("rows", 3), ("gbps", 10_000_000), ("watts", 10_000_000),
])
def test_commitLibraryModelRejectsUnsafeGroupNumbers(store, field, value):
    from rackwire_discovery.api import routes
    group = {"k": "p1", "label": "Ethernet", "count": 2, field: value}
    status, payload = routes.commitLibraryModel(
        {"store": store, "environ": {}, "config": None}, None,
        {"name": "Unsafe", "groups": [group]},
    )
    assert status == 400 and payload["error"] == "invalid_model"


def test_commitLibraryModelAcceptsUpperSafePortBound(store):
    from rackwire_discovery.api import routes
    status, payload = routes.commitLibraryModel(
        {"store": store, "environ": {}, "config": None}, None,
        {"name": "Dense patch panel",
         "groups": [{"k": "p1", "label": "Ports", "count": 512,
                     "rows": 512}]},
    )
    assert status == 200 and payload["model"]["groups"][0]["count"] == 512


def test_commitLibraryModelRejectsTooManyGroups(store):
    from rackwire_discovery.api import routes
    groups = [{"k": f"p{i}", "label": "Port", "count": 1}
              for i in range(65)]
    status, payload = routes.commitLibraryModel(
        {"store": store, "environ": {}, "config": None}, None,
        {"name": "Unsafe", "groups": groups},
    )
    assert status == 400 and "at most 64" in payload["detail"]
