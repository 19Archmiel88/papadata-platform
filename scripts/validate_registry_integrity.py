#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path

EXPECTED_HEADERS = {
    "rejestry/routes.csv": [
        "route", "document", "title", "status", "ownership", "runtime_status",
        "runtime_source", "storybook_screen_status",
    ],
    "rejestry/api-operations.csv": [
        "operation_id", "domain", "kind", "method", "bff_route", "service_route",
        "capability", "request_schema", "response_schema", "contract_file", "status",
        "canonical_operation_id", "alias_of", "screen_id", "screen_name",
        "description", "owner",
    ],
    "rejestry/storybook.csv": [
        "story_title", "document", "status", "implementation_note", "fixture_id",
        "states", "play_steps", "visual_assertions", "implementation_status",
        "screen_id", "registry_scope", "active_sidebar_source",
        "target_status", "story_exists", "runtime_used", "test_executed",
        "acceptance_status",
    ],
}

STORYBOOK_SOURCE = "apps/web/.storybook/main.ts"
MANUAL_PAPA_OPERATIONS_MD = "contracts/papa-lab-runtime-operations.md"
PAPA_OPERATIONS_JSON = "contracts/papa-lab-runtime-operations.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = list(reader.fieldnames or [])
        rows = [{key: (value or "") for key, value in row.items()} for row in reader]
    return fields, rows


def first_h1(text: str, fallback: str) -> str:
    match = re.search(r"^#\s+(.+?)\s*$", text, re.M)
    return match.group(1).strip() if match else fallback


