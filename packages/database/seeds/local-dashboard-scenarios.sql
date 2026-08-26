\set ON_ERROR_STOP on

\if :{?seed_scenario}
\else
  \echo 'ERROR: psql variable seed_scenario is required.'
  \quit 2
\endif

begin;
set local timezone = 'Europe/Warsaw';

create or replace function pg_temp.seed_uuid(input text)
returns uuid
language sql
immutable
as $$
  with value as (select md5(input) as h)
  select (
    substr(h, 1, 8) || '-' ||
    substr(h, 9, 4) || '-' ||
    '4' || substr(h, 14, 3) || '-' ||
    '8' || substr(h, 18, 3) || '-' ||
    substr(h, 21, 12)
  )::uuid
  from value;
$$;

create temp table seed_scenarios (
  scenario_key text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  owner_user_id uuid not null,
  owner_membership_id uuid not null,
  owner_email text not null,
  owner_name text not null,
  tenant_name text not null,
  workspace_name text not null,
  is_partial boolean not null,
  is_new_registration boolean not null
) on commit drop;

insert into seed_scenarios
select
  key,
  pg_temp.seed_uuid('papadata-local-seed:' || key || ':tenant'),
  pg_temp.seed_uuid('papadata-local-seed:' || key || ':workspace'),
  pg_temp.seed_uuid('papadata-local-seed:' || key || ':owner-user'),
  pg_temp.seed_uuid('papadata-local-seed:' || key || ':owner-membership'),
  owner_email,
  owner_name,
  tenant_name,
  workspace_name,
  is_partial,
  is_new_registration
from (values
  ('full-integrations', 'full.owner@local.papadata.test', 'Local Full Owner', 'Local Full Integrations', 'Full 7 Integrations', false, false),
  ('rbac-owner-employee', 'rbac.owner@local.papadata.test', 'Local RBAC Owner', 'Local RBAC', 'Owner + Analyst', false, false),
  ('new-registration-onboarding', 'new.owner@local.papadata.test', 'Local New Owner', 'Local New Registration', 'Completed Onboarding', false, true),
  ('partial-integrations', 'partial.owner@local.papadata.test', 'Local Partial Owner', 'Local Partial Integrations', 'Partial 4 of 7 Active', true, false)
) as scenarios(key, owner_email, owner_name, tenant_name, workspace_name, is_partial, is_new_registration)
where :'seed_scenario' = 'all' or :'seed_scenario' = key;

select (count(*) > 0) as seed_scenario_valid from seed_scenarios \gset
\if :seed_scenario_valid
\else
  \echo 'ERROR: Unknown seed_scenario:' :seed_scenario
  \quit 2
\endif

-- Password for every local seed account: LocalTest123!
-- Generated with the same Argon2id parameters as the production identity service:
-- m=19456, t=2, p=1.
create temp table seed_auth_constants (
  password_hash text not null,
  owner_capabilities jsonb not null,
  analyst_capabilities jsonb not null
) on commit drop;

insert into seed_auth_constants values (
  '$argon2id$v=19$m=19456,t=2,p=1$AGCR/iC5BlQVgvFhXDx3xQ$gVo2c4+8ZAdISK+yvcWtQ6reN5bFRGMvWEv7scTu97g',
  '[
    "auth.session.read","auth.session.revoke","auth.mfa.enroll","auth.mfa.manage","auth.step_up.issue",
    "tenant.membership.read","tenant.membership.manage","workspace.read","workspace.manage",
    "analytics.metrics.read","analytics.metrics.compare","analytics.metrics.export","analytics.command_center.read",
    "integrations.catalog.read","integrations.connection.read","integrations.connection.manage","integrations.credentials.manage","integrations.sync.run","integrations.jobs.read","integrations.jobs.manage",
    "reports.create","reports.read","reports.download",
    "ai.assistant.run","ai.action_proposal.create","ai.action_proposal.approve","ai.action_proposal.execute","ai.governance.read","ai.history.read",
    "privacy.own_consent.manage","privacy.tenant_policy.read","privacy.tenant_policy.manage","privacy.dsar.manage","privacy.deletion.approve","privacy.audit.read",
    "audit.read","billing.read","billing.manage"
  ]'::jsonb,
  '[
    "workspace.read",
    "analytics.metrics.read","analytics.metrics.compare","analytics.metrics.export","analytics.command_center.read",
    "integrations.catalog.read","integrations.connection.read","integrations.jobs.read",
    "reports.create","reports.read","reports.download",
    "ai.assistant.run","ai.history.read"
  ]'::jsonb
);

-- Base identity / tenancy / onboarding. The RLS context is set explicitly because
-- the current schema FORCEs tenant/workspace RLS even for table owners.
do $$
declare
  scenario record;
  constants record;
  identity_key text;
  created_at_value timestamptz;
