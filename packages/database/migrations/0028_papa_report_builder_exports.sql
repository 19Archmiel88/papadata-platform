-- PapaData Papa/Lab 506 remediation - FIX 06
-- Durable report builder + versioning + schedules + CSV/PDF/XLSX exports.
--
-- This migration does not reintroduce browser-generated fake PDF.
-- Exports are represented as backend jobs/artifacts.

CREATE TABLE IF NOT EXISTS app.assistant_report_definitions (
  assistant_report_definition_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_case_id uuid,
  name text NOT NULL,
  description text,
  owner_user_id uuid,
  visibility text NOT NULL DEFAULT 'workspace',
  current_version integer NOT NULL DEFAULT 1,
  metric_selection jsonb NOT NULL DEFAULT '[]'::jsonb,
  metric_snapshot_ref jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  date_range jsonb NOT NULL DEFAULT '{}'::jsonb,
  segmentations jsonb NOT NULL DEFAULT '[]'::jsonb,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  chart_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  ordering jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_tables jsonb NOT NULL DEFAULT '[]'::jsonb,
  comments jsonb NOT NULL DEFAULT '[]'::jsonb,
  schedule jsonb,
  status text NOT NULL DEFAULT 'draft',
  duplicated_from_report_id uuid,
  idempotency_key text,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  FOREIGN KEY (duplicated_from_report_id)
    REFERENCES app.assistant_report_definitions (assistant_report_definition_id),
  CONSTRAINT assistant_report_definitions_visibility_valid CHECK (
    visibility IN ('private', 'workspace', 'tenant')
  ),
  CONSTRAINT assistant_report_definitions_status_valid CHECK (
    status IN ('draft', 'ready', 'archived')
  ),
  CONSTRAINT assistant_report_definitions_json_valid CHECK (
    jsonb_typeof(metric_selection) = 'array'
    AND (
      metric_snapshot_ref IS NULL
      OR jsonb_typeof(metric_snapshot_ref) = 'object'
    )
    AND jsonb_typeof(filters) = 'object'
    AND jsonb_typeof(date_range) = 'object'
    AND jsonb_typeof(segmentations) = 'array'
    AND jsonb_typeof(layout) = 'array'
    AND jsonb_typeof(chart_types) = 'array'
    AND jsonb_typeof(ordering) = 'array'
    AND jsonb_typeof(data_tables) = 'array'
    AND jsonb_typeof(comments) = 'array'
    AND (
      schedule IS NULL
      OR jsonb_typeof(schedule) = 'object'
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_report_definitions_idempotency_uidx
  ON app.assistant_report_definitions (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_report_definitions_case_status_idx
  ON app.assistant_report_definitions (tenant_id, workspace_id, assistant_case_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_report_versions (
  assistant_report_version_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_report_definition_id uuid NOT NULL,
  version integer NOT NULL,
  definition_snapshot jsonb NOT NULL,
  change_note text,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_report_definition_id)
    REFERENCES app.assistant_report_definitions (assistant_report_definition_id),
  CONSTRAINT assistant_report_versions_snapshot_valid CHECK (
    jsonb_typeof(definition_snapshot) = 'object'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_report_versions_unique_version_uidx
  ON app.assistant_report_versions (tenant_id, workspace_id, assistant_report_definition_id, version);

CREATE TABLE IF NOT EXISTS app.assistant_report_exports (
  assistant_report_export_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_report_definition_id uuid,
  assistant_report_version_id uuid,
  export_scope text NOT NULL DEFAULT 'report',
  format text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  job_id text,
  object_key text,
  checksum_sha256 text,
  size_bytes bigint,
  content_type text,
  error_code text,
  idempotency_key text,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ready_at timestamptz,
  expires_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_report_definition_id)
    REFERENCES app.assistant_report_definitions (assistant_report_definition_id),
  FOREIGN KEY (assistant_report_version_id)
    REFERENCES app.assistant_report_versions (assistant_report_version_id),
  CONSTRAINT assistant_report_exports_scope_valid CHECK (
    export_scope IN ('report', 'section', 'table')
  ),
  CONSTRAINT assistant_report_exports_format_valid CHECK (
    format IN ('csv', 'pdf', 'xlsx')
  ),
  CONSTRAINT assistant_report_exports_status_valid CHECK (
    status IN ('queued', 'generating', 'ready', 'failed', 'expired', 'cancelled')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_report_exports_idempotency_uidx
  ON app.assistant_report_exports (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_report_exports_definition_idx
  ON app.assistant_report_exports (tenant_id, workspace_id, assistant_report_definition_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_report_schedules (
  assistant_report_schedule_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_report_definition_id uuid NOT NULL,
  cadence text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Warsaw',
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  export_formats jsonb NOT NULL DEFAULT '["pdf"]'::jsonb,
  next_run_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  idempotency_key text,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_report_definition_id)
    REFERENCES app.assistant_report_definitions (assistant_report_definition_id),
  CONSTRAINT assistant_report_schedules_status_valid CHECK (
    status IN ('active', 'paused', 'cancelled')
  ),
  CONSTRAINT assistant_report_schedules_json_valid CHECK (
    jsonb_typeof(recipients) = 'array'
    AND jsonb_typeof(export_formats) = 'array'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_report_schedules_idempotency_uidx
  ON app.assistant_report_schedules (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

DO $$
DECLARE
  report_table text;
BEGIN
  FOREACH report_table IN ARRAY ARRAY[
    'assistant_report_definitions',
    'assistant_report_versions',
    'assistant_report_exports',
    'assistant_report_schedules'
  ]
  LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', report_table);
    EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY', report_table);

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'app'
        AND tablename = report_table
        AND policyname = report_table || '_tenant_workspace_scope'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON app.%I USING (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true)) WITH CHECK (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true))',
        report_table || '_tenant_workspace_scope',
        report_table
      );
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON
  app.assistant_report_definitions,
  app.assistant_report_versions,
  app.assistant_report_exports,
  app.assistant_report_schedules
TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.assistant_report_definitions,
  app.assistant_report_versions,
  app.assistant_report_exports,
  app.assistant_report_schedules
TO papadata_test;
