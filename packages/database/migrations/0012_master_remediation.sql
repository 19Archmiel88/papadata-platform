begin;
create extension if not exists pgcrypto;
create schema if not exists app;

create table if not exists app.security_mfa_enrollments (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, user_id text not null,
  method text not null check (method = 'totp'), encrypted_secret text not null,
  status text not null check (status in ('pending','active','revoked')),
  recovery_code_hashes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), confirmed_at timestamptz, revoked_at timestamptz,
  unique (tenant_id, user_id, method)
);
create table if not exists app.security_step_up_proofs (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, user_id text not null,
  session_id text not null, proof_hash text not null unique, assurance_level text not null,
  operation_scope text not null, target_reference text, issued_at timestamptz not null,
  expires_at timestamptz not null, consumed_at timestamptz, revoked_at timestamptz
);
create table if not exists app.security_invitation_tokens (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, invitation_id text not null,
  token_version integer not null, token_hash text not null unique, issued_at timestamptz not null,
  expires_at timestamptz not null, used_at timestamptz, revoked_at timestamptz,
  replaced_by_token_version integer, unique (tenant_id, invitation_id, token_version)
);
create table if not exists app.security_jit_grants (
  id uuid primary key default gen_random_uuid(), support_user_id text not null, tenant_id text not null,
  workspace_id text, ticket_reference text not null, reason text not null, resource_scope jsonb not null,
  status text not null, requested_at timestamptz not null, approved_by text, approved_at timestamptz,
  activated_at timestamptz, expires_at timestamptz not null, revoked_at timestamptz, revocation_reason text
);
create table if not exists app.audit_chain_heads (
  chain_scope text primary key, latest_sequence bigint not null default 0, latest_hash text,
  updated_at timestamptz not null default now()
);
create table if not exists app.security_audit_events (
  id uuid primary key default gen_random_uuid(), chain_scope text not null, sequence_number bigint not null,
  tenant_id text, workspace_id text, actor_id text not null, actor_type text not null, action text not null,
  resource_type text not null, resource_id text, outcome text not null, correlation_id text not null,
  metadata jsonb not null default '{}'::jsonb, previous_hash text, event_hash text not null,
  created_at timestamptz not null default now(), unique (chain_scope, sequence_number), unique (event_hash)
);
create or replace function app.prevent_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'security_audit_events is append-only'; end;
$$;
drop trigger if exists security_audit_events_no_update on app.security_audit_events;
create trigger security_audit_events_no_update before update or delete on app.security_audit_events
for each row execute function app.prevent_audit_mutation();

create table if not exists app.privacy_requests (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, workspace_id text,
  subject_reference text not null, request_type text not null, status text not null,
  legal_hold boolean not null default false, identity_verified_at timestamptz,
  approved_by text, approved_at timestamptz, requested_at timestamptz not null default now(),
  due_at timestamptz not null, completed_at timestamptz, correlation_id text not null
);
create table if not exists app.privacy_request_targets (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references app.privacy_requests(id) on delete cascade,
  system text not null, status text not null, evidence_reference text, error_code text,
  attempts integer not null default 0, updated_at timestamptz not null default now(), unique (request_id, system)
);
create table if not exists app.platform_jobs (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, workspace_id text,
  job_type text not null, status text not null, payload jsonb not null, idempotency_key text not null,
  attempt integer not null default 0, max_attempts integer not null default 5, checkpoint jsonb,
  lease_owner text, lease_expires_at timestamptz, heartbeat_at timestamptz,
  cancel_requested_at timestamptz, error_code text, error_detail text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists platform_jobs_idempotency_unique
  on app.platform_jobs (tenant_id, coalesce(workspace_id, ''), idempotency_key);
create table if not exists app.report_requests (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, workspace_id text not null,
  report_type text not null, format text not null, status text not null,
  date_from timestamptz not null, date_to timestamptz not null, filters jsonb not null default '{}'::jsonb,
  idempotency_key text not null, object_key text, checksum_sha256 text, size_bytes bigint,
  content_type text, error_code text, created_at timestamptz not null default now(),
  ready_at timestamptz, expires_at timestamptz, unique (tenant_id, workspace_id, idempotency_key)
);
create table if not exists app.integration_credential_events (
  id uuid primary key default gen_random_uuid(), tenant_id text not null, workspace_id text not null,
  connection_id uuid not null, event_type text not null, actor_id text not null,
  required_scopes jsonb not null default '[]'::jsonb, granted_scopes jsonb not null default '[]'::jsonb,
  evidence_reference text, created_at timestamptz not null default now()
);
create table if not exists app.system_kill_switches (
  switch_key text primary key, enabled boolean not null default false, reason text,
  changed_by text not null, changed_at timestamptz not null default now(), expires_at timestamptz
);
create table if not exists app.provider_evidence (
  id uuid primary key default gen_random_uuid(), provider_id text not null, environment text not null,
  evidence_type text not null, evidence_reference text not null, result text not null,
  commit_sha text, collected_at timestamptz not null, expires_at timestamptz,
  unique (provider_id, environment, evidence_type, evidence_reference)
);

alter table app.security_mfa_enrollments enable row level security;
alter table app.security_step_up_proofs enable row level security;
alter table app.security_invitation_tokens enable row level security;
alter table app.security_jit_grants enable row level security;
alter table app.privacy_requests enable row level security;
alter table app.report_requests enable row level security;
alter table app.platform_jobs enable row level security;
alter table app.integration_credential_events enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['security_mfa_enrollments','security_step_up_proofs','security_invitation_tokens','security_jit_grants','privacy_requests','report_requests','platform_jobs','integration_credential_events'] loop
    if not exists (select 1 from pg_policies where schemaname='app' and tablename=table_name and policyname=table_name||'_tenant_policy') then
      execute format('create policy %I on app.%I using (tenant_id = app.current_tenant_id()) with check (tenant_id = app.current_tenant_id())',table_name||'_tenant_policy',table_name);
    end if;
  end loop;
end $$;
commit;
