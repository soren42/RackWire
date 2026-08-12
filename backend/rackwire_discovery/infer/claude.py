"""
claude.py — Claude API inference for unknown / low-confidence devices.

Purpose: when deterministic signals are weak, ask the Anthropic Messages API to
classify a device from its observed facts. Input: a facts bundle (orchestrator
.deviceFacts shape) and a Config. Output: a structured classification dict, or
None when Claude is unavailable or the call fails.

This is advisory only — nothing it returns enters a plan without human
confirmation. It uses urllib (NO anthropic SDK, no new dependency) and reads the
API key from Config, never from a literal. The key is never logged.
"""

import json
import logging
import math
import urllib.error
import urllib.request

from .. import const


log = logging.getLogger("rackwire.discovery.infer")

# The classification vocabulary the prompt pins. Anything outside it is coerced
# to "unknown" rather than trusted verbatim — the model must not invent classes
# the planner glyph/domain maps do not understand.
_ALLOWED_CLASSES = frozenset({
    "switch", "router", "firewall", "ap", "server", "host", "printer",
    "camera", "pdu", "ups", "voip", "iot", "nas", "appliance", "unknown",
})

_API_URL = "https://api.anthropic.com/v1/messages"
_ANTHROPIC_VERSION = "2023-06-01"

# The exact output contract. Numeric fields are None when not inferable.
_OUTPUT_KEYS = (
    "classification", "role", "portsGuess", "gbps", "watts", "amps", "poe",
    "rationale", "confidence",
)


