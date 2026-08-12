/* discover.js — RackWire Discovery console logic.
 *
 * Purpose:  drive the discovery backend (DISCOVERY-DESIGN.md §6) and hand
 *           confirmed devices to the pristine planner iframe through its
 *           documented host API only (postMessage {source:'rackwire', cmd,
 *           args} and, when same-origin allows, window.RackWire directly).
 * Input:    /api/discovery/* JSON endpoints (same origin).
 * Output:   DOM updates; plan payloads posted into #plannerFrame.
 *
 * Plain browser ES module. No framework, no bundler, no CDN. The planner file
 * is never modified — everything goes through its published surface.
 */

'use strict';

/* ── constants ─────────────────────────────────────────────────────────── */

const API_BASE = '/api/discovery';
const SCAN_POLL_MS = 2000;          // scan-status poll cadence
const CSRF_HEADER = 'X-RackWire-CSRF';

/* ── module state ──────────────────────────────────────────────────────── */

const state = {
  csrf: null,          // from GET /health {csrf}; sent on every POST
  devices: [],         // last device list
  runId: null,         // active scan run id (null when idle)
  pollTimer: null,     // setTimeout handle for scan polling
  selectedId: null,    // device id open in the drawer
  plannerReady: false, // planner iframe emitted its 'ready' event
};

/* ── tiny DOM helpers ──────────────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);

/* esc(s) → HTML-safe string. All server data goes through this before
   entering innerHTML; never trust scanner output (banners, sysDescr). */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* toast(msg, isError) — transient status line; auto-clears. */
let toastTimer = null;
function toast(msg, isError) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.toggle('toast-err', !!isError);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

/* ── API layer ─────────────────────────────────────────────────────────── */

/* apiGet(path) → parsed JSON. Throws Error with server detail on failure. */
async function apiGet(path) {
  const res = await fetch(API_BASE + path, { credentials: 'same-origin' });
  return unwrap(res);
}

/* apiPost(path, body) → parsed JSON. Attaches the CSRF header (§7:
   double-submit token required on every state-changing request). */
async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER]: state.csrf || '',
    },
    body: JSON.stringify(body || {}),
  });
  return unwrap(res);
}

