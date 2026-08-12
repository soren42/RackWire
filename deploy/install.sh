#!/usr/bin/env bash
# install.sh — deploy RackWire (planner + discovery service) onto a host.
#
# Idempotent. Run on xenon as a user with sudo. Copies the repo into place,
# builds the gunicorn venv, installs the systemd unit + Apache vhost + TLS cert,
# grants narrow raw-socket capability to the scan binaries, and (re)starts the
# service. Safe to re-run after a code update.
#
# It does NOT edit DNS (see the CNAME step in docs/DISCOVERY.md) and it never
# writes secrets — /etc/rackwire/discovery.env is created from the template on
# first run and left for the operator to fill in.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
WWW=/var/www/rackwire
OPT=/opt/rackwire
DATA=/var/lib/rackwire
ETC=/etc/rackwire
SVC=rackwire-discovery.service

echo "==> RackWire deploy from $REPO"

# --- dedicated service user ---------------------------------------------
if ! id rackwire >/dev/null 2>&1; then
    echo "==> creating rackwire system user"
    sudo useradd --system --home-dir "$OPT" --shell /usr/sbin/nologin rackwire
fi

# --- static web root: pristine planner at /, console under /discover/ ----
echo "==> publishing static assets to $WWW"
sudo install -d -m 0755 "$WWW" "$WWW/discover"
# The planner is shipped byte-for-byte; its offline/same-origin contract holds.
# index.html loads support.js AND device-library.js + live-adapter.js (the
# latter two define window.RW — the device/cable library and live adapter);
# all of them must be published or the planner crashes at render.
sudo install -m 0644 "$REPO/index.html" "$WWW/index.html"
for asset in support.js device-library.js live-adapter.js; do
    [[ -f "$REPO/$asset" ]] && sudo install -m 0644 "$REPO/$asset" "$WWW/$asset"
done
[[ -d "$REPO/vendor" ]] && sudo cp -r "$REPO/vendor" "$WWW/"
[[ -d "$REPO/styleguide" ]] && sudo cp -r "$REPO/styleguide" "$WWW/"
sudo install -m 0644 "$REPO/web/index.html"   "$WWW/discover/index.html"
sudo install -m 0644 "$REPO/web/discover.js"  "$WWW/discover/discover.js"
sudo install -m 0644 "$REPO/web/discover.css" "$WWW/discover/discover.css"

# --- backend code + venv -------------------------------------------------
echo "==> installing backend to $OPT"
sudo install -d -m 0755 "$OPT"
sudo cp -r "$REPO/backend/rackwire_discovery" "$OPT/"
if [[ ! -d "$OPT/venv" ]]; then
    sudo python3 -m venv "$OPT/venv"
fi
sudo "$OPT/venv/bin/pip" install --quiet --upgrade pip
sudo "$OPT/venv/bin/pip" install --quiet -r "$REPO/backend/requirements.txt"

# --- data dir ------------------------------------------------------------
sudo install -d -m 0750 -o rackwire -g rackwire "$DATA"
sudo chown -R rackwire:rackwire "$OPT"

# --- environment file (first run only) -----------------------------------
# 0600 root:root: systemd (PID 1, root) reads EnvironmentFile at unit start and
# injects the vars into the process, so the unprivileged rackwire user never
# needs read access to the file. Keeping it root-only means the SNMP community,
# session secret, and ANTHROPIC_API_KEY are unreadable to the service account
# itself — least privilege for the secrets at rest.
sudo install -d -m 0755 -o root -g root "$ETC"
if [[ ! -f "$ETC/discovery.env" ]]; then
    echo "==> seeding $ETC/discovery.env from template (EDIT IT: subnets, secret, key)"
    sudo install -m 0600 -o root -g root "$REPO/deploy/discovery.env.example" "$ETC/discovery.env"
fi

# --- TLS cert ------------------------------------------------------------
sudo bash "$REPO/deploy/gen-cert.sh"

# --- Apache vhost --------------------------------------------------------
echo "==> installing Apache vhost"
sudo a2enmod proxy proxy_http headers ssl >/dev/null 2>&1 || true
sudo install -m 0644 "$REPO/deploy/rackwire.akoria.net.conf" \
    /etc/apache2/sites-available/rackwire.akoria.net.conf
sudo a2ensite rackwire.akoria.net.conf >/dev/null
sudo apache2ctl configtest
sudo systemctl reload apache2

# --- raw-socket capability for scanners (least privilege) ----------------
# arp-scan needs CAP_NET_RAW; nmap needs it for -O and SYN scan. Granting the
# capability on just these binaries avoids running the service as root. This is
# a deliberate, documented trade-off (a file cap on nmap is a known lateral
# vector on multi-user hosts; acceptable on this single-operator homelab).
# Without it, discovery still works with reduced fidelity (ping liveness +
# nmap connect scan + SNMP), so this step is best-effort.
for bin in /usr/sbin/arp-scan /usr/bin/nmap; do
    if [[ -x "$bin" ]]; then
        sudo setcap cap_net_raw+ep "$bin" 2>/dev/null \
            && echo "==> granted cap_net_raw to $bin" \
            || echo "!! could not setcap $bin (arp/OS detection will degrade)"
    fi
done

# --- systemd service -----------------------------------------------------
echo "==> installing systemd unit"
sudo install -m 0644 "$REPO/deploy/$SVC" "/etc/systemd/system/$SVC"
sudo systemctl daemon-reload
sudo systemctl enable "$SVC" >/dev/null
sudo systemctl restart "$SVC"
sleep 1
sudo systemctl --no-pager --lines=5 status "$SVC" || true

echo
echo "==> done. Next:"
echo "    1. Edit $ETC/discovery.env (RACKWIRE_ALLOWED_SUBNETS, RACKWIRE_SESSION_SECRET, ANTHROPIC_API_KEY)"
echo "    2. Add 'rackwire IN CNAME xenon' to /etc/bind/zones/db.akoria.net, bump the SOA serial, rndc reload"
echo "    3. Browse https://rackwire.akoria.net/discover/"
