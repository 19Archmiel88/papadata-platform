BEGIN;
CREATE TABLE app.billing_checkout_sessions (
 tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, request_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES app.users(user_id), offer_id text NOT NULL,
 request_params jsonb NOT NULL, configuration_hash text NOT NULL, stripe_session_id text, status text NOT NULL CHECK(status IN ('preparing','open','complete','expired')),
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,workspace_id,request_id), UNIQUE(stripe_session_id),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
ALTER TABLE app.billing_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.billing_checkout_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY billing_checkout_scope ON app.billing_checkout_sessions
 USING(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id())
 WITH CHECK(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id());
GRANT SELECT,INSERT,UPDATE ON app.billing_checkout_sessions TO papadata_app,papadata_test;
ALTER TABLE app.workspace_subscriptions ADD COLUMN IF NOT EXISTS provider_checked_at timestamptz;
ALTER TABLE app.workspace_subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean;
ALTER TABLE app.workspace_subscriptions ADD COLUMN IF NOT EXISTS provider_status text;
-- Migration 0050 already enforces unique customer/subscription workspace mappings.
INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
 ('billing_checkout_sessions','tenant_workspace','Server initiated hosted checkouts; no payment credentials or hosted session URLs.')
ON CONFLICT(table_name) DO NOTHING;
CREATE TABLE app.billing_provider_events (
 event_id text PRIMARY KEY, tenant_id uuid NOT NULL, workspace_id uuid NOT NULL,
 subscription_id text NOT NULL, event_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
ALTER TABLE app.billing_provider_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.billing_provider_events FORCE ROW LEVEL SECURITY;
CREATE POLICY billing_provider_event_scope ON app.billing_provider_events
 USING(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id());
GRANT SELECT ON app.billing_provider_events TO papadata_app,papadata_test;
GRANT SELECT,INSERT,UPDATE ON app.workspace_subscriptions,app.billing_checkout_sessions TO papadata_platform;
GRANT SELECT,INSERT ON app.billing_provider_events TO papadata_platform;
INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
 ('billing_provider_events','tenant_workspace','Processed signed Stripe event identifiers; duplicate-safe subscription readback.')
ON CONFLICT(table_name) DO NOTHING;
COMMIT;
