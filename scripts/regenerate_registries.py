#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "docs/specyfikacja-docelowa"
REG = ROOT / "rejestry"
DOCUMENTS = REG / "documents.csv"

# These registries carry manually curated runtime/product semantics that cannot
# be reconstructed safely from Markdown. This maintenance script must never
# overwrite them.
PROTECTED_REGISTRIES = (
    "routes.csv",
    "api-operations.csv",
    "storybook.csv",
    "component-contracts.csv",
    "api-schemas.csv",
)

WORD_RE = re.compile(r"\b[\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]+\b")
CODE_FENCE_RE = re.compile(r"```.*?```", re.S)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def first_h1(text: str, fallback: str) -> str:
    match = re.search(r"^#\s+(.+?)\s*$", text, re.M)
    return match.group(1).strip() if match else fallback


def count_words(text: str) -> int:
    return len(WORD_RE.findall(CODE_FENCE_RE.sub(" ", text)))


def build_document_rows() -> list[list[str]]:
    rows: list[list[str]] = []

    for path in sorted(SPEC.rglob("*.md")):
        relative = path.relative_to(SPEC).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        # P2-01 normalizes documentation metrics: path/title/hash and word count
        # are all derived from the current document bytes with one tokenizer.
        # Historical mixed-tokenizer counts are intentionally discarded.
        rows.append([
            relative,
            first_h1(text, path.stem),
            str(count_words(text)),
            sha256(path),
        ])

    return rows


def render_documents_csv(rows: list[list[str]]) -> str:
    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer, lineterminator="\r\n")
    writer.writerow(["path", "title", "words", "sha256"])
    writer.writerows(rows)
    return buffer.getvalue()


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="") as handle:
        handle.write(content)
    temporary.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Safely maintain the derived documentation registry. Rich runtime "
            "registries are intentionally protected from heuristic regeneration."
        )
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Return non-zero when rejestry/documents.csv is out of date without modifying files.",
    )
    args = parser.parse_args()

    rows = build_document_rows()
    expected = render_documents_csv(rows)
    if DOCUMENTS.exists():
        with DOCUMENTS.open(encoding="utf-8", newline="") as handle:
            current = handle.read()
    else:
        current = ""

    if args.check:
        if current != expected:
            print("OUTDATED: rejestry/documents.csv")
            return 1
        print(f"OK: rejestry/documents.csv ({len(rows)} documents)")
        return 0

    if current != expected:
        write_atomic(DOCUMENTS, expected)
        action = "updated"
    else:
        action = "unchanged"

    print(f"documents.csv {action}: {len(rows)} documents")
    print("protected registries untouched: " + ", ".join(PROTECTED_REGISTRIES))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
