begin;

-- Pre-auth invitation lookup cannot provide tenant RLS context before the
-- invitation has been validated. Keep the narrow cross-tenant lookup behind
-- SECURITY DEFINER and bind it to both the invitation id and the SHA-256 token
-- hash. A bare invitation id must never disclose invitation metadata.
create or replace function app.lookup_invitation_for_acceptance(
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
language sql
stable
security definer
set search_path = app, pg_catalog
as $$
  select
    i.invitation_id,
    i.tenant_id,
    i.workspace_id,
    t.name as tenant_name,
    w.name as workspace_name,
    i.email,
    i.role,
    i.status,
    i.invited_by_user_id,
    i.expires_at
  from app.invitations i
  join app.tenants t on t.tenant_id = i.tenant_id
  join app.workspaces w on w.workspace_id = i.workspace_id
  where i.invitation_id = p_invitation_id
    and i.token_hash = p_token_hash
    and i.status = 'pending'
    and i.expires_at > now();
$$;

revoke all on function app.lookup_invitation_for_acceptance(uuid, text) from public;
grant execute on function app.lookup_invitation_for_acceptance(uuid, text) to papadata_app;

commit;
