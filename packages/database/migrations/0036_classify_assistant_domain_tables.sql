-- Forward-only security classification for Papa Assistant / Laboratory
-- domain tables introduced after migration 0016.
--
-- Existing migrations remain immutable because app.schema_migrations stores
-- their SHA-256 checksums.
--
-- Every table classified here carries tenant_id + workspace_id and is
-- protected by database-enforced tenant/workspace RLS.

do $$
begin
  if to_regclass('app.assistant_context_snapshots') is null
    or to_regclass('app.assistant_cases') is null
    or to_regclass('app.assistant_observations') is null
    or to_regclass('app.assistant_recommendations') is null
    or to_regclass('app.assistant_decisions') is null
    or to_regclass('app.assistant_action_proposals') is null
    or to_regclass('app.assistant_action_approvals') is null
    or to_regclass('app.assistant_outcomes') is null
    or to_regclass('app.assistant_lab_experiments') is null
    or to_regclass('app.assistant_report_definitions') is null
    or to_regclass('app.assistant_report_versions') is null
    or to_regclass('app.assistant_report_exports') is null
    or to_regclass('app.assistant_report_schedules') is null
    or to_regclass('app.assistant_ai_notifications') is null
    or to_regclass('app.assistant_metric_engine_snapshots') is null
    or to_regclass('app.assistant_evidence_provenance') is null
    or to_regclass('app.assistant_ai_answer_contracts') is null
    or to_regclass('app.assistant_provider_governance_events') is null
    or to_regclass('app.assistant_privacy_redaction_events') is null then
    raise exception
      'Migration 0036 requires all Papa Assistant/Laboratory domain tables from migrations 0023-0032';
  end if;
end $$;

insert into app.table_security_classification (
  table_name,
  scope_class,
  rationale
)
values
  (
    'assistant_context_snapshots',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_cases',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_observations',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_recommendations',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_decisions',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_action_proposals',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_action_approvals',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_outcomes',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_lab_experiments',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_report_definitions',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_report_versions',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_report_exports',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_report_schedules',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_ai_notifications',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_metric_engine_snapshots',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_evidence_provenance',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_ai_answer_contracts',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_provider_governance_events',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  ),
  (
    'assistant_privacy_redaction_events',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope with forced row-level security.'
  )
on conflict (table_name) do update
set scope_class = excluded.scope_class,
    rationale = excluded.rationale,
    reviewed_at = now();
