-- Migration 0023 created app.assistant_context_snapshots with RLS enabled +
-- FORCE and granted papadata_app only SELECT, INSERT. Every later Papa
-- Assistant table (assistant_recommendations/decisions/action_proposals/
-- outcomes in 0026, assistant_lab_experiments in 0027, assistant_cases/
-- assistant_observations fixed in 0052) also grants UPDATE to papadata_app.
-- assistant_context_snapshots was the one table left behind: it went
-- unnoticed because ProductionDatabase.saveSnapshot() (packages/database/
-- src/production.ts) has always used
--   INSERT ... ON CONFLICT (tenant_id, workspace_id, assistant_thread_id,
--     idempotency_key) WHERE idempotency_key IS NOT NULL DO UPDATE ...
-- and Postgres requires UPDATE privilege on the target table for the
-- ON CONFLICT DO UPDATE arm even when no row actually conflicts at runtime
-- -- verified against a real database: papa.context.capture failed with
-- "permission denied for table assistant_context_snapshots" (a table-
-- privilege error, not an RLS rejection; RLS policy/FORCE RLS on this table
-- were already correct and are unchanged here).
--
-- No DELETE grant: nothing in the codebase deletes context snapshot rows,
-- matching the 0052 precedent (assistant_cases/assistant_observations also
-- got no papadata_app DELETE).

GRANT SELECT, INSERT, UPDATE ON
  app.assistant_context_snapshots
TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.assistant_context_snapshots
TO papadata_test;
