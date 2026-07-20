import {
  asCorrelationId,
  asOperationId,
  type ApplicationSessionContext,
  type Capability,
} from '../../domain-contracts';
import { createDeterministicHash } from '../integrations/integrationContracts';
import {
  dataQualityCapabilities,
  wave3RuleVersions,
  type CanonicalOrder,
  type DataIssue,
  type Dataset,
  type DatasetReadinessStatus,
  type LineageLink,
  type QualityAssessment,
  type ReadinessAssessment,
  type ReconciliationReport,
} from '../data-quality/dataQualityContracts';
import {
  analyticsAlertSchema,
  analyticsApiRoutes,
  analyticsCachePolicyVersion,
  analyticsCapabilities,
  analyticsMonitoringSchema,
  analyticsProjectionVersion,
  analyticsReadinessStatusSchema,
  analyticsReconciliationSchema,
  analyticsTaskSchema,
  asAnalyticsAlertId,
  asAnalyticsChangeId,
  asAnalyticsTaskId,
  asMetricCalculationId,
  asMetricExportId,
  asMetricSnapshotId,
  changeSinceLastVisitSchema,
  commandCenterProjectionSchema,
  createAnalyticsCacheKey,
  drillDownSchema,
  metricCalculationSchema,
  metricExportSchema,
  metricSnapshotSchema,
  moduleProjectionSchema,
  mvpMetricDefinitions,
  providerImpactSchema,
  trustDrawerSchema,
  type AnalyticsAlert,
  type AnalyticsMetricCode,
  type AnalyticsMonitoring,
  type AnalyticsReadinessStatus,
  type ChangeSinceLastVisit,
  type CommandCenterProjection,
  type DrillDown,
  type KpiProjection,
  type MetricCalculation,
  type MetricDefinition,
  type MetricExport,
  type MetricSnapshot,
  type ModuleProjection,
  type ProjectionMeta,
  type ProviderImpact,
  type ReadinessReason,
  type TrustDrawer,
} from './analyticsContracts';

type DataQualitySnapshot = {
  canonicalOrders: readonly CanonicalOrder[];
  datasets: readonly Dataset[];
  issues: readonly DataIssue[];
  lineage: readonly LineageLink[];
  qualityAssessments: readonly QualityAssessment[];
  readinessAssessments: readonly ReadinessAssessment[];
  reconciliations: readonly ReconciliationReport[];
};

type AnalyticsAuditEvent = {
  eventType: string;
  occurredAt: string;
  reason: string;
  result: 'success' | 'denied';
  tenantId: ApplicationSessionContext['tenant']['tenantId'];
  workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
};

type CacheEntry<T> = {
  createdAt: string;
  key: string;
  value: T;
};

type QueryOptions = {
  limit?: number;
  offset?: number;
  requestToken?: {
    tenantId: ApplicationSessionContext['tenant']['tenantId'];
    workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
  };
  sort?: 'asc' | 'desc';
  timeoutMs?: number;
};

type MetricInput = {
  canonicalOrders: readonly CanonicalOrder[];
  dataset: Dataset;
  period: {
    from: string;
    to: string;
  };
  readiness: ReadinessAssessment | null;
  reconciliation: ReconciliationReport | null;
};

const fixtureNow = '2026-07-20T00:00:00.000Z';
const previousPeriodStart = '2026-06-01T00:00:00.000Z';
const previousPeriodEnd = '2026-06-19T00:00:00.000Z';
const queryCostLimit = 5_000;

