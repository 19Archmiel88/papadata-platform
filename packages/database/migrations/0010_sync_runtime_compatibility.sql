alter table app.sync_jobs
  add column if not exists idempotency_key text;

update app.sync_jobs
set idempotency_key = 'legacy:' || sync_job_id::text
where idempotency_key is null
   or length(trim(idempotency_key)) = 0;

alter table app.sync_jobs
  alter column idempotency_key set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'app.sync_jobs'::regclass
      and conname = 'sync_jobs_idempotency_key_not_blank'
  ) then
    alter table app.sync_jobs
      add constraint sync_jobs_idempotency_key_not_blank
      check (length(trim(idempotency_key)) > 0);
  end if;
end
$$;

create unique index if not exists sync_jobs_idempotency_unique
  on app.sync_jobs (tenant_id, workspace_id, idempotency_key);

alter table app.integration_connections
  drop constraint if exists integration_connections_provider_valid;

alter table app.integration_connections
  add constraint integration_connections_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.integration_connections
  drop constraint if exists integration_connections_inventory_provider_valid;

alter table app.integration_connections
  add constraint integration_connections_inventory_provider_valid
  check (
    is_primary_inventory_source is false
    or provider_id in (
      'allegro',
      'baselinker',
      'shopify',
      'woocommerce'
    )
  );

alter table app.sync_jobs
  drop constraint if exists sync_jobs_provider_valid;

alter table app.sync_jobs
  add constraint sync_jobs_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.sync_checkpoints
  drop constraint if exists sync_checkpoints_provider_valid;

alter table app.sync_checkpoints
  add constraint sync_checkpoints_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.sync_checkpoints
  drop constraint if exists sync_checkpoints_sales_stream_valid;

alter table app.sync_checkpoints
  add constraint sync_checkpoints_sales_stream_valid
  check (
    provider_id not in (
      'allegro',
      'baselinker',
      'shopify',
      'woocommerce'
    )
    or stream in (
      'inventory',
      'orders',
      'products',
      'refunds'
    )
  );

alter table app.source_batches
  drop constraint if exists source_batches_provider_valid;

alter table app.source_batches
  add constraint source_batches_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.source_records
  drop constraint if exists source_records_provider_valid;

alter table app.source_records
  add constraint source_records_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.normalized_records
  drop constraint if exists normalized_records_provider_valid;

alter table app.normalized_records
  add constraint normalized_records_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.external_product_mappings
  drop constraint if exists external_product_mappings_provider_valid;

alter table app.external_product_mappings
  add constraint external_product_mappings_provider_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'ga4',
      'google_ads',
      'meta_ads',
      'shopify',
      'woocommerce'
    )
  );

alter table app.canonical_orders
  drop constraint if exists canonical_orders_provider_sales_valid;

alter table app.canonical_orders
  add constraint canonical_orders_provider_sales_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'shopify',
      'woocommerce'
    )
  );

alter table app.canonical_refunds
  drop constraint if exists canonical_refunds_provider_sales_valid;

alter table app.canonical_refunds
  add constraint canonical_refunds_provider_sales_valid
  check (
    provider_id in (
      'allegro',
      'baselinker',
      'shopify',
      'woocommerce'
    )
  );
