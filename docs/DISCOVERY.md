# RackWire Discovery — User & Operator Documentation

`v0.1.0 · 2026-08-12 · companion to DISCOVERY-DESIGN.md (the build contract)`

RackWire Discovery scans an operator-authorized network, infers what each
discovered device is, and — only after explicit human confirmation — maps
devices into the RackWire planner as device-library groups. This document is
the operating manual: what it does, how to run it, how to configure it, the
full HTTP API, and the security posture including the hardening backlog for
public deployment.

---

## 1. Overview

Discovery is a small Python 3.14 backend (stdlib only, plus `gunicorn` as the
WSGI server) that:

1. **Scans** a subnet with system tools (`arp-scan`, `ping`, `nmap`,
   `snmpget`/`snmpwalk`) to find live hosts and gather facts.
2. **Infers** what each host is — deterministically first (OUI vendor, SNMP
   sysDescr/sysObjectID, LLDP capabilities, open-port fingerprints), and
   optionally via the Claude API for low-confidence unknowns.
3. **Waits for a human.** Every device sits in `discovered` status until the
   operator confirms or rejects it. There is no auto-import path.
4. **Maps** each confirmed device into a full gear-library model (make, model,
   kind, ports, draw) that the operator validates in the planner's **Discover
   devices on the network…** panel; on save it is written to the gear library
   and placed into the current layout with its management IP already attached.

> **Architecture note (2026-08).** Discovery began as a separate `/discover/`
> console that iframed the planner. That subapp was retired: discovery is now a
> **feature inside the planner itself**, reached from the main menu, talking to
> the backend over its own `/api/discovery` client. The backend HTTP API below
> is unchanged; only the front end moved.

### 1.1 Independence constraint (hard rule)

RackWire is a standalone product headed for external, public-facing
deployment. Discovery therefore runs its **own full scanner stack** and:

- **Never** reads the SolariNet System-of-Record.
- **Never** calls SolariNet services over HTTP or otherwise.
- **Never** shares a database with SolariNet.

Logic was *duplicated* from SolariNet sources (SNMP OID tables, nmap
invocation patterns, OUI vendor data) — live coupling is forbidden. If you
find yourself wanting a SolariNet lookup, port the data instead.

---

## 2. Architecture

```
                     rackwire.akoria.net  (Apache :443, SNI vhost on xenon)
                      │
        ┌─────────────┴──────────────┐
   static planner                /api/discovery/*  ──reverse proxy──▶  gunicorn (127.0.0.1:8785)
   index.html (Discover panel                                         rackwire_discovery WSGI app
   calls /api/discovery directly)                                         │
                                                         ┌────────────────┼───────────────────┐
                                                      scan/            infer/               store.py
                                                  subprocess to     deterministic +        SQLite (stdlib)
                                                  system tools      Claude API (urllib)
```

Key properties:

- **No framework, no ORM, no build step.** Stdlib WSGI router, stdlib
  `sqlite3` (WAL mode, parameterized statements only), Claude via
  `urllib.request` — no SDK.
- **Scanners never touch the DB.** They take a target + config and return
  plain dicts; `scan/orchestrator.py` persists through `store.py`, the only
  module that speaks SQL.
- **Subprocess discipline:** argv-list calls only, absolute tool paths from
  `const.py`, mandatory timeouts, graceful degradation when a tool is missing
  (logged warning + empty result, never a crash).
- **The planner's public contracts are untouched.** Discovery now lives inside
  `index.html` (a menu item, a modal, and a small `/api/discovery` client), so
  the file is no longer byte-for-byte identical to the pristine planner — but
  the three sacred surfaces are preserved unchanged: the `window.RackWire` host
  API, the postMessage schema, and the `rackwire.project.v2` storage/CSV/schema
  contract. The discovery client uses a **separate** envelope and CSRF scheme on
  `/api/discovery`; it never touches the SolariNet SoR contract.

