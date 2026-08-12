# RackWire Discovery — Design Contract

`v0.1.0 · 2026-08-12 · status: DRAFT (build target) · author: Claude (Fable 5) · reviewer: cross-lab (Codex/GPT)`

This document is the **contract** the discovery module is built against. Module
authors implement to the interfaces defined here; they do not renegotiate them.
Where an implementation detail is genuinely underspecified, the author flags it
in the return packet as a proposed amendment rather than inventing divergent
behaviour.

---

## 0. What this is

RackWire Discovery is an **independent** network-scanning and device-inference
service that populates a RackWire plan with real devices found on the operator's
network. It runs as a Python backend behind the existing RackWire planner.

**Independence is a hard constraint (operator decision, 2026-08-12).** RackWire
is a standalone product headed for external, public-facing deployment. Discovery
runs its own full scanner stack (arp, ping, nmap, SNMP, LLDP). It **never** reads
the SolariNet System-of-Record and **never** calls SolariNet services. Logic may
be *duplicated* from SolariNet sources (OID tables, nmap invocation, OUI data);
live coupling is forbidden. There is no SoR row, no cross-service HTTP, no shared
database.

---

## 1. Architecture

```
                     rackwire.akoria.net  (Apache :443, SNI vhost on xenon)
                      │
        ┌─────────────┴──────────────┐
   static (web/)                 /api/discovery/*   ──reverse proxy──▶  gunicorn (127.0.0.1:PORT)
   discovery console                                                    rackwire_discovery WSGI app
   + planner iframe                                                         │
                                                          ┌────────────────┼───────────────────┐
                                                       scan/            infer/               store.py
                                                   subprocess to     deterministic +        SQLite (stdlib)
                                                   system tools      Claude API (urllib)
```

- **Backend language:** Python 3 (xenon has 3.14.4). Standard library only, plus
  **one** production dependency: `gunicorn` (WSGI server). No SDK: the Claude API
  is called via `urllib.request`. SQLite via stdlib `sqlite3`. No ORM, no
  framework, no bundler, no build step.
- **Scanners** shell out to system binaries already present on xenon:
  `nmap`, `snmpwalk`, `snmpget`, `arp-scan`, `ping`, `ip`. **Absent on xenon:**
  `fping`, `lldpctl` — do not use them. LLDP neighbor data is derived from SNMP
  **LLDP-MIB**, not from `lldpctl`.
- **Frontend** is served static and embeds the **pristine** planner `index.html`
  in an iframe, driving it through the documented `window.RackWire` /
  postMessage API. The single-file offline planner core is **never modified** by
  this feature.

### 1.1 Repo layout (authoritative)

```
backend/
  rackwire_discovery/
    __init__.py
    config.py            # env-driven config; secrets by reference only
    const.py             # OIDs, tool paths, timeouts, port fingerprints
    store.py             # SQLite schema + data-access layer (prepared statements)
    wsgi.py              # WSGI app + minimal router (stdlib only)
    scan/
      __init__.py
      arp.py             # arp-scan / `ip neigh` → MAC↔IP
      ping.py            # ICMP sweep (liveness)
      portscan.py        # nmap -sV -O → open services + OS guess
      snmp.py            # snmpwalk/snmpget wrappers (system + ifTable + LLDP-MIB)
      lldp.py            # neighbor derivation from SNMP LLDP-MIB
      oui.py             # offline MAC→vendor lookup (ported OUI table)
      orchestrator.py    # runs a full scan across a subnet, writes to store
    infer/
      __init__.py
      deterministic.py   # OUI + SNMP-MIB + LLDP + port fingerprints → classification
      claude.py          # Claude API (urllib) for unknown/low-confidence devices
      mapper.py          # inferred device → RackWire group-schema payload
    api/
      __init__.py
      routes.py          # HTTP handlers, mounted by wsgi router
  tests/                 # pytest; unit tests per module + fixtures (no live network)
  requirements.txt       # gunicorn (prod); pytest (dev, commented)
deploy/
  rackwire-discovery.service   # systemd unit (gunicorn, dedicated user)
  rackwire.akoria.net.conf     # Apache vhost (clone of solarinet.conf pattern)
  install.sh                   # idempotent deploy helper (setcaps the scanners)
  gen-cert.sh                  # self-signed TLS cert for the vhost
  discovery.env.example        # environment template (secrets filled on host)
web/
  index.html            # discovery console shell (iframes the planner)
  discover.js           # console logic (browser JS — permitted client-side)
  discover.css
docs/
  DISCOVERY-DESIGN.md   # this file
  DISCOVERY.md          # comprehensive user + operator documentation
```

