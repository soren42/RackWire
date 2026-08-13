# RackWire Device Catalog — Authoring Spec

`source of truth for devices/*.js · validated by devices/validate.html`

Growing the native device catalog — new vendors, models, ports, power and capacity — is a
**permanent, recurring task for the life of the product**. New gear ships constantly and the
library must keep pace. This file is the fixed procedure so each expansion is a repeatable
one-shot, not a re-improvised fan-out.

The catalog holds **244 curated devices** across 20 vendors today. The discovery backend's
SQLite `library` table is the *mutable/discovered* path; **this static seed is the curated
reference set** and the two never touch on disk.

---

## 0. Hard constraints (never violate)

- **No build step, no bundler, no server-side JS.** Every module is a plain browser
  `<script>` loaded directly by `index.html`. RackWire runs from `file://` with no toolchain.
- **Data is browser JavaScript only.** No Node APIs, no `import`/`export`, no `fetch` at load.
- **A module only calls `window.RW.addDevices([...])`.** It never touches the DOM, the app
  state, the network, or another module. Load order among modules is irrelevant.
- **Reference data must be real.** Source every spec from the vendor's own tech-spec sheet.
  If a SKU or a port count can't be confirmed, leave it out — do **not** synthesise a
  plausible model. (We once removed an invented `RSN-DMX8-O`; the ETC Response Mk2 line is
  only 1/2/4-port. Unverifiable reference data is worse than a smaller catalog.)

---

## 1. Module file format

One file per vendor: `devices/<vendor>.js`. The whole file is a single call:

```js
/* RackWire device library — <Vendor>.
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([
  { /* device */ },
  { /* device */ }
]);
```

Group related devices with `/* ---- section ---- */` comment banners. camelCase everywhere
per house style; `id`s are lowercase-kebab (see §5).

---

## 2. Device schema

Each object in the array:

| Field | Req | Type | Meaning |
|---|:---:|---|---|
| `id` | ✔ | string | Globally unique, lowercase-kebab, stable forever (it keys plan snapshots). |
| `vendor` | ✔ | string | Display name, e.g. `Ubiquiti`, `Raspberry Pi`. Groups the picker. |
| `name` | ✔ | string | Human product name, e.g. `Switch Pro Max 16 PoE`. |
| `model` | ✔ | string | SKU / model number, e.g. `USW-Pro-Max-16-PoE`. |
| `kind` | ✔ | string | Category — see §4. Drives the picker's kind filter. |
| `flavor` | ✔ | enum | Edition floor: `vanilla` \| `pro` \| `studio` — see §3. **Library-only.** |
| `ru` | ✔ | number | Rack units (0 for non-rack gear). 0–60. |
| `drawW` | ✔ | number | Typical power draw in watts (≥ 0; 0 for passive / PoE-powered). |
| `groups` | ✔ | array | Port groups — see §6. May be `[]` for a port-less device (e.g. a blank). |
| `note` | – | string | One-line planning note shown in the inspector. |
| `upc` | – | string | Barcode, for the scan workflow. `''` if unknown. |
| `budgetW` | – | number | Output rating of a power source; overrides circuit math. |
| `circuitA`,`circuitV` | – | number | Branch-circuit capacity for a PDU/UPS. |
| `poeBudgetW` | – | number | Total PoE power a switch/injector can deliver. |
| `eff` | – | number | Adapter conversion efficiency (default 0.9). |
| `isInternet` | – | bool | Marks an internet termination point (seeds the green path glow). |
| `isBattery` | – | bool | Marks a UPS (seeds the amber battery glow). |

> **`flavor` never travels with a placed device.** It is deliberately excluded from
> `DEV_FIELDS`/`GROUP_FIELDS` in the app's `migrate()`, so it is never snapshotted per
> instance nor written to CSV. It selects an edition at the library level only.

---

## 3. Flavor — the edition floor

`flavor` is the **lowest edition a device first appears in**, and tiers are **cumulative**:
`pro` ⊇ `vanilla`, `studio` ⊇ `pro`. Pick the floor by audience:

| flavor | Audience | Typical gear |
|---|---|---|
| `vanilla` | Home / homelab | SBCs, microcontrollers, generic power & passive, service demarcs |
| `pro` | Professional IT / networking | Managed switches, gateways, APs, NAS, transceivers, mini-PCs |
| `studio` | AV / media / production | Computers, phones, tablets, displays, TVs, audio & lighting (DMX) |

