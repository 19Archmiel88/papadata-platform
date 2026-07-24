CREATE TABLE IF NOT EXISTS app.users (
  user_id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  email_verified boolean NOT NULL DEFAULT false,
  mfa_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_not_blank CHECK (length(trim(email)) > 0),
  CONSTRAINT users_full_name_not_blank CHECK (length(trim(full_name)) > 0),
  CONSTRAINT users_status_valid CHECK (status IN ('active', 'locked'))
);

CREATE TABLE IF NOT EXISTS app.tenants (
  tenant_id uuid PRIMARY KEY,
  created_by_user_id uuid NOT NULL REFERENCES app.users (user_id),
  name text NOT NULL,
  status text NOT NULL,
  entitlements jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_code_hash text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tenants_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT tenants_status_valid CHECK (status IN ('pending_verification', 'active', 'blocked'))
);

CREATE TABLE IF NOT EXISTS app.workspaces (
  workspace_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app.tenants (tenant_id),
  created_by_user_id uuid NOT NULL REFERENCES app.users (user_id),
  name text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id),
  CONSTRAINT workspaces_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT workspaces_status_valid CHECK (status IN ('active', 'blocked', 'archived'))
);

CREATE TABLE IF NOT EXISTS app.memberships (
  membership_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES app.users (user_id),
  role text NOT NULL,
  status text NOT NULL,
  data_scope text NOT NULL,
  jit_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, user_id),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT memberships_role_valid CHECK (
    role IN (
      'Tenant Owner',
      'Workspace Admin',
      'Analyst',
      'Marketing Operator',
      'Viewer',
      'Billing Admin',
      'Auditor/Security',
      'Internal Support/Operations'
    )
  ),
  CONSTRAINT memberships_status_valid CHECK (status IN ('active', 'blocked', 'invited', 'revoked')),
  CONSTRAINT memberships_data_scope_valid CHECK (
    data_scope IN (
      'tenant',
      'workspace',
      'assigned_workspace',
      'billing',
      'audit',
      'support_jit',
      'none'
    )
  ),
  CONSTRAINT memberships_jit_only_for_support CHECK (
    jit_expires_at IS NULL OR role = 'Internal Support/Operations'
  )
);

CREATE TABLE IF NOT EXISTS app.invitations (
  invitation_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  status text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invited_by_user_id uuid NOT NULL REFERENCES app.users (user_id),
  accepted_by_user_id uuid REFERENCES app.users (user_id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz NOT NULL,
  resend_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT invitations_email_not_blank CHECK (length(trim(email)) > 0),
  CONSTRAINT invitations_role_valid CHECK (
    role IN (
      'Tenant Owner',
      'Workspace Admin',
      'Analyst',
      'Marketing Operator',
      'Viewer',
      'Billing Admin',
      'Auditor/Security',
      'Internal Support/Operations'
    )
  ),
  CONSTRAINT invitations_status_valid CHECK (status IN ('pending', 'accepted', 'revoked')),
  CONSTRAINT invitations_resend_count_non_negative CHECK (resend_count >= 0)
);

CREATE TABLE IF NOT EXISTS app.onboarding_states (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  company text NOT NULL DEFAULT 'not_started',
  business_profile text NOT NULL DEFAULT 'not_started',
  platform text NOT NULL DEFAULT 'not_started',
  data_sources text NOT NULL DEFAULT 'not_started',
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT onboarding_states_company_valid CHECK (company IN ('not_started', 'completed')),
  CONSTRAINT onboarding_states_business_profile_valid CHECK (business_profile IN ('not_started', 'completed')),
  CONSTRAINT onboarding_states_platform_valid CHECK (platform IN ('not_started', 'completed')),
  CONSTRAINT onboarding_states_data_sources_valid CHECK (data_sources IN ('not_started', 'completed'))
);

CREATE TABLE IF NOT EXISTS app.company_profiles (
  tenant_id uuid PRIMARY KEY REFERENCES app.tenants (tenant_id),
  company_name text NOT NULL,
  legal_name text NOT NULL,
  tax_id text NOT NULL,
  country text NOT NULL,
  website text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_profiles_company_name_not_blank CHECK (length(trim(company_name)) > 0),
  CONSTRAINT company_profiles_legal_name_not_blank CHECK (length(trim(legal_name)) > 0)
);

CREATE TABLE IF NOT EXISTS app.business_profiles (
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  sales_model text NOT NULL,
  primary_market text NOT NULL,
  average_order_value_band text NOT NULL,
  currency text NOT NULL,
  timezone text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT business_profiles_currency_shape CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT business_profiles_timezone_not_blank CHECK (length(trim(timezone)) > 0)
);

CREATE INDEX IF NOT EXISTS tenants_status_idx
  ON app.tenants (status);

CREATE INDEX IF NOT EXISTS workspaces_tenant_status_idx
  ON app.workspaces (tenant_id, status);

CREATE INDEX IF NOT EXISTS memberships_user_scope_idx
  ON app.memberships (user_id, tenant_id, workspace_id, status);

CREATE INDEX IF NOT EXISTS invitations_scope_status_idx
  ON app.invitations (tenant_id, workspace_id, status, expires_at);

REVOKE ALL ON ALL TABLES IN SCHEMA app FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON app.users TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.tenants TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.workspaces TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.memberships TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.invitations TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.onboarding_states TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.company_profiles TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.business_profiles TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON app.users TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.tenants TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.workspaces TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.memberships TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.invitations TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.onboarding_states TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.company_profiles TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.business_profiles TO papadata_test;
