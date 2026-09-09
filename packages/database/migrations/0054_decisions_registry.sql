BEGIN;
CREATE TABLE app.decision_registries (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  document jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id) REFERENCES app.workspaces (tenant_id, workspace_id),
  CHECK (jsonb_typeof(document) = 'object'
    AND jsonb_typeof(document->'decisions') = 'array'
    AND jsonb_typeof(document->'activity') = 'array')
);
ALTER TABLE app.decision_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.decision_registries FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_access ON app.decision_registries FOR ALL
  USING (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())
  WITH CHECK (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id());
GRANT SELECT, INSERT, UPDATE ON app.decision_registries TO papadata_app, papadata_test;
INSERT INTO app.table_security_classification(table_name, scope_class, rationale)
  VALUES ('decision_registries', 'tenant_workspace', 'Versioned manual decisions and their immutable-in-application activity history. Not an external AI execution engine.');
COMMIT;
