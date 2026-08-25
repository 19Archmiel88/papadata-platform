-- PapaData Papa/Lab 506 remediation - FIX 07
-- AI notifications:
-- - category ai,
-- - severity,
-- - case relation,
-- - deep links,
-- - deduplication,
-- - read/unread,
-- - snooze/unsnooze,
-- - critical notifications cannot be snoozed.

CREATE TABLE IF NOT EXISTS app.assistant_ai_notifications (
  assistant_ai_notification_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  assistant_case_id uuid,
  case_thread_id uuid,
  source_object_type text NOT NULL,
  source_object_id text NOT NULL,
  category text NOT NULL DEFAULT 'ai',
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  message text NOT NULL,
  deep_link text NOT NULL,
  deduplication_key text NOT NULL,
  read_at timestamptz,
  snoozed_until timestamptz,
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  FOREIGN KEY (assistant_case_id)
    REFERENCES app.assistant_cases (assistant_case_id),
  CONSTRAINT assistant_ai_notifications_category_valid CHECK (category = 'ai'),
  CONSTRAINT assistant_ai_notifications_severity_valid CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT assistant_ai_notifications_deep_link_not_blank CHECK (length(trim(deep_link)) > 0),
  CONSTRAINT assistant_ai_notifications_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT assistant_ai_notifications_message_not_blank CHECK (length(trim(message)) > 0),
  CONSTRAINT assistant_ai_notifications_critical_no_snooze CHECK (
    severity <> 'critical'
    OR snoozed_until IS NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assistant_ai_notifications_dedup_uidx
  ON app.assistant_ai_notifications (tenant_id, workspace_id, deduplication_key);

CREATE INDEX IF NOT EXISTS assistant_ai_notifications_case_idx
  ON app.assistant_ai_notifications (tenant_id, workspace_id, assistant_case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_ai_notifications_thread_idx
  ON app.assistant_ai_notifications (tenant_id, workspace_id, case_thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_ai_notifications_status_idx
  ON app.assistant_ai_notifications (tenant_id, workspace_id, severity, read_at, snoozed_until, created_at DESC);

ALTER TABLE app.assistant_ai_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistant_ai_notifications FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'app'
      AND tablename = 'assistant_ai_notifications'
      AND policyname = 'assistant_ai_notifications_tenant_workspace_scope'
  ) THEN
    CREATE POLICY assistant_ai_notifications_tenant_workspace_scope
      ON app.assistant_ai_notifications
      USING (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      )
      WITH CHECK (
        tenant_id::text = current_setting('app.tenant_id', true)
        AND workspace_id::text = current_setting('app.workspace_id', true)
      );
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON app.assistant_ai_notifications TO papadata_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.assistant_ai_notifications TO papadata_test;
