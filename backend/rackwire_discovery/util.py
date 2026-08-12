"""
util.py — small shared helpers with no external dependencies.

Purpose: timestamps and subnet-authorization checks used across modules, kept in
one place so behaviour is consistent. Input/output documented per function.
"""

import ipaddress
from datetime import datetime, timezone


def nowIso():
    """Current UTC time as an ISO8601 string. Output: str."""
    return datetime.now(timezone.utc).isoformat()


def subnetAllowed(target, allowedSubnets):
    """
    Decide whether a scan target is within the operator-authorized ranges.

    Input:  target (an IP or CIDR string), allowedSubnets (iterable of CIDRs).
    Output: bool. An empty allow-list denies everything except when the caller
    has resolved a host-local default (handled upstream), so the safe default
    here is deny.

    Discovery must never scan outside authorized ranges; this is the guard.
    """
    if not allowedSubnets:
        return False
    try:
        net = ipaddress.ip_network(target, strict=False)
    except ValueError:
        return False
    for allowed in allowedSubnets:
        try:
            if net.subnet_of(ipaddress.ip_network(allowed, strict=False)):
                return True
        except (ValueError, TypeError):
            continue
    return False
