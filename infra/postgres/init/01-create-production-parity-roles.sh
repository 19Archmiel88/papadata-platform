#!/usr/bin/env sh

psql \
  -v ON_ERROR_STOP=1 \
  -v app_password="${PAPADATA_APP_PASSWORD:?PAPADATA_APP_PASSWORD is required}" \
  -v platform_password="${PAPADATA_PLATFORM_PASSWORD:?PAPADATA_PLATFORM_PASSWORD is required}" \
  -v test_password="${PAPADATA_TEST_PASSWORD:?PAPADATA_TEST_PASSWORD is required}" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'papadata_app') THEN
    CREATE ROLE papadata_app LOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'papadata_platform') THEN
    CREATE ROLE papadata_platform LOGIN BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'papadata_test') THEN
    CREATE ROLE papadata_test LOGIN;
  END IF;
END
$$;

ALTER ROLE papadata_app WITH LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE papadata_platform WITH LOGIN PASSWORD :'platform_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS;
ALTER ROLE papadata_test WITH LOGIN PASSWORD :'test_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

REVOKE ALL ON DATABASE papadata FROM PUBLIC;
GRANT CONNECT ON DATABASE papadata TO papadata_migrator, papadata_app, papadata_platform, papadata_test;
SQL
