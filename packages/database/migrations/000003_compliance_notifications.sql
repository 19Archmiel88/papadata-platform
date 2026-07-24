CREATE TABLE IF NOT EXISTS app.cookie_consents (
  consent_id uuid PRIMARY KEY,
  subject_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES app.users (user_id),
  tenant_id uuid,
  workspace_id uuid,
  categories jsonb NOT NULL,
  version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT cookie_consents_subject_id_not_blank CHECK (length(trim(subject_id)) > 0),
  CONSTRAINT cookie_consents_version_not_blank CHECK (length(trim(version)) > 0),
  CONSTRAINT cookie_consents_necessary_true CHECK ((categories ->> 'necessary')::boolean IS TRUE),
  CONSTRAINT cookie_consents_known_categories CHECK (
    categories ? 'necessary'
    AND categories ? 'preferences'
    AND categories ? 'analytics'
    AND categories ? 'marketing'
  ),
  CONSTRAINT cookie_consents_workspace_requires_tenant CHECK (
    workspace_id IS NULL OR tenant_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS app.legal_documents (
  document_id text PRIMARY KEY,
  document_type text NOT NULL,
  document_version text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL,
  effective_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_type, document_version),
  CONSTRAINT legal_documents_document_type_valid CHECK (
    document_type IN (
      'cookie_policy',
      'data_processing_terms',
      'privacy_notice',
      'terms_of_service'
    )
  ),
  CONSTRAINT legal_documents_document_version_not_blank CHECK (length(trim(document_version)) > 0),
  CONSTRAINT legal_documents_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT legal_documents_body_not_blank CHECK (length(trim(body)) > 0),
  CONSTRAINT legal_documents_status_valid CHECK (status IN ('active', 'superseded'))
);

CREATE UNIQUE INDEX IF NOT EXISTS legal_documents_active_type_idx
  ON app.legal_documents (document_type)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS app.legal_acceptances (
  acceptance_id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app.users (user_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  document_id text NOT NULL REFERENCES app.legal_documents (document_id),
  document_type text NOT NULL,
  document_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id, workspace_id, document_id),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT legal_acceptances_document_type_valid CHECK (
    document_type IN (
      'cookie_policy',
      'data_processing_terms',
      'privacy_notice',
      'terms_of_service'
    )
  ),
  CONSTRAINT legal_acceptances_document_version_not_blank CHECK (length(trim(document_version)) > 0)
);

CREATE TABLE IF NOT EXISTS app.notifications (
  notification_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  recipient_user_id uuid NOT NULL REFERENCES app.users (user_id),
  owner_user_id uuid REFERENCES app.users (user_id),
  notification_type text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  title text NOT NULL,
  message text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT notifications_type_valid CHECK (
    notification_type IN (
      'approval_required',
      'high_returns',
      'inventory_shortage_risk',
      'plan_limit_reached',
      'readiness_blocked',
      'report_ready',
      'stale_data',
      'sync_failed'
    )
  ),
  CONSTRAINT notifications_priority_valid CHECK (priority IN ('critical', 'high', 'medium')),
  CONSTRAINT notifications_status_valid CHECK (status IN ('read', 'unread')),
  CONSTRAINT notifications_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT notifications_message_not_blank CHECK (length(trim(message)) > 0),
  CONSTRAINT notifications_resource_type_not_blank CHECK (length(trim(resource_type)) > 0),
  CONSTRAINT notifications_read_status_consistent CHECK (
    (status = 'read' AND read_at IS NOT NULL)
    OR (status = 'unread' AND read_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS cookie_consents_user_idx
  ON app.cookie_consents (user_id, updated_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS legal_acceptances_user_scope_idx
  ON app.legal_acceptances (user_id, tenant_id, workspace_id, accepted_at DESC);

CREATE INDEX IF NOT EXISTS notifications_recipient_scope_status_idx
  ON app.notifications (recipient_user_id, tenant_id, workspace_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_scope_type_idx
  ON app.notifications (tenant_id, workspace_id, notification_type, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_events_compliance_action_idx
  ON app.audit_events (action, occurred_at DESC)
  WHERE action LIKE 'cookie_consent.%'
    OR action LIKE 'legal.%'
    OR action LIKE 'notification.%';

GRANT SELECT, INSERT, UPDATE ON app.cookie_consents TO papadata_app;
GRANT SELECT ON app.legal_documents TO papadata_app;
GRANT SELECT, INSERT ON app.legal_acceptances TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.notifications TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON app.cookie_consents TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.legal_documents TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.legal_acceptances TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.notifications TO papadata_test;
