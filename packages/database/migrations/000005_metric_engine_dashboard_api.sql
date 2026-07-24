CREATE TABLE IF NOT EXISTS app.metric_definitions (
  metric_definition_id uuid PRIMARY KEY,
  metric_code text NOT NULL,
  definition_version text NOT NULL,
  business_definition text NOT NULL,
  formula text NOT NULL,
  required_canonical_facts text[] NOT NULL,
  included_statuses text[] NOT NULL,
  excluded_statuses text[] NOT NULL,
  date_policy text NOT NULL,
  currency_policy text NOT NULL,
  tax_policy text NOT NULL,
  refund_policy text NOT NULL,
  missing_data_policy text NOT NULL,
  readiness_rule text NOT NULL,
  test_vectors jsonb NOT NULL,
  lifecycle_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (metric_code, definition_version),
  CONSTRAINT metric_definitions_metric_code_valid CHECK (
    metric_code IN (
      'ad_spend',
      'aov',
      'available_stock',
      'cost_per_order',
      'cpc',
      'cpm',
      'ctr',
      'days_of_inventory',
      'gross_order_value',
      'inventory_turnover',
      'orders',
      'platform_attributed_conversions',
      'platform_attributed_revenue',
      'product_contribution',
      'product_margin',
      'product_revenue',
      'product_units',
      'return_rate_orders',
      'return_rate_units',
      'return_value',
      'returned_units',
      'revenue_after_refunds',
      'roas',
      'sell_through_rate',
      'stock_value',
      'stockout_risk',
      'units_sold'
    )
  ),
  CONSTRAINT metric_definitions_version_not_blank CHECK (length(trim(definition_version)) > 0),
  CONSTRAINT metric_definitions_business_definition_not_blank CHECK (
    length(trim(business_definition)) > 0
  ),
  CONSTRAINT metric_definitions_formula_not_blank CHECK (length(trim(formula)) > 0),
  CONSTRAINT metric_definitions_required_facts_not_empty CHECK (
    array_length(required_canonical_facts, 1) > 0
  ),
  CONSTRAINT metric_definitions_date_policy_not_blank CHECK (length(trim(date_policy)) > 0),
  CONSTRAINT metric_definitions_currency_policy_not_blank CHECK (
    length(trim(currency_policy)) > 0
  ),
  CONSTRAINT metric_definitions_tax_policy_not_blank CHECK (length(trim(tax_policy)) > 0),
  CONSTRAINT metric_definitions_refund_policy_not_blank CHECK (length(trim(refund_policy)) > 0),
  CONSTRAINT metric_definitions_missing_data_policy_not_blank CHECK (
    length(trim(missing_data_policy)) > 0
  ),
  CONSTRAINT metric_definitions_readiness_rule_not_blank CHECK (
    length(trim(readiness_rule)) > 0
  ),
  CONSTRAINT metric_definitions_test_vectors_array CHECK (jsonb_typeof(test_vectors) = 'array'),
  CONSTRAINT metric_definitions_lifecycle_status_valid CHECK (
    lifecycle_status IN ('active', 'superseded')
  )
);

CREATE TABLE IF NOT EXISTS app.metric_snapshots (
  metric_snapshot_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  metric_code text NOT NULL,
  definition_version text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  currency text,
  value text,
  value_kind text NOT NULL,
  readiness text NOT NULL,
  reason_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  limitations text[] NOT NULL DEFAULT ARRAY[]::text[],
  evidence jsonb NOT NULL,
  input_hash text NOT NULL,
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (metric_code, definition_version)
    REFERENCES app.metric_definitions (metric_code, definition_version),
  CONSTRAINT metric_snapshots_metric_code_valid CHECK (
    metric_code IN (
      'ad_spend',
      'aov',
      'available_stock',
      'cost_per_order',
      'cpc',
      'cpm',
      'ctr',
      'days_of_inventory',
      'gross_order_value',
      'inventory_turnover',
      'orders',
      'platform_attributed_conversions',
      'platform_attributed_revenue',
      'product_contribution',
      'product_margin',
      'product_revenue',
      'product_units',
      'return_rate_orders',
      'return_rate_units',
      'return_value',
      'returned_units',
      'revenue_after_refunds',
      'roas',
      'sell_through_rate',
      'stock_value',
      'stockout_risk',
      'units_sold'
    )
  ),
  CONSTRAINT metric_snapshots_period_valid CHECK (period_start < period_end),
  CONSTRAINT metric_snapshots_currency_valid CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$'),
  CONSTRAINT metric_snapshots_value_kind_valid CHECK (
    value_kind IN ('count', 'money', 'ratio', 'risk', 'units')
  ),
  CONSTRAINT metric_snapshots_readiness_valid CHECK (
    readiness IN ('invalid', 'no_data', 'partial', 'ready', 'stale', 'unavailable')
  ),
  CONSTRAINT metric_snapshots_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT metric_snapshots_input_hash_not_blank CHECK (length(trim(input_hash)) > 0),
  CONSTRAINT metric_snapshots_unpublished_value_consistent CHECK (
    readiness NOT IN ('invalid', 'no_data', 'unavailable')
    OR value IS NULL
  )
);

CREATE INDEX IF NOT EXISTS metric_snapshots_scope_metric_idx
  ON app.metric_snapshots (
    tenant_id,
    workspace_id,
    metric_code,
    period_start,
    period_end,
    generated_at DESC
  );

CREATE INDEX IF NOT EXISTS metric_snapshots_readiness_idx
  ON app.metric_snapshots (tenant_id, workspace_id, readiness, generated_at DESC);

CREATE TABLE IF NOT EXISTS app.reprocess_jobs (
  reprocess_job_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  status text NOT NULL,
  reason text NOT NULL,
  affected_metric_codes text[] NOT NULL,
  requested_by_user_id uuid REFERENCES app.users (user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT reprocess_jobs_status_valid CHECK (
    status IN ('cancelled', 'failed', 'queued', 'running', 'succeeded')
  ),
  CONSTRAINT reprocess_jobs_reason_valid CHECK (
    reason IN ('definition_changed', 'invalid', 'manual', 'source_updated', 'stale')
  ),
  CONSTRAINT reprocess_jobs_affected_metric_codes_not_empty CHECK (
    array_length(affected_metric_codes, 1) > 0
  )
);

CREATE INDEX IF NOT EXISTS reprocess_jobs_scope_status_idx
  ON app.reprocess_jobs (tenant_id, workspace_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.reconciliation_reports (
  reconciliation_report_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  status text NOT NULL,
  metric_codes text[] NOT NULL,
  details jsonb NOT NULL,
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT reconciliation_reports_status_valid CHECK (
    status IN ('matched', 'mismatch')
  ),
  CONSTRAINT reconciliation_reports_metric_codes_not_empty CHECK (
    array_length(metric_codes, 1) > 0
  ),
  CONSTRAINT reconciliation_reports_details_array CHECK (jsonb_typeof(details) = 'array')
);

CREATE INDEX IF NOT EXISTS reconciliation_reports_scope_idx
  ON app.reconciliation_reports (tenant_id, workspace_id, generated_at DESC);

GRANT SELECT, INSERT, UPDATE ON app.metric_definitions TO papadata_app;
GRANT SELECT, INSERT ON app.metric_snapshots TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.reprocess_jobs TO papadata_app;
GRANT SELECT, INSERT ON app.reconciliation_reports TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON app.metric_definitions TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.metric_snapshots TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.reprocess_jobs TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.reconciliation_reports TO papadata_test;
