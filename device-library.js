/* RackWire — port glyphs, cable standards, seeded device library.
   Specs sourced from vendor tech-spec sheets (Ubiquiti techspecs.ui.com, Apple,
   Samsung, Raspberry Pi, Arduino/Qualcomm, M5Stack, ETC Eos, Minisforum).
   Every device carries a `flavor` — vanilla | pro | studio — marking the lowest
   product tier it ships in. Tiers are cumulative (a floor, not a partition):
   pro includes every vanilla device, studio includes every pro device. */
(function () {
  // ---------- port glyph geometry (line art, local coords) ----------
  var G = {
    rj45: { w: 20, h: 18, shapes: [
      { t: 'path', d: 'M1 1 H19 V11 H14.5 V17 H5.5 V11 H1 Z' },
      { t: 'line', x1: 5, y1: 1, x2: 5, y2: 5 }, { t: 'line', x1: 8, y1: 1, x2: 8, y2: 5 },
      { t: 'line', x1: 11, y1: 1, x2: 11, y2: 5 }, { t: 'line', x1: 14, y1: 1, x2: 14, y2: 5 } ] },
    sfp: { w: 26, h: 14, shapes: [
      { t: 'rect', x: 1, y: 1, w: 24, h: 12, r: 1.5 },
      { t: 'rect', x: 4, y: 4.5, w: 18, h: 5, r: 1 } ] },
    usba: { w: 17, h: 9, shapes: [
      { t: 'rect', x: 1, y: 1, w: 15, h: 7, r: 0.8 },
      { t: 'rect', x: 3.5, y: 4.4, w: 10, h: 2.2, r: 0.5 } ] },
    usbc: { w: 15, h: 8, shapes: [
      { t: 'rect', x: 1, y: 1, w: 13, h: 6, r: 3 },
      { t: 'rect', x: 3.5, y: 3, w: 8, h: 2, r: 1 } ] },
    hdmi: { w: 23, h: 10, shapes: [
      { t: 'path', d: 'M2 1 H21 L19 9 H4 Z' },
      { t: 'path', d: 'M5 3.5 H18 L17 6.5 H6 Z' } ] },
    microhdmi: { w: 14, h: 7, shapes: [
      { t: 'path', d: 'M1.5 1 H12.5 L11.5 6 H2.5 Z' } ] },
    iec_in: { w: 25, h: 17, shapes: [
      { t: 'path', d: 'M1 5 L5 1 H20 L24 5 V16 H1 Z' },
      { t: 'rect', x: 5, y: 6.5, w: 3, h: 6, r: 0.6 },
      { t: 'rect', x: 11, y: 6.5, w: 3, h: 6, r: 0.6 },
      { t: 'rect', x: 17, y: 6.5, w: 3, h: 6, r: 0.6 } ] },
    iec_out: { w: 25, h: 17, shapes: [
      { t: 'path', d: 'M1 1 H24 V12 L20 16 H5 L1 12 Z' },
      { t: 'rect', x: 5, y: 4.5, w: 3, h: 6, r: 0.6 },
      { t: 'rect', x: 11, y: 4.5, w: 3, h: 6, r: 0.6 },
      { t: 'rect', x: 17, y: 4.5, w: 3, h: 6, r: 0.6 } ] },
    nema: { w: 22, h: 18, shapes: [
      { t: 'rect', x: 1, y: 1, w: 20, h: 16, r: 4 },
      { t: 'rect', x: 5.5, y: 4, w: 2.4, h: 6, r: 0.6 },
      { t: 'rect', x: 14, y: 4, w: 2.4, h: 6, r: 0.6 },
      { t: 'circle', cx: 11, cy: 13, r: 2 } ] },
    barrel: { w: 14, h: 14, shapes: [
      { t: 'circle', cx: 7, cy: 7, r: 6 }, { t: 'circle', cx: 7, cy: 7, r: 2 } ] },
    audio: { w: 12, h: 12, shapes: [
      { t: 'circle', cx: 6, cy: 6, r: 5 }, { t: 'circle', cx: 6, cy: 6, r: 1.8 } ] },
    xlr: { w: 16, h: 16, shapes: [
      { t: 'circle', cx: 8, cy: 8, r: 7 }, { t: 'circle', cx: 5.4, cy: 6.5, r: 1.3 },
      { t: 'circle', cx: 10.6, cy: 6.5, r: 1.3 }, { t: 'circle', cx: 8, cy: 10.6, r: 1.3 } ] },
    bnc: { w: 14, h: 14, shapes: [
      { t: 'circle', cx: 7, cy: 7, r: 6 }, { t: 'circle', cx: 7, cy: 7, r: 1.4 },
      { t: 'line', x1: 1, y1: 3, x2: 2.4, y2: 3 }, { t: 'line', x1: 11.6, y1: 3, x2: 13, y2: 3 } ] },
    sd: { w: 16, h: 7, shapes: [ { t: 'path', d: 'M1 1 H12.5 L15 3 V6 H1 Z' } ] },
    pcie: { w: 66, h: 9, shapes: [
      { t: 'rect', x: 1, y: 1, w: 64, h: 7, r: 1 }, { t: 'line', x1: 13, y1: 1, x2: 13, y2: 8 } ] },
    gpio: { w: 48, h: 11, shapes: [
      { t: 'rect', x: 1, y: 1, w: 46, h: 9, r: 1 },
      { t: 'line', x1: 4, y1: 3.2, x2: 44, y2: 3.2 }, { t: 'line', x1: 4, y1: 7.8, x2: 44, y2: 7.8 } ] },
    csi: { w: 20, h: 6, shapes: [ { t: 'rect', x: 1, y: 1, w: 18, h: 4, r: 0.8 } ] },
    db9: { w: 22, h: 11, shapes: [
      { t: 'path', d: 'M2 1 H20 L18 10 H4 Z' }, { t: 'line', x1: 5, y1: 4, x2: 17, y2: 4 },
      { t: 'line', x1: 6.5, y1: 7, x2: 15.5, y2: 7 } ] },
    lc: { w: 22, h: 12, shapes: [
      { t: 'rect', x: 1, y: 1, w: 9, h: 10, r: 1 }, { t: 'rect', x: 12, y: 1, w: 9, h: 10, r: 1 } ] },
    rj11: { w: 15, h: 15, shapes: [
      { t: 'path', d: 'M1 1 H14 V9 H10.5 V14 H4.5 V9 H1 Z' } ] }
  };

  // ---------- signal domains ----------
  // Brand Standards v1.1 signal domains: network = cyan, power = amber,
  // USB/serial = SuperSpeed blue, other = slate. Values live in index.html.
  var DOMAIN = { net: 'net', power: 'power', usb: 'usb', other: 'other' };

  // ---------- cable standards ----------
  var CABLES = [
    { id: 'cat5e', name: 'Cat5e U/UTP', domain: 'net', gbps: 2.5, maxM: 100, conn: 'rj45' },
    { id: 'cat6', name: 'Cat6 U/UTP', domain: 'net', gbps: 10, maxM: 55, conn: 'rj45',
      note: '10G limited to 55 m; 5G/2.5G to 100 m' },
    { id: 'cat6a', name: 'Cat6a F/UTP', domain: 'net', gbps: 10, maxM: 100, conn: 'rj45' },
    { id: 'cat7', name: 'Cat7 S/FTP', domain: 'net', gbps: 10, maxM: 100, conn: 'rj45' },
    { id: 'cat8', name: 'Cat8 S/FTP', domain: 'net', gbps: 25, maxM: 30, conn: 'rj45' },
    { id: 'modseat', name: 'Transceiver seated in cage', domain: 'net', gbps: 25, maxM: 0.1, conn: 'sfp',
      note: 'Not a cable — the module occupying the SFP+ cage' },
    { id: 'dac10', name: 'SFP+ DAC (passive)', domain: 'net', gbps: 10, maxM: 7, conn: 'sfp' },
    { id: 'aoc10', name: 'SFP+ AOC (active optical)', domain: 'net', gbps: 10, maxM: 100, conn: 'sfp' },
    { id: 'om3', name: 'OM3 duplex LC + SFP+ SR', domain: 'net', gbps: 10, maxM: 300, conn: 'sfp' },
    { id: 'os2', name: 'OS2 duplex LC + SFP+ LR', domain: 'net', gbps: 10, maxM: 10000, conn: 'sfp' },
    { id: 'usb2a', name: 'USB 2.0 A→B/A', domain: 'usb', gbps: 0.48, maxM: 5, conn: 'usba' },
    { id: 'usb3a', name: 'USB 3.2 Gen1 Type-A', domain: 'usb', gbps: 5, maxM: 3, conn: 'usba' },
    { id: 'usb3a10', name: 'USB 3.2 Gen2 Type-A', domain: 'usb', gbps: 10, maxM: 1, conn: 'usba' },
    { id: 'usbc10', name: 'USB-C 10 Gbps', domain: 'usb', gbps: 10, maxM: 1, conn: 'usbc' },
    { id: 'usbc20', name: 'USB4 / TB4 passive', domain: 'usb', gbps: 40, maxM: 0.8, conn: 'usbc' },
    { id: 'tb5', name: 'Thunderbolt 5 passive', domain: 'usb', gbps: 120, maxM: 1, conn: 'usbc' },
    { id: 'tb5o', name: 'Thunderbolt 5 optical', domain: 'usb', gbps: 80, maxM: 50, conn: 'usbc' },
    { id: 'usbapd', name: 'USB-A charging cable', domain: 'power', watts: 18, maxM: 2, conn: 'usba' },
    { id: 'usbcpd', name: 'USB-C PD power', domain: 'power', watts: 240, maxM: 2, conn: 'usbc' },
    { id: 'nemaext', name: 'NEMA 5-15P→5-15R extension', domain: 'power', amps: 15, volts: 120, maxM: 15, conn: 'iec' },
    { id: 'c13c14', name: 'IEC C13→C14 (18 AWG)', domain: 'power', amps: 10, volts: 120, maxM: 5, conn: 'iec' },
    { id: 'c13c14h', name: 'IEC C13→C14 (14 AWG)', domain: 'power', amps: 15, volts: 120, maxM: 5, conn: 'iec' },
    { id: 'nemac7', name: 'NEMA 5-15P→C7 figure-8 (18 AWG)', domain: 'power', amps: 2.5, volts: 120, maxM: 3, conn: 'iec',
      note: 'C7 coupler rated 2.5 A / 300 W — Mac mini, Apple TV, Time Capsule' },
    { id: 'nemac13', name: 'NEMA 5-15P→C13', domain: 'power', amps: 13, volts: 120, maxM: 5, conn: 'iec' },
    { id: 'dcbarrel', name: 'DC barrel (PSU lead)', domain: 'power', watts: 250, maxM: 2, conn: 'barrel' },
    { id: 'hdmi20', name: 'HDMI 2.0 High Speed', domain: 'other', gbps: 18, maxM: 5, conn: 'hdmi' },
    { id: 'hdmi21', name: 'HDMI 2.1 Ultra High Speed', domain: 'other', gbps: 48, maxM: 3, conn: 'hdmi' },
    { id: 'hdmi21o', name: 'HDMI 2.1 active optical', domain: 'other', gbps: 48, maxM: 30, conn: 'hdmi' },
    { id: 'dp14', name: 'DisplayPort 1.4', domain: 'other', gbps: 32.4, maxM: 3, conn: 'usbc' },
    { id: 'trs35', name: '3.5 mm TRS analog', domain: 'other', maxM: 8, conn: 'audio' },
    { id: 'xlr', name: 'XLR balanced analog', domain: 'other', maxM: 100, conn: 'xlr' },
    { id: 'sdi', name: '12G-SDI coax (BNC)', domain: 'other', gbps: 12, maxM: 80, conn: 'bnc' },
    { id: 'serial', name: 'RS-232 console (DB9)', domain: 'other', gbps: 0.000115, maxM: 15, conn: 'db9' },
    { id: 'rj45console', name: 'RJ45 rollover console', domain: 'other', gbps: 0.000115, maxM: 15, conn: 'rj45' },
    { id: 'other', name: 'Other / custom', domain: 'other', maxM: 999, conn: 'any' }
  ];

  // ---------- device library ----------
  // device: {id,vendor,name,model,kind,flavor,ru,drawW,note?,groups[]}  flavor: vanilla|pro|studio (cumulative floor)
  // group:  {k,label,glyph,count,rows,role,gbps,watts,amps,poe,domain,conn}
  var DEVICES = [];

  // ---------- layout engine: turns groups into positioned ports ----------
  var PAD_X = 16, BAND_TOP = 28, BAND_BOT = 38, GAP = 22, IN_GAP = 5;
  function labelW(s) { return (s || '').length * 4.9 + 4; }

  function layout(def) {
    var groups = (def.groups || []).map(function (g) {
      var gl = G[g.glyph] || G.rj45;
      var rows = Math.max(1, Math.min(g.rows || 1, g.count));
      var cols = Math.ceil(g.count / rows);
      var gw = cols * gl.w + (cols - 1) * IN_GAP;
      var gh = rows * gl.h + (rows - 1) * IN_GAP;
      return { g: g, gl: gl, rows: rows, cols: cols, gw: gw, gh: gh, blockW: Math.max(gw, labelW(g.label)) };
    });
    var innerH = groups.reduce(function (m, x) { return Math.max(m, x.gh); }, 20);
    var sumW = groups.reduce(function (s, x) { return s + x.blockW; }, 0) + Math.max(0, groups.length - 1) * GAP;
    // the header row (name left, model right) also sets a floor on width
    var headW = PAD_X * 2 + (def.name || '').length * 6.5 + 20 + (def.model || '').length * 5.3;
    var w = Math.max(200, sumW + PAD_X * 2, headW);
    var h = BAND_TOP + innerH + BAND_BOT;
    var ports = [], x = PAD_X;
    groups.forEach(function (b) {
      var gx = x + (b.blockW - b.gw) / 2;
      var gy = BAND_TOP + (innerH - b.gh) / 2;
      for (var i = 0; i < b.g.count; i++) {
        var col = Math.floor(i / b.rows), row = i % b.rows;
        var px = gx + col * (b.gl.w + IN_GAP), py = gy + row * (b.gl.h + IN_GAP);
        ports.push({
          id: b.g.k + '-' + (i + 1),
          label: b.g.count > 1 ? b.g.k.toUpperCase() + (i + 1) : b.g.k.toUpperCase(),
          groupLabel: b.g.label, glyph: b.g.glyph, gw: b.gl.w, gh: b.gl.h,
          x: px, y: py, cx: px + b.gl.w / 2, cy: py + b.gl.h / 2,
          role: b.g.role, gbps: b.g.gbps, watts: b.g.watts, amps: b.g.amps, volts: b.g.volts, batt: b.g.batt,
          poe: b.g.poe, poeW: b.g.poeW, poeDrawW: b.g.poeDrawW,
          domain: b.g.domain, conn: b.g.conn
        });
      }
      ports.groupMarks = ports.groupMarks || [];
      ports.groupMarks.push({ label: b.g.label, x: x + b.blockW / 2, y: BAND_TOP + innerH + 12 });
      x += b.blockW + GAP;
    });
    return { w: w, h: h, ports: ports, marks: ports.groupMarks || [] };
  }

  // ---------- library registry + load-time indexes ----------
  // Device data lives in devices/*.js, each calling RW.addDevices([...]).
  // Indexes and the search haystack are built incrementally on add and
  // self-heal in search() when RW.DEVICES is mutated elsewhere (e.g. the
  // discovery mergeDefs path), so no caller needs to reindex by hand.
  var byVendor = {}, byKind = {}, byFlavor = {}, hay = {}, geomCache = {};
  var indexedLen = 0;
  function pushIx(map, key, d) { (map[key] = map[key] || []).push(d); }
  function clearObj(o) { for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) delete o[k]; } }
  function indexOne(d) {
    pushIx(byVendor, d.vendor, d); pushIx(byKind, d.kind, d); pushIx(byFlavor, d.flavor, d);
    hay[d.id] = ((d.name || '') + ' ' + (d.model || '') + ' ' + (d.vendor || '') + ' ' + (d.kind || '') + ' ' + (d.upc || '')).toLowerCase();
  }
  // reindex clears the index objects IN PLACE so the references exported on
  // window.RW stay valid — never reassign them, or RW.byVendor goes stale.
  function reindex() {
    clearObj(byVendor); clearObj(byKind); clearObj(byFlavor); clearObj(hay); clearObj(geomCache);
    for (var i = 0; i < DEVICES.length; i++) indexOne(DEVICES[i]);
    indexedLen = DEVICES.length;
  }
  function ensureIndex() { if (indexedLen !== DEVICES.length) reindex(); }
  // addDevices — append a vendor module's entries and index them.
  function addDevices(arr) {
    if (!arr || !arr.length) return;
    for (var i = 0; i < arr.length; i++) { DEVICES.push(arr[i]); indexOne(arr[i]); }
    indexedLen = DEVICES.length;
  }
  // search — case-insensitive match over name/model/vendor/kind via the
  // cached haystack. Empty query returns the whole library.
  function search(q) {
    ensureIndex();
    q = (q || '').toLowerCase();
    if (!q) return DEVICES.slice();
    var out = [];
    for (var i = 0; i < DEVICES.length; i++) { var d = DEVICES[i]; if ((hay[d.id] || '').indexOf(q) >= 0) out.push(d); }
    return out;
  }
  // geom — memoized layout geometry for a library def. Keyed by id +
  // content signature so a mergeDefs replacement recomputes automatically.
  function geom(d) {
    var k = d.id + ':' + (d.groups ? d.groups.length : 0) + ':' + d.name + ':' + d.model;
    if (!geomCache[k]) geomCache[k] = layout({ groups: d.groups, name: d.name, model: d.model });
    return geomCache[k];
  }

  window.RW = {
    GLYPHS: G, CABLES: CABLES, DEVICES: DEVICES, DOMAIN: DOMAIN, layout: layout,
    byVendor: byVendor, byKind: byKind, byFlavor: byFlavor,
    addDevices: addDevices, reindex: reindex, search: search, geom: geom,
    vendors: function () { ensureIndex(); return Object.keys(byVendor).sort(); },
    kinds: function () { ensureIndex(); return Object.keys(byKind).sort(); },
    flavors: function () { return ['vanilla', 'pro', 'studio']; }
  };
})();
