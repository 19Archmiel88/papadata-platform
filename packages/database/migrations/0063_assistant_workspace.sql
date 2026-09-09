BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS assistant_threads_scope_identity_zip4 ON app.assistant_threads(tenant_id,workspace_id,assistant_thread_id);
CREATE TABLE app.assistant_preferences (
 tenant_id uuid NOT NULL,workspace_id uuid NOT NULL,version integer NOT NULL CHECK(version>0),
 history_enabled boolean NOT NULL DEFAULT true,context_days integer NOT NULL CHECK(context_days BETWEEN 1 AND 365),
 memory_enabled boolean NOT NULL DEFAULT false,attachment_enabled boolean NOT NULL DEFAULT false,
 read_tools text[] NOT NULL DEFAULT ARRAY['context','evidence','reports','metrics'],
 updated_by uuid NOT NULL REFERENCES app.users(user_id),updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,workspace_id),FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
CREATE TABLE app.assistant_memory_notes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,workspace_id uuid NOT NULL,user_id uuid NOT NULL REFERENCES app.users(user_id),
 title text NOT NULL,content text NOT NULL CHECK(length(content)<=4000),version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz,
 FOREIGN KEY(tenant_id,workspace_id) REFERENCES app.workspaces(tenant_id,workspace_id)
);
CREATE TABLE app.assistant_text_attachments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,workspace_id uuid NOT NULL,user_id uuid NOT NULL REFERENCES app.users(user_id),
 conversation_id uuid NOT NULL REFERENCES app.assistant_threads(assistant_thread_id),name text NOT NULL,media_type text NOT NULL,bytes integer NOT NULL CHECK(bytes BETWEEN 1 AND 131072),
 sha256 text NOT NULL,content text NOT NULL CHECK(length(content)<=131072),created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL,
 FOREIGN KEY(tenant_id,workspace_id,conversation_id) REFERENCES app.assistant_threads(tenant_id,workspace_id,assistant_thread_id)
);
CREATE TABLE app.assistant_generation_runs (
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL,workspace_id uuid NOT NULL,user_id uuid NOT NULL REFERENCES app.users(user_id),
 conversation_id uuid NOT NULL REFERENCES app.assistant_threads(assistant_thread_id),case_thread_id uuid REFERENCES app.assistant_threads(assistant_thread_id),
 request_hash text NOT NULL,status text NOT NULL CHECK(status IN('queued','running','completed','failed','cancelled','interrupted')),
 reserved_cost_minor integer NOT NULL DEFAULT 0 CHECK(reserved_cost_minor>=0),
 partial_text text NOT NULL DEFAULT '',result jsonb,error_code text,native_streaming boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,workspace_id,conversation_id) REFERENCES app.assistant_threads(tenant_id,workspace_id,assistant_thread_id),
 FOREIGN KEY(tenant_id,workspace_id,case_thread_id) REFERENCES app.assistant_threads(tenant_id,workspace_id,assistant_thread_id)
);
CREATE INDEX assistant_runs_workspace ON app.assistant_generation_runs(tenant_id,workspace_id,status,updated_at);
ALTER TABLE app.assistant_threads ADD COLUMN IF NOT EXISTS archived_at timestamptz;
DO $$ DECLARE n text;BEGIN
 FOREACH n IN ARRAY ARRAY['assistant_preferences','assistant_memory_notes','assistant_text_attachments','assistant_generation_runs'] LOOP
 EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY',n);EXECUTE format('ALTER TABLE app.%I FORCE ROW LEVEL SECURITY',n);
 EXECUTE format('CREATE POLICY scoped ON app.%I USING(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id()) WITH CHECK(tenant_id::text=app.current_tenant_id() AND workspace_id::text=app.current_workspace_id())',n);
 END LOOP;
END $$;
GRANT SELECT,INSERT,UPDATE ON app.assistant_preferences,app.assistant_memory_notes,app.assistant_text_attachments,app.assistant_generation_runs TO papadata_app,papadata_test;
GRANT DELETE ON app.assistant_memory_notes,app.assistant_text_attachments TO papadata_app,papadata_test;
GRANT SELECT,UPDATE,DELETE ON app.assistant_text_attachments,app.assistant_memory_notes,app.assistant_generation_runs TO papadata_platform;
GRANT SELECT ON app.assistant_preferences TO papadata_platform;
INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
 ('assistant_preferences','tenant_workspace','Versioned assistant policy. No external execution toggle.'),
 ('assistant_memory_notes','tenant_workspace','Per-user memory; API always adds the actor filter.'),
 ('assistant_text_attachments','tenant_workspace','Explicit text context, per actor/thread, expiry and size bound.'),
 ('assistant_generation_runs','tenant_workspace','Per-actor generation progress, durable terminal result; no provider keys.')
ON CONFLICT(table_name) DO NOTHING;
COMMIT;
