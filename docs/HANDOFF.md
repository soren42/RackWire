# RackWire — Handoff to Claude Code

A browser-based planner for network, power, and interconnect systems across a
site. Rack layouts are one optional view; plans also cover distributed gear,
circuits, and links between supported devices. Two views: a logical connection
map and a data table. Everything runs client-side today.

**Nothing here needs a rewrite to become real.** Every place that wants live data already
has a defined seam. This document lists the seams, in priority order.

---

## 1. Files

| File | What it is |
|---|---|
| `index.html` | The whole app — template + logic class. Opens directly in a browser. |
| `device-library.js` | `window.RW` — port glyph geometry, cable standards, seeded device definitions, the layout engine. |
| `live-adapter.js` | `window.RWLive` — telemetry transport layer. Contract documented at the top of the file. |
| `support.js` | Runtime shim for the component format. Do not edit. |
| `vendor/` | Vendored React, ReactDOM and Babel, wired through `support.js`'s resource override. |

No build step, no CDN or runtime dependency on the network. The React/ReactDOM/
Babel runtime is vendored in `vendor/` — nothing is fetched from unpkg or any
CDN at runtime. Open the HTML file from disk (`file://`) and it works fully
offline: in that mode the app makes no network calls at all. When served over
HTTP it additionally talks — best-effort, failures silent — to the same-origin
SoR endpoints (`/api/rackwire/library`, `/api/rackwire/plans` at startup) and,
when the live overlay is enabled, polls a telemetry URL.

---

## 2. Current integration state

**Real and complete**

- Port-to-port cabling with curve routing around obstacles
- Capacity analysis: link speed negotiation, connector fit, per-standard length limits,
  PoE per-port class and per-switch budget, AC circuit loading at 80% derate,
  adapter pass-through with conversion loss, uplink oversubscription, double-landed ports
- Undo/redo (80 steps), snapshots, CSV and JSON import/export, printable punch list
- Touch canvas: pinch zoom, pan, grid snap, marquee select, group move, racks, notes
- Live-activity rendering: utilization-weighted cable widths, flow animation, carrier dots,
  path-to-internet and on-battery glows, live faults in the punch list
- Host API and postMessage bridge for embedding

**Integrated when embedded in SolariNet**

| Seam | Where | What it does |
|---|---|---|
| Telemetry | `solarinet-rest` in `live-adapter.js` | Polls `/api/rackwire/telemetry` for plan device keys, using the same-origin dashboard session |
| Barcode lookup | `handleCode()` in `index.html` | Calls the operator-gated SoR inventory endpoint with the dashboard session cookie and `X-Solari-CSRF`; refreshes and retries once after a stale token |
| Device library | `mergeLibrary()` in `index.html` | Merges SoR hardware models and saved port groups over the static offline seed without dropping seeded values when SoR fields are null |
| Plan persistence | `load()` / `persist()` in `index.html` | Loads and saves shared plans through the SoR API, with localStorage fallback for file/offline use or API unavailability |
| Network discovery | embedded host bridge | Navigates to SolariNet Discovery; scan admission and candidate adoption stay in the dashboard workflow |

The integration does not require a separate RackWire login or duplicate
inventory database. The browser session and SoR remain authoritative for
embedded online operations.

**Standalone behavior and remaining service work**

Opening `index.html` from disk makes no network requests and keeps plans in
localStorage. The static device seed and local code-binding flow remain usable
offline. The `solarinet-ws` adapter can speak to a compatible WebSocket service,
but this candidate does not provide or configure a RackWire WebSocket endpoint.
Any separately hosted RackWire backend still needs its own authentication and
CSRF contract before it accepts mutations.

---

## 3. Telemetry — the main integration

`live-adapter.js` holds the full contract in a comment block at the top. Summary:

A **source** is a factory `function(ctx) -> { start(), stop() }` where `ctx` gives you
`getPlan()`, `emit(frame)`, `setStatus(state, msg)` and `config`.

Three adapters are registered: `simulator`, `solarinet-ws`, and `solarinet-rest`.
The simulator runs offline. In the SolariNet embed, REST polls the plan-specific
`/api/rackwire/telemetry?keys=…` endpoint every five seconds and uses the existing
same-origin dashboard session; its response envelope is normalized before the
planner maps monitoring interface names to RackWire port IDs. The WebSocket
adapter supports an auth frame, asset subscription, and reconnect backoff for a
compatible service, but no WebSocket endpoint is configured in this candidate.

