-- PapaData product-domain convergence layer.
-- Keeps the hardened API/BFF/worker boundaries while providing persistent
-- business capabilities ported from the legacy backend.

create extension if not exists pgcrypto;
create schema if not exists app;

create table if not exists app.identity_users (
  user_id uuid primary key references app.users(user_id) on delete cascade,
  identity_key text not null unique,
  normalized_email text not null unique,
  password_hash text not null,
  display_name text not null,
  status text not null default 'active' check (status in ('active', 'locked', 'disabled')),
  email_verified_at timestamptz,
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.identity_memberships (
  membership_id uuid primary key references app.memberships(membership_id) on delete cascade,
  user_id uuid not null references app.identity_users(user_id) on delete cascade,
  tenant_id uuid not null,
  workspace_id uuid not null,
  tenant_name text not null,
  workspace_name text not null,
  roles jsonb not null default '["owner"]'::jsonb,
  capabilities jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'invited', 'revoked', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, workspace_id) references app.workspaces(tenant_id, workspace_id) on delete cascade,
  unique (user_id, tenant_id, workspace_id)
);

create table if not exists app.identity_audit_events (
  event_id uuid primary key default gen_random_uuid(),
  identity_key text not null,
  user_id uuid references app.identity_users(user_id) on delete set null,
  event_type text not null,
  outcome text not null check (outcome in ('success', 'denied', 'failure')),
  correlation_id text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists app.product_domain_records (
  record_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  domain text not null,
  entity_type text not null,
  external_key text not null,
  status text not null default 'active',
  data jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (tenant_id, workspace_id) references app.workspaces(tenant_id, workspace_id) on delete cascade,
  foreign key (created_by) references app.users(user_id) on delete set null,
  foreign key (updated_by) references app.users(user_id) on delete set null,
  unique (tenant_id, workspace_id, domain, entity_type, external_key)
);

create table if not exists app.product_domain_events (
  event_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  domain text not null,
  entity_type text not null,
  entity_key text not null,
  operation_id text not null,
  actor_user_id uuid,
  correlation_id text,
  idempotency_key text,
  before_state jsonb,
  after_state jsonb,
  outcome text not null check (outcome in ('success', 'denied', 'failure')),
  occurred_at timestamptz not null default now(),
  foreign key (tenant_id, workspace_id) references app.workspaces(tenant_id, workspace_id) on delete cascade,
  foreign key (actor_user_id) references app.users(user_id) on delete set null
);

create table if not exists app.webhook_replay_receipts (
  receipt_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid not null,
  connection_id uuid not null,
  provider_id text not null,
  provider_event_id text not null,
  signature_digest text not null,
  payload_digest text not null,
  provider_timestamp timestamptz,
  received_at timestamptz not null default now(),
  expires_at timestamptz not null,
  foreign key (tenant_id, workspace_id) references app.workspaces(tenant_id, workspace_id) on delete cascade,
  foreign key (connection_id) references app.integration_connections(connection_id) on delete cascade,
  unique (connection_id, provider_event_id)
);

create index if not exists product_domain_records_lookup_idx
  on app.product_domain_records (tenant_id, workspace_id, domain, entity_type, updated_at desc)
  where deleted_at is null;
create index if not exists product_domain_records_search_idx
  on app.product_domain_records using gin (data jsonb_path_ops)
  where deleted_at is null;
create index if not exists product_domain_events_scope_idx
  on app.product_domain_events (tenant_id, workspace_id, occurred_at desc);
create unique index if not exists product_domain_events_idempotency_idx
  on app.product_domain_events (tenant_id, workspace_id, operation_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists identity_audit_identity_idx
  on app.identity_audit_events (identity_key, occurred_at desc);
create index if not exists webhook_replay_expiry_idx
  on app.webhook_replay_receipts (expires_at);

alter table app.identity_users enable row level security;
alter table app.identity_users force row level security;
alter table app.identity_memberships enable row level security;
alter table app.identity_memberships force row level security;
alter table app.identity_audit_events enable row level security;
alter table app.identity_audit_events force row level security;
alter table app.product_domain_records enable row level security;
alter table app.product_domain_records force row level security;
alter table app.product_domain_events enable row level security;
alter table app.product_domain_events force row level security;
alter table app.webhook_replay_receipts enable row level security;
alter table app.webhook_replay_receipts force row level security;

drop policy if exists identity_users_exact_key on app.identity_users;
create policy identity_users_exact_key on app.identity_users
  using (identity_key = current_setting('app.identity_key', true))
  with check (identity_key = current_setting('app.identity_key', true));

drop policy if exists identity_memberships_exact_user on app.identity_memberships;
create policy identity_memberships_exact_user on app.identity_memberships
  using (user_id::text = current_setting('app.identity_user_id', true))
  with check (user_id::text = current_setting('app.identity_user_id', true));

drop policy if exists identity_audit_exact_key on app.identity_audit_events;
create policy identity_audit_exact_key on app.identity_audit_events
  using (identity_key = current_setting('app.identity_key', true))
  with check (identity_key = current_setting('app.identity_key', true));

drop policy if exists product_domain_records_scope on app.product_domain_records;
create policy product_domain_records_scope on app.product_domain_records
  using (
    tenant_id::text = current_setting('app.tenant_id', true)
    and workspace_id::text = current_setting('app.workspace_id', true)
  )
  with check (
    tenant_id::text = current_setting('app.tenant_id', true)
    and workspace_id::text = current_setting('app.workspace_id', true)
  );

drop policy if exists product_domain_events_scope on app.product_domain_events;
create policy product_domain_events_scope on app.product_domain_events
  using (
    tenant_id::text = current_setting('app.tenant_id', true)
    and workspace_id::text = current_setting('app.workspace_id', true)
  )
  with check (
    tenant_id::text = current_setting('app.tenant_id', true)
    and workspace_id::text = current_setting('app.workspace_id', true)
  );

drop policy if exists webhook_replay_receipts_scope on app.webhook_replay_receipts;
create policy webhook_replay_receipts_scope on app.webhook_replay_receipts
  using (
    tenant_id::text = current_setting('app.tenant_id', true)
    and workspace_id::text = current_setting('app.workspace_id', true)
  )
  with check (
    tenant_id::text = current_setting('app.tenant_id', true)
    and workspace_id::text = current_setting('app.workspace_id', true)
  );

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'papadata_app') then
    grant select, insert, update on app.identity_users to papadata_app;
    grant select, insert, update on app.identity_memberships to papadata_app;
    grant select, insert on app.identity_audit_events to papadata_app;
    grant select, insert, update on app.product_domain_records to papadata_app;
    grant select, insert on app.product_domain_events to papadata_app;
    grant select, insert, delete on app.webhook_replay_receipts to papadata_app;
  end if;
  if exists (select 1 from pg_roles where rolname = 'papadata_platform') then
    grant select, update, delete on app.product_domain_records to papadata_platform;
    grant select on app.product_domain_events to papadata_platform;
    grant select, delete on app.webhook_replay_receipts to papadata_platform;
  end if;
end
$$;
