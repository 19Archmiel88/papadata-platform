#!/usr/bin/env sh

command_name="${1:-up}"
database_name="${PAPADATA_DATABASE:-papadata}"
test_database_name="${PAPADATA_TEST_DATABASE:-papadata_test}"
postgres_host="${POSTGRES_HOST:-postgres}"
postgres_port="${POSTGRES_PORT:-5432}"
migrator_user="${PAPADATA_MIGRATOR_USER:-papadata_migrator}"
migrator_password="${PAPADATA_MIGRATOR_PASSWORD:-change-me-local-only}"
app_user="${PAPADATA_APP_USER:-papadata_app}"
platform_user="${PAPADATA_PLATFORM_USER:-papadata_platform}"
test_user="${PAPADATA_TEST_USER:-papadata_test}"
test_password="${PAPADATA_TEST_PASSWORD:-change-me-local-only}"
migration_dir="${MIGRATION_DIR:-/workspace/packages/database/migrations}"

run_psql() {
  target_database="$1"
  shift

  PGPASSWORD="$migrator_password" psql \
    -h "$postgres_host" \
    -p "$postgres_port" \
    -U "$migrator_user" \
    -d "$target_database" \
    -v ON_ERROR_STOP=1 \
    "$@"
}

run_psql_value() {
  target_database="$1"
  shift

  run_psql "$target_database" -tA "$@"
}

run_test_psql() {
  target_database="$1"
  shift

  PGPASSWORD="$test_password" psql \
    -h "$postgres_host" \
    -p "$postgres_port" \
    -U "$test_user" \
    -d "$target_database" \
    -v ON_ERROR_STOP=1 \
    "$@"
}

wait_for_database() {
  target_database="$1"
  attempt=1

  while [ "$attempt" -le 60 ]; do
    if PGPASSWORD="$migrator_password" pg_isready \
      -h "$postgres_host" \
      -p "$postgres_port" \
      -U "$migrator_user" \
      -d "$target_database" >/dev/null 2>&1; then
      return 0
    fi

    sleep 1
    attempt=$((attempt + 1))
  done

  echo "Database ${target_database} is not ready on ${postgres_host}:${postgres_port}."
  return 1
}

migration_version() {
  basename "$1" .sql | sed 's/_.*//'
}

migration_name() {
  basename "$1" .sql | cut -d_ -f2-
}

migration_checksum() {
  sha256sum "$1" | awk '{ print $1 }'
}

monotonic_ms() {
  awk '{ printf "%.0f\n", $1 * 1000 }' /proc/uptime
}

applied_checksum() {
  target_database="$1"
  version="$2"

  run_psql_value "$target_database" \
    -c "SELECT checksum_sha256 FROM app.schema_migrations WHERE version = '${version}'" 2>/dev/null |
    tr -d '[:space:]'
}

