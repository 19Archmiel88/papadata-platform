begin;

-- Separate GA4 grains preserve old traffic/event identities and totals.

alter table app.sync_checkpoints drop constraint if exists sync_checkpoints_stream_valid;

alter table app.sync_checkpoints add constraint sync_checkpoints_stream_valid check
  (stream in ('ad_spend','attributed_conversions','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));

alter table app.sync_checkpoints drop constraint if exists sync_checkpoints_ga4_stream_valid;

alter table app.sync_checkpoints add constraint sync_checkpoints_ga4_stream_valid check
  (provider_id <> 'ga4' or stream in ('traffic','events','conversions','traffic_breakdown','event_breakdown'));

alter table app.sync_checkpoints add constraint sync_checkpoints_ga4_breakdown_provider_valid check
  (stream not in ('traffic_breakdown','event_breakdown') or provider_id = 'ga4');

alter table app.source_batches drop constraint if exists source_batches_stream_valid;

alter table app.source_batches add constraint source_batches_stream_valid check
  (stream in ('ad_spend','attributed_conversions','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));

alter table app.source_batches drop constraint if exists source_batches_ga4_stream_valid;

alter table app.source_batches add constraint source_batches_ga4_stream_valid check
  (provider_id <> 'ga4' or stream in ('traffic','events','conversions','traffic_breakdown','event_breakdown'));

alter table app.source_batches add constraint source_batches_ga4_breakdown_provider_valid check
  (stream not in ('traffic_breakdown','event_breakdown') or provider_id = 'ga4');

alter table app.source_records drop constraint if exists source_records_stream_valid;

alter table app.source_records add constraint source_records_stream_valid check
  (stream in ('ad_spend','attributed_conversions','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));

alter table app.source_records drop constraint if exists source_records_ga4_stream_valid;

alter table app.source_records add constraint source_records_ga4_stream_valid check
  (provider_id <> 'ga4' or stream in ('traffic','events','conversions','traffic_breakdown','event_breakdown'));

alter table app.source_records add constraint source_records_ga4_breakdown_provider_valid check
  (stream not in ('traffic_breakdown','event_breakdown') or provider_id = 'ga4');

alter table app.normalized_records drop constraint if exists normalized_records_stream_valid;

alter table app.normalized_records add constraint normalized_records_stream_valid check
  (stream in ('ad_spend','attributed_conversions','conversions','events','inventory','orders','products','refunds','traffic','traffic_breakdown','event_breakdown'));

alter table app.normalized_records drop constraint if exists normalized_records_ga4_stream_valid;

alter table app.normalized_records add constraint normalized_records_ga4_stream_valid check
  (provider_id <> 'ga4' or stream in ('traffic','events','conversions','traffic_breakdown','event_breakdown'));

alter table app.normalized_records add constraint normalized_records_ga4_breakdown_provider_valid check
  (stream not in ('traffic_breakdown','event_breakdown') or provider_id = 'ga4');

commit;
