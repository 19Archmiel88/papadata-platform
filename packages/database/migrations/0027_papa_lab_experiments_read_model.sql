-- PapaData Papa/Lab 506 remediation - FIX 05
-- Dedicated read model support for Papa Laboratory experiments.
--
-- Main dedicated read/action handlers are implemented in application code.
-- This migration adds the durable Lab experiment source used by papa.lab.read.

CREATE TABLE IF NOT EXISTS app.assistant_lab_experiments (
  assistant_lab_experiment_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_case_id uuid NOT NULL,
  title text NOT NULL,
  hypothesis text NOT NULL,
  variant_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  baseline jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_outcome jsonb NOT NULL DEFAULT '{}'::jsonb,
  measured_outcome jsonb,
  status text NOT NULL DEFAULT 'draft',
  idempotency_key text,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  CONSTRAINT assistant_lab_experiments_status_valid CHECK (
    status IN ('draft', 'running', 'paused', 'completed', 'cancelled')
  ),
  CONSTRAINT assistant_lab_experiments_json_valid CHECK (
    jsonb_typeof(variant_config) = 'object'
    AND jsonb_typeof(baseline) = 'object'
    AND jsonb_typeof(expected_outcome) = 'object'
    AND (
      measured_outcome IS NULL
      OR jsonb_typeof(measured_outcome) = 'object'
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_lab_experiments_idempotency_uidx
  ON app.assistant_lab_experiments (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_lab_experiments_case_status_idx
  ON app.assistant_lab_experiments (tenant_id, workspace_id, assistant_case_id, status, updated_at DESC);

ALTER TABLE app.assistant_lab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_lab_experiments FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_lab_experiments'
      AND policyname = 'assistant_lab_experiments_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_lab_experiments_tenant_workspace_scope
      ON app.assistant_lab_experiments
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

GRANT SELECT, INSERT, UPDATE ON app.assistant_lab_experiments TO papadata_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_lab_experiments TO papadata_test;