Repo layout, table schemas, and module contracts are authoritative in
`docs/DISCOVERY-DESIGN.md` §1–§4.

---

## 3. How a scan works

`POST /api/discovery/scan` creates a `scanRun` row and launches a background
worker thread; the request returns immediately with a `runId`. The
orchestrator then sequences:

| Stage | Tool | What it surfaces |
|---|---|---|
| **ARP sweep** (`scan/arp.py`) | `arp-scan` (falls back to `ip neigh`) | MAC↔IP pairs on the local segment — the fastest, most reliable liveness signal for L2-adjacent hosts. |
| **Ping sweep** (`scan/ping.py`) | `ping` (parallelized, 4 s timeout each) | Liveness + RTT for hosts that answer ICMP, including ones ARP cannot see (routed segments). The live set is the **union** of ARP and ping hits. |
| **Port/OS scan** (`scan/portscan.py`) | `nmap -sV -O --top-ports 200 -T4 -oX -` per live host (180 s host timeout) | Open TCP services with product/version banners, plus an OS guess. Feeds the port-fingerprint classifier. |
| **SNMP system** (`scan/snmp.py`) | `snmpget` (15 s timeout) | `sysDescr`, `sysObjectID`, `sysName` — the strongest single classification signal when a host answers. |
| **SNMP ifTable** (`scan/snmp.py`) | `snmpwalk` | Interface inventory: names, descriptions, speeds (`ifHighSpeed`/`ifSpeed`), admin/oper status, physical MACs → the `port` table. |
| **LLDP neighbors** (`scan/lldp.py`) | `snmpwalk` of **LLDP-MIB** (there is no `lldpctl` on xenon) | Adjacency: local port ↔ remote chassis/port/sysName/capabilities → the `neighbor` table and the topology view. |
| **OUI lookup** (`scan/oui.py`) | offline ported table | MAC → vendor string, no network I/O. |

Per-host work runs in a bounded thread pool (default 32 in flight,
`RACKWIRE_HOST_CONCURRENCY`). Runs are cancellable: `POST .../cancel` sets an
event flag, in-flight work drains, and the run finishes as `cancelled`. After
persistence, a deterministic classification pass runs over every device and
the run is marked `done` (or `error` with the message recorded).

**Scan authorization:** a requested subnet must fall inside
`RACKWIRE_ALLOWED_SUBNETS` or the API returns `403 subnet_forbidden`. An
omitted subnet defaults to the host's own interface network — never anything
wider — but that derived network must still be allowlisted. An empty allowlist
denies all scans.

---

## 4. Inference: deterministic vs Claude

### 4.1 Deterministic (always on)

`infer/deterministic.py` consumes already-gathered facts (no network I/O) and
applies, in order: OUI vendor → sysObjectID/sysDescr pattern table → LLDP
system capabilities → open-port fingerprints (`const.PORT_FINGERPRINTS`, e.g.
22→host, 623→BMC, 9100→printer, 554→camera). Confidence (0–1) reflects how
many independent signals agree.

### 4.2 Claude (opt-in, degradable)

`infer/claude.py` calls the Anthropic Messages API via `urllib.request` —
model `claude-sonnet-5` by default. It runs only when **both** are true:

- Claude is enabled (see below), **and**
- the operator requested it (`{"useClaude": true}` on the infer endpoint)
  **or** deterministic confidence is below the threshold (0.6,
  `const.CONFIDENCE_THRESHOLD`).

The prompt is a structured summary of observed facts; the response is forced
to structured JSON and validated before storage. Every attempt — engine,
model, input, output — lands in the `inference` table for audit. If the call
fails or the key is absent, Claude returns `None` and the system degrades to
deterministic-only with a logged notice; it never hard-fails a request.

**Enabling Claude** requires two things in the service environment
(`/etc/rackwire/discovery.env`, chmod 600):

```ini
ANTHROPIC_API_KEY=sk-ant-...        # secret; never in git, never logged
RACKWIRE_CLAUDE_ENABLED=1
```

