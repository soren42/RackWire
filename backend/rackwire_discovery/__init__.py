"""
rackwire_discovery — independent network discovery + device-inference service.

This package scans an operator-owned network (arp, ping, nmap, SNMP, LLDP),
persists what it finds to a local SQLite store, classifies devices
(deterministic signals first, Claude API for unknowns), and hands confirmed
devices to the RackWire planner through its documented host API.

Independence is a hard constraint: this service NEVER reads the SolariNet
System-of-Record and NEVER calls SolariNet. See docs/DISCOVERY-DESIGN.md.
"""

__version__ = "0.1.0"