/* unwrap(res) — shared response handling: JSON on ok, {error,detail} on not. */
async function unwrap(res) {
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON body; fall through */ }
  if (!res.ok) {
    const msg = (data && (data.detail || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/* ── planner bridge ────────────────────────────────────────────────────────
   The planner (../index.html, byte-for-byte pristine) accepts
     host → frame:  { source:'rackwire', cmd:'<method>', args:[...] }
   and emits
     frame → host:  { source:'rackwire', event:'ready'|'change'|..., payload }.
   We prefer postMessage (works regardless of frame internals); when the
   same-origin window.RackWire object is reachable we may also read from it,
   but all writes go through the message channel for a single code path.     */

function plannerSend(cmd, args) {
  const frame = $('plannerFrame');
  if (!frame || !frame.contentWindow) {
    toast('Planner frame not available', true);
    return;
  }
  // Target the exact deployment origin, never '*': the planner is served from
  // the same vhost, so scoping the message keeps plan payloads from leaking to
  // whatever document might occupy the frame after a navigation.
  frame.contentWindow.postMessage(
    { source: 'rackwire', cmd, args: args || [] }, window.location.origin);
}

/* Listen for planner lifecycle events (ready lets us gate the push button).
   Accept only same-origin messages that actually came from our planner frame —
   any other window on the page could otherwise forge a 'ready'. */
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  const frame = $('plannerFrame');
  if (!frame || e.source !== frame.contentWindow) return;
  const m = e.data;
  if (!m || m.source !== 'rackwire' || !m.event) return;
  if (m.event === 'ready') {
    state.plannerReady = true;
  }
});

/* ── scan flow ─────────────────────────────────────────────────────────── */

/* startScan(subnet) — POST /scan then poll /scan/{id} until terminal. */
async function startScan(subnet) {
  const body = subnet ? { subnet } : {};
  try {
    setScanUi(true, 'starting…');
    const out = await apiPost('/scan', body);
    state.runId = out.runId;
    pollScan();
  } catch (err) {
    setScanUi(false, '');
    toast(`Scan failed to start: ${err.message}`, true);
  }
}

/* pollScan() — one status poll; reschedules itself while the run is live. */
async function pollScan() {
  if (state.runId == null) return;
  try {
    // GET /scan/{id} returns {scan: run}; tolerate a bare run too.
    const out = await apiGet(`/scan/${state.runId}`);
    const run = (out && out.scan) || out || {};
    const status = run.status || 'running';
    const progress = run.progress != null ? ` · ${esc(String(run.progress))}` : '';
    if (status === 'running') {
      setScanUi(true, `scanning${progress}`);
      state.pollTimer = setTimeout(pollScan, SCAN_POLL_MS);
      // Refresh the table mid-run so devices stream in as found.
      refreshDevices();
    } else {
      // done | error | cancelled — terminal either way.
      state.runId = null;
      setScanUi(false, status === 'done' ? 'scan complete' : `scan ${status}`);
      if (status === 'error') toast(run.error || 'Scan ended with an error', true);
      refreshDevices();
    }
  } catch (err) {
    // A transient poll failure should not kill the run view; retry once more
    // slowly, then give up with a visible notice.
    state.runId = null;
    setScanUi(false, '');
    toast(`Lost scan status: ${err.message}`, true);
  }
}

/* cancelScan() — POST /scan/{id}/cancel; polling picks up the flip. */
async function cancelScan() {
  if (state.runId == null) return;
  try { await apiPost(`/scan/${state.runId}/cancel`, {}); }
  catch (err) { toast(`Cancel failed: ${err.message}`, true); }
}

/* setScanUi(running, label) — toggles the scan controls + status line. */
function setScanUi(running, label) {
  $('scanBtn').disabled = running;
  $('cancelBtn').hidden = !running;
  const st = $('scanStatus');
  st.textContent = label || '';
  st.classList.toggle('scanStatus-live', running);
}

/* ── device table ──────────────────────────────────────────────────────── */

/* refreshDevices() — GET /devices (honouring the status filter) → render. */
async function refreshDevices() {
  try {
    const filter = $('statusFilter').value;
    const qs = filter ? `?status=${encodeURIComponent(filter)}` : '';
    const out = await apiGet(`/devices${qs}`);
    state.devices = Array.isArray(out) ? out : (out.devices || []);
    renderTable();
  } catch (err) {
    toast(`Device list failed: ${err.message}`, true);
  }
}

/* renderTable() — rows from state.devices; row click opens the drawer. */
function renderTable() {
  const tbody = $('deviceRows');
  if (!state.devices.length) {
    tbody.innerHTML = '<tr class="emptyRow"><td colspan="6">No devices yet — run a scan.</td></tr>';
    return;
  }
  tbody.innerHTML = state.devices.map((d) => {
    const conf = d.confidence != null ? Number(d.confidence).toFixed(2) : '—';
    const sel = d.id === state.selectedId ? ' rowSelected' : '';
    return `<tr class="deviceRow${sel}" data-id="${esc(d.id)}" tabindex="0">
      <td class="mono">${esc(d.ip)}</td>
      <td class="mono">${esc(d.mac)}</td>
      <td>${esc(d.vendor)}</td>
      <td>${esc(d.classification)}</td>
      <td class="mono">${esc(conf)}</td>
      <td><span class="status status-${esc(d.status || 'discovered')}">${esc(d.status || 'discovered')}</span></td>
    </tr>`;
  }).join('');
}

/* ── detail drawer ─────────────────────────────────────────────────────── */

/* openDrawer(id) — GET /devices/{id}; render ports/services/neighbors/
   inferences. Read failures leave the drawer closed with a toast. */
async function openDrawer(id) {
  try {
    // GET /devices/{id} returns {device: dev}; tolerate a bare device too.
    const out = await apiGet(`/devices/${id}`);
    const d = (out && out.device) || out || {};
    state.selectedId = id;
    $('drawerTitle').textContent = d.hostname || d.ip || `device #${id}`;
    $('drawerBody').innerHTML = renderDetail(d);
    $('drawer').hidden = false;
    renderTable(); // repaint selection highlight
  } catch (err) {
    toast(`Detail failed: ${err.message}`, true);
  }
}

function closeDrawer() {
  $('drawer').hidden = true;
  state.selectedId = null;
  renderTable();
}

/* renderDetail(d) — static HTML for the drawer body. Defensive about shape:
   every section tolerates a missing/empty array. */
function renderDetail(d) {
  const kv = (k, v) => v == null || v === '' ? '' :
    `<div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;

  const facts = [
    kv('IP', d.ip), kv('MAC', d.mac), kv('Vendor', d.vendor),
    kv('Hostname', d.hostname), kv('OS guess', d.osGuess || d.os_guess),
    kv('sysDescr', d.sysDescr || d.sys_descr),
    kv('Classification', d.classification), kv('Role', d.role),
    kv('Confidence', d.confidence != null ? Number(d.confidence).toFixed(2) : null),
    kv('Source', d.source), kv('Status', d.status),
  ].join('');

  const ports = (d.ports || []).map((p) =>
    `<tr><td class="mono">${esc(p.ifName || p.if_name)}</td>
         <td class="mono">${esc(p.ifSpeedMbps ?? p.if_speed_mbps ?? '')}</td>
         <td>${esc(p.operStatus || p.oper_status || '')}</td></tr>`).join('');

  const services = (d.services || d.openServices || []).map((s) =>
    `<tr><td class="mono">${esc(s.port)}/${esc(s.proto)}</td>
         <td>${esc(s.service || '')}</td>
         <td>${esc([s.product, s.version].filter(Boolean).join(' '))}</td></tr>`).join('');

  const neighbors = (d.neighbors || []).map((n) =>
    `<tr><td class="mono">${esc(n.localPort || n.local_port || '')}</td>
         <td>${esc(n.remoteSysName || n.remote_sys_name || n.remoteChassisId || n.remote_chassis_id || '')}</td>
         <td class="mono">${esc(n.remotePortId || n.remote_port_id || '')}</td></tr>`).join('');

  const inferences = (d.inferences || []).map((i) => {
    let out = i.output || i.outputJson || i.output_json || {};
    if (typeof out === 'string') { try { out = JSON.parse(out); } catch { out = { raw: out }; } }
    return `<div class="infCard">
      <div class="infHead"><span class="engine">${esc(i.engine)}</span>
        ${i.model ? `<span class="mono dim">${esc(i.model)}</span>` : ''}
        <span class="dim">${esc(i.createdAt || i.created_at || '')}</span></div>
      <div>${esc(out.classification || '')} ${out.confidence != null ? `· conf ${esc(Number(out.confidence).toFixed(2))}` : ''}</div>
      ${out.rationale ? `<div class="dim">${esc(out.rationale)}</div>` : ''}
    </div>`;
  }).join('');

  const table = (head, rows) => rows
    ? `<table class="miniTable"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`
    : '<div class="dim">none</div>';

  return `
    <div class="factGrid">${facts}</div>
    <h3>Ports</h3>${table('<th>if</th><th>Mbps</th><th>oper</th>', ports)}
    <h3>Services</h3>${table('<th>port</th><th>service</th><th>product</th>', services)}
    <h3>Neighbors</h3>${table('<th>local</th><th>remote</th><th>port</th>', neighbors)}
    <h3>Inferences</h3>${inferences || '<div class="dim">none</div>'}`;
}

/* ── drawer actions: infer / confirm / reject ──────────────────────────── */

/* deviceAction(path, body, verb) — shared POST wrapper for the three
   buttons; on success reloads both the drawer detail and the table. */
async function deviceAction(path, body, verb) {
  if (state.selectedId == null) return;
  const id = state.selectedId;
  try {
    await apiPost(`/devices/${id}${path}`, body);
    toast(`${verb} ok`);
    await Promise.all([openDrawer(id), refreshDevices()]);
  } catch (err) {
    toast(`${verb} failed: ${err.message}`, true);
  }
}

/* ── push confirmed → planner ──────────────────────────────────────────── */

/* pushToPlanner() — POST /plan/build then hand {groups, links} to the
   planner. The planner's own surface takes plan-shaped {devices, cables};
   the backend mapper may return either that shape directly or the
   groups/links payload, so we normalize: any entry gets a stable uid and
   goes in through `patch` (merge-by-uid — additive, doesn't clobber
   whatever the operator already has on the canvas). */
async function pushToPlanner() {
  try {
    const payload = await apiPost('/plan/build', {});
    const devices = (payload.devices || payload.groups || []).map((g, i) => (
      { uid: g.uid || `disc-${g.k || g.id || i}`, ...g }
    ));
    const cables = (payload.cables || payload.links || []).map((l, i) => (
      { uid: l.uid || `disc-link-${l.id || i}`, ...l }
    ));
    if (!devices.length) {
      toast('No confirmed devices to push', true);
      return;
    }
    plannerSend('patch', [{ devices, cables }]);
    toast(`Pushed ${devices.length} device(s), ${cables.length} link(s) to planner`);
    refreshDevices(); // statuses flip to imported server-side
  } catch (err) {
    toast(`Push failed: ${err.message}`, true);
  }
}

/* ── boot ──────────────────────────────────────────────────────────────── */

async function init() {
  // Health first: liveness + the CSRF token every POST needs.
  try {
    const h = await apiGet('/health');
    state.csrf = h.csrf || null;
    if (!state.csrf) toast('Backend returned no CSRF token — POSTs may fail', true);
  } catch (err) {
    toast(`Discovery backend unreachable: ${err.message}`, true);
  }

  // Wire the controls.
  $('scanForm').addEventListener('submit', (e) => {
    e.preventDefault();
    startScan($('subnetInput').value.trim());
  });
  $('cancelBtn').addEventListener('click', cancelScan);
  $('refreshBtn').addEventListener('click', refreshDevices);
  $('statusFilter').addEventListener('change', refreshDevices);
  $('pushBtn').addEventListener('click', pushToPlanner);
  $('drawerClose').addEventListener('click', closeDrawer);

  // Row click / keyboard-activate → drawer (event delegation).
  const activate = (e) => {
    const row = e.target.closest('tr.deviceRow');
    if (!row) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openDrawer(Number(row.dataset.id));
  };
  $('deviceRows').addEventListener('click', activate);
  $('deviceRows').addEventListener('keydown', activate);

  $('inferBtn').addEventListener('click', () =>
    deviceAction('/infer', { useClaude: $('useClaude').checked }, 'Infer'));
  $('confirmBtn').addEventListener('click', () =>
    deviceAction('/confirm', {}, 'Confirm'));
  $('rejectBtn').addEventListener('click', () =>
    deviceAction('/reject', {}, 'Reject'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('drawer').hidden) closeDrawer();
  });

  refreshDevices();
}

init();
