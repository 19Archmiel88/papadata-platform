-- Forward-only correction for tables introduced by 0017.
-- Existing migrations remain immutable because app.schema_migrations stores
-- their SHA-256 checksums.

do $$
begin
  if to_regclass('app.identity_users') is null
    or to_regclass('app.identity_memberships') is null
    or to_regclass('app.identity_audit_events') is null
    or to_regclass('app.product_domain_records') is null
    or to_regclass('app.product_domain_events') is null
    or to_regclass('app.webhook_replay_receipts') is null then
    raise exception 'Migration 0018 requires all product convergence tables from migration 0017';
  end if;
end $$;

insert into app.table_security_classification (
  table_name,
  scope_class,
  rationale
)
values
  (
    'identity_users',
    'global_internal',
    'No tenant key; access is constrained by the exact identity-key RLS policy and runtime roles.'
  ),
  (
    'identity_memberships',
    'tenant_workspace',
    'Tenant/workspace keyed membership; access is constrained by the exact identity-user RLS policy.'
  ),
  (
    'identity_audit_events',
    'global_internal',
    'No tenant key; access is constrained by the exact identity-key RLS policy and runtime roles.'
  ),
  (
    'product_domain_records',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope.'
  ),
  (
    'product_domain_events',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope.'
  ),
  (
    'webhook_replay_receipts',
    'tenant_workspace',
    'Database-enforced tenant and workspace scope.'
  )
on conflict (table_name) do update
set scope_class = excluded.scope_class,
    rationale = excluded.rationale,
    reviewed_at = now();
