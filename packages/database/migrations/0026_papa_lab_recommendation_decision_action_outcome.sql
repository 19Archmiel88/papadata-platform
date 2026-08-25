-- PapaData Papa/Lab 506 remediation - FIX 04
-- Durable Recommendation -> Decision -> Action -> Outcome chain.
--
-- This migration is append-only and keeps external AI execution disabled
-- until the approved live-action runtime is implemented.

CREATE TABLE IF NOT EXISTS app.assistant_recommendations (
  assistant_recommendation_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_case_id uuid,
  assistant_observation_id uuid,
  source_recommendation_id text,
  title text NOT NULL,
  summary text NOT NULL,
  next_step text,
  risk_level text NOT NULL DEFAULT 'unknown',
  effort_level text NOT NULL DEFAULT 'unknown',
  confidence numeric(4, 3),
  owner_user_id uuid,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  baseline jsonb,
  status text NOT NULL DEFAULT 'proposed',
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  FOREIGN KEY (assistant_observation_id)
    REFERENCES app.assistant_observations (assistant_observation_id),
  CONSTRAINT assistant_recommendations_risk_valid CHECK (
    risk_level IN ('unknown', 'low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT assistant_recommendations_effort_valid CHECK (
    effort_level IN ('unknown', 'low', 'medium', 'high')
  ),
  CONSTRAINT assistant_recommendations_confidence_valid CHECK (
    confidence IS NULL OR confidence BETWEEN 0 AND 1
  ),
  CONSTRAINT assistant_recommendations_status_valid CHECK (
    status IN (
      'proposed',
      'review',
      'accepted',
      'rejected',
      'converted_to_decision',
      'dismissed'
    )
  ),
  CONSTRAINT assistant_recommendations_arrays_valid CHECK (
    jsonb_typeof(evidence_ids) = 'array'
    AND jsonb_typeof(variants) = 'array'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_recommendations_idempotency_uidx
  ON app.assistant_recommendations (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_recommendations_case_status_idx
  ON app.assistant_recommendations (tenant_id, workspace_id, assistant_case_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_decisions (
  assistant_decision_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_case_id uuid,
  assistant_recommendation_id uuid,
  status text NOT NULL DEFAULT 'review',
  decision text NOT NULL,
  rationale text,
  decided_by_user_id uuid,
  baseline jsonb,
  expected_outcome jsonb,
  measured_outcome jsonb,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  FOREIGN KEY (assistant_recommendation_id)
    REFERENCES app.assistant_recommendations (assistant_recommendation_id),
  CONSTRAINT assistant_decisions_status_valid CHECK (
    status IN (
      'review',
      'approved',
      'rejected',
      'scheduled',
      'executing',
      'monitoring',
      'resolved',
      'dismissed'
    )
  ),
  CONSTRAINT assistant_decisions_decision_not_blank CHECK (length(trim(decision)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_decisions_idempotency_uidx
  ON app.assistant_decisions (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_decisions_case_status_idx
  ON app.assistant_decisions (tenant_id, workspace_id, assistant_case_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_action_proposals (
  assistant_action_proposal_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_case_id uuid,
  assistant_decision_id uuid,
  operation_id text NOT NULL,
  target_ref jsonb NOT NULL,
  before_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_after_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  simulation jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'proposed',
  idempotency_key text,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  FOREIGN KEY (assistant_decision_id)
    REFERENCES app.assistant_decisions (assistant_decision_id),
  CONSTRAINT assistant_action_proposals_status_valid CHECK (
    status IN (
      'proposed',
      'validated',
      'approval_required',
      'approved',
      'rejected',
      'blocked',
      'executed',
      'rolled_back'
    )
  ),
  CONSTRAINT assistant_action_proposals_json_valid CHECK (
    jsonb_typeof(target_ref) = 'object'
    AND jsonb_typeof(before_state) = 'object'
    AND jsonb_typeof(proposed_after_state) = 'object'
    AND jsonb_typeof(diff) = 'object'
    AND jsonb_typeof(evidence) = 'array'
    AND jsonb_typeof(simulation) = 'object'
    AND jsonb_typeof(validation) = 'object'
    AND jsonb_typeof(limits) = 'object'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_action_proposals_idempotency_uidx
  ON app.assistant_action_proposals (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_action_proposals_case_status_idx
  ON app.assistant_action_proposals (tenant_id, workspace_id, assistant_case_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_action_approvals (
  assistant_action_approval_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_action_proposal_id uuid,
  operation_id text NOT NULL,
  approval_status text NOT NULL,
  exact_consent text,
  rejection_reason text,
  validation_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_user_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_action_proposal_id)
    REFERENCES app.assistant_action_proposals (assistant_action_proposal_id),
  CONSTRAINT assistant_action_approvals_status_valid CHECK (
    approval_status IN ('validated', 'approved', 'rejected')
  ),
  CONSTRAINT assistant_action_approvals_consent_required CHECK (
    approval_status <> 'approved'
    OR exact_consent IS NOT NULL
    OR assistant_action_proposal_id IS NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_action_approvals_idempotency_uidx
  ON app.assistant_action_approvals (tenant_id, workspace_id, operation_id, idempotency_key);

CREATE TABLE IF NOT EXISTS app.assistant_outcomes (
  assistant_outcome_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_case_id uuid,
  assistant_decision_id uuid,
  assistant_recommendation_id uuid,
  baseline jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_outcome jsonb NOT NULL DEFAULT '{}'::jsonb,
  measured_outcome jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  measured_at timestamptz,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  FOREIGN KEY (assistant_decision_id)
    REFERENCES app.assistant_decisions (assistant_decision_id),
  FOREIGN KEY (assistant_recommendation_id)
    REFERENCES app.assistant_recommendations (assistant_recommendation_id),
  CONSTRAINT assistant_outcomes_status_valid CHECK (
    status IN ('pending', 'monitoring', 'measured', 'resolved', 'dismissed')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_outcomes_idempotency_uidx
  ON app.assistant_outcomes (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

DO $$
DECLARE
  papa_table text;
BEGIN
  FOREACH papa_table IN ARRAY ARRAY[
    'assistant_recommendations',
    'assistant_decisions',
    'assistant_action_proposals',
    'assistant_action_approvals',
    'assistant_outcomes'
  ]
  LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', papa_table);
    EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY', papa_table);

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'app'
        AND tablename = papa_table
        AND policyname = papa_table || '_tenant_workspace_scope'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON app.%I USING (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true)) WITH CHECK (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true))',
        papa_table || '_tenant_workspace_scope',
        papa_table
      );
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON
  app.assistant_recommendations,
  app.assistant_decisions,
  app.assistant_action_proposals,
  app.assistant_action_approvals,
  app.assistant_outcomes
TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.assistant_recommendations,
  app.assistant_decisions,
  app.assistant_action_proposals,
  app.assistant_action_approvals,
  app.assistant_outcomes
TO papadata_test;
