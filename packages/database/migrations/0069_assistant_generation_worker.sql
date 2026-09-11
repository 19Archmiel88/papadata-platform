BEGIN;

ALTER TABLE app.assistant_generation_runs
  ADD COLUMN IF NOT EXISTS request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  ADD COLUMN IF NOT EXISTS last_heartbeat_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS assistant_generation_runs_lease
  ON app.assistant_generation_runs(tenant_id, workspace_id, status, lease_expires_at)
  WHERE status IN ('queued', 'running', 'interrupted');

COMMENT ON COLUMN app.assistant_generation_runs.request_payload IS
  'Server-created generation inputs required by the durable worker. Never contains provider credentials.';
COMMENT ON COLUMN app.assistant_generation_runs.lease_expires_at IS
  'Worker lease. An expired running run may be reclaimed by a retry of the same BullMQ job.';

COMMIT;
