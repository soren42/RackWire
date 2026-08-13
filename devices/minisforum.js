/* RackWire device library — Minisforum.
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([
  { id: 'ms-r1', vendor: 'Minisforum', name: 'MS-R1 Workstation', model: 'MS-R1 (CIX CP8180)',
      kind: 'server', flavor: 'pro', ru: 0, drawW: 180, note: 'Dual RTL8127 10 GbE · PCIe x16 (x8 electrical) · 19 V 180 W brick',
      groups: [
        { k: 'eth', label: '10 GbE ×2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'usbc', label: 'USB-C (DP 1.4 alt) ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.0', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'usb3', label: 'Rear USB 3.2 G2 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
        { k: 'usb2', label: 'Rear USB 2.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'fusb', label: 'Front USB-A ×3', glyph: 'usba', count: 3, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'aud', label: 'Combo audio', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pcie', label: 'PCIe x16 (x8)', glyph: 'pcie', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'dc', label: 'DC IN 19 V 180 W', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 180, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'msf-19v-180w', vendor: 'Minisforum', name: 'Power adapter · 19V 180W', model: 'SOY-1900947-454',
      kind: 'adapter', flavor: 'pro', ru: 0, drawW: 0, budgetW: 180, eff: 0.9,
      note: 'Output DC 19 V 9.47 A / 180 W · 5.5 × 2.5 mm barrel · input AC 100–240 V 50/60 Hz. Ships with MS-R1 and MS-01. MS-R1 will alternatively take 100 W over USB-C at 20 V.',
      groups: [
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 2, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'dc', label: 'DC OUT 19 V 9.47 A', glyph: 'barrel', count: 1, rows: 1, role: 'power-out', watts: 180, volts: 19, domain: 'power', conn: 'barrel' }
      ] }
]);
