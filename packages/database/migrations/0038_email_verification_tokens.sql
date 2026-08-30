begin;

-- Real email verification, mirroring the password reset token pattern
-- (0033): a single-use, expiring, hashed-at-rest token. Scoped by
-- identity_key the same way app.security_password_reset_tokens is — email
-- verification is identity-scoped, not tenant-scoped, since a user can
-- belong to more than one tenant.
create table if not exists app.security_email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app.identity_users(user_id) on delete cascade,
  identity_key text not null,
  token_hash text not null unique,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists security_email_verification_tokens_user_active_idx
  on app.security_email_verification_tokens (user_id)
  where used_at is null and revoked_at is null;

-- Deliberately NOT force row level security: the pre-auth lookup below is
-- a SECURITY DEFINER function owned by the table owner (papadata_migrator,
-- which does not have BYPASSRLS), and its whole purpose is to find a row
-- by token hash before any identity_key is known. FORCE would strip the
-- owner's normal RLS exemption during that lookup, and since RLS with no
-- app.identity_key set never matches, the lookup would silently return
-- zero rows for every token, always. Runtime access from papadata_app
-- (which is not the table owner) is unaffected either way -- non-forced
-- RLS already fully applies to any role that isn't the owner, so this
-- does not weaken the actual runtime access boundary.
alter table app.security_email_verification_tokens enable row level security;

drop policy if exists security_email_verification_tokens_exact_key
  on app.security_email_verification_tokens;
create policy security_email_verification_tokens_exact_key
  on app.security_email_verification_tokens
  using (identity_key = current_setting('app.identity_key', true))
  with check (identity_key = current_setting('app.identity_key', true));

-- Pre-auth token lookup cannot provide identity RLS context before the
-- token itself has been validated — the token hash IS the proof of
-- identity being established. Keep this narrow lookup behind SECURITY
-- DEFINER, bound to the token hash, and never disclose anything for a
-- token that doesn't match, is expired, used, or revoked.
--
-- Deliberately does NOT join app.identity_users: that table also has
-- FORCE ROW LEVEL SECURITY (migration 0017), which would block this read
-- the same way it blocked this table's own lookup before the FORCE fix
-- above -- the token row already carries identity_key directly, so the
-- caller can fetch the email in a second, properly-scoped query once it
-- has that key (see EmailVerificationRepository.findValidToken).
create or replace function app.lookup_email_verification_token(
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
  from app.security_email_verification_tokens t
  where t.token_hash = p_token_hash
    and t.used_at is null
    and t.revoked_at is null
    and t.expires_at > now();
$$;

revoke all on function app.lookup_email_verification_token(text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'papadata_app') then
    grant execute on function app.lookup_email_verification_token(text) to papadata_app;
    grant select, insert, update on app.security_email_verification_tokens to papadata_app;
  end if;
end
$$;

commit;
