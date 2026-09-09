BEGIN;
-- The migrator owns this table but does not have BYPASSRLS. Take the DDL lock,
-- temporarily allow the owner to clean historical replay payloads, then restore
-- FORCE RLS in this same transaction. No application-role policy is changed.
ALTER TABLE app.command_executions NO FORCE ROW LEVEL SECURITY;
UPDATE app.command_executions
 SET response_body='{"assuranceResponseNotPersisted":true}'::jsonb
 WHERE (operation_id LIKE 'security.mfa.%' OR operation_id='security.step-up.issue')
   AND response_body IS NOT NULL;
ALTER TABLE app.command_executions FORCE ROW LEVEL SECURITY;
COMMIT;
