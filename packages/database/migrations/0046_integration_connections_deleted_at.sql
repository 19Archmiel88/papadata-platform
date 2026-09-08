-- app.integration_connections has never had a deleted_at column, yet
-- IntegrationConnectionRepository (packages/database/src/production.ts) has
-- always queried and updated `deleted_at` on this table across at least six
-- call sites (listConnections, findConnection, createConnection's uniqueness
-- guard, markConnectionDeleted's soft-delete UPDATE, and the primary
-- inventory source lookup). Every one of those queries would fail with
-- "column deleted_at does not exist" against a real database -- this
-- migration only adds the column the application code already assumed
-- existed.

ALTER TABLE app.integration_connections
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS integration_connections_active_idx
  ON app.integration_connections (tenant_id, workspace_id)
  WHERE deleted_at IS NULL;
