#!/usr/bin/env bash


required_files=(
  "docs/spec/README.md"
  "docs/spec/source-of-truth.md"
  "docs/spec/decisions.md"
  "docs/spec/implementation-plan.md"
  "docs/spec/access-matrix.md"
  "docs/spec/data-and-kpi.md"
  "docs/spec/integrations.md"
  "docs/spec/ai.md"
  "docs/spec/security.md"
  "docs/spec/ui-and-storybook.md"
  "docs/spec/states-and-errors.md"
  "CODEX.md"
)

missing=0

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "BRAK: $file"
    missing=1
  else
    echo "OK:   $file"
  fi
done

if [[ "$missing" -eq 1 ]]; then
  echo
  echo "Dokumentacja wykonawcza jest niekompletna."
  exit 1
fi

echo
echo "Dokumentacja wykonawcza jest kompletna."
