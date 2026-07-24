#!/usr/bin/env sh

MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"
MIGRATION_CODE=0

psql -v ON_ERROR_STOP=1 <<'SQL' || MIGRATION_CODE=$?
create table if not exists public.papadata_applied_migrations (
  version text primary key,
  checksum_sha256 text not null,
  applied_at timestamptz not null default now()
);
SQL

if [ "$MIGRATION_CODE" -eq 0 ]; then
  for FILE in "$MIGRATIONS_DIR"/*.sql
  do
    if [ ! -f "$FILE" ]; then
      continue
    fi

    VERSION="$(basename "$FILE")"
    CHECKSUM="$(sha256sum "$FILE" | cut -d' ' -f1)"

    CURRENT="$(
      psql \
        -At \
        -v ON_ERROR_STOP=1 \
        -v migration_version="$VERSION" \
        <<'SQL'
select checksum_sha256
from public.papadata_applied_migrations
where version = :'migration_version';
SQL
    )" || MIGRATION_CODE=$?

    if [ "$MIGRATION_CODE" -ne 0 ]; then
      break
    fi

    if [ -n "$CURRENT" ] && [ "$CURRENT" != "$CHECKSUM" ]; then
      echo "Checksum mismatch: $VERSION"
      MIGRATION_CODE=1
      break
    fi

    if [ -z "$CURRENT" ]; then
      echo "Applying $VERSION"

      psql \
        -v ON_ERROR_STOP=1 \
        -1 \
        -f "$FILE" \
        || MIGRATION_CODE=$?

      if [ "$MIGRATION_CODE" -ne 0 ]; then
        break
      fi

      psql \
        -v ON_ERROR_STOP=1 \
        -v migration_version="$VERSION" \
        -v migration_checksum="$CHECKSUM" \
        <<'SQL' || MIGRATION_CODE=$?
insert into public.papadata_applied_migrations (
  version,
  checksum_sha256
)
values (
  :'migration_version',
  :'migration_checksum'
);
SQL

      if [ "$MIGRATION_CODE" -ne 0 ]; then
        break
      fi
    else
      echo "Already applied: $VERSION"
    fi
  done
fi

[ "$MIGRATION_CODE" -eq 0 ]