begin
  select * into constants from seed_auth_constants;

  for scenario in select * from seed_scenarios order by scenario_key loop
    created_at_value := case
      when scenario.is_new_registration then now() - interval '2 hours'
      else now() - interval '365 days'
    end;

    perform set_config('app.tenant_id', scenario.tenant_id::text, true);
    perform set_config('app.workspace_id', scenario.workspace_id::text, true);

    insert into app.users (
      user_id, email, full_name, status, email_verified, mfa_enabled, created_at, updated_at
    ) values (
      scenario.owner_user_id, lower(scenario.owner_email), scenario.owner_name,
      'active', true, false, created_at_value, now()
    )
    on conflict (user_id) do update set
      email = excluded.email,
      full_name = excluded.full_name,
      status = 'active',
      email_verified = true,
      created_at = excluded.created_at,
      updated_at = now();

    identity_key := encode(digest(lower(scenario.owner_email), 'sha256'), 'hex');
    perform set_config('app.identity_key', identity_key, true);
    insert into app.identity_users (
      user_id, identity_key, normalized_email, password_hash, display_name,
      status, email_verified_at, failed_login_attempts, locked_until, created_at, updated_at
    ) values (
      scenario.owner_user_id, identity_key, lower(scenario.owner_email), constants.password_hash,
      scenario.owner_name, 'active', created_at_value + interval '5 minutes', 0, null,
      created_at_value, now()
    )
    on conflict (user_id) do update set
      identity_key = excluded.identity_key,
      normalized_email = excluded.normalized_email,
      password_hash = excluded.password_hash,
      display_name = excluded.display_name,
      status = 'active',
      email_verified_at = excluded.email_verified_at,
      failed_login_attempts = 0,
      locked_until = null,
      created_at = excluded.created_at,
      updated_at = now();

    insert into app.tenants (
      tenant_id, created_by_user_id, name, status, entitlements, verified_at, created_at, updated_at
    ) values (
      scenario.tenant_id, scenario.owner_user_id, scenario.tenant_name, 'active',
      constants.owner_capabilities, created_at_value + interval '5 minutes', created_at_value, now()
    )
    on conflict (tenant_id) do update set
      name = excluded.name,
      status = 'active',
      entitlements = excluded.entitlements,
      verified_at = excluded.verified_at,
      created_at = excluded.created_at,
      updated_at = now();

    insert into app.workspaces (
      workspace_id, tenant_id, created_by_user_id, name, status, created_at, updated_at
    ) values (
      scenario.workspace_id, scenario.tenant_id, scenario.owner_user_id,
      scenario.workspace_name, 'active', created_at_value + interval '10 minutes', now()
    )
    on conflict (workspace_id) do update set
      name = excluded.name,
      status = 'active',
      created_at = excluded.created_at,
      updated_at = now();

    insert into app.memberships (
      membership_id, tenant_id, workspace_id, user_id, role, status, data_scope, created_at, updated_at
    ) values (
      scenario.owner_membership_id, scenario.tenant_id, scenario.workspace_id,
      scenario.owner_user_id, 'Tenant Owner', 'active', 'tenant', created_at_value, now()
    )
    on conflict (membership_id) do update set
      role = 'Tenant Owner',
      status = 'active',
      data_scope = 'tenant',
      created_at = excluded.created_at,
      updated_at = now();

    perform set_config('app.identity_user_id', scenario.owner_user_id::text, true);
    insert into app.identity_memberships (
      membership_id, user_id, tenant_id, workspace_id, tenant_name, workspace_name,
      roles, capabilities, status, created_at, updated_at
    ) values (
      scenario.owner_membership_id, scenario.owner_user_id, scenario.tenant_id,
      scenario.workspace_id, scenario.tenant_name, scenario.workspace_name,
      '["Tenant Owner"]'::jsonb, constants.owner_capabilities, 'active', created_at_value, now()
    )
    on conflict (membership_id) do update set
      tenant_name = excluded.tenant_name,
      workspace_name = excluded.workspace_name,
      roles = excluded.roles,
      capabilities = excluded.capabilities,
      status = 'active',
      created_at = excluded.created_at,
      updated_at = now();

    insert into app.onboarding_states (
      tenant_id, workspace_id, company, business_profile, platform, data_sources, completed_at, updated_at
    ) values (
      scenario.tenant_id, scenario.workspace_id,
      'completed', 'completed', 'completed', 'completed',
      case when scenario.is_new_registration then created_at_value + interval '70 minutes' else created_at_value + interval '1 day' end,
      now()
    )
    on conflict (tenant_id, workspace_id) do update set
      company = 'completed',
      business_profile = 'completed',
      platform = 'completed',
      data_sources = 'completed',
      completed_at = excluded.completed_at,
      updated_at = now();

    insert into app.company_profiles (
      tenant_id, company_name, legal_name, tax_id, country, website, updated_at
    ) values (
      scenario.tenant_id,
      scenario.tenant_name,
      scenario.tenant_name || ' sp. z o.o.',
      'PL-SEED-' || right(replace(scenario.tenant_id::text, '-', ''), 10),
      'PL',
      'https://local.papadata.test/' || scenario.scenario_key,
      now()
    )
    on conflict (tenant_id) do update set
      company_name = excluded.company_name,
      legal_name = excluded.legal_name,
      tax_id = excluded.tax_id,
      country = excluded.country,
      website = excluded.website,
      updated_at = now();

    insert into app.business_profiles (
      tenant_id, workspace_id, sales_model, primary_market, average_order_value_band,
      currency, timezone, updated_at
    ) values (
      scenario.tenant_id, scenario.workspace_id,
      'ecommerce', 'PL', '50-150', 'PLN', 'Europe/Warsaw', now()
    )
    on conflict (tenant_id, workspace_id) do update set
      sales_model = excluded.sales_model,
      primary_market = excluded.primary_market,
      average_order_value_band = excluded.average_order_value_band,
      currency = excluded.currency,
      timezone = excluded.timezone,
      updated_at = now();
  end loop;
