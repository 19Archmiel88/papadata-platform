BEGIN;
CREATE TABLE IF NOT EXISTS app.support_ticket_commands (
 tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, ticket_id uuid NOT NULL,
 request_id uuid NOT NULL, request_hash text NOT NULL, response jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,workspace_id,request_id),
 FOREIGN KEY(tenant_id,workspace_id,ticket_id) REFERENCES app.support_tickets(tenant_id,workspace_id,ticket_id) ON DELETE CASCADE,
 CHECK(jsonb_typeof(response)='object')
);
CREATE INDEX IF NOT EXISTS support_ticket_commands_history ON app.support_ticket_commands(tenant_id,workspace_id,ticket_id,created_at);
ALTER TABLE app.support_ticket_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.support_ticket_commands FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS scoped_access ON app.support_ticket_commands;
CREATE POLICY scoped_access ON app.support_ticket_commands FOR ALL
 USING(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id())
 WITH CHECK(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id());
GRANT SELECT,INSERT ON app.support_ticket_commands TO papadata_app,papadata_test;
INSERT INTO app.table_security_classification(table_name,scope_class,rationale)
 VALUES('support_ticket_commands','tenant_workspace','Scoped support replies and state transitions; immutable command receipts, versioned writes, no external calendar or delivery claims.')
 ON CONFLICT(table_name) DO UPDATE SET scope_class=EXCLUDED.scope_class,rationale=EXCLUDED.rationale;
COMMIT;
