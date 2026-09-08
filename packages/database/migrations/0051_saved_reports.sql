BEGIN;

CREATE TABLE app.saved_reports (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  report_id text NOT NULL,
  document jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id, report_id),
  FOREIGN KEY (tenant_id, workspace_id) REFERENCES app.workspaces (tenant_id, workspace_id),
  CHECK (jsonb_typeof(document) = 'object' AND document->>'id' = report_id)
);

CREATE TABLE app.saved_report_favorites (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  report_id text NOT NULL,
  user_id text NOT NULL,
  PRIMARY KEY (tenant_id, workspace_id, report_id, user_id),
  FOREIGN KEY (tenant_id, workspace_id, report_id)
    REFERENCES app.saved_reports (tenant_id, workspace_id, report_id) ON DELETE CASCADE
);

CREATE TABLE app.saved_report_previews (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  preview_id uuid NOT NULL,
  user_id text NOT NULL,
  config jsonb NOT NULL,
  snapshot jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, workspace_id, preview_id),
  FOREIGN KEY (tenant_id, workspace_id) REFERENCES app.workspaces (tenant_id, workspace_id)
);
CREATE INDEX saved_report_previews_expiry_idx ON app.saved_report_previews(expires_at);

DO $migration$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['saved_reports', 'saved_report_favorites', 'saved_report_previews'] LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY scoped_access ON app.%I FOR ALL USING (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id()) WITH CHECK (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON app.%I TO papadata_app, papadata_test', table_name);
    INSERT INTO app.table_security_classification(table_name, scope_class, rationale)
      VALUES (table_name, 'tenant_workspace', 'Saved reports and server-issued previews, scoped to the current tenant and workspace.');
  END LOOP;
END $migration$;

COMMIT;