---

## 2. Data model (SQLite)

Stdlib `sqlite3`. WAL mode. **Every** write uses parameterized statements — no
string interpolation into SQL, ever. Migrations are idempotent
(`CREATE TABLE IF NOT EXISTS`, guarded `ALTER`). Soft deletes (`deleted_at`), and
provenance columns on every discovered row.

House convention: **camelCase for Python identifiers**; SQL **column** names stay
`snake_case` (SoR precedent, and it keeps SQL readable). `store.py` is the only
module that speaks SQL.

### 2.1 Tables

```
scanRun
  id INTEGER PK
  started_at   TEXT (ISO8601)   finished_at TEXT NULL
  subnet       TEXT             # CIDR scanned
  status       TEXT             # running|done|error|cancelled
  initiated_by TEXT             # operator identity (session)
  options_json TEXT             # scan options as sent
  note         TEXT NULL
  error        TEXT NULL

device
  id INTEGER PK
  first_seen TEXT   last_seen TEXT
  mac        TEXT NULL   ip TEXT NULL   hostname TEXT NULL
  vendor     TEXT NULL              # from OUI
  os_guess   TEXT NULL              # from nmap
  sys_descr  TEXT NULL   sys_object_id TEXT NULL
  snmp_ok    INTEGER DEFAULT 0
  classification TEXT NULL          # e.g. "switch","ap","server","pdu","camera",...
  role       TEXT NULL              # RackWire role hint
  confidence REAL NULL              # 0..1
  source     TEXT NULL              # deterministic|claude|manual
  status     TEXT DEFAULT 'discovered'   # discovered|confirmed|rejected|imported
  raw_json   TEXT                   # merged observed facts
  provenance TEXT                   # how this row was produced
  deleted_at TEXT NULL

port                                # physical/logical interfaces (SNMP ifTable)
  id INTEGER PK   device_id INTEGER FK
  if_index INTEGER   if_name TEXT   if_descr TEXT NULL
  if_speed_mbps INTEGER NULL        # from ifHighSpeed/ifSpeed
  admin_status TEXT NULL   oper_status TEXT NULL
  phys_mac TEXT NULL   poe INTEGER DEFAULT 0
  raw_json TEXT

openService                         # from nmap -sV
  id INTEGER PK   device_id INTEGER FK
  port INTEGER   proto TEXT   service TEXT NULL
  product TEXT NULL   version TEXT NULL   banner TEXT NULL

neighbor                            # LLDP adjacency (from SNMP LLDP-MIB)
  id INTEGER PK   device_id INTEGER FK     # local device
  local_port TEXT NULL
  remote_chassis_id TEXT NULL   remote_port_id TEXT NULL
  remote_sys_name TEXT NULL     remote_sys_descr TEXT NULL
  remote_caps TEXT NULL   source TEXT DEFAULT 'lldp'

inference                           # every inference attempt, auditable
  id INTEGER PK   device_id INTEGER FK
  engine TEXT       # deterministic|claude
  model  TEXT NULL  # claude model id when engine=claude
  input_json TEXT   # facts fed in
  output_json TEXT  # structured result
  created_at TEXT
  accepted INTEGER DEFAULT 0   accepted_by TEXT NULL   accepted_at TEXT NULL

importMap                           # confirmed device → planner group payload
  id INTEGER PK   device_id INTEGER FK
  group_json TEXT   imported_at TEXT
```

`store.py` exposes a camelCase DAL, e.g. `createScanRun(...)`, `upsertDevice(...)`,
`addPort(...)`, `addNeighbor(...)`, `recordInference(...)`, `setDeviceStatus(...)`,
`listDevices(filter)`, `getDeviceDetail(id)`. No handler touches the DB directly.

