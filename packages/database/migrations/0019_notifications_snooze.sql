ALTER TABLE app.notifications
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS notifications_recipient_scope_snooze_idx
  ON app.notifications (
    recipient_user_id,
    tenant_id,
    workspace_id,
    snoozed_until,
    created_at DESC
  );

COMMENT ON COLUMN app.notifications.snoozed_until IS
  'Independent temporal suppression state. Read/unread remains orthogonal to snooze.';
