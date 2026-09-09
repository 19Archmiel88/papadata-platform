-- The new periodic metric-reprocess dispatcher (apps/worker's
-- ReconciliationScheduler.scheduleMetricReprocessDetection/
-- drainMetricReprocessJobs, P0-01 katalog-58-metryk closure) reads
-- app.metric_snapshots and app.metric_definitions across all tenants (to
-- find snapshots whose definition_version is behind the metric's current
-- one) and writes app.reprocess_jobs, all through the platform-wide
-- (bypassrls) papadata_platform role -- the same role
-- ReconciliationScheduler/PlatformWorkerService already use for
-- app.integration_connections/app.sync_checkpoints. Migration 000005 only
-- granted these three tables to papadata_app/papadata_test, so the new
-- cross-tenant queries would fail with "permission denied" the same way
-- migration 0047 previously found for app.sync_checkpoints.

GRANT SELECT ON app.metric_snapshots TO papadata_platform;
GRANT SELECT ON app.metric_definitions TO papadata_platform;
GRANT SELECT, INSERT, UPDATE ON app.reprocess_jobs TO papadata_platform;