These floors map to `README.md`'s edition caps: `vanilla` alone → **Home**; `vanilla`+`pro`
→ **Pro**; all three → **Studio**. Today: vanilla 62 · pro 86 · studio 96.

---

## 4. `kind` vocabulary (open, but reuse first)

Reuse an existing token whenever it fits; only coin a new one for a genuinely new category.
In use today:

```
mcu switch gateway phone sbc tablet display ap adapter appliance console
server power laptop workstation transceiver peripheral wan service passive other
```

---

## 5. IDs and naming

- `id` is lowercase-kebab, unique across the **entire** catalog, and **immutable** once
  shipped — a placed device stores its `id`, so changing it orphans existing plans.
- Prefer a vendor-recognisable stem: `udm-pro-max`, `rpi5`, `usw-ultra`.
- The validator fails on any duplicate `id`.

---

## 6. Port-group schema

Each entry in `groups` describes one set of identical ports:

| Field | Req | Type | Meaning |
|---|:---:|---|---|
| `k` | ✔ | string | Stable group key, **unique within the device**. Migrations match on it. |
| `label` | ✔ | string | What the inspector shows, e.g. `LAN 1–8 · 1 GbE`. |
| `glyph` | ✔ | enum | Connector art — **closed set**, see below. |
| `count` | ✔ | int | Number of physical ports (1–512). |
| `rows` | ✔ | int | How many rows to lay them out in (1–`count`). |
| `role` | ✔ | string | Functional role — see list below. |
| `domain` | ✔ | enum | `net` \| `power` \| `usb` \| `other` — **closed**; picks the signal palette. |
| `conn` | ✔ | string | Connector token — equality-matched for compatibility (see below). |
| `gbps` | – | number | Link speed, for net/data ports. |
| `watts`,`amps`,`volts` | – | number | Electrical ratings, for power ports. |
| `poe` | – | string | PoE class delivered, e.g. `poe+`, `poe++`. |
| `poeW` | – | number | Watts delivered per PoE port. |
| `poeDrawW` | – | number | Watts this device draws when powered over PoE. |
| `batt` | – | bool | Outlet is on battery (UPS). |

**`glyph` — closed set** (selects line-art in `RW.GLYPHS`; an unknown glyph has nothing to draw):

```
rj45 sfp usba usbc hdmi microhdmi iec_in iec_out nema barrel audio
xlr bnc sd pcie gpio csi db9 lc rj11
```

**`domain` — closed set:** `net` `power` `usb` `other` (exactly one).

**`role` — functional tag** (reuse first). In use today:

```
lan wan uplink poe-in power-in power-out data video audio dmx module gpio passive
```

**`conn` — open, equality-matched.** Two ports are connector-compatible when their `conn`
strings are **equal**, or either is `any`; a mismatch raises a plan issue. Reuse an existing
token when the physical connector matches; coin a new one only for a new connector family,
and use it on **both** ends that should mate. Tokens in use: `rj45 sfp usba usbc hdmi iec
barrel audio xlr sd db9 any`. (Note `conn: 'iec'` pairs with either `iec_in`/`iec_out` glyph.)

---

## 7. Two worked exemplars

**A vanilla SBC** (from `raspberry-pi.js`) — mixed net/usb/other/power ports:

```js
{ id: 'rpi5', vendor: 'Raspberry Pi', name: 'Raspberry Pi 5', model: 'RPi 5 8GB',
    kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 27, note: '5 V/5 A USB-C PD required for full peripheral power',
    groups: [
      { k: 'eth',  label: '1 GbE',           glyph: 'rj45',      count: 1, rows: 1, role: 'lan',      gbps: 1,    domain: 'net',   conn: 'rj45' },
      { k: 'usb3', label: 'USB 3.0 ×2',      glyph: 'usba',      count: 2, rows: 2, role: 'data',     gbps: 5,    domain: 'usb',   conn: 'usba' },
      { k: 'hdmi', label: 'micro-HDMI ×2',   glyph: 'microhdmi', count: 2, rows: 2, role: 'video',    gbps: 18,   domain: 'other', conn: 'hdmi' },
      { k: 'pwr',  label: 'USB-C PD IN 27 W', glyph: 'usbc',     count: 1, rows: 1, role: 'power-in', watts: 27,  domain: 'power', conn: 'usbc' },
      { k: 'gpio', label: '40-pin GPIO',     glyph: 'gpio',      count: 1, rows: 1, role: 'gpio',                 domain: 'other', conn: 'any' }
    ] }
```

