BEGIN;
-- connection_id alone already identifies a unique row (it is the primary
-- key), but a tenant/workspace-scoped composite FK from a scoped child
-- table needs a matching (tenant_id, workspace_id, connection_id) unique
-- target to reference, so a cross-tenant connection_id can't be smuggled
-- into a scoped child row via the single-column FK alone.
ALTER TABLE app.integration_connections
 ADD CONSTRAINT integration_connections_tenant_workspace_connection_key UNIQUE(tenant_id,workspace_id,connection_id);
-- Configuration and append-only operation receipts. No provider credentials here.
CREATE TABLE app.platform_setting_documents (
 tenant_id uuid NOT NULL REFERENCES app.tenants(tenant_id),
 scope_kind text NOT NULL CHECK(scope_kind IN ('self','tenant','workspace')),
 scope_id uuid NOT NULL, section text NOT NULL CHECK(section IN ('profile','organization','workspace','analytics','notifications')),
 workspace_id uuid, user_id uuid REFERENCES app.users(user_id),
 version integer NOT NULL CHECK(version > 0), config_json jsonb NOT NULL CHECK(jsonb_typeof(config_json)='object'),
 updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid NOT NULL REFERENCES app.users(user_id),
 PRIMARY KEY(tenant_id,scope_kind,scope_id,section),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id),
 CHECK((scope_kind='self' AND user_id=scope_id AND workspace_id IS NULL) OR
       (scope_kind='tenant' AND scope_id=tenant_id AND user_id IS NULL AND workspace_id IS NULL) OR
       (scope_kind='workspace' AND scope_id=workspace_id AND user_id IS NULL))
);
CREATE TABLE app.platform_operation_receipts (
 tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, request_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES app.users(user_id), operation text NOT NULL,
 request_hash text NOT NULL, response jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,workspace_id,request_id),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
CREATE TABLE app.integration_sync_scopes (
 tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, connection_id uuid NOT NULL REFERENCES app.integration_connections(connection_id),
 updated_by uuid REFERENCES app.users(user_id), version integer NOT NULL CHECK(version > 0), streams text[] NOT NULL CHECK(cardinality(streams)>0), updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,workspace_id,connection_id), FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id),
 FOREIGN KEY(tenant_id,workspace_id,connection_id) REFERENCES app.integration_connections(tenant_id,workspace_id,connection_id)
);
CREATE TABLE app.data_quality_reviews (
 tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, review_id uuid NOT NULL DEFAULT gen_random_uuid(),
 connection_id uuid NOT NULL REFERENCES app.integration_connections(connection_id), stream text NOT NULL,
 disposition text NOT NULL CHECK(disposition IN ('investigating','accepted_limitation','resolved')),
 note text NOT NULL CHECK(length(note) BETWEEN 10 AND 4000), version integer NOT NULL CHECK(version>0),
 updated_by uuid NOT NULL REFERENCES app.users(user_id), updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,workspace_id,review_id), UNIQUE(tenant_id,workspace_id,connection_id,stream),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id),
 FOREIGN KEY(tenant_id,workspace_id,connection_id) REFERENCES app.integration_connections(tenant_id,workspace_id,connection_id)
);
ALTER TABLE app.memberships ADD COLUMN IF NOT EXISTS operation_version integer NOT NULL DEFAULT 0;
ALTER TABLE app.platform_setting_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.platform_setting_documents FORCE ROW LEVEL SECURITY;
CREATE POLICY platform_setting_scope ON app.platform_setting_documents
 USING(tenant_id::text=app.current_tenant_id() AND
 (scope_kind='tenant' OR (scope_kind='workspace' AND workspace_id::text=app.current_workspace_id()) OR
 (scope_kind='self' AND user_id::text=nullif(current_setting('app.identity_user_id',true),''))))
 WITH CHECK(tenant_id::text=app.current_tenant_id() AND
 (scope_kind='tenant' OR (scope_kind='workspace' AND workspace_id::text=app.current_workspace_id()) OR
 (scope_kind='self' AND user_id::text=nullif(current_setting('app.identity_user_id',true),''))));
DO $$ DECLARE n text; BEGIN
 FOREACH n IN ARRAY ARRAY['platform_operation_receipts','integration_sync_scopes','data_quality_reviews'] LOOP
 EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY',n);
 EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY',n);
 EXECUTE format('CREATE POLICY scoped ON app.%I USING(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id()) WITH CHECK(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id())',n);
 END LOOP;
END $$;
GRANT SELECT,INSERT,UPDATE ON app.platform_setting_documents,app.integration_sync_scopes,app.data_quality_reviews TO papadata_app,papadata_test;
GRANT SELECT,INSERT ON app.platform_operation_receipts TO papadata_app,papadata_test;
CREATE INDEX platform_operation_history_idx ON app.platform_operation_receipts(tenant_id,workspace_id,created_at DESC);
INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
 ('platform_setting_documents','tenant_workspace','Mixed self/tenant/workspace policy; self requires identity_user_id.'),
 ('platform_operation_receipts','tenant_workspace','Atomic replay and change history; no provider session URLs.'),
 ('integration_sync_scopes','tenant_workspace','Versioned synchronization stream selection.'),
 ('data_quality_reviews','tenant_workspace','Manual review dispositions, never synthetic reconciliation results.')
ON CONFLICT(table_name) DO NOTHING;
GRANT SELECT ON app.integration_sync_scopes TO papadata_platform;
COMMIT;