end
$$;

-- Limited employee for the RBAC scenario: Analyst + assigned_workspace.
do $$
declare
  scenario record;
  constants record;
  analyst_user_id uuid;
  analyst_membership_id uuid;
  analyst_email text := 'rbac.analyst@local.papadata.test';
  identity_key text;
begin
  select * into scenario from seed_scenarios where scenario_key = 'rbac-owner-employee';
  if not found then
    return;
  end if;
  select * into constants from seed_auth_constants;
  analyst_user_id := pg_temp.seed_uuid('papadata-local-seed:rbac-owner-employee:analyst-user');
  analyst_membership_id := pg_temp.seed_uuid('papadata-local-seed:rbac-owner-employee:analyst-membership');

  perform set_config('app.tenant_id', scenario.tenant_id::text, true);
  perform set_config('app.workspace_id', scenario.workspace_id::text, true);

  insert into app.users (
    user_id, email, full_name, status, email_verified, mfa_enabled, created_at, updated_at
  ) values (
    analyst_user_id, analyst_email, 'Local Limited Analyst', 'active', true, false,
    now() - interval '180 days', now()
  )
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    status = 'active',
    email_verified = true,
    updated_at = now();

  identity_key := encode(digest(analyst_email, 'sha256'), 'hex');
  perform set_config('app.identity_key', identity_key, true);
  insert into app.identity_users (
    user_id, identity_key, normalized_email, password_hash, display_name,
    status, email_verified_at, failed_login_attempts, locked_until, created_at, updated_at
  ) values (
    analyst_user_id, identity_key, analyst_email, constants.password_hash,
    'Local Limited Analyst', 'active', now() - interval '180 days', 0, null,
    now() - interval '180 days', now()
  )
  on conflict (user_id) do update set
    identity_key = excluded.identity_key,
    normalized_email = excluded.normalized_email,
    password_hash = excluded.password_hash,
    display_name = excluded.display_name,
    status = 'active',
    failed_login_attempts = 0,
    locked_until = null,
    updated_at = now();

  insert into app.memberships (
    membership_id, tenant_id, workspace_id, user_id, role, status, data_scope, created_at, updated_at
  ) values (
    analyst_membership_id, scenario.tenant_id, scenario.workspace_id,
    analyst_user_id, 'Analyst', 'active', 'assigned_workspace',
    now() - interval '180 days', now()
  )
  on conflict (membership_id) do update set
    role = 'Analyst',
    status = 'active',
    data_scope = 'assigned_workspace',
    updated_at = now();

  perform set_config('app.identity_user_id', analyst_user_id::text, true);
  insert into app.identity_memberships (
    membership_id, user_id, tenant_id, workspace_id, tenant_name, workspace_name,
    roles, capabilities, status, created_at, updated_at
  ) values (
    analyst_membership_id, analyst_user_id, scenario.tenant_id, scenario.workspace_id,
    scenario.tenant_name, scenario.workspace_name,
    '["Analyst"]'::jsonb, constants.analyst_capabilities, 'active',
    now() - interval '180 days', now()
  )
  on conflict (membership_id) do update set
    tenant_name = excluded.tenant_name,
    workspace_name = excluded.workspace_name,
    roles = excluded.roles,
    capabilities = excluded.capabilities,
    status = 'active',
    updated_at = now();
end
$$;

create temp table seed_providers (
  provider_id text primary key,
  category text not null,
  streams text[] not null,
  required_scopes jsonb not null,
  is_commerce boolean not null
) on commit drop;

