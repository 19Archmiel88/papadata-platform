#!/usr/bin/env sh

# Compatibility entrypoint only. All environments use the canonical migration
# runner and the single app.schema_migrations ledger.
CANONICAL_RUNNER="${PAPADATA_MIGRATION_RUNNER:-/workspace/packages/database/scripts/migrate.sh}"

if [ ! -f "$CANONICAL_RUNNER" ]; then
  echo "Canonical migration runner not found: $CANONICAL_RUNNER" >&2
  return_code=1
else
  exec sh "$CANONICAL_RUNNER" "${1:-up}"
  return_code=$?
fi

exit "$return_code"