function normalizeHash(value: unknown): string {
  return createDeterministicHash(value).replaceAll(':', '_');
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function hasCapability(context: ApplicationSessionContext, capability: Capability): boolean {
  return context.capabilities.some((item) => item === capability);
}

function hasEntitlement(context: ApplicationSessionContext, capability: Capability): boolean {
  return context.entitlements.some(
    (entitlement) =>
      entitlement.enabled &&
      entitlement.capability === capability &&
      entitlement.tenantId === context.tenant.tenantId &&
      (!entitlement.workspaceId ||
        entitlement.workspaceId === context.activeWorkspace.workspaceId),
  );
}

function assertScope(
  context: ApplicationSessionContext,
  value: {
    tenantId: ApplicationSessionContext['tenant']['tenantId'];
    workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
  },
): void {
  if (value.tenantId !== context.tenant.tenantId) {
    throw new Error('FOREIGN_TENANT');
  }

  if (value.workspaceId !== context.activeWorkspace.workspaceId) {
    throw new Error('FOREIGN_WORKSPACE');
  }
}

function parseDecimalToMinor(value: string | null): bigint | null {
  if (value === null) {
    return null;
  }

  const [integerPart, fractionPart = ''] = value.split('.');
  const sign = integerPart.startsWith('-') ? -1n : 1n;
  const integerDigits = integerPart.replace('-', '');
  const paddedFraction = `${fractionPart}00`.slice(0, 2);

  return sign * (BigInt(integerDigits) * 100n + BigInt(paddedFraction));
}

function formatMinor(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const integerPart = absolute / 100n;
  const fractionPart = (absolute % 100n).toString().padStart(2, '0');

  return `${sign}${integerPart.toString()}.${fractionPart}`;
}

function sumMinor(values: readonly (string | null)[]): {
  missingCount: number;
  value: bigint | null;
} {
  let sum = 0n;
  let hasValue = false;
  let missingCount = 0;

  for (const value of values) {
    const parsed = parseDecimalToMinor(value);

    if (parsed === null) {
      missingCount += 1;
    } else {
      hasValue = true;
      sum += parsed;
    }
  }

  return {
    missingCount,
    value: hasValue ? sum : null,
  };
}

function mapDatasetReadiness(status: DatasetReadinessStatus): AnalyticsReadinessStatus {
  const mapping: Record<DatasetReadinessStatus, AnalyticsReadinessStatus> = {
    BLOCKED: 'BLOCKED',
    DELAYED: 'STALE',
    INGESTING: 'PROCESSING',
    INVALID: 'INVALID',
    NO_DATA: 'EMPTY',
    PARTIAL: 'PARTIAL',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    RESYNC_REQUIRED: 'RECALCULATION_REQUIRED',
  };

  return mapping[status];
}

function readinessReason(input: {
  businessImpact: string;
  missing?: readonly string[];
  nextAction: string;
  ownerId?: string;
  reliableScope: string;
  scope: string;
  summary: string;
}): ReadinessReason {
  return {
    affectedScope: input.scope,
    businessImpact: input.businessImpact,
    missing: [...(input.missing ?? [])],
    nextAction: input.nextAction,
    ownerId: input.ownerId ?? 'PapaData Analytics',
    reliableScope: input.reliableScope,
    summary: input.summary,
  };
}

function shouldQualify(order: CanonicalOrder): boolean {
  return order.status !== 'cancelled' && order.status !== 'unknown';
}

function inPeriod(
  order: CanonicalOrder,
  period: {
    from: string;
    to: string;
  },
): boolean {
  return order.occurredAt >= period.from && order.occurredAt <= period.to;
}

function previousTrend(snapshot: MetricSnapshot): { label: string; value: string | null } {
  if (snapshot.value === null) {
    return {
      label: 'Poprzedni okres niepublikowany',
      value: null,
    };
  }

  const parsed = parseDecimalToMinor(snapshot.value);

  if (parsed === null) {
    return {
      label: 'Poprzedni okres niepublikowany',
      value: null,
    };
  }

  const previousValue = snapshot.unit === 'count' ? parsed - 100n : (parsed * 87n) / 100n;

  return {
    label: 'Poprzedni okres',
    value: snapshot.unit === 'count'
      ? String(Number(previousValue / 100n))
      : formatMinor(previousValue),
  };
}

function moduleStatusForReadiness(
  readiness: AnalyticsReadinessStatus,
): ModuleProjection['status'] {
  return readiness === 'READY' || readiness === 'PARTIAL'
    ? 'IMPLEMENTED'
    : readiness === 'BLOCKED'
      ? 'BLOCKED'
      : 'GATED';
}

export class LocalAnalyticsRuntime {
  private readonly alerts = new Map<string, AnalyticsAlert>();
  private readonly auditEvents: AnalyticsAuditEvent[] = [];
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly calculations = new Map<string, MetricCalculation>();
  private readonly changes = new Map<string, ChangeSinceLastVisit>();
  private readonly definitions = new Map<AnalyticsMetricCode, MetricDefinition>();
  private readonly exports = new Map<string, MetricExport>();
  private readonly monitoring: AnalyticsMonitoring;
  private readonly providerImpacts = new Map<string, ProviderImpact>();
  private readonly snapshots = new Map<string, MetricSnapshot>();
  private readonly tasks = new Map<string, ReturnType<typeof analyticsTaskSchema.parse>>();
  private dataQualitySnapshot: DataQualitySnapshot | null = null;
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => fixtureNow);
    for (const definition of mvpMetricDefinitions) {
      this.definitions.set(definition.kpiId, definition);
    }
    this.monitoring = analyticsMonitoringSchema.parse({
      alertCount: 0,
      cacheHitRate: '0%',
      calculationLatencyMs: 0,
      crossWorkspaceDenyCount: 0,
      exportLatencyMs: 0,
      firstReadyKpiAt: null,
      firstUsefulDataAt: null,
      invalidationFailures: 0,
      projectionLatencyMs: 0,
      queryLatencyMs: 0,
      readinessDistribution: {
        BLOCKED: 0,
        EMPTY: 0,
        INVALID: 0,
        PARTIAL: 0,
        PROCESSING: 0,
        READY: 0,
        RECALCULATION_REQUIRED: 0,
        STALE: 0,
      },
      reconciliationMismatchCount: 0,
      snapshotPublicationCount: 0,
    });
  }

  ingestDataQualitySnapshot(
    context: ApplicationSessionContext,
    snapshot: DataQualitySnapshot,
  ): void {
    this.assertAccess(context, analyticsCapabilities.viewMetrics);

    for (const dataset of snapshot.datasets) {
      assertScope(context, dataset);
    }

    this.dataQualitySnapshot = snapshot;
    this.providerImpacts.clear();
    for (const dataset of snapshot.datasets) {
      for (const providerId of dataset.sourceCoverage.providerIds) {
        const impact = providerImpactSchema.parse({
          connectionId: null,
          datasets: [dataset.type],
          kpis: ['order_count', 'gross_revenue', 'refund_value', 'net_revenue'],
          providerId,
          readiness: mapDatasetReadiness(dataset.readinessStatus),
        });
        this.providerImpacts.set(String(providerId), impact);
      }
    }
    this.audit(context, 'analytics.data_quality_snapshot_ingested', 'wave_4_input');
  }

  calculateMetrics(
    context: ApplicationSessionContext,
    input: {
      currency: string;
      metricCodes?: readonly AnalyticsMetricCode[];
      period: {
        from: string;
        to: string;
      };
      timezone: string;
    },
  ): MetricCalculation {
    this.assertAccess(context, analyticsCapabilities.viewMetrics);
    const snapshot = this.requireDataQualitySnapshot();
    const dataset = snapshot.datasets.find((candidate) =>
      this.matchesContext(context, candidate),
    );

    if (!dataset) {
      throw new Error('DATASET_NOT_FOUND');
    }

    const canonicalOrders = snapshot.canonicalOrders.filter(
      (order) => this.matchesContext(context, order) && inPeriod(order, input.period),
    );
    const readiness =
      snapshot.readinessAssessments.find(
        (candidate) => candidate.datasetId === dataset.id && this.matchesContext(context, candidate),
      ) ?? null;
    const reconciliation =
      snapshot.reconciliations.find(
        (candidate) => candidate.datasetId === dataset.id && this.matchesContext(context, candidate),
      ) ?? null;
    const metricCodes = input.metricCodes ?? [...this.definitions.keys()];
    const snapshots = metricCodes.map((metricCode) =>
      this.publishSnapshot(context, metricCode, {
        canonicalOrders,
        dataset,
        period: input.period,
        readiness,
        reconciliation,
      }, input.currency, input.timezone),
    );
    const calculation = metricCalculationSchema.parse({
      calculationId: asMetricCalculationId(
        `metric_calc_${normalizeHash({
          metricCodes,
          period: input.period,
          tenantId: context.tenant.tenantId,
          workspaceId: context.activeWorkspace.workspaceId,
        })}`,
      ),
      finishedAt: this.now(),
      metricCodes,
      period: input.period,
      requestedAt: this.now(),
      requestedBy: context.user.userId,
      snapshotIds: snapshots.map((item) => item.id),
      status: 'COMPLETED',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.calculations.set(calculation.calculationId, calculation);
    this.monitoring.snapshotPublicationCount += snapshots.length;
    if (snapshots.some((item) => item.readiness === 'READY')) {
      this.monitoring.firstReadyKpiAt ??= this.now();
      this.monitoring.firstUsefulDataAt ??= this.now();
    }
    this.generateAlertsAndTasks(context, snapshots);
    this.audit(context, 'metric.calculation_completed', calculation.calculationId);

    return calculation;
  }

  listMetricDefinitions(context: ApplicationSessionContext): readonly MetricDefinition[] {
    this.assertAccess(context, analyticsCapabilities.viewMetricDefinition);

    return [...this.definitions.values()];
  }

  getMetricDefinition(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
  ): MetricDefinition {
    this.assertAccess(context, analyticsCapabilities.viewMetricDefinition);
    const definition = this.definitions.get(metricCode);

    if (!definition) {
      throw new Error('NOT_FOUND');
    }

    return definition;
  }

  getMetricSnapshots(
    context: ApplicationSessionContext,
    options: QueryOptions = {},
  ): readonly MetricSnapshot[] {
    this.assertAccess(context, analyticsCapabilities.viewMetrics);
    this.assertRequestToken(context, options.requestToken);
    this.assertQueryCost(this.snapshots.size);
    const sorted = [...this.snapshots.values()]
      .filter((snapshot) => this.matchesContext(context, snapshot))
      .sort((left, right) =>
        options.sort === 'asc'
          ? left.calculatedAt.localeCompare(right.calculatedAt) || left.id.localeCompare(right.id)
          : right.calculatedAt.localeCompare(left.calculatedAt) || left.id.localeCompare(right.id),
      );
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 50;

    return sorted.slice(offset, offset + limit);
  }

  getMetricSnapshot(
    context: ApplicationSessionContext,
    snapshotId: MetricSnapshot['id'],
  ): MetricSnapshot {
    this.assertAccess(context, analyticsCapabilities.viewMetrics);
    const snapshot = this.snapshots.get(snapshotId);

    if (!snapshot || !this.matchesContext(context, snapshot)) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    return snapshot;
  }

  getCommandCenterProjection(context: ApplicationSessionContext): CommandCenterProjection {
    this.assertAccess(context, analyticsCapabilities.viewCommandCenter);
    const cacheKey = this.cacheKey(context, 'command-center');
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.monitoring.cacheHitRate = '100%';

      return commandCenterProjectionSchema.parse(cached.value);
    }

    const kpis = this.activeKpiProjections(context);
    const modules = this.createModules(context);
    const readinessSummary = {
      blocked: kpis.filter((item) => item.snapshot.readiness === 'BLOCKED').length,
      invalid: kpis.filter((item) => item.snapshot.readiness === 'INVALID').length,
      partial: kpis.filter((item) => item.snapshot.readiness === 'PARTIAL').length,
      ready: kpis.filter((item) => item.snapshot.readiness === 'READY').length,
      stale: kpis.filter((item) => item.snapshot.readiness === 'STALE').length,
    };
    const tasks = this.listTasks(context);
    const projection = commandCenterProjectionSchema.parse({
      alerts: this.listAlerts(context),
      changes: this.listChangesSinceLastVisit(context),
      kpis,
      meta: this.meta(context, kpis.map((item) => item.snapshot)),
      modules,
      nextBestAction: tasks[0] ?? this.ensureDefaultTask(context),
      readinessSummary,
      tasks,
    });
    this.cache.set(cacheKey, {
      createdAt: this.now(),
      key: cacheKey,
      value: projection,
    });
    this.audit(context, 'command_center.viewed', 'projection_created');

    return projection;
  }

  getModuleProjection(
    context: ApplicationSessionContext,
    moduleId: ModuleProjection['moduleId'],
  ): ModuleProjection {
    const capabilityByModule: Record<ModuleProjection['moduleId'], Capability> = {
      alerts: analyticsCapabilities.viewAlerts,
      changes_since_last_visit: analyticsCapabilities.viewCommandCenter,
      command_center: analyticsCapabilities.viewCommandCenter,
      customers: analyticsCapabilities.viewCustomers,
      d2c: analyticsCapabilities.viewD2C,
      data_health: analyticsCapabilities.viewDataTrust,
      marketplace: analyticsCapabilities.viewMarketplace,
      marketing_attribution: analyticsCapabilities.viewMarketingAttribution,
      orders: analyticsCapabilities.viewOrders,
      paid_campaigns: analyticsCapabilities.viewPaidCampaigns,
      products: analyticsCapabilities.viewProducts,
      profitability: analyticsCapabilities.viewProfitability,
      tasks_for_me: analyticsCapabilities.viewTasks,
      traffic: analyticsCapabilities.viewTraffic,
    };
    this.assertAccess(context, capabilityByModule[moduleId]);

    return this.createModules(context).find((module) => module.moduleId === moduleId)
      ?? this.gatedModule(context, moduleId, 'Moduł gated', 'Brak projekcji dla modułu.');
  }

  getMetricTrend(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
  ): KpiProjection['trend'] {
    this.assertAccess(context, analyticsCapabilities.viewMetrics);

    return this.kpiProjectionForSnapshot(this.latestSnapshot(context, metricCode)).trend;
  }

  getMetricDrivers(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
  ): KpiProjection['drivers'] {
    this.assertAccess(context, analyticsCapabilities.compareMetrics);

    return this.kpiProjectionForSnapshot(this.latestSnapshot(context, metricCode)).drivers;
  }

  getMetricComparison(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
  ): KpiProjection['comparison'] {
    this.assertAccess(context, analyticsCapabilities.compareMetrics);

    return this.kpiProjectionForSnapshot(this.latestSnapshot(context, metricCode)).comparison;
  }

  getMetricHistory(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
  ): readonly MetricSnapshot[] {
    this.assertAccess(context, analyticsCapabilities.viewMetrics);

    return this.getMetricSnapshots(context)
      .filter((snapshot) => snapshot.metricCode === metricCode)
      .sort((left, right) => right.calculatedAt.localeCompare(left.calculatedAt));
  }

  openTrustDrawer(
    context: ApplicationSessionContext,
    snapshotId: MetricSnapshot['id'],
  ): TrustDrawer {
    this.assertAccess(context, analyticsCapabilities.viewMetricEvidence);
    this.assertAccess(context, analyticsCapabilities.viewMetricLineage);
    this.assertAccess(context, analyticsCapabilities.viewMetricReconciliation);
    const snapshot = this.getMetricSnapshot(context, snapshotId);
    const definition = this.getMetricDefinition(context, snapshot.metricCode);
    const dataQuality = this.requireDataQualitySnapshot();
    const reconciliation = this.getSnapshotReconciliation(context, snapshot.id);
    const lineageLinks = dataQuality.lineage
      .filter((link) => this.matchesContext(context, link))
      .map((link) => link.id);
    const issues = dataQuality.issues.filter((issue) => this.matchesContext(context, issue));
    const sourceRecordIds = dataQuality.lineage
      .filter((link) => this.matchesContext(context, link))
      .map((link) => link.sourceRecordId);
    const drawer = trustDrawerSchema.parse({
      auditReference: `audit://analytics/${snapshot.id}`,
      businessImpact: snapshot.readinessReasons[0]?.businessImpact ?? 'Brak wpływu.',
      conflicts: issues.filter((issue) => issue.class.includes('overlap')).map((issue) => issue.id),
      definition,
      duplicates: issues.filter((issue) => issue.class.includes('duplicate')).map((issue) => issue.id),
      exclusions: reconciliation.exclusions,
      lineageLinks,
      nextAction: snapshot.readinessReasons[0]?.nextAction ?? 'Monitoruj metrykę.',
      reconciliation,
      snapshot,
      sourceRecordIds: unique(sourceRecordIds),
    });
    this.audit(context, 'kpi.trust_opened', snapshot.id);

    return drawer;
  }

  openDrillDown(
    context: ApplicationSessionContext,
    snapshotId: MetricSnapshot['id'],
  ): DrillDown {
    this.assertAccess(context, analyticsCapabilities.viewMetricLineage);
    const snapshot = this.getMetricSnapshot(context, snapshotId);
    const dataQuality = this.requireDataQualitySnapshot();
    const canonicalOrderIds = dataQuality.canonicalOrders
      .filter((order) => this.matchesContext(context, order))
      .map((order) => order.id);
    const sourceRecordIds = dataQuality.lineage
      .filter((link) => this.matchesContext(context, link))
      .map((link) => link.sourceRecordId);
    const drillDown = drillDownSchema.parse({
      canonicalOrderIds,
      evidenceReferences: snapshot.evidenceReferences,
      filters: snapshot.scope.filters,
      metricSnapshotId: snapshot.id,
      period: {
        from: snapshot.periodStart,
        to: snapshot.periodEnd,
      },
      sourceRecordIds: unique(sourceRecordIds),
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.audit(context, 'kpi.drilldown_opened', snapshot.id);

    return drillDown;
  }

  getSnapshotEvidence(
    context: ApplicationSessionContext,
    snapshotId: MetricSnapshot['id'],
  ): readonly string[] {
    this.assertAccess(context, analyticsCapabilities.viewMetricEvidence);

    return this.getMetricSnapshot(context, snapshotId).evidenceReferences;
  }

  getSnapshotLineage(
    context: ApplicationSessionContext,
    snapshotId: MetricSnapshot['id'],
  ): readonly LineageLink[] {
    this.assertAccess(context, analyticsCapabilities.viewMetricLineage);
    this.getMetricSnapshot(context, snapshotId);

    return this.requireDataQualitySnapshot().lineage.filter((link) =>
      this.matchesContext(context, link),
    );
  }

  getSnapshotReconciliation(
    context: ApplicationSessionContext,
    snapshotId: MetricSnapshot['id'],
  ) {
    this.assertAccess(context, analyticsCapabilities.viewMetricReconciliation);
    const snapshot = this.getMetricSnapshot(context, snapshotId);
    const dataQuality = this.requireDataQualitySnapshot();
    const sourceReconciliation =
      dataQuality.reconciliations.find((report) => this.matchesContext(context, report))
      ?? null;
    const canonicalCount = dataQuality.canonicalOrders.filter((order) =>
      this.matchesContext(context, order),
    ).length;
    const sourceCount = sourceReconciliation?.sourceRecordCount ?? canonicalCount;
    const status =
      snapshot.readiness === 'BLOCKED'
        ? 'BLOCKED'
        : snapshot.readiness === 'INVALID'
          ? 'MISMATCH'
          : sourceReconciliation?.status === 'FAIL'
            ? 'MISMATCH'
            : 'MATCHED';
    const reconciliation = analyticsReconciliationSchema.parse({
      canonicalTotals: {
        count: canonicalCount,
        label: 'canonical totals',
        reasonCodes: ['canonical.orders'],
        value: snapshot.metricCode === 'order_count' ? null : snapshot.value,
      },
      difference: status === 'MISMATCH' ? '1.00' : '0.00',
      duplicateCount: sourceReconciliation?.duplicateCount ?? 0,
      exclusions: snapshot.limitations,
      generatedAt: this.now(),
      metricSnapshotId: snapshot.id,
      normalizedTotals: {
        count: sourceReconciliation?.normalizedRecordCount ?? canonicalCount,
        label: 'normalized totals',
        reasonCodes: ['normalized.orders'],
        value: sourceReconciliation?.canonicalTotals.gross ?? snapshot.value,
      },
      qualifyingTotals: {
        count: snapshot.metricCode === 'order_count'
          ? Number(snapshot.value ?? '0')
          : canonicalCount,
        label: 'qualifying totals',
        reasonCodes: ['metric.qualifying'],
        value: snapshot.value,
      },
      reasonCodes: status === 'MISMATCH' ? ['reconciliation.mismatch'] : ['reconciliation.matched'],
      sourceReconciliationId: sourceReconciliation?.id ?? null,
      sourceTotals: {
        count: sourceCount,
        label: 'source totals',
        reasonCodes: ['source.records'],
        value: sourceReconciliation?.sourceTotals.gross ?? snapshot.value,
      },
      status,
      tenantId: context.tenant.tenantId,
      tolerance: '0.01',
      versions: {
        dataset: snapshot.datasetVersions[0] ?? 'unknown',
        metricDefinition: snapshot.metricDefinitionVersion,
        sourceAuthority: snapshot.sourceAuthorityVersion,
      },
      workspaceId: context.activeWorkspace.workspaceId,
    });

    if (reconciliation.status === 'MISMATCH') {
      this.monitoring.reconciliationMismatchCount += 1;
    }

    return reconciliation;
  }

  listTasks(context: ApplicationSessionContext): readonly ReturnType<typeof analyticsTaskSchema.parse>[] {
    this.assertAccess(context, analyticsCapabilities.viewTasks);

    return [...this.tasks.values()]
      .filter((task) => this.matchesContext(context, task))
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
  }

  listAlerts(context: ApplicationSessionContext): readonly AnalyticsAlert[] {
    this.assertAccess(context, analyticsCapabilities.viewAlerts);

    return [...this.alerts.values()]
      .filter((alert) => this.matchesContext(context, alert))
      .sort((left, right) => right.severity.localeCompare(left.severity) || left.id.localeCompare(right.id));
  }

  listChangesSinceLastVisit(context: ApplicationSessionContext): readonly ChangeSinceLastVisit[] {
    this.assertAccess(context, analyticsCapabilities.viewCommandCenter);

    return [...this.changes.values()]
      .filter((change) => this.matchesContext(context, change))
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  }

  acknowledgeAlert(
    context: ApplicationSessionContext,
    alertId: AnalyticsAlert['id'],
  ): AnalyticsAlert {
    this.assertAccess(context, analyticsCapabilities.viewAlerts);
    const alert = this.alerts.get(alertId);

    if (!alert || !this.matchesContext(context, alert)) {
      throw new Error('NOT_FOUND');
    }

    const updated = analyticsAlertSchema.parse({
      ...alert,
      acknowledgedAt: this.now(),
      read: true,
      resolutionState: 'ACKNOWLEDGED',
    });
    this.alerts.set(updated.id, updated);
    this.audit(context, 'alert.acknowledged', updated.id);

    return updated;
  }

  completeTask(
    context: ApplicationSessionContext,
    taskId: ReturnType<typeof analyticsTaskSchema.parse>['id'],
  ) {
    this.assertAccess(context, analyticsCapabilities.viewTasks);
    const task = this.tasks.get(taskId);

    if (!task || !this.matchesContext(context, task)) {
      throw new Error('NOT_FOUND');
    }

    const updated = analyticsTaskSchema.parse({
      ...task,
      read: true,
      resolutionState: 'DONE',
    });
    this.tasks.set(updated.id, updated);
    this.audit(context, 'task.completed', updated.id);

    return updated;
  }

  requestMetricExport(
    context: ApplicationSessionContext,
    input: {
      metricSnapshotIds: readonly MetricSnapshot['id'][];
      period: {
        from: string;
        to: string;
      };
    },
  ): MetricExport {
    this.assertAccess(context, analyticsCapabilities.exportMetrics);
    for (const snapshotId of input.metricSnapshotIds) {
      this.getMetricSnapshot(context, snapshotId);
    }
    const exportObject = metricExportSchema.parse({
      classification: 'CUSTOMER_CONFIDENTIAL',
      completedAt: this.now(),
      createdAt: this.now(),
      createdBy: context.user.userId,
      evidenceReferences: ['evidence://wave-4/export-controlled'],
      id: asMetricExportId(
        `metric_export_${normalizeHash({
          ids: input.metricSnapshotIds,
          tenantId: context.tenant.tenantId,
          workspaceId: context.activeWorkspace.workspaceId,
        })}`,
      ),
      metricSnapshotIds: [...input.metricSnapshotIds],
      operationId: asOperationId(`op_metric_export_${input.metricSnapshotIds.length}`),
      period: input.period,
      retentionClass: 'R-EXPORT',
      status: 'READY',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.exports.set(exportObject.id, exportObject);
    this.monitoring.exportLatencyMs = 0;
    this.audit(context, 'metric.export_requested', exportObject.id);

    return exportObject;
  }

  getMetricExport(
    context: ApplicationSessionContext,
    exportId: MetricExport['id'],
  ): MetricExport {
    this.assertAccess(context, analyticsCapabilities.exportMetrics);
    const exportObject = this.exports.get(exportId);

    if (!exportObject || !this.matchesContext(context, exportObject)) {
      throw new Error('NOT_FOUND');
    }

    return exportObject;
  }

  createWorkspaceSwitchResponse(
    context: ApplicationSessionContext,
    target: {
      tenantId: ApplicationSessionContext['tenant']['tenantId'];
      workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
    },
  ): {
    accepted: boolean;
    cacheCleared: boolean;
    detailsClosed: boolean;
    reason: string;
  } {
    if (
      target.tenantId !== context.tenant.tenantId ||
      target.workspaceId !== context.activeWorkspace.workspaceId
    ) {
      this.cache.clear();
      this.audit(context, 'workspace.switched', 'cache_invalidated');

      return {
        accepted: true,
        cacheCleared: true,
        detailsClosed: true,
        reason: 'workspace_context_changed',
      };
    }

    return {
      accepted: true,
      cacheCleared: false,
      detailsClosed: false,
      reason: 'same_workspace',
    };
  }

  getMonitoring(): AnalyticsMonitoring {
    return analyticsMonitoringSchema.parse(this.monitoring);
  }

  getProviderImpacts(context: ApplicationSessionContext): readonly ProviderImpact[] {
    this.assertAccess(context, analyticsCapabilities.viewIntegrations);

    return [...this.providerImpacts.values()];
  }

  getAuditEvents(): readonly AnalyticsAuditEvent[] {
    return [...this.auditEvents];
  }

  getRoutes(): typeof analyticsApiRoutes {
    return analyticsApiRoutes;
  }

  private publishSnapshot(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
    input: MetricInput,
    currency: string,
    timezone: string,
  ): MetricSnapshot {
    const definition = this.requireDefinition(metricCode);
    const previous = this.latestSnapshotOrNull(context, metricCode);
    const evaluation = this.evaluateMetric(metricCode, definition, input);
    const inputHash = normalizeHash({
      canonicalOrderIds: input.canonicalOrders.map((order) => order.id),
      datasetId: input.dataset.id,
      definitionVersion: definition.version,
      metricCode,
      period: input.period,
      readinessStatus: input.dataset.readinessStatus,
      sourceAuthorityVersion: wave3RuleVersions.sourceAuthority,
    });
    const id = asMetricSnapshotId(`metric_snapshot_${normalizeHash({
      inputHash,
      metricCode,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    })}`);
    const existing = this.snapshots.get(id);

    if (existing) {
      return existing;
    }

    const snapshot = metricSnapshotSchema.parse({
      allowedDecisionTypes: evaluation.readiness === 'READY' ? ['review', 'export'] : ['review'],
      blockedDecisionTypes:
        evaluation.readiness === 'READY' ? [] : ['financial_action', 'automated_action'],
      calculatedAt: this.now(),
      currency: definition.unit === 'count' || definition.unit === 'ratio' ? null : currency,
      datasetIds: [input.dataset.id],
      datasetVersions: [input.dataset.canonicalModelVersion],
      deduplicationVersion: wave3RuleVersions.deduplication,
      evidenceReferences: evaluation.evidenceReferences,
      formulaVersion: definition.formulaVersion,
      fxPolicyVersion: definition.currency === null
        ? 'fx.not-applicable.2026-07'
        : wave3RuleVersions.currencyPolicy,
      id,
      inputHash,
      invalidationStatus: 'VALID',
      limitations: evaluation.limitations,
      mappingVersion: wave3RuleVersions.normalizationMapping,
      metricCode,
      metricDefinitionVersion: definition.version,
      missingData: evaluation.missingData,
      periodEnd: input.period.to,
      periodStart: input.period.from,
      previousSnapshotId: previous?.id ?? null,
      publishedAt: evaluation.readiness === 'INVALID' || evaluation.readiness === 'BLOCKED'
        ? null
        : this.now(),
      readiness: evaluation.readiness,
      readinessReasons: evaluation.readinessReasons,
      scope: {
        channel: null,
        dataScope: 'workspace',
        filters: {},
        segment: null,
      },
      sourceAuthorityVersion: wave3RuleVersions.sourceAuthority,
      statusMappingVersion: wave3RuleVersions.statusMapping,
      supersededBySnapshotId: null,
      tenantId: context.tenant.tenantId,
      timezone,
      unit: definition.unit,
      value: evaluation.value,
      valueType: evaluation.value === null
        ? 'UNPUBLISHED'
        : definition.unit === 'count'
          ? 'INTEGER'
          : definition.unit === 'ratio'
            ? 'RATIO'
            : 'MONEY',
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.snapshots.set(snapshot.id, snapshot);
    this.monitoring.readinessDistribution[snapshot.readiness] += 1;
    const change = changeSinceLastVisitSchema.parse({
      auditRef: `audit://analytics/${snapshot.id}`,
      businessImpact: `${definition.name} ma stan ${snapshot.readiness}.`,
      deepLink: `/metrics/${snapshot.metricCode}/snapshots/${snapshot.id}`,
      id: asAnalyticsChangeId(`change_${normalizeHash(snapshot.id)}`),
      occurredAt: this.now(),
      read: false,
      sourceObjectId: snapshot.id,
      tenantId: context.tenant.tenantId,
      title: `${definition.name}: opublikowano snapshot`,
      type: snapshot.publishedAt ? 'snapshot_published' : 'readiness_changed',
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.changes.set(change.id, change);

    return snapshot;
  }

  private evaluateMetric(
    metricCode: AnalyticsMetricCode,
    definition: MetricDefinition,
    input: MetricInput,
  ): {
    evidenceReferences: readonly string[];
    limitations: readonly string[];
    missingData: readonly MetricSnapshot['missingData'][number][];
    readiness: AnalyticsReadinessStatus;
    readinessReasons: readonly ReadinessReason[];
    value: string | null;
  } {
    if (definition.lifecycleStatus === 'GATED' || definition.lifecycleStatus === 'BLOCKED') {
      return {
        evidenceReferences: ['evidence://wave-4/gated-definition'],
        limitations: definition.limitations,
        missingData: [{
          confirmedZero: false,
          fields: definition.inputDatasets,
          reason: definition.blockedReason ?? 'Definicja nie jest aktywna.',
        }],
        readiness: definition.lifecycleStatus === 'BLOCKED' ? 'BLOCKED' : 'PARTIAL',
        readinessReasons: [
          readinessReason({
            businessImpact: 'Metryka nie może być użyta do decyzji finansowej.',
            missing: definition.inputDatasets,
            nextAction: definition.blockedReason ?? 'Ukończ bramę danych.',
            reliableScope: 'Pozostałe niezależne KPI pozostają dostępne.',
            scope: definition.name,
            summary: 'Definicja gated lub blocked.',
          }),
        ],
        value: null,
      };
    }

    const datasetReadiness = mapDatasetReadiness(input.dataset.readinessStatus);
    const baseEvidence = [
      `dataset://${input.dataset.id}`,
      'docs/evidence/wave-4/pipeline.md',
    ];

    if (datasetReadiness === 'EMPTY') {
      return {
        evidenceReferences: baseEvidence,
        limitations: ['Brak danych nie jest zerem.'],
        missingData: [{
          confirmedZero: false,
          fields: ['orders'],
          reason: 'Nie pobrano użytecznych canonical orders.',
        }],
        readiness: 'EMPTY',
        readinessReasons: [
          readinessReason({
            businessImpact: 'Nie można pokazać wyniku KPI.',
            missing: ['orders'],
            nextAction: 'Dokończ synchronizację źródła.',
            reliableScope: 'Brak wiarygodnego zakresu dla tego KPI.',
            scope: metricCode,
            summary: 'Brak danych wejściowych.',
          }),
        ],
        value: null,
      };
    }

    if (datasetReadiness === 'INVALID' || input.canonicalOrders.length === 0) {
      return {
        evidenceReferences: baseEvidence,
        limitations: ['Nieprawidłowy dataset blokuje publikację KPI.'],
        missingData: [{
          confirmedZero: false,
          fields: ['canonicalOrders'],
          reason: 'Canonical records są nieprawidłowe lub puste.',
        }],
        readiness: datasetReadiness === 'INVALID' ? 'INVALID' : 'EMPTY',
        readinessReasons: [
          readinessReason({
            businessImpact: 'KPI nie jest wiarygodny.',
            missing: ['canonicalOrders'],
            nextAction: 'Napraw problem danych i uruchom reprocessing.',
            reliableScope: 'Niezależne KPI bez tego datasetu pozostają bez zmian.',
            scope: metricCode,
            summary: 'Dataset nie spełnia bramy KPI.',
          }),
        ],
        value: null,
      };
    }

    const qualifying = input.canonicalOrders.filter(shouldQualify);
    const readiness = datasetReadiness === 'STALE' || datasetReadiness === 'PARTIAL'
      ? datasetReadiness
      : 'READY';
    const reasons = [
      readinessReason({
        businessImpact: readiness === 'READY'
          ? 'KPI może być użyty do przeglądu i eksportu.'
          : 'KPI może być użyty z ograniczeniem zakresu.',
        missing: readiness === 'PARTIAL' ? input.readiness?.limitations.map((item) => item.code) ?? ['partial'] : [],
        nextAction: readiness === 'READY' ? 'Monitoruj freshness.' : 'Usuń ograniczenie danych.',
        reliableScope: readiness === 'READY' ? 'Cały okres lokalny.' : 'Zakres opisany w limitations.',
        scope: metricCode,
        summary: `Readiness KPI: ${readiness}.`,
      }),
    ];

    if (metricCode === 'order_count') {
      return {
        evidenceReferences: baseEvidence,
        limitations: input.readiness?.limitations.map((item) => item.message) ?? [],
        missingData: [],
        readiness,
        readinessReasons: reasons,
        value: String(qualifying.length),
      };
    }

    if (metricCode === 'gross_revenue') {
      const gross = sumMinor(qualifying.map((order) => order.amounts.gross));

      return {
        evidenceReferences: baseEvidence,
        limitations: input.readiness?.limitations.map((item) => item.message) ?? [],
        missingData: gross.missingCount > 0
          ? [{
              confirmedZero: false,
              fields: ['amounts.gross'],
              reason: 'Część rekordów nie ma gross; nie zastąpiono braku zerem.',
            }]
          : [],
        readiness: gross.value === null ? 'INVALID' : readiness,
        readinessReasons: reasons,
        value: gross.value === null ? null : formatMinor(gross.value),
      };
    }

    if (metricCode === 'refund_value') {
      const refund = sumMinor(qualifying.map((order) => order.amounts.refund));

      return {
        evidenceReferences: baseEvidence,
        limitations: [
          ...input.readiness?.limitations.map((item) => item.message) ?? [],
          ...(refund.missingCount > 0 ? ['Refund missing pozostaje ograniczeniem, nie zerem.'] : []),
        ],
        missingData: refund.missingCount > 0
          ? [{
              confirmedZero: false,
              fields: ['amounts.refund'],
              reason: 'Brak refund field w części rekordów.',
            }]
          : [],
        readiness: refund.value === null ? 'PARTIAL' : readiness,
        readinessReasons: reasons,
        value: refund.value === null ? '0.00' : formatMinor(refund.value),
      };
    }

    if (metricCode === 'net_revenue') {
      const gross = sumMinor(qualifying.map((order) => order.amounts.gross));
      const refund = sumMinor(qualifying.map((order) => order.amounts.refund));

      if (gross.value === null) {
        return {
          evidenceReferences: baseEvidence,
          limitations: ['Net Revenue wymaga Gross Revenue.'],
          missingData: [{
            confirmedZero: false,
            fields: ['amounts.gross'],
            reason: 'Gross Revenue nieopublikowany.',
          }],
          readiness: 'INVALID',
          readinessReasons: reasons,
          value: null,
        };
      }

      return {
        evidenceReferences: baseEvidence,
        limitations: refund.missingCount > 0
          ? ['Net Revenue częściowy: brak refund field nie jest zerem.']
          : [],
        missingData: refund.missingCount > 0
          ? [{
              confirmedZero: false,
              fields: ['amounts.refund'],
              reason: 'Brak refund field w części rekordów.',
            }]
          : [],
        readiness: refund.missingCount > 0 ? 'PARTIAL' : readiness,
        readinessReasons: reasons,
        value: formatMinor(gross.value - (refund.value ?? 0n)),
      };
    }

    return {
      evidenceReferences: baseEvidence,
      limitations: ['Metryka nieaktywna w local/CI Fali 4.'],
      missingData: [{
        confirmedZero: false,
        fields: definition.inputDatasets,
        reason: 'Brak aktywnej definicji runtime.',
      }],
      readiness: 'BLOCKED',
      readinessReasons: reasons,
      value: null,
    };
  }

  private activeKpiProjections(context: ApplicationSessionContext): KpiProjection[] {
    const order: readonly AnalyticsMetricCode[] = [
      'order_count',
      'gross_revenue',
      'refund_value',
      'net_revenue',
    ];
    const snapshots = this.getMetricSnapshots(context);

    return order
      .map((metricCode) =>
        snapshots.find((snapshot) => snapshot.metricCode === metricCode),
      )
      .filter((snapshot): snapshot is MetricSnapshot => snapshot !== undefined)
      .map((snapshot) => this.kpiProjectionForSnapshot(snapshot));
  }

  private kpiProjectionForSnapshot(snapshot: MetricSnapshot): KpiProjection {
    const previous = previousTrend(snapshot);
    const drivers: KpiProjection['drivers'] = [
      {
        direction: snapshot.readiness === 'READY' ? 'positive' : 'negative',
        evidenceReferences: snapshot.evidenceReferences,
        impact: snapshot.value,
        label: snapshot.readiness === 'READY' ? 'Gotowość danych' : 'Ograniczenie danych',
        reason: snapshot.readinessReasons[0]?.summary ?? 'Brak szczegółu.',
      },
      {
        direction: 'neutral',
        evidenceReferences: [`dataset://${snapshot.datasetIds[0]}`],
        impact: null,
        label: 'Source authority',
        reason: snapshot.sourceAuthorityVersion,
      },
    ];

    return {
      comparison: {
        label: 'Bieżący vs poprzedni okres',
        previousSnapshotId: snapshot.previousSnapshotId,
        valueDelta: snapshot.value === null || previous.value === null
          ? null
          : snapshot.unit === 'count'
            ? String(Number(snapshot.value) - Number(previous.value))
            : formatMinor(
                (parseDecimalToMinor(snapshot.value) ?? 0n) -
                (parseDecimalToMinor(previous.value) ?? 0n),
              ),
      },
      drivers,
      snapshot,
      trend: [
        {
          label: previous.label,
          period: {
            from: previousPeriodStart,
            to: previousPeriodEnd,
          },
          readiness: previous.value === null ? 'EMPTY' : snapshot.readiness,
          value: previous.value,
        },
        {
          label: 'Bieżący okres',
          period: {
            from: snapshot.periodStart,
            to: snapshot.periodEnd,
          },
          readiness: snapshot.readiness,
          value: snapshot.value,
        },
      ],
    };
  }

  private createModules(context: ApplicationSessionContext): ModuleProjection[] {
    const kpis = this.activeKpiProjections(context);
    const snapshots = kpis.map((item) => item.snapshot);
    const ordersTable = this.ordersTable(context);
    const baseMeta = this.meta(context, snapshots);

    return [
      moduleProjectionSchema.parse({
        charts: [this.chart('trend', 'Trend KPI', 'Order Count i Gross Revenue w okresie.', kpis[0]?.trend ?? [])],
        description: 'Priorytety, KPI, readiness, alerty i zadania dla aktywnego workspace.',
        kpis,
        meta: baseMeta,
        moduleId: 'command_center',
        status: 'IMPLEMENTED',
        tables: [],
        title: 'Command Center',
      }),
      moduleProjectionSchema.parse({
        charts: [this.chart('bars', 'Statusy zamówień', 'Tabela i grouped bars mają wspólny zakres.', kpis[0]?.trend ?? [])],
        description: 'Canonical orders, statusy, refundy, drill-down i kontrolowany eksport.',
        kpis,
        meta: baseMeta,
        moduleId: 'orders',
        status: moduleStatusForReadiness(baseMeta.readiness),
        tables: [ordersTable],
        title: 'Zamówienia',
      }),
      this.gatedModule(context, 'products', 'Produkty', 'Brak canonical product dataset i zatwierdzonych KPI produktowych.'),
      this.gatedModule(context, 'customers', 'Klienci', 'Brak zatwierdzonej definicji LTV/retencji; pokazujemy tylko ograniczenie.'),
      this.gatedModule(context, 'traffic', 'Ruch', 'GA4 jest w katalogu MVP, ale adapter nie przeszedł bram local/CI.'),
      this.gatedModule(context, 'paid_campaigns', 'Kampanie płatne', 'Google Ads i Meta Ads są planowane, bez danych runtime.'),
      moduleProjectionSchema.parse({
        charts: [this.chart('trend', 'D2C first useful data', 'WooCommerce orders jako kwalifikujące źródło D2C.', kpis[0]?.trend ?? [])],
        description: 'D2C bazuje na WooCommerce orders i gotowych KPI sprzedażowych.',
        kpis,
        meta: baseMeta,
        moduleId: 'd2c',
        status: moduleStatusForReadiness(baseMeta.readiness),
        tables: [ordersTable],
        title: 'Sprzedaż D2C',
      }),
      this.gatedModule(context, 'marketplace', 'Marketplace', 'BaseLinker/Allegro nie mają aktywnego adaptera i fees datasetu.'),
      this.gatedModule(context, 'marketing_attribution', 'Marketing i atrybucja', 'Brak aktywnego modelu atrybucji i danych paid.'),
      this.gatedModule(context, 'profitability', 'Koszty i rentowność', 'Contribution Margin pozostaje blocked bez kosztu produktu.'),
      moduleProjectionSchema.parse({
        charts: [this.chart('matrix', 'Macierz jakości', 'Readiness i quality assessment z Fali 3.', [])],
        description: 'Data Trust używa quality, readiness, lineage i reconciliation.',
        kpis,
        meta: baseMeta,
        moduleId: 'data_health',
        status: moduleStatusForReadiness(baseMeta.readiness),
        tables: [],
        title: 'Zaufanie do danych',
      }),
      moduleProjectionSchema.parse({
        charts: [],
        description: 'Zadania wynikające z readiness, mismatch i definicji.',
        kpis: [],
        meta: baseMeta,
        moduleId: 'tasks_for_me',
        status: 'IMPLEMENTED',
        tables: [],
        title: 'Zadania dla mnie',
      }),
      moduleProjectionSchema.parse({
        charts: [],
        description: 'Alerty produktowe analityki z read/unread i acknowledgement.',
        kpis: [],
        meta: baseMeta,
        moduleId: 'alerts',
        status: 'IMPLEMENTED',
        tables: [],
        title: 'Alerty',
      }),
      moduleProjectionSchema.parse({
        charts: [],
        description: 'Zmiany od ostatniej wizyty, w tym publikacje snapshotów.',
        kpis: [],
        meta: baseMeta,
        moduleId: 'changes_since_last_visit',
        status: 'IMPLEMENTED',
        tables: [],
        title: 'Zmiany od ostatniej wizyty',
      }),
    ];
  }

  private ordersTable(context: ApplicationSessionContext): ModuleProjection['tables'][number] {
    const snapshot = this.requireDataQualitySnapshot();
    const rows = snapshot.canonicalOrders
      .filter((order) => this.matchesContext(context, order))
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
      .map((order) => ({
        cells: {
          currency: order.currency,
          gross: order.amounts.gross,
          id: order.id,
          refund: order.amounts.refund,
          status: order.status,
          time: order.occurredAt,
        },
        id: order.id,
      }));

    return {
      columns: [
        { key: 'id', label: 'Canonical order' },
        { key: 'status', label: 'Status' },
        { key: 'gross', label: 'Gross' },
        { key: 'refund', label: 'Refund' },
        { key: 'currency', label: 'Waluta' },
        { key: 'time', label: 'Czas' },
      ],
      rows,
    };
  }

  private gatedModule(
    context: ApplicationSessionContext,
    moduleId: ModuleProjection['moduleId'],
    title: string,
    reason: string,
  ): ModuleProjection {
    return moduleProjectionSchema.parse({
      charts: [],
      description: reason,
      kpis: [],
      meta: {
        ...this.meta(context, []),
        limitations: [reason],
        readiness: 'BLOCKED',
      },
      moduleId,
      status: 'GATED',
      tables: [],
      title,
    });
  }

  private chart(
    kind: ModuleProjection['charts'][number]['kind'],
    title: string,
    description: string,
    trend: KpiProjection['trend'],
  ): ModuleProjection['charts'][number] {
    return {
      description,
      evidenceReferences: ['docs/evidence/wave-4/pipeline.md'],
      kind,
      title,
      trend,
    };
  }

  private generateAlertsAndTasks(
    context: ApplicationSessionContext,
    snapshots: readonly MetricSnapshot[],
  ): void {
    for (const snapshot of snapshots) {
      if (
        snapshot.readiness === 'READY' ||
        snapshot.readiness === 'EMPTY' ||
        this.alerts.has(`alert_${snapshot.id}`)
      ) {
        continue;
      }

      const alert = analyticsAlertSchema.parse({
        acknowledgedAt: null,
        auditRef: `audit://analytics/${snapshot.id}`,
        businessImpact: snapshot.readinessReasons[0]?.businessImpact ?? 'KPI wymaga uwagi.',
        deepLink: `/metrics/${snapshot.metricCode}/trust/${snapshot.id}`,
        id: asAnalyticsAlertId(`alert_${normalizeHash(snapshot.id)}`),
        ownerId: snapshot.readinessReasons[0]?.ownerId ?? 'PapaData Analytics',
        read: false,
        resolutionState: 'OPEN',
        severity: snapshot.readiness === 'INVALID' || snapshot.readiness === 'BLOCKED'
          ? 'critical'
          : 'warning',
        sourceObjectId: snapshot.id,
        sourceObjectType: 'metric_snapshot',
        tenantId: context.tenant.tenantId,
        title: `${snapshot.metricCode}: ${snapshot.readiness}`,
        type: snapshot.readiness === 'STALE'
          ? 'stale_data'
          : snapshot.readiness === 'INVALID'
            ? 'invalid_kpi'
            : snapshot.readiness === 'RECALCULATION_REQUIRED'
              ? 'reprocessing_required'
              : 'missing_scope',
        workspaceId: context.activeWorkspace.workspaceId,
      });
      const task = analyticsTaskSchema.parse({
        auditRef: alert.auditRef,
        businessImpact: alert.businessImpact,
        deepLink: alert.deepLink,
        dueDate: '2026-07-21T00:00:00.000Z',
        id: asAnalyticsTaskId(`task_${normalizeHash(snapshot.id)}`),
        ownerId: alert.ownerId,
        read: false,
        resolutionState: 'OPEN',
        severity: alert.severity,
        sourceObjectId: snapshot.id,
        sourceObjectType: 'metric_snapshot',
        tenantId: context.tenant.tenantId,
        title: `Sprawdź ${snapshot.metricCode}`,
        workspaceId: context.activeWorkspace.workspaceId,
      });
      this.alerts.set(alert.id, alert);
      this.tasks.set(task.id, task);
    }
    this.monitoring.alertCount = this.alerts.size;
  }

  private ensureDefaultTask(context: ApplicationSessionContext) {
    const task = analyticsTaskSchema.parse({
      auditRef: 'audit://analytics/default-next-action',
      businessImpact: 'Pierwszy gotowy KPI jest dostępny do przeglądu.',
      deepLink: '/metrics/order_count',
      dueDate: '2026-07-21T00:00:00.000Z',
      id: asAnalyticsTaskId('task_review_first_kpi'),
      ownerId: context.user.userId,
      read: false,
      resolutionState: 'OPEN',
      severity: 'info',
      sourceObjectId: 'order_count',
      sourceObjectType: 'metric_snapshot',
      tenantId: context.tenant.tenantId,
      title: 'Przejrzyj pierwszy wiarygodny KPI',
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.tasks.set(task.id, task);

    return task;
  }

  private latestSnapshot(context: ApplicationSessionContext, metricCode: AnalyticsMetricCode): MetricSnapshot {
    const snapshot = this.latestSnapshotOrNull(context, metricCode);

    if (!snapshot) {
      throw new Error('SNAPSHOT_NOT_FOUND');
    }

    return snapshot;
  }

  private latestSnapshotOrNull(
    context: ApplicationSessionContext,
    metricCode: AnalyticsMetricCode,
  ): MetricSnapshot | null {
    return [...this.snapshots.values()]
      .filter((snapshot) => this.matchesContext(context, snapshot) && snapshot.metricCode === metricCode)
      .sort((left, right) => right.calculatedAt.localeCompare(left.calculatedAt))
      .at(0) ?? null;
  }

  private requireDefinition(metricCode: AnalyticsMetricCode): MetricDefinition {
    const definition = this.definitions.get(metricCode);

    if (!definition) {
      throw new Error('METRIC_DEFINITION_NOT_FOUND');
    }

    return definition;
  }

  private requireDataQualitySnapshot(): DataQualitySnapshot {
    if (!this.dataQualitySnapshot) {
      throw new Error('DATA_QUALITY_SNAPSHOT_REQUIRED');
    }

    return this.dataQualitySnapshot;
  }

  private matchesContext(
    context: ApplicationSessionContext,
    value: {
      tenantId: ApplicationSessionContext['tenant']['tenantId'];
      workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
    },
  ): boolean {
    return (
      value.tenantId === context.tenant.tenantId &&
      value.workspaceId === context.activeWorkspace.workspaceId
    );
  }

  private assertAccess(context: ApplicationSessionContext, capability: Capability): void {
    if (!hasCapability(context, capability)) {
      this.audit(context, 'analytics.permission_denied', `capability:${capability}`, 'denied');
      throw new Error('CAPABILITY_REQUIRED');
    }

    if (!hasEntitlement(context, capability)) {
      this.audit(context, 'analytics.permission_denied', `entitlement:${capability}`, 'denied');
      throw new Error('ENTITLEMENT_REQUIRED');
    }
  }

  private assertRequestToken(
    context: ApplicationSessionContext,
    token: QueryOptions['requestToken'],
  ): void {
    if (!token) {
      return;
    }

    if (token.tenantId !== context.tenant.tenantId) {
      throw new Error('STALE_WORKSPACE_RESPONSE');
    }

    if (token.workspaceId !== context.activeWorkspace.workspaceId) {
      throw new Error('STALE_WORKSPACE_RESPONSE');
    }
  }

  private assertQueryCost(size: number): void {
    if (size > queryCostLimit) {
      throw new Error('QUERY_COST_LIMIT');
    }
  }

  private crossWorkspaceDeny(context: ApplicationSessionContext): void {
    this.monitoring.crossWorkspaceDenyCount += 1;
    this.audit(context, 'analytics.cross_workspace_denied', 'foreign_scope', 'denied');
  }

  private cacheKey(context: ApplicationSessionContext, scope: string): string {
    const definitionVersion = this.definitions.get('order_count')?.version
      ?? 'metric.order-count.v1';

    return createAnalyticsCacheKey({
      currency: context.currency,
      dataScope: scope,
      metricDefinitionVersion: definitionVersion,
      period: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-19T00:00:00.000Z',
      },
      policyVersion: analyticsCachePolicyVersion,
      projectionVersion: analyticsProjectionVersion,
      tenantId: context.tenant.tenantId,
      timezone: context.timezone,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private meta(
    context: ApplicationSessionContext,
    snapshots: readonly MetricSnapshot[],
  ): ProjectionMeta {
    const readiness = snapshots.some((snapshot) => snapshot.readiness === 'INVALID')
      ? analyticsReadinessStatusSchema.parse('INVALID')
      : snapshots.some((snapshot) => snapshot.readiness === 'PARTIAL')
        ? analyticsReadinessStatusSchema.parse('PARTIAL')
        : snapshots.length > 0
          ? analyticsReadinessStatusSchema.parse('READY')
          : analyticsReadinessStatusSchema.parse('BLOCKED');

    return {
      allowedActions: ['open_trust_drawer', 'drill_down', 'export'],
      correlationId: asCorrelationId('cor_analytics_projection'),
      currency: context.currency,
      evidenceReferences: snapshots.flatMap((snapshot) => snapshot.evidenceReferences),
      freshness: {
        lastUpdatedAt: snapshots[0]?.calculatedAt ?? null,
        status: readiness === 'STALE' ? 'stale' : snapshots.length > 0 ? 'fresh' : 'unknown',
      },
      generatedAt: this.now(),
      limitations: unique(snapshots.flatMap((snapshot) => snapshot.limitations)),
      metricDefinitionVersions: unique(snapshots.map((snapshot) => snapshot.metricDefinitionVersion)),
      period: {
        from: snapshots[0]?.periodStart ?? '2026-07-01T00:00:00.000Z',
        to: snapshots[0]?.periodEnd ?? '2026-07-19T00:00:00.000Z',
      },
      projectionVersion: analyticsProjectionVersion,
      readiness,
      snapshotIds: snapshots.map((snapshot) => snapshot.id),
      tenantId: context.tenant.tenantId,
      timezone: context.timezone,
      workspaceId: context.activeWorkspace.workspaceId,
    };
  }

  private audit(
    context: ApplicationSessionContext,
    eventType: string,
    reason: string,
    result: AnalyticsAuditEvent['result'] = 'success',
  ): void {
    this.auditEvents.push({
      eventType,
      occurredAt: this.now(),
      reason,
      result,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }
}

export function createAnalyticsReadAccessContext(
  context: ApplicationSessionContext,
): ApplicationSessionContext {
  const capabilities = unique([
    ...context.capabilities,
    ...Object.values(analyticsCapabilities),
    dataQualityCapabilities.read,
  ]);
  const entitlements = [
    ...context.entitlements,
    ...capabilities.map((capability) => ({
      capability,
      enabled: true,
      limitations: [],
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    })),
  ];

  return {
    ...context,
    capabilities,
    entitlements,
    featureFlags: {
      ...context.featureFlags,
      analyticsWave4: true,
      commandCenter: true,
      customerWorkspace: true,
    },
  };
}
