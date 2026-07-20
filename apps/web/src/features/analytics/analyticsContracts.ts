import { z } from 'zod';

import {
  asCapability,
  contractVersionSchema,
  correlationIdSchema,
  currencyCodeSchema,
  operationIdSchema,
  tenantIdSchema,
  workspaceIdSchema,
  type Capability,
} from '../../domain-contracts';
import {
  canonicalOrderIdSchema,
  datasetIdSchema,
  dataQualityIssueIdSchema,
  lineageLinkIdSchema,
  reconciliationReportIdSchema,
  ruleVersionSchema,
  wave3RuleVersions,
} from '../data-quality/dataQualityContracts';
import {
  connectionIdSchema,
  integrationSourceRecordIdSchema,
  providerIdSchema,
} from '../integrations/integrationContracts';

const idValueSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_:-]*$/);

const isoDateTimeSchema = z.string().datetime({ offset: true });
const decimalStringSchema = z.string().regex(/^-?\d+(\.\d+)?$/);

export const analyticsContractVersion = 'analytics.v1' as const;
export const analyticsProjectionVersion = 'analytics-projection.2026-07' as const;
export const analyticsCachePolicyVersion = 'analytics-cache.2026-07' as const;
export const analyticsExportPolicyVersion = 'analytics-export.2026-07' as const;

export const analyticsCapabilities = {
  compareMetrics: asCapability('analytics:metrics:compare'),
  exportMetrics: asCapability('analytics:metrics:export'),
  manageSourceAuthority: asCapability('data-quality:source-authority:manage'),
  requestReprocessing: asCapability('data-quality:reprocess'),
  resolveDataIssue: asCapability('data-quality:issue:resolve'),
  reviewDuplicate: asCapability('data-quality:issue:review'),
  viewAlerts: asCapability('analytics:alerts:view'),
  viewCommandCenter: asCapability('analytics:command-center:view'),
  viewCustomers: asCapability('analytics:customers:view'),
  viewD2C: asCapability('analytics:d2c:view'),
  viewDataTrust: asCapability('analytics:data-trust:view'),
  viewIntegrations: asCapability('integration:read'),
  viewMarketplace: asCapability('analytics:marketplace:view'),
  viewMarketingAttribution: asCapability('analytics:marketing-attribution:view'),
  viewMetricDefinition: asCapability('analytics:metric-definition:view'),
  viewMetricEvidence: asCapability('analytics:metric-evidence:view'),
  viewMetricLineage: asCapability('analytics:metric-lineage:view'),
  viewMetricReconciliation: asCapability('analytics:metric-reconciliation:view'),
  viewMetrics: asCapability('analytics:metrics:view'),
  viewOrders: asCapability('analytics:orders:view'),
  viewPaidCampaigns: asCapability('analytics:paid-campaigns:view'),
  viewProducts: asCapability('analytics:products:view'),
  viewProfitability: asCapability('analytics:profitability:view'),
  viewTasks: asCapability('analytics:tasks:view'),
  viewTraffic: asCapability('analytics:traffic:view'),
} as const satisfies Record<string, Capability>;

export const metricCalculationIdSchema = idValueSchema.brand<'MetricCalculationId'>();
export const metricSnapshotIdSchema = idValueSchema.brand<'AnalyticsMetricSnapshotId'>();
export const analyticsProjectionIdSchema = idValueSchema.brand<'AnalyticsProjectionId'>();
export const analyticsTaskIdSchema = idValueSchema.brand<'AnalyticsTaskId'>();
export const analyticsAlertIdSchema = idValueSchema.brand<'AnalyticsAlertId'>();
export const analyticsChangeIdSchema = idValueSchema.brand<'AnalyticsChangeId'>();
export const metricExportIdSchema = idValueSchema.brand<'MetricExportId'>();
export const analyticsAuditEventIdSchema =
  idValueSchema.brand<'AnalyticsAuditEventId'>();

export type MetricCalculationId = z.infer<typeof metricCalculationIdSchema>;
export type MetricSnapshotId = z.infer<typeof metricSnapshotIdSchema>;
export type AnalyticsProjectionId = z.infer<typeof analyticsProjectionIdSchema>;
export type AnalyticsTaskId = z.infer<typeof analyticsTaskIdSchema>;
export type AnalyticsAlertId = z.infer<typeof analyticsAlertIdSchema>;
export type AnalyticsChangeId = z.infer<typeof analyticsChangeIdSchema>;
export type MetricExportId = z.infer<typeof metricExportIdSchema>;

export function asMetricSnapshotId(value: string): MetricSnapshotId {
  return metricSnapshotIdSchema.parse(value);
}

export function asMetricCalculationId(value: string): MetricCalculationId {
  return metricCalculationIdSchema.parse(value);
}

export function asAnalyticsProjectionId(value: string): AnalyticsProjectionId {
  return analyticsProjectionIdSchema.parse(value);
}

export function asAnalyticsTaskId(value: string): AnalyticsTaskId {
  return analyticsTaskIdSchema.parse(value);
}

export function asAnalyticsAlertId(value: string): AnalyticsAlertId {
  return analyticsAlertIdSchema.parse(value);
}

export function asAnalyticsChangeId(value: string): AnalyticsChangeId {
  return analyticsChangeIdSchema.parse(value);
}