def infer(facts, config):
    """
    Classify one device via the Claude API.

    Input:  facts (dict from orchestrator.deviceFacts), config (Config).
    Output: dict with exactly _OUTPUT_KEYS, or None.

    Returns None (never raises) when no API key is configured or the request
    fails for any reason — the caller falls back to the deterministic result.
    """
    apiKey = getattr(config, "anthropicApiKey", "") or ""
    if not apiKey:
        # Expected in deterministic-only deployments; not an error.
        log.info("claude.infer: no API key configured, skipping Claude inference")
        return None

    prompt = _buildPrompt(facts)
    body = json.dumps({
        "model": getattr(config, "claudeModel", "claude-sonnet-5"),
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(_API_URL, data=body, method="POST")
    req.add_header("x-api-key", apiKey)
    req.add_header("anthropic-version", _ANTHROPIC_VERSION)
    req.add_header("content-type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=const.TIMEOUT_CLAUDE) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # Log status + reason but NOT the request (which carries the key header).
        log.warning(
            "claude.infer: HTTP %s from Anthropic API (%s); falling back to "
            "deterministic. Check the API key and model id.",
            exc.code, exc.reason,
        )
        return None
    except (urllib.error.URLError, TimeoutError) as exc:
        log.warning(
            "claude.infer: could not reach Anthropic API (%s); falling back to "
            "deterministic. Is the host allowed outbound HTTPS?",
            exc,
        )
        return None
    except (ValueError, UnicodeDecodeError) as exc:
        log.warning("claude.infer: unparseable API response (%s)", exc)
        return None

    text = _extractText(payload)
    if not text:
        log.warning("claude.infer: empty content in API response")
        return None

    obj = _extractJsonObject(text)
    if obj is None:
        log.warning("claude.infer: model did not return a JSON object")
        return None
    return _validate(obj)


def _buildPrompt(facts):
    """
    Render a compact, structured summary of the observed facts plus a strict
    instruction to answer with a single JSON object. Input: facts. Output: str.
    Kept small on purpose — only the signals that inform classification.
    """
    services = facts.get("services") or []
    svcLines = [
        f"  - {s.get('port')}/{s.get('proto', 'tcp')} "
        f"{s.get('service') or ''} {s.get('product') or ''} "
        f"{s.get('version') or ''}".rstrip()
        for s in services[:20]
    ]
    ports = facts.get("ports") or []
    speeds = sorted({p.get("speedMbps") for p in ports if p.get("speedMbps")})
    neighbors = facts.get("neighbors") or []

    lines = [
        "You are classifying a network device from scan observations.",
        "Reply with ONLY a single JSON object, no prose, no markdown fences.",
        "",
        "Observed facts:",
        f"  vendor (OUI): {facts.get('vendor')}",
        f"  hostname: {facts.get('hostname')}",
        f"  nmap OS guess: {facts.get('osGuess')}",
        f"  SNMP sysDescr: {_clip(facts.get('sysDescr'), 300)}",
        f"  SNMP sysObjectID: {facts.get('sysObjectId')}",
        f"  interface count: {len(ports)}",
        f"  interface speeds (Mbps): {speeds or 'unknown'}",
        f"  LLDP neighbors: {len(neighbors)}",
        "  open services:",
        *(svcLines or ["    (none observed)"]),
        "",
        "Return this exact JSON shape (use null when unknown):",
        '{"classification": "switch|router|firewall|ap|server|host|printer|'
        'camera|pdu|ups|voip|iot|nas|appliance|unknown",',
        ' "role": "short role hint or null",',
        ' "portsGuess": <int physical port count or null>,',
        ' "gbps": <per-port link speed in Gbps or null>,',
        ' "watts": <typical power draw or null>,',
        ' "amps": <null unless known>,',
        ' "poe": <true|false>,',
        ' "rationale": "one sentence citing the deciding signals",',
        ' "confidence": <0.0..1.0>}',
    ]
    return "\n".join(lines)


def _clip(value, limit):
    """Trim a possibly-long string for the prompt. Input: value, limit. Output: str."""
    if not value:
        return "None"
    text = str(value)
    return text if len(text) <= limit else text[:limit] + "…"


def _extractText(payload):
    """Pull the assistant text from a Messages API response. Output: str|None."""
    content = payload.get("content")
    if not isinstance(content, list):
        return None
    parts = [
        block.get("text", "")
        for block in content
        if isinstance(block, dict) and block.get("type") == "text"
    ]
    return "".join(parts).strip() or None


def _extractJsonObject(text):
    """
    Robustly pull the first JSON object out of the model's text — tolerates
    stray markdown fences or a leading sentence. Input: text. Output: dict|None.
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Drop a ```json ... ``` fence if present.
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        obj = json.loads(cleaned[start:end + 1])
    except ValueError:
        return None
    return obj if isinstance(obj, dict) else None


def _validate(obj):
    """
    Coerce the model output into the exact contract. Input: dict. Output: dict
    with every _OUTPUT_KEYS present; missing/malformed numerics become None,
    poe becomes a bool, confidence is clamped to 0..1.
    """
    out = {}
    rawClass = str(obj.get("classification") or "unknown").strip().lower()
    out["classification"] = rawClass if rawClass in _ALLOWED_CLASSES else "unknown"
    out["role"] = obj.get("role") if obj.get("role") else None
    out["portsGuess"] = _numOrNone(obj.get("portsGuess"), asInt=True)
    out["gbps"] = _numOrNone(obj.get("gbps"))
    out["watts"] = _numOrNone(obj.get("watts"))
    out["amps"] = _numOrNone(obj.get("amps"))
    out["poe"] = _asBool(obj.get("poe"))
    out["rationale"] = str(obj.get("rationale") or "")
    conf = _numOrNone(obj.get("confidence"))
    out["confidence"] = min(1.0, max(0.0, conf)) if conf is not None else 0.0
    return out


def _asBool(value):
    """Strict truthiness for the poe flag. A real bool passes through; the
    common string spellings map explicitly; everything else (including the
    string "false", which is truthy under bool()) becomes False."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("true", "yes", "1")
    if isinstance(value, (int, float)):
        return value == 1
    return False


def _numOrNone(value, asInt=False):
    """Parse a positive, finite number defensively. Input: value. Output:
    int/float or None. Rejects booleans, NaN/inf, and negatives — a device
    cannot have negative ports/power/speed, so a negative is bad model output,
    not a value to trust."""
    if value is None or isinstance(value, bool):
        return None
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(num) or num < 0:
        return None
    return int(num) if asInt else num
