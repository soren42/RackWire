# RackWire — Handoff to Claude Code

A browser-based planner for cabling servers, network gear, power and peripherals.
Two views: a logical connection map and a data table. Everything runs client-side today.

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

## 2. What is real and what is stubbed

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

**Stubbed — needs you**

| Seam | Where | What it needs |
|---|---|---|
| Telemetry source | `live-adapter.js` | Point `solarinet-ws` / `solarinet-rest` at real endpoints |
| Barcode lookup | `handleCode()` in the logic class | A UPC/model lookup service |
| Device library | `window.RW.DEVICES` in `device-library.js` | Serve from inventory instead of a static array |
| Persistence | `load()` / `persist()` | Swap localStorage for a backend if plans must be shared |

---

## 3. Telemetry — the main integration

`live-adapter.js` holds the full contract in a comment block at the top. Summary:

A **source** is a factory `function(ctx) -> { start(), stop() }` where `ctx` gives you
`getPlan()`, `emit(frame)`, `setStatus(state, msg)` and `config`.

Three sources are registered: `simulator` (working demo), `solarinet-ws` and
`solarinet-rest`. The latter two are written end to end — auth frame, asset subscribe,
exponential-backoff reconnect, bearer-token polling — and only need a URL that exists.

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
**244 curated devices** (was ~31) and grows continuously. See §11 for how to add gear.

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
    domain,         // net power usb other   (exactly one)
    conn            // rj45 sfp usba usbc hdmi iec barrel audio xlr bnc lc db9 any
  }]
}
```

Allowed `glyph` values (closed set): `rj45 sfp usba usbc hdmi microhdmi iec_in iec_out
nema barrel audio xlr bnc sd pcie gpio csi db9 lc rj11`.

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

`handleCode(code)` currently: checks the user's saved code→model bindings, then matches
normalised model and name against the local library, then offers a bind dialog.

A USB or Bluetooth reader already works anywhere in the app — a keystroke buffer catches
the scan and fires on Enter. Camera scanning uses `BarcodeDetector` where the browser has
it; **iOS Safari does not ship one**, so on an iPad the hardware reader is the path.

To make lookup real, replace the middle of `handleCode()` with a call to your service and
have it return a library-shaped device definition. The bind UI and the code map behind it
can stay as the fallback for unrecognised codes.

---

## 8. Known limits

- Plans live in one localStorage key (`rackwire.project.v2`), snapshots in
  `rackwire.project.v2.versions`, capped at 25. No multi-user, no conflict resolution.
- No cable slack or physical distance modelling. Deliberate — the map is logical, not spatial.
- No rack elevation view. Racks exist as containers with U slots but are not drawn as a front face.
- Curve routing is a heuristic over eight candidate control-point pairs, not a real router.
  Dense plans will still cross.
- The simulator invents plausible numbers. It is for demoing the live view, not for tests.