### Frame schema

Every field is optional. Anything you omit is simply not overlaid.

```js
{
  ts: 1730000000000,
  devices: {
    "<deviceKey>": {
      reachable: true,     // false → device flagged unreachable, glows drop
      loadW: 143.2,        // measured; replaces the planned figure on the badge
      amps: 1.19,
      poeUsedW: 61,        // checked against the device's poeBudgetW
      tempC: 44,
      cpuPct: 12,
      uptimeS: 918273
    }
  },
  ports: {
    "<deviceKey>|<portId>": {
      link: true,             // false on a planned cable → red dashed, punch-list error
      negotiatedGbps: 2.5,    // below the port's rated speed → warning
      rxGbps: 0.42,
      txGbps: 1.1,            // >85% of capacity → saturation warning
      poeDeliveredW: 13.4,    // past the port's class → error
      errors: 0,              // non-zero → warning
      sfpTempC: 39,
      opticalDbm: -4.2
    }
  }
}
```

### Key resolution

`deviceKey` resolves in order: `device.liveKey` → `device.assetId` → `device.name`,
case-insensitive. **Live key** and **asset ID** are editable per device in the Devices
table and the inspector, so telemetry keyed by your system of record lines up without
renaming anything on the canvas.

`portId` is the app's internal ID (`ge-3`, `sfp-1`, `ac-1`). Get the list for a device
with `RackWire.getPlan()` and running each device's groups through `RW.layout()`, or read
them off the search index via `RackWire.find(deviceName)`.

### Three ways to feed it

```js
// 1. Register your own transport
RWLive.register('solarinet-grpc', (ctx) => ({ start(){…}, stop(){…} }));

// 2. Use a built-in with a URL
RackWire.setLive(true, 'solarinet-ws', { url: 'wss://…', token: '…' });

// 3. Push frames from a transport that lives elsewhere
RackWire.pushLive(frame);
```

If your backend's shape differs from the schema, pass `config.transform` — it is applied
to every inbound message before the UI sees it.

---

## 4. Host API

`window.RackWire`, 23 methods. Same surface works over postMessage for an iframe embed:
`{ source:'rackwire', cmd:'<method>', args:[…] }` in, and `ready` / `change` / `select` /
`reply` events back out.

```
getPlan()                 → { devices, cables, racks, notes, codeMap }
setPlan(plan)             replace everything
patch({devices, cables})  merge by uid
subscribe(fn)             fn(plan) on every change; returns unsubscribe
pushLive(frame)           inject telemetry
setLive(on, source, cfg)  start/stop a registered source
select(uids) / focus(uid)
setView('map'|'table')
setChrome(false)          hide the app header for embedding
theme({accent, ok, …})    retint via --sn-* tokens
undo() / redo()
find(q)                   → [{dev, port, label, sub}]
saveVersion(name) / versions() / restoreVersion(id)
printReport()             printable punch list
issues()                  → [{sev, msg, cable?}]
library() / cableStandards() / tokens()
```

Query flags for a no-JS embed: `?embed=1` (no header), `?view=table`, `?live=simulator`.

**Standalone must keep working.** None of the above runs unless a host calls it. Please
preserve that — the file is used directly from disk on an iPad.

---

## 5. Theming

Two token families, two jobs:

- **`--sn-*` — the host-bridge intake.** An embed host pushes values into these
  custom properties (via a bridge stylesheet or `theme()`) to retheme the chrome.
  Template inline styles use `var(--sn-x, #fallback)`; SVG (which cannot read
  `var()`) goes through a resolver in `tok()` that re-reads on `theme()`.
  Standalone, the literal fallbacks are the RackWire brand palette
  (Brand Standards v1.1.0): Rack Ink `#070A0E` ground, Surface `#0E141C`,
  Type White `#EDF3F9` ink, Divider `#1E2937`, Frame Shadow `#25303F`,
  Frame Steel `#63788F` (chrome only — never signal meaning), and light-theme
  accent `#0B7FA8`.
- **`--rw-*` — brand-invariant.** The frozen cable signal palette plus motion
  durations (120/220/400ms, with `prefers-reduced-motion` honored). A host may
  retheme the `--sn-*` chrome; it never repaints an `--rw-*` value.

