CREATE TABLE IF NOT EXISTS app.worker_jobs (
  worker_job_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  job_type text NOT NULL,
  status text NOT NULL,
  attempt integer NOT NULL DEFAULT 0,
  retry_budget integer NOT NULL DEFAULT 3,
  idempotency_key text NOT NULL,
  command_fingerprint text NOT NULL,
  checkpoint text,
  progress_percent integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb,
  error_code text,
  next_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, job_type, idempotency_key, command_fingerprint),
  CONSTRAINT worker_jobs_job_type_valid CHECK (
    job_type IN (
      'email_outbox',
      'sync',
      'backfill',
      'readiness',
      'metric_calculation',
      'reprocessing',
      'notifications',
      'reports',
      'exports',
      'ai_briefings',
      'cleanup',
      'retry',
      'dlq'
    )
  ),
  CONSTRAINT worker_jobs_status_valid CHECK (
    status IN ('cancelled', 'dlq', 'failed', 'queued', 'retry_wait', 'running', 'succeeded')
  ),
  CONSTRAINT worker_jobs_attempt_non_negative CHECK (attempt >= 0),
  CONSTRAINT worker_jobs_retry_budget_positive CHECK (retry_budget > 0),
  CONSTRAINT worker_jobs_progress_valid CHECK (progress_percent BETWEEN 0 AND 100),
  CONSTRAINT worker_jobs_idempotency_key_not_blank CHECK (length(trim(idempotency_key)) > 0),
  CONSTRAINT worker_jobs_command_fingerprint_not_blank CHECK (
    length(trim(command_fingerprint)) > 0
  )
);

CREATE INDEX IF NOT EXISTS worker_jobs_scope_status_idx
  ON app.worker_jobs (tenant_id, workspace_id, status, next_run_at, created_at);

