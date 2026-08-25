-- PapaData Papa/Lab 506 remediation - FIX 03
-- Domain hardening for AI cases and observations.
--
-- This migration is append-only:
-- - enables/FORCEs RLS for assistant conversation base tables,
-- - creates durable assistant_cases,
-- - creates durable assistant_observations,
-- - keeps tenant/workspace scope at DB level.

ALTER TABLE app.assistant_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_threads FORCE ROW LEVEL SECURITY;

ALTER TABLE app.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE app.assistant_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_evidence FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_threads'
      AND policyname = 'assistant_threads_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_threads_tenant_workspace_scope
      ON app.assistant_threads
      USING (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      )
      WITH CHECK (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_messages'
      AND policyname = 'assistant_messages_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_messages_tenant_workspace_scope
      ON app.assistant_messages
      USING (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      )
      WITH CHECK (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_evidence'
      AND policyname = 'assistant_evidence_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_evidence_tenant_workspace_scope
      ON app.assistant_evidence
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

CREATE TABLE IF NOT EXISTS app.assistant_cases (
  assistant_case_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  parent_thread_id uuid NOT NULL,
  source_element_id text,
  case_type text NOT NULL DEFAULT 'analysis',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'detected',
  owner_user_id uuid,
  title text NOT NULL DEFAULT 'Sprawa Papa',
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  snapshots jsonb NOT NULL DEFAULT '[]'::jsonb,
  hypotheses jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  comments jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  decisions jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcome jsonb,
  created_by_user_id uuid NOT NULL,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (tenant_id, workspace_id, parent_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  CONSTRAINT assistant_cases_type_valid CHECK (
    case_type IN ('analysis', 'anomaly', 'risk', 'opportunity', 'report', 'decision', 'action')
  ),
  CONSTRAINT assistant_cases_severity_valid CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT assistant_cases_status_valid CHECK (
    status IN (
      'detected',
      'triage',
      'analysis',
      'recommendation',
      'approval',
      'dismissed',
      'monitoring',
      'resolved'
    )
  ),
  CONSTRAINT assistant_cases_arrays_valid CHECK (
    jsonb_typeof(metrics) = 'array'
    AND jsonb_typeof(snapshots) = 'array'
    AND jsonb_typeof(hypotheses) = 'array'
    AND jsonb_typeof(evidence) = 'array'
    AND jsonb_typeof(limitations) = 'array'
    AND jsonb_typeof(comments) = 'array'
    AND jsonb_typeof(recommendations) = 'array'
    AND jsonb_typeof(decisions) = 'array'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_cases_thread_scope_uidx
  ON app.assistant_cases (tenant_id, workspace_id, assistant_thread_id);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_cases_idempotency_uidx
  ON app.assistant_cases (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_cases_parent_status_idx
  ON app.assistant_cases (tenant_id, workspace_id, parent_thread_id, status, updated_at DESC);

ALTER TABLE app.assistant_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_cases FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_cases'
      AND policyname = 'assistant_cases_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_cases_tenant_workspace_scope
      ON app.assistant_cases
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

CREATE TABLE IF NOT EXISTS app.assistant_observations (
  assistant_observation_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_case_id uuid,
  content text NOT NULL,
  observation_type text NOT NULL DEFAULT 'manual',
  confidence numeric(4, 3),
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by_user_id uuid NOT NULL,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  CONSTRAINT assistant_observations_content_not_blank CHECK (length(trim(content)) > 0),
  CONSTRAINT assistant_observations_type_valid CHECK (
    observation_type IN ('manual', 'ai', 'system', 'imported')
  ),
  CONSTRAINT assistant_observations_confidence_valid CHECK (
    confidence IS NULL OR confidence BETWEEN 0 AND 1
  ),
  CONSTRAINT assistant_observations_arrays_valid CHECK (
    jsonb_typeof(evidence) = 'array'
    AND jsonb_typeof(limitations) = 'array'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_observations_idempotency_uidx
  ON app.assistant_observations (tenant_id, workspace_id, assistant_thread_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_observations_thread_created_idx
  ON app.assistant_observations (tenant_id, workspace_id, assistant_thread_id, created_at DESC);

ALTER TABLE app.assistant_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_observations FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_observations'
      AND policyname = 'assistant_observations_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_observations_tenant_workspace_scope
      ON app.assistant_observations
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
