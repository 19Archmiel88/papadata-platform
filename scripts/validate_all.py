#!/usr/bin/env python3
"""Deprecated entrypoint retained only to fail loudly instead of giving false confidence."""
from __future__ import annotations

import sys

MESSAGE = """DEPRECATED: scripts/validate_all.py is not an authoritative PapaData runtime validator.
Use: pnpm verify:repository-integrity
Historical specification-package validator: python3 scripts/validate_specification_archive.py .
"""

print(MESSAGE, file=sys.stderr)
raise SystemExit(2)
