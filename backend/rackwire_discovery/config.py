"""
config.py — runtime configuration, sourced from the environment.

Purpose: assemble all deployment-specific settings in one place, read from
environment variables so secrets never live in git. Input: process environment
(systemd EnvironmentFile in production). Output: a frozen Config object.

Secrets (ANTHROPIC_API_KEY, SNMP community, session secret) are referenced by
env name only and never logged. loadConfig() reads them once at startup.
"""

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Config:
    # Where the SQLite database lives. Default keeps it beside the service.
    dbPath: str = "/var/lib/rackwire/discovery.db"

    # CIDR ranges the operator authorizes for scanning. Discovery refuses any
    # target outside these. Empty means "derive from the host's own interface"
    # (see resolveDefaultSubnet at call time) — never the whole internet.
    allowedSubnets: tuple = field(default_factory=tuple)

    # SNMP read credentials. v2c community by default; v3 fields optional.
    snmpCommunity: str = "public"
    snmpVersion: str = "2c"
    snmpV3User: str = ""
    snmpV3AuthProto: str = ""
    snmpV3AuthKey: str = ""
    snmpV3PrivProto: str = ""
    snmpV3PrivKey: str = ""

    # Claude inference. Empty apiKey => Claude disabled, deterministic-only.
    anthropicApiKey: str = ""
    claudeModel: str = "claude-sonnet-5"
    claudeEnabled: bool = False

    # Session/CSRF. sessionSecret gates mutations; empty => a random secret is
    # generated at startup (fine for single-process dev, NOT for multi-worker
    # gunicorn — set it explicitly in production so all workers agree).
    sessionSecret: str = ""

    # Bind address for the WSGI app (behind the Apache reverse proxy).
    bindHost: str = "127.0.0.1"
    bindPort: int = 8785

    # Host concurrency during a scan.
    hostConcurrency: int = 32


def _envBool(name, default=False):
    """Parse a truthy environment flag. Input: var name. Output: bool."""
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def _envList(name):
    """Parse a comma-separated env var into a tuple of trimmed non-empty items."""
    raw = os.environ.get(name, "")
    return tuple(part.strip() for part in raw.split(",") if part.strip())


def loadConfig():
    """
    Build a Config from the environment.

    Input:  process environment. Output: frozen Config.
    Secrets are read here and nowhere else; callers pass the Config object
    around rather than re-reading os.environ.
    """
    apiKey = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    return Config(
        dbPath=os.environ.get("RACKWIRE_DB_PATH", Config.dbPath),
        allowedSubnets=_envList("RACKWIRE_ALLOWED_SUBNETS"),
        snmpCommunity=os.environ.get("RACKWIRE_SNMP_COMMUNITY", Config.snmpCommunity),
        snmpVersion=os.environ.get("RACKWIRE_SNMP_VERSION", Config.snmpVersion),
        snmpV3User=os.environ.get("RACKWIRE_SNMP_V3_USER", ""),
        snmpV3AuthProto=os.environ.get("RACKWIRE_SNMP_V3_AUTHPROTO", ""),
        snmpV3AuthKey=os.environ.get("RACKWIRE_SNMP_V3_AUTHKEY", ""),
        snmpV3PrivProto=os.environ.get("RACKWIRE_SNMP_V3_PRIVPROTO", ""),
        snmpV3PrivKey=os.environ.get("RACKWIRE_SNMP_V3_PRIVKEY", ""),
        anthropicApiKey=apiKey,
        claudeModel=os.environ.get("RACKWIRE_CLAUDE_MODEL", Config.claudeModel),
        # Claude is only on when explicitly enabled AND a key is present.
        claudeEnabled=_envBool("RACKWIRE_CLAUDE_ENABLED", False) and bool(apiKey),
        sessionSecret=os.environ.get("RACKWIRE_SESSION_SECRET", ""),
        bindHost=os.environ.get("RACKWIRE_BIND_HOST", Config.bindHost),
        bindPort=int(os.environ.get("RACKWIRE_BIND_PORT", str(Config.bindPort))),
        hostConcurrency=int(
            os.environ.get("RACKWIRE_HOST_CONCURRENCY", str(Config.hostConcurrency))
        ),
    )
