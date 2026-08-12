"""
oui.py — offline MAC -> vendor lookup against an embedded OUI table.

Purpose: map a MAC address to a hardware-vendor name using the 24-bit IEEE
OUI prefix (first three octets), entirely offline — no network I/O, no
subprocess, no filesystem reads. Input: a MAC string in any common textual
form (colon, dash, Cisco dotted-quad, or bare hex). Output: a vendor name
string, or None when the prefix is unknown, malformed, multicast, or
locally administered.

Contract notes (DISCOVERY-DESIGN.md §3):
  - Pure function: vendorFor(mac) -> str | None. No DB access, no store
    import, no config needed — fully unit-testable offline.
  - OUI_TABLE below is a *curated subset* of the IEEE MA-L registry,
    focused on infrastructure and endpoint vendors common on the networks
    RackWire scans. It is intentionally small and hand-audited.

Extension path: a production deployment that wants full coverage can parse
the IEEE registry file (standards-oui.ieee.org "oui.txt", ~35k entries)
offline at build/deploy time and merge it into OUI_TABLE via
`OUI_TABLE.update(parsedEntries)` — the key format ("AA:BB:CC", uppercase)
matches the registry's hex column directly. Nothing else in this module
needs to change.
"""

import logging
import re

logger = logging.getLogger("rackwire.discovery.oui")

# Twelve hex digits — a full 6-octet MAC after separators are stripped.
_HEX12_RE = re.compile(r"^[0-9A-F]{12}$")

# Curated OUI -> vendor table. Keys are uppercase "AA:BB:CC" (24-bit MA-L
# prefix); values are display-ready vendor names. Many vendors own dozens
# of prefixes — a handful of common ones per vendor is deliberate, not an
# omission. See the module docstring for the full-registry extension path.
OUI_TABLE = {
    # --- Network infrastructure ---
    "00:00:0C": "Cisco Systems",
    "00:40:96": "Cisco Systems",          # Aironet wireless line
    "00:1B:0D": "Cisco Systems",
    "88:15:44": "Cisco Meraki",
    "0C:8D:DB": "Cisco Meraki",
    "00:05:85": "Juniper Networks",
    "3C:8A:B0": "Juniper Networks",
    "00:1C:73": "Arista Networks",
    "24:A4:3C": "Ubiquiti Networks",
    "F0:9F:C2": "Ubiquiti Networks",
    "78:8A:20": "Ubiquiti Networks",
    "DC:9F:DB": "Ubiquiti Networks",
    "00:0B:86": "HPE Aruba Networking",
    "94:B4:0F": "HPE Aruba Networking",
    "00:1F:29": "Hewlett Packard",
    "94:57:A5": "Hewlett Packard Enterprise",
    "00:14:22": "Dell",
    "B8:CA:3A": "Dell",
    "00:09:5B": "Netgear",
    "20:E5:2A": "Netgear",
    "9C:3D:CF": "Netgear",
    "50:C7:BF": "TP-Link",
    "14:CC:20": "TP-Link",
    "EC:08:6B": "TP-Link",
    "4C:5E:0C": "MikroTik",
    "D4:CA:6D": "MikroTik",
    "E4:8D:8C": "MikroTik",
    "CC:2D:E0": "MikroTik",
    "00:05:5D": "D-Link",
    "14:D6:4D": "D-Link",
    "00:A0:C5": "Zyxel",
    "00:09:0F": "Fortinet",
    "04:D5:90": "Fortinet",
    "00:1B:17": "Palo Alto Networks",
    "00:04:96": "Extreme Networks",
    "00:05:1E": "Brocade Communications",
    "C0:8A:DE": "Ruckus Wireless",
    "58:93:96": "Ruckus Wireless",
    # --- Storage / NAS / servers ---
    "00:11:32": "Synology",
    "00:08:9B": "QNAP Systems",
    "00:25:90": "Supermicro",
    "AC:1F:6B": "Supermicro",
    "3C:EC:EF": "Supermicro",
    "00:90:A9": "Western Digital",
    "00:14:4F": "Oracle (Sun Microsystems)",
    # --- Silicon / NIC vendors (generic hosts, embedded boards) ---
    "00:1B:21": "Intel",
    "A0:36:9F": "Intel",
    "00:15:17": "Intel",
    "00:E0:4C": "Realtek Semiconductor",
    "00:10:18": "Broadcom",
    "00:04:4B": "NVIDIA",
    # --- Endpoints / consumer / IoT ---
    "F0:18:98": "Apple",
    "AC:BC:32": "Apple",
    "3C:22:FB": "Apple",
    "00:1C:B3": "Apple",
    "B8:27:EB": "Raspberry Pi Foundation",
    "DC:A6:32": "Raspberry Pi Foundation",
    "E4:5F:01": "Raspberry Pi Foundation",
    "28:CD:C1": "Raspberry Pi Foundation",
    "24:0A:C4": "Espressif (ESP32/ESP8266)",
    "30:AE:A4": "Espressif (ESP32/ESP8266)",
    "A4:CF:12": "Espressif (ESP32/ESP8266)",
    "24:6F:28": "Espressif (ESP32/ESP8266)",
    "F0:D2:F1": "Amazon Technologies",
    "44:65:0D": "Amazon Technologies",
    "F4:F5:D8": "Google",
    "54:60:09": "Google",
    "18:B4:30": "Nest Labs",
    "00:0E:58": "Sonos",
    "5C:AA:FD": "Sonos",
    "94:9F:3E": "Sonos",
    "B0:A7:37": "Roku",
    "00:09:BF": "Nintendo",
    "00:17:88": "Signify (Philips Hue)",
    "2C:AA:8E": "Wyze Labs",
    # --- Cameras / physical security ---
    "00:40:8C": "Axis Communications",
    "AC:CC:8E": "Axis Communications",
    "C0:56:E3": "Hikvision",
    "28:57:BE": "Hikvision",
    "90:02:A9": "Dahua Technology",
    "3C:EF:8C": "Dahua Technology",
    # --- Voice / conferencing ---
    "00:0B:82": "Grandstream Networks",
    "00:04:F2": "Polycom",
    "64:16:7F": "Polycom",
    # --- Virtualization ---
    "00:50:56": "VMware",
    "00:0C:29": "VMware",
    "00:05:69": "VMware",
    "00:1C:14": "VMware",
    "00:15:5D": "Microsoft (Hyper-V)",
    "00:03:FF": "Microsoft",
    # --- Power / rack (UPS, PDU) ---
    "00:C0:B7": "APC (Schneider Electric)",
    "28:29:86": "APC (Schneider Electric)",
    "00:20:85": "Eaton (Powerware)",
    "00:06:67": "Tripp Lite",
    # --- Printers ---
    "00:80:77": "Brother Industries",
    "00:00:AA": "Xerox",
    "00:1E:8F": "Canon",
}


