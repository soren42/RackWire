/* RackWire device library — Netgear networking.
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([

  /* ---- Unmanaged desktop switches (home/SOHO) ---- */
  { id: 'ngr-gs105', vendor: 'Netgear', name: 'GS105 5-Port Gigabit', model: 'GS105',
      kind: 'switch', flavor: 'vanilla', ru: 0, drawW: 3, note: 'Plug-and-play 5× GbE · metal case · external DC adapter',
      groups: [
        { k: 'ge', label: '1–5 · 1 GbE', glyph: 'rj45', count: 5, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 12, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs108', vendor: 'Netgear', name: 'GS108 8-Port Gigabit', model: 'GS108',
      kind: 'switch', flavor: 'vanilla', ru: 0, drawW: 5, note: 'Plug-and-play 8× GbE · metal case · external DC adapter',
      groups: [
        { k: 'ge', label: '1–8 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 12, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs305', vendor: 'Netgear', name: 'GS305 5-Port Gigabit', model: 'GS305',
      kind: 'switch', flavor: 'vanilla', ru: 0, drawW: 3, note: 'Plug-and-play 5× GbE · compact metal case · external DC adapter',
      groups: [
        { k: 'ge', label: '1–5 · 1 GbE', glyph: 'rj45', count: 5, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 5 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 3.5, volts: 5, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs308', vendor: 'Netgear', name: 'GS308 8-Port Gigabit', model: 'GS308',
      kind: 'switch', flavor: 'vanilla', ru: 0, drawW: 4, note: 'Plug-and-play 8× GbE · compact metal case · external DC adapter',
      groups: [
        { k: 'ge', label: '1–8 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 6, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs316', vendor: 'Netgear', name: 'GS316 16-Port Gigabit', model: 'GS316',
      kind: 'switch', flavor: 'vanilla', ru: 0, drawW: 8, note: 'Plug-and-play 16× GbE · metal case · external DC adapter',
      groups: [
        { k: 'ge', label: '1–16 · 1 GbE', glyph: 'rj45', count: 16, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 12, volts: 12, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- Unmanaged PoE switches ---- */
  { id: 'ngr-gs108lp', vendor: 'Netgear', name: 'GS108LP 8-Port Gigabit PoE+', model: 'GS108LP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 5, poeBudgetW: 60, note: 'Plug-and-play · 8× GbE all PoE+ · 60 W PoE budget · external 54 V DC adapter',
      groups: [
        { k: 'poe', label: '1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 67.5, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs108pp', vendor: 'Netgear', name: 'GS108PP 8-Port Gigabit PoE+', model: 'GS108PP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 6, poeBudgetW: 123, note: 'Plug-and-play · 8× GbE all PoE+ · 123 W PoE budget · external 54 V DC adapter',
      groups: [
        { k: 'poe', label: '1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 130, volts: 54, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- Smart Managed Plus switches ---- */
  { id: 'ngr-gs305e', vendor: 'Netgear', name: 'GS305E 5-Port Smart Managed Plus', model: 'GS305E',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 3, note: 'Web-managed 5× GbE · VLAN/QoS · external DC adapter',
      groups: [
        { k: 'ge', label: '1–5 · 1 GbE', glyph: 'rj45', count: 5, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 6, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs308e', vendor: 'Netgear', name: 'GS308E 8-Port Smart Managed Plus', model: 'GS308E',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 4, note: 'Web-managed 8× GbE · VLAN/QoS · external DC adapter',
      groups: [
        { k: 'ge', label: '1–8 · 1 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 6, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs305ep', vendor: 'Netgear', name: 'GS305EP 5-Port Smart Managed Plus PoE+', model: 'GS305EP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 5, poeBudgetW: 63, note: 'Web-managed · 4 of 5 ports PoE+ · 63 W PoE budget · external 54 V supply',
      groups: [
        { k: 'poe', label: '1–4 · 1 GbE PoE+', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'ge', label: '5 · 1 GbE uplink', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 72, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs305epp', vendor: 'Netgear', name: 'GS305EPP 5-Port Smart Managed Plus PoE+', model: 'GS305EPP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 5, poeBudgetW: 120, note: 'Web-managed · 4 of 5 ports PoE+ · 120 W PoE budget · external 54 V supply',
      groups: [
        { k: 'poe', label: '1–4 · 1 GbE PoE+', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'ge', label: '5 · 1 GbE uplink', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 134, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs308ep', vendor: 'Netgear', name: 'GS308EP 8-Port Smart Managed Plus PoE+', model: 'GS308EP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 6, poeBudgetW: 62, note: 'Web-managed · 8× GbE all PoE+ · 62 W PoE budget · external 54 V supply',
      groups: [
        { k: 'poe', label: '1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 72, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs308epp', vendor: 'Netgear', name: 'GS308EPP 8-Port Smart Managed Plus PoE+', model: 'GS308EPP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 7, poeBudgetW: 123, note: 'Web-managed · 8× GbE all PoE+ · 123 W PoE budget · external 54 V supply',
      groups: [
        { k: 'poe', label: '1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 140, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs310tp', vendor: 'Netgear', name: 'GS310TP 8-Port Smart Managed Pro PoE+', model: 'GS310TP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 8, poeBudgetW: 55, note: 'Fully managed · 8× GbE PoE+ + 2× 1G SFP · 55 W PoE budget · external 54 V supply',
      groups: [
        { k: 'poe', label: '1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '9–10 · 1G SFP', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 66, volts: 54, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-gs316ep', vendor: 'Netgear', name: 'GS316EP 16-Port Smart Managed Plus PoE+', model: 'GS316EP',
      kind: 'switch', flavor: 'pro', ru: 0, drawW: 10, poeBudgetW: 180, note: 'Web-managed · 15× GbE PoE+ + 1× GbE + 1× 1G SFP · 180 W PoE budget · external 54 V DC adapter',
      groups: [
        { k: 'poe', label: '1–15 · 1 GbE PoE+', glyph: 'rj45', count: 15, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'ge', label: '16 · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '17 · 1G SFP', glyph: 'sfp', count: 1, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'dc', label: 'DC IN 54 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 200, volts: 54, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- Smart Managed Pro rack switches (S3300 / GS700 series) ---- */
  { id: 'ngr-gs724t', vendor: 'Netgear', name: 'GS724T 24-Port Smart Managed Pro', model: 'GS724Tv6',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 13.5, note: 'Fully managed L2+ · 24× GbE + 2× 1G SFP · internal AC supply',
      groups: [
        { k: 'ge', label: '1–24 · 1 GbE', glyph: 'rj45', count: 24, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '25–26 · 1G SFP', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 30, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ngr-gs724tpv2', vendor: 'Netgear', name: 'GS724TP 24-Port Smart Managed Pro PoE+', model: 'GS724TPv2',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 30, poeBudgetW: 190, note: 'Fully managed L2+ · 24× GbE PoE+ + 2× 1G SFP · 190 W PoE budget · internal AC supply',
      groups: [
        { k: 'poe', label: '1–24 · 1 GbE PoE+', glyph: 'rj45', count: 24, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '25–26 · 1G SFP', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 240, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ngr-gs728tp', vendor: 'Netgear', name: 'GS728TP 28-Port Smart Managed Pro PoE+', model: 'GS728TPv2',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 30, poeBudgetW: 190, note: 'Fully managed L2+ · 24× GbE PoE+ + 4× 1G SFP · 190 W PoE budget · internal AC supply',
      groups: [
        { k: 'poe', label: '1–24 · 1 GbE PoE+', glyph: 'rj45', count: 24, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '25–28 · 1G SFP', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 240, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ngr-gs748t', vendor: 'Netgear', name: 'GS748T 48-Port Smart Managed Pro', model: 'GS748T',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 40, note: 'Fully managed L2+ · 48× GbE + 4× 1G SFP (2 combo) · internal AC supply',
      groups: [
        { k: 'ge', label: '1–48 · 1 GbE', glyph: 'rj45', count: 48, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '49–52 · 1G SFP', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 55, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ngr-gs752tp', vendor: 'Netgear', name: 'GS752TP 52-Port Smart Managed Pro PoE+', model: 'GS752TPv2',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 45, poeBudgetW: 380, note: 'Fully managed L2+ · 48× GbE PoE+ + 4× 1G SFP · 380 W PoE budget · internal AC supply',
      groups: [
        { k: 'poe', label: '1–48 · 1 GbE PoE+', glyph: 'rj45', count: 48, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '49–52 · 1G SFP', glyph: 'sfp', count: 4, rows: 1, role: 'uplink', gbps: 1, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 450, domain: 'power', conn: 'iec' }
      ] },

  /* ---- 10-Gigabit ProSAFE / Smart Managed switches ---- */
  { id: 'ngr-xs708t', vendor: 'Netgear', name: 'XS708T 8-Port 10-Gigabit Smart Managed Pro', model: 'XS708T',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 55, note: 'Fully managed · 8× 10GBASE-T + 2× 10G SFP+ (ports 7–8 combo) · internal AC supply',
      groups: [
        { k: 'xg', label: '1–8 · 10 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '7–8 · 10G SFP+ (combo)', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 90, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ngr-xs716t', vendor: 'Netgear', name: 'XS716T 16-Port 10-Gigabit Smart Managed Pro', model: 'XS716T',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 85, note: 'Fully managed · 16× 10GBASE-T + 2× 10G SFP+ (combo) · internal AC supply',
      groups: [
        { k: 'xg', label: '1–16 · 10 GbE', glyph: 'rj45', count: 16, rows: 2, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '15–16 · 10G SFP+ (combo)', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 150, domain: 'power', conn: 'iec' }
      ] },

  /* ---- M4250 AV-line managed switches ---- */
  { id: 'ngr-m4250-8g2xf-poe', vendor: 'Netgear', name: 'M4250-8G2XF-PoE+ AV Line', model: 'GSM4210PX',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 22, poeBudgetW: 220, note: 'Fully managed AV L2+/L3-lite · 8× 1G PoE+ + 2× 1G/10G SFP+ · 220 W PoE budget · internal AC supply',
      groups: [
        { k: 'poe', label: '1–8 · 1 GbE PoE+', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 1, poe: 'poe+', poeW: 30, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '9–10 · 1G/10G SFP+', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 280, domain: 'power', conn: 'iec' }
      ] },

  /* ---- M4300 fully-managed stackable switches ---- */
  { id: 'ngr-m4300-8x8f', vendor: 'Netgear', name: 'M4300-8X8F Stackable', model: 'XSM4316S',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 49, note: 'Fully managed L3 stackable · 8× 10GBASE-T + 8× 10G SFP+ · one included APS250W AC supply',
      groups: [
        { k: 'xg', label: '1–8 · 10 GbE', glyph: 'rj45', count: 8, rows: 2, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '9–16 · 10G SFP+', glyph: 'sfp', count: 8, rows: 2, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 250, domain: 'power', conn: 'iec' }
      ] },
  { id: 'ngr-m4300-52g', vendor: 'Netgear', name: 'M4300-52G Stackable', model: 'GSM4352S',
      kind: 'switch', flavor: 'pro', ru: 1, drawW: 47.4, note: 'Fully managed L3 stackable · 48× 1G + 2× 10GBASE-T + 2× 10G SFP+ · one included APS150W AC supply · second bay optional (redundant)',
      groups: [
        { k: 'ge', label: '1–48 · 1 GbE', glyph: 'rj45', count: 48, rows: 2, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'xg', label: '49–50 · 10 GbE', glyph: 'rj45', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'sfp', label: '51–52 · 10G SFP+', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
        { k: 'ac', label: 'AC IN 100–240 V', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 150, domain: 'power', conn: 'iec' }
      ] },

  /* ---- Insight/business access points (WAX / WBE) ---- */
  { id: 'ngr-wax610', vendor: 'Netgear', name: 'Insight WAX610 WiFi 6', model: 'WAX610',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 AX1800 · 2.5 GbE PoE+ uplink · 802.3at or optional 12 V DC',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 15.3, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V (opt)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 30, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-wax615', vendor: 'Netgear', name: 'Insight WAX615 WiFi 6', model: 'WAX615',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 AX3000 · 2.5 GbE PoE+ uplink · 802.3at or optional 12 V DC',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 21.2, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V (opt)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 30, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-wax620', vendor: 'Netgear', name: 'Insight WAX620 WiFi 6', model: 'WAX620',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 AX3600 · 2.5 GbE PoE+ uplink · 802.3at or optional 12 V DC',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 2.5, poeDrawW: 25.5, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V (opt)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 30, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-wax218', vendor: 'Netgear', name: 'WAX218 WiFi 6', model: 'WAX218',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 6 AX3600 · 1 GbE PoE+ uplink · 802.3at or optional 12 V DC',
      groups: [
        { k: 'eth', label: 'PoE+ IN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 1, poeDrawW: 19.5, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V (opt)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 30, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-wbe750', vendor: 'Netgear', name: 'Insight WBE750 WiFi 7', model: 'WBE750',
      kind: 'ap', flavor: 'pro', ru: 0, drawW: 0, note: 'WiFi 7 BE18400 (18.4 Gbps) tri-band · 10G PoE++ uplink · 802.3bt or optional 12 V DC',
      groups: [
        { k: 'eth', label: 'PoE++ IN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', gbps: 10, poeDrawW: 39, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V (opt)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 42, volts: 12, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- Nighthawk routers (home) ---- */
  { id: 'ngr-rax50', vendor: 'Netgear', name: 'Nighthawk AX5400 WiFi 6', model: 'RAX50',
      kind: 'gateway', flavor: 'vanilla', ru: 0, drawW: 25, note: 'WiFi 6 AX5400 dual-band router · 1G WAN + 4× 1G LAN + USB 3.0 · external DC adapter',
      groups: [
        { k: 'wan', label: 'WAN · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 1 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb', label: 'USB 3.0', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 30, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-rs700s', vendor: 'Netgear', name: 'Nighthawk BE19000 WiFi 7', model: 'RS700S',
      kind: 'gateway', flavor: 'vanilla', ru: 0, drawW: 40, note: 'WiFi 7 BE19000 tri-band router · 10G WAN + 10G LAN + 4× 1G LAN + USB 3.0 · external DC adapter',
      groups: [
        { k: 'wan', label: 'WAN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'lanxg', label: 'LAN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 1 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb', label: 'USB 3.0', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'dc', label: 'DC IN 19 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 60, volts: 19, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- Orbi mesh systems (home) ---- */
  { id: 'ngr-rbre970', vendor: 'Netgear', name: 'Orbi 970 Router (BE27000)', model: 'RBRE970',
      kind: 'gateway', flavor: 'vanilla', ru: 0, drawW: 30, note: 'WiFi 7 BE27000 quad-band Orbi mesh router · 10G WAN + 10G LAN + 4× 2.5G LAN · external DC adapter',
      groups: [
        { k: 'wan', label: 'WAN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'wan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'lanxg', label: 'LAN · 10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'lan', label: 'LAN 1–4 · 2.5 GbE', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 19 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 60, volts: 19, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- DOCSIS 3.1 cable modems (home) ---- */
  { id: 'ngr-cm1000', vendor: 'Netgear', name: 'CM1000 DOCSIS 3.1 Cable Modem', model: 'CM1000',
      kind: 'wan', flavor: 'vanilla', ru: 0, drawW: 10, note: 'DOCSIS 3.1 cable modem · coax F-connector in · 1 GbE out · external DC adapter',
      groups: [
        { k: 'coax', label: 'Coax F · DOCSIS 3.1', glyph: 'bnc', count: 1, rows: 1, role: 'wan', domain: 'other', conn: 'bnc' },
        { k: 'eth', label: 'Ethernet · 1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 30, volts: 12, domain: 'power', conn: 'barrel' }
      ] },
  { id: 'ngr-cm2000', vendor: 'Netgear', name: 'CM2000 DOCSIS 3.1 Cable Modem', model: 'CM2000',
      kind: 'wan', flavor: 'vanilla', ru: 0, drawW: 12, note: 'DOCSIS 3.1 multi-gig cable modem · coax F-connector in · 2.5 GbE out · external DC adapter',
      groups: [
        { k: 'coax', label: 'Coax F · DOCSIS 3.1', glyph: 'bnc', count: 1, rows: 1, role: 'wan', domain: 'other', conn: 'bnc' },
        { k: 'eth', label: 'Ethernet · 2.5 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 2.5, domain: 'net', conn: 'rj45' },
        { k: 'dc', label: 'DC IN 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 18, volts: 12, domain: 'power', conn: 'barrel' }
      ] }

]);
