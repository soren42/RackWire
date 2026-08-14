/* RackWire device library — Netool.io handheld network testers.
   Specs sourced from vendor tech-spec sheets (netool.io datasheets /
   store pages). Registers into the shared window.RW library via
   addDevices(); loaded by index.html after device-library.js (the core
   engine).

   Both current SKUs share one pocket form factor: a single RJ45
   Ethernet test/analysis port (detects the connected switch port's
   advertised link speed, PoE, VLAN, CDP/LLDP,
   DHCP, 802.1X — driven from a phone app over BLE 5.0 / WiFi), plus two
   USB-C jacks (charge + a data port). Wireless links are not modelled as
   physical port groups. Internal 2500 mAh 3.7 V Li-poly cell (~12 h). */
window.RW.addDevices([
  { id: 'ntl-pro2', vendor: 'Netool.io', name: 'netool.io Pro2 (NE1D)', model: 'NE1D',
      kind: 'console', flavor: 'pro', ru: 0, upc: '', drawW: 2,
      note: 'Pocket network analyser · RJ45 Ethernet test/analysis port detects the switch port\'s advertised link speed, PoE, VLAN, CDP/LLDP, DHCP, 802.1X · app-driven over BLE 5.0 / WiFi · USB-C data port supports PCAP + optional RS232 (Rconsole) cable · internal 2500 mAh / 9.25 Wh battery',
      groups: [
        { k: 'test', label: 'Ethernet test/analysis', glyph: 'rj45', count: 1, rows: 1, role: 'data', domain: 'net', conn: 'rj45' },
        { k: 'chg', label: 'USB-C charge · 5 V 1 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 5, volts: 5, domain: 'power', conn: 'usbc' },
        { k: 'usbdata', label: 'USB-C data (PCAP / accessories)', glyph: 'usbc', count: 1, rows: 1, role: 'data', domain: 'usb', conn: 'usbc' }
      ] },
  { id: 'ntl-lite', vendor: 'Netool.io', name: 'netool.io Lite (NE1E)', model: 'NE1E',
      kind: 'console', flavor: 'pro', ru: 0, upc: '', drawW: 2,
      note: 'Network switch discovery tool · RJ45 Ethernet test/analysis port detects the switch port\'s advertised link speed, PoE, VLAN, CDP/LLDP, DHCP · app-driven over BLE 5.0 / WiFi · USB-C data port reserved for future use · internal 2500 mAh / 9.25 Wh battery',
      groups: [
        { k: 'test', label: 'Ethernet test/analysis', glyph: 'rj45', count: 1, rows: 1, role: 'data', domain: 'net', conn: 'rj45' },
        { k: 'chg', label: 'USB-C charge · 5 V 1 A', glyph: 'usbc', count: 1, rows: 1, role: 'power-in', watts: 5, volts: 5, domain: 'power', conn: 'usbc' },
        { k: 'usbdata', label: 'USB-C data (future use)', glyph: 'usbc', count: 1, rows: 1, role: 'data', domain: 'usb', conn: 'usbc' }
      ] }
]);
