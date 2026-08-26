begin;

-- The production provider registry exposes GA4 traffic/events/conversions,
-- while the historical durable-ingestion constraints predate those streams.
-- Keep the persistence contract aligned with the production provider registry.
alter table app.sync_checkpoints
  drop constraint if exists sync_checkpoints_stream_valid;
alter table app.sync_checkpoints
  add constraint sync_checkpoints_stream_valid
  check (
    stream in (
      'ad_spend',
      'attributed_conversions',
      'conversions',
      'events',
      'inventory',
      'orders',
      'products',
      'refunds',
      'traffic'
    )
  );
alter table app.sync_checkpoints
  drop constraint if exists sync_checkpoints_ga4_stream_valid;
alter table app.sync_checkpoints
  add constraint sync_checkpoints_ga4_stream_valid
  check (provider_id <> 'ga4' or stream in ('traffic', 'events', 'conversions'));

alter table app.source_batches
  drop constraint if exists source_batches_stream_valid;
alter table app.source_batches
  add constraint source_batches_stream_valid
  check (
    stream in (
      'ad_spend',
      'attributed_conversions',
      'conversions',
      'events',
      'inventory',
      'orders',
      'products',
      'refunds',
      'traffic'
    )
  );
alter table app.source_batches
  drop constraint if exists source_batches_ga4_stream_valid;
alter table app.source_batches
  add constraint source_batches_ga4_stream_valid
  check (provider_id <> 'ga4' or stream in ('traffic', 'events', 'conversions'));

alter table app.source_records
  drop constraint if exists source_records_stream_valid;
alter table app.source_records
  add constraint source_records_stream_valid
  check (
    stream in (
      'ad_spend',
      'attributed_conversions',
      'conversions',
      'events',
      'inventory',
      'orders',
      'products',
      'refunds',
      'traffic'
    )
  );
alter table app.source_records
  drop constraint if exists source_records_ga4_stream_valid;
alter table app.source_records
  add constraint source_records_ga4_stream_valid
  check (provider_id <> 'ga4' or stream in ('traffic', 'events', 'conversions'));

alter table app.normalized_records
  drop constraint if exists normalized_records_stream_valid;
alter table app.normalized_records
  add constraint normalized_records_stream_valid
  check (
    stream in (
      'ad_spend',
      'attributed_conversions',
      'conversions',
      'events',
      'inventory',
      'orders',
      'products',
      'refunds',
      'traffic'
    )
  );
alter table app.normalized_records
  drop constraint if exists normalized_records_ga4_stream_valid;
alter table app.normalized_records
  add constraint normalized_records_ga4_stream_valid
  check (provider_id <> 'ga4' or stream in ('traffic', 'events', 'conversions'));

commit;
