begin;

alter table app.sync_jobs
  add column if not exists checkpoint jsonb,
  add column if not exists lease_owner text,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists heartbeat_at timestamptz,
  add column if not exists cancel_requested_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table app.sync_jobs
  drop constraint if exists sync_jobs_status_valid;

alter table app.sync_jobs
  add constraint sync_jobs_status_valid
  check (
    status in (
      'cancel_requested',
      'cancelled',
      'dead_lettered',
      'dlq',
      'failed',
      'fetching',
      'leased',
      'normalizing',
      'partial_success',
      'persisting_source',
      'queued',
      'rate_limited',
      'reconciling',
      'recovered',
      'retry_wait',
      'retryable_failed',
      'running',
      'succeeded',
      'terminal_failed',
      'writing_canonical'
    )
  );

drop index if exists sync_checkpoints_scope_unique;
alter table app.sync_checkpoints
  drop constraint if exists sync_checkpoints_tenant_id_workspace_id_provider_id_stream_key;

alter table app.sync_checkpoints
  add column if not exists checkpoint_version integer not null default 1,
  add column if not exists updated_by_sync_job_id uuid references app.sync_jobs(sync_job_id);

create unique index if not exists sync_checkpoints_connection_scope_unique
  on app.sync_checkpoints (
    tenant_id,
    workspace_id,
    connection_id,
    provider_id,
    stream
  );

alter table app.source_batches
  add column if not exists provider_cursor text,
  add column if not exists fetch_started_at timestamptz,
  add column if not exists fetch_finished_at timestamptz,
  add column if not exists payload_checksum text,
  add column if not exists schema_version text not null default 'provider.raw.v1',
  add column if not exists attempt integer not null default 1,
  add column if not exists correlation_id text;

alter table app.source_records
  add column if not exists provider_object_type text,
  add column if not exists provider_object_id text,
  add column if not exists provider_updated_at timestamptz,
  add column if not exists payload_checksum text,
  add column if not exists idempotency_key text,
  add column if not exists schema_version text not null default 'provider.raw.v1';

update app.source_records
set
  provider_object_type = coalesce(provider_object_type, stream),
  provider_object_id = coalesce(provider_object_id, external_id),
  payload_checksum = coalesce(payload_checksum, fingerprint),
  idempotency_key = coalesce(
    idempotency_key,
    tenant_id::text || ':' || workspace_id::text || ':' || connection_id::text || ':' || provider_id || ':' || stream || ':' || external_id || ':' || fingerprint
  )
where provider_object_type is null
   or provider_object_id is null
   or payload_checksum is null
   or idempotency_key is null;

alter table app.source_records
  alter column provider_object_type set not null,
  alter column provider_object_id set not null,
  alter column payload_checksum set not null,
  alter column idempotency_key set not null;

create unique index if not exists source_records_idempotency_unique
  on app.source_records (idempotency_key);

create table if not exists app.integration_canonical_records (
  canonical_record_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  source_record_id uuid not null unique references app.source_records(source_record_id),
  connection_id uuid not null references app.integration_connections(connection_id),
  provider_id text not null,
  stream text not null,
  external_id text not null,
  canonical_payload jsonb not null,
  canonical_version text not null default 'integration.canonical.v1',
  source_lineage jsonb not null,
  business_time timestamptz,
  ingested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, workspace_id)
    references app.workspaces (tenant_id, workspace_id),
  unique (tenant_id, workspace_id, connection_id, provider_id, stream, external_id)
);

create table if not exists app.integration_reconciliation_runs (
  reconciliation_run_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  connection_id uuid not null references app.integration_connections(connection_id),
  provider_id text not null,
  sync_job_id uuid not null references app.sync_jobs(sync_job_id),
  source_batch_id uuid references app.source_batches(source_batch_id),
  fetched_count integer not null,
  persisted_source_count integer not null,
  normalized_count integer not null,
  canonical_count integer not null,
  rejected_count integer not null default 0,
  duplicate_count integer not null default 0,
  failed_count integer not null default 0,
  status text not null,
  failure_reason text,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, workspace_id)
    references app.workspaces (tenant_id, workspace_id),
  constraint integration_reconciliation_counts_non_negative check (
    fetched_count >= 0
    and persisted_source_count >= 0
    and normalized_count >= 0
    and canonical_count >= 0
    and rejected_count >= 0
    and duplicate_count >= 0
    and failed_count >= 0
  ),
  constraint integration_reconciliation_status_valid check (
    status in ('failed', 'passed', 'partial')
  )
);

create table if not exists app.integration_dead_letter_jobs (
  dead_letter_job_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  sync_job_id uuid not null references app.sync_jobs(sync_job_id),
  connection_id uuid not null references app.integration_connections(connection_id),
  provider_id text not null,
  failure_class text not null,
  failure_reason text not null,
  attempt integer not null,
  replayable boolean not null default true,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, workspace_id)
    references app.workspaces (tenant_id, workspace_id),
  unique (tenant_id, workspace_id, sync_job_id)
);

alter table app.integration_canonical_records enable row level security;
alter table app.integration_reconciliation_runs enable row level security;
alter table app.integration_dead_letter_jobs enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'integration_canonical_records',
    'integration_reconciliation_runs',
    'integration_dead_letter_jobs'
  ] loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'app'
        and tablename = table_name
        and policyname = table_name || '_tenant_workspace_policy'
    ) then
      execute format(
        'create policy %I on app.%I using '
        || '(tenant_id = app.current_tenant_id()::uuid and workspace_id = app.current_workspace_id()::uuid) '
        || 'with check '
        || '(tenant_id = app.current_tenant_id()::uuid and workspace_id = app.current_workspace_id()::uuid)',
        table_name || '_tenant_workspace_policy',
        table_name
      );
    end if;
  end loop;
end $$;

grant select, insert, update on app.integration_canonical_records to papadata_app;
grant select, insert on app.integration_reconciliation_runs to papadata_app;
grant select, insert, update on app.integration_dead_letter_jobs to papadata_app;

grant select, insert, update, delete on app.integration_canonical_records to papadata_test;
grant select, insert, update, delete on app.integration_reconciliation_runs to papadata_test;
grant select, insert, update, delete on app.integration_dead_letter_jobs to papadata_test;

commit;
