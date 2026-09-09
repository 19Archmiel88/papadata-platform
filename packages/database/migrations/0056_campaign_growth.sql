BEGIN;
-- PapaData internal budget plans; never provider execution. Additive migration.
CREATE TABLE IF NOT EXISTS app.campaign_budget_plans (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  campaign_key text NOT NULL,
  currency text NOT NULL CHECK(currency ~ '^[A-Z]{3}$' AND currency <> 'XXX'),
  period_from date NOT NULL,
  period_to date NOT NULL CHECK(period_to >= period_from AND period_to - period_from < 366),
  version integer NOT NULL CHECK(version > 0),
  document jsonb NOT NULL CHECK(jsonb_typeof(document)='object' AND (document->>'amount')::numeric > 0 AND (document->>'amount')::numeric <= 1000000000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,workspace_id,plan_id),
  UNIQUE(tenant_id,workspace_id,campaign_key,currency,period_from,period_to),
  FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS app.campaign_budget_plan_events (
  tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, event_id uuid NOT NULL, plan_id uuid NOT NULL,
  request_hash text NOT NULL, document jsonb NOT NULL, response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,workspace_id,event_id),
  FOREIGN KEY(tenant_id,workspace_id,plan_id) REFERENCES app.campaign_budget_plans(tenant_id,workspace_id,plan_id) ON DELETE CASCADE
);
ALTER TABLE app.campaign_budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.campaign_budget_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE app.campaign_budget_plan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.campaign_budget_plan_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS campaign_budget_plans_scope ON app.campaign_budget_plans;
CREATE POLICY campaign_budget_plans_scope ON app.campaign_budget_plans
 USING(tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())
 WITH CHECK(tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id());
DROP POLICY IF EXISTS campaign_budget_plan_events_scope ON app.campaign_budget_plan_events;
CREATE POLICY campaign_budget_plan_events_scope ON app.campaign_budget_plan_events
 USING(tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())
 WITH CHECK(tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id());
GRANT SELECT,INSERT,UPDATE ON app.campaign_budget_plans TO papadata_app,papadata_test;
GRANT SELECT,INSERT ON app.campaign_budget_plan_events TO papadata_app,papadata_test;

ALTER TABLE app.sync_checkpoints DROP CONSTRAINT IF EXISTS sync_checkpoints_stream_valid;
ALTER TABLE app.sync_checkpoints ADD CONSTRAINT sync_checkpoints_stream_valid CHECK(stream IN ('ad_spend','attributed_conversions','ad_creative_performance','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));
ALTER TABLE app.sync_checkpoints DROP CONSTRAINT IF EXISTS sync_checkpoints_ads_stream_valid;
ALTER TABLE app.sync_checkpoints ADD CONSTRAINT sync_checkpoints_ads_stream_valid CHECK(provider_id NOT IN ('google_ads','meta_ads') OR stream IN ('ad_spend','attributed_conversions','ad_creative_performance'));
ALTER TABLE app.sync_checkpoints DROP CONSTRAINT IF EXISTS sync_checkpoints_creative_provider_valid;
ALTER TABLE app.sync_checkpoints ADD CONSTRAINT sync_checkpoints_creative_provider_valid CHECK(stream <> 'ad_creative_performance' OR provider_id IN ('google_ads','meta_ads'));

ALTER TABLE app.source_batches DROP CONSTRAINT IF EXISTS source_batches_stream_valid;
ALTER TABLE app.source_batches ADD CONSTRAINT source_batches_stream_valid CHECK(stream IN ('ad_spend','attributed_conversions','ad_creative_performance','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));
ALTER TABLE app.source_batches DROP CONSTRAINT IF EXISTS source_batches_ads_stream_valid;
ALTER TABLE app.source_batches ADD CONSTRAINT source_batches_ads_stream_valid CHECK(provider_id NOT IN ('google_ads','meta_ads') OR stream IN ('ad_spend','attributed_conversions','ad_creative_performance'));
ALTER TABLE app.source_batches DROP CONSTRAINT IF EXISTS source_batches_creative_provider_valid;
ALTER TABLE app.source_batches ADD CONSTRAINT source_batches_creative_provider_valid CHECK(stream <> 'ad_creative_performance' OR provider_id IN ('google_ads','meta_ads'));

ALTER TABLE app.source_records DROP CONSTRAINT IF EXISTS source_records_stream_valid;
ALTER TABLE app.source_records ADD CONSTRAINT source_records_stream_valid CHECK(stream IN ('ad_spend','attributed_conversions','ad_creative_performance','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));
ALTER TABLE app.source_records DROP CONSTRAINT IF EXISTS source_records_ads_stream_valid;
ALTER TABLE app.source_records ADD CONSTRAINT source_records_ads_stream_valid CHECK(provider_id NOT IN ('google_ads','meta_ads') OR stream IN ('ad_spend','attributed_conversions','ad_creative_performance'));
ALTER TABLE app.source_records DROP CONSTRAINT IF EXISTS source_records_creative_provider_valid;
ALTER TABLE app.source_records ADD CONSTRAINT source_records_creative_provider_valid CHECK(stream <> 'ad_creative_performance' OR provider_id IN ('google_ads','meta_ads'));

ALTER TABLE app.normalized_records DROP CONSTRAINT IF EXISTS normalized_records_stream_valid;
ALTER TABLE app.normalized_records ADD CONSTRAINT normalized_records_stream_valid CHECK(stream IN ('ad_spend','attributed_conversions','ad_creative_performance','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));
ALTER TABLE app.normalized_records DROP CONSTRAINT IF EXISTS normalized_records_ads_stream_valid;
ALTER TABLE app.normalized_records ADD CONSTRAINT normalized_records_ads_stream_valid CHECK(provider_id NOT IN ('google_ads','meta_ads') OR stream IN ('ad_spend','attributed_conversions','ad_creative_performance'));
ALTER TABLE app.normalized_records DROP CONSTRAINT IF EXISTS normalized_records_creative_provider_valid;
ALTER TABLE app.normalized_records ADD CONSTRAINT normalized_records_creative_provider_valid CHECK(stream <> 'ad_creative_performance' OR provider_id IN ('google_ads','meta_ads'));

INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
('campaign_budget_plans','tenant_workspace','Internal versioned campaign plans, not provider limits.'),
('campaign_budget_plan_events','tenant_workspace','Append-only plan history and atomic replay responses.')
ON CONFLICT(table_name) DO UPDATE SET scope_class=EXCLUDED.scope_class,rationale=EXCLUDED.rationale;
CREATE INDEX IF NOT EXISTS campaign_budget_plan_history_idx ON app.campaign_budget_plan_events(tenant_id,workspace_id,plan_id,created_at DESC);
COMMIT;
