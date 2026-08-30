-- Forward-only security classification for the email-verification-token
-- table introduced by migration 0038 (see 0035 for the identical pattern
-- used for security_password_reset_tokens/identity_oauth_links).
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
    'security_email_verification_tokens',
    'global_internal',
    'Identity-scoped email-verification security state without a tenant key; access is constrained by exact-identity RLS and a narrow SECURITY DEFINER lookup.'
  )
on conflict (table_name) do update
set scope_class = excluded.scope_class,
    rationale = excluded.rationale,
    reviewed_at = now();
