begin;

create extension if not exists pgcrypto;
create schema if not exists app;

create table if not exists app.integration_provider_catalog (
  provider_id text primary key,
  display_name text not null,
  category text not null,
  catalog_status text not null,
  adapter_status text not null,
  environment_status jsonb not null default '{}'::jsonb,
  required_scopes jsonb not null default '[]'::jsonb,
  optional_scopes jsonb not null default '[]'::jsonb,
  supports_webhooks boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into app.integration_provider_catalog
  (provider_id, display_name, category, catalog_status, adapter_status,
   required_scopes, optional_scopes, supports_webhooks)
values
  ('woocommerce', 'WooCommerce', 'commerce', 'mvp', 'sandbox_verified', '["read"]', '["write_webhooks"]', true),
  ('shopify', 'Shopify', 'commerce', 'mvp', 'adapter_implemented', '["read_orders","read_products","read_inventory"]', '["read_customers"]', true),
  ('baselinker', 'BaseLinker', 'commerce', 'mvp', 'adapter_implemented', '["api"]', '[]', false),
  ('allegro', 'Allegro', 'commerce', 'mvp', 'sandbox_verified', '["allegro:api:sale:orders:read"]', '["allegro:api:sale:offers:read"]', true),
  ('google_ads', 'Google Ads', 'advertising', 'mvp', 'sandbox_verified', '["https://www.googleapis.com/auth/adwords"]', '[]', false),
  ('meta_ads', 'Meta Ads', 'advertising', 'mvp', 'sandbox_verified', '["ads_read"]', '[]', true),
  ('ga4', 'Google Analytics 4', 'analytics', 'mvp', 'adapter_implemented', '["https://www.googleapis.com/auth/analytics.readonly"]', '[]', false)
on conflict (provider_id) do update set
  display_name = excluded.display_name,
  category = excluded.category,
  catalog_status = excluded.catalog_status,
  adapter_status = excluded.adapter_status,
  required_scopes = excluded.required_scopes,
  optional_scopes = excluded.optional_scopes,
  supports_webhooks = excluded.supports_webhooks,
  updated_at = now();

alter table if exists app.integration_connections
  add column if not exists requested_scopes jsonb not null default '[]'::jsonb,
  add column if not exists granted_scopes jsonb not null default '[]'::jsonb,
  add column if not exists credential_expires_at timestamptz,
  add column if not exists deleted_at timestamptz;

alter table if exists app.sync_jobs
  add column if not exists operation text,
  add column if not exists from_time timestamptz,
  add column if not exists to_time timestamptz,
  add column if not exists failure_class text,
  add column if not exists max_attempts integer not null default 5;

create unique index if not exists sync_jobs_idempotency_unique
  on app.sync_jobs (tenant_id, workspace_id, idempotency_key);

create table if not exists app.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text not null,
  connection_id uuid not null,
  provider_id text not null,
  secret_reference text not null,
  required_scopes jsonb not null default '[]'::jsonb,
  granted_scopes jsonb not null default '[]'::jsonb,
  status text not null,
  issued_at timestamptz not null,
  expires_at timestamptz,
  rotated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.integration_webhook_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text not null,
  connection_id uuid not null,
  provider_id text not null,
  event_id text not null,
  event_type text not null,
  provider_timestamp timestamptz not null,
  schema_version text not null,
  signature_valid boolean not null,
  timestamp_valid boolean not null,
  replay_detected boolean not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (provider_id, event_id)
);

create table if not exists app.fx_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  quote_currency text not null,
  rate numeric(30, 12) not null,
  source text not null,
  observed_at timestamptz not null,
  ingested_at timestamptz not null default now(),
  unique (base_currency, quote_currency, source, observed_at)
);

create table if not exists app.source_authority_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text not null,
  fact_type text not null,
  field_path text not null,
  provider_priority jsonb not null,
  owner text not null,
  rationale text not null,
  status text not null,
  version text not null,
  valid_from timestamptz not null,
  valid_to timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists app.cross_provider_matches (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text not null,
  left_provider_id text not null,
  left_external_id text not null,
  right_provider_id text not null,
  right_external_id text not null,
  score numeric(6, 5) not null,
  matching_signals jsonb not null,
  state text not null,
  deduplication_version text not null,
  created_at timestamptz not null default now(),
  unique (
    tenant_id, workspace_id,
    left_provider_id, left_external_id,
    right_provider_id, right_external_id,
    deduplication_version
  )
);

create table if not exists app.data_inventory (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text not null,
  system text not null,
  dataset text not null,
  data_category text not null,
  retention_class text not null,
  retention_days integer not null,
  deletion_method text not null,
  legal_hold boolean not null default false,
  backup_cutoff_days integer not null,
  owner text not null,
  unique (tenant_id, workspace_id, system, dataset)
);

create table if not exists app.data_deletion_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text not null,
  inventory_id uuid not null references app.data_inventory(id),
  subject_reference text not null,
  status text not null,
  systems jsonb not null,
  correlation_id text not null,
  requested_at timestamptz not null,
  completed_at timestamptz
);

alter table if exists app.canonical_orders
  add column if not exists canonical_status text,
  add column if not exists source_currency text,
  add column if not exists reporting_currency text,
  add column if not exists gross_amount_minor bigint,
  add column if not exists net_amount_minor bigint,
  add column if not exists discount_amount_minor bigint,
  add column if not exists tax_amount_minor bigint,
  add column if not exists shipping_amount_minor bigint,
  add column if not exists fee_amount_minor bigint,
  add column if not exists refunded_amount_minor bigint,
  add column if not exists reporting_gross_amount_minor bigint,
  add column if not exists exchange_rate numeric(30, 12),
  add column if not exists exchange_rate_source text,
  add column if not exists exchange_rate_observed_at timestamptz,
  add column if not exists business_time timestamptz,
  add column if not exists effective_time timestamptz,
  add column if not exists timezone text,
  add column if not exists mapping_version text,
  add column if not exists deduplication_version text;

create or replace function app.current_tenant_id()
returns text language sql stable as $$
  select nullif(current_setting('app.tenant_id', true), '');
$$;

create or replace function app.current_workspace_id()
returns text language sql stable as $$
  select nullif(current_setting('app.workspace_id', true), '');
$$;

alter table app.integration_credentials enable row level security;
alter table app.integration_webhook_events enable row level security;
alter table app.source_authority_rules enable row level security;
alter table app.cross_provider_matches enable row level security;
alter table app.data_inventory enable row level security;
alter table app.data_deletion_ledger enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'integration_credentials',
    'integration_webhook_events',
    'source_authority_rules',
    'cross_provider_matches',
    'data_inventory',
    'data_deletion_ledger'
  ] loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'app'
        and tablename = table_name
        and policyname = table_name || '_tenant_workspace_policy'
    ) then
      execute format(
        'create policy %I on app.%I using '
        || '(tenant_id = app.current_tenant_id() and workspace_id = app.current_workspace_id()) '
        || 'with check '
        || '(tenant_id = app.current_tenant_id() and workspace_id = app.current_workspace_id())',
        table_name || '_tenant_workspace_policy',
        table_name
      );
    end if;
  end loop;
end $$;

commit;
