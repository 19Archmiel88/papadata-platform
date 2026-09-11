#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKS = [
    ("docs-registry", [sys.executable, "scripts/validate_registry_integrity.py", "."]),
    ("docs-maintainability", [sys.executable, "scripts/validate_documentation_maintainability.py"]),
    ("documents-derived-state", [sys.executable, "scripts/regenerate_registries.py", "--check"]),
    ("storybook-runtime-state", [sys.executable, "scripts/regenerate_storybook_registry_state.py", "--check"]),
    ("p0-code", ["node", "tools/verify-p0-production-readiness.mjs", "--code"]),
    ("p1-code", ["node", "tools/verify-p1-production-acceptance.mjs", "--code"]),
    ("p2-p3-code", ["node", "tools/verify-p2-p3-maintainability.mjs"]),
]


def main() -> int:
    failed = []
    for check_id, command in CHECKS:
        result = subprocess.run(command, cwd=ROOT, text=True)
        if result.returncode == 0:
            print(f"REPOSITORY_INTEGRITY_STEP=PASS id={check_id}")
        else:
            print(f"REPOSITORY_INTEGRITY_STEP=FAIL id={check_id} code={result.returncode}")
            failed.append(check_id)
    if failed:
        print("REPOSITORY_INTEGRITY=FAIL failed=" + ",".join(failed))
        return 1
    print("REPOSITORY_INTEGRITY=PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
