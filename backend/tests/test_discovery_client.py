"""Execute the planner's actual discovery methods under Node.

These tests provide deferred responses to prove request-order and close guards
against the real methods embedded in index.html. No browser or network is used.
"""

import json
import pathlib
import re
import shutil
import subprocess
import tempfile


ROOT = pathlib.Path(__file__).resolve().parents[2]


def _runHarness(body):
    node = shutil.which("node")
    assert node, "Node is required for the discovery client transaction test"
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    scripts = re.findall(
        r'<script type="text/x-dc"[^>]*>(.*?)</script>', html, re.DOTALL,
    )
    assert len(scripts) == 1
    prelude = """
const React = { createElement: () => ({}) };
class DCLogic {}
const location = { protocol: 'https:', origin: 'https://rackwire.test', search: '' };
const window = { parent: null, RW: { DEVICES: [], GLYPHS: {} },
  addEventListener: () => {}, removeEventListener: () => {} };
window.parent = window;
const localStorage = { getItem: () => null, setItem: () => {} };
"""
    program = prelude + scripts[0] + "\n" + body
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".js", encoding="utf-8", delete=True,
    ) as script:
        script.write(program)
        script.flush()
        result = subprocess.run(
            [node, script.name], text=True, capture_output=True, check=False,
        )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def test_latest_selection_wins_and_close_invalidates_pending_response():
    result = _runHarness(r"""
(async () => {
  const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };
  const infers = new Map();
  dxPost = (path) => { const d = deferred(); infers.set(Number(path.match(/devices\/(\d+)/)[1]), d); return d.promise; };
  dxGet = async (path) => {
    const id = Number(path.match(/devices\/(\d+)/)[1]);
    return { candidate: { id: 'disc-' + id, name: 'Device ' + id, groups: [{ k: 'p1', label: 'Port', count: 1 }] }, recommendation: {}, match: null };
  };
  const make = () => {
    const c = Object.create(Component.prototype);
    c._discoReq = 0;
    c.state = { disco: { open: true, devices: [{id: 1}, {id: 2}], sel: null } };
    c.setState = patch => { c.state = Object.assign({}, c.state, patch); };
    return c;
  };
  const c = make();
  const first = c.discoSelect(1);
  const second = c.discoSelect(2);
  infers.get(2).resolve({ deterministic: {}, claude: {} });
  await second;
  infers.get(1).resolve({ deterministic: {}, claude: {} });
  await first;
  const latestWins = c.state.disco.sel === 2 && c.state.disco.cand.id === 'disc-2';

  const closed = make();
  const pending = closed.discoSelect(1);
  closed.closeDiscover();
  infers.get(1).resolve({ deterministic: {}, claude: {} });
  await pending;
  process.stdout.write(JSON.stringify({ latestWins, stayedClosed: closed.state.disco === null }));
})().catch(e => { console.error(e); process.exit(1); });
""")
    assert result == {"latestWins": True, "stayedClosed": True}


def test_reject_failure_keeps_device_in_queue():
    result = _runHarness(r"""
(async () => {
  dxPost = async () => null;
  const c = Object.create(Component.prototype);
  c._discoReq = 0;
  c.state = { disco: { open: true, devices: [{id: 7}], sel: 7 } };
  c.setState = patch => { c.state = Object.assign({}, c.state, patch); };
  await c.discoReject();
  process.stdout.write(JSON.stringify({
    kept: c.state.disco.devices.length === 1,
    selected: c.state.disco.sel === 7,
    failed: /stayed in the queue/.test(c.state.disco.msg)
  }));
})().catch(e => { console.error(e); process.exit(1); });
""")
    assert result == {"kept": True, "selected": True, "failed": True}
