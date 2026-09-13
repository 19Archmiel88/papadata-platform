#!/usr/bin/env sh
# Reproducible role provisioning for any Postgres instance reachable via
# DATABASE_ADMIN_URL, including Cloud SQL. Runs the exact same canonical
# roles.sql the local init scripts run
# (infra/postgres/init/01-create-production-parity-roles.sh) -- see that
# file's canonical source at packages/database/provisioning/roles.sql for
# what it actually does and why it exists.
#
# Before this script existed, there was no code path that created
# papadata_migrator/papadata_app/papadata_platform/papadata_test on Cloud
# SQL: the only place those CREATE ROLE statements lived was in the two
# local-only docker-entrypoint-initdb.d scripts, which only apply to the
# local Compose Postgres container. Production role creation was a manual,
# undocumented, non-reproducible operation.
#
# Required: DATABASE_ADMIN_URL (an admin/superuser-capable connection
# string -- e.g. Cloud SQL's built-in `postgres` user, whose password
# Terraform sets via google_sql_user.admin), and the four target role
# passwords the caller intends to also embed in DATABASE_URL/
# SCHEDULER_DATABASE_URL/etc when constructing those secrets.
#
# Usage:
#   DATABASE_ADMIN_URL=postgresql://postgres:...@host:5432/papadata \
#   PAPADATA_MIGRATOR_PASSWORD=... PAPADATA_APP_PASSWORD=... \
#   PAPADATA_PLATFORM_PASSWORD=... PAPADATA_TEST_PASSWORD=... \
#     sh packages/database/scripts/provision-roles.sh
script_dir="$(cd "$(dirname "$0")" && pwd)"
roles_sql="${script_dir%/scripts}/provisioning/roles.sql"

: "${DATABASE_ADMIN_URL:?DATABASE_ADMIN_URL is required (an admin/superuser-capable connection string).}"
: "${PAPADATA_MIGRATOR_PASSWORD:?PAPADATA_MIGRATOR_PASSWORD is required.}"
: "${PAPADATA_APP_PASSWORD:?PAPADATA_APP_PASSWORD is required.}"
: "${PAPADATA_PLATFORM_PASSWORD:?PAPADATA_PLATFORM_PASSWORD is required.}"
: "${PAPADATA_TEST_PASSWORD:?PAPADATA_TEST_PASSWORD is required.}"

psql \
  "$DATABASE_ADMIN_URL" \
  -v ON_ERROR_STOP=1 \
  -v migrator_password="$PAPADATA_MIGRATOR_PASSWORD" \
  -v app_password="$PAPADATA_APP_PASSWORD" \
  -v platform_password="$PAPADATA_PLATFORM_PASSWORD" \
  -v test_password="$PAPADATA_TEST_PASSWORD" \
  -f "$roles_sql"

psql \
  "$DATABASE_ADMIN_URL" \
  -v ON_ERROR_STOP=1 <<'SQL'
REVOKE ALL ON DATABASE papadata FROM PUBLIC;
GRANT CONNECT ON DATABASE papadata TO papadata_migrator, papadata_app, papadata_platform, papadata_test;
SQL

echo "database roles provisioned=papadata_migrator,papadata_app,papadata_platform,papadata_test"
