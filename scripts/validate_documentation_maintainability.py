#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "docs/specyfikacja-docelowa"
CENTRAL = SPEC / "00-zarzadzanie-dokumentacja/README.md"
WORD_RE = re.compile(r"\b[\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]+\b")
REQUIRED_ANCHORS = {
    "std-screen-states",
    "std-screen-acceptance",
    "std-screen-responsive-a11y",
    "std-screen-business-interactions",
    "std-screen-security-privacy",
    "std-screen-storybook-tests",
    "std-component-acceptance",
    "std-component-storybook-tests",
    "std-component-states",
    "std-component-a11y",
    "std-component-events",
    "std-api-operation-rules",
    "std-e2e-acceptance",
    "std-e2e-security",
    "std-security-controls",
    "std-security-product-links",
    "std-security-evidence",
    "std-mobile-baseline",
    "std-mobile-decisions",
    "std-mobile-acceptance",
    "std-screen-layout-base",
    "std-screen-layout-analytics",
    "std-screen-layout-table",
    "std-screen-layout-analytics-table",
    "std-screen-layout-policy",
    "std-screen-route-none",
}
MAX_DUPLICATE_RATIO = 0.25


def main() -> int:
    errors: list[str] = []
    if not CENTRAL.exists():
        errors.append("central shared-standard document is missing")
        central_text = ""
    else:
        central_text = CENTRAL.read_text(encoding="utf-8")
    for anchor in sorted(REQUIRED_ANCHORS):
        if f'id="{anchor}"' not in central_text:
            errors.append(f"missing shared documentation anchor: {anchor}")

    paragraphs: dict[str, int] = defaultdict(int)
    total_words = 0
    documents = list(SPEC.rglob("*.md"))
    for path in documents:
        text = path.read_text(encoding="utf-8", errors="replace")
        total_words += len(WORD_RE.findall(text))
        for block in re.split(r"\n\s*\n", text):
            normalized = " ".join(line.strip() for line in block.strip().splitlines())
            word_count = len(WORD_RE.findall(normalized))
            if word_count >= 15:
                paragraphs[normalized] += 1

    repeated_words = sum(
        (count - 1) * len(WORD_RE.findall(paragraph))
        for paragraph, count in paragraphs.items()
        if count >= 3
    )
    ratio = (repeated_words / total_words) if total_words else 0.0
    if ratio > MAX_DUPLICATE_RATIO:
        errors.append(
            f"documentation duplicate ratio {ratio:.4f} exceeds {MAX_DUPLICATE_RATIO:.2f}"
        )

    result = {
        "status": "PASS" if not errors else "FAIL",
        "documents": len(documents),
        "words": total_words,
        "theoreticalRepeatedWords": repeated_words,
        "duplicateRatio": round(ratio, 4),
        "maxDuplicateRatio": MAX_DUPLICATE_RATIO,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
