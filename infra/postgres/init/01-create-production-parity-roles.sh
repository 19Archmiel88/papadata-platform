#!/usr/bin/env sh
# Thin wrapper around the canonical role definition
# (packages/database/provisioning/roles.sql, mounted at
# /opt/papadata/roles.sql -- see compose.production-parity.yml). Runs
# during docker-entrypoint-initdb.d, over the local Unix socket.
psql \
  -v ON_ERROR_STOP=1 \
  -v migrator_password="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}" \
  -v app_password="${PAPADATA_APP_PASSWORD:?PAPADATA_APP_PASSWORD is required}" \
  -v platform_password="${PAPADATA_PLATFORM_PASSWORD:?PAPADATA_PLATFORM_PASSWORD is required}" \
  -v test_password="${PAPADATA_TEST_PASSWORD:?PAPADATA_TEST_PASSWORD is required}" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -f /opt/papadata/roles.sql

psql \
  -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<'SQL'
REVOKE ALL ON DATABASE papadata FROM PUBLIC;
GRANT CONNECT ON DATABASE papadata TO papadata_migrator, papadata_app, papadata_platform, papadata_test;
SQL
