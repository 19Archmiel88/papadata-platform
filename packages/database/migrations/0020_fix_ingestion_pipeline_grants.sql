begin;

-- DurableIntegrationIngestionRepository.persistFetchedPage and normalizeBatch
-- (packages/database/src/production.ts) both upsert via
-- `on conflict (...) do update ...` against app.source_records and
-- app.normalized_records. Postgres requires UPDATE privilege on a table for
-- a statement containing DO UPDATE to plan at all, even on a row that ends
-- up being a plain insert -- migration 0015 granted UPDATE to the other
-- upserted tables in this same pipeline (integration_canonical_records,
-- integration_dead_letter_jobs, sync_checkpoints, source_batches) but missed
-- these two, so every real ingestion run failed with
-- "permission denied for table source_records" before ever reaching a
-- provider adapter's second page. Found by actually running the pipeline
-- end-to-end against a real WooCommerce store (see
-- .claude/CLAUDE.md, "P0 -- reconciliation").
grant update on app.source_records to papadata_app;
grant update on app.normalized_records to papadata_app;

commit;