insert into seed_providers values
  ('woocommerce', 'commerce', array['orders','products','refunds','inventory'], '["read"]'::jsonb, true),
  ('shopify', 'commerce', array['orders','products','refunds','inventory'], '["read_orders","read_products","read_inventory"]'::jsonb, true),
  ('baselinker', 'commerce', array['orders','products','inventory'], '["api"]'::jsonb, true),
  ('allegro', 'commerce', array['orders','products','refunds','inventory'], '["allegro:api:sale:orders:read"]'::jsonb, true),
  ('google_ads', 'advertising', array['ad_spend','attributed_conversions'], '["https://www.googleapis.com/auth/adwords"]'::jsonb, false),
  ('meta_ads', 'advertising', array['ad_spend','attributed_conversions'], '["ads_read"]'::jsonb, false),
  ('ga4', 'analytics', array['traffic','events','conversions'], '["https://www.googleapis.com/auth/analytics.readonly"]'::jsonb, false);

-- Connections, credentials, jobs, batches and checkpoints.
do $$
declare
  scenario record;
  provider record;
  stream_name text;
  v_connection_id uuid;
  v_sync_job_id uuid;
  batch_id uuid;
  active_connection boolean;
  primary_inventory boolean;
  connection_status text;
  credential_status text;
  rotation_state text;
  connected_at_value timestamptz;
begin
  for scenario in select * from seed_scenarios order by scenario_key loop
    perform set_config('app.tenant_id', scenario.tenant_id::text, true);
    perform set_config('app.workspace_id', scenario.workspace_id::text, true);

    for provider in select * from seed_providers order by provider_id loop
      active_connection := not scenario.is_partial
        or provider.provider_id in ('woocommerce','baselinker','allegro','google_ads');
      primary_inventory := active_connection and (
        (not scenario.is_partial and provider.provider_id = 'shopify')
        or (scenario.is_partial and provider.provider_id = 'woocommerce')
      );
      connection_status := case when active_connection then 'active' else 'disconnected' end;
      credential_status := case when active_connection then 'active' else 'revoked' end;
      rotation_state := case when active_connection then 'active' else 'revoked' end;
      connected_at_value := case
        when scenario.is_new_registration then now() - interval '60 minutes'
        else now() - interval '200 days'
      end;
      v_connection_id := pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':connection:' || provider.provider_id);
      v_sync_job_id := pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':sync-job:' || provider.provider_id);

      insert into app.integration_connections (
        connection_id, tenant_id, workspace_id, provider_id, status,
        external_account_id, account_name, credential_ref, is_primary_inventory_source,
        connected_at, reauthorized_at, disconnected_at, created_at, updated_at,
        requested_scopes, granted_scopes, credential_expires_at, deleted_at, idempotency_key
      ) values (
        v_connection_id, scenario.tenant_id, scenario.workspace_id, provider.provider_id, connection_status,
        'seed-' || provider.provider_id || '-account',
        'Local Seed ' || provider.provider_id,
        'local-seed://' || scenario.scenario_key || '/' || provider.provider_id,
        primary_inventory,
        connected_at_value,
        null,
        case when active_connection then null else now() - interval '1 day' end,
        connected_at_value,
        now(),
        provider.required_scopes,
        provider.required_scopes,
        null,
        null,
        'local-seed:' || scenario.scenario_key || ':' || provider.provider_id
      )
      on conflict (connection_id) do update set
        status = excluded.status,
        external_account_id = excluded.external_account_id,
        account_name = excluded.account_name,
        credential_ref = excluded.credential_ref,
        is_primary_inventory_source = excluded.is_primary_inventory_source,
        requested_scopes = excluded.requested_scopes,
        granted_scopes = excluded.granted_scopes,
        connected_at = excluded.connected_at,
        disconnected_at = excluded.disconnected_at,
        updated_at = now(),
        deleted_at = null,
        idempotency_key = excluded.idempotency_key;

      insert into app.integration_credentials (
        id, tenant_id, workspace_id, connection_id, provider_id,
        secret_reference, required_scopes, granted_scopes, status,
        issued_at, expires_at, rotated_at, revoked_at, created_at, updated_at,
        credential_reference, secret_resource, active_version, previous_version,
        rotation_state, last_verified_at
      ) values (
        pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':credential:' || provider.provider_id),
        scenario.tenant_id::text, scenario.workspace_id::text, v_connection_id, provider.provider_id,
        'local-seed-secret://' || scenario.scenario_key || '/' || provider.provider_id,
        provider.required_scopes, provider.required_scopes, credential_status,
        connected_at_value, null, null,
        case when active_connection then null else now() - interval '1 day' end,
        connected_at_value, now(),
        'local-seed://' || scenario.scenario_key || '/' || provider.provider_id,
        'local-seed-secret://' || scenario.scenario_key || '/' || provider.provider_id,
        'seed-v1', null, rotation_state,
        case when active_connection then now() - interval '5 minutes' else now() - interval '1 day' end
      )
      on conflict (id) do update set
        status = excluded.status,
        required_scopes = excluded.required_scopes,
        granted_scopes = excluded.granted_scopes,
        issued_at = excluded.issued_at,
        revoked_at = excluded.revoked_at,
        rotation_state = excluded.rotation_state,
        last_verified_at = excluded.last_verified_at,
        updated_at = now();

      if active_connection then
        insert into app.sync_jobs (
          sync_job_id, tenant_id, workspace_id, connection_id, provider_id,
          job_kind, status, streams, attempts, created_at, started_at, completed_at,
          idempotency_key, operation, from_time, to_time, max_attempts, updated_at
        ) values (
          v_sync_job_id, scenario.tenant_id, scenario.workspace_id, v_connection_id, provider.provider_id,
          'initial_sync', 'succeeded', provider.streams, 1,
          now() - interval '15 minutes', now() - interval '14 minutes', now() - interval '5 minutes',
          'local-seed-sync:' || scenario.scenario_key || ':' || provider.provider_id,
          'seed', now() - interval '200 days', now(), 5, now()
        )
        on conflict (sync_job_id) do update set
          status = 'succeeded',
          streams = excluded.streams,
          created_at = excluded.created_at,
          started_at = excluded.started_at,
          completed_at = excluded.completed_at,
          from_time = excluded.from_time,
          to_time = excluded.to_time,
          updated_at = now();

        foreach stream_name in array provider.streams loop
          batch_id := pg_temp.seed_uuid(
            'papadata-local-seed:' || scenario.scenario_key || ':batch:' || provider.provider_id || ':' || stream_name
          );
          insert into app.source_batches (
            source_batch_id, tenant_id, workspace_id, connection_id, sync_job_id,
            provider_id, stream, status, record_count, started_at, completed_at,
            provider_cursor, fetch_started_at, fetch_finished_at, payload_checksum,
            schema_version, attempt, correlation_id
          ) values (
            batch_id, scenario.tenant_id, scenario.workspace_id, v_connection_id, v_sync_job_id,
            provider.provider_id, stream_name, 'success', 0,
            now() - interval '14 minutes', now() - interval '5 minutes',
            'seed-complete', now() - interval '14 minutes', now() - interval '6 minutes',
            encode(digest(scenario.scenario_key || provider.provider_id || stream_name, 'sha256'), 'hex'),
            'provider.raw.v1', 1,
            'local-seed:' || scenario.scenario_key || ':' || provider.provider_id || ':' || stream_name
          )
          on conflict (source_batch_id) do update set
            status = 'success',
            started_at = excluded.started_at,
            completed_at = excluded.completed_at,
            fetch_started_at = excluded.fetch_started_at,
            fetch_finished_at = excluded.fetch_finished_at,
            payload_checksum = excluded.payload_checksum;

          insert into app.sync_checkpoints (
            sync_checkpoint_id, tenant_id, workspace_id, connection_id, provider_id,
            stream, cursor, watermark, updated_at, checkpoint_version, updated_by_sync_job_id
          ) values (
            pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':checkpoint:' || provider.provider_id || ':' || stream_name),
            scenario.tenant_id, scenario.workspace_id, v_connection_id, provider.provider_id,
            stream_name, 'local-seed-complete', now() - interval '5 minutes', now() - interval '5 minutes',
            1, v_sync_job_id
          )
          on conflict (tenant_id, workspace_id, connection_id, provider_id, stream) do update set
            cursor = excluded.cursor,
            watermark = excluded.watermark,
            updated_at = excluded.updated_at,
            checkpoint_version = app.sync_checkpoints.checkpoint_version + 1,
            updated_by_sync_job_id = excluded.updated_by_sync_job_id;
        end loop;
      end if;
    end loop;
  end loop;
