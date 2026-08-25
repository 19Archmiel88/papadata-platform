-- Papa Asystent / Laboratorium conversation continuity.
--
-- The sidecar and Laboratorium are two presentations of the same
-- conversation (docs/specyfikacja-docelowa/26-priorytety-p0/08-ciaglosc-asystent-laboratorium.md).
-- This extends the previously unwired app.assistant_threads/messages schema
-- (packages/database/migrations/000006_worker_reports_assistant_billing.sql)
-- with what that continuity model requires: branching via
-- parent_thread_id (parentConversationId), case threads via thread_kind,
-- a snapshot table for context basket / screen captures, and a widened
-- message role check that also allows system messages.

alter table app.assistant_threads
  add column if not exists parent_thread_id uuid
    references app.assistant_threads (assistant_thread_id),
  add column if not exists thread_kind text not null default 'conversation';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assistant_threads_thread_kind_valid'
  ) then
    alter table app.assistant_threads
      add constraint assistant_threads_thread_kind_valid
      check (thread_kind in ('conversation', 'case'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'assistant_threads_parent_not_self'
  ) then
    alter table app.assistant_threads
      add constraint assistant_threads_parent_not_self
      check (parent_thread_id is distinct from assistant_thread_id);
  end if;
end
$$;

create index if not exists assistant_threads_parent_idx
  on app.assistant_threads (parent_thread_id)
  where parent_thread_id is not null;

alter table app.assistant_messages
  drop constraint if exists assistant_messages_role_valid;

alter table app.assistant_messages
  add constraint assistant_messages_role_valid
  check (role in ('assistant', 'system', 'user'));

create table if not exists app.assistant_context_snapshots (
  assistant_context_snapshot_id uuid primary key,
  assistant_thread_id uuid not null
    references app.assistant_threads (assistant_thread_id),
  tenant_id uuid not null,
  workspace_id uuid not null,
  capture_reason text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, workspace_id)
    references app.workspaces (tenant_id, workspace_id),
  constraint assistant_context_snapshots_capture_reason_not_blank
    check (length(trim(capture_reason)) > 0),
  constraint assistant_context_snapshots_snapshot_object
    check (jsonb_typeof(snapshot) = 'object')
);

create index if not exists assistant_context_snapshots_thread_idx
  on app.assistant_context_snapshots (assistant_thread_id, created_at desc);

alter table app.assistant_context_snapshots enable row level security;
alter table app.assistant_context_snapshots force row level security;

drop policy if exists assistant_context_snapshots_canonical_scope_policy
  on app.assistant_context_snapshots;

create policy assistant_context_snapshots_canonical_scope_policy
  on app.assistant_context_snapshots
  for all
  using (
    tenant_id::text = app.current_tenant_id()
    and (
      app.current_workspace_id() is null
      or workspace_id::text = app.current_workspace_id()
    )
  )
  with check (
    tenant_id::text = app.current_tenant_id()
    and (
      app.current_workspace_id() is null
      or workspace_id::text = app.current_workspace_id()
    )
  );

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'papadata_app') then
    grant select, insert on app.assistant_context_snapshots to papadata_app;
  end if;

  if exists (select 1 from pg_roles where rolname = 'papadata_test') then
    grant select, insert, update, delete
      on app.assistant_context_snapshots to papadata_test;
  end if;
end
$$;
