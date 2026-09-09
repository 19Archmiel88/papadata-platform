-- P0-09 closure: expand app.assistant_cases status/type vocabulary to match
-- docs/specyfikacja-docelowa/26-priorytety-p0/09-watki-spraw-ai.md (DOC-P0-009).
--
-- Status grows from the 8 values 0025 shipped with to the 9 in spec:
-- detected, triaging, needs_data, recommendation_ready, awaiting_approval,
-- actioned, monitoring, resolved, dismissed. Existing rows are backfilled
-- onto the new vocabulary before the CHECK is narrowed (triage/analysis ->
-- triaging, recommendation -> recommendation_ready, approval ->
-- awaiting_approval; detected/dismissed/monitoring/resolved are unchanged),
-- so this is safe both on a fresh database (no rows yet) and one with rows
-- written under the 0025 constraint.
--
-- Type set gains 'data_quality' ("problem jakosci danych" per spec)
-- alongside the existing analysis/anomaly/risk/opportunity/report/decision/
-- action. No backfill needed there: no old value is renamed or removed.

BEGIN;

ALTER TABLE app.assistant_cases
  DROP CONSTRAINT IF EXISTS assistant_cases_status_valid;

-- The migrator owns this table but does not have BYPASSRLS (see 0016/0038/
-- 0040/0042/0061), and assistant_cases has FORCE ROW LEVEL SECURITY (0025).
-- No app.tenant_id/app.workspace_id session vars are set during migration
-- runs, so an ordinary UPDATE here would silently match zero rows under the
-- tenant/workspace policy. Same tight NO FORCE / FORCE bracket as 0061.
ALTER TABLE app.assistant_cases NO FORCE ROW LEVEL SECURITY;

UPDATE app.assistant_cases
  SET status = CASE status
    WHEN 'triage' THEN 'triaging'
    WHEN 'analysis' THEN 'triaging'
    WHEN 'recommendation' THEN 'recommendation_ready'
    WHEN 'approval' THEN 'awaiting_approval'
    ELSE status
  END
  WHERE status IN ('triage', 'analysis', 'recommendation', 'approval');

ALTER TABLE app.assistant_cases FORCE ROW LEVEL SECURITY;

ALTER TABLE app.assistant_cases
  ADD CONSTRAINT assistant_cases_status_valid CHECK (
    status IN (
      'detected',
      'triaging',
      'needs_data',
      'recommendation_ready',
      'awaiting_approval',
      'actioned',
      'monitoring',
      'resolved',
      'dismissed'
    )
  );

ALTER TABLE app.assistant_cases
  DROP CONSTRAINT IF EXISTS assistant_cases_type_valid;

ALTER TABLE app.assistant_cases
  ADD CONSTRAINT assistant_cases_type_valid CHECK (
    case_type IN (
      'analysis',
      'anomaly',
      'risk',
      'opportunity',
      'report',
      'decision',
      'action',
      'data_quality'
    )
  );

COMMIT;