end
$$;

create or replace procedure pg_temp.put_fact(
  p_scenario text,
  p_tenant uuid,
  p_workspace uuid,
  p_provider text,
  p_stream text,
  p_external_id text,
  p_payload jsonb,
  p_business_time timestamptz
)
language plpgsql
as $$
declare
  v_source_record_id uuid;
  v_connection_id uuid;
  v_batch_id uuid;
  v_fingerprint text;
begin
  perform set_config('app.tenant_id', p_tenant::text, true);
  perform set_config('app.workspace_id', p_workspace::text, true);

  v_source_record_id := pg_temp.seed_uuid(
    'papadata-local-seed:' || p_scenario || ':source:' || p_provider || ':' || p_stream || ':' || p_external_id
  );
  v_connection_id := pg_temp.seed_uuid('papadata-local-seed:' || p_scenario || ':connection:' || p_provider);
  v_batch_id := pg_temp.seed_uuid('papadata-local-seed:' || p_scenario || ':batch:' || p_provider || ':' || p_stream);
  v_fingerprint := encode(digest(p_scenario || '|' || p_provider || '|' || p_stream || '|' || p_external_id, 'sha256'), 'hex');

  insert into app.source_records (
    source_record_id, tenant_id, workspace_id, source_batch_id, connection_id,
    provider_id, stream, external_id, fingerprint, payload, ingested_at,
    provider_object_type, provider_object_id, provider_updated_at,
    payload_checksum, idempotency_key, schema_version
  ) values (
    v_source_record_id, p_tenant, p_workspace, v_batch_id, v_connection_id,
    p_provider, p_stream, p_external_id, v_fingerprint,
    jsonb_build_object('seed', true, 'entity', p_payload), now(),
    p_stream, p_external_id, p_business_time,
    encode(digest(p_payload::text, 'sha256'), 'hex'),
    'local-seed:' || p_scenario || ':' || p_provider || ':' || p_stream || ':' || p_external_id,
    'provider.raw.v1'
  )
  on conflict (source_record_id) do update set
    payload = excluded.payload,
    provider_updated_at = excluded.provider_updated_at,
    payload_checksum = excluded.payload_checksum,
    ingested_at = now();

  insert into app.normalized_records (
    normalized_record_id, tenant_id, workspace_id, source_record_id,
    provider_id, stream, external_id, payload, validation_status, normalized_at
  ) values (
    pg_temp.seed_uuid('papadata-local-seed:' || p_scenario || ':normalized:' || p_provider || ':' || p_stream || ':' || p_external_id),
    p_tenant, p_workspace, v_source_record_id,
    p_provider, p_stream, p_external_id, p_payload, 'valid', now()
  )
  on conflict (source_record_id) do update set
    payload = excluded.payload,
    validation_status = 'valid',
    normalized_at = now();

  insert into app.integration_canonical_records (
    canonical_record_id, tenant_id, workspace_id, source_record_id, connection_id,
    provider_id, stream, external_id, canonical_payload, canonical_version,
    source_lineage, business_time, ingested_at, updated_at
  ) values (
    pg_temp.seed_uuid('papadata-local-seed:' || p_scenario || ':canonical:' || p_provider || ':' || p_stream || ':' || p_external_id),
    p_tenant, p_workspace, v_source_record_id, v_connection_id,
    p_provider, p_stream, p_external_id, p_payload, 'integration.canonical.v1',
    jsonb_build_object(
      'seed', true,
      'scenario', p_scenario,
      'providerId', p_provider,
      'stream', p_stream,
      'sourceRecordId', v_source_record_id::text
    ),
    p_business_time, now(), now()
  )
  on conflict (source_record_id) do update set
    canonical_payload = excluded.canonical_payload,
    source_lineage = excluded.source_lineage,
    business_time = excluded.business_time,
    updated_at = now();
