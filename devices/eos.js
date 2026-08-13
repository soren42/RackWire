/* RackWire device library — ETC Eos lighting control & Net3/Response DMX gateways. Specs from ETC datasheets. */
window.RW.addDevices([
  { id: 'etc-eos-apex-5', vendor: 'ETC', name: 'Eos Apex 5', model: 'EOS APEX 5',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 600, note: 'No fixed DMX — output via sACN/Art-Net or I/O Garage (4 bays, Gadget II = 2 DMX each); 4x GbE etherCON PoE++ PSE + 2x SFP+ 10G; ~5 A @ 120 V per datasheet',
    groups: [
      { k: 'net', label: 'GbE etherCON x4 (PoE++ PSE)', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe++', poeW: 100, domain: 'net', conn: 'rj45' },
      { k: 'sfp', label: 'SFP+ 10G x2', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
      { k: 'dp', label: 'DisplayPort out x3', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x8', glyph: 'usba', count: 8, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x6', glyph: 'usbc', count: 6, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'lite', label: 'Littlite XLR', glyph: 'xlr', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'ac', label: 'IEC power in (locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 600, amps: 5, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-eos-apex-10', vendor: 'ETC', name: 'Eos Apex 10', model: 'EOS APEX 10',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 720, note: 'No fixed DMX — sACN/Art-Net or I/O Garage (4 bays); 4x GbE etherCON PoE++ PSE + 2x SFP+ 10G; ~6 A @ 120 V per datasheet',
    groups: [
      { k: 'net', label: 'GbE etherCON x4 (PoE++ PSE)', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe++', poeW: 100, domain: 'net', conn: 'rj45' },
      { k: 'sfp', label: 'SFP+ 10G x2', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
      { k: 'dp', label: 'DisplayPort out x3', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x12', glyph: 'usba', count: 12, rows: 3, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x8', glyph: 'usbc', count: 8, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'lite', label: 'Littlite XLR x2', glyph: 'xlr', count: 2, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'ac', label: 'IEC power in (locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 720, amps: 6, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-eos-apex-20', vendor: 'ETC', name: 'Eos Apex 20', model: 'EOS APEX 20',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 720, note: 'Flagship 20-fader desk; no fixed DMX — sACN/Art-Net or I/O Garage (4 bays); 4x GbE etherCON PoE++ PSE + 2x SFP+ 10G; ~6 A @ 120 V per datasheet',
    groups: [
      { k: 'net', label: 'GbE etherCON x4 (PoE++ PSE)', glyph: 'rj45', count: 4, rows: 1, role: 'lan', gbps: 1, poe: 'poe++', poeW: 100, domain: 'net', conn: 'rj45' },
      { k: 'sfp', label: 'SFP+ 10G x2', glyph: 'sfp', count: 2, rows: 1, role: 'uplink', gbps: 10, domain: 'net', conn: 'sfp' },
      { k: 'dp', label: 'DisplayPort out x3', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x12', glyph: 'usba', count: 12, rows: 3, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x8', glyph: 'usbc', count: 8, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'lite', label: 'Littlite XLR x2', glyph: 'xlr', count: 2, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'ac', label: 'IEC power in (locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 720, amps: 6, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-eos-ti', vendor: 'ETC', name: 'Eos Titanium (Eos Ti)', model: 'Eos Ti',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 750, note: '4 DMX/RDM universes on 5-pin XLR; 2 Ethernet ports (802.3af PSE); 3 switched IEC outlets for monitors; ~6.3 A @ 120 V per datasheet',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'Ethernet x2 (802.3af PSE)', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, poe: 'poe', poeW: 15.4, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out x3', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usb', label: 'USB x11', glyph: 'usba', count: 11, rows: 3, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
      { k: 'lite', label: 'Littlite XLR x2', glyph: 'xlr', count: 2, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'trig', label: 'Contact-closure trigger (D-Sub)', glyph: 'db9', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'db9' },
      { k: 'mon', label: 'IEC monitor outlets x3', glyph: 'iec_out', count: 3, rows: 1, role: 'power-out', amps: 10, volts: 120, domain: 'power', conn: 'iec' },
      { k: 'ac', label: 'AC IN (IEC)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 750, amps: 6.3, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-eos-gio', vendor: 'ETC', name: 'Eos Gio', model: 'Gio',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 240, note: '4 DMX/RDM universes on 5-pin XLR; 2 Ethernet ports (802.3af PSE); 7 USB; ~2 A @ 120 V per datasheet',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'Ethernet x2 (802.3af PSE)', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, poe: 'poe', poeW: 15.4, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out x3', glyph: 'hdmi', count: 3, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usb', label: 'USB x7', glyph: 'usba', count: 7, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
      { k: 'trig', label: 'Contact-closure trigger (D-Sub)', glyph: 'db9', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'db9' },
      { k: 'ac', label: 'AC IN (IEC)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 240, amps: 2, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-eos-gio-at5', vendor: 'ETC', name: 'Eos Gio @5', model: 'Gio @5',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 240, note: '4 DMX-512/RDM 5-pin XLR ports; 2 GbE RJ45; 9 USB-A + 2 USB-C; ~2 A @ 120 V per datasheet',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'GbE RJ45 x2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out x2', glyph: 'hdmi', count: 2, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x9', glyph: 'usba', count: 9, rows: 3, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'lite', label: 'Littlite XLR', glyph: 'xlr', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'trig', label: 'Contact-closure trigger (D-Sub)', glyph: 'db9', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'db9' },
      { k: 'ac', label: 'IEC power in (locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 240, amps: 2, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-ion-xe', vendor: 'ETC', name: 'Eos Ion Xe', model: 'Ion Xe',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 120, note: '4 DMX/RDM universes on 5-pin XLR; 2 Ethernet ports; 5 USB; ~1 A @ 120 V per datasheet',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'Ethernet x2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out x2', glyph: 'hdmi', count: 2, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usb', label: 'USB x5', glyph: 'usba', count: 5, rows: 2, role: 'data', gbps: 0.48, domain: 'usb', conn: 'usba' },
      { k: 'lite', label: 'Littlite XLR', glyph: 'xlr', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'trig', label: 'Contact-closure trigger (D-Sub)', glyph: 'db9', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'db9' },
      { k: 'ac', label: 'AC IN (IEC, locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 120, amps: 1, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-ion-xe-20', vendor: 'ETC', name: 'Eos Ion Xe 20', model: 'Ion Xe 20',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 120, note: 'Ion Xe with 20 onboard faders; 4 DMX-512/RDM 5-pin XLR; 2 Ethernet; 5 USB-A + 2 USB-C; ~1 A @ 120 V per datasheet',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'Ethernet x2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out x2', glyph: 'hdmi', count: 2, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x5', glyph: 'usba', count: 5, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'lite', label: 'Littlite XLR', glyph: 'xlr', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'trig', label: 'Contact-closure trigger (D-Sub)', glyph: 'db9', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'db9' },
      { k: 'ac', label: 'AC IN (IEC, locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 120, amps: 1, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-element-2', vendor: 'ETC', name: 'Eos Element 2', model: 'Element 2',
    kind: 'console', flavor: 'studio', ru: 0, drawW: 120, note: '40-fader education/road-house desk; 4 DMX-512/RDM 5-pin XLR; 2 GbE RJ45; 5 USB-A + 2 USB-C; ~1 A @ 120 V per datasheet',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'GbE RJ45 x2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out x2', glyph: 'hdmi', count: 2, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x5', glyph: 'usba', count: 5, rows: 2, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'lite', label: 'Littlite XLR', glyph: 'xlr', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'xlr' },
      { k: 'trig', label: 'Contact-closure trigger (D-Sub)', glyph: 'db9', count: 1, rows: 1, role: 'data', domain: 'other', conn: 'db9' },
      { k: 'ac', label: 'IEC power in (locking)', glyph: 'iec_in', count: 1, rows: 1, role: 'power-in', watts: 120, amps: 1, volts: 120, domain: 'power', conn: 'iec' } ] },

  { id: 'etc-puck-nomad', vendor: 'ETC', name: 'ETC Puck (ETCnomad Puck)', model: 'ETC Puck',
    kind: 'server', flavor: 'studio', ru: 0, drawW: 190, note: 'Mini-PC Eos node, 1,024–6,144 outputs; no onboard DMX (sACN/Art-Net, or up to 4 Gadget II over USB); external PSU, ~1.6 A @ 120 V per datasheet',
    groups: [
      { k: 'net', label: 'GbE RJ45 x2', glyph: 'rj45', count: 2, rows: 1, role: 'lan', gbps: 1, domain: 'net', conn: 'rj45' },
      { k: 'dp', label: 'DisplayPort out', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'hdmi', label: 'HDMI out', glyph: 'hdmi', count: 1, rows: 1, role: 'video', domain: 'other', conn: 'hdmi' },
      { k: 'usba', label: 'USB-A x3', glyph: 'usba', count: 3, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usba' },
      { k: 'usbc', label: 'USB-C x2', glyph: 'usbc', count: 2, rows: 1, role: 'data', gbps: 10, domain: 'usb', conn: 'usbc' },
      { k: 'dc', label: 'DC IN (external PSU)', glyph: 'barrel', count: 1, rows: 1, role: 'power-in', watts: 190, domain: 'power', conn: 'barrel' } ] },

  { id: 'etc-response-mk2-1port', vendor: 'ETC', name: 'Response Mk2 1-Port Gateway (wall)', model: 'RSN-DMX1-O',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 4, note: '1 DMX/RDM universe on 5-pin XLR (in or out); 10/100 RJ45; 802.3af PoE or 12–24 VDC; 4 W max; sACN/Net3',
    groups: [
      { k: 'dmx', label: 'DMX/RDM port (5-pin)', glyph: 'xlr', count: 1, rows: 1, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 4, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-response-mk2-2port', vendor: 'ETC', name: 'Response Mk2 2-Port Gateway (wall)', model: 'RSN-DMX2-O',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 4, note: '2 DMX/RDM universes on 5-pin XLR; 10/100 RJ45; 802.3af PoE or 12–24 VDC; 4 W max; sACN/Net3',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x2 (5-pin)', glyph: 'xlr', count: 2, rows: 1, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 4, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-response-mk2-4port', vendor: 'ETC', name: 'Response Mk2 4-Port Gateway (rack/portable)', model: 'RSN-DMX4-O',
    kind: 'gateway', flavor: 'studio', ru: 1, drawW: 7, note: '4 DMX/RDM universes on 5-pin XLR; half-19in chassis, 8 DMX ports per 1U with N3GA-RM kit; 802.3af PoE or 12–24 VDC; 7 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 7, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-response-mk2-1port-din', vendor: 'ETC', name: 'Response Mk2 1-Port Gateway (DIN rail)', model: 'RSN-DMX1-DIN',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 7, note: '1 DMX/RDM universe on screw terminals; DIN43880 rail mount; 10/100 RJ45; 802.3af PoE or 12–24 VDC; 7 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM port (terminal)', glyph: 'gpio', count: 1, rows: 1, role: 'dmx', domain: 'other', conn: 'any' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 7, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-response-mk2-2port-din', vendor: 'ETC', name: 'Response Mk2 2-Port Gateway (DIN rail)', model: 'RSN-DMX2-DIN',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 7, note: '2 DMX/RDM universes on screw terminals; DIN43880 rail mount; 10/100 RJ45; 802.3af PoE or 12–24 VDC; 7 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM x2 (terminal)', glyph: 'gpio', count: 2, rows: 1, role: 'dmx', domain: 'other', conn: 'any' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 7, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-response-mk2-4port-din', vendor: 'ETC', name: 'Response Mk2 4-Port Gateway (DIN rail)', model: 'RSN-DMX4-DIN',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 7, note: '4 DMX/RDM universes on screw terminals; DIN43880 rail mount; 10/100 RJ45; 802.3af PoE or 12–24 VDC; 7 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM x4 (terminal)', glyph: 'gpio', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'any' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 7, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-net3-1port-gateway', vendor: 'ETC', name: 'Net3 1-Port DMX/RDM Gateway', model: 'N31G-4F',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 5, note: '1 DMX/RDM universe on 5-pin XLR (male in or female out); wall, portable or DIN; 10/100 RJ45; 802.3af PoE or 8–28 VDC; 5 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM port (5-pin)', glyph: 'xlr', count: 1, rows: 1, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 5, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-net3-2port-gateway', vendor: 'ETC', name: 'Net3 2-Port DMX/RDM Gateway', model: 'N32G-2F',
    kind: 'gateway', flavor: 'studio', ru: 0, drawW: 5, note: '2 DMX/RDM universes (1024 addresses) on 5-pin XLR; wall or pipe mount; 10/100 RJ45; 802.3af PoE or 8–28 VDC; 3.3 W typical / 5 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x2 (5-pin)', glyph: 'xlr', count: 2, rows: 1, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 5, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-net3-4port-gateway', vendor: 'ETC', name: 'Net3 4-Port DMX/RDM Gateway', model: 'N34G-4F',
    kind: 'gateway', flavor: 'studio', ru: 1, drawW: 5, note: '4 modular DMX/RDM universes (2048 addresses), female 5-pin XLR outputs; half-19in chassis, 8 DMX ports per 1U with N3GA-RM; 802.3af PoE or 8–28 VDC; 5 W max',
    groups: [
      { k: 'dmx', label: 'DMX/RDM out x4 (5-pin)', glyph: 'xlr', count: 4, rows: 2, role: 'dmx', domain: 'other', conn: 'xlr' },
      { k: 'net', label: 'Front-panel RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 5, domain: 'net', conn: 'rj45' } ] },

  { id: 'etc-net3-io-gateway', vendor: 'ETC', name: 'Net3 I/O Gateway', model: 'N3IOG',
    kind: 'gateway', flavor: 'studio', ru: 1, drawW: 5, note: 'Show-control I/O, not DMX: 12 analog 0–10 V / contact-closure inputs, 12 SPDT relay outputs, RS-232; 10/100 RJ45; 802.3af PoE or external DC PSU',
    groups: [
      { k: 'in', label: 'Analog / contact-closure in x12', glyph: 'gpio', count: 12, rows: 3, role: 'data', domain: 'other', conn: 'any' },
      { k: 'out', label: 'SPDT relay out x12', glyph: 'gpio', count: 12, rows: 3, role: 'data', domain: 'other', conn: 'any' },
      { k: 'net', label: 'RJ45 10/100', glyph: 'rj45', count: 1, rows: 1, role: 'uplink', gbps: 0.1, domain: 'net', conn: 'rj45' },
      { k: 'poe', label: 'PoE in (802.3af)', glyph: 'rj45', count: 1, rows: 1, role: 'poe-in', poe: 'poe', poeDrawW: 5, domain: 'net', conn: 'rj45' } ] }
]);
