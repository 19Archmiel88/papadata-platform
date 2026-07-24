import {
  CONTRACT_VERSION,
  type BackendServiceManifest,
} from "@papadata/contracts";

export const databaseBoundaryManifest = {
  serviceName: "database",
  contractVersion: CONTRACT_VERSION,
  readiness: "not_configured",
  capabilities: [
    "tenant-workspace-boundary",
    "schema-boundary",
    "plain-sql-migrations",
    "separate-migrator-runtime-roles",
    "transactional-outbox-foundation",
    "compliance-records",
    "durable-notifications",
    "integration-source-records",
    "canonical-commerce-data",
    "canonical-ads-data",
    "lineage-quality-readiness",
    "metric-definitions",
    "metric-snapshots",
    "dashboard-reprocess-reconciliation",
    "worker-job-ledger",
    "report-export-files",
    "assistant-evidence-approval-audit",
    "billing-sandbox-lifecycle",
  ],
  limitations: [
    "The local migration runtime uses psql through Docker Compose.",
    "Application database access through pg repositories is outside this prompt.",
  ],
} as const satisfies BackendServiceManifest;

export type DatabaseBoundaryManifest = typeof databaseBoundaryManifest;

export const DATABASE_SCHEMA_NAME = "app";

export const databaseRoles = {
  migrator: "papadata_migrator",
  runtime: "papadata_app",
  test: "papadata_test",
} as const;

export const infrastructureTables = [
  "schema_migrations",
  "audit_events",
  "outbox_events",
  "processed_events",
] as const;

export const complianceTables = [
  "cookie_consents",
  "legal_documents",
  "legal_acceptances",
  "notifications",
] as const;

export const integrationDataTables = [
  "integration_connections",
  "sync_jobs",
  "sync_checkpoints",
  "source_batches",
  "source_records",
  "normalized_records",
  "canonical_products",
  "canonical_product_variants",
  "external_product_mappings",
  "canonical_orders",
  "canonical_order_lines",
  "canonical_payments",
  "canonical_refunds",
  "canonical_customer_returns",
  "canonical_inventory_snapshots",
  "canonical_ad_spend",
  "canonical_attributed_conversions",
  "canonical_lineage",
  "integration_canonical_records",
  "integration_reconciliation_runs",
  "integration_dead_letter_jobs",
  "data_issues",
  "quality_assessments",
  "readiness_assessments",
] as const;

export const metricEngineTables = [
  "metric_definitions",
  "metric_snapshots",
  "reprocess_jobs",
  "reconciliation_reports",
] as const;

export const remainingBackendTables = [
  "worker_jobs",
  "worker_dlq_events",
  "email_outbox_messages",
  "report_exports",
  "report_files",
  "assistant_threads",
  "assistant_messages",
  "assistant_evidence",
  "assistant_approvals",
  "assistant_audit_events",
  "billing_subscriptions",
  "billing_events",
  "billing_invoices",
  "billing_usage_records",
] as const;

export type DatabaseRoleName =
  (typeof databaseRoles)[keyof typeof databaseRoles];

export type InfrastructureTableName = (typeof infrastructureTables)[number];

export type ComplianceTableName = (typeof complianceTables)[number];

export type IntegrationDataTableName = (typeof integrationDataTables)[number];

export type MetricEngineTableName = (typeof metricEngineTables)[number];

export type RemainingBackendTableName = (typeof remainingBackendTables)[number];
export * from "./production.js";
export * from "./remediation.js";
