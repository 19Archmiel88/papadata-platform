begin;

-- Fixes the same class of bug as migrations 0040/0041, for the pre-auth
-- SECURITY DEFINER invitation lookup from migrations 0021/0022
-- (app.lookup_invitation_for_acceptance): migration 0016 force-enabled
-- row level security on every table with a tenant_id column, generically,
-- which included app.invitations, app.tenants and app.workspaces. This
-- function is SECURITY DEFINER, owned by the table owner
-- (papadata_migrator, no BYPASSRLS), and its whole purpose is to look up
-- an invitation before any tenant/workspace GUC can be known -- exactly
-- the scenario FORCE breaks (see 0040's comment for the full mechanism).
-- Invitation validate/accept were both non-functional for any real
-- invitation as a result.
--
-- Unlike 0040/0041's token/link tables, app.invitations has a tenant_id
-- column, so it's covered by migrate.sh's own automated
-- tenant_tables_have_forced_rls check -- removing FORCE would fail that
-- check (confirmed during verification of an earlier draft of this
-- migration). A second attempt tried adding a narrow extra *permissive*
-- policy instead of touching FORCE; that also failed, because migration
-- 0016 additionally created a *restrictive* twin
-- (<table>_scope_restriction, identical condition, `as restrictive`) on
-- every one of these tables specifically so a future permissive policy
-- addition could never widen access on its own. Restrictive policies are
-- AND'd against the permissive set, not OR'd, so they veto regardless of
-- any new permissive policy (confirmed empirically: even a manual,
-- correctly-scoped SELECT as papadata_app returned zero rows).
--
-- The correct fix is to widen both twins' own condition with an OR,
-- preserving each one's permissive/restrictive nature exactly as 0016
-- established. The added clause only matches when
-- app.pending_invitation_lookup_id is set to the exact invitation_id the
-- SECURITY DEFINER function was called with (its own input parameter, not
-- caller-supplied GUC state) -- token_hash/status/expires_at inside the
-- function still gate whether anything is actually returned, so this
-- doesn't broaden what a caller can learn, only how the lookup gets past
-- RLS. Normal tenant-scoped access (the original condition) is completely
-- unaffected: current_setting(..., true) returns NULL when the GUC is
-- unset, and invitation_id::text = NULL is never true.
drop policy if exists invitations_canonical_scope_policy on app.invitations;
create policy invitations_canonical_scope_policy on app.invitations
  for all
  using (
    (tenant_id::text = app.current_tenant_id()
      and (app.current_workspace_id() is null or workspace_id is null or workspace_id::text = app.current_workspace_id()))
    or invitation_id::text = current_setting('app.pending_invitation_lookup_id', true)
  )
  with check (
    (tenant_id::text = app.current_tenant_id()
      and (app.current_workspace_id() is null or workspace_id is null or workspace_id::text = app.current_workspace_id()))
    or invitation_id::text = current_setting('app.pending_invitation_lookup_id', true)
  );

drop policy if exists invitations_scope_restriction on app.invitations;
create policy invitations_scope_restriction on app.invitations
  as restrictive
  for all
  using (
    (tenant_id::text = app.current_tenant_id()
      and (app.current_workspace_id() is null or workspace_id is null or workspace_id::text = app.current_workspace_id()))
    or invitation_id::text = current_setting('app.pending_invitation_lookup_id', true)
  )
  with check (
    (tenant_id::text = app.current_tenant_id()
      and (app.current_workspace_id() is null or workspace_id is null or workspace_id::text = app.current_workspace_id()))
    or invitation_id::text = current_setting('app.pending_invitation_lookup_id', true)
  );

drop function if exists app.lookup_invitation_for_acceptance(uuid, text);

create function app.lookup_invitation_for_acceptance(
  p_invitation_id uuid,
  p_token_hash text
)
returns table (
  invitation_id uuid,
  tenant_id uuid,
  workspace_id uuid,
  tenant_name text,
  workspace_name text,
  email text,
  role text,
  status text,
  invited_by_user_id uuid,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = app, pg_catalog
as $$
declare
  v_invitation app.invitations%rowtype;
begin
  perform set_config('app.pending_invitation_lookup_id', p_invitation_id::text, true);

  select * into v_invitation
    from app.invitations i
   where i.invitation_id = p_invitation_id
     and i.token_hash = p_token_hash
     and i.status = 'pending'
     and i.expires_at > now();

  if not found then
    return;
  end if;

  perform set_config('app.tenant_id', v_invitation.tenant_id::text, true);
  perform set_config('app.workspace_id', v_invitation.workspace_id::text, true);

  return query
    select
      v_invitation.invitation_id,
      v_invitation.tenant_id,
      v_invitation.workspace_id,
      t.name,
      w.name,
      v_invitation.email,
      v_invitation.role,
      v_invitation.status,
      v_invitation.invited_by_user_id,
      v_invitation.expires_at
    from app.tenants t
    join app.workspaces w on w.workspace_id = v_invitation.workspace_id
    where t.tenant_id = v_invitation.tenant_id;
end;
$$;

revoke all on function app.lookup_invitation_for_acceptance(uuid, text) from public;
grant execute on function app.lookup_invitation_for_acceptance(uuid, text) to papadata_app;

commit;