export function asMetricExportId(value: string): MetricExportId {
  return metricExportIdSchema.parse(value);
}

export const analyticsMetricCodeSchema = z.enum([
  'order_count',
  'gross_revenue',
  'refund_value',
  'net_revenue',
  'marketplace_fees',
  'revenue_after_marketplace_fees',
  'advertising_spend',
  'attributed_conversion_value',
  'roas',
  'contribution_margin',
]);

export type AnalyticsMetricCode = z.infer<typeof analyticsMetricCodeSchema>;

export const analyticsReadinessStatusSchema = z.enum([
  'READY',
  'PARTIAL',
  'EMPTY',
  'STALE',
  'INVALID',
  'BLOCKED',
  'PROCESSING',
  'RECALCULATION_REQUIRED',
]);

export type AnalyticsReadinessStatus = z.infer<typeof analyticsReadinessStatusSchema>;

export const reconciliationStatusSchema = z.enum([
  'MATCHED',
  'WITHIN_TOLERANCE',
  'MISMATCH',
  'BLOCKED',
  'NOT_APPLICABLE',
]);

export type AnalyticsReconciliationStatus = z.infer<
  typeof reconciliationStatusSchema
>;

export const periodSchema = z.object({
  from: isoDateTimeSchema,
  to: isoDateTimeSchema,
});

export const analyticsScopeSchema = z.object({
  channel: z.string().min(1).nullable(),
  dataScope: z.enum(['workspace', 'tenant']),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  segment: z.string().min(1).nullable(),
});

export type AnalyticsScope = z.infer<typeof analyticsScopeSchema>;

export const readinessReasonSchema = z.object({
  affectedScope: z.string().min(1),
  businessImpact: z.string().min(1),
  missing: z.array(z.string().min(1)),
  nextAction: z.string().min(1),
  ownerId: z.string().min(1),
  reliableScope: z.string().min(1),
  summary: z.string().min(1),
});

export type ReadinessReason = z.infer<typeof readinessReasonSchema>;

export const metricDefinitionSchema = z.object({
  approver: z.string().min(1).nullable(),
  blockedReason: z.string().min(1).nullable(),
  businessDescription: z.string().min(1),
  cancellationPolicy: z.string().min(1),
  currency: currencyCodeSchema.nullable(),
  dependentMetrics: z.array(analyticsMetricCodeSchema),
  exclusionRules: z.array(z.string().min(1)),
  feesPolicy: z.string().min(1),
  formula: z.string().min(1),
  formulaVersion: ruleVersionSchema,
  freshnessThreshold: z.string().min(1),
  fxPolicy: z.string().min(1),
  inclusionRules: z.array(z.string().min(1)),
  inputDatasets: z.array(z.string().min(1)),
  kpiId: analyticsMetricCodeSchema,
  lifecycleStatus: z.enum(['ACTIVE', 'GATED', 'BLOCKED', 'SUPERSEDED']),
  limitations: z.array(z.string().min(1)),
  name: z.string().min(1),
  owner: z.string().min(1),
  purpose: z.string().min(1),
  readinessRules: z.array(z.string().min(1)),
  recalculationCriteria: z.array(z.string().min(1)),
  refundPolicy: z.string().min(1),
  scope: z.array(z.string().min(1)),
  sources: z.array(z.string().min(1)),
  statusMapping: z.string().min(1),
  timezone: z.string().min(1).nullable(),
  unit: z.enum(['count', 'money', 'ratio', 'percent']),
  validFrom: isoDateTimeSchema,
  validTo: isoDateTimeSchema.nullable(),
  version: ruleVersionSchema,
});

export type MetricDefinition = z.infer<typeof metricDefinitionSchema>;

export const metricValueTypeSchema = z.enum([
  'DECIMAL',
  'INTEGER',
  'MONEY',
  'RATIO',
  'UNPUBLISHED',
]);

export const missingDataSchema = z.object({
  confirmedZero: z.boolean(),
  fields: z.array(z.string().min(1)),
  reason: z.string().min(1),
});

export const metricSnapshotSchema = z.object({
  allowedDecisionTypes: z.array(z.string().min(1)),
  blockedDecisionTypes: z.array(z.string().min(1)),
  calculatedAt: isoDateTimeSchema,
  currency: currencyCodeSchema.nullable(),
  datasetIds: z.array(datasetIdSchema),
  datasetVersions: z.array(ruleVersionSchema),
  deduplicationVersion: ruleVersionSchema,
  evidenceReferences: z.array(z.string().min(1)),
  formulaVersion: ruleVersionSchema,
  fxPolicyVersion: ruleVersionSchema,
  id: metricSnapshotIdSchema,
  inputHash: z.string().min(1),
  invalidationStatus: z.enum(['VALID', 'SUPERSEDED', 'INVALIDATED']),
  limitations: z.array(z.string().min(1)),
  mappingVersion: ruleVersionSchema,
  metricCode: analyticsMetricCodeSchema,
  metricDefinitionVersion: ruleVersionSchema,
  missingData: z.array(missingDataSchema),
  periodEnd: isoDateTimeSchema,
  periodStart: isoDateTimeSchema,
  previousSnapshotId: metricSnapshotIdSchema.nullable(),
  publishedAt: isoDateTimeSchema.nullable(),
  readiness: analyticsReadinessStatusSchema,
  readinessReasons: z.array(readinessReasonSchema),
  scope: analyticsScopeSchema,
  sourceAuthorityVersion: ruleVersionSchema,
  statusMappingVersion: ruleVersionSchema,
  supersededBySnapshotId: metricSnapshotIdSchema.nullable(),
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  unit: z.enum(['count', 'money', 'ratio', 'percent']),
  value: decimalStringSchema.nullable(),
  valueType: metricValueTypeSchema,
  workspaceId: workspaceIdSchema,
});

