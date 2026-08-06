begin;

-- Platform-wide schedulers use a dedicated credential with narrowly granted
-- table privileges and BYPASSRLS. The role is provisioned outside migrations
-- because the migrator intentionally has no CREATEROLE privilege.
do $$
begin
  if not exists (
    select 1 from pg_roles
    where rolname = 'papadata_platform' and rolbypassrls
  ) then
    raise exception 'papadata_platform role with BYPASSRLS must exist before migration 0016';
  end if;
end $$;

-- AUD-003/AUD-008/AUD-010/AUD-019/AUD-023: durable security and evidence state.
alter table app.integration_connections
  add column if not exists idempotency_key text;

create unique index if not exists integration_connections_idempotency_unique
  on app.integration_connections (tenant_id, workspace_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists app.command_executions (
  command_execution_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  operation_id text not null,
  idempotency_key text not null,
  correlation_id text not null,
  actor_id text not null,
  status text not null check (status in ('reserved','succeeded','failed')),
  request_hash text not null,
  response_status integer,
  response_body jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists command_executions_idempotency_unique
  on app.command_executions (tenant_id, (coalesce(workspace_id, '')), operation_id, idempotency_key);

create table if not exists app.privacy_identity_verifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  privacy_request_id uuid references app.privacy_requests(id),
  subject_reference text not null,
  verification_method text not null,
  evidence_reference text not null,
  verified_by text not null,
  verified_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > verified_at)
);

create index if not exists privacy_identity_verifications_subject_idx
  on app.privacy_identity_verifications (
    tenant_id,
    subject_reference,
    expires_at desc
  );

create table if not exists app.platform_schedule_runs (
  schedule_key text not null,
  scheduled_for timestamptz not null,
  job_id text not null,
  status text not null check (status in ('enqueued','completed','failed')),
  completed_at timestamptz,
  error_code text,
  primary key (schedule_key, scheduled_for)
);

create table if not exists app.backend_release_evidence (
  evidence_id uuid primary key default gen_random_uuid(),
  commit_sha text not null,
  release_scope text not null,
  control_id text not null,
  result text not null check (result in ('pass','fail','not_run','external_required')),
  evidence_reference text not null,
  collected_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (commit_sha, release_scope, control_id, evidence_reference)
);

create table if not exists app.artifact_deletion_ledger (
  deletion_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  object_key text not null,
  object_class text not null,
  reason text not null,
  versions_deleted integer not null check (versions_deleted >= 0),
  correlation_id text not null,
  deleted_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb,
  unique (tenant_id, object_key, reason)
);

-- RLS for every app table that has tenant_id. A restrictive policy is added
-- even when a legacy permissive policy already exists, so legacy policies
-- cannot widen tenant scope. Tables with no previous policy also receive a
-- canonical permissive policy. Workspace NULL means tenant-wide data; a NULL
-- request workspace is permitted only after tenant scope has been set.
do $$
declare
  row record;
  expression text;
  policy_count integer;
begin
  for row in
    select
      table_name,
      exists (
        select 1
        from information_schema.columns as workspace_column
        where workspace_column.table_schema = 'app'
          and workspace_column.table_name = tables.table_name
          and workspace_column.column_name = 'workspace_id'
      ) as has_workspace
    from information_schema.columns as tables
    where table_schema = 'app'
      and column_name = 'tenant_id'
    order by table_name
  loop
    expression := '(tenant_id::text = app.current_tenant_id())';
    if row.has_workspace then
      expression := expression ||
        ' and (app.current_workspace_id() is null or workspace_id is null or workspace_id::text = app.current_workspace_id())';
    end if;

    execute format('alter table app.%I enable row level security', row.table_name);
    execute format('alter table app.%I force row level security', row.table_name);

    select count(*) into policy_count
    from pg_policies
    where schemaname = 'app' and tablename = row.table_name;

    if policy_count = 0 then
      execute format(
        'create policy %I on app.%I for all using (%s) with check (%s)',
        row.table_name || '_canonical_scope_policy',
        row.table_name,
        expression,
        expression
      );
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'app'
        and tablename = row.table_name
        and policyname = row.table_name || '_scope_restriction'
    ) then
      execute format(
        'drop policy %I on app.%I',
        row.table_name || '_scope_restriction',
        row.table_name
      );
    end if;

    execute format(
      'create policy %I on app.%I as restrictive for all using (%s) with check (%s)',
      row.table_name || '_scope_restriction',
      row.table_name,
      expression,
      expression
    );
  end loop;
end $$;

