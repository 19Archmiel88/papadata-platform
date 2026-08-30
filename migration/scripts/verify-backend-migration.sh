#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

EXPECTED_NODE="v24.18.0"
EXPECTED_PNPM="10.29.3"

if [[ "$(node --version)" != "$EXPECTED_NODE" ]]; then
  echo "BŁĄD: wymagany Node $EXPECTED_NODE, znaleziono $(node --version)." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "BŁĄD: pnpm nie jest dostępny." >&2
  exit 1
fi

if [[ "$(pnpm --version)" != "$EXPECTED_PNPM" ]]; then
  echo "BŁĄD: wymagany pnpm $EXPECTED_PNPM, znaleziono $(pnpm --version)." >&2
  exit 1
fi

required=(
  packages/contracts/src/migrated-domain-policies.ts
  packages/integrations/src/canonical-normalizer.ts
  apps/api/src/production/contract-runtime/contract-runtime.service.ts
  apps/worker/src/production/ingestion-pipeline.ts
  config/backend-release-scope.json
  migration/MIGRATION-MANIFEST.json
  tools/verify-backend-gate.mjs
  tools/generate-backend-evidence.mjs
)
for path in "${required[@]}"; do
  [[ -f "$path" ]] || { echo "BŁĄD: brak $path" >&2; exit 1; }
done

pnpm install --frozen-lockfile
pnpm verify:backend
pnpm evidence:backend

echo "BACKEND_MIGRATION_PACKAGE=PASS"
