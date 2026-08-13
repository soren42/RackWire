/* RackWire device library — Arduino & Qualcomm dev boards. Specs from vendor datasheets. */
window.RW.addDevices([
  { id: 'arduino-uno-r3', vendor: 'Arduino', name: 'Arduino Uno R3', model: 'A000066',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.5, note: 'ATmega328P; USB-B power/programming, 7-12 V barrel jack; ~100 mA @ 5 V bare board',
      groups: [
        { k: 'usb', label: 'USB-B (power/prog)', glyph: 'usba', count: 1, rows: 1, role: 'power-in', watts: 0.5, domain: 'power', conn: 'usba' },
        { k: 'dc', label: 'DC barrel 7-12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', domain: 'power', conn: 'barrel' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-uno-r4-minima', vendor: 'Arduino', name: 'Arduino Uno R4 Minima', model: 'ABX00080',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 1, note: 'Renesas RA4M1 (Cortex-M4); USB-C power/programming, 6-24 V barrel jack',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'dc', label: 'DC barrel 6-24 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', domain: 'power', conn: 'barrel' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-uno-r4-wifi', vendor: 'Arduino', name: 'Arduino Uno R4 WiFi', model: 'ABX00087',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2, note: 'RA4M1 + ESP32-S3; USB-C power/programming, 6-24 V barrel jack',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'dc', label: 'DC barrel 6-24 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', domain: 'power', conn: 'barrel' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-uno-q', vendor: 'Arduino', name: 'Arduino Uno Q', model: 'ABX00162',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 6, note: 'Qualcomm Dragonwing QRB2210 (Debian) + STM32U585; USB-C with DP alt mode — Arduino recommends a 5 V 3 A (15 W) supply, ~6 W typical',
      groups: [
        { k: 'usb', label: 'USB-C (power/data/DP)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 15, gbps: 0.48, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'UNO headers (7-24 V VIN)', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' },
        { k: 'qwiic', label: 'Qwiic I2C', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'MIPI CSI/DSI (bottom)', glyph: 'csi', count: 2, rows: 2, role: 'data', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nano', vendor: 'Arduino', name: 'Arduino Nano', model: 'A000005',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.3, note: 'ATmega328P; mini-USB power/programming, no barrel jack; ~60 mA @ 5 V',
      groups: [
        { k: 'usb', label: 'mini-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.3, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nano-every', vendor: 'Arduino', name: 'Arduino Nano Every', model: 'ABX00028',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.3, note: 'ATmega4809; micro-USB power/programming, 4.5-21 V VIN via header',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.3, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nano-33-iot', vendor: 'Arduino', name: 'Arduino Nano 33 IoT', model: 'ABX00027',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.5, note: 'SAMD21 + u-blox NINA-W102 (WiFi/BLE); micro-USB power/programming, 4.5-21 V VIN via header',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.5, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nano-33-ble-sense-rev2', vendor: 'Arduino', name: 'Arduino Nano 33 BLE Sense Rev2', model: 'ABX00069',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.4, note: 'nRF52840 + onboard IMU/sensors; micro-USB power/programming, 4.5-21 V VIN via header (plain Nano 33 BLE Rev2 is externally identical)',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.4, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nano-esp32', vendor: 'Arduino', name: 'Arduino Nano ESP32', model: 'ABX00083',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 1, note: 'ESP32-S3 (WiFi/BLE); USB-C power/programming, 6-21 V VIN via header',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nano-rp2040-connect', vendor: 'Arduino', name: 'Arduino Nano RP2040 Connect', model: 'ABX00053',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.8, note: 'RP2040 + NINA-W102 (WiFi/BLE); micro-USB power/programming, 5-21 V VIN via header',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.8, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-mega-2560-r3', vendor: 'Arduino', name: 'Arduino Mega 2560 Rev3', model: 'A000067',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.5, note: 'ATmega2560, 54 digital / 16 analog pins; USB-B power/programming, 7-12 V barrel jack',
      groups: [
        { k: 'usb', label: 'USB-B (power/prog)', glyph: 'usba', count: 1, rows: 1, role: 'power-in', watts: 0.5, domain: 'power', conn: 'usba' },
        { k: 'dc', label: 'DC barrel 7-12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', domain: 'power', conn: 'barrel' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-leonardo', vendor: 'Arduino', name: 'Arduino Leonardo', model: 'A000057',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.4, note: 'ATmega32u4 with native USB HID; micro-USB power/programming, 7-12 V barrel jack',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.4, domain: 'power', conn: 'usbc' },
        { k: 'dc', label: 'DC barrel 7-12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', domain: 'power', conn: 'barrel' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-micro', vendor: 'Arduino', name: 'Arduino Micro', model: 'A000053',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.3, note: 'ATmega32u4 with native USB HID; micro-USB power/programming only, 7-12 V VIN via header',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.3, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-mkr-wifi-1010', vendor: 'Arduino', name: 'Arduino MKR WiFi 1010', model: 'ABX00023',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.5, note: 'SAMD21 + NINA-W102 (WiFi/BLE); 3.3 V logic, micro-USB power/programming, JST Li-Po battery input',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.5, domain: 'power', conn: 'usbc' },
        { k: 'io', label: 'MKR headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-mkr-zero', vendor: 'Arduino', name: 'Arduino MKR Zero', model: 'ABX00012',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.4, note: 'SAMD21 with onboard microSD; 3.3 V logic, micro-USB power/programming, JST Li-Po battery input',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.4, domain: 'power', conn: 'usbc' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'io', label: 'MKR headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-giga-r1-wifi', vendor: 'Arduino', name: 'Arduino Giga R1 WiFi', model: 'ABX00063',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2.5, note: 'STM32H747XI dual-core M7/M4 + Murata WiFi/BLE; USB-C power/prog, USB-A host, 3.5 mm audio, 6-24 V VIN via header',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2.5, domain: 'power', conn: 'usbc' },
        { k: 'usba', label: 'USB-A host', glyph: 'usba', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
        { k: 'audio', label: '3.5 mm audio', glyph: 'audio', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'csi', label: 'Camera connector', glyph: 'csi', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'io', label: 'Digital/analog headers', glyph: 'gpio', count: 1, rows: 1, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-portenta-h7', vendor: 'Arduino', name: 'Arduino Portenta H7', model: 'ABX00042',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 2, note: 'STM32H747XI dual-core M7/M4 + Murata WiFi/BLE; USB-C power/prog, twin 80-pin high-density carrier connectors (Ethernet only via carrier/Vision Shield)',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 2, domain: 'power', conn: 'usbc' },
        { k: 'hd', label: 'High-density carrier ×2', glyph: 'gpio', count: 2, rows: 2, role: 'module', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-portenta-c33', vendor: 'Arduino', name: 'Arduino Portenta C33', model: 'ABX00074',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 1.5, note: 'Renesas RA6M5 (Cortex-M33) + ESP32-C3 WiFi/BLE; USB-C power/prog, twin high-density carrier connectors, JST Li-Po input',
      groups: [
        { k: 'usb', label: 'USB-C (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 1.5, domain: 'power', conn: 'usbc' },
        { k: 'hd', label: 'High-density carrier ×2', glyph: 'gpio', count: 2, rows: 2, role: 'module', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-portenta-x8', vendor: 'Arduino', name: 'Arduino Portenta X8', model: 'ABX00049',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 4, note: 'NXP i.MX 8M Mini (Linux) + STM32H747; USB-C power/data (USB 3.0 port recommended for current headroom), twin high-density carrier connectors',
      groups: [
        { k: 'usb', label: 'USB-C (power/data)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 4, gbps: 0.48, domain: 'power', conn: 'usbc' },
        { k: 'hd', label: 'High-density carrier ×2', glyph: 'gpio', count: 2, rows: 2, role: 'module', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nicla-vision', vendor: 'Arduino', name: 'Arduino Nicla Vision', model: 'ABX00051',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.7, note: 'STM32H747 + 2 MP camera, WiFi/BLE; micro-USB power/prog (J7) takes priority over ESLOV (J5) and Li-Po',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.7, domain: 'power', conn: 'usbc' },
        { k: 'eslov', label: 'ESLOV 5-pin', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' } ] },

  { id: 'arduino-nicla-sense-me', vendor: 'Arduino', name: 'Arduino Nicla Sense ME', model: 'ABX00050',
      kind: 'mcu', flavor: 'vanilla', ru: 0, drawW: 0.4, note: 'nRF52832 + Bosch BHI260AP/BME688 sensor suite, BLE; powered via micro-USB (J7), ESLOV (J5) or VIN',
      groups: [
        { k: 'usb', label: 'micro-USB (power/prog)', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 0.4, domain: 'power', conn: 'usbc' },
        { k: 'eslov', label: 'ESLOV 5-pin', glyph: 'gpio', count: 1, rows: 1, role: 'module', domain: 'other', conn: 'any' } ] },

  { id: 'qualcomm-rb3-gen2-core-kit', vendor: 'Qualcomm', name: 'Dragonwing RB3 Gen 2 Core Kit', model: 'RB3G2 CORE KIT',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 12, note: 'QCS6490, 12 TOPS AI; 12 V barrel input from bundled wall PSU, ~12 W typical and higher under sustained AI load',
      groups: [
        { k: 'dc', label: 'DC barrel 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 12, volts: 12, domain: 'power', conn: 'barrel' },
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usbc', label: 'USB-C 3.0 (DP alt)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'usba', label: 'USB-A 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'usb2', label: 'USB 2.0 OTG', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'dp', label: 'mini-DisplayPort', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'exp', label: 'HS/LS expansion headers', glyph: 'gpio', count: 2, rows: 2, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'qualcomm-rb3-gen2-vision-kit', vendor: 'Qualcomm', name: 'Dragonwing RB3 Gen 2 Vision Kit', model: 'RB3G2 VISION KIT',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 15, note: 'Core Kit board plus RBx Vision Mezzanine (USB 3.1 2-port hub) and high/low-res CSI cameras; 12 V barrel input, ~15 W typical with cameras active',
      groups: [
        { k: 'dc', label: 'DC barrel 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 12, domain: 'power', conn: 'barrel' },
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usbc', label: 'USB-C 3.0 (DP alt)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'usba', label: 'USB-A 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'usbhub', label: 'Mezzanine USB 3.1 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
        { k: 'hdmi', label: 'HDMI', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'dp', label: 'mini-DisplayPort', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'csi', label: 'CSI camera ×2', glyph: 'csi', count: 2, rows: 2, role: 'data', domain: 'other', conn: 'any' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'exp', label: 'HS/LS expansion headers', glyph: 'gpio', count: 2, rows: 2, role: 'gpio', domain: 'other', conn: 'any' } ] },

  { id: 'qualcomm-robotics-rb5-dev-kit', vendor: 'Qualcomm', name: 'Robotics RB5 Development Kit', model: 'TC-RB5-D01 (QRB5165)',
      kind: 'sbc', flavor: 'vanilla', ru: 0, drawW: 15, note: 'QRB5165 (Kryo 585 + 15 TOPS AI); 12 V barrel input, ~15 W typical; micro-USB debug port plus 3 high-speed / 3 low-speed sensor connectors',
      groups: [
        { k: 'dc', label: 'DC barrel 12 V', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 15, volts: 12, domain: 'power', conn: 'barrel' },
        { k: 'eth', label: '1 GbE', glyph: 'rj45', count: 1, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
        { k: 'usbc', label: 'USB-C 3.0', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 5, domain: 'usb', conn: 'usbc' },
        { k: 'usba', label: 'USB-A 3.0 ×2', glyph: 'usba', count: 2, rows: 2, role: 'data', gbps: 5, domain: 'usb', conn: 'usba' },
        { k: 'dbg', label: 'micro-USB (debug)', glyph: 'usbc', count: 1, rows: 1, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usbc' },
        { k: 'hdmi', label: 'HDMI 1.4 (4K60)', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
        { k: 'sd', label: 'microSD', glyph: 'sd', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'any' },
        { k: 'exp', label: 'HS/LS sensor connectors', glyph: 'gpio', count: 6, rows: 2, role: 'gpio', domain: 'other', conn: 'any' } ] }
]);
