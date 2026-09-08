-- The new SyncDispatchScheduler (apps/worker) reads app.sync_checkpoints
-- through the platform-wide (bypassrls) papadata_platform role, the same
-- role ReconciliationScheduler/PlatformWorkerService already use to read
-- app.integration_connections platform-wide. papadata_platform was granted
-- SELECT on integration_connections but never on sync_checkpoints, so any
-- query joining the two (needed to find connections whose last sync is
-- stale) fails with "permission denied for table sync_checkpoints" --
-- caught by running the new scheduler's query against a real database.

GRANT SELECT ON app.sync_checkpoints TO papadata_platform;