```
--sn-bg --sn-surface --sn-raised
--sn-ink --sn-dim --sn-faint --sn-quiet
--sn-divider --sn-divider-strong
--sn-accent --sn-accent-700 --sn-on-field
--sn-ok --sn-warn --sn-crit --sn-maint --sn-neutral
--sn-crit-ink --sn-crit-surface --sn-crit-border
```

> **Superseded (Brand Standards v1.1):** the original two extension tokens
> (`--sn-signal-other`, `--sn-signal-open`) are retired. Cable domain colors are
> now brand literals outside the bridge — `--rw-cable-net/-power/-usb/-other/-open`
> (plus `-lighting`/`-audio` reserved for Studio) — and are theme-invariant: a
> host may retheme the chrome but never a run's meaning. See the styleguide,
> pages 09–10.

Type is the system font stack throughout (IBM Plex is dropped — Brand Standards
v1.1.0); anything measured — numerics, port IDs, status readouts — is set in the
system mono stack. No shadows anywhere. Chrome icons are Lucide (1.75px stroke on
a 24px grid).

---

## 6. Device library

`window.RW.DEVICES` is a plain array at runtime, but it is **no longer authored as one
literal**. `device-library.js` is now the *engine only* — glyph geometry, cable standards,
`layout()`, and a registry. The device data lives in per-vendor modules under `devices/`
(`generic.js`, `ubiquiti.js`, `apple.js`, `samsung.js`, `raspberry-pi.js`,
`qualcomm-arduino.js`, `m5stack.js`, `eos.js`, `minisforum.js`), each a static
`<script>` that calls `window.RW.addDevices([...])`. `index.html` loads the engine first,
then the modules (order among modules is irrelevant), then the app. This keeps the
no-build / offline / `file://` contract while letting the catalog scale — it now holds
**244 curated devices** (was ~31) and grows continuously. Growing it is a permanent task
with a fixed procedure — schema, glyph vocabulary, worked exemplars, the one-shot vendor
recipe, and the validation gate all live in **`devices/SPEC.md`**; validate any change by
opening **`devices/validate.html`** in a browser.

Each entry:

```js
{
  id, vendor, name, model, kind, ru, drawW, note,
  flavor,           // vanilla | pro | studio — the LOWEST edition tier a device
                    //   appears in (cumulative floor: pro⊇vanilla, studio⊇pro).
                    //   LIBRARY-ONLY: deliberately NOT in DEV_FIELDS, so it is
                    //   never snapshotted per-instance or written to CSV.
  budgetW,          // output rating for a power source; overrides circuit math
  circuitA, circuitV,
  poeBudgetW,
  eff,              // adapter conversion efficiency, default 0.9
  isInternet,       // termination point — seeds the green path glow
  isBattery,        // UPS — seeds the amber battery glow
  groups: [{
    k,              // stable group key; migrations match on this
    label, glyph, count, rows,
    role,           // lan wan uplink poe-in power-in power-out data video audio dmx module passive gpio
    gbps, watts, amps, volts,
    poe, poeW,      // what this port delivers
    poeDrawW,       // what this device draws when powered over ethernet
    batt,           // outlet is on battery
    domain,         // net power usb other   (exactly one; closed set)
    conn            // connector token, equality-matched for mate-compatibility
  }]
}
```

`glyph` is a **closed set** (drives rendering — an unknown glyph has no art):
`rj45 sfp usba usbc hdmi microhdmi iec_in iec_out nema barrel audio xlr bnc sd pcie
gpio csi db9 lc rj11`.

`conn` is an **open, equality-matched** field: two ports are connector-compatible when
their `conn` strings are equal or either is `any`, and a mismatch raises a plan issue.
Tokens in use today: `rj45 sfp usba usbc hdmi iec barrel audio xlr sd db9 any`. Reuse an
existing token whenever the physical connector matches; only coin a new one for a genuinely
new connector family (and use it on both ends that should mate).

`RW.layout({groups, name, model})` turns that into positioned ports and a device box size.
Glyphs are simplified line art in `RW.GLYPHS`; add new ones as arrays of rect/circle/line/path.

**Registry API** (built at load, self-healing when `DEVICES` mutates — e.g. the discovery
`mergeDefs` path — so callers never reindex by hand):

```js
RW.search(q)      // case-insensitive match over name/model/vendor/kind/upc; ''→all
RW.geom(d)        // memoized layout() geometry for a library def (content-keyed)
RW.byVendor       // { vendor: [def,…] }   RW.byKind, RW.byFlavor likewise
RW.vendors()      // sorted vendor names    RW.kinds()   RW.flavors() → ['vanilla','pro','studio']
RW.addDevices([]) // append + index a module's entries
```

