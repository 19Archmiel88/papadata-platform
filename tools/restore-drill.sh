#!/usr/bin/env sh

SOURCE_URL="${PAPADATA_DR_SOURCE_DATABASE_URL:-}"
TARGET_URL="${PAPADATA_DR_TARGET_DATABASE_URL:-}"
EVIDENCE_DIR="${PAPADATA_DR_EVIDENCE_DIR:-artifacts/backend-evidence/restore-drill-$(date +%Y%m%d-%H%M%S)}"
RPO_TARGET_MINUTES="${PAPADATA_RPO_TARGET_MINUTES:-15}"
RTO_TARGET_MINUTES="${PAPADATA_RTO_TARGET_MINUTES:-60}"
RESULT=0

if [ -z "$SOURCE_URL" ] || [ -z "$TARGET_URL" ]; then
  echo "PAPADATA_DR_SOURCE_DATABASE_URL and PAPADATA_DR_TARGET_DATABASE_URL are required." >&2
  RESULT=1
fi

if ! command -v pg_dump >/dev/null 2>&1 || ! command -v pg_restore >/dev/null 2>&1; then
  echo "pg_dump and pg_restore are required." >&2
  RESULT=1
fi

if [ "$RESULT" -eq 0 ]; then
  mkdir -p "$EVIDENCE_DIR"
  START_EPOCH="$(date +%s)"
  pg_dump --format=custom --no-owner --no-privileges --dbname="$SOURCE_URL" --file="$EVIDENCE_DIR/backup.dump" || RESULT=1
fi

if [ "$RESULT" -eq 0 ]; then
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$TARGET_URL" "$EVIDENCE_DIR/backup.dump" || RESULT=1
fi

if [ "$RESULT" -eq 0 ]; then
  END_EPOCH="$(date +%s)"
  RTO_SECONDS=$((END_EPOCH - START_EPOCH))
  RTO_LIMIT_SECONDS=$((RTO_TARGET_MINUTES * 60))
  {
    echo "generated_at=$(date --iso-8601=seconds)"
    echo "rpo_target_minutes=$RPO_TARGET_MINUTES"
    echo "rto_target_minutes=$RTO_TARGET_MINUTES"
    echo "rto_measured_seconds=$RTO_SECONDS"
    echo "backup_sha256=$(sha256sum "$EVIDENCE_DIR/backup.dump" | awk '{print $1}')"
  } > "$EVIDENCE_DIR/result.txt"
  if [ "$RTO_SECONDS" -gt "$RTO_LIMIT_SECONDS" ]; then RESULT=1; fi
fi

if [ "$RESULT" -eq 0 ]; then
  echo "RESTORE_DRILL=PASS evidence=$EVIDENCE_DIR"
else
  echo "RESTORE_DRILL=FAIL evidence=$EVIDENCE_DIR" >&2
fi
exit "$RESULT"
