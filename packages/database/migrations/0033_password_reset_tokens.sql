begin;

-- Real password reset, mirroring the invitation token pattern
-- (0021/0022): a single-use, expiring, hashed-at-rest token. Scoped by
-- identity_key the same way app.identity_audit_events is — a password
-- reset is identity-scoped, not tenant-scoped, since a user can belong to
-- more than one tenant.
create table if not exists app.security_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app.identity_users(user_id) on delete cascade,
  identity_key text not null,
  token_hash text not null unique,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists security_password_reset_tokens_user_active_idx
  on app.security_password_reset_tokens (user_id)
  where used_at is null and revoked_at is null;

alter table app.security_password_reset_tokens enable row level security;
alter table app.security_password_reset_tokens force row level security;

drop policy if exists security_password_reset_tokens_exact_key
  on app.security_password_reset_tokens;
create policy security_password_reset_tokens_exact_key
  on app.security_password_reset_tokens
  using (identity_key = current_setting('app.identity_key', true))
  with check (identity_key = current_setting('app.identity_key', true));

-- Pre-auth token lookup cannot provide identity RLS context before the
-- token itself has been validated — the token hash IS the proof of
-- identity being established. Keep this narrow lookup behind SECURITY
-- DEFINER, bound to the token hash, and never disclose anything for a
-- token that doesn't match, is expired, used, or revoked.
create or replace function app.lookup_password_reset_token(
  p_token_hash text
)
returns table (
  user_id uuid,
  identity_key text,
  normalized_email text,
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
    u.normalized_email,
    t.expires_at
  from app.security_password_reset_tokens t
  join app.identity_users u on u.user_id = t.user_id
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
    grant select, insert, update on app.security_password_reset_tokens to papadata_app;
  end if;
end
$$;

commit;
