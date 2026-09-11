BEGIN;

-- P2-03: assistant_report_exports is the single active report-export lifecycle.
ALTER TABLE app.assistant_report_exports
  ADD COLUMN IF NOT EXISTS report_type text,
  ADD COLUMN IF NOT EXISTS date_from timestamptz,
  ADD COLUMN IF NOT EXISTS date_to timestamptz,
  ADD COLUMN IF NOT EXISTS filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'assistant_report_builder';

ALTER TABLE app.assistant_report_exports
  DROP CONSTRAINT IF EXISTS assistant_report_exports_format_valid;
ALTER TABLE app.assistant_report_exports
  ADD CONSTRAINT assistant_report_exports_format_valid
  CHECK (format IN ('csv', 'json', 'pdf', 'xlsx'));

ALTER TABLE app.assistant_report_exports
  DROP CONSTRAINT IF EXISTS assistant_report_exports_source_valid;
ALTER TABLE app.assistant_report_exports
  ADD CONSTRAINT assistant_report_exports_source_valid
  CHECK (source IN ('assistant_report_builder', 'reports_api', 'legacy_report_requests'));

DO $$
DECLARE
  invalid_scope_count bigint;
BEGIN
  SELECT count(*)
  INTO invalid_scope_count
  FROM app.report_requests
  WHERE tenant_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     OR workspace_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

  IF invalid_scope_count > 0 THEN
    RAISE EXCEPTION 'P2-03 cannot migrate % report_requests rows with non-UUID tenant/workspace scope', invalid_scope_count;
  END IF;
END $$;

INSERT INTO app.assistant_report_exports (
  assistant_report_export_id,
  tenant_id,
  workspace_id,
  assistant_report_definition_id,
  assistant_report_version_id,
  export_scope,
  format,
  status,
  job_id,
  object_key,
  checksum_sha256,
  size_bytes,
  content_type,
  error_code,
  idempotency_key,
  created_by_user_id,
  created_at,
  ready_at,
  expires_at,
  report_type,
  date_from,
  date_to,
  filters,
  source
)
SELECT
  id,
  tenant_id::uuid,
  workspace_id::uuid,
  null,
  null,
  'report',
  format,
  status,
  'legacy-report:' || id::text,
  object_key,
  checksum_sha256,
  size_bytes,
  content_type,
  error_code,
  idempotency_key,
  '00000000-0000-0000-0000-000000000000'::uuid,
  created_at,
  ready_at,
  expires_at,
  report_type,
  date_from,
  date_to,
  filters,
  'legacy_report_requests'
FROM app.report_requests
ON CONFLICT (assistant_report_export_id) DO NOTHING;

COMMENT ON TABLE app.report_requests IS
  'P2-03 legacy frozen archive. New report lifecycle uses app.assistant_report_exports only.';

REVOKE INSERT, UPDATE, DELETE ON app.report_requests FROM papadata_app;
REVOKE INSERT, UPDATE, DELETE ON app.report_requests FROM papadata_platform;

COMMIT;