---

## 3. Scanner contracts (`scan/`)

Every scanner is a **pure-ish function**: input is a target (IP / CIDR / list) and
options; output is a list of plain dicts. Scanners **do not** write to the DB —
the orchestrator persists. Every argument crossing into a shell is passed as an
**argv list** to `subprocess.run` (never a shell string); no `shell=True`, ever.
Timeouts are mandatory on every subprocess call. A tool that is missing or errors
degrades gracefully (empty result + logged warning), never crashes the run.

| Module | Entry point | Tool | Returns (per device) |
|---|---|---|---|
| `arp.py` | `sweepArp(cidr, opts)` | `arp-scan` / `ip neigh` | `{ip, mac}` |
| `ping.py` | `sweepPing(cidr, opts)` | `ping` (parallelized) | `{ip, alive, rttMs}` |
| `portscan.py` | `scanHost(ip, opts)` | `nmap -sV -O --top-ports N -T4 --host-timeout Ss -oX -` | `{ip, osGuess, services[], ...}` |
| `snmp.py` | `querySystem(ip, cred)`, `queryIfTable(ip, cred)`, `queryLldp(ip, cred)` | `snmpget`/`snmpwalk` | system dict / port list / neighbor list |
| `lldp.py` | `neighbors(ip, cred)` | (via `snmp.py`) | `[{localPort, remote*}]` |
| `oui.py` | `vendorFor(mac)` | offline table | `str|None` |

### 3.1 SNMP OIDs (ported from SolariNet C sources — duplicated, not called)

```
System:
  sysDescr        .1.3.6.1.2.1.1.1.0
  sysObjectID     .1.3.6.1.2.1.1.2.0
  sysName         .1.3.6.1.2.1.1.5.0
ifTable / ifXTable:
  ifName          .1.3.6.1.2.1.31.1.1.1.1
  ifDescr         .1.3.6.1.2.1.2.2.1.2
  ifSpeed         .1.3.6.1.2.1.2.2.1.5
  ifHighSpeed     .1.3.6.1.2.1.31.1.1.1.15
  ifOperStatus    .1.3.6.1.2.1.2.2.1.8
  ifAdminStatus   .1.3.6.1.2.1.2.2.1.7
  ifPhysAddress   .1.3.6.1.2.1.2.2.1.6
LLDP-MIB (remote table .1.0.8802.1.1.2.1.4.1.1.N):
  remChassisSub   .1.0.8802.1.1.2.1.4.1.1.4   remChassisId  .1.0.8802.1.1.2.1.4.1.1.5
  remPortSub      .1.0.8802.1.1.2.1.4.1.1.6   remPortId     .1.0.8802.1.1.2.1.4.1.1.7
  remPortDesc     .1.0.8802.1.1.2.1.4.1.1.8   remSysName    .1.0.8802.1.1.2.1.4.1.1.9
  remSysDesc      .1.0.8802.1.1.2.1.4.1.1.10  remSysCap     .1.0.8802.1.1.2.1.4.1.1.12
  locPortId       .1.0.8802.1.1.2.1.3.7.1.3
```

SNMP credentials come from config (community string for v2c; v3 user/auth/priv
where available). Default is v2c community `public` read-only, overridable per
run. Never log the community string / v3 secret.

### 3.2 Orchestrator (`orchestrator.py`)

`runScan(cidr, opts, store)` sequences a full run and streams progress into
`scanRun`/`device`:

1. `arp` + `ping` → liveness set (union).
2. For each live host, in a bounded thread pool: `portscan` + `snmp.querySystem`.
3. For SNMP-capable hosts: `queryIfTable` (ports) + `queryLldp` (neighbors).
4. `oui.vendorFor` on every MAC.
5. `infer.deterministic.classify(device)` on every device → writes classification.
6. Persist; mark run `done`.

Concurrency is bounded (default 32 hosts in flight; configurable). The run is
cancellable (status flips to `cancelled`, in-flight work drains). No unbounded
fan-out.

---

## 4. Inference (`infer/`)

