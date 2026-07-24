CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION papadata_migrator;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA app FROM PUBLIC;

GRANT USAGE ON SCHEMA app TO papadata_app;
GRANT USAGE ON SCHEMA app TO papadata_test;

CREATE TABLE IF NOT EXISTS app.schema_migrations (
  version text PRIMARY KEY,
  name text NOT NULL,
  checksum_sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  execution_ms integer NOT NULL,
  applied_by text NOT NULL DEFAULT current_user,
  CONSTRAINT schema_migrations_version_not_blank CHECK (length(trim(version)) > 0),
  CONSTRAINT schema_migrations_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT schema_migrations_checksum_sha256_shape CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT schema_migrations_execution_ms_non_negative CHECK (execution_ms >= 0)
);

CREATE TABLE IF NOT EXISTS app.audit_events (
  event_id uuid PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  tenant_id text,
  workspace_id text,
  actor_type text NOT NULL,
  actor_id text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  operation_id uuid,
  correlation_id text NOT NULL,
  causation_id text,
  contract_version text NOT NULL,
  event_version integer NOT NULL DEFAULT 1,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT audit_events_workspace_requires_tenant CHECK (
    workspace_id IS NULL OR tenant_id IS NOT NULL
  ),
  CONSTRAINT audit_events_actor_type_not_blank CHECK (length(trim(actor_type)) > 0),
  CONSTRAINT audit_events_action_not_blank CHECK (length(trim(action)) > 0),
  CONSTRAINT audit_events_resource_type_not_blank CHECK (length(trim(resource_type)) > 0),
  CONSTRAINT audit_events_correlation_id_not_blank CHECK (length(trim(correlation_id)) > 0),
  CONSTRAINT audit_events_contract_version_not_blank CHECK (length(trim(contract_version)) > 0),
  CONSTRAINT audit_events_event_version_positive CHECK (event_version > 0)
);

CREATE INDEX IF NOT EXISTS audit_events_scope_time_idx
  ON app.audit_events (tenant_id, workspace_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS audit_events_operation_idx
  ON app.audit_events (operation_id)
  WHERE operation_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.outbox_events (
  event_id uuid PRIMARY KEY,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  event_type text NOT NULL,
  event_version integer NOT NULL,
  tenant_id text,
  workspace_id text,
  operation_id uuid NOT NULL,
  correlation_id text NOT NULL,
  causation_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_by text,
  locked_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbox_events_workspace_requires_tenant CHECK (
    workspace_id IS NULL OR tenant_id IS NOT NULL
  ),
  CONSTRAINT outbox_events_aggregate_type_not_blank CHECK (length(trim(aggregate_type)) > 0),
  CONSTRAINT outbox_events_aggregate_id_not_blank CHECK (length(trim(aggregate_id)) > 0),
  CONSTRAINT outbox_events_event_type_not_blank CHECK (length(trim(event_type)) > 0),
  CONSTRAINT outbox_events_event_version_positive CHECK (event_version > 0),
  CONSTRAINT outbox_events_correlation_id_not_blank CHECK (length(trim(correlation_id)) > 0),
  CONSTRAINT outbox_events_attempts_non_negative CHECK (attempts >= 0),
  CONSTRAINT outbox_events_status_valid CHECK (
    status IN ('pending', 'publishing', 'published', 'failed', 'dead_letter')
  )
);

CREATE INDEX IF NOT EXISTS outbox_events_ready_idx
  ON app.outbox_events (status, available_at, created_at)
  WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS outbox_events_scope_idx
  ON app.outbox_events (tenant_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app.processed_events (
  consumer_name text NOT NULL,
  event_id uuid NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  tenant_id text,
  workspace_id text,
  operation_id uuid,
  correlation_id text NOT NULL,
  idempotency_key text,
  result_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (consumer_name, event_id),
  CONSTRAINT processed_events_workspace_requires_tenant CHECK (
    workspace_id IS NULL OR tenant_id IS NOT NULL
  ),
  CONSTRAINT processed_events_consumer_name_not_blank CHECK (length(trim(consumer_name)) > 0),
  CONSTRAINT processed_events_correlation_id_not_blank CHECK (length(trim(correlation_id)) > 0)
);

CREATE INDEX IF NOT EXISTS processed_events_scope_idx
  ON app.processed_events (tenant_id, workspace_id, processed_at DESC);

REVOKE ALL ON ALL TABLES IN SCHEMA app FROM PUBLIC;

GRANT SELECT ON app.schema_migrations TO papadata_app;
GRANT SELECT ON app.schema_migrations TO papadata_test;

GRANT SELECT, INSERT ON app.audit_events TO papadata_app;
GRANT SELECT, INSERT ON app.audit_events TO papadata_test;

GRANT SELECT, INSERT, UPDATE ON app.outbox_events TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.outbox_events TO papadata_test;

GRANT SELECT, INSERT, UPDATE ON app.processed_events TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.processed_events TO papadata_test;
