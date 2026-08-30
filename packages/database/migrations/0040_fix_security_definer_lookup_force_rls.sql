begin;

-- Fixes a real, previously-undiscovered bug in the pre-auth SECURITY
-- DEFINER lookup function introduced by migration 0033
-- (app.lookup_password_reset_token): the underlying token table was
-- created with FORCE ROW LEVEL SECURITY, but the function is SECURITY
-- DEFINER, owned by the table owner (papadata_migrator), which does not
-- have the BYPASSRLS role attribute.
--
-- Without FORCE, Postgres exempts a table's owner from its own RLS
-- policies by default -- which is exactly what this SECURITY DEFINER
-- function relies on to look up a row before any identity_key is known
-- (that is the entire point of a pre-auth lookup). FORCE strips that
-- owner exemption, and since the RLS policy requires app.identity_key to
-- already be set -- which a pre-auth caller cannot do -- the lookup
-- silently matched zero rows for every valid token, always. Password
-- reset token validation was non-functional as a result
-- (password-recovery-request itself was unaffected -- it doesn't go
-- through this function).
--
-- That alone is not sufficient, though: the function also joined
-- app.identity_users to fetch normalized_email, and that table separately
-- has its own FORCE ROW LEVEL SECURITY (migration 0017) which blocks the
-- exact same owner-exemption for that join, independent of this table's
-- own FORCE setting. Rather than also weakening identity_users' RLS
-- posture, the function is rewritten below to return only
-- user_id/identity_key/expires_at (all present on this table already);
-- the caller fetches the email in a second, properly identity-scoped
-- query once it has identity_key (see
-- PasswordResetRepository.findValidToken).
--
-- Runtime access from papadata_app is unaffected by the FORCE change:
-- papadata_app is not the table owner, so non-forced RLS already fully
-- applies to it regardless of FORCE. This only restores the table
-- owner's (migrator's) standard RLS exemption, which is what the
-- SECURITY DEFINER lookup function was always designed to run under.
alter table app.security_password_reset_tokens no force row level security;

-- CREATE OR REPLACE cannot change a function's OUT-parameter row type
-- (dropping the normalized_email column below), so the old signature must
-- be dropped first.
drop function if exists app.lookup_password_reset_token(text);

create function app.lookup_password_reset_token(
  p_token_hash text
)
returns table (
  user_id uuid,
  identity_key text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = app, pg_catalog
as $$
  select
    t.user_id,
    t.identity_key,
    t.expires_at
  from app.security_password_reset_tokens t
  where t.token_hash = p_token_hash
    and t.used_at is null
    and t.revoked_at is null
    and t.expires_at > now();
$$;

revoke all on function app.lookup_password_reset_token(text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'papadata_app') then
    grant execute on function app.lookup_password_reset_token(text) to papadata_app;
  end if;
end
$$;

commit;
