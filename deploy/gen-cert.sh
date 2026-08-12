#!/usr/bin/env bash
# gen-cert.sh — self-signed TLS cert for rackwire.akoria.net.
#
# Mirrors the SolariNet dashboard's self-signed internal cert. Run on xenon as
# root. Idempotent: skips generation if a cert already exists (pass --force to
# regenerate). Swap for a CA-issued cert when RackWire goes public-facing.
set -euo pipefail

CERT_DIR=/etc/ssl/rackwire
CN=rackwire.akoria.net
FORCE=${1:-}

install -d -m 0755 "$CERT_DIR"

if [[ -f "$CERT_DIR/rackwire.pem" && "$FORCE" != "--force" ]]; then
    echo "cert already present at $CERT_DIR/rackwire.pem (pass --force to regenerate)"
    exit 0
fi

# SANs cover the vhost name plus the host it lives on, so both resolve cleanly.
openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "$CERT_DIR/rackwire.key" \
    -out    "$CERT_DIR/rackwire.pem" \
    -days 825 \
    -subj "/CN=${CN}/O=RackWire/OU=discovery" \
    -addext "subjectAltName=DNS:${CN},DNS:xenon.akoria.net,DNS:xenon,IP:10.0.0.20,IP:127.0.0.1"

chmod 0640 "$CERT_DIR/rackwire.key"
chmod 0644 "$CERT_DIR/rackwire.pem"
echo "generated $CERT_DIR/rackwire.pem (self-signed, 825 days)"
