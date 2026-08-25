-- Papa Asystent / Laboratorium: tenant-safe relationships and idempotent writes.
--
-- 0023 introduced conversation/case continuity. This migration hardens that
-- model so retries cannot duplicate threads/messages/snapshots and a thread or
-- message can never reference a parent from another tenant/workspace.

alter table app.assistant_threads
  add column if not exists creation_idempotency_key text;

alter table app.assistant_messages
  add column if not exists idempotency_key text;

alter table app.assistant_context_snapshots
  add column if not exists idempotency_key text;

create unique index if not exists assistant_threads_scope_thread_unique
  on app.assistant_threads (tenant_id, workspace_id, assistant_thread_id);

create unique index if not exists assistant_messages_scope_message_unique
  on app.assistant_messages (tenant_id, workspace_id, assistant_message_id);

create unique index if not exists assistant_threads_scope_creation_idempotency_unique
  on app.assistant_threads (tenant_id, workspace_id, creation_idempotency_key)
  where creation_idempotency_key is not null;

create unique index if not exists assistant_messages_scope_idempotency_unique
  on app.assistant_messages (
    tenant_id,
    workspace_id,
    assistant_thread_id,
    role,
    idempotency_key
  )
  where idempotency_key is not null;

create unique index if not exists assistant_context_snapshots_scope_idempotency_unique
  on app.assistant_context_snapshots (
    tenant_id,
    workspace_id,
    assistant_thread_id,
    idempotency_key
  )
  where idempotency_key is not null;

create unique index if not exists assistant_evidence_message_source_unique
  on app.assistant_evidence (
    tenant_id,
    workspace_id,
    assistant_message_id,
    source_type,
    source_ref,
    coalesce(metric_code, '')
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assistant_threads_parent_same_scope_fk'
  ) then
    alter table app.assistant_threads
      add constraint assistant_threads_parent_same_scope_fk
      foreign key (tenant_id, workspace_id, parent_thread_id)
      references app.assistant_threads (
        tenant_id,
        workspace_id,
        assistant_thread_id
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'assistant_messages_thread_same_scope_fk'
  ) then
    alter table app.assistant_messages
      add constraint assistant_messages_thread_same_scope_fk
      foreign key (tenant_id, workspace_id, assistant_thread_id)
      references app.assistant_threads (
        tenant_id,
        workspace_id,
        assistant_thread_id
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'assistant_context_snapshots_thread_same_scope_fk'
  ) then
    alter table app.assistant_context_snapshots
      add constraint assistant_context_snapshots_thread_same_scope_fk
      foreign key (tenant_id, workspace_id, assistant_thread_id)
      references app.assistant_threads (
        tenant_id,
        workspace_id,
        assistant_thread_id
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'assistant_evidence_message_same_scope_fk'
  ) then
    alter table app.assistant_evidence
      add constraint assistant_evidence_message_same_scope_fk
      foreign key (tenant_id, workspace_id, assistant_message_id)
      references app.assistant_messages (
        tenant_id,
        workspace_id,
        assistant_message_id
      );
  end if;
end
$$;