### 4.1 Deterministic first (`deterministic.py`)

`classify(deviceFacts) -> {classification, role, confidence, signals[]}` using, in
order: OUI vendor → sysObjectID / sysDescr pattern table → LLDP system
capabilities → open-port fingerprints (const table: 22→host, 161→snmp,
80/443→web/appliance, 623→BMC, 9100→printer, etc.). Confidence reflects how many
independent signals agree. **No network I/O in this module** — it consumes already
gathered facts.

### 4.2 Claude for unknowns (`claude.py`)

Invoked only when deterministic confidence < threshold (default 0.6) **or** the
operator explicitly requests it. Contract:

- `infer(deviceFacts) -> {classification, role, portsGuess, gbps, watts, amps, poe, rationale, confidence}`.
- HTTP via `urllib.request` to the Anthropic Messages API. Model:
  `claude-sonnet-5` (fast, cheap, sufficient for classification); operator may
  override to a stronger model in config.
- `ANTHROPIC_API_KEY` is read from the **environment** (systemd `EnvironmentFile`,
  chmod 600, never in git, never logged). If absent, `claude.py` returns `None`
  and the system degrades to deterministic-only with a logged notice — it never
  hard-fails.
- The prompt is a structured summary of observed facts (vendor, sysDescr,
  open services, port speeds, neighbors). The response is forced to structured
  JSON and validated before storage. Raw prompt/response stored in `inference`
  for audit.
- **Every** inference — deterministic or Claude — is advisory. Nothing enters a
  plan without human confirmation (§5).

### 4.3 Mapper (`mapper.py`)

`toGroup(device) -> groupPayload` converts a **confirmed** device into a RackWire
device-library group entry per the HANDOFF §6 schema: `{k, label, glyph, count,
rows, role, gbps, watts, amps, volts, poe, poeW, domain, conn}`. `domain` derives
from classification (switch/router → net; PDU/UPS → power; hub/dock → usb; else
other). Bandwidth/power fields come from SNMP where measured, inference where not;
inferred values are flagged so the operator sees what is measured vs guessed.

---

## 5. Human-in-the-loop (non-negotiable)

A discovered device is `discovered` until a human acts:

- **Confirm** → `confirmed`: the operator accepts the classification (optionally
  after editing). Only `confirmed` devices are eligible for plan import.
- **Reject** → `rejected`: hidden from import, retained for audit.
- **Import** → `imported`: mapper builds the group payload, and the console pushes
  it to the planner iframe via the host API.

There is **no** auto-import path. Inference proposes; the operator disposes.

---

## 6. HTTP API (`api/routes.py`)

All under `/api/discovery/`. JSON in/out. **Every mutating request (POST) requires
auth + CSRF** (§7). Read endpoints require the session. Errors return a JSON
`{error, detail}` with a correct status code — never a bare 500 with a stack
trace to the client (stack goes to the log).

| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/discovery/health` | liveness + tool-availability report |
| POST | `/api/discovery/scan` | start a run `{subnet?, options?}` → `{runId}` |
| GET  | `/api/discovery/scan/{id}` | run status + progress |
| GET  | `/api/discovery/scans` | list runs |
| POST | `/api/discovery/scan/{id}/cancel` | cancel a running scan |
| GET  | `/api/discovery/devices` | list devices `?run=&status=` |
| GET  | `/api/discovery/devices/{id}` | detail: ports, services, neighbors, inferences |
| POST | `/api/discovery/devices/{id}/infer` | run/refresh inference `{useClaude?}` |
| POST | `/api/discovery/devices/{id}/confirm` | accept classification (body may edit) |
| POST | `/api/discovery/devices/{id}/reject` | reject |
| POST | `/api/discovery/plan/build` | build planner payload from confirmed devices `{deviceIds?}` → `{groups[], links[]}` |
| GET  | `/api/discovery/topology` | `{nodes[], edges[]}` from neighbors |

`plan/build` returns a payload shaped for the documented host API; the console
sends it into the iframe via `RackWire.setPlan(...)` / `RackWire.patch(...)`.
The backend never mutates the planner's localStorage or file — it only hands the
frontend a payload.

---

## 7. Security posture

Least privilege, conservative defaults, auditable. Concretely:

- **Shell safety:** argv-list subprocess calls only; no `shell=True`; mandatory
  timeouts; tool paths from `const.py` (absolute), not `$PATH` surprises.
- **SQL:** parameterized statements exclusively.
- **Auth gate on every mutation.** For the xenon deployment now: a same-origin
  session with a server-issued token (from an env secret) gates all POSTs; a
  double-submit **CSRF** token is required on every state-changing request. The
  planner contract (CONTRACT-RW D10) already flags CSRF as mandatory before public
  ship — this module implements it from day one.
- **Secrets by reference:** `ANTHROPIC_API_KEY`, SNMP credentials, and the session
  secret live in a chmod-600 `EnvironmentFile`, never in git, never logged.
- **Scan authorization:** discovery only scans operator-owned ranges configured in
  `config.py`. Default subnet is derived from the host's own interface, not the
  whole internet. This is authorized homelab network administration.
- **Privilege for raw sockets:** `nmap -O` and `arp-scan` need raw-socket
  capability. `deploy/install.sh` grants it as a **narrow** Linux file
  capability (`setcap cap_net_raw+ep`) on exactly those two binaries — not
  blanket root. The gunicorn service otherwise runs as an unprivileged
  dedicated user, and degrades gracefully if the capability is absent.
- **Hardening backlog (flagged for public deploy, not blocking xenon):** full
  multi-user auth, rate limiting on scan endpoints, per-operator scope, audit
  export. Documented in `docs/DISCOVERY.md`.

---

## 8. Deployment (xenon)

- **DNS:** add `rackwire IN CNAME xenon` to `db.akoria.net`; bump the zone serial.
- **Vhost:** `rackwire.akoria.net` Apache `:443` SNI vhost cloning
  `solarinet.conf`: `DocumentRoot /var/www/rackwire` for static (`web/` + the
  planner), `<LocationMatch "^/api/discovery/">` reverse-proxying to the gunicorn
  socket/port on 127.0.0.1. `Header always set X-Frame-Options "SAMEORIGIN"`.
- **TLS:** certificate for `rackwire.akoria.net` (same mechanism as the dashboard
  cert under `/etc/ssl/`).
- **Service:** `rackwire-discovery.service` runs gunicorn as a dedicated
  unprivileged user, `EnvironmentFile=/etc/rackwire/discovery.env` (600), bound to
  localhost. `Restart=on-failure`.
- **This is authorized** — the operator granted an explicit feature-freeze carve-out
  to deploy discovery to xenon now, moving to dedicated hardware later. Core code
  must **not** assume a container runtime (engineering doctrine); systemd + gunicorn
  on the host is the baseline.

---

## 9. Invariants the planner core keeps (do not break)

Discovery must not touch any of these in `index.html`:
`window.RackWire` API surface (24 keys), the postMessage schema
(`{source:'rackwire', cmd, args}`), the `rackwire.project.v2` localStorage key, CSV
headers, `migrate()` / `DEV_FIELDS` / `GROUP_FIELDS`, and the device-library group
schema. The console integrates **through** these, never around them. The planner's
three-way contract (file:// offline, same-origin http, iframe embed) stays intact:
the discovery console is a *new* page that embeds the planner; the planner file is
shipped byte-for-byte as-is.

---

## 10. Verification gates (definition of done)

1. Backend unit tests pass (pytest), scanners tested against captured fixtures (no
   live network in CI).
2. A real authorized scan of a local subnet discovers devices, populates ports /
   services / neighbors, and produces deterministic classifications.
3. Claude inference exercised on at least one unknown device; result stored,
   auditable, and gated behind confirm.
4. Console: scan → review → confirm → import round-trips a device into the planner
   iframe via the host API, with the planner file unmodified (checksum unchanged).
5. Cross-lab review (Codex/GPT) of all newly authored code, findings resolved.
6. Deployed to `rackwire.akoria.net`, health endpoint green, TLS valid, smoke test
   passes.
7. `docs/DISCOVERY.md` complete (user + operator + hardening backlog).
