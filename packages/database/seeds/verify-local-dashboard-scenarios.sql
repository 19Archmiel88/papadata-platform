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

create temp table verify_scenarios (
  scenario_key text primary key,
  tenant_id uuid not null,
  workspace_id uuid not null,
  expected_active_connections integer not null,
  is_partial boolean not null
) on commit drop;

insert into verify_scenarios
select
  key,
  pg_temp.seed_uuid('papadata-local-seed:' || key || ':tenant'),
  pg_temp.seed_uuid('papadata-local-seed:' || key || ':workspace'),
  expected_active_connections,
  is_partial
from (values
  ('full-integrations', 7, false),
  ('rbac-owner-employee', 7, false),
  ('new-registration-onboarding', 7, false),
  ('partial-integrations', 4, true)
) as scenarios(key, expected_active_connections, is_partial)
where :'seed_scenario' = 'all' or :'seed_scenario' = key;

select (count(*) > 0) as seed_scenario_valid from verify_scenarios \gset
\if :seed_scenario_valid
\else
  \echo 'ERROR: Unknown seed_scenario:' :seed_scenario
  \quit 2
\endif

-- Runtime canonical envelope gate.
do $$
begin
  if exists (
    select 1
      from app.integration_canonical_records r
     where coalesce((r.source_lineage ->> 'seed')::boolean, false)
       and (
         jsonb_typeof(r.canonical_payload) <> 'object'
         or jsonb_typeof(r.canonical_payload -> 'entity') <> 'object'
         or r.canonical_payload ->> 'version' <> 'integration.canonical.v1'
         or r.canonical_payload ->> 'providerId' <> r.provider_id
         or r.canonical_payload ->> 'stream' <> r.stream
         or r.canonical_payload ->> 'externalId' <> r.external_id
       )
  ) then
    raise exception 'Seed canonical payload does not match the production runtime envelope';
  end if;
end;
$$;

do $$
declare
  scenario record;
  window_days integer;
  weekly_variation_sum integer;
  range_start timestamptz;
  range_end timestamptz := now();
  connection_count integer;
  active_connection_count integer;
  primary_inventory_count integer;
  active_credential_count integer;
  passed_reconciliation_count integer;
  open_issue_count integer;
  stale_checkpoint_count integer;
  actual_orders integer;
  actual_gross numeric;
  actual_refunds numeric;
  actual_revenue numeric;
  actual_units numeric;
  actual_product_cost numeric;
  actual_ad_spend numeric;
  actual_clicks numeric;
  actual_impressions numeric;
  actual_conversions integer;
  actual_attributed_revenue numeric;
  actual_traffic_rows integer;
  actual_traffic_channel_rows integer;
  actual_funnel_rows integer;
  actual_checkout numeric;
  actual_purchases numeric;
  actual_completeness numeric;
  expected_orders integer;
  expected_gross numeric;
  expected_refunds numeric;
  expected_revenue numeric;
  expected_units numeric;
  expected_product_cost numeric;
  expected_ad_spend numeric;
  expected_conversions integer;
  expected_attributed_revenue numeric;
  expected_cpa numeric;
  actual_aov numeric;
  actual_roas numeric;
  actual_cpa numeric;
  actual_cpc numeric;
  actual_cpm numeric;
  actual_ctr numeric;
  actual_gross_margin numeric;
  expected_gross_margin numeric;
  actual_cart_conversion numeric;
  expected_traffic_rows integer;
  expected_traffic_channel_rows integer;
  expected_funnel_rows integer;
  new_created_at timestamptz;
  onboarding_completed_at timestamptz;
  first_connection_at timestamptz;
  owner_email text;
  expected_stock numeric;
  expected_stock_value numeric;
  actual_stock numeric;
  actual_stock_value numeric;
