/* RackWire device library — Raspberry Pi Foundation.
   Specs sourced from vendor tech-spec sheets. Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine). */
window.RW.addDevices([
  { id: 'rpi5', vendor: 'Raspberry Pi', name: 'Raspberry Pi 5', model: 'RPi 5 8GB',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 27, note: '5 V/5 A USB-C PD required for full peripheral power',
      groups: [
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb3', label: 'USB 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'usb2', label: 'USB 2.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'micro-HDMI ×2', glyph: 'microhdmi', count: 2, rows: 2, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'USB-C PD IN 27 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 27, domain: 'power', conn: 'usbc' },
        { k: 'gpio', label: '40-pin GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'CSI/DSI ×2', glyph: 'csi', count: 2, rows: 2, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-27w-psu', vendor: 'Raspberry Pi', name: 'USB-C PSU · 27W', model: 'SC1150 (5.1V 5A)',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 0, budgetW: 27, eff: 0.9,
      note: 'Output 5.1 V 5 A / 27 W USB-C PD · captive cable · required for a Pi 5 to allow the full 1.6 A of downstream USB current.',
      groups: [
        { k: 'ac', label: 'AC IN (captive plug)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 1, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'out', label: 'USB-C OUT 5.1 V 5 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-out', watts: 27, volts: 5.1, domain: 'power', conn: 'usbc' }
      ] },

  /* ---- Single-board computers ---- */
  { id: 'rpi4b', vendor: 'Raspberry Pi', name: 'Raspberry Pi 4 Model B', model: 'RPi 4B 4GB',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 15, note: '5.1 V/3 A USB-C · 2/4/8 GB variants are port-identical',
      groups: [
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb3', label: 'USB 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'usb2', label: 'USB 2.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'micro-HDMI ×2', glyph: 'microhdmi', count: 2, rows: 2, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'av', label: '3.5 mm AV', glyph: 'audio', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'USB-C IN 15 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'CSI + DSI', glyph: 'csi', count: 2, rows: 2, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi3bplus', vendor: 'Raspberry Pi', name: 'Raspberry Pi 3 Model B+', model: 'RPi 3B+',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 12.5, note: '5.1 V/2.5 A micro-USB · GbE PHY is bridged over USB 2.0, ~300 Mbps real throughput',
      groups: [
        { k: 'eth', label: '1 GbE (300 Mbps via USB2)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 0.3, domain: 'net', conn: 'rj45' },
        { k: 'usb2', label: 'USB 2.0 ×4', glyph: 'usba', count: 4, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI 1.4', glyph: 'hdmi', count: 1, rows: 1, role: 'video', gbps: 10.2, domain: 'other', conn: 'hdmi' },
        { k: 'av', label: '3.5 mm AV', glyph: 'audio', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'micro-USB IN 12.5 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 12.5, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'CSI + DSI', glyph: 'csi', count: 2, rows: 2, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-zero-2-w', vendor: 'Raspberry Pi', name: 'Raspberry Pi Zero 2 W', model: 'RPi Zero 2 W',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 5, note: 'Wi-Fi only, no Ethernet · powered over micro-USB · mini-HDMI out',
      groups: [
        { k: 'usb', label: 'micro-USB OTG data', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'mini-HDMI', glyph: 'microhdmi', count: 1, rows: 1, role: 'video', gbps: 10.2, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'micro-USB IN 5 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 5, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO (unpopulated)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'CSI (mini ribbon)', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-zero-w', vendor: 'Raspberry Pi', name: 'Raspberry Pi Zero W', model: 'RPi Zero W',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 3.5, note: 'Single-core BCM2835 · Wi-Fi only · powered over micro-USB · mini-HDMI out',
      groups: [
        { k: 'usb', label: 'micro-USB OTG data', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'mini-HDMI', glyph: 'microhdmi', count: 1, rows: 1, role: 'video', gbps: 10.2, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'micro-USB IN 3.5 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3.5, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO (unpopulated)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'CSI (mini ribbon)', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },

  /* ---- Keyboard computers ---- */
  { id: 'rpi400', vendor: 'Raspberry Pi', name: 'Raspberry Pi 400', model: 'RPi 400',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 15, note: 'Pi 4 in a keyboard · 5.1 V/3 A USB-C · horizontal GPIO header · no audio jack',
      groups: [
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb3', label: 'USB 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'usb2', label: 'USB 2.0', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'micro-HDMI ×2', glyph: 'microhdmi', count: 2, rows: 2, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'USB-C IN 15 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO (horizontal)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi500', vendor: 'Raspberry Pi', name: 'Raspberry Pi 500', model: 'RPi 500',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 27, note: 'Pi 5 in a keyboard · ships with the 27 W USB-C PD supply · no DSI/CSI, no audio jack',
      groups: [
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb3', label: 'USB 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'usb2', label: 'USB 2.0', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'micro-HDMI ×2', glyph: 'microhdmi', count: 2, rows: 2, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'USB-C PD IN 27 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 27, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO (horizontal)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },

  /* ---- Compute Modules + official IO boards ---- */
  { id: 'rpi-cm4', vendor: 'Raspberry Pi', name: 'Compute Module 4', model: 'CM4',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 7, note: 'Bare module — no external ports; mates to a carrier via 2 × 100-pin board-to-board connectors. Power and I/O come from the carrier.',
      groups: [
        { k: 'b2b', label: 'Board-to-board 2×100-pin', glyph: 'pcie', count: 2, rows: 2, role: 'module', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-cm4-io', vendor: 'Raspberry Pi', name: 'Compute Module 4 IO Board', model: 'CM4IO',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 26, note: 'Official CM4 carrier · +12 V barrel jack (accepts 7.5–28 V) · PoE support via header, PoE HAT sold separately',
      groups: [
        { k: 'eth', label: '1 GbE (PoE-capable)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb2', label: 'USB 2.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI 2.0 ×2 (full size)', glyph: 'hdmi', count: 2, rows: 2, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'DC barrel IN +12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 26, volts: 12, domain: 'power', conn: 'any' },
        { k: 'pcie', label: 'PCIe Gen2 ×1 slot', glyph: 'pcie', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'sd', label: 'microSD (Lite modules)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO / HAT', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'DSI ×2 + CSI-2 ×2', glyph: 'csi', count: 4, rows: 2, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-cm5', vendor: 'Raspberry Pi', name: 'Compute Module 5', model: 'CM5',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 12, note: 'Bare module — no external ports; mates to a carrier via 2 × 100-pin board-to-board connectors. Power and I/O come from the carrier.',
      groups: [
        { k: 'b2b', label: 'Board-to-board 2×100-pin', glyph: 'pcie', count: 2, rows: 2, role: 'module', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-cm5-io', vendor: 'Raspberry Pi', name: 'Compute Module 5 IO Board', model: 'CM5IO',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 27, note: 'Official CM5 carrier · 5 V USB-C PSU (27 W recommended) · M.2 M-key PCIe socket · GbE with PoE+ HAT+ support',
      groups: [
        { k: 'eth', label: '1 GbE (PoE+ HAT+ capable)', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usb3', label: 'USB 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI 2.0 ×2 (full size)', glyph: 'hdmi', count: 2, rows: 2, role: 'video', gbps: 18, domain: 'other', conn: 'hdmi' },
        { k: 'pwr', label: 'USB-C IN 5 V 27 W', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 27, volts: 5.1, domain: 'power', conn: 'usbc' },
        { k: 'm2', label: 'M.2 M-key PCIe', glyph: 'pcie', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'sd', label: 'microSD (Lite modules)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'sd' },
        { k: 'gpio', label: '40-pin GPIO / HAT+', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'DSI/CSI-2 ×2 (22-pin)', glyph: 'csi', count: 2, rows: 2, role: 'data', domain: 'other', conn: 'any' }
      ] },

  /* ---- Microcontrollers ---- */
  { id: 'rpi-pico', vendor: 'Raspberry Pi', name: 'Raspberry Pi Pico', model: 'Pico (RP2040)',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2.5, note: 'RP2040 · powered and flashed over micro-USB B · 40 castellated GPIO pads',
      groups: [
        { k: 'pwr', label: 'micro-USB IN / data', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2.5, volts: 5, domain: 'power', conn: 'usbc' },
        { k: 'gpio', label: '40-pin castellated GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-pico-w', vendor: 'Raspberry Pi', name: 'Raspberry Pi Pico W', model: 'Pico W (RP2040)',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2.5, note: 'RP2040 with 2.4 GHz 802.11n Wi-Fi and Bluetooth 5.2 · powered over micro-USB B',
      groups: [
        { k: 'pwr', label: 'micro-USB IN / data', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2.5, volts: 5, domain: 'power', conn: 'usbc' },
        { k: 'gpio', label: '40-pin castellated GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-pico-2', vendor: 'Raspberry Pi', name: 'Raspberry Pi Pico 2', model: 'Pico 2 (RP2350)',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2.5, note: 'RP2350 dual Cortex-M33 / Hazard3 RISC-V · powered over micro-USB B · adds 3-pin debug header',
      groups: [
        { k: 'pwr', label: 'micro-USB IN / data', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2.5, volts: 5, domain: 'power', conn: 'usbc' },
        { k: 'gpio', label: '40-pin castellated GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-pico-2-w', vendor: 'Raspberry Pi', name: 'Raspberry Pi Pico 2 W', model: 'Pico 2 W (RP2350)',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2.5, note: 'RP2350 with 2.4 GHz Wi-Fi and Bluetooth 5.2 · powered over micro-USB B',
      groups: [
        { k: 'pwr', label: 'micro-USB IN / data', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2.5, volts: 5, domain: 'power', conn: 'usbc' },
        { k: 'gpio', label: '40-pin castellated GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },

  /* ---- Official HATs and power ---- */
  { id: 'rpi-poe-hat-plus', vendor: 'Raspberry Pi', name: 'PoE+ HAT', model: 'SC0743',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 25.5, budgetW: 20,
      note: 'IEEE 802.3at Class 4 PD (37–57 V) · delivers 5 V/4 A (20 W) to the host Pi 4 or 3B+ over the 40+4-pin headers · powered through the host RJ45, integral 25 mm fan.',
      groups: [
        { k: 'poe', label: 'PoE+ IN (via host RJ45)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe+', poeDrawW: 25.5, gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'gpio', label: '40+4-pin header to host', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-poe-hat', vendor: 'Raspberry Pi', name: 'PoE HAT (original)', model: 'SC0301',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 15.4, budgetW: 12.5,
      note: 'IEEE 802.3af Class 2 PD · delivers 5 V/2.5 A to a Pi 3B+ or Pi 4 · superseded by the PoE+ HAT.',
      groups: [
        { k: 'poe', label: 'PoE IN (via host RJ45)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 15.4, gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'gpio', label: '40+4-pin header to host', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-m2-hat-plus', vendor: 'Raspberry Pi', name: 'M.2 HAT+', model: 'SC1382',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 15,
      note: 'Pi 5 only · converts the 16-pin FPC PCIe connector to an M.2 M-key socket (2230/2242), single-lane PCIe 2.0 ≈500 MB/s · supplies up to 3 A to the M.2 device from the host.',
      groups: [
        { k: 'm2', label: 'M.2 M-key 2230/2242', glyph: 'pcie', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'fpc', label: 'PCIe FPC to host (16-pin)', glyph: 'pcie', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'gpio', label: '40-pin GPIO passthrough', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-ai-hat-plus', vendor: 'Raspberry Pi', name: 'AI HAT+ · 26 TOPS', model: 'SC1484 (Hailo-8)',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 10,
      note: 'HAT+ neural accelerator for Pi 5 — Hailo-8 at 26 TOPS (13 TOPS Hailo-8L variant), M.2 module on a single-lane PCIe carrier. Draws from the host Pi; budget the 27 W supply accordingly.',
      groups: [
        { k: 'fpc', label: 'PCIe FPC to host (16-pin)', glyph: 'pcie', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'gpio', label: '40-pin GPIO passthrough', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-15w-psu', vendor: 'Raspberry Pi', name: 'USB-C PSU · 15W', model: 'USB-C 5.1 V 3 A',
      kind: 'adapter', flavor: 'vanilla', ru: 0, drawW: 0, budgetW: 15, eff: 0.9,
      note: 'Output 5.1 V 3 A / 15.3 W USB-C · captive cable · the standard supply for Pi 4, Pi 400 and Pi 3-class boards (micro-USB variant also sold).',
      groups: [
        { k: 'ac', label: 'AC IN (captive plug)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', amps: 0.5, volts: 120, domain: 'power', conn: 'iec' },
        { k: 'out', label: 'USB-C OUT 5.1 V 3 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-out', watts: 15, volts: 5.1, domain: 'power', conn: 'usbc' }
      ] },

  /* ---- Displays and cameras ---- */
  { id: 'rpi-touch-display-2', vendor: 'Raspberry Pi', name: 'Touch Display 2 · 7"', model: 'SC1635 (720×1280)',
      kind: 'display', flavor: 'vanilla', ru: 0, drawW: 3,
      note: '7-inch 720×1280 capacitive 5-point touch · two connections only: DSI ribbon plus 5 V power from the host GPIO header. 5" and 10" variants also sold.',
      groups: [
        { k: 'dsi', label: 'DSI ribbon (22-pin)', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: '5 V from host GPIO', glyph: 'gpio', count: 1, rows: 1, role: 'power-in', watts: 3, volts: 5, domain: 'power', conn: 'any' }
      ] },
  { id: 'rpi-touch-display', vendor: 'Raspberry Pi', name: '7" Touch Display (original)', model: 'SC0186 (800×480)',
      kind: 'display', flavor: 'vanilla', ru: 0, drawW: 4,
      note: '7-inch 800×480 10-point touch on an adapter board · DSI ribbon to the host plus micro-USB 5 V (or GPIO jumpers) for power.',
      groups: [
        { k: 'dsi', label: 'DSI ribbon (15-pin)', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'pwr', label: 'micro-USB IN 5 V', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 4, volts: 5, domain: 'power', conn: 'usbc' }
      ] },
  { id: 'rpi-camera-module-3', vendor: 'Raspberry Pi', name: 'Camera Module 3', model: 'SC0872 (IMX708)',
      kind: 'peripheral', flavor: 'vanilla', ru: 0, drawW: 1,
      note: '12 MP Sony IMX708, autofocus, HDR · CSI-2 ribbon only; powered from the host camera connector. Pi 5 and CM boards need the 22-pin ribbon.',
      groups: [
        { k: 'csi', label: 'CSI-2 ribbon', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'rpi-hq-camera', vendor: 'Raspberry Pi', name: 'High Quality Camera', model: 'SC0261 (IMX477)',
      kind: 'peripheral', flavor: 'vanilla', ru: 0, drawW: 1.6,
      note: '12.3 MP Sony IMX477 with C/CS lens mount · CSI-2 ribbon only; powered from the host camera connector. Interchangeable lens, back-focus adjustable.',
      groups: [
        { k: 'csi', label: 'CSI-2 ribbon', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] }
]);
