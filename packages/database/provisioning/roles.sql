-- Canonical, idempotent role provisioning. This is the ONE source of truth
-- for what papadata_migrator/papadata_app/papadata_platform/papadata_test
-- must look like -- run identically against local Postgres
-- (infra/postgres/init/00-create-local-roles.sh for plain dev,
-- infra/postgres/init/01-create-production-parity-roles.sh for
-- production-parity) and against Cloud SQL
-- (packages/database/scripts/provision-roles.sh, run with an admin
-- credential). Before this file existed, Cloud SQL role creation was a
-- manual, undocumented, non-reproducible step -- these roles were only
-- ever defined in code for the two local init scripts, never for the real
-- database.
--
-- Expects four psql -v variables: migrator_password, app_password,
-- platform_password, test_password. Safe to re-run.
--
-- papadata_migrator gets its password/attributes set ONLY at CREATE time,
-- deliberately never via a later ALTER ROLE papadata_migrator: in
-- production-parity/dev, papadata_migrator is the very role this script
-- connects as (bootstrapped by the postgres image's POSTGRES_USER before
-- this file ever runs), and PostgreSQL refuses to let a non-superuser role
-- ALTER its own SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS
-- attributes -- even to reassert the values it already has -- with
-- "permission denied to alter role ... must have SUPERUSER attribute".
-- Changing its password alone would be allowed self-referentially, but
-- there is nothing to change locally (the bootstrap password already
-- matches), and on Cloud SQL this branch instead CREATEs the role fresh
-- (as the separate, genuinely-superuser admin credential), which needs no
-- self-alter at all.
SELECT format(
  'CREATE ROLE papadata_migrator LOGIN PASSWORD %s CREATEROLE NOSUPERUSER NOCREATEDB NOREPLICATION NOBYPASSRLS',
  :'migrator_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'papadata_migrator')
\gexec

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