begin
  for scenario in select * from verify_scenarios order by scenario_key loop
    perform set_config('app.tenant_id', scenario.tenant_id::text, true);
    perform set_config('app.workspace_id', scenario.workspace_id::text, true);

    select u.email into owner_email
      from app.users u
     where u.user_id = pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':owner-user');
    if owner_email is null then
      raise exception '[%] owner user is missing', scenario.scenario_key;
    end if;
    perform set_config(
      'app.identity_user_id',
      pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':owner-user')::text,
      true
    );
    perform set_config('app.identity_key', encode(digest(lower(owner_email), 'sha256'), 'hex'), true);

    if not exists (
      select 1 from app.identity_memberships im
       where im.tenant_id = scenario.tenant_id
         and im.workspace_id = scenario.workspace_id
         and im.user_id = pg_temp.seed_uuid('papadata-local-seed:' || scenario.scenario_key || ':owner-user')
         and im.status = 'active'
         and im.roles ? 'Tenant Owner'
         and im.capabilities ? 'analytics.command_center.read'
         and im.capabilities ? 'integrations.connection.manage'
         and im.capabilities ? 'integrations.credentials.manage'
         and im.capabilities ? 'integrations.sync.run'
    ) then
      raise exception '[%] owner identity membership is missing full workspace capabilities', scenario.scenario_key;
    end if;

    select count(*)::int,
           count(*) filter (where c.status = 'active')::int,
           count(*) filter (where c.status = 'active' and c.is_primary_inventory_source)::int
      into connection_count, active_connection_count, primary_inventory_count
      from app.integration_connections c
     where c.tenant_id = scenario.tenant_id
       and c.workspace_id = scenario.workspace_id;

    if connection_count <> 7 then
      raise exception '[%] expected 7 integration connections, got %', scenario.scenario_key, connection_count;
    end if;
    if active_connection_count <> scenario.expected_active_connections then
      raise exception '[%] expected % active connections, got %', scenario.scenario_key, scenario.expected_active_connections, active_connection_count;
    end if;
    if primary_inventory_count <> 1 then
      raise exception '[%] expected exactly one active primary inventory source, got %', scenario.scenario_key, primary_inventory_count;
    end if;

    select count(*)::int
      into connection_count
      from app.integration_credentials cr
     where cr.tenant_id = scenario.tenant_id::text
       and cr.workspace_id = scenario.workspace_id::text;
    if connection_count <> 7 then
      raise exception '[%] expected 7 credential records, got %', scenario.scenario_key, connection_count;
    end if;

    select count(*)::int
      into active_credential_count
      from app.integration_credentials cr
     where cr.tenant_id = scenario.tenant_id::text
       and cr.workspace_id = scenario.workspace_id::text
       and cr.status = 'active';
    if active_credential_count <> scenario.expected_active_connections then
      raise exception '[%] expected % active credentials, got %', scenario.scenario_key, scenario.expected_active_connections, active_credential_count;
    end if;

    if not exists (
      select 1 from app.onboarding_states o
       where o.tenant_id = scenario.tenant_id
         and o.workspace_id = scenario.workspace_id
         and o.company = 'completed'
         and o.business_profile = 'completed'
         and o.platform = 'completed'
         and o.data_sources = 'completed'
         and o.completed_at is not null
    ) then
      raise exception '[%] onboarding is not fully completed', scenario.scenario_key;
    end if;

    if not exists (
      select 1 from app.memberships m
       where m.tenant_id = scenario.tenant_id
         and m.workspace_id = scenario.workspace_id
         and m.role = 'Tenant Owner'
         and m.status = 'active'
         and m.data_scope = 'tenant'
    ) then
      raise exception '[%] Tenant Owner membership is missing or invalid', scenario.scenario_key;
    end if;

    if scenario.scenario_key = 'rbac-owner-employee' then
      perform set_config(
        'app.identity_user_id',
        pg_temp.seed_uuid('papadata-local-seed:rbac-owner-employee:analyst-user')::text,
        true
      );
      perform set_config(
        'app.identity_key',
        encode(digest('rbac.analyst@local.papadata.test', 'sha256'), 'hex'),
        true
      );

      if not exists (
        select 1
          from app.memberships m
          join app.users u on u.user_id = m.user_id
         where m.tenant_id = scenario.tenant_id
           and m.workspace_id = scenario.workspace_id
           and u.email = 'rbac.analyst@local.papadata.test'
           and m.role = 'Analyst'
           and m.status = 'active'
           and m.data_scope = 'assigned_workspace'
      ) then
        raise exception '[%] limited Analyst membership is missing or invalid', scenario.scenario_key;
      end if;

      if not exists (
        select 1
          from app.identity_memberships im
          join app.identity_users iu on iu.user_id = im.user_id
         where im.tenant_id = scenario.tenant_id
           and im.workspace_id = scenario.workspace_id
           and iu.normalized_email = 'rbac.analyst@local.papadata.test'
           and im.status = 'active'
           and im.roles ? 'Analyst'
           and im.capabilities ? 'analytics.command_center.read'
           and im.capabilities ? 'integrations.connection.read'
      ) then
        raise exception '[%] Analyst identity membership/capabilities are missing', scenario.scenario_key;
      end if;

      if exists (
        select 1
          from app.identity_memberships im
          join app.identity_users iu on iu.user_id = im.user_id
         where im.tenant_id = scenario.tenant_id
           and im.workspace_id = scenario.workspace_id
           and iu.normalized_email = 'rbac.analyst@local.papadata.test'
           and (
             im.capabilities ? 'integrations.connection.manage'
             or im.capabilities ? 'integrations.credentials.manage'
             or im.capabilities ? 'integrations.sync.run'
             or im.capabilities ? 'integrations.jobs.manage'
           )
      ) then
        raise exception '[%] Analyst unexpectedly has integration-management capabilities', scenario.scenario_key;
      end if;
    end if;

    if scenario.scenario_key = 'new-registration-onboarding' then
      select u.created_at, o.completed_at, min(c.connected_at)
        into new_created_at, onboarding_completed_at, first_connection_at
        from app.users u
        join app.onboarding_states o
          on o.tenant_id = scenario.tenant_id and o.workspace_id = scenario.workspace_id
        join app.integration_connections c
          on c.tenant_id = scenario.tenant_id and c.workspace_id = scenario.workspace_id
       where u.user_id = pg_temp.seed_uuid('papadata-local-seed:new-registration-onboarding:owner-user')
       group by u.created_at, o.completed_at;

      if new_created_at < now() - interval '3 hours'
         or onboarding_completed_at is null
         or first_connection_at < new_created_at
         or first_connection_at > onboarding_completed_at then
        raise exception '[%] registration/onboarding/integration timeline is inconsistent', scenario.scenario_key;
      end if;
    end if;

    select count(*)::int
      into open_issue_count
      from app.data_issues d
     where d.tenant_id = scenario.tenant_id
       and d.workspace_id = scenario.workspace_id
       and d.status = 'open';
    if open_issue_count <> 0 then
      raise exception '[%] expected no open data issues, got %', scenario.scenario_key, open_issue_count;
    end if;

    select count(*)::int
      into stale_checkpoint_count
      from app.sync_checkpoints cp
      join app.integration_connections c on c.connection_id = cp.connection_id
     where cp.tenant_id = scenario.tenant_id
       and cp.workspace_id = scenario.workspace_id
       and c.status = 'active'
       and cp.updated_at < now() - interval '36 hours';
    if stale_checkpoint_count <> 0 then
      raise exception '[%] active integrations have stale checkpoints', scenario.scenario_key;
    end if;

    select count(*)::int
      into passed_reconciliation_count
      from app.integration_reconciliation_runs rr
     where rr.tenant_id = scenario.tenant_id
       and rr.workspace_id = scenario.workspace_id
       and rr.status = 'passed';
    if passed_reconciliation_count < scenario.expected_active_connections then
      raise exception '[%] expected passed reconciliation for every active provider', scenario.scenario_key;
    end if;

    select count(distinct r.provider_id)::int
      into connection_count
      from app.integration_canonical_records r
     where r.tenant_id = scenario.tenant_id
       and r.workspace_id = scenario.workspace_id;
    if connection_count <> scenario.expected_active_connections then
      raise exception '[%] expected canonical facts from % active providers, got %',
        scenario.scenario_key, scenario.expected_active_connections, connection_count;
    end if;

    if scenario.is_partial and exists (
      select 1 from app.integration_canonical_records r
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and r.provider_id in ('shopify','meta_ads','ga4')
    ) then
      raise exception '[%] disconnected providers unexpectedly have canonical facts', scenario.scenario_key;
    end if;

    if exists (
      select 1
        from app.source_batches b
        join app.integration_connections c on c.connection_id = b.connection_id
       where b.tenant_id = scenario.tenant_id
         and b.workspace_id = scenario.workspace_id
         and c.status = 'active'
         and b.record_count <= 0
    ) then
      raise exception '[%] at least one active integration stream has an empty source batch', scenario.scenario_key;
    end if;

    if exists (
      select 1
        from app.integration_canonical_records r
        left join app.normalized_records n on n.source_record_id = r.source_record_id
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and n.source_record_id is null
    ) then
      raise exception '[%] canonical lineage is missing a normalized source record', scenario.scenario_key;
    end if;

    if exists (
      select 1 from app.integration_canonical_records r
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and r.stream = 'orders'
         and lower(coalesce(r.canonical_payload #>> '{entity,status}', '')) not in (
           'cancelled','canceled','checkout-draft','draft','failed','on-hold','pending','refunded','trash','voided'
         )
         and (
           nullif(r.canonical_payload #>> '{entity,customerReference}', '') is null
           or nullif(r.canonical_payload #>> '{entity,customerType}', '') is null
           or jsonb_array_length(coalesce(r.canonical_payload #> '{entity,lineItems}', '[]'::jsonb)) = 0
         )
    ) then
      raise exception '[%] qualifying commerce facts are missing customer/product breakdown data', scenario.scenario_key;
    end if;

    select
      coalesce(sum((i.canonical_payload #>> '{entity,availableQuantity}')::numeric), 0),
      coalesce(sum(
        (i.canonical_payload #>> '{entity,availableQuantity}')::numeric
        * (p.canonical_payload #>> '{entity,unitCost}')::numeric
      ), 0)
      into actual_stock, actual_stock_value
      from app.integration_canonical_records i
      join app.integration_connections c
        on c.connection_id = i.connection_id
       and c.is_primary_inventory_source
       and c.status = 'active'
      join app.integration_canonical_records p
        on p.tenant_id = i.tenant_id
       and p.workspace_id = i.workspace_id
       and p.provider_id = i.provider_id
       and p.stream = 'products'
       and p.external_id = i.canonical_payload #>> '{entity,productId}'
     where i.tenant_id = scenario.tenant_id
       and i.workspace_id = scenario.workspace_id
       and i.stream = 'inventory';
    expected_stock := case when scenario.is_partial then 100 else 120 end;
    expected_stock_value := case when scenario.is_partial then 2000 else 3000 end;
    if abs(actual_stock - expected_stock) > 0.01
       or abs(actual_stock_value - expected_stock_value) > 0.01 then
      raise exception '[%] inventory verification failed: stock=%, value=%',
        scenario.scenario_key, actual_stock, actual_stock_value;
    end if;

    for window_days in select unnest(array[1, 7, 30, 90]) loop
      select coalesce(sum(i % 7), 0)::int
        into weekly_variation_sum
        from generate_series(0, window_days - 1) as g(i);
      range_start := ((current_date - (window_days - 1))::timestamp at time zone 'Europe/Warsaw');

      with qualifying_orders as (
        select r.provider_id, r.external_id, r.canonical_payload
          from app.integration_canonical_records r
         where r.tenant_id = scenario.tenant_id
           and r.workspace_id = scenario.workspace_id
           and r.stream = 'orders'
           and r.business_time >= range_start
           and r.business_time < range_end
           and lower(coalesce(r.canonical_payload #>> '{entity,status}', '')) not in (
             'cancelled','canceled','checkout-draft','draft','failed','on-hold','pending','refunded','trash','voided'
           )
      ), line_totals as (
        select
          coalesce(sum((line.value ->> 'quantity')::numeric), 0) as units,
          coalesce(sum((p.canonical_payload #>> '{entity,unitCost}')::numeric * (line.value ->> 'quantity')::numeric), 0) as product_cost
        from qualifying_orders q
        cross join lateral jsonb_array_elements(q.canonical_payload #> '{entity,lineItems}') as line(value)
        left join app.integration_canonical_records p
          on p.tenant_id = scenario.tenant_id
         and p.workspace_id = scenario.workspace_id
         and p.stream = 'products'
         and p.provider_id = q.provider_id
         and p.external_id = line.value ->> 'externalProductId'
      )
      select count(*)::int,
             coalesce(sum((q.canonical_payload #>> '{entity,grossAmount}')::numeric), 0),
             lt.units,
             lt.product_cost
        into actual_orders, actual_gross, actual_units, actual_product_cost
        from qualifying_orders q
        cross join line_totals lt
       group by lt.units, lt.product_cost;

      actual_orders := coalesce(actual_orders, 0);
      actual_gross := coalesce(actual_gross, 0);
      actual_units := coalesce(actual_units, 0);
      actual_product_cost := coalesce(actual_product_cost, 0);

      select coalesce(sum((r.canonical_payload #>> '{entity,amount}')::numeric), 0)
        into actual_refunds
        from app.integration_canonical_records r
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and r.stream = 'refunds'
         and r.business_time >= range_start
         and r.business_time < range_end
         and exists (
           select 1
             from app.integration_canonical_records o
            where o.tenant_id = scenario.tenant_id
              and o.workspace_id = scenario.workspace_id
              and o.stream = 'orders'
              and o.provider_id = r.provider_id
              and o.external_id = r.canonical_payload #>> '{entity,orderId}'
              and o.business_time >= range_start
              and o.business_time < range_end
              and lower(coalesce(o.canonical_payload #>> '{entity,status}', '')) not in (
                'cancelled','canceled','checkout-draft','draft','failed','on-hold','pending','refunded','trash','voided'
              )
         );
      actual_revenue := actual_gross - actual_refunds;

      select
        coalesce(sum((r.canonical_payload #>> '{entity,spend}')::numeric), 0),
        coalesce(sum((r.canonical_payload #>> '{entity,clicks}')::numeric), 0),
        coalesce(sum((r.canonical_payload #>> '{entity,impressions}')::numeric), 0)
        into actual_ad_spend, actual_clicks, actual_impressions
        from app.integration_canonical_records r
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and r.stream = 'ad_spend'
         and r.business_time >= range_start
         and r.business_time < range_end;

      select count(*)::int,
             coalesce(sum((r.canonical_payload #>> '{entity,conversionValue}')::numeric), 0)
        into actual_conversions, actual_attributed_revenue
        from app.integration_canonical_records r
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and r.stream = 'attributed_conversions'
         and r.business_time >= range_start
         and r.business_time < range_end;

      select
        count(*)::int,
        count(*) filter (
          where nullif(r.canonical_payload #>> '{entity,source}', '') is not null
        )::int,
        count(*) filter (
          where nullif(r.canonical_payload #>> '{entity,funnelStepId}', '') is not null
        )::int,
        coalesce(sum(
          (r.canonical_payload #>> '{entity,entrants}')::numeric
        ) filter (
          where r.canonical_payload #>> '{entity,funnelStepId}' = 'checkout'
        ), 0),
        coalesce(sum(
          (r.canonical_payload #>> '{entity,completions}')::numeric
        ) filter (
          where r.canonical_payload #>> '{entity,funnelStepId}' = 'purchase'
        ), 0),
        avg((r.canonical_payload #>> '{entity,eventCompleteness}')::numeric) filter (
          where r.canonical_payload #>> '{entity,eventCompleteness}' is not null
        )
        into
          actual_traffic_rows,
          actual_traffic_channel_rows,
          actual_funnel_rows,
          actual_checkout,
          actual_purchases,
          actual_completeness
        from app.integration_canonical_records r
       where r.tenant_id = scenario.tenant_id
         and r.workspace_id = scenario.workspace_id
         and r.provider_id = 'ga4'
         and r.stream = 'traffic'
         and r.business_time >= range_start
         and r.business_time < range_end;

      if scenario.is_partial then
        expected_orders := 3 * window_days;
        expected_gross := 270 * window_days + 5 * weekly_variation_sum;
        expected_refunds := 14 * window_days + 2 * weekly_variation_sum;
        expected_units := 4 * window_days;
        expected_product_cost := 105 * window_days;
        expected_ad_spend := 40 * window_days + 2 * weekly_variation_sum;
        expected_conversions := 2 * window_days;
        expected_traffic_rows := 0;
        expected_traffic_channel_rows := 0;
        expected_funnel_rows := 0;
      else
        expected_orders := 4 * window_days;
        expected_gross := 390 * window_days + 8 * weekly_variation_sum;
        expected_refunds := 20 * window_days + 3 * weekly_variation_sum;
        expected_units := 6 * window_days;
        expected_product_cost := 155 * window_days;
        expected_ad_spend := 60 * window_days + 3 * weekly_variation_sum;
        expected_conversions := 3 * window_days;
        expected_traffic_rows := 8 * window_days;
        expected_traffic_channel_rows := 2 * window_days;
        expected_funnel_rows := 6 * window_days;
      end if;

      expected_revenue := expected_gross - expected_refunds;
      expected_attributed_revenue := expected_ad_spend * 4;
      expected_cpa := expected_ad_spend / expected_conversions;
      expected_gross_margin := (expected_gross - expected_product_cost) / expected_gross;

      actual_aov := case when actual_orders > 0 then actual_gross / actual_orders else null end;
      actual_roas := case when actual_ad_spend > 0 then actual_attributed_revenue / actual_ad_spend else null end;
      actual_cpa := case when actual_conversions > 0 then actual_ad_spend / actual_conversions else null end;
      actual_cpc := case when actual_clicks > 0 then actual_ad_spend / actual_clicks else null end;
      actual_cpm := case when actual_impressions > 0 then actual_ad_spend * 1000 / actual_impressions else null end;
      actual_ctr := case when actual_impressions > 0 then actual_clicks / actual_impressions else null end;
      actual_gross_margin := case when actual_gross > 0 then (actual_gross - actual_product_cost) / actual_gross else null end;
      actual_cart_conversion := case when actual_checkout > 0 then actual_purchases / actual_checkout else null end;

      if actual_orders <> expected_orders
         or abs(actual_gross - expected_gross) > 0.01
         or abs(actual_refunds - expected_refunds) > 0.01
         or abs(actual_revenue - expected_revenue) > 0.01
         or abs(actual_units - expected_units) > 0.01
         or abs(actual_product_cost - expected_product_cost) > 0.01
         or abs(actual_ad_spend - expected_ad_spend) > 0.01
         or actual_conversions <> expected_conversions
         or abs(actual_attributed_revenue - expected_attributed_revenue) > 0.01
         or abs(actual_roas - 4) > 0.000001
         or abs(actual_cpa - expected_cpa) > 0.000001
         or abs(actual_cpc - 0.5) > 0.000001
         or abs(actual_cpm - 10) > 0.000001
         or abs(actual_ctr - 0.02) > 0.000001
         or abs(actual_gross_margin - expected_gross_margin) > 0.000001 then
        raise exception '[%][%d] metric verification failed: gross=%, refunds=%, revenue=%, orders=%, units=%, adSpend=%, conversions=%, attrRevenue=%, ROAS=%, CPA=%, CPC=%, CPM=%, CTR=%, margin=%',
          scenario.scenario_key, window_days, actual_gross, actual_refunds, actual_revenue,
          actual_orders, actual_units, actual_ad_spend, actual_conversions,
          actual_attributed_revenue, actual_roas, actual_cpa, actual_cpc, actual_cpm,
          actual_ctr, actual_gross_margin;
      end if;

      if scenario.is_partial then
        if actual_traffic_rows <> 0
           or actual_traffic_channel_rows <> 0
           or actual_funnel_rows <> 0
           or actual_cart_conversion is not null then
          raise exception '[%][%d] GA4 should be unavailable in the partial scenario', scenario.scenario_key, window_days;
        end if;
      else
        if actual_traffic_rows <> expected_traffic_rows
           or actual_traffic_channel_rows <> expected_traffic_channel_rows
           or actual_funnel_rows <> expected_funnel_rows
           or abs(actual_cart_conversion - 0.25) > 0.000001
           or abs(coalesce(actual_completeness, 0) - 1) > 0.000001 then
          raise exception '[%][%d] GA4 verification failed: rows=%, channelRows=%, funnelRows=%, cartConversion=%, completeness=%',
            scenario.scenario_key, window_days, actual_traffic_rows, actual_traffic_channel_rows,
            actual_funnel_rows, actual_cart_conversion, actual_completeness;
        end if;
      end if;

      raise notice '[%] %d OK: revenue=%, orders=%, AOV=%, adSpend=%, ROAS=%, CPA=%, margin=%, cartConversion=%',
        scenario.scenario_key, window_days, actual_revenue, actual_orders, actual_aov,
        actual_ad_spend, actual_roas, actual_cpa, actual_gross_margin, actual_cart_conversion;
    end loop;
  end loop;
end
$$;

rollback;
\echo 'Local PapaData dashboard seed verification PASSED.'
\echo 'Scenario:' :seed_scenario
