"""
scan/ — network scanners.

Each module wraps one system tool and returns plain dicts. Scanners never write
to the database (the orchestrator persists) and never build shell strings
(argv-list subprocess only, mandatory timeouts). See docs/DISCOVERY-DESIGN.md §3.
"""