def vendorFor(mac):
    """Resolve a MAC address to a vendor name via its 24-bit OUI prefix.

    Input: MAC string in any common form — "aa:bb:cc:dd:ee:ff",
    "AA-BB-CC-DD-EE-FF", Cisco "aabb.ccdd.eeff", or bare "aabbccddeeff".
    Output: vendor name string, or None when the input is not a full
    6-octet MAC, the prefix is not in the curated table, or the address
    is multicast / locally administered (those prefixes carry no vendor
    identity — e.g. randomized Wi-Fi MACs and most VM-generated MACs set
    the locally-administered bit).

    Never raises: any malformed input (including non-strings) yields None.
    """
    if not isinstance(mac, str):
        return None

    # Strip every common separator and whitespace, then validate that a
    # full 12-hex-digit address remains. Partial prefixes are rejected —
    # callers hold real MACs from ARP/SNMP, not bare OUIs.
    cleaned = re.sub(r"[\s:.\-]", "", mac).upper()
    if not _HEX12_RE.match(cleaned):
        # Debug (not warning): scanners routinely surface junk strings in
        # neighbor tables; an unparseable MAC is expected, not an error.
        logger.debug("unparseable MAC %r — no vendor lookup", mac)
        return None

    # I/G and U/L bits live in the first octet. Multicast (bit 0) means
    # this is not a device address at all; locally-administered (bit 1)
    # means the OUI space was overridden and carries no vendor meaning.
    firstOctet = int(cleaned[0:2], 16)
    if firstOctet & 0x01 or firstOctet & 0x02:
        return None

    prefix = ":".join((cleaned[0:2], cleaned[2:4], cleaned[4:6]))
    return OUI_TABLE.get(prefix)
