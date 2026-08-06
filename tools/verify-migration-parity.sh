#!/usr/bin/env sh

ROOT="${PAPADATA_REPO:-$(pwd)}"
LOCAL_COMPOSE="$ROOT/compose.yaml"
PARITY_COMPOSE="$ROOT/compose.production-parity.yml"
RUNNER="$ROOT/packages/database/scripts/migrate.sh"
COMPAT="$ROOT/infra/postgres/apply-migrations.sh"
RESULT=0

for FILE in "$LOCAL_COMPOSE" "$PARITY_COMPOSE" "$RUNNER" "$COMPAT"; do
  if [ ! -f "$FILE" ]; then
    echo "Missing migration parity file: $FILE" >&2
    RESULT=1
  fi
done

if [ "$RESULT" -eq 0 ]; then
  grep -Fq 'packages/database/scripts/migrate.sh' "$LOCAL_COMPOSE" || RESULT=1
  grep -Fq 'packages/database/scripts/migrate.sh' "$PARITY_COMPOSE" || RESULT=1
  grep -Fq 'app.schema_migrations' "$RUNNER" || RESULT=1
  if grep -Fq 'papadata_applied_migrations' "$COMPAT"; then RESULT=1; fi
fi

if [ "$RESULT" -eq 0 ] && [ "${PAPADATA_RUN_DATABASE_TEST:-0}" = "1" ]; then
  docker compose --env-file "$ROOT/.env.example" run --rm migrate test || RESULT=1
fi

if [ "$RESULT" -eq 0 ]; then
  echo "MIGRATION_PARITY=PASS live_database_test=${PAPADATA_RUN_DATABASE_TEST:-0}"
else
  echo "MIGRATION_PARITY=FAIL" >&2
fi

exit "$RESULT"