Both are required: `claudeEnabled` is true only when the flag is set **and**
a key is present. `GET /api/discovery/health` reports the effective state.

**All inference is advisory.** No inference result changes device status; a
human confirms every classification before it can reach a plan (§5).

---

## 5. Human-in-the-loop confirm flow

A device's lifecycle: `discovered → confirmed | rejected → imported`.

1. **Review.** The planner's Discover panel lists discovered devices. Selecting
   one first calls `POST /devices/{id}/infer` and then
   `GET /devices/{id}/candidate`, which returns a **recommended
   gear-library model** (make, model, kind, ports, draw) built by the mapper
   from the best available inference (Claude when enabled, else deterministic),
   plus a match against any existing library model and a provenance badge.
2. **Validate.** The operator edits the recommended name, vendor, model, kind,
   draw, and primary port group in place — filling gaps the scan could not see.
   When Claude is disabled the recommendation is deterministic and the operator
   simply sets make/model by hand; the flow degrades gracefully.
3. **Save + place** (`POST /library`) — the validated model is written to the
   gear library (a full device definition, `disc-<vendor-model>` id), merged
   into the in-memory library, and an instance is added to the current layout
   with the discovered management IP attached as `mgmtIp`/`liveKey`. The device
   is marked `confirmed` (`POST /devices/{id}/confirm`).
   *Alternatively* the operator picks an existing library model to **associate**
   with instead of saving a new one — same placement, no new definition. In
   either path `POST /devices/{id}/associate` durably records the selected
   library id with operator/timestamp provenance and advances the device to
   terminal `imported`; placement fails closed if that write does not succeed.
4. **Dismiss** (`POST /devices/{id}/reject`) — hidden from the queue, retained
   for audit (soft delete semantics; nothing is destroyed).

The backend never touches the planner's localStorage or file, and there is
**no** auto-import path anywhere in the system.

> The legacy `POST /plan/build` endpoint (bulk group payload for the retired
> console) still exists and is unchanged; the in-planner flow uses the
> per-device `/candidate` + `/library` endpoints instead.

---

## 6. Configuration reference

All configuration is environment-driven (`config.py`), read once at startup
into a frozen `Config`. In production the variables live in the systemd
`EnvironmentFile` `/etc/rackwire/discovery.env` (mode 600).

| Variable | Default | Meaning |
|---|---|---|
| `RACKWIRE_DB_PATH` | `/var/lib/rackwire/discovery.db` | SQLite database location. |
| `RACKWIRE_ALLOWED_SUBNETS` | *(empty)* | Comma-separated CIDR ranges the operator authorizes for scanning. Requests outside these are refused (403). **Empty denies every scan**, including an omitted-subnet request whose host-local default was derived. Configure at least one range to enable discovery. |
| `RACKWIRE_SNMP_COMMUNITY` | `public` | SNMP v2c read community. Secret — never logged. |
| `RACKWIRE_SNMP_VERSION` | `2c` | SNMP version (`2c` or `3`). |
| `RACKWIRE_SNMP_V3_USER` | *(empty)* | SNMPv3 username. |
| `RACKWIRE_SNMP_V3_AUTHPROTO` | *(empty)* | SNMPv3 auth protocol (e.g. `SHA`). |
| `RACKWIRE_SNMP_V3_AUTHKEY` | *(empty)* | SNMPv3 auth key. Secret. |
| `RACKWIRE_SNMP_V3_PRIVPROTO` | *(empty)* | SNMPv3 privacy protocol (e.g. `AES`). |
| `RACKWIRE_SNMP_V3_PRIVKEY` | *(empty)* | SNMPv3 privacy key. Secret. |
| `ANTHROPIC_API_KEY` | *(empty)* | Anthropic API key. Empty ⇒ Claude inference disabled regardless of the flag below. Secret. |
| `RACKWIRE_CLAUDE_ENABLED` | `0` (off) | Truthy (`1`/`true`/`yes`/`on`) to enable Claude inference. Effective only when a key is also present. |
| `RACKWIRE_CLAUDE_MODEL` | `claude-sonnet-5` | Claude model id; override to a stronger model if classification quality demands it. |
| `RACKWIRE_SESSION_SECRET` | *(empty)* | Secret gating mutating requests (session + CSRF). Empty ⇒ a random secret is generated at startup — fine for single-process dev, **wrong for multi-worker gunicorn**: set it explicitly in production so all workers agree. Secret. |
| `RACKWIRE_BIND_HOST` | `127.0.0.1` | WSGI bind address (behind the Apache reverse proxy — keep it loopback). |
| `RACKWIRE_BIND_PORT` | `8785` | WSGI bind port. |
| `RACKWIRE_HOST_CONCURRENCY` | `32` | Max hosts in flight during a scan run. |

