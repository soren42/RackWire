/*
 * validate-core.js — RackWire device-catalog schema validator (authoring tool, NOT shipped).
 *
 * Purpose: audit every registered device against the contract the picker, the
 *          layout engine and the connection checker rely on, so a new or edited
 *          `devices/*.js` module fails loud here instead of silently rendering
 *          wrong in the planner.
 * Input:   the populated `window.RW` library (device-library.js + all devices/*.js
 *          must already be loaded).
 * Output:  defines `RW.validate()` → { ok, errors:[string], stats:{...} }.
 *
 * Pure browser JS: attaches one function to window.RW, touches no DOM and no Node
 * API, so it runs identically inside validate.html and inside an ephemeral headless
 * driver (see devices/SPEC.md § "Headless check"). index.html never loads this file —
 * it is authoring/CI tooling, kept out of the shipped runtime.
 *
 * The closed vocabularies below are the authority cited by devices/SPEC.md. When the
 * contract legitimately grows (a new glyph with real art, a new device kind), widen
 * the matching set here and in the SPEC in the same change — never loosen a check to
 * make a module pass.
 */
(function (RW) {
  'use strict';

  /* glyph is closed: it selects line-art in RW.GLYPHS; an unknown glyph has nothing to draw. */
  var GLYPHS = ['rj45','sfp','usba','usbc','hdmi','microhdmi','iec_in','iec_out','nema',
                'barrel','audio','xlr','bnc','sd','pcie','gpio','csi','db9','lc','rj11'];
  /* domain is closed: it selects the signal palette (net/power/usb/other). */
  var DOMAINS = ['net','power','usb','other'];
  /* flavor is closed: it is the edition floor (cumulative — pro⊇vanilla, studio⊇pro). */
  var FLAVORS = ['vanilla','pro','studio'];

  var glyphSet  = new Set(GLYPHS);
  var domainSet = new Set(DOMAINS);
  var flavorSet = new Set(FLAVORS);

  /*
   * RW.validate — run the full audit over RW.DEVICES.
   * Returns { ok:boolean, errors:[string], stats:{ total, flavors, vendors, kinds } }.
   * Never throws on bad data — a device that would crash geom() is reported as an error.
   */
  RW.validate = function validate() {
    var errors = [];
    var ids = new Map();
    var flavors = { vanilla: 0, pro: 0, studio: 0 };
    var vendors = {};
    var devices = Array.isArray(RW.DEVICES) ? RW.DEVICES : [];

    if (!devices.length) errors.push('RW.DEVICES is empty — no modules loaded?');

    devices.forEach(function (d) {
      var at = (d && d.vendor || '?') + '/' + (d && d.id || '?');
      if (!d || typeof d !== 'object') { errors.push(at + ': not an object'); return; }

      if (!d.id) errors.push(at + ': missing id');
      if (ids.has(d.id)) errors.push("DUPLICATE id '" + d.id + "' (" + d.vendor + ' & ' + ids.get(d.id) + ')');
      ids.set(d.id, d.vendor);

      if (!flavorSet.has(d.flavor)) errors.push(at + ": bad flavor '" + d.flavor + "'");
      else flavors[d.flavor]++;

      if (!d.vendor) errors.push(at + ': missing vendor');
      else vendors[d.vendor] = (vendors[d.vendor] || 0) + 1;

      if (!d.name)  errors.push(at + ': missing name');
      if (!d.kind)  errors.push(at + ': missing kind');
      if (typeof d.drawW !== 'number' || d.drawW < 0) errors.push(at + ': drawW not a non-neg number (' + d.drawW + ')');
      if (typeof d.ru !== 'number' || d.ru < 0 || d.ru > 60) errors.push(at + ': ru out of range (' + d.ru + ')');

      /* groups may legitimately be empty — e.g. the generic 'blank' starter device,
         which renders as a bare box the user adds ports to. Only the shape is required. */
      if (!Array.isArray(d.groups)) { errors.push(at + ': groups not an array'); return; }

      var seenKeys = new Set();
      d.groups.forEach(function (g) {
        var gat = at + '[' + (g && g.k || '?') + ']';
        if (!g || typeof g !== 'object') { errors.push(gat + ': group not an object'); return; }
        if (!g.k) errors.push(gat + ': missing group key');
        if (seenKeys.has(g.k)) errors.push(gat + ': duplicate group key within device');
        seenKeys.add(g.k);
        if (!glyphSet.has(g.glyph))  errors.push(gat + ": illegal glyph '" + g.glyph + "'");
        if (!domainSet.has(g.domain)) errors.push(gat + ": illegal domain '" + g.domain + "'");
        if (!Number.isInteger(g.count) || g.count < 1 || g.count > 512) errors.push(gat + ': count out of 1..512 (' + g.count + ')');
        if (!Number.isInteger(g.rows) || g.rows < 1 || g.rows > g.count) errors.push(gat + ': rows out of 1..count (' + g.rows + '/' + g.count + ')');
        if (!g.conn) errors.push(gat + ': missing conn');
        if (!g.role) errors.push(gat + ': missing role');
      });

      /* geom() must not throw and must yield positive dimensions — the picker calls it per device. */
      try {
        var geo = RW.geom(d);
        if (!geo || !(geo.w > 0) || !(geo.h > 0)) errors.push(at + ': geom() bad dims ' + JSON.stringify(geo && { w: geo.w, h: geo.h }));
      } catch (e) { errors.push(at + ': geom() threw ' + e.message); }
    });

    /* Registry integrity: the load-time indexes must account for exactly every device. */
    var byVendorTotal = Object.keys(RW.byVendor || {}).reduce(function (a, k) { return a + RW.byVendor[k].length; }, 0);
    var byFlavorTotal = Object.keys(RW.byFlavor || {}).reduce(function (a, k) { return a + RW.byFlavor[k].length; }, 0);
    if (byVendorTotal !== devices.length) errors.push('byVendor total ' + byVendorTotal + ' != DEVICES ' + devices.length);
    if (byFlavorTotal !== devices.length) errors.push('byFlavor total ' + byFlavorTotal + ' != DEVICES ' + devices.length);

    /* search(): '' returns everything; a known term returns a non-empty subset. */
    if (typeof RW.search === 'function') {
      if (RW.search('').length !== devices.length) errors.push('search("") != all devices');
    } else {
      errors.push('RW.search is not a function');
    }

    return {
      ok: errors.length === 0,
      errors: errors,
      stats: {
        total: devices.length,
        flavors: flavors,
        vendors: vendors,
        kinds: typeof RW.kinds === 'function' ? RW.kinds() : []
      }
    };
  };
})(window.RW = window.RW || {});
