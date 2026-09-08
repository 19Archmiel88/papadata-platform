-- Real page-level resume for the ingestion pipeline's fetch phase. Today, a
-- crash partway through a provider's internal pagination loop (WooCommerce,
-- Shopify, Allegro, BaseLinker and Meta Ads each loop up to 10,000 pages
-- in-memory before returning anything to the pipeline -- see
-- packages/integrations/src/providers/*.ts) loses every page already
-- fetched; a retry starts over from page 1.
--
-- Deliberately a separate column from the existing `checkpoint` jsonb,
-- which finalizeSucceeded (packages/database/src/production.ts) already
-- writes as the job's final date-watermark cursor on success -- this column
-- tracks in-progress paging state within the fetch phase of one job
-- attempt, a different concept with a different lifecycle.
ALTER TABLE app.sync_jobs
  ADD COLUMN IF NOT EXISTS resume_page_cursor text;