Fixed operational constants (tool paths, subprocess timeouts, OIDs, port
fingerprints, the 0.6 confidence threshold) live in `const.py` and are not
environment-tunable by design.

---

## 7. HTTP API reference

Base: `https://rackwire.akoria.net/api/discovery/` (Apache reverse-proxies to
gunicorn on loopback). JSON in/out. Every **POST** requires the same-origin
session plus a double-submit **CSRF token** (obtain one from `/health`, send
it back per the console's header convention). Errors are JSON
`{"error", "detail"}` with a correct status code; stack traces go to the log,
never to the client.

### GET `/api/discovery/health`

Liveness, tool availability, Claude state, and a fresh CSRF token.

```
GET /api/discovery/health

200 {
  "status": "ok",
  "version": "0.1.0",
  "tools": {"nmap": true, "arp-scan": true, "snmpwalk": true, "ping": true},
  "claudeEnabled": false,
  "csrf": "8f3a…"
}
```

### POST `/api/discovery/scan`

Start a run. Body: `{subnet?, options?}`. An omitted subnet uses the derived
host-local default; a supplied subnet must be inside the authorized ranges.

```
POST /api/discovery/scan
{"subnet": "10.20.0.0/24", "options": {}}

201 {"runId": 7, "subnet": "10.20.0.0/24", "status": "running"}
403 {"error": "subnet_forbidden", "detail": "192.0.2.0/24 is outside authorized ranges"}
400 {"error": "no_subnet", "detail": "could not derive a local subnet; specify one"}
```

### GET `/api/discovery/scans`

List all runs. → `200 {"scans": [{...scanRun rows...}]}`

### GET `/api/discovery/scan/{id}`

Run status + progress.

```
200 {"scan": {"id": 7, "subnet": "10.20.0.0/24", "status": "done",
              "started_at": "2026-08-12T15:04:05Z", "finished_at": "…", ...}}
404 {"error": "not_found", "detail": "scan run"}
```

### POST `/api/discovery/scan/{id}/cancel`

Signal a running scan to stop; in-flight host work drains.

```
200 {"runId": 7, "status": "cancelling"}
404 {"error": "not_found", "detail": "no running scan"}
```

### GET `/api/discovery/devices`

List devices. Query: `?status=discovered|confirmed|rejected|imported`
(omit for all).

```
200 {"devices": [{"id": 12, "ip": "10.20.0.5", "mac": "9c:05:…",
                  "vendor": "Ubiquiti", "classification": "switch",
                  "role": "access-switch", "confidence": 0.85,
                  "source": "deterministic", "status": "discovered", ...}]}
```

### GET `/api/discovery/devices/{id}`

Full detail: the device row plus `ports` (ifTable), `services` (nmap),
`neighbors` (LLDP), `inferences` (full audit history), and the active durable
`association`/`libraryId` when a model has been selected.

```
200 {"device": {"id": 12, ..., "ports": [...], "services": [...],
                "neighbors": [...], "inferences": [...],
                "libraryId": "core-switch-48", "association": {...}}}
404 {"error": "not_found", "detail": "device"}
```

### POST `/api/discovery/devices/{id}/infer`

Run/refresh inference. Body: `{useClaude?}`. Deterministic always runs;
Claude runs when requested-and-enabled, or when deterministic confidence is
below 0.6 and Claude is enabled. Does **not** change device status.

```
POST /api/discovery/devices/12/infer
{"useClaude": true}

200 {
  "deterministic": {"classification": "switch", "role": "access-switch",
                    "confidence": 0.85, "signals": ["oui", "sysDescr"]},
  "claude": {"classification": "switch", "role": "access-switch",
             "portsGuess": 24, "gbps": 1, "watts": 25, "poe": true,
             "rationale": "…", "confidence": 0.9}
}
```

`"claude": null` when Claude is disabled, not triggered, or the call failed
(degraded gracefully).

### POST `/api/discovery/devices/{id}/confirm`

Accept the classification; body may override `classification`/`role`
(recorded with source `manual`). Marks the device `confirmed`.

```
POST /api/discovery/devices/12/confirm
{"classification": "switch", "role": "core-switch"}

200 {"deviceId": 12, "status": "confirmed"}
```

### POST `/api/discovery/devices/{id}/reject`

```
200 {"deviceId": 12, "status": "rejected"}
```

### GET `/api/discovery/devices/{id}/candidate`

Build the editable planner-library recommendation from the newest stored
inference. The UI calls `/infer` immediately before this request, so this is a
fresh Claude result when available and the fresh deterministic result when
Claude is disabled or fails.

```
200 {"candidate": {"id": "disc-acme-sw-24", "vendor": "ACME",
                    "model": "SW-24", "groups": [...]},
     "recommendation": {"source": "claude", "confidence": 0.86, ...},
     "match": null}
```

### POST `/api/discovery/devices/{id}/associate`

Body: `{libraryId}`. Persist the operator-selected built-in or discovery
library definition and mark the device `imported`. Repeating the same request
is idempotent; choosing a different model soft-deletes the prior association
for audit.

```
POST /api/discovery/devices/12/associate
{"libraryId": "core-switch-48"}

200 {"deviceId": 12, "libraryId": "core-switch-48", "status": "imported",
     "association": {...}}
```

### GET/POST `/api/discovery/library`

`GET` lists the server-backed planner definitions. `POST` validates and stores
one. The server ignores any client-supplied `id`, derives
`disc-<vendor-model>` from the edited identity, returns `409` if that slug is
already owned by a different identity, and rejects unsafe port/power geometry
with `400` (including group count outside `1..512`, rows outside `1..count`,
or more than 64 groups).

### POST `/api/discovery/plan/build`

Build the planner payload from confirmed devices. Body: `{deviceIds?}`
(default: all confirmed). Marks the included devices `imported`.

```
POST /api/discovery/plan/build
{"deviceIds": [12, 14]}

200 {"groups": [{"k": "sw-core", "label": "Core Switch", "glyph": "…",
                 "count": 1, "rows": 1, "role": "core-switch", "gbps": 1,
                 "watts": 25, "amps": null, "volts": null, "poe": true,
                 "poeW": 180, "domain": "net", "conn": "rj45"}],
     "links": [{"a": "sw-core", "b": "ap-attic", "via": "lldp"}]}
```

### GET `/api/discovery/topology`

Nodes + edges from LLDP neighbor data for the console's topology view.

```
200 {"nodes": [{"id": 12, "ip": "10.20.0.5", "name": "sw-core",
               "classification": "switch"}],
     "edges": [...]}
```

---

## 8. Operator runbook (xenon)

### Service control

```sh
sudo systemctl start rackwire-discovery.service
sudo systemctl stop rackwire-discovery.service
sudo systemctl restart rackwire-discovery.service     # after env changes
sudo systemctl status rackwire-discovery.service
sudo systemctl enable rackwire-discovery.service      # start at boot
```

The unit runs gunicorn as a dedicated unprivileged user, bound to
`127.0.0.1:8785`, with `EnvironmentFile=/etc/rackwire/discovery.env` (600)
and `Restart=on-failure`.

### Logs

```sh
journalctl -u rackwire-discovery.service -f            # follow
journalctl -u rackwire-discovery.service --since -1h   # recent
```

Loggers are namespaced `rackwire.discovery.<area>` (e.g.
`rackwire.discovery.scan`, `rackwire.discovery.infer`). Secrets never appear
in log lines.

### Run a scan from the CLI

```sh
# 1. Health check + grab a CSRF token
curl -s https://rackwire.akoria.net/api/discovery/health

# 2. Start a scan (session cookie + CSRF token per console convention)
curl -s -X POST https://rackwire.akoria.net/api/discovery/scan \
  -H 'Content-Type: application/json' \
  -H 'X-CSRF-Token: <token>' \
  -b '<session cookie>' \
  -d '{"subnet": "10.20.0.0/24"}'

# 3. Poll
curl -s https://rackwire.akoria.net/api/discovery/scan/7
```

The normal path is the discovery console at `https://rackwire.akoria.net/`,
which handles session/CSRF for you.

### Authorize subnets

Edit `/etc/rackwire/discovery.env`:

```ini
RACKWIRE_ALLOWED_SUBNETS=10.20.0.0/24,192.168.50.0/24
```

then `sudo systemctl restart rackwire-discovery.service`. Only scan networks
you own or administer — discovery enforces the allowlist, but the allowlist
is your statement of authorization. Leaving `RACKWIRE_ALLOWED_SUBNETS` empty
is fail-closed: all scan requests are denied.

---

## 9. Security posture

Current posture (xenon, single-operator homelab deployment):

- **Shell safety:** argv-list `subprocess.run` only; no `shell=True`; every
  call carries a timeout; absolute tool paths from `const.py` so a poisoned
  `$PATH` cannot substitute a binary.
- **SQL:** parameterized statements exclusively; `store.py` is the only
  module that speaks SQL.
- **Auth gate on every mutation:** same-origin session with a server-issued
  token (from `RACKWIRE_SESSION_SECRET`) plus an HMAC-signed CSRF token —
  `nonce.issued.mac`, signed with the session secret and time-bounded to
  `CSRF_TTL_SECONDS` (24 h) — submitted in the `X-RackWire-CSRF` custom
  header on every POST. The signature and header requirement together defeat
  forgery and simple cross-origin replay. Implemented from day one, not
  deferred.
- **Secrets by reference:** `ANTHROPIC_API_KEY`, SNMP credentials, and the
  session secret live only in the chmod-600 EnvironmentFile. Never in git,
  never in logs, never in API responses.
- **Scan authorization:** the subnet allowlist (§8) refuses out-of-scope
  targets at the API boundary; the default target is the host's own network.
- **Least privilege for raw sockets:** `nmap -O` and `arp-scan` need
  raw-socket capability. `deploy/install.sh` grants it as a Linux file
  capability (`setcap cap_net_raw+ep`) on exactly those two binaries —
  never blanket root. The gunicorn service itself runs unprivileged, and
  degrades gracefully (ping liveness + connect scan + SNMP) if the
  capability is absent. A file cap on `nmap` is a known lateral vector on
  multi-user hosts; it is an accepted trade-off on this single-operator
  homelab and is revisited before any public-facing ship.
- **Loopback bind:** the WSGI app listens on 127.0.0.1 only; Apache
  terminates TLS and reverse-proxies.

### 9.1 HARDENING BACKLOG (required before public deployment)

These are flagged, not blocking the xenon homelab deployment. **All of them
block a public-facing ship:**

| Item | Why |
|---|---|
| **Full multi-user auth** | Replace the single same-origin session with real accounts (password + MFA or SSO), per-user sessions, and login auditing. `REMOTE_USER`/`"operator"` provenance is a placeholder. |
| **Rate limiting on scan endpoints** | `POST /scan` launches subprocess fan-out; unthrottled it is a resource-exhaustion and scan-abuse vector. Per-identity and global limits, plus a cap on concurrent runs. |
| **Per-operator scope** | Each operator gets their own authorized-subnet set, and devices/runs are partitioned by owner. Today the allowlist and the data set are global. |
| **Audit export** | Tamper-evident export of scanRun/inference/confirm history for accountability. |
| **CSRF session binding** | The signed CSRF token is currently bound to the session *secret* and a TTL, not to the individual session id. Bind the token to the specific session (and rotate on privilege change) once real per-user sessions land, so a token cannot be lifted between concurrent operators. |

Additional public-ship considerations: tighten CORS/frame policy for the
multi-tenant console, rotateable session secrets, and per-tenant Claude
spend caps.

---

## 10. Troubleshooting

### arp-scan / nmap return nothing (or "permission denied")

Both need raw-socket privileges. Symptoms: ARP sweep empty on a subnet you
know is populated; nmap runs but the OS guess (`-O`) is always missing;
`Operation not permitted` in the journal.

- Verify the file capabilities the installer grants:
  `getcap /usr/bin/nmap /usr/sbin/arp-scan` should report `cap_net_raw=ep`
  on both. `deploy/install.sh` sets these via `setcap`; re-run it if the
  binaries were reinstalled (a package upgrade strips file caps).
- The service degrades gracefully — a failed tool logs a warning and returns
  empty, so a "quiet" scan may really be a privilege problem. Check
  `journalctl -u rackwire-discovery.service | grep -i warn`.
- Confirm the binaries exist at the absolute paths in `const.py`
  (`/usr/bin/nmap`, `/usr/sbin/arp-scan`); a distro that installs them
  elsewhere will look like "tool missing" in `/health`'s `tools` report.

### SNMP-silent hosts

A host that is alive but shows `snmp_ok = 0` and no ports/neighbors:

- Most consumer devices simply don't run an SNMP agent — this is normal;
  classification falls back to OUI + nmap fingerprints.
- Wrong community: the default is `public`; set
  `RACKWIRE_SNMP_COMMUNITY` (or the v3 credentials) to match the device.
- Version mismatch: some gear is v3-only. Set `RACKWIRE_SNMP_VERSION=3`
  and the `RACKWIRE_SNMP_V3_*` variables.
- ACLs: many switches restrict SNMP to a management VLAN or specific source
  IPs — the scan host must be allowed.
- Each SNMP call has a 15 s timeout; silent hosts slow a run but never hang
  it.

### Claude inference is "disabled" / `"claude": null`

- Check `GET /api/discovery/health` → `claudeEnabled`. It is true only when
  **both** `RACKWIRE_CLAUDE_ENABLED` is truthy **and** `ANTHROPIC_API_KEY`
  is non-empty in the service environment. Setting one without the other
  leaves it off.
- After editing `/etc/rackwire/discovery.env`, restart the service — config
  is read once at startup.
- Even when enabled, Claude only fires on request (`{"useClaude": true}`)
  or when deterministic confidence < 0.6.
- A `null` result with Claude enabled means the API call failed (network,
  quota, invalid key) — the failure is logged under
  `rackwire.discovery.infer` and the system continues deterministic-only.

### Scan stuck in `running`

- Check the journal for the worker thread (`scan-<runId>`). A crashed worker
  records status `error` with the message; a genuinely long run is usually
  nmap on many hosts (up to 180 s per host, bounded by
  `RACKWIRE_HOST_CONCURRENCY`).
- Cancel with `POST /api/discovery/scan/{id}/cancel`; in-flight hosts drain
  before the run flips to `cancelled`.
- A service restart mid-run orphans the row in `running`; start a fresh run.