export type MetricSnapshot = z.infer<typeof metricSnapshotSchema>;

export const metricCalculationSchema = z.object({
  calculationId: metricCalculationIdSchema,
  finishedAt: isoDateTimeSchema.nullable(),
  metricCodes: z.array(analyticsMetricCodeSchema),
  period: periodSchema,
  requestedAt: isoDateTimeSchema,
  requestedBy: z.string().min(1),
  snapshotIds: z.array(metricSnapshotIdSchema),
  status: z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED']),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type MetricCalculation = z.infer<typeof metricCalculationSchema>;

export const analyticsReconciliationStepSchema = z.object({
  count: z.number().int().nonnegative(),
  label: z.string().min(1),
  reasonCodes: z.array(z.string().min(1)),
  value: decimalStringSchema.nullable(),
});

export const analyticsReconciliationSchema = z.object({
  canonicalTotals: analyticsReconciliationStepSchema,
  difference: decimalStringSchema.nullable(),
  duplicateCount: z.number().int().nonnegative(),
  exclusions: z.array(z.string().min(1)),
  generatedAt: isoDateTimeSchema,
  metricSnapshotId: metricSnapshotIdSchema,
  normalizedTotals: analyticsReconciliationStepSchema,
  qualifyingTotals: analyticsReconciliationStepSchema,
  reasonCodes: z.array(z.string().min(1)),
  sourceTotals: analyticsReconciliationStepSchema,
  sourceReconciliationId: reconciliationReportIdSchema.nullable(),
  status: reconciliationStatusSchema,
  tenantId: tenantIdSchema,
  tolerance: decimalStringSchema,
  versions: z.record(z.string(), z.string()),
  workspaceId: workspaceIdSchema,
});

export type AnalyticsReconciliation = z.infer<
  typeof analyticsReconciliationSchema
>;

export const trendPointSchema = z.object({
  label: z.string().min(1),
  period: periodSchema,
  readiness: analyticsReadinessStatusSchema,
  value: decimalStringSchema.nullable(),
});

export const driverSchema = z.object({
  direction: z.enum(['positive', 'negative', 'neutral']),
  evidenceReferences: z.array(z.string().min(1)),
  impact: decimalStringSchema.nullable(),
  label: z.string().min(1),
  reason: z.string().min(1),
});

export const tableColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
});

export const tableRowSchema = z.object({
  cells: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  id: z.string().min(1),
});

