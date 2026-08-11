# RackWire

A browser-based planner for cabling servers, network gear, power and peripherals.
Two views: a logical connection map and a data table. Opens from a local file and
completes its core work with the network unplugged.

The analysis engine checks link speed negotiation, connector fit, per-standard
cable length limits, PoE per-port class and per-switch budget, AC circuit loading
at 80% derate, adapter conversion loss, uplink oversubscription and double-landed
ports. Around it: undo/redo, snapshots, CSV and JSON import/export, a printable
punch list, live telemetry overlay and a touch canvas.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole app — open it in a browser. No build step. |
| `device-library.js` | `window.RW` — port geometry, cable standards, seeded devices, layout engine. |
| `live-adapter.js` | `window.RWLive` — telemetry transport layer; contract in the header comment. |
| `support.js` | Vendored component-format runtime. Do not edit. |
| `docs/HANDOFF.md` | Original design handoff: seams, host API, frame schema, theming. |
| `docs/CONTRACT-RW.md` | SolariNet integration contract (embed, API, SoR schema). |
| `styleguide/` | RackWire brand standards, identity sheet and logo assets. |
| `archive/` | Pre-integration source drop and superseded design references. |

## Embedding

The app embeds as a same-origin iframe driving a postMessage bridge over the
23-method `window.RackWire` host API. Query flags: `?embed=1` (no chrome),
`?view=table`, `?live=simulator`. SolariNet mounts this repository as a git
submodule at `dashboard/public/rackwire/`; standalone use needs nothing.