apply_migrations() {
  target_database="$1"
  wait_for_database "$target_database" || return 1

  migration_count=0
  applied_count=0

  for migration_file in "$migration_dir"/*.sql; do
    if [ ! -e "$migration_file" ]; then
      echo "No SQL migration files found in ${migration_dir}."
      return 1
    fi

    migration_count=$((migration_count + 1))
    version="$(migration_version "$migration_file")"
    name="$(migration_name "$migration_file")"
    checksum="$(migration_checksum "$migration_file")"
    current_checksum="$(applied_checksum "$target_database" "$version")"

    if [ -n "$current_checksum" ]; then
      if [ "$current_checksum" != "$checksum" ]; then
        echo "Checksum mismatch for migration ${version}."
        return 1
      fi

      echo "skip ${version} ${name}"
    else
      echo "apply ${version} ${name}"
      started_at_ms="$(monotonic_ms)"
      run_psql "$target_database" --single-transaction -f "$migration_file" || return 1
      finished_at_ms="$(monotonic_ms)"
      execution_ms=$((finished_at_ms - started_at_ms))

      run_psql "$target_database" \
        -v version="$version" \
        -v name="$name" \
        -v checksum="$checksum" \
        -v execution_ms="$execution_ms" <<'SQL' || return 1
INSERT INTO app.schema_migrations (
  version,
  name,
  checksum_sha256,
  execution_ms
)
VALUES (
  :'version',
  :'name',
  :'checksum',
  :execution_ms
);
SQL

      applied_count=$((applied_count + 1))
    fi
  done

  echo "migrations=${migration_count} applied=${applied_count} database=${target_database}"
}

status_migrations() {
  target_database="$1"
  wait_for_database "$target_database" || return 1

  for migration_file in "$migration_dir"/*.sql; do
    if [ ! -e "$migration_file" ]; then
      echo "No SQL migration files found in ${migration_dir}."
      return 1
    fi

    version="$(migration_version "$migration_file")"
    name="$(migration_name "$migration_file")"
    checksum="$(migration_checksum "$migration_file")"
    current_checksum="$(applied_checksum "$target_database" "$version")"

    if [ "$current_checksum" = "$checksum" ]; then
      echo "applied ${version} ${name}"
    elif [ -n "$current_checksum" ]; then
      echo "changed ${version} ${name}"
      return 1
    else
      echo "pending ${version} ${name}"
    fi
  done
}

reset_test_schema() {
  wait_for_database "$test_database_name" || return 1
  run_psql "$test_database_name" -c "DROP SCHEMA IF EXISTS app CASCADE;" || return 1
}

assert_migration_contract() {
  target_database="$1"

  checks="$(run_psql_value "$target_database" <<SQL
WITH checks(check_name, passed) AS (
  VALUES
    ('schema_migrations_exists', to_regclass('app.schema_migrations') IS NOT NULL),
    ('audit_events_exists', to_regclass('app.audit_events') IS NOT NULL),
    ('outbox_events_exists', to_regclass('app.outbox_events') IS NOT NULL),
    ('processed_events_exists', to_regclass('app.processed_events') IS NOT NULL),
    (
      'schema_owner_is_migrator',
      (
        SELECT r.rolname
        FROM pg_namespace n
        JOIN pg_roles r ON r.oid = n.nspowner
        WHERE n.nspname = 'app'
      ) = '${migrator_user}'
    ),
    (
      'runtime_cannot_create_schema_objects',
      NOT has_schema_privilege('${app_user}', 'app', 'CREATE')
    ),
    (
      'test_role_cannot_create_schema_objects',
      NOT has_schema_privilege('${test_user}', 'app', 'CREATE')
    ),
    (
      'tables_owned_by_migrator',
      NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'app'
          AND tablename IN (
            'schema_migrations',
            'audit_events',
            'outbox_events',
            'processed_events'
          )
          AND tableowner <> '${migrator_user}'
      )
    ),
    (
      'platform_role_has_bypassrls',
      EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = '${platform_user}' AND rolbypassrls
      )
    ),
    (
      'all_tables_classified',
      NOT EXISTS (
        SELECT 1
        FROM information_schema.tables AS table_list
        LEFT JOIN app.table_security_classification AS classification
          ON classification.table_name = table_list.table_name
        WHERE table_list.table_schema = 'app'
          AND table_list.table_type = 'BASE TABLE'
          AND classification.table_name IS NULL
      )
    ),
    (
      'tenant_tables_have_forced_rls',
      NOT EXISTS (
        SELECT 1
        FROM information_schema.columns AS tenant_column
        JOIN pg_class AS relation
          ON relation.relname = tenant_column.table_name
        JOIN pg_namespace AS namespace
          ON namespace.oid = relation.relnamespace
         AND namespace.nspname = tenant_column.table_schema
        WHERE tenant_column.table_schema = 'app'
          AND tenant_column.column_name = 'tenant_id'
          AND (NOT relation.relrowsecurity OR NOT relation.relforcerowsecurity)
      )
    ),
    (
      'privacy_targets_have_forced_rls',
      EXISTS (
        SELECT 1
        FROM pg_class AS relation
        JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
        WHERE namespace.nspname = 'app'
          AND relation.relname = 'privacy_request_targets'
          AND relation.relrowsecurity
          AND relation.relforcerowsecurity
      )
    ),
    (
      'platform_role_is_not_runtime_role',
      '${platform_user}' <> '${app_user}'
    )
)
SELECT check_name || '=' || CASE WHEN passed THEN 'ok' ELSE 'fail' END
FROM checks
ORDER BY check_name;
SQL
)"

  echo "$checks"

  if echo "$checks" | grep -q '=fail'; then
    return 1
  fi

  applied_total="$(run_psql_value "$target_database" -c "SELECT count(*) FROM app.schema_migrations;" | tr -d '[:space:]')"
  echo "schema_migrations_count=${applied_total}"
}

assert_rls_isolation() {
  target_database="$1"
  test_file="${migration_dir%/migrations}/tests/rls-isolation.sql"

  if [ ! -f "$test_file" ]; then
    echo "RLS isolation test not found: ${test_file}"
    return 1
  fi

  run_test_psql "$target_database" -f "$test_file" || return 1
  echo "rls_isolation=ok database=${target_database} role=${test_user}"
}

case "$command_name" in
  up)
    apply_migrations "$database_name"
    ;;
  status)
    status_migrations "$database_name"
    ;;
  test)
    reset_test_schema &&
      apply_migrations "$test_database_name" &&
      assert_migration_contract "$test_database_name" &&
      assert_rls_isolation "$test_database_name"
    ;;
  *)
    echo "Usage: migrate.sh [up|status|test]"
    false
    ;;
esac
