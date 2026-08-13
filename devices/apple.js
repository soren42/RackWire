/* RackWire device library — Apple.
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([
  { id: 'macmini-m4pro', vendor: 'Apple', name: 'Mac mini (M4 Pro)', model: 'Mac mini M4 Pro',
      kind: 'server', flavor: 'studio', ru: 0, drawW: 155, note: 'Thunderbolt 5 ×3 rear · 10 GbE option · 2 front USB-C',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'eth', label: '10 GbE (BTO)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'fusb', label: 'Front USB-C ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 155, domain: 'power', conn: 'iec' }
      ] },
  { id: 'macmini-psu', vendor: 'Apple', name: 'Mac mini internal PSU · 155W', model: '661-43677 / PA-1161-1A',
      kind: 'adapter', flavor: 'studio', ru: 0, drawW: 0, budgetW: 155, eff: 0.92,
      note: 'Internal to the chassis — there is no external brick. 155 W maximum continuous; M4 Pro peaks at 140 W, idles near 5 W. Mains side is a detachable IEC C7 figure-8 cord, same part across every Mac mini generation. Place this only if your inventory tracks the PSU as its own asset; otherwise cable the Mac mini AC inlet straight to the outlet with a NEMA 5-15P→C7 cord.',
      groups: [
        { k: 'ac', label: 'AC inlet (C8)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 2.5, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'dc', label: 'DC OUT · internal 155 W', glyph: 'barrel', count: 1, rows: 1, role: 'power-out', watts: 155, domain: 'power', conn: 'barrel' }
      ] },

  /* ---- Desktops ---------------------------------------------------- */
  { id: 'macmini-m4', vendor: 'Apple', name: 'Mac mini (M4)', model: 'Mac mini M4 (2024)',
      kind: 'server', flavor: 'studio', ru: 0, drawW: 155, note: 'M4 · Thunderbolt 4 ×3 rear · GbE standard, 10 GbE BTO · drawW is Apple max continuous power',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'eth', label: 'GbE (10 GbE BTO)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'fusb', label: 'Front USB-C ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 155, domain: 'power', conn: 'iec' }
      ] },
  { id: 'mac-studio-m4max', vendor: 'Apple', name: 'Mac Studio (M4 Max)', model: 'Mac Studio M4 Max (2025)',
      kind: 'workstation', flavor: 'studio', ru: 0, drawW: 480, note: 'M4 Max · 4× TB5 rear, 2× front USB-C 10 Gb/s · drawW is Apple max continuous power (measured peak ≈ 330 W)',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×4', glyph: 'usbc', count: 4, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'usba', label: 'USB-A ×2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'eth', label: '10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'fusb', label: 'Front USB-C ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'SDXC (UHS-II)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 480, domain: 'power', conn: 'iec' }
      ] },
  { id: 'mac-studio-m3ultra', vendor: 'Apple', name: 'Mac Studio (M3 Ultra)', model: 'Mac Studio M3 Ultra (2025)',
      kind: 'workstation', flavor: 'studio', ru: 0, drawW: 480, note: 'M3 Ultra · 6× TB5 total (4 rear + 2 front) · drawW is Apple max continuous power (measured peak ≈ 270 W)',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×4 rear', glyph: 'usbc', count: 4, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'usba', label: 'USB-A ×2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'eth', label: '10 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'ftb', label: 'Thunderbolt 5 ×2 front', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'sd', label: 'SDXC (UHS-II)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 480, domain: 'power', conn: 'iec' }
      ] },
  { id: 'macpro-m2ultra', vendor: 'Apple', name: 'Mac Pro (M2 Ultra, tower)', model: 'Mac Pro M2 Ultra (2023)',
      kind: 'workstation', flavor: 'studio', ru: 0, drawW: 1280, note: 'M2 Ultra · 8× TB4 (6 rear + 2 top), dual 10 GbE, 7 PCIe slots · drawW is the 1280 W max continuous rating; Apple lists ≈ 330 W actual max',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 ×8', glyph: 'usbc', count: 8, rows: 2, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'usba', label: 'USB-A ×2', glyph: 'usba', count: 2, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI ×2', glyph: 'hdmi', count: 2, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'eth', label: '10 GbE ×2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 10, domain: 'net', conn: 'rj45' },
        { k: 'pcie', label: 'PCIe slots ×7', glyph: 'pcie', count: 7, rows: 2, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'ac', label: 'AC IN', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 1280, domain: 'power', conn: 'iec' }
      ] },
  { id: 'imac-24-m4-2port', vendor: 'Apple', name: 'iMac 24" (M4, two ports)', model: 'iMac 24-inch M4 (2024)',
      kind: 'workstation', flavor: 'studio', ru: 0, drawW: 143, note: 'M4 · 2× TB4/USB 4 · external 143 W brick with magnetic DC lead; GbE only if the Ethernet brick is ordered (BTO) · drawW is adapter rating',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 / USB 4 ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'eth', label: 'GbE on power brick (BTO)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'dc', label: 'DC IN (magnetic, 143 W brick)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 143, domain: 'power', conn: 'any' }
      ] },
  { id: 'imac-24-m4-4port', vendor: 'Apple', name: 'iMac 24" (M4, four ports)', model: 'iMac 24-inch M4 (2024)',
      kind: 'workstation', flavor: 'studio', ru: 0, drawW: 143, note: 'M4 · 4× TB4 · external 143 W brick with magnetic DC lead; Gigabit Ethernet jack lives on the brick · drawW is adapter rating',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 ×4', glyph: 'usbc', count: 4, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'eth', label: 'GbE on power brick', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'dc', label: 'DC IN (magnetic, 143 W brick)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 143, domain: 'power', conn: 'any' }
      ] },

  /* ---- Notebooks --------------------------------------------------- */
  { id: 'macbook-air-13-m4', vendor: 'Apple', name: 'MacBook Air 13" (M4)', model: 'MacBook Air 13-inch M4 (2025)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 35, note: 'M4 · 2× TB4, MagSafe 3 · drawW is the 35 W dual-port adapter in the box (30 W on 8-core GPU); fast-charges from 70 W',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 35, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'macbook-air-15-m4', vendor: 'Apple', name: 'MacBook Air 15" (M4)', model: 'MacBook Air 15-inch M4 (2025)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 35, note: 'M4 · 2× TB4, MagSafe 3 · drawW is the 35 W dual-port adapter in the box; fast-charges from 70 W',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 ×2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 35, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'macbook-pro-14-m4', vendor: 'Apple', name: 'MacBook Pro 14" (M4)', model: 'MacBook Pro 14-inch M4 (2024)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 70, note: 'Base M4 · 3× TB4 (not TB5), HDMI, SDXC, MagSafe 3 · drawW is the 70 W adapter in the box',
      groups: [
        { k: 'tb', label: 'Thunderbolt 4 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'SDXC', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 70, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'macbook-pro-14-m4pro', vendor: 'Apple', name: 'MacBook Pro 14" (M4 Pro)', model: 'MacBook Pro 14-inch M4 Pro (2024)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 96, note: 'M4 Pro · 3× TB5, HDMI, SDXC, MagSafe 3 · drawW is the 96 W adapter shipped with the 14-core CPU (70 W with 12-core)',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'SDXC', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 96, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'macbook-pro-14-m4max', vendor: 'Apple', name: 'MacBook Pro 14" (M4 Max)', model: 'MacBook Pro 14-inch M4 Max (2024)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 96, note: 'M4 Max · 3× TB5, HDMI, SDXC, MagSafe 3 · drawW is the 96 W adapter in the box; accepts 140 W for fast charge',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'SDXC', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 96, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'macbook-pro-16-m4pro', vendor: 'Apple', name: 'MacBook Pro 16" (M4 Pro)', model: 'MacBook Pro 16-inch M4 Pro (2024)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 140, note: 'M4 Pro · 3× TB5, HDMI, SDXC, MagSafe 3 · drawW is the 140 W adapter in the box',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'SDXC', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 140, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'macbook-pro-16-m4max', vendor: 'Apple', name: 'MacBook Pro 16" (M4 Max)', model: 'MacBook Pro 16-inch M4 Max (2024)',
      kind: 'laptop', flavor: 'studio', ru: 0, drawW: 140, note: 'M4 Max · 3× TB5, HDMI, SDXC, MagSafe 3 · drawW is the 140 W adapter in the box',
      groups: [
        { k: 'tb', label: 'Thunderbolt 5 ×3', glyph: 'usbc', count: 3, rows: 1, role: 'data', gbps: 120, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 2.1', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 48, domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'SDXC', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'pwr', label: 'MagSafe 3 (USB-C brick)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 140, domain: 'power', conn: 'usbc' }
      ] },

  /* ---- iPad -------------------------------------------------------- */
  { id: 'ipad-pro-11-m4', vendor: 'Apple', name: 'iPad Pro 11" (M4)', model: 'iPad Pro 11-inch M4 (2024)',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 20, note: 'M4 · single Thunderbolt / USB 4 port, also the charge port · Smart Connector (magnetic, not cabled) omitted · drawW is the 20 W adapter in the box',
      groups: [
        { k: 'tb', label: 'Thunderbolt / USB 4', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ipad-pro-13-m4', vendor: 'Apple', name: 'iPad Pro 13" (M4)', model: 'iPad Pro 13-inch M4 (2024)',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 20, note: 'M4 · single Thunderbolt / USB 4 port, also the charge port · drawW is the 20 W adapter in the box',
      groups: [
        { k: 'tb', label: 'Thunderbolt / USB 4', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 40, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ipad-air-11-m3', vendor: 'Apple', name: 'iPad Air 11" (M3)', model: 'iPad Air 11-inch M3 (2025)',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 20, note: 'M3 · USB-C at USB 3 (10 Gb/s), no Thunderbolt · drawW is the 20 W adapter in the box',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ipad-air-13-m3', vendor: 'Apple', name: 'iPad Air 13" (M3)', model: 'iPad Air 13-inch M3 (2025)',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 20, note: 'M3 · USB-C at USB 3 (10 Gb/s), no Thunderbolt · drawW is the 20 W adapter in the box',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ipad-11-a16', vendor: 'Apple', name: 'iPad (A16, 11th gen)', model: 'iPad 11-inch A16 (2025)',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 20, note: 'A16 · USB-C limited to USB 2 (480 Mb/s) · drawW is the 20 W adapter in the box',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'ipad-mini-a17pro', vendor: 'Apple', name: 'iPad mini (A17 Pro)', model: 'iPad mini 7 A17 Pro (2024)',
      kind: 'tablet', flavor: 'studio', ru: 0, drawW: 20, note: 'A17 Pro · USB-C at USB 3 (10 Gb/s) · drawW is the 20 W adapter in the box',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },

  /* ---- iPhone ------------------------------------------------------ */
  { id: 'iphone-16', vendor: 'Apple', name: 'iPhone 16', model: 'iPhone 16 (2024)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 2 (480 Mb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-16-plus', vendor: 'Apple', name: 'iPhone 16 Plus', model: 'iPhone 16 Plus (2024)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 2 (480 Mb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-16-pro', vendor: 'Apple', name: 'iPhone 16 Pro', model: 'iPhone 16 Pro (2024)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 3 (10 Gb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-16-pro-max', vendor: 'Apple', name: 'iPhone 16 Pro Max', model: 'iPhone 16 Pro Max (2024)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 3 (10 Gb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-16e', vendor: 'Apple', name: 'iPhone 16e', model: 'iPhone 16e (2025)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'A18 · USB-C at USB 2 (480 Mb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-15', vendor: 'Apple', name: 'iPhone 15', model: 'iPhone 15 (2023)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 2 (480 Mb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-15-plus', vendor: 'Apple', name: 'iPhone 15 Plus', model: 'iPhone 15 Plus (2023)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 2 (480 Mb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 2)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-15-pro', vendor: 'Apple', name: 'iPhone 15 Pro', model: 'iPhone 15 Pro (2023)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 3 (10 Gb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'iphone-15-pro-max', vendor: 'Apple', name: 'iPhone 15 Pro Max', model: 'iPhone 15 Pro Max (2023)',
      kind: 'phone', flavor: 'studio', ru: 0, drawW: 20, note: 'USB-C at USB 3 (10 Gb/s) · no adapter in box; drawW is the 20 W minimum for Apple fast charge',
      groups: [
        { k: 'usbc', label: 'USB-C (USB 3)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
        { k: 'pwr', label: 'USB-C PD (same port)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 20, domain: 'power', conn: 'usbc' }
      ] }
]);
