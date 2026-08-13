/* RackWire device library — Ubiquiti networking.
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([
  { id: 'udm-pro-max', vendor: 'Ubiquiti', name: 'Dream Machine Pro Max', model: 'UDM-Pro-Max',
      kind: 'gateway', flavor: 'pro', ru: 1, upc: '', drawW: 40, note: '5 Gbps IPS routing, dual WAN, redundant NVR',
      groups: [
        { k: 'lan', label: 'LAN 1–8 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'wan', label: 'WAN 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'sfpwan', label: 'SFP+ WAN', glyph: 'sfp', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'sfplan', label: 'SFP+ LAN', glyph: 'sfp', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 100, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 150, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-pro-max-16-poe', vendor: 'Ubiquiti', name: 'Switch Pro Max 16 PoE', model: 'USW-Pro-Max-16-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 30, poeBudgetW: 180, note: '180 W PoE budget · 42 Gbps non-blocking',
      groups: [
        { k: 'ge', label: '1–12 · 1 GbE PoE+', glyph: 'rj45', count: 12, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'mg', label: '13–16 · 2.5 GbE PoE++', glyph: 'rj45', count: 4, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '17–18 · 10G SFP+', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'dc', label: 'DC IN 54 V 210 W', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 210, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-ultra', vendor: 'Ubiquiti', name: 'Switch Ultra', model: 'USW-Ultra',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 9, poeBudgetW: 42, note: 'PoE++ input powers switch; 42 W PoE out on PoE++ in, 202 W on 210 W adapter',
      groups: [
        { k: 'in', label: 'Port 1 · PoE++ IN', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 9, domain: 'net', conn: 'rj45' },
        { k: 'out', label: 'Ports 2–8 · 1 GbE PoE+', glyph: 'rj45', count: 7, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V (opt.)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 210, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'u7-pro', vendor: 'Ubiquiti', name: 'Access Point U7 Pro', model: 'U7-Pro',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 · powered by 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 13, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u7-pro-xgs', vendor: 'Ubiquiti', name: 'Access Point U7 Pro XGS', model: 'U7-Pro-XGS',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 · 10 GbE uplink · 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 10, poeDrawW: 21, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'uacc-ac-210w', vendor: 'Ubiquiti', name: 'Power adapter · 54V 210W', model: 'UACC-Adapter-AC-210W',
      kind: 'adapter', flavor: 'pro', ru: 0, drawW: 0, budgetW: 210, eff: 0.9,
      note: 'Output DC 54 V 3.9 A / 210.6 W · input AC 100–240 V 50/60 Hz · barrel tip. Ships with USW-Pro-Max-16-PoE (180 W PoE), USW-Ultra-210W, USW-Flex-2.5G-8-PoE, USW-Pro-XG-8-PoE, US-XG-6POE.',
      groups: [
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 2, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'dc', label: 'DC OUT 54 V 3.9 A', glyph: 'barrel', count: 1, rows: 1, role: 'power-out', watts: 210, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'uacc-ac-60w', vendor: 'Ubiquiti', name: 'Power adapter · 54V 60W', model: 'UACC-Adapter-AC-60W',
      kind: 'adapter', flavor: 'pro', ru: 0, drawW: 0, budgetW: 60, eff: 0.9,
      note: 'Output DC 54 V ~1.1 A / 60 W · input AC 100–240 V. The adapter shipped with USW-Ultra-60W; on a bare USW-Ultra it lifts PoE output above the 42 W available from PoE++ input.',
      groups: [
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 1, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'dc', label: 'DC OUT 54 V 60 W', glyph: 'barrel', count: 1, rows: 1, role: 'power-out', watts: 60, volts: 54, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- UniFi gateways / consoles ---- */
  { id: 'udm', vendor: 'Ubiquiti', name: 'Dream Machine', model: 'UDM',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 26, note: 'All-in-one WiFi 5 console · 4-port GbE switch · internal AC supply',
      groups: [
        { k: 'wan', label: 'WAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 1 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 26, domain: 'power', conn: 'iec' }
      ] },
  { id: 'udm-pro', vendor: 'Ubiquiti', name: 'Dream Machine Pro', model: 'UDM-Pro',
      kind: 'gateway', flavor: 'pro', ru: 1, drawW: 33, note: '3.5 Gbps IPS routing · 8-port GbE switch · 3.5" NVR bay',
      groups: [
        { k: 'lan', label: 'LAN 1–8 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'wan', label: 'WAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfpwan', label: 'SFP+ WAN', glyph: 'sfp', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'sfplan', label: 'SFP+ LAN', glyph: 'sfp', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 33, domain: 'power', conn: 'iec' }
      ] },
  { id: 'udm-se', vendor: 'Ubiquiti', name: 'Dream Machine Special Edition', model: 'UDM-SE',
      kind: 'gateway', flavor: 'pro', ru: 1, drawW: 50, poeBudgetW: 180, note: '50 W excl. PoE · 180 W PoE budget · 240 W internal supply',
      groups: [
        { k: 'poe', label: 'LAN 1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'wan', label: 'WAN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'sfpwan', label: 'SFP+ WAN', glyph: 'sfp', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'sfplan', label: 'SFP+ LAN', glyph: 'sfp', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 240, domain: 'power', conn: 'iec' }
      ] },
  { id: 'udr', vendor: 'Ubiquiti', name: 'Dream Router', model: 'UDR',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 19, poeBudgetW: 40, note: 'WiFi 6 console · 2 of 5 LAN ports are 802.3af PoE (15.4 W ea.) · 40 W PoE budget',
      groups: [
        { k: 'wan', label: 'WAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–3 · 1 GbE', glyph: 'rj45', count: 3, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'lanpoe', label: 'LAN 4–5 · 1 GbE PoE', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 15.4, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 50, domain: 'power', conn: 'iec' }
      ] },
  { id: 'udr7', vendor: 'Ubiquiti', name: 'Dream Router 7', model: 'UDR7',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 26, poeBudgetW: 15, note: 'WiFi 7 console · 4× 2.5 GbE (1 with 15.4 W PoE) + 10G SFP+ · 50 W internal supply',
      groups: [
        { k: 'wan', label: 'WAN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN · 2.5 GbE', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'lanpoe', label: 'LAN · 2.5 GbE PoE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 2.5, poe: 'poe+', poeW: 15.4, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ · 10G', glyph: 'sfp', count: 1, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 50, domain: 'power', conn: 'iec' }
      ] },
  { id: 'uxg-lite', vendor: 'Ubiquiti', name: 'Gateway Lite', model: 'UXG-Lite',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 4, note: '1 Gbps IPS routing · 2× GbE RJ45 · USB-C 5 V 3 A powered',
      groups: [
        { k: 'wan', label: 'WAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 5 V 3 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'uxg-pro', vendor: 'Ubiquiti', name: 'Gateway Pro', model: 'UXG-Pro',
      kind: 'gateway', flavor: 'pro', ru: 1, drawW: 30, note: '2× 10G SFP+ and 2× GbE RJ45 · 50 W internal supply · USP-RPS DC backup',
      groups: [
        { k: 'rj', label: 'RJ45 1–2 · 1 GbE', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 50, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 50, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'uxg-max', vendor: 'Ubiquiti', name: 'Gateway Max', model: 'UXG-Max',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 10, note: '5× 2.5 GbE RJ45 · 2 Gbps IPS routing · USB-C 5 V 3 A powered',
      groups: [
        { k: 'wan', label: 'WAN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 2.5 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 5 V 3 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ucg-ultra', vendor: 'Ubiquiti', name: 'Cloud Gateway Ultra', model: 'UCG-Ultra',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 6, note: '1 Gbps IPS routing · 2.5 GbE WAN + 4× GbE LAN · USB-C 5 V 3 A powered',
      groups: [
        { k: 'wan', label: 'WAN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 1 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 5 V 3 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ucg-max', vendor: 'Ubiquiti', name: 'Cloud Gateway Max', model: 'UCG-Max',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 16, note: '2.3 Gbps IPS routing · 5× 2.5 GbE RJ45 · 512 GB NVR · USB-C 5 V 5 A powered',
      groups: [
        { k: 'wan', label: 'WAN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 2.5 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 5 V 5 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ucg-fiber', vendor: 'Ubiquiti', name: 'Cloud Gateway Fiber', model: 'UCG-Fiber',
      kind: 'gateway', flavor: 'pro', ru: 0, drawW: 29, poeBudgetW: 30, note: '5 Gbps IPS routing · 10 GbE RJ45 + 2× 10G SFP+ · one 2.5 GbE LAN port is PoE+ 30 W · 54 V DC barrel input',
      groups: [
        { k: 'wan', label: 'WAN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'lan', label: 'LAN 1–3 · 2.5 GbE', glyph: 'rj45', count: 3, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'lanpoe', label: 'LAN 4 · 2.5 GbE PoE+', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 2.5, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V 1.1 A', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 60, volts: 54, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- UniFi switches ---- */
  { id: 'usw-lite-8-poe', vendor: 'Ubiquiti', name: 'Switch Lite 8 PoE', model: 'USW-Lite-8-PoE',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 60, poeBudgetW: 52, note: '60 W incl. PoE (8 W excl.) · 4 of 8 ports PoE+ · external 60 W DC adapter',
      groups: [
        { k: 'ge', label: 'Ports 1–4 · 1 GbE PoE+', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'ge2', label: 'Ports 5–8 · 1 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V 60 W', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 60, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-lite-16-poe', vendor: 'Ubiquiti', name: 'Switch Lite 16 PoE', model: 'USW-Lite-16-PoE',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 60, poeBudgetW: 45, note: '60 W incl. PoE (15 W excl.) · 8 of 16 ports PoE+ · internal AC supply, desktop/wall',
      groups: [
        { k: 'ge', label: 'Ports 1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'ge2', label: 'Ports 9–16 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 60, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-16-poe', vendor: 'Ubiquiti', name: 'Switch Standard 16 PoE', model: 'USW-16-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 60, poeBudgetW: 42, note: '60 W incl. PoE (18 W excl.) · 8 of 16 ports PoE+ · 2× 1G SFP',
      groups: [
        { k: 'poe', label: 'Ports 1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'ge', label: 'Ports 9–16 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP 1–2 · 1G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'mgmt', label: 'Mgmt · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'data', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 60, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-24-poe', vendor: 'Ubiquiti', name: 'Switch Standard 24 PoE', model: 'USW-24-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 120, poeBudgetW: 95, note: '120 W incl. PoE (25 W excl.) · 16 of 24 ports PoE+ · 2× 1G SFP',
      groups: [
        { k: 'poe', label: 'Ports 1–16 · 1 GbE PoE+', glyph: 'rj45', count: 16, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'ge', label: 'Ports 17–24 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP 1–2 · 1G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'mgmt', label: 'Mgmt · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'data', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 120, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-48-poe', vendor: 'Ubiquiti', name: 'Switch Standard 48 PoE', model: 'USW-48-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 240, poeBudgetW: 195, note: '240 W incl. PoE (45 W excl.) · 32 of 48 ports PoE+ · 4× 1G SFP',
      groups: [
        { k: 'poe', label: 'Ports 1–32 · 1 GbE PoE+', glyph: 'rj45', count: 32, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'ge', label: 'Ports 33–48 · 1 GbE', glyph: 'rj45', count: 16, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP 1–4 · 1G', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'mgmt', label: 'Mgmt · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'data', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 240, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-pro-24', vendor: 'Ubiquiti', name: 'Switch Pro 24', model: 'USW-Pro-24',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 30, note: 'Non-PoE L3 switch · 24× GbE + 2× 10G SFP+ · AC or USP-RPS DC',
      groups: [
        { k: 'ge', label: 'Ports 1–24 · 1 GbE', glyph: 'rj45', count: 24, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 36, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 36, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-pro-48', vendor: 'Ubiquiti', name: 'Switch Pro 48', model: 'USW-Pro-48',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 60, note: 'Non-PoE L3 switch · 48× GbE + 4× 10G SFP+ · AC or USP-RPS DC',
      groups: [
        { k: 'ge', label: 'Ports 1–48 · 1 GbE', glyph: 'rj45', count: 48, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–4 · 10G', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 60, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 60, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-pro-24-poe', vendor: 'Ubiquiti', name: 'Switch Pro 24 PoE', model: 'USW-Pro-24-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 450, poeBudgetW: 400, note: '450 W incl. PoE (50 W excl.) · 16 PoE+ + 8 PoE++ GbE ports · 2× 10G SFP+',
      groups: [
        { k: 'poe', label: 'Ports 1–16 · 1 GbE PoE+', glyph: 'rj45', count: 16, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'poebt', label: 'Ports 17–24 · 1 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'mgmt', label: 'Mgmt · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'data', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 450, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-pro-48-poe', vendor: 'Ubiquiti', name: 'Switch Pro 48 PoE', model: 'USW-Pro-48-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 660, poeBudgetW: 600, note: '660 W incl. PoE (60 W excl.) · 40 PoE+ + 8 PoE++ GbE ports · 4× 10G SFP+',
      groups: [
        { k: 'poe', label: 'Ports 1–40 · 1 GbE PoE+', glyph: 'rj45', count: 40, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'poebt', label: 'Ports 41–48 · 1 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–4 · 10G', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'mgmt', label: 'Mgmt · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'data', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 660, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-pro-max-24-poe', vendor: 'Ubiquiti', name: 'Switch Pro Max 24 PoE', model: 'USW-Pro-Max-24-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 450, poeBudgetW: 400, note: '450 W incl. PoE (50 W excl.) · 8 GbE PoE+ · 8 GbE PoE++ · 8× 2.5 GbE PoE++ · 2× 10G SFP+',
      groups: [
        { k: 'poe', label: 'Ports 1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'poebt', label: 'Ports 9–16 · 1 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' },
        { k: 'mg', label: 'Ports 17–24 · 2.5 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 450, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-pro-max-48-poe', vendor: 'Ubiquiti', name: 'Switch Pro Max 48 PoE', model: 'USW-Pro-Max-48-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 820, poeBudgetW: 720, note: '820 W incl. PoE (100 W excl.) · 24 GbE PoE+ · 8 GbE PoE++ · 8× 2.5 GbE PoE+ · 8× 2.5 GbE PoE++ · 4× 10G SFP+',
      groups: [
        { k: 'poe', label: 'Ports 1–24 · 1 GbE PoE+', glyph: 'rj45', count: 24, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'poebt', label: 'Ports 25–32 · 1 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe++', poeW: 64, domain: 'net', conn: 'rj45' },
        { k: 'mg', label: 'Ports 33–40 · 2.5 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'mgbt', label: 'Ports 41–48 · 2.5 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe++', poeW: 64, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–4 · 10G', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 870, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-enterprise-24-poe', vendor: 'Ubiquiti', name: 'Switch Enterprise 24 PoE', model: 'USW-Enterprise-24-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 460, poeBudgetW: 400, note: '460 W incl. PoE (60 W excl.) · 12 GbE + 12× 2.5 GbE, all PoE+ · 2× 10G SFP+',
      groups: [
        { k: 'ge', label: 'Ports 1–12 · 1 GbE PoE+', glyph: 'rj45', count: 12, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'mg', label: 'Ports 13–24 · 2.5 GbE PoE+', glyph: 'rj45', count: 12, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 460, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-enterprise-48-poe', vendor: 'Ubiquiti', name: 'Switch Enterprise 48 PoE', model: 'USW-Enterprise-48-PoE',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 870, poeBudgetW: 720, note: '870 W incl. PoE (150 W excl.) · 48× 2.5 GbE PoE+ · 4× 10G SFP+',
      groups: [
        { k: 'mg', label: 'Ports 1–48 · 2.5 GbE PoE+', glyph: 'rj45', count: 48, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe+', poeW: 32, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ 1–4 · 10G', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 870, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-enterprise-xg-24', vendor: 'Ubiquiti', name: 'Switch Enterprise XG 24', model: 'USW-EnterpriseXG-24',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 100, note: '24× 10 GbE RJ45 + 2× 25G SFP28 · 580 Gbps switching · AC or USP-RPS DC',
      groups: [
        { k: 'xg', label: 'Ports 1–24 · 10 GbE', glyph: 'rj45', count: 24, rows: 2, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'sfp28', label: 'SFP28 1–2 · 25G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 25, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 100, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 100, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-aggregation', vendor: 'Ubiquiti', name: 'Switch Aggregation', model: 'USW-Aggregation',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 36, note: '8× 10G SFP+ · 36 W incl. optics · internal AC supply',
      groups: [
        { k: 'sfp', label: 'SFP+ 1–8 · 10G', glyph: 'sfp', count: 8, rows: 2, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 36, domain: 'power', conn: 'iec' }
      ] },
  { id: 'usw-pro-aggregation', vendor: 'Ubiquiti', name: 'Switch Pro Aggregation', model: 'USW-Pro-Aggregation',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 100, note: '28× 10G SFP+ + 4× 25G SFP28 · 760 Gbps switching · AC or USP-RPS DC',
      groups: [
        { k: 'sfp', label: 'SFP+ 1–28 · 10G', glyph: 'sfp', count: 28, rows: 2, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'sfp28', label: 'SFP28 1–4 · 25G', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 25, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 100, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 100, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'usw-flex', vendor: 'Ubiquiti', name: 'Switch Flex', model: 'USW-Flex',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 5, poeBudgetW: 46, note: 'Outdoor-rated 5-port · PoE++ in on port 1 powers switch · 46 W PoE out on PoE++ input, 20 W on PoE+',
      groups: [
        { k: 'in', label: 'Port 1 · PoE++ IN', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 51, domain: 'net', conn: 'rj45' },
        { k: 'out', label: 'Ports 2–5 · 1 GbE PoE+', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 25, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'usw-flex-mini', vendor: 'Ubiquiti', name: 'Switch Flex Mini', model: 'USW-Flex-Mini',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 3, note: '5× GbE · 2.5 W max · powered by PoE on port 1 or USB-C 5 V 1 A · no PoE output',
      groups: [
        { k: 'in', label: 'Port 1 · PoE IN / uplink', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 3, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'Ports 2–5 · 1 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 5 V 1 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 5, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'usw-flex-xg', vendor: 'Ubiquiti', name: 'Switch Flex XG', model: 'USW-Flex-XG',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 25, note: '4× 10 GbE RJ45 + 1 GbE management/uplink · powered by PoE+ or USB-C 5 V 5 A · no PoE output',
      groups: [
        { k: 'in', label: 'Mgmt · 1 GbE PoE+ IN', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 25, domain: 'net', conn: 'rj45' },
        { k: 'xg', label: 'Ports 1–4 · 10 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 5 V 5 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 25, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'usw-flex-2-5g-8-poe', vendor: 'Ubiquiti', name: 'Switch Flex 2.5G 8 PoE', model: 'USW-Flex-2.5G-8-PoE',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 210, poeBudgetW: 196, note: '210 W incl. PoE on the 210 W adapter (196 W PoE budget); 76 W budget on PoE+++ input · 8× 2.5 GbE PoE++ out',
      groups: [
        { k: 'in', label: 'Uplink · 10 GbE PoE+++ IN', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 10, poeDrawW: 90, domain: 'net', conn: 'rj45' },
        { k: 'out', label: 'Ports 1–8 · 2.5 GbE PoE++', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 2.5, poe: 'poe++', poeW: 64, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: 'SFP+ · 10G', glyph: 'sfp', count: 1, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'dc', label: 'DC IN 54 V 210 W', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 210, volts: 54, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- UniFi access points ---- */
  { id: 'u6-plus', vendor: 'Ubiquiti', name: 'Access Point U6+', model: 'U6+',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 2×2 · 9 W max · 802.3af PoE',
      groups: [
        { k: 'eth', label: 'PoE IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 9, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u6-lite', vendor: 'Ubiquiti', name: 'Access Point U6 Lite', model: 'U6-Lite',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 2×2 · 12 W max · 802.3af PoE',
      groups: [
        { k: 'eth', label: 'PoE IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 12, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u6-lr', vendor: 'Ubiquiti', name: 'Access Point U6 Long-Range', model: 'U6-LR',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 4×4 long-range · 18.5 W max · requires 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 18.5, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u6-pro', vendor: 'Ubiquiti', name: 'Access Point U6 Pro', model: 'U6-Pro',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 4×4 · 13 W max · 802.3af PoE',
      groups: [
        { k: 'eth', label: 'PoE IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 13, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u6-enterprise', vendor: 'Ubiquiti', name: 'Access Point U6 Enterprise', model: 'U6-Enterprise',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6E tri-band · 2.5 GbE uplink · 22 W max · requires 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 22, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u6-mesh', vendor: 'Ubiquiti', name: 'Access Point U6 Mesh', model: 'U6-Mesh',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 outdoor mesh · 13 W max · 802.3af PoE (adapter included)',
      groups: [
        { k: 'eth', label: 'PoE IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 13, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u6-iw', vendor: 'Ubiquiti', name: 'Access Point U6 In-Wall', model: 'U6-IW',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 wall-plate · 13 W excl. passthrough · 4-port GbE switch, 1 port PoE out (needs PoE+ input)',
      groups: [
        { k: 'in', label: 'PoE+ IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 13, domain: 'net', conn: 'rj45' },
        { k: 'out', label: 'Data out 1–3 · 1 GbE', glyph: 'rj45', count: 3, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'outpoe', label: 'Data out 4 · 1 GbE PoE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 15.4, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u7-lite', vendor: 'Ubiquiti', name: 'Access Point U7 Lite', model: 'U7-Lite',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 2×2 · 2.5 GbE uplink · 13 W max · 802.3af PoE',
      groups: [
        { k: 'eth', label: 'PoE IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 13, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u7-pro-max', vendor: 'Ubiquiti', name: 'Access Point U7 Pro Max', model: 'U7-Pro-Max',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 tri-band 6 GHz 4×4 · 2.5 GbE uplink · 25 W max · requires 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 25, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u7-pro-wall', vendor: 'Ubiquiti', name: 'Access Point U7 Pro Wall', model: 'U7-Pro-Wall',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 wall-mount · single 2.5 GbE uplink, no downstream ports · 22 W max · requires 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 22, domain: 'net', conn: 'rj45' }
      ] },
  { id: 'u7-outdoor', vendor: 'Ubiquiti', name: 'Access Point U7 Outdoor', model: 'U7-Outdoor',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 outdoor · 2.5 GbE uplink · 19 W max · requires 802.3at PoE+',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 19, domain: 'net', conn: 'rj45' }
      ] },

  /* ---- UniFi storage / consoles ---- */
  { id: 'unas-pro', vendor: 'Ubiquiti', name: 'UNAS Pro', model: 'UNAS-Pro',
      kind: 'server', flavor: 'pro', ru: 2, drawW: 160, note: '7-bay 3.5" NAS · 10G SFP+ + GbE RJ45 · 200 W internal supply, 135 W drive budget · USP-RPS DC backup',
      groups: [
        { k: 'sfp', label: 'SFP+ · 10G', glyph: 'sfp', count: 1, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'rj', label: 'LAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 200, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 160, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'unas-pro-4', vendor: 'Ubiquiti', name: 'UNAS Pro 4', model: 'UNAS-Pro-4',
      kind: 'server', flavor: 'pro', ru: 1, drawW: 150, note: '4-bay 1U NAS + 2× M.2 NVMe · 2× 10G SFP+ + GbE RJ45 · 150 W supply, 125 W drive budget',
      groups: [
        { k: 'sfp', label: 'SFP+ 1–2 · 10G', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'rj', label: 'LAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 150, domain: 'power', conn: 'iec' },
        { k: 'rps', label: 'USP-RPS DC', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 150, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'uck-g2-plus', vendor: 'Ubiquiti', name: 'Cloud Key Gen2 Plus', model: 'UCK-G2-Plus',
      kind: 'server', flavor: 'pro', ru: 0, drawW: 13, note: 'UniFi OS console + NVR with 1 TB HDD · 12.95 W · 802.3af PoE or USB-C QC adapter',
      groups: [
        { k: 'eth', label: 'PoE IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 13, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'USB-C IN 9 V 2 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 18, volts: 9, domain: 'power', conn: 'usbc' }
      ] },

  /* ---- PoE injectors ---- */
  { id: 'u-poe-plusplus', vendor: 'Ubiquiti', name: 'PoE++ Adapter · 60 W', model: 'U-PoE++',
      kind: 'adapter', flavor: 'pro', ru: 0, drawW: 0, budgetW: 60, eff: 0.88,
      note: '802.3bt injector · 48 V DC / 1.25 A / 60 W out · AC 100–240 V in · surge and overcurrent protection on the output port',
      groups: [
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 70, domain: 'power', conn: 'iec' },
        { k: 'data', label: 'DATA IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'data', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'poe', label: 'POE OUT · 1 GbE PoE++', glyph: 'rj45', count: 1, rows: 1, role: 'power-out', gbps: 1, poe: 'poe++', poeW: 60, domain: 'net', conn: 'rj45' }
      ] }
]);