def validate(root: Path) -> dict[str, object]:
    errors: list[dict[str, str]] = []
    checks: dict[str, object] = {}

    def error(code: str, message: str) -> None:
        errors.append({"code": code, "message": message})

    spec = root / "docs/specyfikacja-docelowa"
    documents_csv = root / "rejestry/documents.csv"

    if not spec.is_dir():
        error("SPEC_MISSING", str(spec.relative_to(root)))
        documents: dict[str, Path] = {}
    else:
        documents = {
            path.relative_to(spec).as_posix(): path
            for path in sorted(spec.rglob("*.md"))
        }

    if not documents_csv.exists():
        error("DOCUMENT_REGISTRY_MISSING", "rejestry/documents.csv")
        document_rows: list[dict[str, str]] = []
    else:
        fields, document_rows = read_csv(documents_csv)
        expected = ["path", "title", "words", "sha256"]
        if fields != expected:
            error("DOCUMENT_REGISTRY_HEADER", f"expected={expected}, actual={fields}")

    document_map = {row.get("path", ""): row for row in document_rows if row.get("path")}
    if len(document_map) != len(document_rows):
        error("DOCUMENT_REGISTRY_DUPLICATE", "duplicate or empty path in rejestry/documents.csv")

    missing = sorted(set(documents) - set(document_map))
    extra = sorted(set(document_map) - set(documents))
    if missing:
        error("DOCUMENT_REGISTRY_MISSING_ROWS", f"{len(missing)}; examples={missing[:8]}")
    if extra:
        error("DOCUMENT_REGISTRY_EXTRA_ROWS", f"{len(extra)}; examples={extra[:8]}")

    for relative, path in documents.items():
        row = document_map.get(relative)
        if not row:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if row.get("title") != first_h1(text, path.stem):
            error("DOCUMENT_REGISTRY_TITLE", relative)
        if row.get("sha256") != sha256(path):
            error("DOCUMENT_REGISTRY_HASH", relative)
        if not row.get("words", "").isdigit():
            error("DOCUMENT_REGISTRY_WORDS", relative)

    checks["documents"] = {
        "markdown": len(documents),
        "registry_rows": len(document_rows),
        "missing": len(missing),
        "extra": len(extra),
    }

    for relative, expected_header in EXPECTED_HEADERS.items():
        path = root / relative
        if not path.exists():
            error("REGISTRY_MISSING", relative)
            continue
        fields, _ = read_csv(path)
        if fields != expected_header:
            error("REGISTRY_SCHEMA_DRIFT", f"{relative}: expected={expected_header}, actual={fields}")
    checks["protected_registry_schemas"] = len(EXPECTED_HEADERS)

    storybook_source_path = root / STORYBOOK_SOURCE
    if not storybook_source_path.exists():
        error("STORYBOOK_SOURCE_MISSING", STORYBOOK_SOURCE)

    storybook_path = root / "rejestry/storybook.csv"
    story_rows: list[dict[str, str]] = []
    if storybook_path.exists():
        _, story_rows = read_csv(storybook_path)
        fixture_ids: set[str] = set()
        for row in story_rows:
            title = row.get("story_title", "<unknown>")
            if row.get("registry_scope") != "target-backlog-registry":
                error("STORYBOOK_SCOPE", title)
            if row.get("active_sidebar_source") != STORYBOOK_SOURCE:
                error("STORYBOOK_SOURCE", title)
            if row.get("target_status") != row.get("status"):
                error("STORYBOOK_TARGET_STATUS", title)
            if row.get("story_exists") not in {"yes", "no"}:
                error("STORYBOOK_EXISTS_STATE", title)
            if row.get("runtime_used") not in {"yes", "no", "unknown", "not_applicable"}:
                error("STORYBOOK_RUNTIME_STATE", title)
            if row.get("acceptance_status") not in {
                "accepted", "implemented_not_release_accepted", "backlog", "deprecated", "unknown"
            }:
                error("STORYBOOK_ACCEPTANCE_STATE", title)
            if not row.get("test_executed"):
                error("STORYBOOK_TEST_STATE", title)
            fixture_id = row.get("fixture_id", "")
            if not fixture_id:
                error("STORYBOOK_FIXTURE_ID", title)
                continue
            if fixture_id in fixture_ids:
                error("STORYBOOK_FIXTURE_DUPLICATE", fixture_id)
            fixture_ids.add(fixture_id)
            fixture = root / fixture_id
            if not fixture.exists():
                error("STORYBOOK_FIXTURE_MISSING", fixture_id)
                continue
            try:
                payload = json.loads(fixture.read_text(encoding="utf-8"))
            except Exception as exc:
                error("STORYBOOK_FIXTURE_JSON", f"{fixture_id}: {exc}")
                continue
            if payload.get("sourceDocument") != row.get("document"):
                error("STORYBOOK_FIXTURE_SOURCE", fixture_id)
            if "|".join(payload.get("states", [])) != row.get("states"):
                error("STORYBOOK_FIXTURE_STATES", fixture_id)
    checks["storybook"] = {
        "registry_rows": len(story_rows),
        "active_source": STORYBOOK_SOURCE,
    }

    manual_md = root / MANUAL_PAPA_OPERATIONS_MD
    if manual_md.exists():
        error("PAPA_OPERATIONS_DUPLICATE_MD", MANUAL_PAPA_OPERATIONS_MD)

    operations_json = root / PAPA_OPERATIONS_JSON
    if not operations_json.exists():
        error("PAPA_OPERATIONS_JSON_MISSING", PAPA_OPERATIONS_JSON)
    else:
        try:
            payload = json.loads(operations_json.read_text(encoding="utf-8"))
            operations = payload.get("operations", [])
            ids = [item.get("operationId", "") for item in operations]
            if not operations or any(not operation_id for operation_id in ids):
                error("PAPA_OPERATIONS_INVALID", "missing operations or operationId")
            if len(ids) != len(set(ids)):
                error("PAPA_OPERATIONS_DUPLICATE", "duplicate operationId")
            checks["papa_operations"] = len(operations)
        except Exception as exc:
            error("PAPA_OPERATIONS_JSON", str(exc))

    status = "PASS" if not errors else "FAIL"
    return {
        "status": status,
        "error_count": len(errors),
        "errors": errors,
        "checks": checks,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate PapaData documentation/registry source-of-truth integrity.")
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--json-out")
    args = parser.parse_args()

    result = validate(Path(args.root).resolve())
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.json_out:
        Path(args.json_out).write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
