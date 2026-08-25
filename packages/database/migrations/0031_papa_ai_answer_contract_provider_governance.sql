-- PapaData Papa/Lab 506 remediation - FIX 09
-- AI answer contract + provider governance.
--
-- Structured answer contract:
-- - thesis,
-- - evidence,
-- - confidence,
-- - freshness,
-- - assumptions,
-- - limitations,
-- - risk,
-- - humanRequired,
-- - refusal,
-- - providerMetadata.
--
-- Provider governance:
-- - timeout,
-- - retry,
-- - circuit breaker,
-- - cost,
-- - redaction,
-- - telemetry,
-- - cancellation.

CREATE TABLE IF NOT EXISTS app.assistant_ai_answer_contracts (
  assistant_ai_answer_contract_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_message_id uuid,
  thesis text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric(4, 3),
  freshness jsonb NOT NULL DEFAULT '{}'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_level text NOT NULL DEFAULT 'unknown',
  human_required boolean NOT NULL DEFAULT false,
  refusal jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_guardrails jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id uuid NOT NULL,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_message_id)
    REFERENCES app.assistant_messages (assistant_message_id),
  CONSTRAINT assistant_ai_answer_contracts_thesis_not_blank CHECK (length(trim(thesis)) > 0),
  CONSTRAINT assistant_ai_answer_contracts_confidence_valid CHECK (
    confidence IS NULL OR confidence BETWEEN 0 AND 1
  ),
  CONSTRAINT assistant_ai_answer_contracts_risk_valid CHECK (
    risk_level IN ('unknown', 'low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT assistant_ai_answer_contracts_json_valid CHECK (
    jsonb_typeof(evidence) = 'array'
    AND jsonb_typeof(freshness) = 'object'
    AND jsonb_typeof(assumptions) = 'array'
    AND jsonb_typeof(limitations) = 'array'
    AND jsonb_typeof(refusal) = 'object'
    AND jsonb_typeof(provider_metadata) = 'object'
    AND jsonb_typeof(provider_guardrails) = 'object'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_ai_answer_contracts_idempotency_uidx
  ON app.assistant_ai_answer_contracts (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_ai_answer_contracts_thread_idx
  ON app.assistant_ai_answer_contracts (tenant_id, workspace_id, assistant_thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_ai_answer_contracts_message_idx
  ON app.assistant_ai_answer_contracts (tenant_id, workspace_id, assistant_message_id);

CREATE TABLE IF NOT EXISTS app.assistant_provider_governance_events (
  assistant_provider_governance_event_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid,
  assistant_message_id uuid,
  operation_id text NOT NULL,
  provider_name text NOT NULL DEFAULT 'unknown',
  model_name text,
  request_id text,
  status text NOT NULL DEFAULT 'completed',
  timeout_ms integer,
  retry_count integer NOT NULL DEFAULT 0,
  circuit_breaker_state text NOT NULL DEFAULT 'unknown',
  cost jsonb NOT NULL DEFAULT '{}'::jsonb,
  redaction jsonb NOT NULL DEFAULT '{}'::jsonb,
  telemetry jsonb NOT NULL DEFAULT '{}'::jsonb,
  cancellation jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_code text,
  error_message text,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_message_id)
    REFERENCES app.assistant_messages (assistant_message_id),
  CONSTRAINT assistant_provider_governance_status_valid CHECK (
    status IN ('completed', 'cancelled', 'failed', 'refused', 'timeout')
  ),
  CONSTRAINT assistant_provider_governance_circuit_valid CHECK (
    circuit_breaker_state IN ('closed', 'half_open', 'open', 'unknown')
  ),
  CONSTRAINT assistant_provider_governance_retry_valid CHECK (retry_count >= 0),
  CONSTRAINT assistant_provider_governance_timeout_valid CHECK (
    timeout_ms IS NULL OR timeout_ms > 0
  ),
  CONSTRAINT assistant_provider_governance_json_valid CHECK (
    jsonb_typeof(cost) = 'object'
    AND jsonb_typeof(redaction) = 'object'
    AND jsonb_typeof(telemetry) = 'object'
    AND jsonb_typeof(cancellation) = 'object'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_provider_governance_idempotency_uidx
  ON app.assistant_provider_governance_events (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_provider_governance_thread_idx
  ON app.assistant_provider_governance_events (tenant_id, workspace_id, assistant_thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_provider_governance_operation_idx
  ON app.assistant_provider_governance_events (tenant_id, workspace_id, operation_id, created_at DESC);

ALTER TABLE app.assistant_ai_answer_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_ai_answer_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE app.assistant_provider_governance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_provider_governance_events FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  governance_table text;
BEGIN
  FOREACH governance_table IN ARRAY ARRAY[
    'assistant_ai_answer_contracts',
    'assistant_provider_governance_events'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'app'
        AND tablename = governance_table
        AND policyname = governance_table || '_tenant_workspace_scope'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON app.%I USING (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true)) WITH CHECK (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true))',
        governance_table || '_tenant_workspace_scope',
        governance_table
      );
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON
  app.assistant_ai_answer_contracts,
  app.assistant_provider_governance_events
TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.assistant_ai_answer_contracts,
  app.assistant_provider_governance_events
TO papadata_test;