-- Child table scope is inherited from the parent privacy request.
alter table app.privacy_request_targets enable row level security;
alter table app.privacy_request_targets force row level security;
drop policy if exists privacy_request_targets_canonical_scope_policy
  on app.privacy_request_targets;
create policy privacy_request_targets_canonical_scope_policy
  on app.privacy_request_targets
  as permissive
  for all
  using (
    exists (
      select 1
      from app.privacy_requests as request
      where request.id = privacy_request_targets.request_id
        and request.tenant_id::text = app.current_tenant_id()
        and (
          app.current_workspace_id() is null
          or request.workspace_id is null
          or request.workspace_id::text = app.current_workspace_id()
        )
    )
  )
  with check (
    exists (
      select 1
      from app.privacy_requests as request
      where request.id = privacy_request_targets.request_id
        and request.tenant_id::text = app.current_tenant_id()
        and (
          app.current_workspace_id() is null
          or request.workspace_id is null
          or request.workspace_id::text = app.current_workspace_id()
        )
    )
  );

drop policy if exists privacy_request_targets_scope_restriction
  on app.privacy_request_targets;
create policy privacy_request_targets_scope_restriction
  on app.privacy_request_targets
  as restrictive
  for all
  using (
    exists (
      select 1
      from app.privacy_requests as request
      where request.id = privacy_request_targets.request_id
        and request.tenant_id::text = app.current_tenant_id()
        and (
          app.current_workspace_id() is null
          or request.workspace_id is null
          or request.workspace_id::text = app.current_workspace_id()
        )
    )
  )
  with check (
    exists (
      select 1
      from app.privacy_requests as request
      where request.id = privacy_request_targets.request_id
        and request.tenant_id::text = app.current_tenant_id()
        and (
          app.current_workspace_id() is null
          or request.workspace_id is null
          or request.workspace_id::text = app.current_workspace_id()
        )
    )
  );

-- Explicitly classify global tables rather than silently leaving them outside
-- the tenancy model.
create table if not exists app.table_security_classification (
  table_name text primary key,
  scope_class text not null check (scope_class in ('tenant','tenant_workspace','global_internal','child_scoped')),
  rationale text not null,
  reviewed_at timestamptz not null default now()
);

insert into app.table_security_classification (table_name, scope_class, rationale)
select
  table_name,
  case
    when exists (
      select 1 from information_schema.columns as c
      where c.table_schema = 'app'
        and c.table_name = t.table_name
        and c.column_name = 'tenant_id'
    ) then case
      when exists (
        select 1 from information_schema.columns as c
        where c.table_schema = 'app'
          and c.table_name = t.table_name
          and c.column_name = 'workspace_id'
      ) then 'tenant_workspace'
      else 'tenant'
    end
    when table_name = 'privacy_request_targets' then 'child_scoped'
    else 'global_internal'
  end,
  case
    when table_name = 'privacy_request_targets' then 'Scope inherited from privacy_requests.'
    when exists (
      select 1 from information_schema.columns as c
      where c.table_schema = 'app'
        and c.table_name = t.table_name
        and c.column_name = 'tenant_id'
    ) then 'Database-enforced tenant scope.'
    else 'No tenant key; access must be limited to infrastructure/runtime roles.'
  end
from information_schema.tables as t
where t.table_schema = 'app' and t.table_type = 'BASE TABLE'
on conflict (table_name) do update
set scope_class = excluded.scope_class,
    rationale = excluded.rationale,
    reviewed_at = now();

revoke all on app.backend_release_evidence from public;
revoke all on app.table_security_classification from public;

grant usage on schema app to papadata_platform;
grant select on app.integration_connections to papadata_platform;
grant select, update on app.report_requests to papadata_platform;
grant select, insert, update, delete on app.platform_schedule_runs to papadata_platform;
grant select, insert on app.artifact_deletion_ledger to papadata_platform;

grant select, insert, update on app.command_executions to papadata_app;
grant select, insert, update on app.privacy_identity_verifications to papadata_app;
grant select, insert, update on app.platform_schedule_runs to papadata_app;
grant select on app.table_security_classification to papadata_app;
grant select, insert on app.backend_release_evidence to papadata_app;
grant select, insert on app.artifact_deletion_ledger to papadata_app;

grant select, insert, update, delete on app.command_executions to papadata_test;
grant select, insert, update, delete on app.privacy_identity_verifications to papadata_test;
grant select, insert, update, delete on app.platform_schedule_runs to papadata_test;
grant select, insert, update, delete on app.backend_release_evidence to papadata_test;
grant select, insert, update, delete on app.artifact_deletion_ledger to papadata_test;
grant select on app.table_security_classification to papadata_test;

commit;
