BEGIN;
CREATE TABLE app.support_tickets (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  ticket_id uuid NOT NULL,
  request_hash text NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES app.users(user_id),
  document jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id, ticket_id),
  FOREIGN KEY (tenant_id, workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id),
  CHECK (jsonb_typeof(document) = 'object')
);
ALTER TABLE app.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.support_tickets FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_access ON app.support_tickets FOR ALL
  USING (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())
  WITH CHECK (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id());
GRANT SELECT, INSERT, UPDATE ON app.support_tickets TO papadata_app, papadata_test;
INSERT INTO app.table_security_classification(table_name,scope_class,rationale)
  VALUES('support_tickets','tenant_workspace','Support requests shared inside a workspace; context allowlisted, consultation request does not reserve a time slot.');
COMMIT;
