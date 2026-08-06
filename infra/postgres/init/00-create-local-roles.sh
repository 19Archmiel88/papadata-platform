#!/usr/bin/env sh

psql \
  -v ON_ERROR_STOP=1 \
  -v papadata_database="${PAPADATA_DATABASE:-papadata}" \
  -v papadata_test_database="${PAPADATA_TEST_DATABASE:-papadata_test}" \
  -v migrator_password="${PAPADATA_MIGRATOR_PASSWORD:-change-me-local-only}" \
  -v app_password="${PAPADATA_APP_PASSWORD:-change-me-local-only}" \
  -v platform_password="${PAPADATA_PLATFORM_PASSWORD:-change-me-local-only}" \
  -v test_password="${PAPADATA_TEST_PASSWORD:-change-me-local-only}" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'papadata_migrator') THEN
    CREATE ROLE papadata_migrator LOGIN;
  END IF;

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

ALTER ROLE papadata_migrator WITH LOGIN PASSWORD :'migrator_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
ALTER ROLE papadata_app WITH LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE papadata_platform WITH LOGIN PASSWORD :'platform_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS;
ALTER ROLE papadata_test WITH LOGIN PASSWORD :'test_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

SELECT format('CREATE DATABASE %I OWNER papadata_migrator', :'papadata_database')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'papadata_database'
)\gexec

SELECT format('CREATE DATABASE %I OWNER papadata_migrator', :'papadata_test_database')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'papadata_test_database'
)\gexec

SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'papadata_database')\gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'papadata_test_database')\gexec

SELECT format('GRANT CONNECT ON DATABASE %I TO papadata_migrator, papadata_app, papadata_platform', :'papadata_database')\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO papadata_migrator, papadata_test', :'papadata_test_database')\gexec
SQL
