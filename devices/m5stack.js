/* RackWire device library — M5Stack controllers & dev kits.
   Specs from M5Stack docs (docs.m5stack.com). Registers into the
   shared window.RW library via addDevices(); loaded by index.html
   after device-library.js (the core engine).
   Grove (HY2.0-4P), M-Bus and TF slots carry no standard planner
   cable, so they are modelled with conn 'any'. drawW figures are
   typical USB-C bus draw, not peak charge current. */
window.RW.addDevices([
  { id: 'm5stack-basic', vendor: 'M5Stack', name: 'M5Stack Basic', model: 'K001',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'ESP32-D0WDQ6-V3; 2.0" 320x240 LCD; 110 mAh batt; 1x Grove, M-Bus, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A (I2C/UART)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-gray', vendor: 'M5Stack', name: 'M5Stack Gray', model: 'K002',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'ESP32-D0WDQ6 + MPU6886/BMM150 9-axis; 2.0" LCD; 110 mAh batt; 1x Grove on the core (B/C appear only with an M5GO base)',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A (I2C/UART)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-fire', vendor: 'M5Stack', name: 'M5Stack Fire', model: 'K007',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-D0WDQ6 + 8 MB PSRAM; 2.0" LCD; 500 mAh batt in M5GO base; 3x Grove (A/B/C), M-Bus, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A/B/C', glyph: 'gpio', count: 3, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-core2', vendor: 'M5Stack', name: 'M5Stack Core2', model: 'K010',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-D0WDQ6; 2.0" touch LCD; 390 mAh batt; 1x Grove, M-Bus, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A (I2C)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-core2-v11', vendor: 'M5Stack', name: 'M5Stack Core2 v1.1', model: 'K010-V11',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-D0WDQ6-V3, 16 MB flash / 8 MB PSRAM; AXP2101+INA3221 PMIC; 2.0" touch LCD; internal LiPo + RTC cell; 1x Grove, M-Bus, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A (I2C)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-cores3', vendor: 'M5Stack', name: 'M5Stack CoreS3', model: 'K128',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-S3, 16 MB flash / 8 MB PSRAM; 2.0" touch LCD; GC0308 0.3 MP camera; 500 mAh batt; 3x Grove, M-Bus, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog/OTG)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A/B/C', glyph: 'gpio', count: 3, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'cam', label: 'Onboard camera (GC0308)', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-cores3-se', vendor: 'M5Stack', name: 'M5Stack CoreS3 SE', model: 'K128-SE',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-S3, 16 MB flash / 8 MB PSRAM; 2.0" touch LCD; no camera, no internal battery; 3x Grove, M-Bus, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog/OTG)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A/B/C', glyph: 'gpio', count: 3, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stack-coreink', vendor: 'M5Stack', name: 'M5Stack Core Ink', model: 'K048',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-PICO-D4; 1.54" 200x200 e-ink; 390 mAh batt; 1x Grove, M-Bus socket, HAT header',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus socket', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'hat', label: 'HAT header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5station-bat', vendor: 'M5Stack', name: 'M5Station BAT', model: 'K124-B',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-D0WDQ6-V3; 1.14" IPS; 2x 18650 (2200 mAh); 6x Grove (A1/A2/B1/B2/C1/C2), USB-A power out, PWR485 9-24 V input',
      groups: [
        { k: 'usb', label: 'USB-C (power in)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A1/A2/B1/B2/C1/C2', glyph: 'gpio', count: 6, rows: 2, role: 'module', domain: 'other', conn: 'any' },
        { k: 'usba', label: 'USB-A (power out)', glyph: 'usba', count: 1, rows: 1, role: 'power-out', watts: 5, domain: 'power', conn: 'usba' },
        { k: 'rs485', label: 'PWR485 terminal (9-24 V)', glyph: 'gpio', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5station-485', vendor: 'M5Stack', name: 'M5Station 485', model: 'K123',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 3, note: 'ESP32-D0WDQ6-V3, 16 MB flash; 1.14" 240x135 IPS; battery socket reserved (no cell fitted); 6x Grove, USB-A power out, PWR485 9-24 V input',
      groups: [
        { k: 'usb', label: 'USB-C (power in)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 3, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A1/A2/B1/B2/C1/C2', glyph: 'gpio', count: 6, rows: 2, role: 'module', domain: 'other', conn: 'any' },
        { k: 'usba', label: 'USB-A (power out)', glyph: 'usba', count: 1, rows: 1, role: 'power-out', watts: 5, domain: 'power', conn: 'usba' },
        { k: 'rs485', label: 'PWR485 terminal (9-24 V)', glyph: 'gpio', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stickc', vendor: 'M5Stack', name: 'M5StickC', model: 'K016-C',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-PICO-D4; 0.96" 80x160 LCD; 95 mAh batt; 1x Grove, HAT/GPIO header',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'hat', label: 'HAT / GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stickc-plus', vendor: 'M5Stack', name: 'M5StickC Plus', model: 'K016-P',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-PICO-D4; 1.14" 135x240 LCD; 120 mAh batt; 1x Grove, HAT header, IR + buzzer',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'hat', label: 'HAT / GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stickc-plus2', vendor: 'M5Stack', name: 'M5StickC Plus2', model: 'K016-P2',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-PICO-V3-02; 1.14" 135x240 LCD; 200 mAh batt; 1x Grove, HAT header, IR/mic/RTC/IMU',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'hat', label: 'HAT / GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5atom-lite', vendor: 'M5Stack', name: 'M5Stack Atom Lite', model: 'C008',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-PICO-D4, 4 MB flash; 24x24 mm; no display, no battery; 1x Grove, 6 GPIO pins, IR + RGB LED',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'io', label: 'GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5atom-matrix', vendor: 'M5Stack', name: 'M5Stack Atom Matrix', model: 'C008-B',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-PICO-D4; 5x5 WS2812C RGB matrix; MPU6886 IMU; no battery; 1x Grove, 6 GPIO pins',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'io', label: 'GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5atoms3', vendor: 'M5Stack', name: 'M5Stack AtomS3', model: 'C123',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-S3FN8, 8 MB flash; 0.85" 128x128 IPS; no battery; 1x Grove, 6 GPIO pins (G5/G6/G7/G8/G38/G39)',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'io', label: 'GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5atoms3-lite', vendor: 'M5Stack', name: 'M5Stack AtomS3 Lite', model: 'C124',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-S3FN8, 8 MB flash; 24x24x9.5 mm; no display, no battery; 1x Grove, 6 GPIO pins, IR + RGB LED',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'io', label: 'GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5atoms3r', vendor: 'M5Stack', name: 'M5Stack AtomS3R', model: 'C126',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-S3-PICO-1-N8R8, 8 MB flash / 8 MB PSRAM; 0.85" IPS; BMI270 + BMM150; no battery; 1x Grove, 6 GPIO pins',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'io', label: 'GPIO header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5stamps3', vendor: 'M5Stack', name: 'M5Stack StampS3', model: 'S007',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-S3FN8, 8 MB flash; solder-down module; no battery; 23 GPIO on 1.27/2.54 mm headers, bundled HY2.0-4P Grove terminal',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'GPIO headers (23 pins)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'grove', label: 'Grove terminal (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5capsule', vendor: 'M5Stack', name: 'M5Stack Capsule', model: 'K129',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'StampS3 core (ESP32-S3FN8); 250 mAh batt, external battery option; 1x Grove, TF slot, proto header; charges over the base USB-C',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'io', label: 'Proto pin header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5nanoc6', vendor: 'M5Stack', name: 'M5Stack NanoC6', model: 'C125',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 1, note: 'ESP32-C6FH4 RISC-V 160 MHz (Wi-Fi 6 / Thread / Zigbee); no display, no battery; 1x Grove, IR + RGB LED',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5cardputer', vendor: 'M5Stack', name: 'M5Stack Cardputer', model: 'K132',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'StampS3 core (ESP32-S3FN8); 1.14" 240x135 LCD; 56-key keyboard; 120 mAh + 1400 mAh in base; 1x Grove, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5cardputer-adv', vendor: 'M5Stack', name: 'M5Stack Cardputer Adv', model: 'K132-Adv',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'Stamp-S3A core (ESP32-S3FN8); 1.14" LCD; 56-key keyboard; 1750 mAh batt with power switch; 1x Grove, EXT 2.54-14P bus',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'ext', label: 'EXT bus (2.54-14P)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5dial', vendor: 'M5Stack', name: 'M5Dial', model: 'K130',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'ESP32-S3FN8; 1.28" 240x240 round touch LCD + rotary encoder + RFID; 2x Grove (A/B), rear 6-36 V DC terminal, battery connector',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove A/B', glyph: 'gpio', count: 2, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'dc', label: 'DC terminal 6-36 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'any' }
      ] },
  { id: 'm5paper', vendor: 'M5Stack', name: 'M5Paper', model: 'K049',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'ESP32-D0WDQ6-V3; 4.7" 960x540 touch e-ink, 16-level grayscale; 1150 mAh batt; 3x Grove, TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'grove', label: 'Grove x3 (HY2.0-4P)', glyph: 'gpio', count: 3, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5papers3', vendor: 'M5Stack', name: 'M5PaperS3', model: 'C139',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 2, note: 'ESP32-S3R8; 4.7" 960x540 touch e-ink; 1800 mAh batt; USB-C OTG, 1x HC1.25-4P peripheral port (not Grove-pitch), TF slot',
      groups: [
        { k: 'usb', label: 'USB-C (power/OTG)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Peripheral port (HC1.25-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] },
  { id: 'm5tab5', vendor: 'M5Stack', name: 'M5Stack Tab5', model: 'C145',
      kind: 'mcu', flavor: 'pro', ru: 0, drawW: 7, note: 'ESP32-P4 RISC-V 360 MHz + ESP32-C6 Wi-Fi 6; 5" 1280x720 touch IPS; 2 MP MIPI-CSI camera; removable NP-F550 (K145 kit); USB-A host, USB-C OTG, RS485, 1x Grove, M-Bus, TF, 3.5 mm audio',
      groups: [
        { k: 'usb', label: 'USB-C (power/OTG)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 7, domain: 'power', conn: 'usbc' },
        { k: 'usba', label: 'USB-A host', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'grove', label: 'Grove (HY2.0-4P)', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'mbus', label: 'M-Bus header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'ext', label: 'GPIO_EXT header', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'rs485', label: 'RS485 terminal', glyph: 'gpio', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'tf', label: 'microSD (TF)', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'aud', label: 'Headphone 3.5 mm', glyph: 'audio', count: 1, rows: 1, role: 'audio', domain: 'other', conn: 'audio' },
        { k: 'cam', label: 'Onboard camera (SC2356)', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' }
      ] }
]);