CREATE TABLE IF NOT EXISTS app.worker_dlq_events (
  worker_dlq_event_id uuid PRIMARY KEY,
  worker_job_id uuid NOT NULL REFERENCES app.worker_jobs (worker_job_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  error_code text NOT NULL,
  reason text NOT NULL,
  replay_requested_by_user_id uuid REFERENCES app.users (user_id),
  replayed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT worker_dlq_events_error_code_not_blank CHECK (length(trim(error_code)) > 0),
  CONSTRAINT worker_dlq_events_reason_not_blank CHECK (length(trim(reason)) > 0)
);

CREATE INDEX IF NOT EXISTS worker_dlq_events_scope_idx
  ON app.worker_dlq_events (tenant_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app.email_outbox_messages (
  email_outbox_message_id uuid PRIMARY KEY,
  tenant_id uuid,
  workspace_id uuid,
  recipient_email text NOT NULL,
  purpose text NOT NULL,
  template_key text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  attempt integer NOT NULL DEFAULT 0,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT email_outbox_messages_recipient_not_blank CHECK (length(trim(recipient_email)) > 0),
  CONSTRAINT email_outbox_messages_purpose_not_blank CHECK (length(trim(purpose)) > 0),
  CONSTRAINT email_outbox_messages_status_valid CHECK (
    status IN ('cancelled', 'dlq', 'failed', 'queued', 'retry_wait', 'sent')
  ),
  CONSTRAINT email_outbox_messages_attempt_non_negative CHECK (attempt >= 0)
);

CREATE INDEX IF NOT EXISTS email_outbox_messages_status_idx
  ON app.email_outbox_messages (status, created_at);

CREATE TABLE IF NOT EXISTS app.report_exports (
  report_export_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  report_type text NOT NULL,
  format text NOT NULL,
  status text NOT NULL,
  generated_at timestamptz,
  expires_at timestamptz NOT NULL,
  requested_by_user_id uuid REFERENCES app.users (user_id),
  worker_job_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT report_exports_report_type_not_blank CHECK (length(trim(report_type)) > 0),
  CONSTRAINT report_exports_format_valid CHECK (format IN ('csv', 'json')),
  CONSTRAINT report_exports_status_valid CHECK (
    status IN ('completed', 'failed', 'processing', 'queued')
  )
);

CREATE INDEX IF NOT EXISTS report_exports_scope_status_idx
  ON app.report_exports (tenant_id, workspace_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.report_files (
  report_file_id uuid PRIMARY KEY,
  report_export_id uuid NOT NULL REFERENCES app.report_exports (report_export_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  file_name text NOT NULL,
  storage_uri text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL,
  sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT report_files_file_name_not_blank CHECK (length(trim(file_name)) > 0),
  CONSTRAINT report_files_storage_uri_not_blank CHECK (length(trim(storage_uri)) > 0),
  CONSTRAINT report_files_byte_size_non_negative CHECK (byte_size >= 0),
  CONSTRAINT report_files_sha256_shape CHECK (sha256 ~ '^[a-f0-9]{64}$')
);

CREATE INDEX IF NOT EXISTS report_files_scope_idx
  ON app.report_files (tenant_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_threads (
  assistant_thread_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  title text NOT NULL,
  context jsonb NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES app.users (user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT assistant_threads_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT assistant_threads_context_object CHECK (jsonb_typeof(context) = 'object')
);

CREATE INDEX IF NOT EXISTS assistant_threads_scope_idx
  ON app.assistant_threads (tenant_id, workspace_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_messages (
  assistant_message_id uuid PRIMARY KEY,
  assistant_thread_id uuid NOT NULL REFERENCES app.assistant_threads (assistant_thread_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  confidence numeric(4, 3) NOT NULL,
  limitations text[] NOT NULL DEFAULT ARRAY[]::text[],
  recommendations text[] NOT NULL DEFAULT ARRAY[]::text[],
  refusal_code text,
  audit_reference text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT assistant_messages_role_valid CHECK (role IN ('assistant', 'user')),
  CONSTRAINT assistant_messages_confidence_valid CHECK (confidence BETWEEN 0 AND 1),
  CONSTRAINT assistant_messages_refusal_code_valid CHECK (
    refusal_code IS NULL OR refusal_code IN (
      'INSUFFICIENT_DATA',
      'DATA_NOT_READY',
      'DATA_INVALID',
      'DATA_BLOCKED',
      'STALE_FOR_CURRENT_DECISION',
      'PERMISSION_DENIED',
      'ENTITLEMENT_REQUIRED',
      'OUT_OF_SCOPE',
      'UNSUPPORTED_USE_CASE',
      'EVIDENCE_UNAVAILABLE',
      'CONFLICT_UNRESOLVED',
      'SAFETY_POLICY_BLOCK',
      'PROVIDER_UNAVAILABLE',
      'COST_LIMIT_REACHED',
      'GATE_NOT_SATISFIED',
      'INJECTION_DETECTED'
    )
  ),
  CONSTRAINT assistant_messages_audit_reference_not_blank CHECK (
    length(trim(audit_reference)) > 0
  )
);

CREATE INDEX IF NOT EXISTS assistant_messages_thread_idx
  ON app.assistant_messages (assistant_thread_id, created_at);

CREATE TABLE IF NOT EXISTS app.assistant_evidence (
  assistant_evidence_id uuid PRIMARY KEY,
  assistant_message_id uuid NOT NULL REFERENCES app.assistant_messages (assistant_message_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  metric_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT assistant_evidence_source_type_valid CHECK (
    source_type IN ('dashboard_readiness', 'metric_snapshot')
  ),
  CONSTRAINT assistant_evidence_source_ref_not_blank CHECK (length(trim(source_ref)) > 0)
);

CREATE TABLE IF NOT EXISTS app.assistant_approvals (
  assistant_approval_id uuid PRIMARY KEY,
  assistant_thread_id uuid NOT NULL REFERENCES app.assistant_threads (assistant_thread_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  action_kind text NOT NULL,
  status text NOT NULL,
  scope_preview text[] NOT NULL,
  impact_preview text[] NOT NULL,
  human_actor_user_id uuid NOT NULL REFERENCES app.users (user_id),
  reauthentication_required boolean NOT NULL DEFAULT true,
  approved_at timestamptz,
  revalidated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT assistant_approvals_action_kind_not_blank CHECK (length(trim(action_kind)) > 0),
  CONSTRAINT assistant_approvals_status_valid CHECK (status IN ('approved', 'pending', 'rejected')),
  CONSTRAINT assistant_approvals_scope_preview_not_empty CHECK (
    array_length(scope_preview, 1) > 0
  ),
  CONSTRAINT assistant_approvals_impact_preview_not_empty CHECK (
    array_length(impact_preview, 1) > 0
  )
);

CREATE INDEX IF NOT EXISTS assistant_approvals_scope_idx
  ON app.assistant_approvals (tenant_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app.assistant_audit_events (
  assistant_audit_event_id uuid PRIMARY KEY,
  assistant_thread_id uuid REFERENCES app.assistant_threads (assistant_thread_id),
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  user_id uuid REFERENCES app.users (user_id),
  event_type text NOT NULL,
  result text NOT NULL,
  occurred_at timestamptz NOT NULL,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT assistant_audit_events_event_type_not_blank CHECK (length(trim(event_type)) > 0),
  CONSTRAINT assistant_audit_events_result_valid CHECK (result IN ('denied', 'success'))
);

CREATE INDEX IF NOT EXISTS assistant_audit_events_scope_idx
  ON app.assistant_audit_events (tenant_id, workspace_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS app.billing_subscriptions (
  subscription_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL UNIQUE REFERENCES app.tenants (tenant_id),
  plan_code text NOT NULL,
  status text NOT NULL,
  entitlements text[] NOT NULL,
  cancelled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_subscriptions_plan_code_not_blank CHECK (length(trim(plan_code)) > 0),
  CONSTRAINT billing_subscriptions_status_valid CHECK (
    status IN ('active', 'cancelled', 'past_due', 'pending', 'trial')
  ),
  CONSTRAINT billing_subscriptions_entitlements_not_empty CHECK (
    array_length(entitlements, 1) > 0
  )
);

CREATE TABLE IF NOT EXISTS app.billing_events (
  billing_event_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app.tenants (tenant_id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_events_event_type_valid CHECK (
    event_type IN (
      'subscription_activated',
      'plan_changed',
      'subscription_cancelled',
      'subscription_resumed',
      'payment_pending',
      'payment_failed',
      'payment_recovered',
      'invoice_generated',
      'usage_updated',
      'limit_reached',
      'entitlement_changed'
    )
  ),
  CONSTRAINT billing_events_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS billing_events_tenant_idx
  ON app.billing_events (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app.billing_invoices (
  billing_invoice_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app.tenants (tenant_id),
  amount_due text NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_invoices_amount_due_not_blank CHECK (length(trim(amount_due)) > 0),
  CONSTRAINT billing_invoices_currency_shape CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT billing_invoices_status_valid CHECK (status IN ('open', 'paid'))
);

CREATE TABLE IF NOT EXISTS app.billing_usage_records (
  billing_usage_record_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app.tenants (tenant_id),
  meter_code text NOT NULL,
  quantity text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_usage_records_meter_code_not_blank CHECK (length(trim(meter_code)) > 0),
  CONSTRAINT billing_usage_records_quantity_not_blank CHECK (length(trim(quantity)) > 0)
);

GRANT SELECT, INSERT, UPDATE ON app.worker_jobs TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.worker_dlq_events TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.email_outbox_messages TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.report_exports TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.report_files TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.assistant_threads TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.assistant_messages TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.assistant_evidence TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.assistant_approvals TO papadata_app;
GRANT SELECT, INSERT ON app.assistant_audit_events TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.billing_subscriptions TO papadata_app;
GRANT SELECT, INSERT ON app.billing_events TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.billing_invoices TO papadata_app;
GRANT SELECT, INSERT ON app.billing_usage_records TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON app.worker_jobs TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.worker_dlq_events TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.email_outbox_messages TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.report_exports TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.report_files TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_threads TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_messages TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_evidence TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_approvals TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_audit_events TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.billing_subscriptions TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.billing_events TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.billing_invoices TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.billing_usage_records TO papadata_test;
