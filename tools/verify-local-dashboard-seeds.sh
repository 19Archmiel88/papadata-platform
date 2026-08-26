#!/usr/bin/env bash

SCENARIO="${1:-all}"

case "$SCENARIO" in
  all|full-integrations|rbac-owner-employee|new-registration-onboarding|partial-integrations)
    ;;
  *)
    echo "ERROR: unknown scenario: $SCENARIO"
    exit 2
    ;;
esac

if [ ! -f "compose.yaml" ]; then
  echo "ERROR: run this script from the papadata-platform repository root."
  exit 2
fi

COMPOSE_ARGS=()
if [ -n "${PAPADATA_ENV_FILE:-}" ]; then
  if [ ! -f "$PAPADATA_ENV_FILE" ]; then
    echo "ERROR: PAPADATA_ENV_FILE does not exist: $PAPADATA_ENV_FILE"
    exit 2
  fi
  COMPOSE_ARGS+=(--env-file "$PAPADATA_ENV_FILE")
elif [ -f ".env" ]; then
  COMPOSE_ARGS+=(--env-file ".env")
fi

docker compose "${COMPOSE_ARGS[@]}" up -d postgres || exit 1
docker compose "${COMPOSE_ARGS[@]}" run --rm \
  -e SEED_SCENARIO="$SCENARIO" \
  --entrypoint sh migrate -c '
    export PGPASSWORD="$PAPADATA_MIGRATOR_PASSWORD"
    exec psql \
      -h "$POSTGRES_HOST" \
      -p "$POSTGRES_PORT" \
      -U "$PAPADATA_MIGRATOR_USER" \
      -d "$PAPADATA_DATABASE" \
      -v ON_ERROR_STOP=1 \
      -v seed_scenario="$SEED_SCENARIO" \
      -f /workspace/packages/database/seeds/verify-local-dashboard-scenarios.sql
  '
