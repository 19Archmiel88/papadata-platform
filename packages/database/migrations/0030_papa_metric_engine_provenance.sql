-- PapaData Papa/Lab 506 remediation - FIX 08
-- Metric Engine provenance + grounding metadata.
--
-- This migration makes Papa grounding explicitly carry:
-- - snapshotId,
-- - canonical metric identifiers,
-- - canonical metric references,
-- - filters,
-- - date range,
-- - currency,
-- - timezone,
-- - precision/rounding,
-- - null semantics,
-- - partial data metadata,
-- - data quality,
-- - freshness,
-- - per-evidence provenance.
--
-- It also widens assistant_evidence.source_type so evidence is not flattened
-- into a single fake metric_snapshot type.

ALTER TABLE app.assistant_evidence
  DROP CONSTRAINT IF EXISTS assistant_evidence_source_type_valid;

ALTER TABLE app.assistant_evidence
  ADD CONSTRAINT assistant_evidence_source_type_valid
  CHECK (
    source_type IN (
      'dashboard_readiness',
      'metric_snapshot',
      'metric_engine_snapshot',
      'context_snapshot',
      'chart',
      'table',
      'kpi',
      'integration',
      'recommendation',
      'decision',
      'action',
      'report',
      'notification',
      'manual_note',
      'unknown'
    )
  );

CREATE TABLE IF NOT EXISTS app.assistant_metric_engine_snapshots (
  assistant_metric_snapshot_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_thread_id uuid NOT NULL,
  assistant_context_snapshot_id uuid,
  snapshot_id text NOT NULL,
  source_module text NOT NULL DEFAULT 'papa',
  metric_identifiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  canonical_metric_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  date_range jsonb NOT NULL DEFAULT '{}'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  attribution_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  currency text,
  timezone text,
  precision_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  null_semantics text NOT NULL DEFAULT 'unknown',
  partial_data_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_quality jsonb NOT NULL DEFAULT '{}'::jsonb,
  freshness jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id uuid NOT NULL,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id, assistant_thread_id)
    REFERENCES app.assistant_threads (tenant_id, workspace_id, assistant_thread_id),
  FOREIGN KEY (assistant_context_snapshot_id)
    REFERENCES app.assistant_context_snapshots (assistant_context_snapshot_id),
  CONSTRAINT assistant_metric_engine_snapshots_json_valid CHECK (
    jsonb_typeof(metric_identifiers) = 'array'
    AND jsonb_typeof(canonical_metric_refs) = 'array'
    AND jsonb_typeof(date_range) = 'object'
    AND jsonb_typeof(filters) = 'object'
    AND jsonb_typeof(attribution_context) = 'object'
    AND jsonb_typeof(precision_config) = 'object'
    AND jsonb_typeof(partial_data_metadata) = 'object'
    AND jsonb_typeof(data_quality) = 'object'
    AND jsonb_typeof(freshness) = 'object'
    AND jsonb_typeof(provenance) = 'object'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_metric_engine_snapshots_idempotency_uidx
  ON app.assistant_metric_engine_snapshots (tenant_id, workspace_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS assistant_metric_engine_snapshots_thread_idx
  ON app.assistant_metric_engine_snapshots (tenant_id, workspace_id, assistant_thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_metric_engine_snapshots_snapshot_idx
  ON app.assistant_metric_engine_snapshots (tenant_id, workspace_id, snapshot_id);

CREATE TABLE IF NOT EXISTS app.assistant_evidence_provenance (
  assistant_evidence_provenance_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_evidence_id uuid,
  assistant_metric_snapshot_id uuid,
  source_type text NOT NULL,
  source_id text,
  source_label text,
  source_path text,
  metric_identifier text,
  canonical_metric_ref jsonb,
  freshness_at timestamptz,
  data_quality jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_evidence_id)
    REFERENCES app.assistant_evidence (assistant_evidence_id),
  FOREIGN KEY (assistant_metric_snapshot_id)
    REFERENCES app.assistant_metric_engine_snapshots (assistant_metric_snapshot_id),
  CONSTRAINT assistant_evidence_provenance_source_type_valid CHECK (
    source_type IN (
      'dashboard_readiness',
      'metric_snapshot',
      'metric_engine_snapshot',
      'context_snapshot',
      'chart',
      'table',
      'kpi',
      'integration',
      'recommendation',
      'decision',
      'action',
      'report',
      'notification',
      'manual_note',
      'unknown'
    )
  ),
  CONSTRAINT assistant_evidence_provenance_json_valid CHECK (
    (
      canonical_metric_ref IS NULL
      OR jsonb_typeof(canonical_metric_ref) = 'object'
    )
    AND jsonb_typeof(data_quality) = 'object'
    AND jsonb_typeof(provenance) = 'object'
  )
);

CREATE INDEX IF NOT EXISTS assistant_evidence_provenance_evidence_idx
  ON app.assistant_evidence_provenance (tenant_id, workspace_id, assistant_evidence_id);

CREATE INDEX IF NOT EXISTS assistant_evidence_provenance_metric_snapshot_idx
  ON app.assistant_evidence_provenance (tenant_id, workspace_id, assistant_metric_snapshot_id);

ALTER TABLE app.assistant_metric_engine_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_metric_engine_snapshots FORCE ROW LEVEL SECURITY;

ALTER TABLE app.assistant_evidence_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_evidence_provenance FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  provenance_table text;
BEGIN
  FOREACH provenance_table IN ARRAY ARRAY[
    'assistant_metric_engine_snapshots',
    'assistant_evidence_provenance'
  ]
  LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', provenance_table);
    EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY', provenance_table);

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'app'
        AND tablename = provenance_table
        AND policyname = provenance_table || '_tenant_workspace_scope'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON app.%I USING (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true)) WITH CHECK (tenant_id::text = current_setting(''app.tenant_id'', true) AND workspace_id::text = current_setting(''app.workspace_id'', true))',
        provenance_table || '_tenant_workspace_scope',
        provenance_table
      );
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON
  app.assistant_metric_engine_snapshots,
  app.assistant_evidence_provenance
TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.assistant_metric_engine_snapshots,
  app.assistant_evidence_provenance
TO papadata_test;
