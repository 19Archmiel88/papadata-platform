#!/usr/bin/env python3
from __future__ import annotations

import csv
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "rejestry/storybook.csv"
STORY_ROOT = ROOT / "apps/web/src"
SCREENS = ROOT / "macierze/ekrany.csv"
COMPONENT_USAGE = ROOT / "macierze/ekran-komponent.csv"

STATE_FIELDS = [
    "target_status",
    "story_exists",
    "runtime_used",
    "test_executed",
    "acceptance_status",
]


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        return [{k: (v or "") for k, v in row.items()} for row in csv.DictReader(handle)]


def story_inventory() -> tuple[set[str], set[str]]:
    stems: set[str] = set()
    sources: set[str] = set()
    for path in sorted(STORY_ROOT.rglob("*.stories.ts*")):
        stems.add(norm(path.name.split(".stories.", 1)[0]))
        text = path.read_text(encoding="utf-8", errors="ignore")
        sources.add(norm(text))
    return stems, sources


def has_physical_story(row: dict[str, str], stems: set[str], sources: set[str]) -> bool:
    leaf = row.get("story_title", "").rsplit("/", 1)[-1].strip()
    key = norm(leaf)
    if key and (key in stems or any(key in source for source in sources)):
        return True

    screen_id = row.get("screen_id", "").strip()
    status = row.get("status", "").strip()
    if screen_id and status in {"implemented", "accepted"}:
        major = screen_id.split(".", 1)[0]
        domain = ROOT / "apps/web/src/storybook-next/stories"
        if domain.is_dir() and any(
            child.is_dir()
            and child.name.startswith(f"{major}-")
            and any(child.glob("*.stories.ts*"))
            for child in domain.iterdir()
        ):
            return True
    return False


def infer_runtime(row: dict[str, str], screen_runtime: dict[str, str], runtime_components: set[str]) -> str:
    screen_id = row.get("screen_id", "").strip()
    if screen_id:
        value = screen_runtime.get(screen_id)
        if value == "yes":
            return "yes"
        if value == "no":
            return "no"
        return "unknown"

    leaf = row.get("story_title", "").rsplit("/", 1)[-1].strip()
    if leaf in runtime_components:
        return "yes"
    if row.get("story_title", "").startswith("00 Fundamenty/"):
        return "not_applicable"
    if row.get("status") == "deprecated":
        return "no"
    return "unknown"


def infer_test(row: dict[str, str]) -> str:
    implementation = row.get("implementation_status", "")
    if "static-and-play-contract" in implementation:
        return "historical-static+play"
    if "responsive-a11y" in implementation:
        return "historical-responsive+a11y"
    if "static-contract" in implementation or "readiness-contract" in implementation:
        return "historical-static"
    if "interaction-system" in implementation or "state-system" in implementation:
        return "historical-contract"
    if row.get("status") == "backlog-target":
        return "not_executed"
    if row.get("status") == "deprecated":
        return "not_applicable"
    return "unknown"


def infer_acceptance(row: dict[str, str]) -> str:
    status = row.get("status", "")
    return {
        "accepted": "accepted",
        "implemented": "implemented_not_release_accepted",
        "backlog-target": "backlog",
        "deprecated": "deprecated",
    }.get(status, "unknown")


def build_rows() -> tuple[list[str], list[dict[str, str]]]:
    with REGISTRY.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        base_fields = [field for field in (reader.fieldnames or []) if field not in STATE_FIELDS]
        rows = [{k: (v or "") for k, v in row.items()} for row in reader]

    screen_runtime = {row["id"]: row.get("runtime_surface", "") for row in read_csv(SCREENS)}
    runtime_components = {
        row.get("komponent", "")
        for row in read_csv(COMPONENT_USAGE)
        if row.get("status") in {"required", "implemented", "canonical"}
    }
    stems, sources = story_inventory()

    result = []
    for row in rows:
        next_row = {field: row.get(field, "") for field in base_fields}
        next_row.update({
            "target_status": row.get("status", ""),
            "story_exists": "yes" if has_physical_story(row, stems, sources) else "no",
            "runtime_used": infer_runtime(row, screen_runtime, runtime_components),
            "test_executed": infer_test(row),
            "acceptance_status": infer_acceptance(row),
        })
        result.append(next_row)
    return base_fields + STATE_FIELDS, result


def render(fields: list[str], rows: list[dict[str, str]]) -> str:
    import io
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, lineterminator="\r\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def main() -> int:
    fields, rows = build_rows()
    expected = render(fields, rows)
    current = REGISTRY.read_text(encoding="utf-8")
    import sys
    check = "--check" in sys.argv
    if check:
        if current.replace("\r\n", "\n") != expected.replace("\r\n", "\n"):
            print("OUTDATED: rejestry/storybook.csv runtime state fields")
            return 1
        print(f"OK: storybook runtime state ({len(rows)} rows)")
        return 0
    with REGISTRY.open("w", encoding="utf-8", newline="") as handle:
        handle.write(expected)
    yes_story = sum(row["story_exists"] == "yes" for row in rows)
    yes_runtime = sum(row["runtime_used"] == "yes" for row in rows)
    print(f"storybook.csv updated: rows={len(rows)} physical_story={yes_story} runtime_used={yes_runtime}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
