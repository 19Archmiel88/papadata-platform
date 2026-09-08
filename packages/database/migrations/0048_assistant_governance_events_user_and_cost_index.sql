-- app.assistant_provider_governance_events tracks provider cost per
-- (tenant, workspace) but never per user -- there is no way to sum a single
-- user's AI spend without this column, which blocks any real per-user AI
-- budget (AiBudgetGuard was workspace-only and unwired; see
-- packages/ai-runtime/src/index.ts). generatePapaAnswer already knows the
-- calling user at write time, so this only needed a column to land in.

ALTER TABLE app.assistant_provider_governance_events
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES app.users (user_id);

CREATE INDEX IF NOT EXISTS assistant_provider_governance_events_user_cost_idx
  ON app.assistant_provider_governance_events (tenant_id, workspace_id, created_by_user_id, created_at);

CREATE INDEX IF NOT EXISTS assistant_provider_governance_events_workspace_cost_idx
  ON app.assistant_provider_governance_events (tenant_id, workspace_id, created_at);
