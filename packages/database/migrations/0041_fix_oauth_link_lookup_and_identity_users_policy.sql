begin;

-- Fixes the same class of bug as migration 0040, for the two OAuth
-- SECURITY DEFINER lookup functions from migration 0034
-- (app.lookup_oauth_link, app.lookup_identity_key_for_user): both read
-- app.identity_users, which has FORCE ROW LEVEL SECURITY (migration
-- 0017), silently returning zero rows for every valid link/user, always.
-- This made OAuth login for an already-linked account, and OAuth
-- link_account/reauth for a user's first provider link, both
-- non-functional.
alter table app.identity_oauth_links no force row level security;

-- app.lookup_oauth_link joined app.identity_users purely to fetch
-- identity_key -- unlike the token tables, identity_oauth_links didn't
-- store it directly. Store it the same way the token tables do, so the
-- lookup never needs to touch identity_users at all. No backfill is
-- needed: OAuth has never had working credentials configured in any
-- known environment (see migration 0040's sibling bug), so this table
-- has no existing rows anywhere this migration will run against.
alter table app.identity_oauth_links add column identity_key text not null;

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
  select l.user_id, l.identity_key
    from app.identity_oauth_links l
   where l.provider = p_provider
     and l.provider_subject_id = p_provider_subject_id;
$$;

-- app.lookup_identity_key_for_user has no token/link row to carry
-- identity_key on -- deriving it from user_id is its entire job, and
-- app.identity_users only had an identity_key-based RLS policy, which a
-- caller who only knows user_id can never satisfy. Add the same
-- user_id-based policy shape app.identity_memberships already uses
-- (migration 0017) as an additional, purely additive permissive policy
-- (Postgres OR's multiple permissive policies together, so this cannot
-- narrow the existing identity_key-based access). Then have the function
-- set app.identity_user_id from its own input parameter before querying,
-- exactly mirroring what withIdentity() already does for every other
-- identity-scoped query in normal request handling -- this doesn't widen
-- who may call the function (still gated by the existing SECURITY
-- DEFINER + GRANT EXECUTE), only makes its own internal read satisfy the
-- RLS it was always meant to run under.
drop policy if exists identity_users_exact_user_id on app.identity_users;
create policy identity_users_exact_user_id on app.identity_users
  using (user_id::text = current_setting('app.identity_user_id', true))
  with check (user_id::text = current_setting('app.identity_user_id', true));

create or replace function app.lookup_identity_key_for_user(
  p_user_id uuid
)
returns text
language plpgsql
stable
security definer
set search_path = app, pg_catalog
as $$
declare
  v_identity_key text;
begin
  perform set_config('app.identity_user_id', p_user_id::text, true);
  select identity_key into v_identity_key
    from app.identity_users
   where user_id = p_user_id;
  return v_identity_key;
end;
$$;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'papadata_app') then
    grant execute on function app.lookup_oauth_link(text, text) to papadata_app;
    grant execute on function app.lookup_identity_key_for_user(uuid) to papadata_app;
  end if;
end
$$;

commit;
