BEGIN;

CREATE TABLE app.mobile_pairing_tokens (
  mobile_pairing_token_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  token_hash text NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  created_by_user_id uuid NOT NULL REFERENCES app.users(user_id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mobile_pairing_token_scope_fk FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces(tenant_id, workspace_id),
  CONSTRAINT mobile_pairing_token_hash_unique UNIQUE (tenant_id, workspace_id, token_hash)
);

CREATE TABLE app.mobile_devices (
  mobile_device_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES app.users(user_id),
  device_external_id text NOT NULL CHECK (length(device_external_id) BETWEEN 1 AND 200),
  display_name text NOT NULL CHECK (length(display_name) BETWEEN 1 AND 200),
  platform text NOT NULL CHECK (platform IN ('ios','android','other')),
  paired_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CONSTRAINT mobile_device_scope_fk FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces(tenant_id, workspace_id),
  CONSTRAINT mobile_device_external_unique UNIQUE (tenant_id, workspace_id, device_external_id)
);

CREATE INDEX mobile_pairing_tokens_open_idx
  ON app.mobile_pairing_tokens (tenant_id, workspace_id, expires_at)
  WHERE used_at IS NULL AND revoked_at IS NULL;

CREATE INDEX mobile_devices_user_idx
  ON app.mobile_devices (tenant_id, workspace_id, user_id, paired_at DESC);

ALTER TABLE app.mobile_pairing_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.mobile_pairing_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE app.mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.mobile_devices FORCE ROW LEVEL SECURITY;

CREATE POLICY mobile_pairing_tokens_scoped ON app.mobile_pairing_tokens
  USING (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())
  WITH CHECK (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id());

CREATE POLICY mobile_devices_scoped ON app.mobile_devices
  USING (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id())
  WITH CHECK (tenant_id::text = app.current_tenant_id() AND workspace_id::text = app.current_workspace_id());

GRANT SELECT, INSERT, UPDATE ON app.mobile_pairing_tokens, app.mobile_devices TO papadata_app, papadata_test;
GRANT SELECT, UPDATE, DELETE ON app.mobile_pairing_tokens, app.mobile_devices TO papadata_platform;

INSERT INTO app.table_security_classification(table_name, scope_class, rationale) VALUES
  ('mobile_pairing_tokens', 'tenant_workspace', 'Hashed one-time mobile pairing challenges. Raw tokens are never persisted.'),
  ('mobile_devices', 'tenant_workspace', 'Paired owner devices scoped by tenant/workspace and user.')
ON CONFLICT(table_name) DO NOTHING;

COMMIT;