**A pro PoE switch** (from `ubiquiti.js`) — `poeBudgetW`, PoE classes, an uplink:

```js
{ id: 'usw-pro-max-16-poe', vendor: 'Ubiquiti', name: 'Switch Pro Max 16 PoE', model: 'USW-Pro-Max-16-PoE',
    kind: 'switch', flavor: 'pro', ru: 1, drawW: 30, poeBudgetW: 180, note: '180 W PoE budget · 42 Gbps non-blocking',
    groups: [
      { k: 'ge',  label: '1–12 · 1 GbE PoE+',   glyph: 'rj45',   count: 12, rows: 2, role: 'lan',    gbps: 1,   poe: 'poe+',  poeW: 30, domain: 'net',   conn: 'rj45' },
      { k: 'mg',  label: '13–16 · 2.5 GbE PoE++', glyph: 'rj45', count: 4,  rows: 2, role: 'lan',    gbps: 2.5, poe: 'poe++', poeW: 60, domain: 'net',   conn: 'rj45' },
      { k: 'sfp', label: '17–18 · 10G SFP+',    glyph: 'sfp',    count: 2,  rows: 1, role: 'uplink', gbps: 10,             domain: 'net',   conn: 'sfp' },
      { k: 'dc',  label: 'DC IN 54 V 210 W',    glyph: 'barrel', count: 1,  rows: 1, role: 'power-in', watts: 210,        domain: 'power', conn: 'barrel' }
    ] }
```

---

## 8. Validation gate — required before shipping any module

**Open `devices/validate.html` in a browser** (double-click; `file://` works). It loads the
engine and every module exactly as `index.html` does, runs `RW.validate()`, and shows a
green **ALL CHECKS PASSED** banner with per-vendor / per-flavor counts, or a red list of every
schema violation. It must be green.

`RW.validate()` (in `devices/validate-core.js`, browser JS shared with the page) checks:
unique non-empty `id`; valid `flavor`; present `vendor`/`name`/`kind`; `drawW` ≥ 0; `ru`
0–60; `groups` is an array; per group — unique `k`, legal `glyph`, legal `domain`, `count`
1–512, `rows` 1–`count`, present `conn`/`role`; `RW.geom()` returns positive dimensions;
registry totals (`byVendor`/`byFlavor`) equal `DEVICES.length`; `RW.search('')` returns all.

**Headless check** (optional, for an agent with no browser): drive the same committed core
under node by faking `window`, loading `device-library.js`, each `devices/*.js`, then
`devices/validate-core.js`, and calling `window.RW.validate()`. Keep that driver **ephemeral**
(scratchpad only) — never commit Node JS to the repo. The committed gate is the browser page.

---

## 9. Wiring a new module

Two files, in lock-step:

1. `index.html` — add `<script src="devices/<vendor>.js"></script>` in the block after
   `device-library.js` (after the other modules, before the app boot).
2. `devices/validate.html` — add the matching `<script src="<vendor>.js"></script>` in its
   loader block.

Load order among data modules does not matter, but the two files must list the same set.

---

## 10. The one-shot vendor recipe

Adding a vendor is one delegated task. Hand a research-capable agent this packet (fill the
brackets); it returns a single `devices/<vendor>.js` file, which you then wire (§9) and
validate (§8).

```
OBJECTIVE   Author devices/<vendor>.js: a curated set of <Vendor>'s <product lines>,
            each a real, spec-sheet-confirmed model with accurate ports, power and capacity.
IN-SCOPE    Only the new file devices/<vendor>.js. Emit the whole file.
OUT-SCOPE   index.html, other modules, the engine, any app code. Do not wire it up.
GOVERNED-BY devices/SPEC.md — schema §2/§6, closed vocab §4/§6, flavor §3, hard rules §0.
FLAVOR      All entries flavor: '<vanilla|pro|studio>' unless a model clearly belongs lower.
SOURCING    Vendor tech-spec sheets only. Omit any model whose ports/SKU can't be confirmed.
            Never invent a SKU or a port count.
FORMAT      One window.RW.addDevices([...]) call; the two exemplars in SPEC §7 are the style.
ACCEPTANCE  node --check passes; every device satisfies SPEC §2/§6; ids globally unique;
            glyph ∈ closed set; domain ∈ {net,power,usb,other}; the file drops into
            validate.html green.
RETURN      The complete devices/<vendor>.js, plus a one-line count of devices by kind.
```

Fan out one such agent per vendor to expand several at once; route review cross-lab per
house policy (the author model does not validate its own catalog).
