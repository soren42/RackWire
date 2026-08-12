# RackWire

A browser-based planner for cabling servers, network gear, power and peripherals.
Two views: a logical connection map and a data table. Opens from a local file and
completes its core work with the network unplugged — the React runtime is vendored,
so `file://` works fully offline.

The analysis engine checks link speed negotiation, connector fit, per-standard
cable length limits, PoE per-port class and per-switch budget, AC circuit loading
at 80% derate, adapter conversion loss, uplink oversubscription and double-landed
ports. Around it: undo/redo, snapshots, CSV and JSON import/export, a printable
punch list, live telemetry overlay and a touch canvas.

## Editions

Planned packaging — the current build ships the full feature set with no
edition detection and does not enforce the device caps below.

| Edition | Devices | Adds |
|---|---|---|
| RackWire | up to 50 | The full planner and analysis engine. No descriptor — never "Free" or "Base". |
| RackWire Pro | up to 150 | Network discovery. |
| RackWire Studio | unlimited | Professional sound and lighting domains, plus Pro discovery. |

Home: `rackwire.studio` · App: `app.rackwire.studio`.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole app — open it in a browser. No build step. |
| `device-library.js` | `window.RW` — port geometry, cable standards, seeded devices, layout engine. |
| `live-adapter.js` | `window.RWLive` — telemetry transport layer; contract in the header comment. |
| `support.js` | Generated, pinned component-format runtime. Do not edit; see `docs/SUPPORT-RUNTIME.md`. |
| `vendor/` | Vendored React, ReactDOM and Babel — no CDN at runtime. |
| `docs/USER-MANUAL.html` | Canonical branded User Manual; opens locally and prints cleanly. |
| `docs/SUPPORT-RUNTIME.md` | Runtime provenance, constraints, checksums and replacement procedure. |
| `docs/HANDOFF.md` | Original design handoff: seams, host API, frame schema, theming. |
| `docs/CONTRACT-RW.md` | SolariNet integration contract (embed, API, SoR schema). |
| `styleguide/` | Brand authority: `RackWire-Brand-Standards.html` v1.1.0, identity sheet, logo assets. |
| `archive/` | Pre-integration source drop and superseded design references. |

## Embedding

The app embeds as a same-origin iframe driving a postMessage bridge over the
23-method `window.RackWire` host API — that surface is frozen. An embed host
themes the chrome by pushing values into the `--sn-*` CSS custom properties;
standalone, their fallbacks are the RackWire brand palette. Cable signal colors
(`--rw-cable-*`) are theme-invariant and never rethemed. Query flags: `?embed=1`
(no chrome), `?view=table`, `?live=simulator`. SolariNet mounts this repository
as a git submodule at `dashboard/public/rackwire/`; standalone use needs nothing.
