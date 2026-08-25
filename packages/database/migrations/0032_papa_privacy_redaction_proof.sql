-- PapaData Papa/Lab 506 remediation - FIX 10
-- DLP/redaction before provider + privacy proof.
--
-- This table stores proof that provider input was checked and redacted.
-- It intentionally stores hashes and metadata, not raw user input.

CREATE TABLE IF NOT EXISTS app.assistant_privacy_redaction_events (
  assistant_privacy_redaction_event_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid,
  operation_id text NOT NULL,
  stage text NOT NULL DEFAULT 'pre_provider',
  policy_version text NOT NULL DEFAULT 'papa-dlp-v1',
  raw_input_hash text NOT NULL,
  redacted_input_hash text NOT NULL,
  detected_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  fields_redacted jsonb NOT NULL DEFAULT '[]'::jsonb,
  redaction_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  sample_free boolean NOT NULL DEFAULT true,
  blocked boolean NOT NULL DEFAULT false,
  block_reason text,
  created_by_user_id uuid,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  CONSTRAINT assistant_privacy_redaction_events_stage_valid CHECK (
    stage IN ('pre_provider', 'post_provider', 'export', 'manual_review')
  ),
  CONSTRAINT assistant_privacy_redaction_events_json_valid CHECK (
    jsonb_typeof(detected_categories) = 'array'
    AND jsonb_typeof(fields_redacted) = 'array'
    AND jsonb_typeof(redaction_summary) = 'object'
  ),
  CONSTRAINT assistant_privacy_redaction_events_sample_free CHECK (sample_free = true),
  CONSTRAINT assistant_privacy_redaction_events_no_raw_input CHECK (
    raw_input_hash <> ''
    AND redacted_input_hash <> ''
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_privacy_redaction_events_idempotency_uidx
  ON app.assistant_privacy_redaction_events (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_privacy_redaction_events_thread_idx
  ON app.assistant_privacy_redaction_events (tenant_id, workspace_id, assistant_thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_privacy_redaction_events_operation_idx
  ON app.assistant_privacy_redaction_events (tenant_id, workspace_id, operation_id, stage, created_at DESC);

ALTER TABLE app.assistant_privacy_redaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_privacy_redaction_events FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_privacy_redaction_events'
      AND policyname = 'assistant_privacy_redaction_events_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_privacy_redaction_events_tenant_workspace_scope
      ON app.assistant_privacy_redaction_events
      USING (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      )
      WITH CHECK (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      );
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON app.assistant_privacy_redaction_events TO papadata_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_privacy_redaction_events TO papadata_test;
