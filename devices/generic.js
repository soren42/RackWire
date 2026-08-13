/* RackWire device library — Generic / vendor-agnostic gear (power, passive, transceivers, service).
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([
  { id: 'pdu-8', vendor: 'Generic', name: 'Rack PDU · 8 outlet', model: 'PDU-8-15A',
      kind: 'power', flavor: 'vanilla', ru: 1, drawW: 0, circuitA: 15, circuitV: 120, note: '15 A / 1800 W branch circuit, 80% derate = 1440 W',
      groups: [
        { k: 'out', label: 'C13 outlets 1–8', glyph: 'iec_out', count: 8, rows: 1, role: 'power-out', amps: 15, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'in', label: 'Feed · NEMA 5-15P', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 15, volts: 120, domain: 'power', conn: 'iec' }
      ] },
  { id: 'outlet-duplex', vendor: 'Generic', name: 'Wall outlet · duplex', model: 'NEMA 5-15R',
      kind: 'power', flavor: 'vanilla', ru: 0, drawW: 0, circuitA: 15, circuitV: 120, note: 'Shared 15 A branch circuit',
      groups: [
        { k: 'r', label: 'Receptacles A/B', glyph: 'nema', count: 2, rows: 1, role: 'power-out', amps: 15, volts: 120, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ups-1500', vendor: 'Generic', name: 'UPS · 1500 VA', model: 'UPS-1500',
      kind: 'power', flavor: 'vanilla', isBattery: true, ru: 2, drawW: 0, circuitA: 12, circuitV: 120, budgetW: 900, note: '900 W usable output',
      groups: [
        { k: 'out', label: 'Battery outlets ×6', glyph: 'iec_out', count: 6, rows: 1, role: 'power-out', amps: 12, volts: 120, domain: 'power', conn: 'iec', batt: true },
        { k: 'in', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 12, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'usb', label: 'USB mgmt', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' }
      ] },
  { id: 'sabrent-voltik-252', vendor: 'Sabrent', name: 'VOLTIK 252W charging station', model: 'AX-8PTC',
      kind: 'power', flavor: 'vanilla', ru: 0, drawW: 252, budgetW: 252, note: '252 W shared across all ports · 4× USB-C at 100 W max (125 W per pair) · 4× USB-A at 18 W max (36 W per pair) · LCD per-port metering',
      groups: [
        { k: 'c', label: 'USB-C out ×4 · 100 W', glyph: 'usbc', count: 4, rows: 1, role: 'power-out', watts: 100, domain: 'power', conn: 'usbc' },
        { k: 'a', label: 'USB-A out ×4 · 18 W', glyph: 'usba', count: 4, rows: 2, role: 'power-out', watts: 18, domain: 'power', conn: 'usba' },
        { k: 'in', label: 'AC IN (C7)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 3, volts: 120, domain: 'power', conn: 'iec' }
      ] },
  { id: 'superdanny-22ac-6usb', vendor: 'SuperDanny', name: 'Surge strip · 22 AC + 6 USB', model: '22AC-6USB-2100J',
      kind: 'power', flavor: 'vanilla', ru: 0, drawW: 0, budgetW: 1500, circuitA: 15, circuitV: 120,
      note: '1875 W / 15 A total · 2100 J surge rating · 6.5 ft cord. Continuous load kept to 1500 W (80% of 15 A).',
      groups: [
        { k: 'ac', label: 'AC outlets 1–22', glyph: 'nema', count: 22, rows: 2, role: 'power-out', amps: 15, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'usb', label: 'USB charging ×6', glyph: 'usba', count: 6, rows: 2, role: 'power-out', watts: 18, domain: 'power', conn: 'usba' },
        { k: 'in', label: 'Cord · NEMA 5-15P', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 15, volts: 120, domain: 'power', conn: 'iec' }
      ] },
  { id: 'cyberpower-cp1500avrlcd', vendor: 'CyberPower', name: 'UPS 1500VA / 900W AVR', model: 'CP1500AVRLCD',
      kind: 'power', flavor: 'vanilla', isBattery: true, ru: 0, drawW: 0, budgetW: 900, circuitA: 12, circuitV: 120,
      note: '1500 VA / 900 W · 12 outlets: 6 battery + surge, 6 surge only · AVR · mini-tower · USB data port for management',
      groups: [
        { k: 'bat', label: 'Battery + surge ×6', glyph: 'nema', count: 6, rows: 2, role: 'power-out', amps: 12, volts: 120, domain: 'power', conn: 'iec', batt: true },
        { k: 'sur', label: 'Surge only ×6', glyph: 'nema', count: 6, rows: 2, role: 'power-out', amps: 12, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'in', label: 'Cord · NEMA 5-15P', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 12, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'usb', label: 'USB data (mgmt)', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' }
      ] },
  { id: 'apc-be1050g3', vendor: 'APC', name: 'Back-UPS 1050VA / 600W', model: 'BE1050G3',
      kind: 'power', flavor: 'vanilla', isBattery: true, ru: 0, drawW: 0, budgetW: 600, circuitA: 12, circuitV: 120,
      note: '1050 VA / 600 W · 12 outlets: 6 battery + surge, 6 surge only · 2 USB charging ports (A + C)',
      groups: [
        { k: 'bat', label: 'Battery + surge ×6', glyph: 'nema', count: 6, rows: 2, role: 'power-out', amps: 12, volts: 120, domain: 'power', conn: 'iec', batt: true },
        { k: 'sur', label: 'Surge only ×6', glyph: 'nema', count: 6, rows: 2, role: 'power-out', amps: 12, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'in', label: 'Cord · NEMA 5-15P', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 12, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'uc', label: 'USB-C charge', glyph: 'usbc', count: 1, rows: 1, role: 'power-out', watts: 15, domain: 'power', conn: 'usbc' },
        { k: 'ua', label: 'USB-A charge', glyph: 'usba', count: 1, rows: 1, role: 'power-out', watts: 12, domain: 'power', conn: 'usba' }
      ] },
  { id: 'internet-service', vendor: 'Service', name: 'Internet', model: 'WAN service',
      kind: 'service', flavor: 'vanilla', ru: 0, drawW: 0, isInternet: true,
      note: 'The demarcation point — everything reachable from here is considered online. Set the subscribed rate on the hand-off port.',
      groups: [
        { k: 'hand', label: 'Service hand-off', glyph: 'lc', count: 1, rows: 1, role: 'wan', gbps: 8, domain: 'net', conn: 'sfp' }
      ] },
  { id: 'gfiber-8g-jack', vendor: 'Google Fiber', name: 'Fiber Jack · 8 Gig', model: 'GOXP330C',
      kind: 'wan', flavor: 'vanilla', ru: 0, drawW: 12, isInternet: true, note: '8 Gbps symmetric service · fiber in, 10 GbE RJ45 hand-off (service capped at 8 Gbps) · external DC brick',
      groups: [
        { k: 'fib', label: 'Fiber IN · SC/APC', glyph: 'lc', count: 1, rows: 1, role: 'wan', gbps: 8, domain: 'net', conn: 'sfp' },
        { k: 'lan', label: 'LAN OUT · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'qsfptek-10g-t', vendor: 'QSFPTEK', name: 'SFP+ to RJ45 10GBASE-T module', model: 'SFP-10G-T (QSFPTEK)',
      kind: 'transceiver', flavor: 'pro', ru: 0, drawW: 2.5,
      note: 'Copper 10GBASE-T transceiver · Cat6a/Cat7 · compatible with Cisco SFP-10G-T-S, Ubiquiti UF-RJ45-10G, Netgear, MikroTik, D-Link, Supermicro, TP-Link, Linksys · draws ~2.5 W from the host cage',
      groups: [
        { k: 'cage', label: 'SFP+ cage side', glyph: 'sfp', count: 1, rows: 1, role: 'module', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'rj', label: 'RJ45 10GBASE-T', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' }
      ] },
  { id: '10gtek-10g-t', vendor: '10Gtek', name: 'SFP+ to RJ45 10GBASE-T module', model: 'ASF-10G-T (10Gtek)',
      kind: 'transceiver', flavor: 'pro', ru: 0, drawW: 2.5,
      note: 'Copper 10GBASE-T transceiver · Cat6a to 30 m · compatible with Cisco SFP-10G-T-S, Meraki, Fortinet · draws ~2.5 W from the host cage',
      groups: [
        { k: 'cage', label: 'SFP+ cage side', glyph: 'sfp', count: 1, rows: 1, role: 'module', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'rj', label: 'RJ45 10GBASE-T · 30 m', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'ipolex-10g-t', vendor: 'ipolex', name: 'SFP+ to RJ45 multi-rate module', model: 'SFP-10G-T (ipolex)',
      kind: 'transceiver', flavor: 'pro', ru: 0, drawW: 2.5,
      note: 'Negotiates 1G / 2.5G / 5G / 10GBASE-T · up to 30 m · compatible with Cisco SFP-10G-T, Ubiquiti UACC-CM-RJ45-MG, MikroTik, Netgear, TP-Link, D-Link · draws ~2.5 W from the host cage',
      groups: [
        { k: 'cage', label: 'SFP+ cage side', glyph: 'sfp', count: 1, rows: 1, role: 'module', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'rj', label: 'RJ45 1/2.5/5/10G · 30 m', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'psu-12v-generic', vendor: 'Generic', name: 'Power adapter · 12V barrel', model: 'PSU-12V-24W',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 0, budgetW: 24, eff: 0.88,
      note: 'Output DC 12 V up to 2 A / 24 W · barrel tip. Placeholder for small 12 V bricks such as the one feeding a Fiber Jack — confirm polarity, tip size and rating against the unit on the shelf.',
      groups: [
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 1, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'dc', label: 'DC OUT 12 V 2 A', glyph: 'barrel', count: 1, rows: 1, role: 'power-out', watts: 24, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'poe-injector-60w', vendor: 'Generic', name: 'PoE++ injector · 60W', model: 'POE-INJ-60W',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 0, budgetW: 60, eff: 0.9,
      note: '802.3bt injector · gigabit data pass-through · 60 W to the powered device.',
      groups: [
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 1, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'data', label: 'DATA IN', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'poe', label: 'DATA + PoE OUT', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'patch-24', vendor: 'Generic', name: 'Patch panel · 24 port', model: 'PP-24-C6A',
      kind: 'passive', flavor: 'vanilla', ru: 1, drawW: 0, note: 'Keystone Cat6a, front/rear pass-through',
      groups: [
        { k: 'p', label: 'Ports 1–24', glyph: 'rj45', count: 24, rows: 2, role: 'passive', gbps: 10, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'display-generic', vendor: 'Generic', name: 'Display · 4K', model: 'MON-4K',
      kind: 'peripheral', flavor: 'studio', ru: 0, drawW: 60,
      groups: [
        { k: 'hdmi', label: 'HDMI IN ×2', glyph: 'hdmi', count: 2, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'usbc', label: 'USB-C DP IN', glyph: 'usbc', count: 1, rows: 1, role: 'video', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 60, domain: 'power', conn: 'iec' }
      ] },
  { id: 'nas-4bay', vendor: 'Generic', name: 'NAS · 4 bay', model: 'NAS-4B',
      kind: 'server', flavor: 'pro', ru: 0, drawW: 90,
      groups: [
        { k: 'eth', label: '2.5 GbE ×2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'usb', label: 'USB 3.2 ×2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'dc', label: 'DC IN', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 120, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'blank', vendor: '—', name: 'Blank device', model: 'custom',
      kind: 'other', flavor: 'vanilla', ru: 0, drawW: 0, note: 'Start empty and add your own ports',
      groups: [] }
]);
