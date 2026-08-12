"""
wsgi.py — WSGI application, minimal router, and request plumbing.

Purpose: turn HTTP requests into calls on api/routes.py handlers, using only the
standard library (no framework). Input: WSGI environ per request. Output: WSGI
response. Also owns auth + CSRF enforcement on mutating requests and consistent
JSON error shaping.

Run in production under gunicorn:  gunicorn 'rackwire_discovery.wsgi:application'
"""

import hashlib
import hmac
import json
import logging
import secrets
import time
import traceback

from .config import loadConfig
from .store import Store
from .api import routes


log = logging.getLogger("rackwire.discovery")

# Methods that change state must carry a valid CSRF token and session.
MUTATING = {"POST", "PUT", "PATCH", "DELETE"}


class App:
    """
    The WSGI callable. Holds the shared Config and Store, plus the route table.
    Routes are (method, compiled-regex, handler); the first match wins. Handlers
    receive (ctx, match, body) and return (status:int, payload:dict).
    """

    def __init__(self, config=None):
        self.config = config or loadConfig()
        self.store = Store(self.config.dbPath)
        # A per-process session secret; if the operator did not set one, mint a
        # random one. Multi-worker gunicorn MUST set RACKWIRE_SESSION_SECRET so
        # every worker validates the same tokens.
        self._secret = (
            self.config.sessionSecret or secrets.token_hex(32)
        ).encode("utf-8")
        self.routes = routes.buildRoutes()

    # -- CSRF: signed, time-bounded token required in a custom request header --
    #
    # The scheme is a signed submitted-token, NOT double-submit-cookie. GET
    # /health returns a token; the console echoes it in the X-RackWire-CSRF
    # header on every mutating request. Two properties make this a sound CSRF
    # defense for the current same-origin, single-operator deployment:
    #   1. A cross-origin attacker cannot read the token — the Same-Origin
    #      Policy blocks it from reading /health's JSON response body.
    #   2. A cross-origin attacker cannot set a custom request header on a
    #      forged navigation/form POST — custom headers force a CORS preflight
    #      the browser will not grant cross-origin.
    # The HMAC signature adds integrity (a client cannot mint a valid token
    # without the server secret) and the timestamp bounds token lifetime so a
    # leaked token cannot be replayed indefinitely.
    #
    # KNOWN LIMITATION (hardening backlog): tokens are not yet bound to an
    # authenticated session — any client that can reach GET /health obtains a
    # usable token. Acceptable behind the localhost-only Apache vhost on xenon;
    # the future public deployment MUST add user auth + per-session binding
    # before it is exposed. See docs/DISCOVERY.md §security.
    CSRF_TTL_SECONDS = 24 * 3600

    def issueCsrf(self):
        nonce = secrets.token_hex(16)
        issued = str(int(time.time()))
        payload = f"{nonce}.{issued}"
        mac = hmac.new(self._secret, payload.encode(), hashlib.sha256).hexdigest()
        return f"{payload}.{mac}"

    def validCsrf(self, token):
        if not token or token.count(".") != 2:
            return False
        nonce, issued, mac = token.split(".")
        expected = hmac.new(
            self._secret, f"{nonce}.{issued}".encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(mac, expected):
            return False
        # Reject a token older than the TTL (or one with a non-numeric stamp).
        try:
            age = time.time() - int(issued)
        except ValueError:
            return False
        return 0 <= age <= self.CSRF_TTL_SECONDS

    def __call__(self, environ, startResponse):
        method = environ.get("REQUEST_METHOD", "GET")
        path = environ.get("PATH_INFO", "")

        try:
            # CSRF gate on every mutating request. The console fetches a token
            # from GET /api/discovery/health and echoes it in X-RackWire-CSRF.
            if method in MUTATING:
                token = environ.get("HTTP_X_RACKWIRE_CSRF", "")
                if not self.validCsrf(token):
                    return self._json(
                        startResponse, 403,
                        {"error": "csrf", "detail": "missing or invalid CSRF token"},
                    )

            for routeMethod, pattern, handler in self.routes:
                if routeMethod != method:
                    continue
                m = pattern.match(path)
                if not m:
                    continue
                body = self._readBody(environ)
                ctx = {
                    "config": self.config,
                    "store": self.store,
                    "app": self,
                    "environ": environ,
                }
                status, payload = handler(ctx, m, body)
                return self._json(startResponse, status, payload)

            return self._json(
                startResponse, 404,
                {"error": "not_found", "detail": path},
            )
        except Exception as exc:  # noqa: BLE001 — top-level guard, logs + 500s
            # Log the full trace server-side; return a scrubbed message. Never
            # leak a stack trace to the client.
            log.error(
                "Unhandled error on %s %s: %s\n%s",
                method, path, exc, traceback.format_exc(),
            )
            return self._json(
                startResponse, 500,
                {"error": "internal", "detail": "unexpected server error"},
            )

    def _readBody(self, environ):
        """Read and JSON-parse the request body. Empty body => {}."""
        try:
            length = int(environ.get("CONTENT_LENGTH") or 0)
        except (TypeError, ValueError):
            length = 0
        if length <= 0:
            return {}
        raw = environ["wsgi.input"].read(length)
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            # Malformed body is a client error; handlers see {} and validate.
            return {}

    def _json(self, startResponse, status, payload):
        body = json.dumps(payload).encode("utf-8")
        statusLine = f"{status} {_reason(status)}"
        headers = [
            ("Content-Type", "application/json; charset=utf-8"),
            ("Content-Length", str(len(body))),
            # Same-origin only; the console is served from the same vhost.
            ("X-Content-Type-Options", "nosniff"),
        ]
        startResponse(statusLine, headers)
        return [body]


def _reason(status):
    return {
        200: "OK", 201: "Created", 400: "Bad Request", 403: "Forbidden",
        404: "Not Found", 409: "Conflict", 500: "Internal Server Error",
    }.get(status, "OK")


# gunicorn entry point.
application = App()
