"""
store.py — SQLite schema and data-access layer.

This is the ONLY module that speaks SQL. Every statement is parameterized; no
value is ever interpolated into SQL text. The schema is created idempotently and
uses soft deletes and provenance columns per the engineering doctrine.

Purpose: durable, auditable storage for scan runs, devices, ports, services,
neighbors, and inferences. Input: a db path. Output: a Store with a camelCase
DAL. Handlers and the orchestrator call these methods; they never open cursors
of their own.
"""

import json
import sqlite3
import threading

from . import const


SCHEMA = """
CREATE TABLE IF NOT EXISTS scan_run (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at    TEXT NOT NULL,
    finished_at   TEXT,
    subnet        TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'running',
    initiated_by  TEXT,
    options_json  TEXT,
    note          TEXT,
    error         TEXT
);

CREATE TABLE IF NOT EXISTS device (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    first_seen     TEXT NOT NULL,
    last_seen      TEXT NOT NULL,
    mac            TEXT,
    ip             TEXT,
    hostname       TEXT,
    vendor         TEXT,
    os_guess       TEXT,
    sys_descr      TEXT,
    sys_object_id  TEXT,
    snmp_ok        INTEGER NOT NULL DEFAULT 0,
    classification TEXT,
    role           TEXT,
    confidence     REAL,
    source         TEXT,
    status         TEXT NOT NULL DEFAULT 'discovered',
    raw_json       TEXT,
    provenance     TEXT,
    -- Operator-confirmed specifications (adopted from inference at confirm
    -- time or entered by hand). NULL until a human confirms; the mapper reads
    -- these before falling back to class defaults so accepted AI/heuristic
    -- guesses actually reach the plan.
    confirmed_gbps  REAL,
    confirmed_watts REAL,
    confirmed_amps  REAL,
    confirmed_poe   INTEGER,
    confirmed_ports INTEGER,
    -- Provenance: the scan run that most recently observed this device, so a
    -- classification pass can be scoped to just this run's devices.
    last_run_id    INTEGER,
    deleted_at     TEXT
);
-- A device is identified by MAC when known, else by IP. Partial unique indexes
-- keep re-scans idempotent without colliding NULLs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_mac
    ON device(mac) WHERE mac IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_device_ip ON device(ip);
CREATE INDEX IF NOT EXISTS idx_device_status ON device(status);

CREATE TABLE IF NOT EXISTS port (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id     INTEGER NOT NULL REFERENCES device(id),
    if_index      INTEGER,
    if_name       TEXT,
    if_descr      TEXT,
    if_speed_mbps INTEGER,
    admin_status  TEXT,
    oper_status   TEXT,
    phys_mac      TEXT,
    poe           INTEGER NOT NULL DEFAULT 0,
    raw_json      TEXT
);
CREATE INDEX IF NOT EXISTS idx_port_device ON port(device_id);

CREATE TABLE IF NOT EXISTS open_service (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  INTEGER NOT NULL REFERENCES device(id),
    port       INTEGER NOT NULL,
    proto      TEXT NOT NULL DEFAULT 'tcp',
    service    TEXT,
    product    TEXT,
    version    TEXT,
    banner     TEXT
);
CREATE INDEX IF NOT EXISTS idx_service_device ON open_service(device_id);

CREATE TABLE IF NOT EXISTS neighbor (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id         INTEGER NOT NULL REFERENCES device(id),
    local_port        TEXT,
    remote_chassis_id TEXT,
    remote_port_id    TEXT,
    remote_sys_name   TEXT,
    remote_sys_descr  TEXT,
    remote_caps       TEXT,
    source            TEXT NOT NULL DEFAULT 'lldp'
);
CREATE INDEX IF NOT EXISTS idx_neighbor_device ON neighbor(device_id);

CREATE TABLE IF NOT EXISTS inference (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id   INTEGER NOT NULL REFERENCES device(id),
    engine      TEXT NOT NULL,
    model       TEXT,
    input_json  TEXT,
    output_json TEXT,
    created_at  TEXT NOT NULL,
    accepted    INTEGER NOT NULL DEFAULT 0,
    accepted_by TEXT,
    accepted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_inference_device ON inference(device_id);

CREATE TABLE IF NOT EXISTS import_map (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id   INTEGER NOT NULL REFERENCES device(id),
    group_json  TEXT NOT NULL,
    imported_at TEXT NOT NULL
);

-- RackWire-owned gear library. This is the "gear database" the planner merges
-- into window.RW.DEVICES: each row is a full device-library DEFINITION (the
-- planner's device shape — id, vendor, name, model, kind, groups[]), NOT a
-- single port group. A discovered+confirmed device becomes a row here when the
-- operator commits its make/model, so it can be placed into a layout and reused
-- across projects. Independent from SolariNet — this table is RackWire's own SoR
-- for gear. Soft-deleted (deleted_at) and provenance-stamped (source, device_id)
-- per the engineering doctrine.
CREATE TABLE IF NOT EXISTS library (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    vendor       TEXT,
    model        TEXT,
    kind         TEXT,
    ru           INTEGER,
    draw_w       REAL,
    poe_budget_w REAL,
    note         TEXT,
    -- The device's port groups, exactly as the planner group schema expects
    -- them (k, label, glyph, count, rows, role, gbps, poe, domain, conn, ...).
    groups_json  TEXT NOT NULL DEFAULT '[]',
    -- Any additional planner device-def fields not broken out into columns
    -- (budgetW, circuitA, circuitV, isBattery, upc). Kept as JSON so the shape
    -- can grow without a migration.
    extra_json   TEXT,
    source       TEXT NOT NULL DEFAULT 'discovery',
    device_id    INTEGER,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    deleted_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_library_model ON library(vendor, model);
"""