end;
$$;

-- Canonical source facts. Daily variation uses k = day_offset % 7 so charts and
-- driver correlations are non-flat while 1/7/30/90-day aggregates remain deterministic.
do $$
declare
  scenario record;
  day_offset integer;
  k integer;
  business_time timestamptz;
  provider text;
  provider_key text;
  order_gross numeric;
  quantity integer;
  unit_cost numeric;
  sku text;
  product_external_id text;
  customer_reference text;
  customer_type text;
  spend numeric;
  clicks integer;
  impressions integer;
  conversion_value numeric;
begin
  for scenario in select * from seed_scenarios order by scenario_key loop
    perform set_config('app.tenant_id', scenario.tenant_id::text, true);
    perform set_config('app.workspace_id', scenario.workspace_id::text, true);

    -- Products exist before the tested window and are read as catalog history.
    for provider in
      select provider_id
      from seed_providers
      where is_commerce
        and (not scenario.is_partial or provider_id in ('woocommerce','baselinker','allegro'))
      order by provider_id
    loop
      product_external_id := provider || '-product-1';
      sku := case provider
        when 'woocommerce' then 'SKU-WOO-1'
        when 'shopify' then 'SKU-SHP-1'
        when 'baselinker' then 'SKU-BSL-1'
        else 'SKU-ALG-1'
      end;
      unit_cost := case provider
        when 'woocommerce' then 20
        when 'shopify' then 25
        when 'baselinker' then 30
        else 35
      end;

      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        provider, 'products', product_external_id,
        jsonb_build_object(
          'name', 'Local Seed Product ' || upper(provider),
          'sku', sku,
          'unitCost', unit_cost,
          'currency', 'PLN'
        ),
        now() - interval '199 days'
      );

      -- Current inventory snapshot. The metric engine uses only the connection
      -- marked as primary inventory authority.
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        provider, 'inventory', provider || '-inventory-current',
        jsonb_build_object(
          'productId', product_external_id,
          'availableQuantity', case provider
            when 'woocommerce' then 100
            when 'shopify' then 120
            when 'baselinker' then 80
            else 90
          end
        ),
        greatest(
          now() - interval '5 minutes',
          current_date::timestamp at time zone 'Europe/Warsaw'
        )
      );
    end loop;

    for day_offset in 0..199 loop
      k := day_offset % 7;
      business_time := case
        when day_offset = 0 then greatest(
          now() - interval '5 minutes',
          current_date::timestamp at time zone 'Europe/Warsaw'
        )
        else ((current_date - day_offset) + time '12:00') at time zone 'Europe/Warsaw'
      end;

      -- Commerce orders from every active commerce source.
      for provider in
        select provider_id
        from seed_providers
        where is_commerce
          and (not scenario.is_partial or provider_id in ('woocommerce','baselinker','allegro'))
        order by provider_id
      loop
        order_gross := case provider
          when 'woocommerce' then 100 + (2 * k)
          when 'shopify' then 120 + (3 * k)
          when 'baselinker' then 80 + k
          else 90 + (2 * k)
        end;
        quantity := case when provider in ('woocommerce','shopify') then 2 else 1 end;
        product_external_id := provider || '-product-1';
        customer_type := case when day_offset % 2 = 0 then 'returning' else 'new' end;
        customer_reference := case
          when customer_type = 'returning' then provider || '-returning-' || (day_offset % 8)::text
          else provider || '-new-' || day_offset::text
        end;

        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          provider, 'orders', provider || '-order-' || day_offset::text,
          jsonb_build_object(
            'grossAmount', order_gross,
            'currency', 'PLN',
            'orderNumber', upper(substr(provider, 1, 3)) || '-' || day_offset::text,
            'status', 'completed',
            'customerReference', customer_reference,
            'customerType', customer_type,
            'lineItems', jsonb_build_array(jsonb_build_object(
              'externalProductId', product_external_id,
              'quantity', quantity,
              'grossAmount', order_gross
            ))
          ),
          business_time
        );
      end loop;

      -- A deliberately huge cancelled WooCommerce order proves excluded statuses
      -- never leak into revenue/orders/product/customer KPI calculations.
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        'woocommerce', 'orders', 'woocommerce-cancelled-' || day_offset::text,
        jsonb_build_object(
          'grossAmount', 9999,
          'currency', 'PLN',
          'orderNumber', 'WOO-CANCEL-' || day_offset::text,
          'status', 'cancelled',
          'customerReference', 'cancelled-customer-' || day_offset::text,
          'customerType', 'new',
          'lineItems', jsonb_build_array(jsonb_build_object(
            'externalProductId', 'woocommerce-product-1',
            'quantity', 99,
            'grossAmount', 9999
          ))
        ),
        business_time
      );

      -- Linked partial refunds from every active commerce provider whose production
      -- registry exposes a refund stream. BaseLinker intentionally has no refund stream.
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        'woocommerce', 'refunds', 'woocommerce-refund-' || day_offset::text,
        jsonb_build_object(
          'amount', 10 + k,
          'currency', 'PLN',
          'orderId', 'woocommerce-order-' || day_offset::text,
          'returnedQuantity', 1
        ),
        business_time
      );
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        'allegro', 'refunds', 'allegro-refund-' || day_offset::text,
        jsonb_build_object(
          'amount', 4 + k,
          'currency', 'PLN',
          'orderId', 'allegro-order-' || day_offset::text,
          'returnedQuantity', 1
        ),
        business_time
      );
      if not scenario.is_partial then
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'shopify', 'refunds', 'shopify-refund-' || day_offset::text,
          jsonb_build_object(
            'amount', 6 + k,
            'currency', 'PLN',
            'orderId', 'shopify-order-' || day_offset::text,
            'returnedQuantity', 1
          ),
          business_time
        );
      end if;

      -- Paid media. The pattern preserves CPC=0.50, CPM=10, CTR=2%, ROAS=4.
      if not scenario.is_partial then
        spend := 20 + k;
        clicks := 40 + (2 * k);
        impressions := 2000 + (100 * k);
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'meta_ads', 'ad_spend', 'meta-spend-' || day_offset::text,
          jsonb_build_object(
            'spend', spend, 'currency', 'PLN', 'campaignId', 'meta-seed-campaign',
            'clicks', clicks, 'impressions', impressions
          ),
          business_time
        );
        conversion_value := spend * 4;
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'meta_ads', 'attributed_conversions', 'meta-conversion-' || day_offset::text,
          jsonb_build_object(
            'conversionValue', conversion_value, 'currency', 'PLN', 'campaignId', 'meta-seed-campaign'
          ),
          business_time
        );
      end if;

      spend := 40 + (2 * k);
      clicks := 80 + (4 * k);
      impressions := 4000 + (200 * k);
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        'google_ads', 'ad_spend', 'google-spend-' || day_offset::text,
        jsonb_build_object(
          'spend', spend, 'currency', 'PLN', 'campaignId', 'google-seed-campaign',
          'clicks', clicks, 'impressions', impressions
        ),
        business_time
      );
      conversion_value := (spend * 4) / 2;
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        'google_ads', 'attributed_conversions', 'google-conversion-a-' || day_offset::text,
        jsonb_build_object(
          'conversionValue', conversion_value, 'currency', 'PLN', 'campaignId', 'google-seed-campaign'
        ),
        business_time
      );
      call pg_temp.put_fact(
        scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
        'google_ads', 'attributed_conversions', 'google-conversion-b-' || day_offset::text,
        jsonb_build_object(
          'conversionValue', conversion_value, 'currency', 'PLN', 'campaignId', 'google-seed-campaign'
        ),
        business_time
      );

      -- GA4 traffic: two channel rows/day. Totals keep checkout -> purchase at 25%
      -- while sessions and funnel counts still vary through the week.
      if not scenario.is_partial then
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'ga4', 'traffic', 'ga4-google-' || day_offset::text,
          jsonb_build_object(
            'sessions', 120 + (12 * k),
            'users', 96 + (8 * k),
            'homePageCount', 108 + (10 * k),
            'productViewCount', 72 + (8 * k),
            'addToCartCount', 24 + (3 * k),
            'cartViewCount', 18 + (2 * k),
            'checkoutStartCount', 12 + (2 * k),
            'purchaseCount', 3,
            'source', 'google',
            'medium', 'cpc',
            'completeness', 1
          ),
          business_time
        );
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'ga4', 'traffic', 'ga4-organic-' || day_offset::text,
          jsonb_build_object(
            'sessions', 80 + (8 * k),
            'users', 64 + (8 * k),
            'homePageCount', 72 + (6 * k),
            'productViewCount', 48 + (5 * k),
            'addToCartCount', 16 + (3 * k),
            'cartViewCount', 12 + (2 * k),
            'checkoutStartCount', 8 + (2 * k),
            'purchaseCount', 2 + k,
            'source', 'organic',
            'medium', 'organic',
            'completeness', 1
          ),
          business_time
        );
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'ga4', 'events', 'ga4-events-' || day_offset::text,
          jsonb_build_object(
            'eventName', 'page_view',
            'eventCount', 260 + (24 * k),
            'users', 160 + (16 * k)
          ),
          business_time
        );
        call pg_temp.put_fact(
          scenario.scenario_key, scenario.tenant_id, scenario.workspace_id,
          'ga4', 'conversions', 'ga4-conversions-' || day_offset::text,
          jsonb_build_object(
            'conversionName', 'purchase',
            'conversions', 5 + k,
            'users', 5 + k
          ),
          business_time
        );
      end if;
    end loop;

    -- Recompute source-batch counts after idempotent upserts.
    update app.source_batches as batch
       set record_count = counts.record_count,
           completed_at = now() - interval '5 minutes'
      from (
        select source_batch_id, count(*)::int as record_count
        from app.source_records
        where tenant_id = scenario.tenant_id and workspace_id = scenario.workspace_id
        group by source_batch_id
      ) as counts
     where batch.source_batch_id = counts.source_batch_id
       and batch.tenant_id = scenario.tenant_id
       and batch.workspace_id = scenario.workspace_id;

    -- Passed reconciliation per active provider; the latest workspace run remains passed.
    for provider_key in
      select provider_id
      from seed_providers
      where not scenario.is_partial or provider_id in ('woocommerce','baselinker','allegro','google_ads')
      order by provider_id
    loop
      insert into app.integration_reconciliation_runs (
        reconciliation_run_id, tenant_id, workspace_id, connection_id, provider_id,
        sync_job_id, source_batch_id, fetched_count, persisted_source_count,
        normalized_count, canonical_count, rejected_count, duplicate_count,
        failed_count, status, failure_reason, created_at
      )
      select
        pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':reconciliation:' || provider_key),
        scenario.tenant_id,
        scenario.workspace_id,
        pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':connection:' || provider_key),
        provider_key,
        pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':sync-job:' || provider_key),
        null,
        count(*)::int,
        count(*)::int,
        count(*)::int,
        count(*)::int,
        0, 0, 0, 'passed', null,
        now() - interval '4 minutes'
      from app.source_records
      where tenant_id = scenario.tenant_id
        and workspace_id = scenario.workspace_id
        and provider_id = provider_key
      on conflict (reconciliation_run_id) do update set
        fetched_count = excluded.fetched_count,
        persisted_source_count = excluded.persisted_source_count,
        normalized_count = excluded.normalized_count,
        canonical_count = excluded.canonical_count,
        rejected_count = 0,
        duplicate_count = 0,
        failed_count = 0,
        status = 'passed',
        failure_reason = null,
        created_at = excluded.created_at;
    end loop;
  end loop;
end
$$;

commit;

\echo 'Local PapaData dashboard seed completed.'
\echo 'Scenario:' :seed_scenario
\echo 'Password for all seeded accounts: LocalTest123!'