The gear picker uses `RW.search()` + `RW.geom()` rather than rescanning and
re-laying-out the whole catalog per keystroke.

Catalog composition (by flavor floor): **vanilla 62** (Raspberry Pi, Arduino/Qualcomm,
generic power/passive/service) · **pro 86** (Ubiquiti UniFi, M5Stack, Minisforum,
transceivers, NAS) · **studio 96** (Apple, Samsung, ETC Eos + Net3/Response DMX,
generic display). These floors line up with the edition caps in `README.md`: vanilla
alone → Home; vanilla+pro (148) → Pro; all 244 → Studio.

### Migration matters

Devices are **snapshots** of a library definition taken when placed. `migrate()` runs on
load, JSON import and `setPlan()`, backfilling any field an instance is missing from its
definition — device-level flags and per-group keys matched by `k`. User-edited values are
never overwritten, only absent ones are filled. **If you add a field to the library, add it
to `DEV_FIELDS` or `GROUP_FIELDS` in `migrate()`** or existing plans will not see it. Note
`flavor` is intentionally *excluded* from both — it selects an edition at the library level
and must never travel with a placed instance.

---

## 7. Barcode lookup

In the SolariNet embed, `handleCode(code)` checks saved local code→model bindings,
then asks the existing operator-gated SoR inventory endpoint to resolve a scanned
asset. RackWire obtains the session-bound `X-Solari-CSRF` token from the dashboard
identity endpoint and refreshes/retries once if the token expired. A resolved unit
supplies its model and asset identity to the plan. If the scan is unknown, the
service is unavailable, or the planner is offline, local model/name matching and
the bind dialog remain available.

A USB or Bluetooth reader already works anywhere in the app — a keystroke buffer catches
the scan and fires on Enter. Camera scanning uses `BarcodeDetector` where the browser has
it; **iOS Safari does not ship one**, so on an iPad the hardware reader is the path.

The SolariNet integration deliberately does not add a second barcode service. A
separate hosted RackWire product may use another provider, but it must define its
own authentication, authorization, and CSRF behavior before sending scans to a
backend.

---

## 8. Known limits

- In the SolariNet embed, shared plans and snapshots use the SoR API. LocalStorage
  (`rackwire.project.v2` and `rackwire.project.v2.versions`, capped at 25) is the
  offline/failure fallback and is local to that browser; it does not synchronize
  concurrent edits or resolve conflicts.
- The standalone discovery service remains independent of the SolariNet SoR. The
  SolariNet embed routes scan requests to the dashboard's bounded Discovery workflow.
- No cable slack or physical distance modelling. Deliberate — the map is logical, not spatial.
- No rack elevation view. Racks exist as containers with U slots but are not drawn as a front face.
- Curve routing is a heuristic over eight candidate control-point pairs, not a real router.
  Dense plans will still cross.
- The simulator invents plausible numbers. It is for demoing the live view, not for tests.
- The SolariNet REST telemetry path and browser-to-Discovery handoff have local
  integration acceptance coverage; deployed host behavior and live monitor delivery
  remain unverified until the candidate is staged.

## 9. Current integration verification

This section records the SolariNet integration candidate based on the published
RackWire revision `5f29f59`; it is not a deployed release.

- `node tests/dashboard/test_rackwire_ui.js`: **60 passed**. Covers the embedded
  host bridge, navigation into SolariNet Discovery and Inventory, barcode action,
  same-origin CSRF handling including one-time refresh/retry for both plan writes
  and barcode lookup, and token bridge behavior.
- `php tests/dashboard/test_rackwire_api.php`: **58 passed**. Covers SoR-backed
  plans, ownership, snapshots, library profiles, and commit classification.
- The standalone browser acceptance passed with pinned Playwright 1.64.1 and the
  cached Chromium headless shell. It covers offline boot, modal focus behavior,
  local save/reload, map/table navigation, and the mobile toolbar.
- SolariNet browser acceptance additionally covers scanner-ingest JSON → SoR
  inventory → RackWire model profile/barcode/plan → bounded Discovery scan against
  disposable databases. That flow and the worker lifecycle are recorded in the
  parent integration workflow; neither represents deployed service behavior.

The user and developer manuals are single-file HTML with paired US Letter PDFs.
They distinguish local acceptance from live-host and public-release evidence.