class Store:
    """
    Thread-safe SQLite wrapper. A single connection is guarded by a lock; the
    scan orchestrator writes from a bounded thread pool, so serialization here
    keeps writes correct without a connection pool. Reads are cheap and equally
    guarded.
    """

    def __init__(self, dbPath):
        # check_same_thread=False because the orchestrator's worker threads
        # share this connection; the lock below serializes all access.
        self._conn = sqlite3.connect(dbPath, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with self._lock:
            self._conn.execute("PRAGMA journal_mode=WAL;")
            self._conn.execute("PRAGMA foreign_keys=ON;")
            self._conn.executescript(SCHEMA)
            self._migrate()
            self._conn.commit()

    def _migrate(self):
        """Idempotently add columns introduced after a DB was first created.

        CREATE TABLE IF NOT EXISTS never alters an existing table, so a DB from
        an earlier build is upgraded here by adding any missing column. Called
        under the construction lock. Additive only — never drops or rewrites.
        """
        have = {
            row["name"]
            for row in self._conn.execute("PRAGMA table_info(device)")
        }
        additions = {
            "confirmed_gbps": "REAL",
            "confirmed_watts": "REAL",
            "confirmed_amps": "REAL",
            "confirmed_poe": "INTEGER",
            "confirmed_ports": "INTEGER",
            "last_run_id": "INTEGER",
        }
        for col, decl in additions.items():
            if col not in have:
                # Column names are module literals, never request data — safe
                # to interpolate here (ALTER TABLE cannot bind an identifier).
                self._conn.execute(
                    f"ALTER TABLE device ADD COLUMN {col} {decl}"
                )

    def close(self):
        with self._lock:
            self._conn.close()

    # -- helpers ----------------------------------------------------------
    def _write(self, sql, params=()):
        """Run one parameterized write, return lastrowid. Never interpolate."""
        with self._lock:
            cur = self._conn.execute(sql, params)
            self._conn.commit()
            return cur.lastrowid

    def _query(self, sql, params=()):
        """Run one parameterized read, return list[sqlite3.Row]."""
        with self._lock:
            return list(self._conn.execute(sql, params))

    # -- scan runs --------------------------------------------------------
    def createScanRun(self, startedAt, subnet, initiatedBy, options):
        return self._write(
            "INSERT INTO scan_run (started_at, subnet, status, initiated_by, "
            "options_json) VALUES (?, ?, 'running', ?, ?)",
            (startedAt, subnet, initiatedBy, json.dumps(options or {})),
        )

    def finishScanRun(self, runId, finishedAt, status, error=None, note=None):
        self._write(
            "UPDATE scan_run SET finished_at=?, status=?, error=?, note=? "
            "WHERE id=?",
            (finishedAt, status, error, note, runId),
        )

    def getScanRun(self, runId):
        rows = self._query("SELECT * FROM scan_run WHERE id=?", (runId,))
        return dict(rows[0]) if rows else None

    def listScanRuns(self, limit=50):
        return [
            dict(r)
            for r in self._query(
                "SELECT * FROM scan_run ORDER BY id DESC LIMIT ?", (limit,)
            )
        ]

    # -- devices ----------------------------------------------------------
    def upsertDevice(self, now, facts, runId=None):
        """
        Insert or update a device keyed by MAC (falling back to IP).

        Input:  now (ISO ts), facts (dict of observed fields), runId (the scan
                run that observed it, recorded as provenance) — may be None for
                out-of-band writes (e.g. tests).
        Output: device id.
        Idempotent across re-scans: an existing device is updated in place and
        last_seen advances; first_seen is preserved.

        The whole select-then-insert/update is performed under ONE lock so two
        concurrent runs (or a re-scan racing itself) cannot both miss the
        existing row and insert duplicates — the partial unique index on MAC
        would reject the second insert, but IP-keyed rows have no such guard.
        """
        mac = facts.get("mac")
        ip = facts.get("ip")
        cols = {
            "mac": mac,
            "ip": ip,
            "hostname": facts.get("hostname"),
            "vendor": facts.get("vendor"),
            "os_guess": facts.get("osGuess"),
            "sys_descr": facts.get("sysDescr"),
            "sys_object_id": facts.get("sysObjectId"),
            "snmp_ok": 1 if facts.get("snmpOk") else 0,
            "raw_json": json.dumps(facts.get("raw", {})),
            "provenance": facts.get("provenance"),
        }
        with self._lock:
            existing = None
            if mac:
                row = self._conn.execute(
                    "SELECT id FROM device WHERE mac=? AND deleted_at IS NULL",
                    (mac,),
                ).fetchone()
                existing = row["id"] if row else None
            if existing is None and ip:
                row = self._conn.execute(
                    "SELECT id FROM device WHERE ip=? AND mac IS NULL "
                    "AND deleted_at IS NULL",
                    (ip,),
                ).fetchone()
                existing = row["id"] if row else None

            if existing is not None:
                # Additive update: only overwrite columns this scan actually
                # observed, so a later run that could not reach (say) SNMP does
                # not erase last-known-good identity. snmp_ok only ratchets up.
                update = {}
                for col, val in cols.items():
                    if col == "snmp_ok":
                        if val:
                            update[col] = 1
                        continue
                    if col == "raw_json":
                        if facts.get("raw"):
                            update[col] = val
                        continue
                    if val is not None:
                        update[col] = val
                update["last_run_id"] = runId
                # Column names come from this method's own literal dict, never
                # from request data — safe to build the SET clause from them.
                setClause = ", ".join(f"{c}=?" for c in update)
                self._conn.execute(
                    f"UPDATE device SET {setClause}, last_seen=? WHERE id=?",
                    tuple(update.values()) + (now, existing),
                )
                self._conn.commit()
                return existing

            cols["last_run_id"] = runId
            colNames = ", ".join(cols)
            placeholders = ", ".join("?" for _ in cols)
            cur = self._conn.execute(
                f"INSERT INTO device ({colNames}, first_seen, last_seen) "
                f"VALUES ({placeholders}, ?, ?)",
                tuple(cols.values()) + (now, now),
            )
            self._conn.commit()
            return cur.lastrowid

    def setDeviceClassification(self, deviceId, classification, role, confidence,
                                source):
        self._write(
            "UPDATE device SET classification=?, role=?, confidence=?, source=? "
            "WHERE id=?",
            (classification, role, confidence, source, deviceId),
        )

    def setDeviceConfirmedSpecs(self, deviceId, specs):
        """Persist operator-confirmed hardware specs on a device.

        Input:  deviceId, specs (dict; any of gbps/watts/amps/poe/ports).
        Output: none. Only the keys present in `specs` are written, so a
        confirm that adjusts one field leaves the others intact. `poe` is
        stored as 0/1; the rest as their numeric value (or NULL to clear).
        """
        mapping = {
            "gbps": "confirmed_gbps",
            "watts": "confirmed_watts",
            "amps": "confirmed_amps",
            "ports": "confirmed_ports",
        }
        update = {}
        for key, col in mapping.items():
            if key in specs:
                update[col] = specs[key]
        if "poe" in specs:
            update["confirmed_poe"] = 1 if specs["poe"] else 0
        if not update:
            return
        # Column names are from this method's literal maps, never request data.
        setClause = ", ".join(f"{c}=?" for c in update)
        self._write(
            f"UPDATE device SET {setClause} WHERE id=?",
            tuple(update.values()) + (deviceId,),
        )

    def setDeviceStatus(self, deviceId, status):
        self._write("UPDATE device SET status=? WHERE id=?", (status, deviceId))

    def getDevice(self, deviceId):
        rows = self._query(
            "SELECT * FROM device WHERE id=? AND deleted_at IS NULL", (deviceId,)
        )
        return dict(rows[0]) if rows else None

    def listDevices(self, status=None, runId=None, limit=500):
        """List non-deleted devices, optionally filtered by status and/or the
        scan run that last observed them (last_run_id). Both filters are
        parameterized; ordering is by IP for a stable console view."""
        where = ["deleted_at IS NULL"]
        params = []
        if status:
            where.append("status=?")
            params.append(status)
        if runId is not None:
            where.append("last_run_id=?")
            params.append(runId)
        params.append(limit)
        rows = self._query(
            "SELECT * FROM device WHERE " + " AND ".join(where)
            + " ORDER BY ip LIMIT ?",
            tuple(params),
        )
        return [dict(r) for r in rows]

    # -- ports / services / neighbors ------------------------------------
    def replacePorts(self, deviceId, ports):
        """Replace a device's port rows (a re-scan supersedes the prior set)."""
        with self._lock:
            self._conn.execute("DELETE FROM port WHERE device_id=?", (deviceId,))
            for p in ports:
                self._conn.execute(
                    "INSERT INTO port (device_id, if_index, if_name, if_descr, "
                    "if_speed_mbps, admin_status, oper_status, phys_mac, poe, "
                    "raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        deviceId,
                        p.get("ifIndex"),
                        p.get("ifName"),
                        p.get("ifDescr"),
                        p.get("speedMbps"),
                        p.get("adminStatus"),
                        p.get("operStatus"),
                        p.get("physMac"),
                        1 if p.get("poe") else 0,
                        json.dumps(p.get("raw", {})),
                    ),
                )
            self._conn.commit()

    def replaceServices(self, deviceId, services):
        with self._lock:
            self._conn.execute(
                "DELETE FROM open_service WHERE device_id=?", (deviceId,)
            )
            for s in services:
                self._conn.execute(
                    "INSERT INTO open_service (device_id, port, proto, service, "
                    "product, version, banner) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (
                        deviceId,
                        s.get("port"),
                        s.get("proto", "tcp"),
                        s.get("service"),
                        s.get("product"),
                        s.get("version"),
                        s.get("banner"),
                    ),
                )
            self._conn.commit()

    def replaceNeighbors(self, deviceId, neighbors):
        with self._lock:
            self._conn.execute(
                "DELETE FROM neighbor WHERE device_id=?", (deviceId,)
            )
            for n in neighbors:
                self._conn.execute(
                    "INSERT INTO neighbor (device_id, local_port, "
                    "remote_chassis_id, remote_port_id, remote_sys_name, "
                    "remote_sys_descr, remote_caps, source) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        deviceId,
                        n.get("localPort"),
                        n.get("remoteChassisId"),
                        n.get("remotePortId"),
                        n.get("remoteSysName"),
                        n.get("remoteSysDescr"),
                        n.get("remoteCaps"),
                        n.get("source", "lldp"),
                    ),
                )
            self._conn.commit()

    def getPorts(self, deviceId):
        return [dict(r) for r in self._query(
            "SELECT * FROM port WHERE device_id=? ORDER BY if_index", (deviceId,)
        )]

    def getServices(self, deviceId):
        return [dict(r) for r in self._query(
            "SELECT * FROM open_service WHERE device_id=? ORDER BY port",
            (deviceId,),
        )]

    def getNeighbors(self, deviceId):
        return [dict(r) for r in self._query(
            "SELECT * FROM neighbor WHERE device_id=?", (deviceId,)
        )]

    def allNeighbors(self):
        return [dict(r) for r in self._query("SELECT * FROM neighbor", ())]

    # -- inferences -------------------------------------------------------
    def recordInference(self, deviceId, engine, model, inputData, outputData,
                        createdAt):
        return self._write(
            "INSERT INTO inference (device_id, engine, model, input_json, "
            "output_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (
                deviceId,
                engine,
                model,
                json.dumps(inputData or {}),
                json.dumps(outputData or {}),
                createdAt,
            ),
        )

    def getInferences(self, deviceId):
        return [dict(r) for r in self._query(
            "SELECT * FROM inference WHERE device_id=? ORDER BY id DESC",
            (deviceId,),
        )]

    def getLatestInference(self, deviceId, engine=None):
        """Most recent inference row for a device, optionally of one engine.

        Input:  deviceId, engine ("claude"|"deterministic"|None for any).
        Output: the newest matching row as a dict, or None. Used at confirm
        time to adopt the inferred specs a human is accepting.
        """
        if engine:
            rows = self._query(
                "SELECT * FROM inference WHERE device_id=? AND engine=? "
                "ORDER BY id DESC LIMIT 1",
                (deviceId, engine),
            )
        else:
            rows = self._query(
                "SELECT * FROM inference WHERE device_id=? ORDER BY id DESC "
                "LIMIT 1",
                (deviceId,),
            )
        return dict(rows[0]) if rows else None

    def acceptInference(self, inferenceId, acceptedBy, acceptedAt):
        self._write(
            "UPDATE inference SET accepted=1, accepted_by=?, accepted_at=? "
            "WHERE id=?",
            (acceptedBy, acceptedAt, inferenceId),
        )

    # -- import map -------------------------------------------------------
    def recordImport(self, deviceId, groupPayload, importedAt):
        return self._write(
            "INSERT INTO import_map (device_id, group_json, imported_at) "
            "VALUES (?, ?, ?)",
            (deviceId, json.dumps(groupPayload), importedAt),
        )

    # -- gear library -----------------------------------------------------
    def listLibrary(self):
        """All non-deleted library models, each in the planner's device shape.

        Output: list of dicts with keys id, vendor, name, model, kind, ru,
        drawW, poeBudgetW, note, groups, source — the exact shape a
        window.RW.DEVICES entry uses, so the planner can merge them directly.
        Ordered by vendor+model for a stable pick list.
        """
        rows = self._query(
            "SELECT * FROM library WHERE deleted_at IS NULL "
            "ORDER BY vendor, model, id"
        )
        return [self._libraryRowToModel(r) for r in rows]

    def getLibraryModel(self, modelId):
        """One library model by id in planner shape, or None if absent/deleted."""
        rows = self._query(
            "SELECT * FROM library WHERE id=? AND deleted_at IS NULL",
            (modelId,),
        )
        return self._libraryRowToModel(rows[0]) if rows else None

    def upsertLibraryModel(self, model, now, deviceId=None):
        """Insert or update a gear-library model, keyed by its id.

        Input:  model (validated planner-shape dict: id, name, vendor, model,
                kind, ru, drawW, poeBudgetW, note, groups[], plus any extra
                device-def fields), now (ISO ts), deviceId (provenance: the
                discovered device this came from, or None for a hand-authored
                model).
        Output: the model id.

        Idempotent: committing the same id again updates the row in place and
        advances updated_at while preserving created_at and the original
        source/device provenance. Every value is bound, never interpolated.
        """
        modelId = model["id"]
        # Split the planner-shape dict into first-class columns and the
        # everything-else `extra` bag so the common fields stay queryable.
        known = {"id", "name", "vendor", "model", "kind", "ru", "drawW",
                 "poeBudgetW", "note", "groups", "source"}
        extra = {k: v for k, v in model.items() if k not in known}
        groupsJson = json.dumps(model.get("groups") or [])
        extraJson = json.dumps(extra) if extra else None
        source = model.get("source") or "discovery"

        with self._lock:
            existing = self._conn.execute(
                "SELECT created_at, source, device_id FROM library WHERE id=?",
                (modelId,),
            ).fetchone()
            if existing is not None:
                # Preserve original provenance on update; only refresh content.
                self._conn.execute(
                    "UPDATE library SET name=?, vendor=?, model=?, kind=?, "
                    "ru=?, draw_w=?, poe_budget_w=?, note=?, groups_json=?, "
                    "extra_json=?, updated_at=?, deleted_at=NULL WHERE id=?",
                    (
                        model.get("name"), model.get("vendor"),
                        model.get("model"), model.get("kind"),
                        model.get("ru"), model.get("drawW"),
                        model.get("poeBudgetW"), model.get("note"),
                        groupsJson, extraJson, now, modelId,
                    ),
                )
            else:
                self._conn.execute(
                    "INSERT INTO library (id, name, vendor, model, kind, ru, "
                    "draw_w, poe_budget_w, note, groups_json, extra_json, "
                    "source, device_id, created_at, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        modelId, model.get("name"), model.get("vendor"),
                        model.get("model"), model.get("kind"), model.get("ru"),
                        model.get("drawW"), model.get("poeBudgetW"),
                        model.get("note"), groupsJson, extraJson, source,
                        deviceId, now, now,
                    ),
                )
            self._conn.commit()
        return modelId

    def _libraryRowToModel(self, row):
        """Map a `library` table row to the planner's device-def dict shape.

        Reconstitutes the groups[] and any extra device-def fields from JSON and
        drops SQL NULLs so the merged entry matches a hand-authored
        window.RW.DEVICES record. Input: sqlite3.Row. Output: dict.
        """
        groups = json.loads(row["groups_json"]) if row["groups_json"] else []
        extra = json.loads(row["extra_json"]) if row["extra_json"] else {}
        model = {
            "id": row["id"],
            "name": row["name"],
            "vendor": row["vendor"],
            "model": row["model"],
            "kind": row["kind"],
            "ru": row["ru"],
            "drawW": row["draw_w"],
            "poeBudgetW": row["poe_budget_w"],
            "note": row["note"],
            "groups": groups,
            "source": row["source"],
        }
        # Drop NULL scalars so the planner sees an absent key, not an explicit
        # null (its merge treats "present + non-null" as authoritative).
        model = {k: v for k, v in model.items() if v is not None}
        model.update(extra)
        return model
