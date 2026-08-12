"""
const.py — fixed constants for the discovery service.

Holds the things that must be identical across every module and must never be
guessed at call sites: SNMP OIDs (duplicated from SolariNet C sources, NOT
called live), absolute tool paths, subprocess timeouts, and the open-port ->
role fingerprint table used by deterministic inference.

Purpose: single source of truth. Input: none (module-level data). Output:
importable constants.
"""

# --- Absolute tool paths -------------------------------------------------
# Absolute so a poisoned $PATH cannot substitute a scanner binary. These match
# xenon (Ubuntu 26.04). fping and lldpctl are intentionally absent — do not add
# them; LLDP is derived from the SNMP LLDP-MIB below.
TOOL_NMAP = "/usr/bin/nmap"
TOOL_SNMPWALK = "/usr/bin/snmpwalk"
TOOL_SNMPGET = "/usr/bin/snmpget"
TOOL_ARPSCAN = "/usr/sbin/arp-scan"
TOOL_PING = "/bin/ping"
TOOL_IP = "/usr/sbin/ip"

# --- Subprocess timeouts (seconds) ---------------------------------------
# Every subprocess call MUST carry a timeout. A hung scanner must never wedge
# a scan run.
TIMEOUT_PING = 4
TIMEOUT_ARPSCAN = 60
TIMEOUT_NMAP_HOST = 180        # per-host nmap -sV -O
TIMEOUT_SNMP = 15              # per snmpget/snmpwalk invocation
TIMEOUT_CLAUDE = 60            # per Claude API call

# --- Concurrency ---------------------------------------------------------
DEFAULT_HOST_CONCURRENCY = 32  # hosts in flight during a scan run
MAX_HOST_CONCURRENCY = 128     # hard clamp; a misconfigured env cannot exceed this
NMAP_TOP_PORTS = 200           # nmap --top-ports N

# --- Scan-size guardrail --------------------------------------------------
# Reject a scan whose target subnet enumerates more than this many host
# addresses before any probe runs. Stops an accidental /8 (16M hosts) from
# spawning a runaway sweep. A /18 (16k hosts) is the practical ceiling for a
# homelab; raise deliberately if a larger authorized range is ever needed.
MAX_SCAN_HOSTS = 16384

# --- SNMP OIDs (ported from SolariNet serverSnmp.c / serverTopology.c) ---
# System group
OID_SYS_DESCR = ".1.3.6.1.2.1.1.1.0"
OID_SYS_OBJECT_ID = ".1.3.6.1.2.1.1.2.0"
OID_SYS_NAME = ".1.3.6.1.2.1.1.5.0"

# ifTable / ifXTable (walked, indexed by ifIndex)
OID_IF_DESCR = ".1.3.6.1.2.1.2.2.1.2"
OID_IF_SPEED = ".1.3.6.1.2.1.2.2.1.5"
OID_IF_PHYS_ADDRESS = ".1.3.6.1.2.1.2.2.1.6"
OID_IF_ADMIN_STATUS = ".1.3.6.1.2.1.2.2.1.7"
OID_IF_OPER_STATUS = ".1.3.6.1.2.1.2.2.1.8"
OID_IF_NAME = ".1.3.6.1.2.1.31.1.1.1.1"
OID_IF_HIGH_SPEED = ".1.3.6.1.2.1.31.1.1.1.15"

# LLDP-MIB remote table (.1.0.8802.1.1.2.1.4.1.1.N)
OID_LLDP_REM_CHASSIS_SUB = ".1.0.8802.1.1.2.1.4.1.1.4"
OID_LLDP_REM_CHASSIS_ID = ".1.0.8802.1.1.2.1.4.1.1.5"
OID_LLDP_REM_PORT_SUB = ".1.0.8802.1.1.2.1.4.1.1.6"
OID_LLDP_REM_PORT_ID = ".1.0.8802.1.1.2.1.4.1.1.7"
OID_LLDP_REM_PORT_DESC = ".1.0.8802.1.1.2.1.4.1.1.8"
OID_LLDP_REM_SYS_NAME = ".1.0.8802.1.1.2.1.4.1.1.9"
OID_LLDP_REM_SYS_DESC = ".1.0.8802.1.1.2.1.4.1.1.10"
OID_LLDP_REM_SYS_CAP = ".1.0.8802.1.1.2.1.4.1.1.12"
OID_LLDP_LOC_PORT_ID = ".1.0.8802.1.1.2.1.3.7.1.3"

# --- Device status lifecycle ---------------------------------------------
STATUS_DISCOVERED = "discovered"
STATUS_CONFIRMED = "confirmed"
STATUS_REJECTED = "rejected"
STATUS_IMPORTED = "imported"

# --- Inference ------------------------------------------------------------
# Below this deterministic confidence, offer Claude inference.
CONFIDENCE_THRESHOLD = 0.6

# --- Open-port -> role fingerprints --------------------------------------
# Consumed by infer/deterministic.py. A single open port is a weak signal;
# confidence rises when several agree. Keyed by TCP port unless noted.
PORT_FINGERPRINTS = {
    22: "host",          # SSH — general host
    23: "network",       # telnet — often legacy network gear
    80: "appliance",     # http mgmt
    443: "appliance",    # https mgmt
    161: "snmp",         # SNMP agent (UDP; informational)
    623: "bmc",          # IPMI/BMC
    3389: "host",        # RDP — Windows host
    445: "host",         # SMB — Windows/NAS host
    9100: "printer",     # JetDirect
    554: "camera",       # RTSP
    5060: "voip",        # SIP
    1883: "iot",         # MQTT
    8080: "appliance",
}

# RackWire domain buckets keyed by classification (see infer/mapper.py).
DOMAIN_BY_CLASS = {
    "switch": "net",
    "router": "net",
    "ap": "net",
    "firewall": "net",
    "pdu": "power",
    "ups": "power",
    "dock": "usb",
    "hub": "usb",
}
