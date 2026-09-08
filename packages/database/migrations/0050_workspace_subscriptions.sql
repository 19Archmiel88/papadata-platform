-- Real, server-owned billing state. Until this table existed, "current
-- plan" for the billing.* operations (contract-runtime.service.ts) was
-- read straight from a caller-supplied `?plan=` query parameter -- any
-- authenticated caller could request `?plan=scale` and receive Scale-tier
-- entitlements regardless of what the workspace actually pays for. This
-- table is the source of truth a Stripe webhook handler (still gated on
-- real Stripe credentials this environment doesn't have) will update; every
-- workspace defaults to 'starter'/'trialing' until a real subscription
-- event says otherwise.

CREATE TABLE IF NOT EXISTS app.workspace_subscriptions (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  plan_id text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'trialing',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT workspace_subscriptions_plan_valid CHECK (
    plan_id IN ('starter', 'growth', 'scale')
  ),
  CONSTRAINT workspace_subscriptions_status_valid CHECK (
    status IN ('trialing', 'active', 'past_due', 'canceled')
  ),
  CONSTRAINT workspace_subscriptions_stripe_customer_unique UNIQUE (stripe_customer_id),
  CONSTRAINT workspace_subscriptions_stripe_subscription_unique UNIQUE (stripe_subscription_id)
);

ALTER TABLE app.workspace_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.workspace_subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_subscriptions_canonical_scope_policy
  ON app.workspace_subscriptions;
CREATE POLICY workspace_subscriptions_canonical_scope_policy
  ON app.workspace_subscriptions
  AS PERMISSIVE
  FOR ALL
  USING (
    tenant_id::text = app.current_tenant_id()
    AND (
      app.current_workspace_id() IS NULL
      OR workspace_id::text = app.current_workspace_id()
    )
  )
  WITH CHECK (
    tenant_id::text = app.current_tenant_id()
    AND (
      app.current_workspace_id() IS NULL
      OR workspace_id::text = app.current_workspace_id()
    )
  );

DROP POLICY IF EXISTS workspace_subscriptions_scope_restriction
  ON app.workspace_subscriptions;
CREATE POLICY workspace_subscriptions_scope_restriction
  ON app.workspace_subscriptions
  AS RESTRICTIVE
  FOR ALL
  USING (
    tenant_id::text = app.current_tenant_id()
    AND (
      app.current_workspace_id() IS NULL
      OR workspace_id::text = app.current_workspace_id()
    )
  )
  WITH CHECK (
    tenant_id::text = app.current_tenant_id()
    AND (
      app.current_workspace_id() IS NULL
      OR workspace_id::text = app.current_workspace_id()
    )
  );

INSERT INTO app.table_security_classification (table_name, scope_class, rationale)
VALUES (
  'workspace_subscriptions',
  'tenant_workspace',
  'Server-owned billing/subscription state per workspace; RLS-scoped like every other tenant_workspace table, never trusts a client-supplied plan.'
)
ON CONFLICT (table_name) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON app.workspace_subscriptions TO papadata_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.workspace_subscriptions TO papadata_test;
