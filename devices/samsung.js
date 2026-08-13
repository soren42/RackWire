/* RackWire device library — Samsung TVs, tablets, appliances, phones. Specs from Samsung spec sheets.
   Registers into the shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine).

   Sourcing notes:
   · Port counts and types are taken from Samsung retailer spec sheets, owner's manuals and
     FlatpanelsHD / displayspecifications tabulations of those sheets. They are observed.
   · TV drawW figures are TYPICAL-USE ESTIMATES for a mid-size panel in each series, not nameplate
     maxima — Samsung publishes power per screen size, and the spread across a series is large.
     Every TV note says so. Size the branch circuit from the label on the specific panel.
   · Phone / tablet drawW is the rated fast-charge wattage — the honest planning number for a
     USB-C charging position, not device idle draw.
   · Large-appliance drawW is a running/connected-load estimate; the note carries the branch
     circuit the appliance actually requires, which is the number that matters for planning. */
window.RW.addDevices([

  /* ── Televisions ─────────────────────────────────────────────────────────────
     Samsung's premium TVs put every input on a detachable One Connect box fed by a
     single thin cable; the box, not the panel, is what you cable and power. Mid and
     entry series have the inputs on the panel itself. */

  { id: 'samsung-neo-qled-8k-qn900', vendor: 'Samsung', name: 'Neo QLED 8K QN900 (65-85")', model: 'QN900D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 350,
      note: 'Mini-LED 8K flagship. ALL connections and mains are on the detachable One Connect box — cable the box, not the panel; panel takes only the One Connect cable. HDMI 2.1 x4 (eARC on HDMI3), 4K/165Hz FRL. Typical-use estimate, varies widely by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (HDMI3 eARC) · One Connect', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x3 (One Connect)', glyph: 'usba', count: 3, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'usbc', label: 'USB-C (camera)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'eth', label: 'LAN (One Connect)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN (One Connect box)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 350, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-neo-qled-8k-qn800', vendor: 'Samsung', name: 'Neo QLED 8K QN800 (65-85")', model: 'QN800D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 300,
      note: 'Mini-LED 8K. Slim One Connect box carries all I/O and mains. HDMI 2.1 x4 (eARC on HDMI3), Wi-Fi 6E. Typical-use estimate, varies by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (HDMI3 eARC) · One Connect', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x3 (One Connect)', glyph: 'usba', count: 3, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'usbc', label: 'USB-C (camera)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'eth', label: 'LAN (One Connect)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN (One Connect box)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 300, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-neo-qled-4k-qn90', vendor: 'Samsung', name: 'Neo QLED 4K QN90 (43-98")', model: 'QN90D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 200,
      note: 'Mini-LED 4K; HDMI 2.1 x4, one eARC; 4K/144Hz. Inputs on the panel — no One Connect on the 4K QN90. Typical power varies by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (HDMI3 eARC)', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 200, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-neo-qled-4k-qn90f', vendor: 'Samsung', name: 'Neo QLED 4K QN90F (43-115")', model: 'QN90F',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 200,
      note: '2025 Neo QLED 4K with Vision AI and matte panel; HDMI 2.1 x4 (one eARC), 4K/165Hz. Same I/O as QN90D. Typical-use estimate — the 98" and 115" panels draw far more.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (one eARC)', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 200, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-neo-qled-4k-qn85', vendor: 'Samsung', name: 'Neo QLED 4K QN85 (55-85")', model: 'QN85D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 180,
      note: 'Mini-LED 4K, wide-viewing-angle panel. HDMI 2.1 x4 with eARC on HDMI3, USB 2.0 x2. Typical-use estimate, varies by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (HDMI3 eARC)', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 180, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-oled-s95', vendor: 'Samsung', name: 'OLED S95 (55-83")', model: 'S95D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 220,
      note: 'QD-OLED flagship with anti-glare panel. All I/O and mains on the One Connect box: HDMI 2.1 x4 (one eARC), USB-A x3, USB-C, LAN, optical. Typical-use estimate; OLED draw tracks picture content strongly.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (one eARC) · One Connect', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x3 (One Connect)', glyph: 'usba', count: 3, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'usbc', label: 'USB-C (camera)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'eth', label: 'LAN (One Connect)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN (One Connect box)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 220, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-oled-s90', vendor: 'Samsung', name: 'OLED S90 (42-83")', model: 'S90D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 200,
      note: 'QD-OLED. NO One Connect box — inputs are on the panel, full-bandwidth HDMI 2.1 x4 (eARC), USB-A x2. Typical-use estimate; varies by size and content.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (one eARC)', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 200, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-qled-q80', vendor: 'Samsung', name: 'QLED 4K Q80 (50-98")', model: 'Q80D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 160,
      note: 'Full-array QLED, 120Hz panel. HDMI 2.1 x4 with eARC, USB-A x2, LAN, optical. Typical-use estimate, varies by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.1 x4 (one eARC)', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 160, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-qled-q60', vendor: 'Samsung', name: 'QLED 4K Q60 (43-85")', model: 'Q60D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 120,
      note: 'Entry QLED, 60Hz. Only THREE HDMI and they are HDMI 2.0 (eARC on one) — do not plan four 2.1 sources here. Typical-use estimate, varies by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI 2.0 x3 (one eARC)', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-crystal-uhd-du8000', vendor: 'Samsung', name: 'Crystal UHD DU8000 (43-85")', model: 'DU8000',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 110,
      note: 'Volume 4K line — the one most likely to be hanging in a guest room or back bar. THREE HDMI (2.1 feature set, eARC on HDMI2), USB-A x2, LAN, optical. Typical-use estimate, varies by size.',
      groups: [
        { k: 'hdmi', label: 'HDMI x3 (HDMI2 eARC)', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 110, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-the-frame-ls03d', vendor: 'Samsung', name: 'The Frame (32-85")', model: 'LS03D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 130,
      note: 'Art-mode QLED with matte anti-reflection panel. All I/O and mains on the One Connect box, which mounts remotely — the panel gets one slim cable, which is the whole point of the design. HDMI x4 on the box (2.1 features on the 55/65/75" models only), USB x2, LAN, optical. Typical-use estimate; Art Mode with motion sensing runs lower.',
      groups: [
        { k: 'hdmi', label: 'HDMI x4 (one eARC) · One Connect', glyph: 'hdmi', count: 4, rows: 2, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A x2 (One Connect)', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN (One Connect)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN (One Connect box)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 130, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-the-terrace-lst7d', vendor: 'Samsung', name: 'The Terrace outdoor QLED (55-75")', model: 'LST7D',
      kind: 'display', flavor: 'studio', ru: 0, drawW: 250,
      note: 'IP55 partial-sun outdoor QLED. Ports are behind a sealed weather flap on the rear — allow slack and a drip loop; only ONE USB and THREE HDMI. Runs bright, so the power estimate is high relative to an indoor panel of the same size.',
      groups: [
        { k: 'hdmi', label: 'HDMI x3 (one eARC)', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'usb', label: 'USB-A', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'eth', label: 'LAN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.1, domain: 'net', conn: 'rj45' },
        { k: 'optical', label: 'Optical audio out', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN (weather-sealed)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 250, domain: 'power', conn: 'iec' }
      ] },

  /* ── Tablets (Galaxy Tab) ────────────────────────────────────────────────────
     One USB-C that is both the data port and the charge port, plus microSD on most.
     drawW is the rated charge wattage — the planning number for a charging position. */

  { id: 'galaxy-tab-s10-ultra', vendor: 'Samsung', name: 'Galaxy Tab S10 Ultra (14.6")', model: 'SM-X926',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DisplayPort Alt Mode — this one can drive an external display. microSD to 1.5 TB. 45 W charging, charger not in box. No headphone jack.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-s10-plus', vendor: 'Samsung', name: 'Galaxy Tab S10+ (12.4")', model: 'SM-X826',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode, microSD, 45 W charging. Same port set as the Ultra in a smaller panel. No headphone jack.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-s9-ultra', vendor: 'Samsung', name: 'Galaxy Tab S9 Ultra (14.6")', model: 'SM-X916',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'Prior-gen flagship, still widely deployed. USB-C 3.2 Gen 1 with DP Alt Mode, microSD, 45 W charging, IP68.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-s9-plus', vendor: 'Samsung', name: 'Galaxy Tab S9+ (12.4")', model: 'SM-X816',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode, microSD, 45 W charging, IP68.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-s9', vendor: 'Samsung', name: 'Galaxy Tab S9 (11")', model: 'SM-X716',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode, microSD, 45 W charging, IP68.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-s9-fe-plus', vendor: 'Samsung', name: 'Galaxy Tab S9 FE+ (12.4")', model: 'SM-X616',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'Fan Edition. USB-C is 2.0 only — charging and light sync, not fast bulk transfer. microSD, 45 W charging, IP68, S Pen in box.',
      groups: [
        { k: 'usbc', label: 'USB-C 2.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-s9-fe', vendor: 'Samsung', name: 'Galaxy Tab S9 FE (10.9")', model: 'SM-X516',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 45,
      note: 'Fan Edition. USB-C 2.0, microSD, 45 W charging, IP68. Common as a fixed wall or podium tablet.',
      groups: [
        { k: 'usbc', label: 'USB-C 2.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-a9-plus', vendor: 'Samsung', name: 'Galaxy Tab A9+ (11")', model: 'SM-X216',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 15,
      note: 'Budget tablet, the usual choice for bulk deployments. USB-C 2.0, microSD, and it KEPT the 3.5 mm jack. 15 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 2.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'jack', label: '3.5 mm headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'USB-C charge in · 15 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-tab-a9', vendor: 'Samsung', name: 'Galaxy Tab A9 (8.7")', model: 'SM-X116',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 15,
      note: 'Small budget tablet. USB-C 2.0, microSD, 3.5 mm jack, 15 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 2.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'jack', label: '3.5 mm headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'USB-C charge in · 15 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, domain: 'power', conn: 'usbc' }
      ] },

  /* ── Phones (Galaxy) ─────────────────────────────────────────────────────────
     Exactly one USB-C, doing double duty as data and charge. Modeled as two groups
     so a charging bank and a data run can be planned against the same physical port. */

  { id: 'galaxy-s25-ultra', vendor: 'Samsung', name: 'Galaxy S25 Ultra (6.9")', model: 'SM-S938',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 (5 Gb/s) with DisplayPort Alt Mode for DeX. 45 W Super Fast Charging 2.0 — needs a 3 A / PPS cable to reach it. No microSD, no jack.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s25-plus', vendor: 'Samsung', name: 'Galaxy S25+ (6.7")', model: 'SM-S936',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode. 45 W charging with the bundled 3 A cable.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s25', vendor: 'Samsung', name: 'Galaxy S25 (6.2")', model: 'SM-S931',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode. Base model charges at 25 W, NOT 45 W like its larger siblings — size the charging position accordingly.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s24-ultra', vendor: 'Samsung', name: 'Galaxy S24 Ultra (6.8")', model: 'SM-S928',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode, 45 W charging. Still heavily deployed.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s24-plus', vendor: 'Samsung', name: 'Galaxy S24+ (6.7")', model: 'SM-S926',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 45,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode, 45 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s24', vendor: 'Samsung', name: 'Galaxy S24 (6.2")', model: 'SM-S921',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'USB-C 3.2 Gen 1 with DP Alt Mode, 25 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s24-fe', vendor: 'Samsung', name: 'Galaxy S24 FE (6.7")', model: 'SM-S721',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'Fan Edition. USB-C 3.2 Gen 1, 25 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-s23-ultra', vendor: 'Samsung', name: 'Galaxy S23 Ultra (6.8")', model: 'SM-S918',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 45,
      note: 'Older flagship still in wide service. USB-C 3.2 Gen 1 with DP Alt Mode, 45 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 45 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 45, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-z-fold6', vendor: 'Samsung', name: 'Galaxy Z Fold6 (7.6" folding)', model: 'SM-F956',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'Book-fold. USB-C 3.2 Gen 1 with DP Alt Mode for DeX, 25 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 3.2 Gen 1 (DP Alt Mode)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-z-flip6', vendor: 'Samsung', name: 'Galaxy Z Flip6 (6.7" folding)', model: 'SM-F741',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'Clamshell fold. Single USB-C, 25 W charging. Data speed of the port is not published as 3.x by Samsung — treat as USB 2.0 class for planning.',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2.0 class)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-a55', vendor: 'Samsung', name: 'Galaxy A55 5G (6.6")', model: 'SM-A556',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'Mid-range volume handset. USB-C 2.0 only, microSD slot, 25 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 2.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  { id: 'galaxy-a16', vendor: 'Samsung', name: 'Galaxy A16 5G (6.7")', model: 'SM-A166',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 25,
      note: 'Entry handset. USB-C 2.0, microSD, 3.5 mm jack retained, 25 W charging.',
      groups: [
        { k: 'usbc', label: 'USB-C 2.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'jack', label: '3.5 mm headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'USB-C charge in · 25 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, domain: 'power', conn: 'usbc' }
      ] },

  /* ── Smart appliances ────────────────────────────────────────────────────────
     Every one of these is Wi-Fi / SmartThings only — NONE has an ethernet port. They
     are legitimately thin: a power-in group and nothing else. What matters for planning
     is the branch circuit, which each note states explicitly. drawW is a running or
     connected-load estimate; confirm against the nameplate on the unit. */

  { id: 'bespoke-family-hub-fridge-rf29', vendor: 'Samsung', name: 'Bespoke 4-Door Flex Refrigerator w/ Family Hub (29 cu ft)', model: 'RF29BB8900',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 150,
      note: 'Standard-depth 4-Door Flex with the 32" Family Hub touchscreen. 115 V / 60 Hz on a DEDICATED 15 A grounded branch circuit. Wi-Fi / SmartThings only — the screen is not wired, so no drop is needed at the fridge. Running estimate, compressor duty-cycles well below it.',
      groups: [
        { k: 'ac', label: 'AC IN · 115 V 15 A dedicated', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 150, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'bespoke-family-hub-fridge-rf23', vendor: 'Samsung', name: 'Bespoke 4-Door Flex Refrigerator w/ Family Hub (23 cu ft, counter-depth)', model: 'RF23BB8900',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 130,
      note: 'Counter-depth Family Hub variant. 115 V / 60 Hz dedicated 15 A circuit. Wi-Fi / SmartThings, no wired network port. Running estimate.',
      groups: [
        { k: 'ac', label: 'AC IN · 115 V 15 A dedicated', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 130, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'bespoke-4door-flex-fridge', vendor: 'Samsung', name: 'Bespoke 4-Door Flex Refrigerator (no Family Hub)', model: 'RF24BB6200',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 130,
      note: 'Same chassis family without the touchscreen — still Wi-Fi connected for SmartThings. 115 V / 60 Hz dedicated 15 A circuit. Running estimate.',
      groups: [
        { k: 'ac', label: 'AC IN · 115 V 15 A dedicated', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 130, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'bespoke-ai-washer-wf53bb', vendor: 'Samsung', name: 'Bespoke AI Front-Load Washer (5.3 cu ft)', model: 'WF53BB8900A',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 1000,
      note: 'AI OptiWash front loader. 120 V / 60 Hz on a dedicated 15 A circuit. Wi-Fi / SmartThings, no ethernet. Peak figure is the internal water heater; a cold cycle draws a small fraction of it.',
      groups: [
        { k: 'ac', label: 'AC IN · 120 V 15 A dedicated', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 1000, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'bespoke-ai-dryer-dve53bb', vendor: 'Samsung', name: 'Bespoke AI Electric Dryer (7.6 cu ft)', model: 'DVE53BB8900',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 5000,
      note: 'ELECTRIC dryer — 240 V / 30 A dedicated circuit, hardwired or a 4-wire range cord, NOT a standard receptacle. This is the single largest load in most laundry rooms. Wi-Fi / SmartThings, no ethernet. Heater-element estimate.',
      groups: [
        { k: 'ac', label: 'AC IN · 240 V 30 A dedicated', glyph: 'nema', count: 1, rows: 1, role: 'power-in', watts: 5000, volts: 240, amps: 30, domain: 'power', conn: 'any' }
      ] },

  { id: 'bespoke-ai-gas-dryer-dvg53bb', vendor: 'Samsung', name: 'Bespoke AI Gas Dryer (7.6 cu ft)', model: 'DVG53BB8900',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 400,
      note: 'GAS dryer — electrically it is only 120 V / 60 Hz 15 A for the motor, controls and igniter; the heat is gas, which RackWire does not model. Wi-Fi / SmartThings, no ethernet.',
      groups: [
        { k: 'ac', label: 'AC IN · 120 V 15 A', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 400, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'bespoke-ai-laundry-combo', vendor: 'Samsung', name: 'Bespoke AI Laundry Combo all-in-one washer/dryer (5.3 cu ft)', model: 'WD53DBA900HZ',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 1000,
      note: 'Ventless heat-pump combo. The notable planning fact: it runs on a STANDARD 120 V outlet — no 240 V circuit and no dryer vent, which is why it lands in retrofits. Wi-Fi / SmartThings, no ethernet. Running estimate.',
      groups: [
        { k: 'ac', label: 'AC IN · 120 V 15 A', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 1000, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'bespoke-induction-range-nsi6dg9500', vendor: 'Samsung', name: 'Bespoke Slide-In Induction Range (30", 6.3 cu ft)', model: 'NSI6DG9500',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 7200,
      note: 'Induction slide-in with oven camera. 220/240 V on a dedicated 40 A breaker; largest element boosts to 4.3 kW. Wi-Fi / SmartThings, no ethernet. The 7.2 kW figure is a connected-load planning estimate for elements plus oven, not a nameplate rating — confirm on the unit.',
      groups: [
        { k: 'ac', label: 'AC IN · 240 V 40 A dedicated', glyph: 'nema', count: 1, rows: 1, role: 'power-in', watts: 7200, volts: 240, amps: 40, domain: 'power', conn: 'any' }
      ] },

  { id: 'samsung-smart-wall-oven-nv51', vendor: 'Samsung', name: 'Smart Single Wall Oven (30")', model: 'NV51CG700S',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 4800,
      note: 'Built-in single wall oven with Steam Cook and camera. 240 V dedicated circuit, HARDWIRED to a junction box — no plug, so there is no receptacle to plan for, only the circuit. Wi-Fi / SmartThings, no ethernet. Verify breaker size (commonly 30 A) against the unit nameplate.',
      groups: [
        { k: 'ac', label: 'AC IN · 240 V hardwired', glyph: 'nema', count: 1, rows: 1, role: 'power-in', watts: 4800, volts: 240, domain: 'power', conn: 'any' }
      ] },

  { id: 'samsung-smart-dishwasher-dw80', vendor: 'Samsung', name: 'Bespoke Smart Dishwasher (24")', model: 'DW80CG5451',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 1200,
      note: 'Built-in dishwasher. 120 V / 60 Hz, dedicated 15 A circuit, usually hardwired under the counter. Wi-Fi / SmartThings, no ethernet. Peak is the heating element during dry.',
      groups: [
        { k: 'ac', label: 'AC IN · 120 V 15 A dedicated', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 1200, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-otr-microwave-me21', vendor: 'Samsung', name: 'Smart Over-the-Range Microwave (2.1 cu ft)', model: 'ME21',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 1550,
      note: 'Over-the-range microwave/hood, 1000 W cooking output. 120 V / 60 Hz on a dedicated 20 A circuit with the receptacle in the cabinet above. Wi-Fi / SmartThings on the smart models, no ethernet. Figure is input draw, not cooking output.',
      groups: [
        { k: 'ac', label: 'AC IN · 120 V 20 A dedicated', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 1550, volts: 120, domain: 'power', conn: 'iec' }
      ] },

  { id: 'samsung-jet-bot-ai-clean-station', vendor: 'Samsung', name: 'Jet Bot AI+ robot vacuum + Clean Station',  model: 'VR50T95735W',
      kind: 'appliance', flavor: 'studio', ru: 0, drawW: 170,
      note: 'Only the Clean Station is cabled — the robot itself docks to it and is never wired. Standard 120 V outlet; place the station where it has clearance, not where the cable is convenient. 170 W max system draw; idle docked draw is very small. Wi-Fi / SmartThings, no ethernet.',
      groups: [
        { k: 'ac', label: 'AC IN (Clean Station) · 120 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 170, volts: 120, domain: 'power', conn: 'iec' }
      ] }

]);
