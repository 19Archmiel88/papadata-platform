BEGIN;
CREATE TABLE app.access_company_profiles (
 tenant_id uuid NOT NULL, workspace_id uuid NOT NULL, version integer NOT NULL CHECK(version>0),
 profile jsonb NOT NULL CHECK(jsonb_typeof(profile)='object'),updated_at timestamptz NOT NULL DEFAULT now(),updated_by uuid NOT NULL REFERENCES app.users(user_id),
 PRIMARY KEY(tenant_id,workspace_id),FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
CREATE TABLE app.access_consents (
 tenant_id uuid NOT NULL,workspace_id uuid NOT NULL,user_id uuid NOT NULL REFERENCES app.users(user_id),
 document_id text NOT NULL CHECK(document_id IN('terms','privacy')),document_version text NOT NULL,document_url text NOT NULL,
 accepted_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,workspace_id,user_id,document_id,document_version),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
CREATE TABLE app.access_completions (
 tenant_id uuid NOT NULL,workspace_id uuid NOT NULL,user_id uuid NOT NULL REFERENCES app.users(user_id),
 completed_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,workspace_id,user_id),
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
-- This pre-auth queue stores encrypted addresses and prepared mail payloads; no plaintext tokens.
CREATE TABLE app.access_mail_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),kind text NOT NULL CHECK(kind IN('verify','recover')),
 encrypted_address text NOT NULL,encrypted_payload text,request_digest text NOT NULL UNIQUE,status text NOT NULL DEFAULT 'queued' CHECK(status IN('queued','sending','sent','failed')),
 attempts integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),available_at timestamptz NOT NULL DEFAULT now(),
 error_code text,completed_at timestamptz
);
DO $$ DECLARE n text;BEGIN
 FOREACH n IN ARRAY ARRAY['access_company_profiles','access_consents','access_completions'] LOOP
 EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY',n);EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY',n);
 EXECUTE format('CREATE POLICY scoped ON app.%I USING(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id()) WITH CHECK(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id())',n);
 END LOOP;
END $$;
GRANT SELECT,INSERT,UPDATE ON app.access_company_profiles,app.access_consents,app.access_completions TO papadata_app,papadata_test;
-- Public enqueue has no read privilege. A dedicated platform credential drains the queue.
GRANT INSERT ON app.access_mail_outbox TO papadata_app,papadata_test;
GRANT SELECT(request_digest) ON app.access_mail_outbox TO papadata_app,papadata_test;
GRANT SELECT,UPDATE,DELETE ON app.access_mail_outbox TO papadata_platform;
INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
 ('access_company_profiles','tenant_workspace','Company draft, not registry verification or membership authority.'),
 ('access_consents','tenant_workspace','Versioned acceptance evidence; read scoped to the requesting user in API.'),
 ('access_completions','tenant_workspace','User onboarding completion markers.'),
 ('access_mail_outbox','global_internal','Pre-auth encrypted delivery queue; API can enqueue but not read.')
ON CONFLICT(table_name) DO NOTHING;
COMMIT;
