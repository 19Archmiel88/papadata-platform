-- Forward-only security classification for identity/security tables
-- introduced by migrations 0033 and 0034.
--
-- Historical migrations remain immutable because schema_migrations stores
-- their SHA-256 checksums.

insert into app.table_security_classification (
  table_name,
  scope_class,
  rationale
)
values
  (
    'security_password_reset_tokens',
    'global_internal',
    'Identity-scoped password-reset security state without a tenant key; access is constrained by exact-identity RLS and a narrow SECURITY DEFINER lookup.'
  ),
  (
    'identity_oauth_links',
    'global_internal',
    'Identity-scoped OAuth provider links without a tenant key; access is constrained by exact-user RLS and narrow SECURITY DEFINER lookup functions.'
  ),
  (
    'security_oauth_transactions',
    'global_internal',
    'Short-lived pre-authentication OAuth handshake state intentionally has no tenant key; access is restricted to runtime roles and protected by unguessable single-use expiring state.'
  )
on conflict (table_name) do update
set scope_class = excluded.scope_class,
    rationale = excluded.rationale,
    reviewed_at = now();