export const projectionMetaSchema = z.object({
  allowedActions: z.array(z.string().min(1)),
  correlationId: correlationIdSchema,
  currency: currencyCodeSchema.nullable(),
  evidenceReferences: z.array(z.string().min(1)),
  freshness: z.object({
    lastUpdatedAt: isoDateTimeSchema.nullable(),
    status: z.enum(['fresh', 'stale', 'unknown']),
  }),
  generatedAt: isoDateTimeSchema,
  limitations: z.array(z.string().min(1)),
  metricDefinitionVersions: z.array(ruleVersionSchema),
  period: periodSchema,
  projectionVersion: z.literal(analyticsProjectionVersion),
  readiness: analyticsReadinessStatusSchema,
  snapshotIds: z.array(metricSnapshotIdSchema),
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type ProjectionMeta = z.infer<typeof projectionMetaSchema>;

export const kpiProjectionSchema = z.object({
  comparison: z.object({
    label: z.string().min(1),
    previousSnapshotId: metricSnapshotIdSchema.nullable(),
    valueDelta: decimalStringSchema.nullable(),
  }),
  drivers: z.array(driverSchema),
  snapshot: metricSnapshotSchema,
  trend: z.array(trendPointSchema),
});

export type KpiProjection = z.infer<typeof kpiProjectionSchema>;

export const analyticTableProjectionSchema = z.object({
  columns: z.array(tableColumnSchema),
  rows: z.array(tableRowSchema),
});

export type AnalyticTableProjection = z.infer<typeof analyticTableProjectionSchema>;

export const moduleProjectionSchema = z.object({
  charts: z.array(z.object({
    description: z.string().min(1),
    evidenceReferences: z.array(z.string().min(1)),
    kind: z.enum(['trend', 'bars', 'waterfall', 'matrix', 'lineage', 'timeline']),
    title: z.string().min(1),
    trend: z.array(trendPointSchema),
  })),
  description: z.string().min(1),
  kpis: z.array(kpiProjectionSchema),
  meta: projectionMetaSchema,
  moduleId: z.enum([
    'command_center',
    'orders',
    'products',
    'customers',
    'traffic',
    'paid_campaigns',
    'd2c',
    'marketplace',
    'marketing_attribution',
    'profitability',
    'data_health',
    'tasks_for_me',
    'alerts',
    'changes_since_last_visit',
  ]),
  status: z.enum(['IMPLEMENTED', 'GATED', 'BLOCKED']),
  tables: z.array(analyticTableProjectionSchema),
  title: z.string().min(1),
});

export type ModuleProjection = z.infer<typeof moduleProjectionSchema>;

export const analyticsTaskSchema = z.object({
  auditRef: z.string().min(1),
  businessImpact: z.string().min(1),
  deepLink: z.string().min(1),
  dueDate: isoDateTimeSchema,
  id: analyticsTaskIdSchema,
  ownerId: z.string().min(1),
  read: z.boolean(),
  resolutionState: z.enum(['OPEN', 'ACKNOWLEDGED', 'DONE', 'BLOCKED']),
  severity: z.enum(['info', 'warning', 'critical']),
  sourceObjectId: z.string().min(1),
  sourceObjectType: z.string().min(1),
  tenantId: tenantIdSchema,
  title: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type AnalyticsTask = z.infer<typeof analyticsTaskSchema>;

export const analyticsAlertSchema = z.object({
  acknowledgedAt: isoDateTimeSchema.nullable(),
  auditRef: z.string().min(1),
  businessImpact: z.string().min(1),
  deepLink: z.string().min(1),
  id: analyticsAlertIdSchema,
  ownerId: z.string().min(1),
  read: z.boolean(),
  resolutionState: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']),
  severity: z.enum(['info', 'warning', 'critical']),
  sourceObjectId: z.string().min(1),
  sourceObjectType: z.enum([
    'metric_snapshot',
    'dataset',
    'integration',
    'data_issue',
    'metric_definition',
  ]),
  tenantId: tenantIdSchema,
  title: z.string().min(1),
  type: z.enum([
    'stale_data',
    'invalid_kpi',
    'reconciliation_mismatch',
    'connection_degraded',
    'missing_scope',
    'source_conflict',
    'duplicate_issue',
    'reprocessing_required',
    'definition_changed',
  ]),
  workspaceId: workspaceIdSchema,
});

export type AnalyticsAlert = z.infer<typeof analyticsAlertSchema>;

export const changeSinceLastVisitSchema = z.object({
  auditRef: z.string().min(1),
  businessImpact: z.string().min(1),
  deepLink: z.string().min(1),
  id: analyticsChangeIdSchema,
  occurredAt: isoDateTimeSchema,
  read: z.boolean(),
  sourceObjectId: z.string().min(1),
  tenantId: tenantIdSchema,
  title: z.string().min(1),
  type: z.enum(['snapshot_published', 'readiness_changed', 'definition_changed']),
  workspaceId: workspaceIdSchema,
});

export type ChangeSinceLastVisit = z.infer<typeof changeSinceLastVisitSchema>;

export const metricExportSchema = z.object({
  classification: z.literal('CUSTOMER_CONFIDENTIAL'),
  completedAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
  createdBy: z.string().min(1),
  evidenceReferences: z.array(z.string().min(1)),
  id: metricExportIdSchema,
  metricSnapshotIds: z.array(metricSnapshotIdSchema),
  operationId: operationIdSchema,
  period: periodSchema,
  retentionClass: z.literal('R-EXPORT'),
  status: z.enum(['QUEUED', 'READY', 'FAILED']),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type MetricExport = z.infer<typeof metricExportSchema>;

export const trustDrawerSchema = z.object({
  auditReference: z.string().min(1),
  businessImpact: z.string().min(1),
  conflicts: z.array(dataQualityIssueIdSchema),
  definition: metricDefinitionSchema,
  duplicates: z.array(dataQualityIssueIdSchema),
  exclusions: z.array(z.string().min(1)),
  lineageLinks: z.array(lineageLinkIdSchema),
  nextAction: z.string().min(1),
  reconciliation: analyticsReconciliationSchema,
  snapshot: metricSnapshotSchema,
  sourceRecordIds: z.array(integrationSourceRecordIdSchema),
});

export type TrustDrawer = z.infer<typeof trustDrawerSchema>;

export const drillDownSchema = z.object({
  canonicalOrderIds: z.array(canonicalOrderIdSchema),
  evidenceReferences: z.array(z.string().min(1)),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  metricSnapshotId: metricSnapshotIdSchema,
  period: periodSchema,
  sourceRecordIds: z.array(integrationSourceRecordIdSchema),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type DrillDown = z.infer<typeof drillDownSchema>;

export const commandCenterProjectionSchema = z.object({
  alerts: z.array(analyticsAlertSchema),
  changes: z.array(changeSinceLastVisitSchema),
  kpis: z.array(kpiProjectionSchema),
  meta: projectionMetaSchema,
  modules: z.array(moduleProjectionSchema),
  nextBestAction: analyticsTaskSchema,
  readinessSummary: z.object({
    blocked: z.number().int().nonnegative(),
    invalid: z.number().int().nonnegative(),
    partial: z.number().int().nonnegative(),
    ready: z.number().int().nonnegative(),
    stale: z.number().int().nonnegative(),
  }),
  tasks: z.array(analyticsTaskSchema),
});

export type CommandCenterProjection = z.infer<
  typeof commandCenterProjectionSchema
>;

export const analyticsCacheKeySchema = z.object({
  currency: currencyCodeSchema.nullable(),
  dataScope: z.string().min(1),
  metricCode: analyticsMetricCodeSchema.optional(),
  metricDefinitionVersion: ruleVersionSchema,
  period: periodSchema,
  policyVersion: z.literal(analyticsCachePolicyVersion),
  projectionVersion: z.literal(analyticsProjectionVersion),
  readiness: analyticsReadinessStatusSchema.optional(),
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type AnalyticsCacheKeyInput = z.infer<typeof analyticsCacheKeySchema>;

export function createAnalyticsCacheKey(input: AnalyticsCacheKeyInput): string {
  const key = analyticsCacheKeySchema.parse(input);

  return [
    key.policyVersion,
    key.tenantId,
    key.workspaceId,
    key.metricCode ?? 'projection',
    key.metricDefinitionVersion,
    key.projectionVersion,
    key.period.from,
    key.period.to,
    key.currency ?? 'no_currency',
    key.timezone,
    key.dataScope,
    key.readiness ?? 'any',
  ].join(':');
}

export const analyticsApiRoutes = {
  alerts: '/v1/alerts',
  analyticsCommandCenter: '/v1/analytics/command-center',
  analyticsCustomers: '/v1/analytics/customers',
  analyticsD2C: '/v1/analytics/d2c',
  analyticsMarketplace: '/v1/analytics/marketplace',
  analyticsMarketingAttribution: '/v1/analytics/marketing-attribution',
  analyticsOrders: '/v1/analytics/orders',
  analyticsPaidCampaigns: '/v1/analytics/paid-campaigns',
  analyticsProducts: '/v1/analytics/products',
  analyticsProfitability: '/v1/analytics/profitability',
  analyticsTraffic: '/v1/analytics/traffic',
  changesSinceLastVisit: '/v1/changes-since-last-visit',
  metricCalculation: '/v1/metric-calculations/{calculationId}',
  metricCalculations: '/v1/metric-calculations',
  metricDefinition: '/v1/metric-definitions/{metricCode}',
  metricDefinitionVersions: '/v1/metric-definitions/{metricCode}/versions',
  metricDefinitions: '/v1/metric-definitions',
  metricExport: '/v1/metric-exports/{exportId}',
  metricExports: '/v1/metric-exports',
  metricSnapshot: '/v1/metric-snapshots/{snapshotId}',
  metricSnapshotEvidence: '/v1/metric-snapshots/{snapshotId}/evidence',
  metricSnapshotLineage: '/v1/metric-snapshots/{snapshotId}/lineage',
  metricSnapshotReconciliation:
    '/v1/metric-snapshots/{snapshotId}/reconciliation',
  metricSnapshots: '/v1/metric-snapshots',
  metricsComparison: '/v1/metrics/{metricCode}/comparison',
  metricsDrivers: '/v1/metrics/{metricCode}/drivers',
  metricsHistory: '/v1/metrics/{metricCode}/history',
  metricsTrend: '/v1/metrics/{metricCode}/trend',
  tasks: '/v1/tasks',
} as const;

export const telemetryEventSchema = z.enum([
  'command_center.viewed',
  'analytics_module.viewed',
  'kpi.viewed',
  'kpi.trust_opened',
  'kpi.drilldown_opened',
  'kpi.comparison_changed',
  'kpi.period_changed',
  'metric.export_requested',
  'metric.recalculation_requested',
  'alert.opened',
  'alert.acknowledged',
  'task.opened',
  'task.completed',
  'workspace.switched',
]);

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

export const analyticsMonitoringSchema = z.object({
  alertCount: z.number().int().nonnegative(),
  cacheHitRate: z.string().min(1),
  calculationLatencyMs: z.number().int().nonnegative(),
  crossWorkspaceDenyCount: z.number().int().nonnegative(),
  exportLatencyMs: z.number().int().nonnegative(),
  firstReadyKpiAt: isoDateTimeSchema.nullable(),
  firstUsefulDataAt: isoDateTimeSchema.nullable(),
  invalidationFailures: z.number().int().nonnegative(),
  projectionLatencyMs: z.number().int().nonnegative(),
  queryLatencyMs: z.number().int().nonnegative(),
  readinessDistribution: z.record(analyticsReadinessStatusSchema, z.number().int().nonnegative()),
  reconciliationMismatchCount: z.number().int().nonnegative(),
  snapshotPublicationCount: z.number().int().nonnegative(),
});

export type AnalyticsMonitoring = z.infer<typeof analyticsMonitoringSchema>;

export const mvpMetricDefinitions: readonly MetricDefinition[] = [
  metricDefinitionSchema.parse({
    approver: 'artur_wisniewski',
    blockedReason: null,
    businessDescription:
      'Liczba unikalnych zamówień kanonicznych po kwalifikacji statusów i deduplikacji.',
    cancellationPolicy: 'Wyklucza status cancelled.',
    currency: null,
    dependentMetrics: [],
    exclusionRules: ['status=cancelled', 'brak canonical order id'],
    feesPolicy: 'Nie dotyczy.',
    formula: 'count(unique canonical_order.id) for qualifying statuses',
    formulaVersion: 'formula.order-count.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: 'Nie dotyczy.',
    inclusionRules: ['confirmed', 'processing', 'fulfilled', 'refunded'],
    inputDatasets: ['orders'],
    kpiId: 'order_count',
    lifecycleStatus: 'ACTIVE',
    limitations: [],
    name: 'Order Count',
    owner: 'PapaData Analytics',
    purpose: 'Pierwszy wiarygodny wolumen sprzedaży.',
    readinessRules: ['orders dataset READY albo PARTIAL bez błędu identity'],
    recalculationCriteria: ['dataset version changed', 'status mapping changed'],
    refundPolicy: 'Refundowane zamówienia nadal liczą się jako zamówienia.',
    scope: ['tenantId', 'workspaceId', 'period', 'timezone'],
    sources: ['WooCommerce orders'],
    statusMapping: wave3RuleVersions.statusMapping,
    timezone: 'Europe/Warsaw',
    unit: 'count',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.order-count.v1',
  }),
  metricDefinitionSchema.parse({
    approver: 'artur_wisniewski',
    blockedReason: null,
    businessDescription:
      'Suma wartości brutto kwalifikujących się zamówień w jednej walucie.',
    cancellationPolicy: 'Wyklucza status cancelled.',
    currency: 'PLN',
    dependentMetrics: ['net_revenue'],
    exclusionRules: ['brak gross', 'brak currency', 'currency mismatch'],
    feesPolicy: 'Nie odejmuje opłat.',
    formula: 'sum(order.amounts.gross) for qualifying statuses',
    formulaVersion: 'formula.gross-revenue.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['confirmed', 'processing', 'fulfilled', 'refunded'],
    inputDatasets: ['orders'],
    kpiId: 'gross_revenue',
    lifecycleStatus: 'ACTIVE',
    limitations: [],
    name: 'Gross Revenue',
    owner: 'PapaData Analytics',
    purpose: 'Sprzedaż brutto bez mieszania z atrybucją.',
    readinessRules: ['orders dataset READY', 'currency known'],
    recalculationCriteria: ['dataset version changed', 'currency policy changed'],
    refundPolicy: 'Refundy są osobnym KPI.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency', 'timezone'],
    sources: ['WooCommerce orders'],
    statusMapping: wave3RuleVersions.statusMapping,
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.gross-revenue.v1',
  }),
  metricDefinitionSchema.parse({
    approver: 'artur_wisniewski',
    blockedReason: null,
    businessDescription:
      'Suma potwierdzonych wartości refundów z canonical orders.',
    cancellationPolicy: 'Nie traktuje anulowania jako refundu.',
    currency: 'PLN',
    dependentMetrics: ['net_revenue'],
    exclusionRules: ['refund missing remains missing, not zero'],
    feesPolicy: 'Nie dotyczy.',
    formula: 'sum(order.amounts.refund where value is present)',
    formulaVersion: 'formula.refund-value.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['refunded', 'partiallyRefunded', 'confirmed with refund field'],
    inputDatasets: ['orders'],
    kpiId: 'refund_value',
    lifecycleStatus: 'ACTIVE',
    limitations: [],
    name: 'Refund Value',
    owner: 'PapaData Analytics',
    purpose: 'Oddziela korekty od sprzedaży brutto.',
    readinessRules: ['orders dataset READY albo PARTIAL z jasnym zakresem refundów'],
    recalculationCriteria: ['dataset version changed', 'refund policy changed'],
    refundPolicy: 'Uznaje tylko potwierdzoną wartość refund.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency', 'timezone'],
    sources: ['WooCommerce orders', 'WooCommerce refunds'],
    statusMapping: wave3RuleVersions.statusMapping,
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.refund-value.v1',
  }),
  metricDefinitionSchema.parse({
    approver: 'artur_wisniewski',
    blockedReason: null,
    businessDescription: 'Gross Revenue minus Refund Value.',
    cancellationPolicy: 'Dziedziczy politykę Gross Revenue i Refund Value.',
    currency: 'PLN',
    dependentMetrics: [],
    exclusionRules: ['blokuje, gdy gross lub refund są invalid'],
    feesPolicy: 'Nie odejmuje opłat marketplace.',
    formula: 'gross_revenue - refund_value',
    formulaVersion: 'formula.net-revenue.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['published gross_revenue snapshot', 'published refund_value snapshot'],
    inputDatasets: ['orders'],
    kpiId: 'net_revenue',
    lifecycleStatus: 'ACTIVE',
    limitations: [],
    name: 'Net Revenue',
    owner: 'PapaData Analytics',
    purpose: 'Przychód po refundach bez kosztów i opłat.',
    readinessRules: ['gross_revenue READY/PARTIAL', 'refund_value READY/PARTIAL'],
    recalculationCriteria: ['dependent snapshot changed'],
    refundPolicy: 'Odejmuje potwierdzone refundy.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency', 'timezone'],
    sources: ['MetricSnapshot gross_revenue', 'MetricSnapshot refund_value'],
    statusMapping: wave3RuleVersions.statusMapping,
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.net-revenue.v1',
  }),
  metricDefinitionSchema.parse({
    approver: null,
    blockedReason: 'Brak wdrożonego źródła BaseLinker/Allegro fees w local/CI.',
    businessDescription: 'Suma opłat marketplace z potwierdzonego źródła.',
    cancellationPolicy: 'Wymaga osobnej polityki providera marketplace.',
    currency: 'PLN',
    dependentMetrics: ['revenue_after_marketplace_fees'],
    exclusionRules: ['brak potwierdzonego datasetu fees'],
    feesPolicy: 'Wymagany dataset marketplace_fees.',
    formula: 'sum(marketplace_fee.amount)',
    formulaVersion: 'formula.marketplace-fees.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['confirmed marketplace fee record'],
    inputDatasets: ['marketplace_fees'],
    kpiId: 'marketplace_fees',
    lifecycleStatus: 'GATED',
    limitations: ['Provider marketplace jest skatalogowany, ale nieaktywny w Fali 4 local/CI.'],
    name: 'Marketplace Fees',
    owner: 'PapaData Analytics',
    purpose: 'Koszt platform marketplace.',
    readinessRules: ['marketplace fees dataset READY'],
    recalculationCriteria: ['fees dataset changed'],
    refundPolicy: 'Nie dotyczy.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency'],
    sources: ['BaseLinker', 'Allegro'],
    statusMapping: 'marketplace-fees.status.mapping.2026-07',
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.marketplace-fees.v1',
  }),
  metricDefinitionSchema.parse({
    approver: null,
    blockedReason: 'Zależne od Marketplace Fees.',
    businessDescription: 'Net Revenue minus Marketplace Fees.',
    cancellationPolicy: 'Dziedziczy polityki zależnych metryk.',
    currency: 'PLN',
    dependentMetrics: ['net_revenue', 'marketplace_fees'],
    exclusionRules: ['brak opłat nie jest zerem'],
    feesPolicy: 'Wymaga potwierdzonych fees.',
    formula: 'net_revenue - marketplace_fees',
    formulaVersion: 'formula.revenue-after-marketplace-fees.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['published net_revenue', 'published marketplace_fees'],
    inputDatasets: ['orders', 'marketplace_fees'],
    kpiId: 'revenue_after_marketplace_fees',
    lifecycleStatus: 'GATED',
    limitations: ['Nie odejmuje brakujących opłat jako zera.'],
    name: 'Revenue After Marketplace Fees',
    owner: 'PapaData Analytics',
    purpose: 'Przychód po opłatach marketplace.',
    readinessRules: ['net_revenue READY', 'marketplace_fees READY'],
    recalculationCriteria: ['dependent snapshot changed'],
    refundPolicy: 'Dziedziczy refund_value.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency'],
    sources: ['MetricSnapshot net_revenue', 'Marketplace fees dataset'],
    statusMapping: wave3RuleVersions.statusMapping,
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.revenue-after-marketplace-fees.v1',
  }),
  metricDefinitionSchema.parse({
    approver: null,
    blockedReason: 'Google Ads i Meta Ads są planowane, bez adaptera local/CI.',
    businessDescription: 'Suma kosztów reklamowych z platform paid.',
    cancellationPolicy: 'Nie dotyczy.',
    currency: 'PLN',
    dependentMetrics: ['roas', 'contribution_margin'],
    exclusionRules: ['brak kosztu reklamy nie jest zerem'],
    feesPolicy: 'Nie dotyczy.',
    formula: 'sum(ad_spend.amount)',
    formulaVersion: 'formula.advertising-spend.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['Google Ads cost', 'Meta Ads cost'],
    inputDatasets: ['paid_campaigns'],
    kpiId: 'advertising_spend',
    lifecycleStatus: 'GATED',
    limitations: ['Nie miesza kosztów reklamowych z przychodem transakcyjnym.'],
    name: 'Advertising Spend',
    owner: 'PapaData Analytics',
    purpose: 'Koszt kampanii płatnych.',
    readinessRules: ['paid campaigns dataset READY'],
    recalculationCriteria: ['ads dataset changed'],
    refundPolicy: 'Nie dotyczy.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency', 'platform'],
    sources: ['Google Ads', 'Meta Ads'],
    statusMapping: 'paid-campaign.status.mapping.2026-07',
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.advertising-spend.v1',
  }),
  metricDefinitionSchema.parse({
    approver: null,
    blockedReason: 'Brak aktywnych adapterów ads i modelu atrybucji.',
    businessDescription: 'Wartość konwersji raportowana przez platformę reklamową.',
    cancellationPolicy: 'Nie dotyczy.',
    currency: 'PLN',
    dependentMetrics: ['roas'],
    exclusionRules: ['nie jest przychodem transakcyjnym'],
    feesPolicy: 'Nie dotyczy.',
    formula: 'sum(platform_attributed_conversion_value)',
    formulaVersion: 'formula.attributed-conversion-value.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['approved attribution model'],
    inputDatasets: ['paid_campaigns'],
    kpiId: 'attributed_conversion_value',
    lifecycleStatus: 'GATED',
    limitations: ['Wartość atrybucyjna jest oddzielna od transakcji.'],
    name: 'Attributed Conversion Value',
    owner: 'PapaData Analytics',
    purpose: 'Wartość deklarowana przez platformę atrybucji.',
    readinessRules: ['paid campaigns dataset READY', 'attribution model approved'],
    recalculationCriteria: ['attribution model changed'],
    refundPolicy: 'Nie dotyczy.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency', 'platform'],
    sources: ['Google Ads', 'Meta Ads'],
    statusMapping: 'paid-attribution.status.mapping.2026-07',
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.attributed-conversion-value.v1',
  }),
  metricDefinitionSchema.parse({
    approver: null,
    blockedReason: 'Zależne od Advertising Spend i Attributed Conversion Value.',
    businessDescription: 'Attributed Conversion Value / Advertising Spend.',
    cancellationPolicy: 'Nie dotyczy.',
    currency: null,
    dependentMetrics: ['advertising_spend', 'attributed_conversion_value'],
    exclusionRules: ['nie publikuje, gdy spend jest brakujący albo zero niepotwierdzone'],
    feesPolicy: 'Nie dotyczy.',
    formula: 'attributed_conversion_value / advertising_spend',
    formulaVersion: 'formula.roas.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: 'Nie dotyczy dla ratio po jednej walucie wejść.',
    inclusionRules: ['published ad spend', 'published attributed value'],
    inputDatasets: ['paid_campaigns'],
    kpiId: 'roas',
    lifecycleStatus: 'GATED',
    limitations: ['ROAS nie oznacza rzeczywistej rentowności transakcyjnej.'],
    name: 'ROAS',
    owner: 'PapaData Analytics',
    purpose: 'Zwrot deklarowany przez platformę płatną.',
    readinessRules: ['advertising_spend READY', 'attributed_conversion_value READY'],
    recalculationCriteria: ['dependent snapshot changed'],
    refundPolicy: 'Nie dotyczy.',
    scope: ['tenantId', 'workspaceId', 'period', 'platform'],
    sources: ['MetricSnapshot advertising_spend', 'MetricSnapshot attributed_conversion_value'],
    statusMapping: 'paid-attribution.status.mapping.2026-07',
    timezone: 'Europe/Warsaw',
    unit: 'ratio',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.roas.v1',
  }),
  metricDefinitionSchema.parse({
    approver: null,
    blockedReason:
      'Brak potwierdzonego kosztu produktu i innych wymaganych kosztów zmiennych.',
    businessDescription:
      'Przychód po refundach, opłatach marketplace, reklamie, COGS i innych kosztach zmiennych.',
    cancellationPolicy: 'Dziedziczy politykę sprzedaży i kosztów.',
    currency: 'PLN',
    dependentMetrics: [
      'net_revenue',
      'marketplace_fees',
      'advertising_spend',
    ],
    exclusionRules: ['brak kosztu produktu nie jest zerem'],
    feesPolicy: 'Wymaga potwierdzonych opłat i kosztów.',
    formula: 'net_revenue - marketplace_fees - advertising_spend - cogs - variable_costs',
    formulaVersion: 'formula.contribution-margin.2026-07',
    freshnessThreshold: 'P1D',
    fxPolicy: wave3RuleVersions.currencyPolicy,
    inclusionRules: ['confirmed revenue', 'confirmed refunds', 'confirmed fees', 'confirmed product cost'],
    inputDatasets: ['orders', 'marketplace_fees', 'paid_campaigns', 'product_costs'],
    kpiId: 'contribution_margin',
    lifecycleStatus: 'BLOCKED',
    limitations: ['Nie wolno pokazać Contribution Margin bez potwierdzonego kosztu.'],
    name: 'Contribution Margin',
    owner: 'PapaData Analytics',
    purpose: 'Rentowność po kosztach zmiennych.',
    readinessRules: ['all variable cost datasets READY'],
    recalculationCriteria: ['dependent snapshot changed', 'cost policy changed'],
    refundPolicy: 'Dziedziczy refund_value.',
    scope: ['tenantId', 'workspaceId', 'period', 'currency'],
    sources: ['Orders', 'Fees', 'Ads', 'Product costs'],
    statusMapping: wave3RuleVersions.statusMapping,
    timezone: 'Europe/Warsaw',
    unit: 'money',
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.contribution-margin.v1',
  }),
] as const;

export const providerImpactSchema = z.object({
  connectionId: connectionIdSchema.nullable(),
  datasets: z.array(z.string().min(1)),
  kpis: z.array(analyticsMetricCodeSchema),
  providerId: providerIdSchema,
  readiness: analyticsReadinessStatusSchema,
});

export type ProviderImpact = z.infer<typeof providerImpactSchema>;

export const analyticsResponseMetaSchema = z.object({
  contractVersion: contractVersionSchema,
  correlationId: correlationIdSchema,
  generatedAt: isoDateTimeSchema,
  limitations: z.array(z.string().min(1)),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AnalyticsResponseMeta = z.infer<typeof analyticsResponseMetaSchema>;

export const analyticsPermissionErrorSchema = z.object({
  code: z.enum([
    'CAPABILITY_REQUIRED',
    'ENTITLEMENT_REQUIRED',
    'FOREIGN_TENANT',
    'FOREIGN_WORKSPACE',
    'QUERY_TIMEOUT',
    'QUERY_COST_LIMIT',
    'STALE_WORKSPACE_RESPONSE',
    'NOT_FOUND',
  ]),
  correlationId: correlationIdSchema,
  message: z.string().min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AnalyticsPermissionError = z.infer<
  typeof analyticsPermissionErrorSchema
>;
