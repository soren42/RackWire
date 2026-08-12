"""
infer/ — device classification.

deterministic.py runs first on gathered facts (no network I/O). claude.py handles
unknown/low-confidence devices via the Anthropic API. mapper.py converts a
confirmed device into the RackWire planner group schema. All inference is
advisory; nothing enters a plan without human confirmation. See
docs/DISCOVERY-DESIGN.md §4.
"""
