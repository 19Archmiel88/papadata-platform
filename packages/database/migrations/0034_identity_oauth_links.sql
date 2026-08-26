begin;

-- Real Google/Microsoft OAuth identity linking. The provider only ever
-- confirms an email + subject id here — tenant/workspace/role/capabilities
-- are never stored on this table and are always resolved through the same
-- IdentityRepository/InvitationRepository paths email/password auth uses.
create table if not exists app.identity_oauth_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app.identity_users(user_id) on delete cascade,
  provider text not null check (provider in ('google', 'microsoft')),
  provider_subject_id text not null,
  provider_email text not null,
  linked_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- One provider identity can never silently attach to more than one user.
create unique index if not exists identity_oauth_links_provider_subject_uq
  on app.identity_oauth_links (provider, provider_subject_id);

-- A given user has at most one link per provider; re-linking replaces
-- (delete+insert), never duplicates.
create unique index if not exists identity_oauth_links_user_provider_uq
  on app.identity_oauth_links (user_id, provider);

alter table app.identity_oauth_links enable row level security;
alter table app.identity_oauth_links force row level security;

drop policy if exists identity_oauth_links_exact_user on app.identity_oauth_links;
create policy identity_oauth_links_exact_user on app.identity_oauth_links
  using (user_id::text = current_setting('app.identity_user_id', true))
  with check (user_id::text = current_setting('app.identity_user_id', true));

-- Pre-auth lookup cannot provide identity RLS context before the linked
-- identity has been resolved — that is precisely what this lookup exists
-- to do (login intent: "does this provider subject id already map to a
-- user?"). Keep it behind SECURITY DEFINER and disclose only user_id +
-- identity_key, nothing else, mirroring the invitation/password-reset
-- lookup pattern (migrations 0021/0022/0033).
create or replace function app.lookup_oauth_link(
  p_provider text,
  p_provider_subject_id text
)
returns table (
  user_id uuid,
  identity_key text
)
language sql
stable
security definer
set search_path = app, pg_catalog
as $$
  select u.user_id, u.identity_key
    from app.identity_oauth_links l
    join app.identity_users u on u.user_id = l.user_id
   where l.provider = p_provider
     and l.provider_subject_id = p_provider_subject_id;
$$;

revoke all on function app.lookup_oauth_link(text, text) from public;

-- Narrow pre-auth-safe lookup for the link_account/reauth intents: the BFF
-- forwards an authenticated principal that carries user_id but not
-- identity_key (identity_key is never put in the session/principal token),
-- so this resolves it. Discloses nothing but the identity_key for a given
-- user_id.
create or replace function app.lookup_identity_key_for_user(
  p_user_id uuid
)
returns text
language sql
stable
security definer
set search_path = app, pg_catalog
as $$
  select identity_key from app.identity_users where user_id = p_user_id;
$$;

revoke all on function app.lookup_identity_key_for_user(uuid) from public;

-- Short-lived OAuth handshake state (PKCE verifier, nonce, intent context).
-- Deliberately NOT tenant- or identity-scoped: for the login/register/
-- accept_invitation intents no identity exists yet at auth.oauth.start
-- time, so there is no RLS context to scope by. Security instead comes
-- from: state is a unique, unguessable, single-use random token; every row
-- expires quickly; and the code_verifier never leaves the server (only its
-- derived code_challenge goes into the outbound redirect URL).
--
-- invitation_token is stored RAW (not hashed) so the callback can re-run
-- the same findInvitationByToken(invitationId, token) lookup the
-- password-based accept-invite flow uses, which itself hashes the token
-- to match app.invitations.token_hash. This is consistent with the rest
-- of this table, which already holds the equally sensitive PKCE
-- code_verifier in the clear for the same short, single-use window.
create table if not exists app.security_oauth_transactions (
  id uuid primary key default gen_random_uuid(),
  state text not null unique,
  provider text not null check (provider in ('google', 'microsoft')),
  intent text not null check (intent in ('login', 'register', 'accept_invitation', 'link_account', 'reauth')),
  nonce text not null,
  pkce_code_verifier text not null,
  invitation_id uuid,
  invitation_token text,
  linking_user_id uuid,
  linking_identity_key text,
  -- Only set for link_account/reauth: captured from the authenticated
  -- principal at auth.oauth.start time so the callback can reuse the real
  -- StepUpService (tenant/session-scoped) instead of a parallel mechanism.
  linking_tenant_id uuid,
  linking_session_id text,
  return_to text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index if not exists security_oauth_transactions_expiry_idx
  on app.security_oauth_transactions (expires_at)
  where consumed_at is null;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'papadata_app') then
    grant select, insert, update on app.identity_oauth_links to papadata_app;
    grant execute on function app.lookup_oauth_link(text, text) to papadata_app;
    grant execute on function app.lookup_identity_key_for_user(uuid) to papadata_app;
    grant select, insert, update on app.security_oauth_transactions to papadata_app;
  end if;
end
$$;

commit;
