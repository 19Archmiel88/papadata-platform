import {
  asCorrelationId,
  asOperationId,
  type ApplicationSessionContext,
  type Capability,
} from '../../domain-contracts';
import {
  createDeterministicHash,
  type IntegrationConnection,
  type IntegrationProvider,
  type SourceBatch,
  type SourceRecord,
  type SyncJob,
} from '../integrations/integrationContracts';
import {
  asCanonicalOrderId,
  asDataQualityIssueId,
  asDatasetId,
  asRawNormalizedRecordId,
  asReprocessJobId,
  analyticalResponseMetaSchema,
  canonicalOrderSchema,
  dataImpactReportIdSchema,
  dataImpactReportSchema,
  dataInventoryEntrySchema,
  dataQualityApiRoutes,
  dataQualityAuditEventSchema,
  dataQualityCapabilities,
  dataQualityContractVersion,
  dataIssueSchema,
  datasetSchema,
  deletionLedgerEntrySchema,
  exactMatchResultSchema,
  fuzzyMatchingPolicySchema,
  lineageLinkSchema,
  metricCodeSchema,
  metricDefinitions,
  monitoringSnapshotSchema,
  operationAcceptedSchema,
  overlapCandidateSchema,
  qualityAssessmentSchema,
  rawNormalizedRecordSchema,
  readinessAssessmentSchema,
  reconciliationReportSchema,
  reprocessJobSchema,
  sourceAuthorityRuleSchema,
  sourceLayerEvidenceSchema,
  wave3RuleVersions,
  type AnalyticalResponseMeta,
  type CanonicalOrder,
  type DataImpactReport,
  type DataInventoryEntry,
  type DataIssue,
  type DataQualityAuditEvent,
  type DataQualityAuditEventType,
  type Dataset,
  type DatasetId,
  type DatasetLimitation,
  type DeletionLedgerEntry,
  type ExactMatchResult,
  type FuzzyMatchingPolicy,
  type LineageLink,
  type ManualDataDecision,
  type MonitoringSnapshot,
  type NormalizationError,
  type OperationAccepted,
  type OverlapCandidate,
  type QualityAssessment,
  type QualityDimensionResult,
  type RawNormalizedOrderData,
  type RawNormalizedRecord,
  type ReadinessAssessment,
  type ReconciliationReport,
  type ReprocessJob,
  type SourceAuthorityRule,
  manualDataDecisionSchema,
} from './dataQualityContracts';

type SourcePayload = Record<string, string | number | boolean>;

type SourceSnapshot = {
  batches: readonly SourceBatch[];
  connections: readonly IntegrationConnection[];
  jobs: readonly SyncJob[];
  providers: readonly IntegrationProvider[];
  records: readonly SourceRecord[];
};

type PipelineInput = SourceSnapshot & {
  currency: string | null;
  datasetType?: 'orders';
  period: {
    from: string;
    to: string;
  };
  payloadResolver: (record: SourceRecord) => SourcePayload;
  timezone: string;
};

type DataQualityLogEntry = {
  correlationId: ReturnType<typeof asCorrelationId>;
  datasetId: DatasetId | null;
  event: string;
  jobId: string | null;
  reasonCode: string | null;
  ruleVersion: string | null;
  tenantId: ApplicationSessionContext['tenant']['tenantId'];
  workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
};

type DataQualityAlert = {
  alertType: string;
  correlationId: ReturnType<typeof asCorrelationId>;
  severity: 'info' | 'warning' | 'critical';
};

type PipelineResult = {
  canonicalOrders: readonly CanonicalOrder[];
  dataset: Dataset;
  exactMatches: readonly ExactMatchResult[];
  impactReports: readonly DataImpactReport[];
  issues: readonly DataIssue[];
  lineage: readonly LineageLink[];
  normalizedRecords: readonly RawNormalizedRecord[];
  overlaps: readonly OverlapCandidate[];
  qualityAssessment: QualityAssessment;
  readiness: ReadinessAssessment;
  reconciliation: ReconciliationReport;
};

const fixtureNow = '2026-07-19T00:00:00.000Z';
const ownerId = 'artur_wisniewski';
const supportedCurrencies = new Set(['PLN', 'EUR', 'USD', 'GBP']);

function hasCapability(context: ApplicationSessionContext, capability: string): boolean {
  return context.capabilities.some((item) => item === capability);
}

function hasEnabledEntitlement(
  context: ApplicationSessionContext,
  capability: string,
): boolean {
  return context.entitlements.some(
    (entitlement) =>
      entitlement.enabled &&
      entitlement.capability === capability &&
      entitlement.tenantId === context.tenant.tenantId &&
      (!entitlement.workspaceId ||
        entitlement.workspaceId === context.activeWorkspace.workspaceId),
  );
}

function normalizeHash(value: unknown): string {
  return createDeterministicHash(value).replace(':', '_');
}

function decimalFromUnknown(
  payload: SourcePayload,
  field: string,
  required: boolean,
): {
  errors: {
    code: 'INVALID_NUMBER' | 'MISSING_REQUIRED_FIELD';
    field: string;
    message: string;
  }[];
  value: string | null;
  zeroEvidence: string[];
} {
  const raw = payload[field];

  if (raw === undefined) {
    return {
      errors: required
        ? [
            {
              code: 'MISSING_REQUIRED_FIELD',
              field,
              message: `Brak wymaganego pola ${field}.`,
            },
          ]
        : [],
      value: null,
      zeroEvidence: [],
    };
  }

  if (typeof raw !== 'number' && typeof raw !== 'string') {
    return {
      errors: [
        {
          code: 'INVALID_NUMBER',
          field,
          message: `Pole ${field} nie jest liczbą.`,
        },
      ],
      value: null,
      zeroEvidence: [],
    };
  }

  const numeric = Number(raw);

  if (!Number.isFinite(numeric)) {
    return {
      errors: [
        {
          code: 'INVALID_NUMBER',
          field,
          message: `Pole ${field} nie zawiera prawidłowej liczby.`,
        },
      ],
      value: null,
      zeroEvidence: [],
    };
  }

  return {
    errors: [],
    value: String(raw),
    zeroEvidence: numeric === 0 ? [field] : [],
  };
}

function stringFromUnknown(
  payload: SourcePayload,
  field: string,
  required: boolean,
): {
  errors: {
    code: 'INVALID_TYPE' | 'MISSING_REQUIRED_FIELD';
    field: string;
    message: string;
  }[];
  value: string | null;
} {
  const raw = payload[field];

  if (raw === undefined) {
    return {
      errors: required
        ? [
            {
              code: 'MISSING_REQUIRED_FIELD',
              field,
              message: `Brak wymaganego pola ${field}.`,
            },
          ]
        : [],
      value: null,
    };
  }

  if (typeof raw !== 'string' && typeof raw !== 'number') {
    return {
      errors: [
        {
          code: 'INVALID_TYPE',
          field,
          message: `Pole ${field} nie jest tekstem ani stabilnym identyfikatorem.`,
        },
      ],
      value: null,
    };
  }

  const value = String(raw).trim();

  return {
    errors:
      required && value.length === 0
        ? [
            {
              code: 'MISSING_REQUIRED_FIELD',
              field,
              message: `Pole ${field} jest puste.`,
            },
          ]
        : [],
    value: value.length > 0 ? value : null,
  };
}

function statusMapping(status: string | null): RawNormalizedOrderData['statusCanonical'] {
  if (status === 'paid' || status === 'completed') {
    return 'confirmed';
  }

  if (status === 'processing') {
    return 'processing';
  }

  if (status === 'fulfilled') {
    return 'fulfilled';
  }

  if (status === 'cancelled') {
    return 'cancelled';
  }

  if (status === 'refunded') {
    return 'refunded';
  }

  return 'unknown';
}

function sumDecimal(values: readonly (string | null)[]): string | null {
  const numbers = values.filter((value): value is string => value !== null);

  if (numbers.length === 0) {
    return null;
  }

  return String(numbers.reduce((sum, value) => sum + Number(value), 0));
}

function deltaDecimal(before: string | null, after: string | null): string | null {
  if (before === null || after === null) {
    return null;
  }

  return String(Number(after) - Number(before));
}

function qualityDimension(input: {
  evidenceRefs?: readonly string[];
  impact: string;
  nextAction: string;
  range: string;
  reasonCodes?: readonly string[];
  status: 'PASS' | 'WARN' | 'FAIL';
  threshold: string;
  value: string;
}): QualityDimensionResult {
  return {
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    impact: input.impact,
    nextAction: input.nextAction,
    range: input.range,
    reasonCodes: [...(input.reasonCodes ?? [])],
    status: input.status,
    threshold: input.threshold,
    value: input.value,
  };
}

export class LocalDataQualityRuntime {
  private readonly alerts: DataQualityAlert[] = [];
  private readonly auditEvents: DataQualityAuditEvent[] = [];
  private readonly canonicalOrders = new Map<string, CanonicalOrder>();
  private readonly datasets = new Map<DatasetId, Dataset>();
  private readonly deletionLedger = new Map<string, DeletionLedgerEntry>();
  private readonly exactMatches = new Map<string, ExactMatchResult>();
  private readonly idempotency = new Map<string, string>();
  private readonly impactReports = new Map<string, DataImpactReport>();
  private readonly inventory: DataInventoryEntry[] = [];
  private readonly issueVersions = new Map<string, number>();
  private readonly issues = new Map<string, DataIssue>();
  private readonly lineage = new Map<string, LineageLink>();
  private readonly logs: DataQualityLogEntry[] = [];
  private readonly manualDecisions = new Map<string, ManualDataDecision>();
  private readonly metrics: Record<string, number> = {};
  private readonly normalizedRecords = new Map<string, RawNormalizedRecord>();
  private readonly operations = new Map<string, OperationAccepted>();
  private readonly overlaps = new Map<string, OverlapCandidate>();
  private readonly qualityAssessments = new Map<string, QualityAssessment>();
  private readonly readinessAssessments = new Map<string, ReadinessAssessment>();
  private readonly reconciliations = new Map<string, ReconciliationReport>();
  private readonly reprocessJobs = new Map<string, ReprocessJob>();
  private readonly sourceAuthorities = new Map<string, SourceAuthorityRule>();
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => fixtureNow);
    this.inventory.push(...this.createInventory());
  }

  processSourceSnapshot(
    context: ApplicationSessionContext,
    input: PipelineInput,
  ): PipelineResult {
    this.assertCapability(context, dataQualityCapabilities.read);
    const scopedRecords = input.records.filter(
      (record) =>
        record.tenantId === context.tenant.tenantId &&
        record.workspaceId === context.activeWorkspace.workspaceId &&
        record.stream === 'orders',
    );
    const scopedBatches = input.batches.filter(
      (batch) =>
        batch.tenantId === context.tenant.tenantId &&
        batch.workspaceId === context.activeWorkspace.workspaceId,
    );
    const period = input.period;
    const datasetId = asDatasetId(
      `dataset_orders_${context.tenant.tenantId}_${context.activeWorkspace.workspaceId}_${normalizeHash(
        period,
      )}`,
    );

    this.ensureDefaultSourceAuthority(context);
    this.audit(context, {
      action: 'NORMALIZATION_STARTED',
      datasetId,
      reason: 'wave_3_reference_pipeline',
      targetId: datasetId,
    });

    for (const batch of scopedBatches) {
      this.audit(context, {
        action: batch.status === 'FAILED' ? 'SOURCE_BATCH_FAILED' : 'SOURCE_BATCH_COMPLETED',
        datasetId,
        reason: batch.status.toLowerCase(),
        targetId: batch.id,
      });
    }

    const normalized = scopedRecords.map((record, index) =>
      this.normalizeOrderRecord(context, record, input.payloadResolver(record), index),
    );
    const validNormalized = normalized.filter(
      (record) => record.validation.status !== 'INVALID',
    );
    const sourceAuthority = this.activeSourceAuthority(context, 'CanonicalOrder', 'orders');
    const issueDrafts: DataIssue[] = [];

    for (const record of normalized) {
      this.normalizedRecords.set(record.id, record);
      if (record.validation.status === 'VALID') {
        this.metric('normalization_success');
      } else {
        this.metric('normalization_failure');
      }

      for (const error of record.validation.errors) {
        this.metric(
          error.code === 'UNKNOWN_STATUS'
            ? 'unknown_status_count'
            : error.code === 'MISSING_REQUIRED_FIELD'
              ? 'missing_field_count'
              : error.code === 'SCHEMA_MISMATCH'
                ? 'schema_mismatch'
                : 'normalization_error_count',
        );
        issueDrafts.push(
          this.createIssueObject(context, datasetId, {
            issueClass: `normalization.${error.code}`,
            severity: error.code === 'UNKNOWN_STATUS' ? 'MEDIUM' : 'HIGH',
            impact: error.message,
            evidenceRefs: [error.evidenceRef],
            affectedMetricCodes: ['order_count', 'gross_revenue'],
          }),
        );
      }
    }

    const exactMatches = this.createExactMatches(context, validNormalized);
    const overlaps = this.detectOverlaps(context, exactMatches);
    const canonicalOrders =
      sourceAuthority === null
        ? []
        : this.canonicalizeOrders(context, validNormalized, exactMatches, sourceAuthority);
    const lineage = [...this.lineage.values()].filter(
      (link) => link.tenantId === context.tenant.tenantId && link.workspaceId === context.activeWorkspace.workspaceId,
    );

    if (!sourceAuthority) {
      issueDrafts.push(
        this.createIssueObject(context, datasetId, {
          affectedMetricCodes: ['order_count', 'gross_revenue'],
          evidenceRefs: ['evidence://source-authority/missing'],
          impact: 'Brak aktywnej source authority blokuje canonicalization.',
          issueClass: 'source_authority.missing',
          severity: 'CRITICAL',
        }),
      );
    }

    const qualityAssessment = this.assessQuality(context, {
      canonicalOrders,
      datasetId,
      normalized,
      overlaps,
      period,
      sourceAuthority,
    });
    const readiness = this.createReadiness(context, {
      canonicalOrders,
      currency: input.currency,
      datasetId,
      period,
      qualityAssessment,
      sourceRecords: scopedRecords,
      timezone: input.timezone,
    });
    const dataset = datasetSchema.parse({
      canonicalModelVersion: wave3RuleVersions.canonicalSchema,
      currency: input.currency,
      generatedAt: this.now(),
      id: datasetId,
      lastUpdatedAt: this.now(),
      limitations: readiness.limitations,
      period,
      readinessStatus: readiness.status,
      schemaVersion: wave3RuleVersions.sourceSchema,
      sourceCoverage: readiness.sourceCoverage,
      tenantId: context.tenant.tenantId,
      timezone: input.timezone,
      type: input.datasetType ?? 'orders',
      workspaceId: context.activeWorkspace.workspaceId,
    });

    this.datasets.set(dataset.id, dataset);
    this.qualityAssessments.set(qualityAssessment.id, qualityAssessment);
    this.readinessAssessments.set(readiness.id, readiness);

    for (const issue of issueDrafts) {
      this.issues.set(issue.id, issue);
      this.issueVersions.set(issue.id, 0);
      this.metric(`open_issues_by_severity.${issue.severity}`);
      this.audit(context, {
        action: issue.severity === 'CRITICAL' ? 'DATA_ISSUE_BLOCKED' : 'DATA_ISSUE_CREATED',
        datasetId,
        reason: issue.class,
        targetId: issue.id,
      });

      if (issue.severity === 'CRITICAL' && !issue.ownerId) {
        this.alert('critical_issue_without_owner', 'critical');
      }
    }

    const reconciliation = this.reconcile(context, {
      canonicalOrders,
      connectionId: scopedRecords[0]?.connectionId ?? input.connections[0]?.id,
      dataset,
      exactMatches,
      providerId: scopedRecords[0]?.providerId ?? input.providers[0]?.providerId,
      sourceRecords: scopedRecords,
    });

    this.metric('source_records_count', scopedRecords.length);
    this.metric('canonical_fact_count', canonicalOrders.length);
    this.metric('quality_assessment_count');
    this.metric(`readiness_distribution.${readiness.status}`);
    if (readiness.status === 'INVALID') {
      this.metric('invalid_dataset_count');
    }
    if (readiness.status === 'DELAYED') {
      this.metric('delayed_dataset_count');
    }
    this.audit(context, {
      action: 'NORMALIZATION_COMPLETED',
      datasetId,
      reason: 'normalized_records_created',
      targetId: datasetId,
    });
    this.audit(context, {
      action: 'CANONICALIZATION_COMPLETED',
      datasetId,
      reason: 'canonical_orders_created',
      targetId: datasetId,
    });
    this.audit(context, {
      action: 'QUALITY_ASSESSMENT_COMPLETED',
      datasetId,
      reason: qualityAssessment.result,
      targetId: qualityAssessment.id,
    });
    this.audit(context, {
      action: 'READINESS_CHANGED',
      datasetId,
      reason: readiness.status,
      targetId: readiness.id,
    });

    return {
      canonicalOrders,
      dataset,
      exactMatches,
      impactReports: this.getImpactReports(context, dataset.id).data,
      issues: this.listDataIssues(context).data,
      lineage,
      normalizedRecords: normalized,
      overlaps,
      qualityAssessment,
      readiness,
      reconciliation,
    };
  }

  getSnapshot(): {
    auditEvents: readonly DataQualityAuditEvent[];
    canonicalOrders: readonly CanonicalOrder[];
    datasets: readonly Dataset[];
    deletionLedger: readonly DeletionLedgerEntry[];
    exactMatches: readonly ExactMatchResult[];
    impactReports: readonly DataImpactReport[];
    inventory: readonly DataInventoryEntry[];
    issues: readonly DataIssue[];
    lineage: readonly LineageLink[];
    manualDecisions: readonly ManualDataDecision[];
    monitoring: MonitoringSnapshot;
    normalizedRecords: readonly RawNormalizedRecord[];
    overlaps: readonly OverlapCandidate[];
    qualityAssessments: readonly QualityAssessment[];
    readinessAssessments: readonly ReadinessAssessment[];
    reconciliations: readonly ReconciliationReport[];
    reprocessJobs: readonly ReprocessJob[];
    sourceAuthorities: readonly SourceAuthorityRule[];
  } {
    return {
      auditEvents: [...this.auditEvents],
      canonicalOrders: [...this.canonicalOrders.values()],
      datasets: [...this.datasets.values()],
      deletionLedger: [...this.deletionLedger.values()],
      exactMatches: [...this.exactMatches.values()],
      impactReports: [...this.impactReports.values()],
      inventory: [...this.inventory],
      issues: [...this.issues.values()],
      lineage: [...this.lineage.values()],
      manualDecisions: [...this.manualDecisions.values()],
      monitoring: this.getMonitoring(),
      normalizedRecords: [...this.normalizedRecords.values()],
      overlaps: [...this.overlaps.values()],
      qualityAssessments: [...this.qualityAssessments.values()],
      readinessAssessments: [...this.readinessAssessments.values()],
      reconciliations: [...this.reconciliations.values()],
      reprocessJobs: [...this.reprocessJobs.values()],
      sourceAuthorities: [...this.sourceAuthorities.values()],
    };
  }

  listDatasets(context: ApplicationSessionContext): {
    data: readonly Dataset[];
    meta: AnalyticalResponseMeta | null;
  } {
    this.assertCapability(context, dataQualityCapabilities.read);
    const data = [...this.datasets.values()]
      .filter((dataset) => this.matchesContext(context, dataset))
      .sort((left, right) => right.generatedAt.localeCompare(left.generatedAt));
    const meta = data[0] ? this.meta(context, data[0].id) : null;

    return { data, meta };
  }

  getDataset(context: ApplicationSessionContext, datasetId: DatasetId): {
    data: Dataset;
    meta: AnalyticalResponseMeta;
  } {
    this.assertCapability(context, dataQualityCapabilities.read);
    const dataset = this.requireDataset(context, datasetId);

    return {
      data: dataset,
      meta: this.meta(context, dataset.id),
    };
  }

  getReadiness(context: ApplicationSessionContext, datasetId: DatasetId): {
    data: ReadinessAssessment;
    meta: AnalyticalResponseMeta;
  } {
    const dataset = this.requireDataset(context, datasetId);
    const readiness = this.requireReadiness(context, dataset.id);

    return {
      data: readiness,
      meta: this.meta(context, dataset.id),
    };
  }

  getLineage(context: ApplicationSessionContext, datasetId: DatasetId): {
    data: readonly LineageLink[];
    meta: AnalyticalResponseMeta;
  } {
    const dataset = this.requireDataset(context, datasetId);

    return {
      data: [...this.lineage.values()].filter((link) =>
        this.matchesContext(context, link),
      ),
      meta: this.meta(context, dataset.id),
    };
  }

  getReconciliation(context: ApplicationSessionContext, datasetId: DatasetId): {
    data: readonly ReconciliationReport[];
    meta: AnalyticalResponseMeta;
  } {
    const dataset = this.requireDataset(context, datasetId);

    return {
      data: [...this.reconciliations.values()].filter(
        (report) => report.datasetId === dataset.id && this.matchesContext(context, report),
      ),
      meta: this.meta(context, dataset.id),
    };
  }

  getImpactReports(context: ApplicationSessionContext, datasetId: DatasetId): {
    data: readonly DataImpactReport[];
    meta: AnalyticalResponseMeta;
  } {
    const dataset = this.requireDataset(context, datasetId);

    return {
      data: [...this.impactReports.values()].filter(
        (report) => report.datasetId === dataset.id && this.matchesContext(context, report),
      ),
      meta: this.meta(context, dataset.id),
    };
  }

  listDataIssues(context: ApplicationSessionContext): {
    data: readonly DataIssue[];
  } {
    this.assertCapability(context, dataQualityCapabilities.read);

    return {
      data: [...this.issues.values()]
        .filter((issue) => this.matchesContext(context, issue))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    };
  }

  assignIssue(
    context: ApplicationSessionContext,
    input: {
      issueId: DataIssue['id'];
      ownerId: string;
    },
  ): DataIssue {
    this.assertCapability(context, dataQualityCapabilities.issueAssign);
    const issue = this.requireIssue(context, input.issueId);
    const assigned = dataIssueSchema.parse({
      ...issue,
      ownerId: input.ownerId,
      status: 'ASSIGNED',
      updatedAt: this.now(),
    });
    this.issues.set(assigned.id, assigned);
    this.incrementIssueVersion(assigned.id);
    this.audit(context, {
      action: 'DATA_ISSUE_ASSIGNED',
      datasetId: assigned.datasetId,
      reason: `owner:${input.ownerId}`,
      targetId: assigned.id,
    });

    return assigned;
  }

  reviewIssue(
    context: ApplicationSessionContext,
    input: {
      after: Record<string, unknown>;
      before: Record<string, unknown>;
      expectedVersion: number;
      issueId: DataIssue['id'];
      rationale: string;
      sourceRecordIds?: readonly SourceRecord['id'][];
    },
  ): ManualDataDecision {
    this.assertCapability(context, dataQualityCapabilities.issueReview);
    const issue = this.requireIssue(context, input.issueId);
    const currentVersion = this.issueVersions.get(issue.id) ?? 0;

    if (input.expectedVersion !== currentVersion) {
      throw new Error('VERSION_CONFLICT');
    }

    if (!input.rationale.trim()) {
      throw new Error('RATIONALE_REQUIRED');
    }

    const decision = manualDataDecisionSchema.parse({
      actorId: context.user.userId,
      after: input.after,
      affectedDatasetId: issue.datasetId,
      affectedMetricCodes: issue.affectedMetricCodes,
      affectedPeriod: this.requireDataset(context, issue.datasetId).period,
      auditEventRef: `audit://data-quality/${this.auditEvents.length + 1}`,
      before: input.before,
      capability: dataQualityCapabilities.issueReview,
      decidedAt: this.now(),
      evidenceRefs: issue.evidenceRefs,
      expectedVersion: input.expectedVersion,
      id: `manual_decision_${normalizeHash({
        issueId: issue.id,
        version: input.expectedVersion,
      })}`,
      issueId: issue.id,
      rationale: input.rationale,
      reprocessingImpact: 'Manual review nie publikuje wyniku bez reprocessingu.',
      ruleVersion: wave3RuleVersions.readinessRules,
      sourceRecordIds: [...(input.sourceRecordIds ?? [])],
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    const reviewed = dataIssueSchema.parse({
      ...issue,
      status: 'RESOLUTION_PENDING',
      updatedAt: this.now(),
    });
    this.manualDecisions.set(decision.id, decision);
    this.issues.set(reviewed.id, reviewed);
    this.incrementIssueVersion(reviewed.id);
    this.metric('manual_review_count');
    this.metric('manual_review_duration_ms', 0);
    this.audit(context, {
      action: 'MANUAL_DATA_DECISION_RECORDED',
      datasetId: issue.datasetId,
      reason: input.rationale,
      targetId: decision.id,
    });
    this.audit(context, {
      action: 'DATA_ISSUE_REVIEWED',
      datasetId: issue.datasetId,
      reason: input.rationale,
      targetId: issue.id,
    });

    return decision;
  }

  resolveIssue(
    context: ApplicationSessionContext,
    input: {
      evidenceRefs: readonly string[];
      expectedVersion: number;
      issueId: DataIssue['id'];
      rationale: string;
      resolutionType: 'ACCEPTED_LIMITATION' | 'FIXED' | 'REJECTED' | 'REPROCESS_REQUIRED';
    },
  ): DataIssue {
    this.assertCapability(context, dataQualityCapabilities.issueResolve);
    const issue = this.requireIssue(context, input.issueId);
    const currentVersion = this.issueVersions.get(issue.id) ?? 0;

    if (input.expectedVersion !== currentVersion) {
      throw new Error('VERSION_CONFLICT');
    }

    const resolved = dataIssueSchema.parse({
      ...issue,
      resolution: {
        actorId: context.user.userId,
        evidenceRefs: [...input.evidenceRefs],
        rationale: input.rationale,
        resolvedAt: this.now(),
        resolutionType: input.resolutionType,
      },
      status: input.resolutionType === 'REPROCESS_REQUIRED' ? 'REPROCESSING' : 'RESOLVED',
      updatedAt: this.now(),
    });
    this.issues.set(resolved.id, resolved);
    this.incrementIssueVersion(resolved.id);
    this.audit(context, {
      action: 'DATA_ISSUE_RESOLVED',
      datasetId: resolved.datasetId,
      reason: input.rationale,
      targetId: resolved.id,
    });

    return resolved;
  }

  requestReprocess(
    context: ApplicationSessionContext,
    input: {
      datasetId: DatasetId;
      idempotencyKey: string;
      reason: string;
      targetRuleVersions?: Record<string, string>;
    },
  ): {
    job: ReprocessJob;
    operation: OperationAccepted;
  } {
    this.assertCapability(context, dataQualityCapabilities.reprocess);
    const dataset = this.requireDataset(context, input.datasetId);

    if (!input.reason.trim()) {
      throw new Error('REPROCESS_REASON_REQUIRED');
    }

    const idempotencyKey = [
      context.tenant.tenantId,
      context.activeWorkspace.workspaceId,
      input.idempotencyKey,
    ].join(':');
    const existingId = this.idempotency.get(idempotencyKey);

    if (existingId) {
      const existing = this.reprocessJobs.get(existingId);

      if (!existing) {
        throw new Error('IDEMPOTENCY_RESULT_MISSING');
      }

      return {
        job: existing,
        operation: this.operation(context, 'reprocess', existing.id, 'accepted'),
      };
    }

    const job = reprocessJobSchema.parse({
      createdAt: this.now(),
      datasetId: dataset.id,
      finishedAt: null,
      id: asReprocessJobId(
        `reprocess_${normalizeHash({
          datasetId: dataset.id,
          idempotencyKey: input.idempotencyKey,
        })}`,
      ),
      idempotencyKey: input.idempotencyKey,
      impactReportRef: null,
      range: dataset.period,
      reason: input.reason,
      requestedBy: context.user.userId,
      sourceRuleVersions: this.currentRuleVersions(),
      status: 'QUEUED',
      targetRuleVersions: input.targetRuleVersions ?? this.currentRuleVersions(),
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.reprocessJobs.set(job.id, job);
    this.idempotency.set(idempotencyKey, job.id);
    this.metric('reprocess_count');
    this.audit(context, {
      action: 'REPROCESS_REQUESTED',
      datasetId: dataset.id,
      jobId: job.id,
      operationId: asOperationId(`op_${job.id}`),
      reason: input.reason,
      targetId: job.id,
    });

    return {
      job,
      operation: this.operation(context, 'reprocess', job.id, 'accepted'),
    };
  }

  runReprocess(context: ApplicationSessionContext, jobId: ReprocessJob['id']): ReprocessJob {
    this.assertCapability(context, dataQualityCapabilities.reprocess);
    const queued = this.requireReprocessJob(context, jobId);
    const dataset = this.requireDataset(context, queued.datasetId);
    this.audit(context, {
      action: 'REPROCESS_STARTED',
      datasetId: dataset.id,
      jobId: queued.id,
      operationId: asOperationId(`op_${queued.id}`),
      reason: queued.reason,
      targetId: queued.id,
    });
    const impact = this.createImpactReport(context, dataset, queued);
    const completed = reprocessJobSchema.parse({
      ...queued,
      finishedAt: this.now(),
      impactReportRef: impact.id,
      status: 'SUCCESS',
    });
    this.reprocessJobs.set(completed.id, completed);
    this.metric('reprocess_duration_ms', 0);
    this.audit(context, {
      action: 'REPROCESS_COMPLETED',
      datasetId: dataset.id,
      jobId: completed.id,
      operationId: asOperationId(`op_${completed.id}`),
      reason: queued.reason,
      targetId: completed.id,
    });

    return completed;
  }

  listSourceAuthorityRules(context: ApplicationSessionContext): readonly SourceAuthorityRule[] {
    this.assertCapability(context, dataQualityCapabilities.read);

    return [...this.sourceAuthorities.values()].filter(
      (rule) =>
        (rule.tenantId === null || rule.tenantId === context.tenant.tenantId) &&
        (rule.workspaceId === null ||
          rule.workspaceId === context.activeWorkspace.workspaceId),
    );
  }

  createSourceAuthorityRule(
    context: ApplicationSessionContext,
    input: Omit<
      SourceAuthorityRule,
      'approvedBy' | 'id' | 'status' | 'tenantId' | 'workspaceId'
    >,
  ): SourceAuthorityRule {
    this.assertCapability(context, dataQualityCapabilities.sourceAuthorityManage);
    const rule = sourceAuthorityRuleSchema.parse({
      ...input,
      approvedBy: null,
      id: `authority_${normalizeHash({
        factType: input.factType,
        providerId: input.providerId,
        stream: input.stream,
        version: input.version,
      })}`,
      status: 'DRAFT',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.sourceAuthorities.set(rule.id, rule);
    this.audit(context, {
      action: 'SOURCE_AUTHORITY_CREATED',
      reason: rule.rationale,
      targetId: rule.id,
    });

    return rule;
  }

  activateSourceAuthorityRule(
    context: ApplicationSessionContext,
    ruleId: SourceAuthorityRule['id'],
  ): SourceAuthorityRule {
    this.assertCapability(context, dataQualityCapabilities.sourceAuthorityManage);
    const rule = this.sourceAuthorities.get(ruleId);

    if (!rule) {
      throw new Error('NOT_FOUND');
    }

    if (
      rule.tenantId !== context.tenant.tenantId ||
      rule.workspaceId !== context.activeWorkspace.workspaceId
    ) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    const activated = sourceAuthorityRuleSchema.parse({
      ...rule,
      approvedBy: context.user.userId,
      status: 'ACTIVE',
    });
    this.sourceAuthorities.set(activated.id, activated);
    this.audit(context, {
      action: 'SOURCE_AUTHORITY_ACTIVATED',
      reason: activated.rationale,
      targetId: activated.id,
    });

    return activated;
  }

  createDeletionLedgerEntry(
    context: ApplicationSessionContext,
    input: {
      datasetId: DatasetId;
      reason: string;
    },
  ): DeletionLedgerEntry {
    const dataset = this.requireDataset(context, input.datasetId);
    const entry = deletionLedgerEntrySchema.parse({
      backupCutoff: '2026-08-19T00:00:00.000Z',
      deletionId: `delete_${normalizeHash({
        datasetId: dataset.id,
        reason: input.reason,
      })}`,
      effectiveAt: null,
      evidenceRefs: ['evidence://wave-3/deletion-ledger'],
      legalBasis: null,
      legalHold: null,
      reason: input.reason,
      requestedAt: this.now(),
      resourceScope: {
        datasetId: dataset.id,
        period: dataset.period,
      },
      status: 'PENDING',
      systems: [
        'source',
        'normalized',
        'canonical',
        'datasets',
        'assessments',
        'issues',
        'lineage',
        'reports',
        'storage',
        'cache',
        'indexes',
        'queues',
        'dlq',
        'replay',
        'exports',
        'backups',
      ].map((system) => ({
        evidenceRef: null,
        status: 'PENDING' as const,
        system,
      })),
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.deletionLedger.set(entry.deletionId, entry);

    return entry;
  }

  verifyDeletionLedgerEntry(
    context: ApplicationSessionContext,
    deletionId: DeletionLedgerEntry['deletionId'],
  ): DeletionLedgerEntry {
    const entry = this.deletionLedger.get(deletionId);

    if (!entry) {
      throw new Error('NOT_FOUND');
    }

    if (
      entry.tenantId !== context.tenant.tenantId ||
      entry.workspaceId !== context.activeWorkspace.workspaceId
    ) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    const verified = deletionLedgerEntrySchema.parse({
      ...entry,
      effectiveAt: this.now(),
      status: 'VERIFIED',
      systems: entry.systems.map((system) => ({
        ...system,
        evidenceRef: `evidence://wave-3/deletion/${system.system}`,
        status: 'VERIFIED',
      })),
    });
    this.deletionLedger.set(verified.deletionId, verified);

    return verified;
  }

  restoreRespectsDeletionLedger(context: ApplicationSessionContext): boolean {
    return [...this.deletionLedger.values()]
      .filter(
        (entry) =>
          entry.tenantId === context.tenant.tenantId &&
          entry.workspaceId === context.activeWorkspace.workspaceId,
      )
      .every((entry) => entry.status === 'VERIFIED');
  }

  getMonitoring(): MonitoringSnapshot {
    return monitoringSnapshotSchema.parse({
      alerts: this.alerts,
      logs: this.logs,
      metrics: this.metrics,
    });
  }

  private normalizeOrderRecord(
    context: ApplicationSessionContext,
    sourceRecord: SourceRecord,
    payload: SourcePayload,
    index: number,
  ): RawNormalizedRecord {
    const orderNumber = stringFromUnknown(payload, 'orderNumber', true);
    const status = stringFromUnknown(payload, 'status', true);
    const currency = stringFromUnknown(payload, 'currency', true);
    const gross = decimalFromUnknown(payload, 'gross', true);
    const net = decimalFromUnknown(payload, 'net', false);
    const tax = decimalFromUnknown(payload, 'tax', false);
    const shipping = decimalFromUnknown(payload, 'shipping', false);
    const discount = decimalFromUnknown(payload, 'discount', false);
    const refund = decimalFromUnknown(payload, 'refund', false);
    const lineGrossTotal = decimalFromUnknown(payload, 'lineGrossTotal', false);
    const statusCanonical = statusMapping(status.value);
    const errors: NormalizationError[] = [
      ...orderNumber.errors,
      ...status.errors,
      ...currency.errors,
      ...gross.errors,
      ...net.errors,
      ...tax.errors,
      ...shipping.errors,
      ...discount.errors,
      ...refund.errors,
      ...lineGrossTotal.errors,
    ].map((error) => ({
      ...error,
      evidenceRef: `evidence://normalization/${sourceRecord.id}/${error.field}`,
    }));

    if (status.value && statusCanonical === 'unknown') {
      errors.push({
        code: 'UNKNOWN_STATUS',
        evidenceRef: `evidence://normalization/${sourceRecord.id}/status`,
        field: 'status',
        message: `Status ${status.value} nie ma zatwierdzonego mappingu.`,
      });
    }

    if (currency.value && !supportedCurrencies.has(currency.value)) {
      errors.push({
        code: 'UNKNOWN_CURRENCY',
        evidenceRef: `evidence://normalization/${sourceRecord.id}/currency`,
        field: 'currency',
        message: `Waluta ${currency.value} nie ma zatwierdzonej polityki.`,
      });
    }

    if (sourceRecord.externalId.trim().length === 0) {
      errors.push({
        code: 'MISSING_STABLE_EXTERNAL_ID',
        evidenceRef: `evidence://normalization/${sourceRecord.id}/externalId`,
        field: 'externalId',
        message: 'Brak stabilnego external ID blokuje matching.',
      });
    }

    const invalidCodes = new Set([
      'CORRUPTED_PAYLOAD',
      'INVALID_DATE',
      'INVALID_NUMBER',
      'INVALID_TYPE',
      'MISSING_REQUIRED_FIELD',
      'MISSING_STABLE_EXTERNAL_ID',
      'SCHEMA_MISMATCH',
      'UNKNOWN_CURRENCY',
      'UNSUPPORTED_CONTRACT_VERSION',
    ]);
    const validationStatus =
      errors.length === 0
        ? 'VALID'
        : errors.some((error) => invalidCodes.has(error.code))
          ? 'INVALID'
          : 'PARTIAL';

    return rawNormalizedRecordSchema.parse({
      businessTime: sourceRecord.providerEventTime,
      connectionId: sourceRecord.connectionId,
      data: {
        amounts: {
          discount: discount.value,
          gross: gross.value,
          lineGrossTotal: lineGrossTotal.value,
          net: net.value,
          refund: refund.value,
          shipping: shipping.value,
          tax: tax.value,
        },
        currency: currency.value,
        externalOrderId: sourceRecord.externalId,
        orderNumber: orderNumber.value,
        statusCanonical,
        statusSource: status.value,
        zeroEvidenceFields: [
          ...gross.zeroEvidence,
          ...net.zeroEvidence,
          ...tax.zeroEvidence,
          ...shipping.zeroEvidence,
          ...discount.zeroEvidence,
          ...refund.zeroEvidence,
          ...lineGrossTotal.zeroEvidence,
        ],
      },
      id: asRawNormalizedRecordId(`raw_orders_${index + 1}_${sourceRecord.id}`),
      mappingVersion: wave3RuleVersions.normalizationMapping,
      normalizedAt: this.now(),
      providerEventTime: sourceRecord.providerEventTime,
      providerId: sourceRecord.providerId,
      schemaVersion: wave3RuleVersions.sourceSchema,
      sourceRecordId: sourceRecord.id,
      stream: sourceRecord.stream,
      tenantId: context.tenant.tenantId,
      validation: {
        errors,
        status: validationStatus,
      },
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private createExactMatches(
    context: ApplicationSessionContext,
    normalized: readonly RawNormalizedRecord[],
  ): ExactMatchResult[] {
    const groups = new Map<string, RawNormalizedRecord[]>();

    for (const record of normalized) {
      const key = record.data.orderNumber
        ? [
            context.tenant.tenantId,
            context.activeWorkspace.workspaceId,
            'CanonicalOrder',
            record.data.orderNumber,
          ].join(':')
        : `unmatched:${record.id}`;
      groups.set(key, [...(groups.get(key) ?? []), record]);
    }

    return [...groups.entries()].map(([factIdentity, records], index) => {
      const match = exactMatchResultSchema.parse({
        factIdentity,
        id: `exact_match_${index + 1}_${normalizeHash(factIdentity)}`,
        matchedAt: this.now(),
        reasonCode: records[0]?.data.orderNumber
          ? 'ORDER_NUMBER_WITH_WORKSPACE_SCOPE'
          : 'NO_STABLE_ORDER_NUMBER',
        ruleVersion: wave3RuleVersions.exactMatching,
        sourceRecordIds: records.map((record) => record.sourceRecordId),
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      });
      this.exactMatches.set(match.id, match);
      this.metric('exact_match_count');

      return match;
    });
  }

  private detectOverlaps(
    context: ApplicationSessionContext,
    exactMatches: readonly ExactMatchResult[],
  ): OverlapCandidate[] {
    const overlaps = exactMatches
      .filter((match) => match.sourceRecordIds.length > 1)
      .map((match, index) =>
        overlapCandidateSchema.parse({
          createdAt: this.now(),
          detectionRuleVersion: wave3RuleVersions.exactMatching,
          factType: 'CanonicalOrder',
          id: `overlap_${index + 1}_${normalizeHash(match.factIdentity)}`,
          matchType: 'EXACT',
          reasonCodes: ['SAME_ORDER_NUMBER_WITHIN_WORKSPACE'],
          resolvedAt: this.now(),
          sourceRecordIds: match.sourceRecordIds,
          status: 'RESOLVED',
          tenantId: context.tenant.tenantId,
          workspaceId: context.activeWorkspace.workspaceId,
        }),
      );

    for (const overlap of overlaps) {
      this.overlaps.set(overlap.id, overlap);
      this.metric('overlap_candidate_count');
      this.metric('confirmed_overlap_count');
      this.audit(context, {
        action: 'OVERLAP_DETECTED',
        reason: overlap.reasonCodes.join(','),
        targetId: overlap.id,
      });
      this.audit(context, {
        action: 'OVERLAP_RESOLVED',
        reason: 'exact_match_with_active_authority',
        targetId: overlap.id,
      });
    }

    return overlaps;
  }

  private canonicalizeOrders(
    context: ApplicationSessionContext,
    normalized: readonly RawNormalizedRecord[],
    exactMatches: readonly ExactMatchResult[],
    sourceAuthority: SourceAuthorityRule,
  ): CanonicalOrder[] {
    const bySourceRecord = new Map(
      normalized.map((record) => [record.sourceRecordId, record] as const),
    );
    const canonical: CanonicalOrder[] = [];

    for (const match of exactMatches) {
      const records = match.sourceRecordIds
        .map((sourceRecordId) => bySourceRecord.get(sourceRecordId))
        .filter((record): record is RawNormalizedRecord => Boolean(record))
        .sort((left, right) => left.sourceRecordId.localeCompare(right.sourceRecordId));
      const primary = records[0];

      if (!primary || primary.data.currency === null || primary.data.amounts.gross === null) {
        continue;
      }

      const canonicalId = asCanonicalOrderId(
        `canord_${normalizeHash({
          factIdentity: match.factIdentity,
          ruleVersion: wave3RuleVersions.deduplication,
        })}`,
      );
      const order = canonicalOrderSchema.parse({
        amounts: {
          discount: primary.data.amounts.discount,
          gross: primary.data.amounts.gross,
          net: primary.data.amounts.net,
          refund: primary.data.amounts.refund,
          shipping: primary.data.amounts.shipping,
          tax: primary.data.amounts.tax,
        },
        authorityVersion: sourceAuthority.version,
        businessTime: primary.businessTime ?? primary.normalizedAt,
        canonicalSchemaVersion: wave3RuleVersions.canonicalSchema,
        currency: primary.data.currency,
        deduplicationVersion: wave3RuleVersions.deduplication,
        effectiveTime: primary.businessTime ?? primary.normalizedAt,
        id: canonicalId,
        mappingVersion: primary.mappingVersion,
        occurredAt: primary.businessTime ?? primary.normalizedAt,
        processingTime: this.now(),
        status: primary.data.statusCanonical,
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      });
      this.canonicalOrders.set(order.id, order);
      canonical.push(order);

      records.forEach((record, index) => {
        const link = lineageLinkSchema.parse({
          authorityVersion: sourceAuthority.version,
          canonicalEntityId: order.id,
          canonicalEntityType: 'CanonicalOrder',
          contributionType: index === 0 ? 'PRIMARY' : 'EXCLUDED',
          createdAt: this.now(),
          deduplicationVersion: wave3RuleVersions.deduplication,
          id: `lineage_${normalizeHash({
            canonicalId: order.id,
            sourceRecordId: record.sourceRecordId,
          })}`,
          mappingVersion: record.mappingVersion,
          reasonCode: index === 0 ? 'SOURCE_AUTHORITY_PRIMARY' : 'DUPLICATE_SOURCE_RECORD',
          sourceRecordId: record.sourceRecordId,
          tenantId: context.tenant.tenantId,
          workspaceId: context.activeWorkspace.workspaceId,
        });
        this.lineage.set(link.id, link);
        if (link.contributionType === 'EXCLUDED') {
          this.metric('excluded_contribution_count');
        }
      });
    }

    return canonical;
  }

  private assessQuality(
    context: ApplicationSessionContext,
    input: {
      canonicalOrders: readonly CanonicalOrder[];
      datasetId: DatasetId;
      normalized: readonly RawNormalizedRecord[];
      overlaps: readonly OverlapCandidate[];
      period: { from: string; to: string };
      sourceAuthority: SourceAuthorityRule | null;
    },
  ): QualityAssessment {
    const invalidRecords = input.normalized.filter(
      (record) => record.validation.status === 'INVALID',
    );
    const partialRecords = input.normalized.filter(
      (record) => record.validation.status === 'PARTIAL',
    );
    const unresolvedOverlaps = input.overlaps.filter(
      (overlap) => overlap.status === 'REVIEW_REQUIRED' || overlap.status === 'DETECTED',
    );
    const financialFailures = input.normalized.filter((record) => {
      const gross = record.data.amounts.gross;
      const lineGross = record.data.amounts.lineGrossTotal;

      return gross !== null && lineGross !== null && Math.abs(Number(gross) - Number(lineGross)) > 0.01;
    });
    const latestProviderTime = input.normalized
      .map((record) => record.providerEventTime)
      .filter((value): value is string => value !== null)
      .sort((left, right) => right.localeCompare(left))[0] ?? null;
    const freshnessLagHours = latestProviderTime
      ? Math.round((Date.parse(this.now()) - Date.parse(latestProviderTime)) / 3_600_000)
      : null;
    const dimensions = {
      completeness: qualityDimension({
        impact:
          input.normalized.length === 0
            ? 'Brak danych nie generuje zera.'
            : 'Zakres posiada użyteczne rekordy source.',
        nextAction:
          input.normalized.length === 0 ? 'Uruchom initial sync.' : 'Kontynuuj assessment.',
        range: `${input.period.from}/${input.period.to}`,
        reasonCodes: input.normalized.length === 0 ? ['NO_SOURCE_RECORDS'] : ['SOURCE_PRESENT'],
        status: input.normalized.length === 0 ? 'FAIL' : 'PASS',
        threshold: '>= 1 useful source record',
        value: String(input.normalized.length),
      }),
      freshness: qualityDimension({
        impact:
          freshnessLagHours !== null && freshnessLagHours > 48
            ? 'Dataset przekroczył próg świeżości.'
            : 'Dane mieszczą się w progu świeżości MVP.',
        nextAction:
          freshnessLagHours !== null && freshnessLagHours > 48
            ? 'Uruchom catch-up albo sprawdź provider latency.'
            : 'Brak akcji.',
        range: `${input.period.from}/${input.period.to}`,
        reasonCodes:
          freshnessLagHours !== null && freshnessLagHours > 48 ? ['FRESHNESS_EXCEEDED'] : ['FRESH'],
        status: freshnessLagHours !== null && freshnessLagHours > 48 ? 'WARN' : 'PASS',
        threshold: '<= 48h',
        value: freshnessLagHours === null ? 'unknown' : `${freshnessLagHours}h`,
      }),
      schema: qualityDimension({
        impact:
          invalidRecords.length > 0
            ? 'Rekordy z naruszeniem schematu nie mogą podnieść readiness.'
            : partialRecords.length > 0
              ? 'Część rekordów wymaga przeglądu mappingu.'
              : 'Schemat i typy zgodne z mappingiem.',
        nextAction:
          invalidRecords.length > 0
            ? 'Napraw mapping lub skieruj rekordy do kwarantanny.'
            : partialRecords.length > 0
              ? 'Zweryfikuj status mapping.'
              : 'Brak akcji.',
        range: 'source->raw-normalized',
        reasonCodes:
          invalidRecords.length > 0
            ? ['SCHEMA_INVALID']
            : partialRecords.length > 0
              ? ['SCHEMA_PARTIAL']
              : ['SCHEMA_VALID'],
        status: invalidRecords.length > 0 ? 'FAIL' : partialRecords.length > 0 ? 'WARN' : 'PASS',
        threshold: '0 invalid records',
        value: `${invalidRecords.length} invalid, ${partialRecords.length} partial`,
      }),
      uniqueness: qualityDimension({
        impact: 'Exact matching blokuje wielokrotny wkład tego samego zamówienia.',
        nextAction: 'Brak akcji dla rozstrzygniętych duplikatów.',
        range: 'tenant/workspace/orderNumber',
        reasonCodes: ['EXACT_MATCH_APPLIED'],
        status: 'PASS',
        threshold: 'one canonical contribution per fact',
        value: `${input.canonicalOrders.length} canonical facts`,
      }),
      overlap: qualityDimension({
        impact:
          unresolvedOverlaps.length > 0
            ? 'Nierozstrzygnięty overlap blokuje zależne KPI.'
            : 'Overlap jest pusty albo rozstrzygnięty przez exact matching.',
        nextAction:
          unresolvedOverlaps.length > 0 ? 'Rozstrzygnij source authority.' : 'Brak akcji.',
        range: 'orders source records',
        reasonCodes:
          unresolvedOverlaps.length > 0 ? ['UNRESOLVED_OVERLAP'] : ['OVERLAP_CONTROLLED'],
        status: unresolvedOverlaps.length > 0 ? 'FAIL' : 'PASS',
        threshold: '0 unresolved overlaps',
        value: String(unresolvedOverlaps.length),
      }),
      financialIntegrity: qualityDimension({
        impact:
          financialFailures.length > 0
            ? 'Suma pozycji różni się od kwoty zamówienia poza tolerancją.'
            : 'Kwoty zamówień mieszczą się w tolerancji.',
        nextAction:
          financialFailures.length > 0
            ? 'Utwórz DataIssue i zablokuj zależne KPI finansowe.'
            : 'Brak akcji.',
        range: 'canonical orders',
        reasonCodes:
          financialFailures.length > 0 ? ['ORDER_TOTAL_OUTSIDE_TOLERANCE'] : ['ORDER_TOTAL_OK'],
        status: financialFailures.length > 0 ? 'FAIL' : 'PASS',
        threshold: '0.01',
        value: String(financialFailures.length),
      }),
      currency: qualityDimension({
        impact:
          invalidRecords.some((record) =>
            record.validation.errors.some((error) => error.code === 'UNKNOWN_CURRENCY'),
          )
            ? 'Brak zatwierdzonej polityki walutowej blokuje agregację.'
            : 'Waluta jest jawna i zgodna z polityką MVP.',
        nextAction: 'Brak akcji dla jednej waluty PLN.',
        range: 'orders currency',
        reasonCodes: ['CURRENCY_POLICY_APPLIED'],
        status: invalidRecords.some((record) =>
          record.validation.errors.some((error) => error.code === 'UNKNOWN_CURRENCY'),
        )
          ? 'FAIL'
          : 'PASS',
        threshold: 'supported currency code',
        value: [...new Set(input.normalized.map((record) => record.data.currency).filter(Boolean))].join(',') || 'unknown',
      }),
      statusMapping: qualityDimension({
        impact:
          partialRecords.length > 0
            ? 'Nieznany status nie może zostać uznany za przychód.'
            : 'Statusy providera mają zatwierdzony mapping.',
        nextAction:
          partialRecords.length > 0 ? 'Zatwierdź mapping albo wyklucz rekord.' : 'Brak akcji.',
        range: 'woocommerce orders',
        reasonCodes: partialRecords.length > 0 ? ['UNKNOWN_STATUS'] : ['STATUS_MAPPING_OK'],
        status: partialRecords.length > 0 ? 'WARN' : 'PASS',
        threshold: '0 unknown statuses',
        value: String(partialRecords.length),
      }),
      lineage: qualityDimension({
        impact:
          input.canonicalOrders.length > 0 &&
          [...this.lineage.values()].filter((link) => link.contributionType === 'PRIMARY').length === 0
            ? 'Brak lineage blokuje audytowalne KPI.'
            : 'Każdy fakt kanoniczny posiada link PRIMARY do source.',
        nextAction: 'Brak akcji.',
        range: 'canonical->source',
        reasonCodes: ['LINEAGE_AVAILABLE'],
        status:
          input.canonicalOrders.length > 0 &&
          [...this.lineage.values()].filter((link) => link.contributionType === 'PRIMARY').length === 0
            ? 'FAIL'
            : 'PASS',
        threshold: '100% canonical facts with PRIMARY lineage',
        value: String([...this.lineage.values()].length),
      }),
    };
    const allDimensions = Object.values(dimensions);
    const result = allDimensions.some((dimension) => dimension.status === 'FAIL')
      ? 'FAIL'
      : allDimensions.some((dimension) => dimension.status === 'WARN')
        ? 'WARN'
        : 'PASS';

    return qualityAssessmentSchema.parse({
      affectedMetricCodes: ['order_count', 'gross_revenue', 'revenue_after_fees'],
      assessedAt: this.now(),
      datasetId: input.datasetId,
      evidenceRefs: ['evidence://wave-3/quality-assessment'],
      id: `qa_${normalizeHash({
        datasetId: input.datasetId,
        ruleSetVersion: wave3RuleVersions.qualityRules,
      })}`,
      result,
      ruleSetVersion: wave3RuleVersions.qualityRules,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
      ...dimensions,
    });
  }

  private createReadiness(
    context: ApplicationSessionContext,
    input: {
      canonicalOrders: readonly CanonicalOrder[];
      currency: string | null;
      datasetId: DatasetId;
      period: { from: string; to: string };
      qualityAssessment: QualityAssessment;
      sourceRecords: readonly SourceRecord[];
      timezone: string;
    },
  ): ReadinessAssessment {
    const limitations: DatasetLimitation[] = [];
    let status = input.qualityAssessment.result === 'PASS' ? 'READY' : 'PARTIAL';

    if (input.sourceRecords.length === 0) {
      status = 'NO_DATA';
      limitations.push({
        code: 'NO_DATA_IS_NOT_ZERO',
        impact: 'KPI pozostają niedostępne; nie pokazujemy wartości 0.',
        message: 'Brak użytecznych rekordów source dla zakresu.',
      });
    } else if (input.qualityAssessment.result === 'FAIL') {
      status = input.qualityAssessment.overlap.status === 'FAIL' ? 'BLOCKED' : 'INVALID';
      limitations.push({
        code: status,
        impact: 'Zależne KPI są zablokowane do czasu naprawy i walidacji.',
        message: 'Reguły jakości nie przeszły bramy datasetu.',
      });
    } else if (input.qualityAssessment.result === 'WARN') {
      status = 'PARTIAL';
      limitations.push({
        code: 'PARTIAL_DATASET',
        impact: 'Dopuszczone są tylko KPI niewrażliwe na wskazane ograniczenia.',
        message: 'Część jakości wymaga przeglądu lub reprocessingu.',
      });
    }

    if (input.qualityAssessment.freshness.status === 'WARN' && status === 'READY') {
      status = 'DELAYED';
    }

    const sourceCoverage = {
      acceptedRecords: input.sourceRecords.length,
      expectedStreams: ['orders'],
      lastSuccessfulSyncAt: input.sourceRecords
        .map((record) => record.fetchedAt)
        .sort((left, right) => right.localeCompare(left))[0] ?? null,
      providerIds: [...new Set(input.sourceRecords.map((record) => record.providerId))],
      sourceRecords: input.sourceRecords.length,
      streamsWithData: input.sourceRecords.length > 0 ? ['orders'] : [],
    };

    return readinessAssessmentSchema.parse({
      affectedMetricCodes: ['order_count', 'gross_revenue', 'revenue_after_fees'],
      allowedMetricCodes: status === 'READY' ? ['order_count', 'gross_revenue'] : [],
      blockedMetricCodes:
        status === 'READY'
          ? ['revenue_after_fees']
          : ['order_count', 'gross_revenue', 'revenue_after_fees'],
      currency: input.currency,
      datasetId: input.datasetId,
      evidenceRefs: ['evidence://wave-3/readiness'],
      generatedAt: this.now(),
      id: `ready_${normalizeHash({
        datasetId: input.datasetId,
        ruleVersion: wave3RuleVersions.readinessRules,
      })}`,
      limitations,
      nextActions:
        status === 'READY'
          ? [
              {
                capability: null,
                label: 'Dataset może wejść do Fali 4 dla Order Count i Gross Revenue.',
                operationRef: null,
                ownerId,
              },
            ]
          : [
              {
                capability: dataQualityCapabilities.issueReview,
                label: 'Przejrzyj DataIssue i uruchom walidowany reprocess.',
                operationRef: null,
                ownerId,
              },
            ],
      ownerId,
      period: input.period,
      ruleVersion: wave3RuleVersions.readinessRules,
      scope: {
        canonicalCount: input.canonicalOrders.length,
        datasetType: 'orders',
      },
      sourceCoverage,
      status,
      tenantId: context.tenant.tenantId,
      timezone: input.timezone,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private reconcile(
    context: ApplicationSessionContext,
    input: {
      canonicalOrders: readonly CanonicalOrder[];
      connectionId: IntegrationConnection['id'] | undefined;
      dataset: Dataset;
      exactMatches: readonly ExactMatchResult[];
      providerId: IntegrationProvider['providerId'] | undefined;
      sourceRecords: readonly SourceRecord[];
    },
  ): ReconciliationReport {
    if (!input.connectionId || !input.providerId) {
      throw new Error('RECONCILIATION_SOURCE_SCOPE_MISSING');
    }

    const sourceGross = sumDecimal(
      input.sourceRecords
        .filter((record) => record.stream === 'orders')
        .map((record) => {
          const normalized = [...this.normalizedRecords.values()].find(
            (candidate) => candidate.sourceRecordId === record.id,
          );

          return normalized?.data.amounts.gross ?? null;
        }),
    );
    const canonicalGross = sumDecimal(
      input.canonicalOrders.map((order) => order.amounts.gross),
    );
    const difference = Math.abs(Number(sourceGross ?? 0) - Number(canonicalGross ?? 0));
    const duplicateCount = input.exactMatches.reduce(
      (count, match) => count + Math.max(0, match.sourceRecordIds.length - 1),
      0,
    );
    const status = difference <= 0.01 ? 'PASS' : 'FAIL';
    const report = reconciliationReportSchema.parse({
      affectedMetricCodes: ['order_count', 'gross_revenue'],
      canonicalFactCount: input.canonicalOrders.length,
      canonicalTotals: {
        gross: canonicalGross,
      },
      conflictCount: 0,
      connectionId: input.connectionId,
      currency: input.dataset.currency,
      datasetId: input.dataset.id,
      duplicateCount,
      evidenceHash: createDeterministicHash({
        canonicalGross,
        sourceGross,
        version: wave3RuleVersions.reconciliationTolerance,
      }),
      excludedRecordCount: duplicateCount,
      excludedValues: {
        gross: '0',
      },
      generatedAt: this.now(),
      id: `reconciliation_${normalizeHash({
        datasetId: input.dataset.id,
        version: wave3RuleVersions.reconciliationTolerance,
      })}`,
      normalizedRecordCount: [...this.normalizedRecords.values()].filter((record) =>
        this.matchesContext(context, record),
      ).length,
      overlapCount: [...this.overlaps.values()].filter((overlap) =>
        this.matchesContext(context, overlap),
      ).length,
      period: input.dataset.period,
      providerId: input.providerId,
      readinessResult: input.dataset.readinessStatus,
      reasonCodes: status === 'PASS' ? ['WITHIN_TOLERANCE'] : ['OUTSIDE_TOLERANCE'],
      ruleVersions: this.currentRuleVersions(),
      sourceRecordCount: input.sourceRecords.length,
      sourceTotals: {
        gross: sourceGross,
      },
      status,
      tenantId: context.tenant.tenantId,
      tolerance: '0.01',
      unresolvedOverlapCount: 0,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.reconciliations.set(report.id, report);
    this.metric('reconciliation_difference', difference);
    this.audit(context, {
      action: status === 'PASS' ? 'RECONCILIATION_COMPLETED' : 'RECONCILIATION_FAILED',
      datasetId: input.dataset.id,
      reason: report.reasonCodes.join(','),
      targetId: report.id,
    });

    return report;
  }

  private createImpactReport(
    context: ApplicationSessionContext,
    dataset: Dataset,
    job: ReprocessJob,
  ): DataImpactReport {
    const sourceCount = [...this.normalizedRecords.values()].filter((record) =>
      this.matchesContext(context, record),
    ).length;
    const canonicalCount = [...this.canonicalOrders.values()].filter((order) =>
      this.matchesContext(context, order),
    ).length;
    const report = dataImpactReportSchema.parse({
      affectedIssues: [...this.issues.values()]
        .filter((issue) => issue.datasetId === dataset.id && this.matchesContext(context, issue))
        .map((issue) => issue.id),
      affectedMetricCodes: ['order_count', 'gross_revenue', 'revenue_after_fees'],
      amountDifferences: {
        gross: {
          after: sumDecimal([...this.canonicalOrders.values()].map((order) => order.amounts.gross)),
          before: sumDecimal([...this.canonicalOrders.values()].map((order) => order.amounts.gross)),
          delta: deltaDecimal(
            sumDecimal([...this.canonicalOrders.values()].map((order) => order.amounts.gross)),
            sumDecimal([...this.canonicalOrders.values()].map((order) => order.amounts.gross)),
          ),
        },
      },
      canonicalRecordDifference: {
        after: canonicalCount,
        before: canonicalCount,
        delta: 0,
      },
      datasetId: dataset.id,
      evidenceRefs: ['evidence://wave-3/impact-report'],
      generatedAt: this.now(),
      id: dataImpactReportIdSchema.parse(`impact_${normalizeHash(job.id)}`),
      newlyExcludedRecords: 0,
      newlyIncludedRecords: 0,
      previousVersions: job.sourceRuleVersions,
      proposedVersions: job.targetRuleVersions,
      range: dataset.period,
      readinessAfter: dataset.readinessStatus,
      readinessBefore: dataset.readinessStatus,
      sourceRecordDifference: {
        after: sourceCount,
        before: sourceCount,
        delta: 0,
      },
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.impactReports.set(report.id, report);

    return report;
  }

  private ensureDefaultSourceAuthority(context: ApplicationSessionContext): void {
    const id = `authority_${context.tenant.tenantId}_${context.activeWorkspace.workspaceId}_orders`;

    if (this.sourceAuthorities.has(id)) {
      return;
    }

    const rule = sourceAuthorityRuleSchema.parse({
      approvedBy: ownerId,
      factType: 'CanonicalOrder',
      id,
      ownerId,
      priority: 1,
      providerId: 'woocommerce',
      rationale: 'WooCommerce jest providerem referencyjnym Fali 2 dla zamówień sprzedażowych.',
      scope: {
        dataset: 'orders',
        period: 'bounded',
      },
      status: 'ACTIVE',
      stream: 'orders',
      tenantId: context.tenant.tenantId,
      validFrom: '2026-07-19T00:00:00.000Z',
      validTo: null,
      version: wave3RuleVersions.sourceAuthority,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.sourceAuthorities.set(rule.id, rule);
    this.audit(context, {
      action: 'SOURCE_AUTHORITY_CREATED',
      reason: rule.rationale,
      targetId: rule.id,
    });
    this.audit(context, {
      action: 'SOURCE_AUTHORITY_ACTIVATED',
      reason: rule.rationale,
      targetId: rule.id,
    });
  }

  private activeSourceAuthority(
    context: ApplicationSessionContext,
    factType: string,
    stream: string,
  ): SourceAuthorityRule | null {
    return (
      [...this.sourceAuthorities.values()]
        .filter(
          (rule) =>
            rule.status === 'ACTIVE' &&
            rule.factType === factType &&
            rule.stream === stream &&
            (rule.tenantId === null || rule.tenantId === context.tenant.tenantId) &&
            (rule.workspaceId === null ||
              rule.workspaceId === context.activeWorkspace.workspaceId),
        )
        .sort((left, right) => left.priority - right.priority)[0] ?? null
    );
  }

  private createIssueObject(
    context: ApplicationSessionContext,
    datasetId: DatasetId,
    input: {
      affectedMetricCodes: readonly string[];
      evidenceRefs: readonly string[];
      impact: string;
      issueClass: string;
      severity: DataIssue['severity'];
    },
  ): DataIssue {
    const id = asDataQualityIssueId(
      `dq_issue_${normalizeHash({
        datasetId,
        issueClass: input.issueClass,
        impact: input.impact,
      })}`,
    );

    return dataIssueSchema.parse({
      affectedMetricCodes: input.affectedMetricCodes.map((code) => metricCodeSchema.parse(code)),
      class: input.issueClass,
      createdAt: this.now(),
      datasetId,
      evidenceRefs: [...input.evidenceRefs],
      id,
      impact: input.impact,
      ownerId: input.severity === 'CRITICAL' ? ownerId : null,
      resolution: null,
      ruleVersion: wave3RuleVersions.qualityRules,
      severity: input.severity,
      status: 'OPEN',
      tenantId: context.tenant.tenantId,
      updatedAt: this.now(),
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private createInventory(): DataInventoryEntry[] {
    return [
      ['source', 'Source records and payload refs', 'R-BUSINESS'],
      ['normalized', 'Raw normalized orders', 'R-BUSINESS'],
      ['canonical', 'Canonical orders', 'R-BUSINESS'],
      ['datasets', 'Dataset readiness read model', 'R-BUSINESS'],
      ['assessments', 'Quality assessments', 'R-AUDIT'],
      ['issues', 'DataIssue lifecycle', 'R-AUDIT'],
      ['lineage', 'Canonical-source lineage', 'R-AUDIT'],
      ['reports', 'Reconciliation and impact reports', 'R-AUDIT'],
      ['cache', 'Workspace scoped cache entries', 'R-TRANSIENT'],
      ['queues', 'Reprocess job envelopes', 'R-TRANSIENT'],
      ['exports', 'Generated quality exports', 'R-EXPORT'],
      ['backups', 'Backup replay scope', 'R-BACKUP'],
      ['security', 'Audit and deny evidence', 'R-SECURITY'],
    ].map(([system, purpose, retentionClass], index) =>
      dataInventoryEntrySchema.parse({
        classification:
          retentionClass === 'R-SECURITY' || retentionClass === 'R-AUDIT'
            ? 'AUDIT_SECURITY'
            : 'CUSTOMER_CONFIDENTIAL',
        deletionMethod:
          retentionClass === 'R-AUDIT'
            ? 'minimal legal/audit metadata retention with data redaction'
            : 'scoped hard delete or invalidation',
        evidenceOwner: ownerId,
        id: `inventory_wave3_${index + 1}`,
        legalHold: null,
        location: `local-runtime:${system}`,
        purpose,
        recipients: ['PapaData platform'],
        retentionClass,
        retentionTrigger: 'contract or deletion request',
        subprocessors: [],
        system,
        tenantId: null,
        workspaceId: null,
      }),
    );
  }

  private currentRuleVersions(): Record<string, string> {
    return {
      canonicalSchema: wave3RuleVersions.canonicalSchema,
      currencyPolicy: wave3RuleVersions.currencyPolicy,
      deduplication: wave3RuleVersions.deduplication,
      exactMatching: wave3RuleVersions.exactMatching,
      fuzzyMatching: wave3RuleVersions.fuzzyMatching,
      normalizationMapping: wave3RuleVersions.normalizationMapping,
      qualityRules: wave3RuleVersions.qualityRules,
      readinessRules: wave3RuleVersions.readinessRules,
      reconciliationTolerance: wave3RuleVersions.reconciliationTolerance,
      reprocessingPolicy: wave3RuleVersions.reprocessingPolicy,
      sourceAuthority: wave3RuleVersions.sourceAuthority,
      statusMapping: wave3RuleVersions.statusMapping,
    };
  }

  private meta(context: ApplicationSessionContext, datasetId: DatasetId): AnalyticalResponseMeta {
    const readiness = this.requireReadiness(context, datasetId);

    return analyticalResponseMetaSchema.parse({
      contractVersion: dataQualityContractVersion,
      correlationId: asCorrelationId(`cor_meta_${normalizeHash(datasetId)}`),
      generatedAt: this.now(),
      limitations: readiness.limitations,
      readiness,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private operation(
    context: ApplicationSessionContext,
    scope: string,
    targetId: string,
    status: OperationAccepted['status'],
  ): OperationAccepted {
    const operation = operationAcceptedSchema.parse({
      contractVersion: dataQualityContractVersion,
      correlationId: asCorrelationId(`cor_${scope}_${normalizeHash(targetId)}`),
      operationId: asOperationId(`op_${scope}_${normalizeHash(targetId)}`),
      status,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.operations.set(operation.operationId, operation);

    return operation;
  }

  private audit(
    context: ApplicationSessionContext,
    input: {
      action: DataQualityAuditEventType;
      datasetId?: DatasetId | null;
      jobId?: ReprocessJob['id'] | SyncJob['id'] | null;
      operationId?: ReturnType<typeof asOperationId> | null;
      reason: string;
      targetId: string;
    },
  ): void {
    const event = dataQualityAuditEventSchema.parse({
      action: input.action,
      actorId: context.user.userId,
      afterHash: createDeterministicHash({
        action: input.action,
        targetId: input.targetId,
      }),
      beforeHash: null,
      correlationId: asCorrelationId(`cor_dq_audit_${this.auditEvents.length + 1}`),
      datasetId: input.datasetId ?? null,
      evidenceRef: `evidence://wave-3/audit/${input.action}`,
      id: `audit_dq_${this.auditEvents.length + 1}`,
      jobId: input.jobId ?? null,
      occurredAt: this.now(),
      operationId: input.operationId ?? null,
      reason: input.reason,
      ruleVersions: this.currentRuleVersions(),
      targetId: input.targetId,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.auditEvents.push(event);
    this.logs.push({
      correlationId: event.correlationId,
      datasetId: event.datasetId,
      event: event.action,
      jobId: event.jobId,
      reasonCode: event.reason,
      ruleVersion: event.ruleVersions.qualityRules ?? null,
      tenantId: event.tenantId,
      workspaceId: event.workspaceId,
    });
  }

  private assertCapability(context: ApplicationSessionContext, capability: Capability): void {
    if (!hasCapability(context, capability) || !hasEnabledEntitlement(context, capability)) {
      this.crossWorkspaceDeny(context);
      throw new Error('FORBIDDEN');
    }
  }

  private crossWorkspaceDeny(context: ApplicationSessionContext): void {
    this.metric('cross_workspace_deny');
    this.alerts.push({
      alertType: 'cross_workspace_deny',
      correlationId: asCorrelationId(`cor_dq_deny_${this.alerts.length + 1}`),
      severity: 'warning',
    });
    this.logs.push({
      correlationId: asCorrelationId(`cor_dq_deny_log_${this.logs.length + 1}`),
      datasetId: null,
      event: 'cross_workspace_deny',
      jobId: null,
      reasonCode: 'NOT_FOUND_OR_FORBIDDEN',
      ruleVersion: null,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private metric(name: string, increment = 1): void {
    this.metrics[name] = (this.metrics[name] ?? 0) + increment;
  }

  private alert(alertType: string, severity: 'info' | 'warning' | 'critical'): void {
    this.alerts.push({
      alertType,
      correlationId: asCorrelationId(`cor_dq_alert_${this.alerts.length + 1}`),
      severity,
    });
  }

  private matchesContext(
    context: ApplicationSessionContext,
    resource: { tenantId: string; workspaceId: string },
  ): boolean {
    return (
      resource.tenantId === context.tenant.tenantId &&
      resource.workspaceId === context.activeWorkspace.workspaceId
    );
  }

  private requireDataset(context: ApplicationSessionContext, datasetId: DatasetId): Dataset {
    this.assertCapability(context, dataQualityCapabilities.read);
    const dataset = this.datasets.get(datasetId);

    if (!dataset) {
      throw new Error('NOT_FOUND');
    }

    if (!this.matchesContext(context, dataset)) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    return dataset;
  }

  private requireReadiness(
    context: ApplicationSessionContext,
    datasetId: DatasetId,
  ): ReadinessAssessment {
    const readiness = [...this.readinessAssessments.values()].find(
      (candidate) => candidate.datasetId === datasetId,
    );

    if (!readiness) {
      throw new Error('NOT_FOUND');
    }

    if (!this.matchesContext(context, readiness)) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    return readiness;
  }

  private requireIssue(
    context: ApplicationSessionContext,
    issueId: DataIssue['id'],
  ): DataIssue {
    const issue = this.issues.get(issueId);

    if (!issue) {
      throw new Error('NOT_FOUND');
    }

    if (!this.matchesContext(context, issue)) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    return issue;
  }

  private requireReprocessJob(
    context: ApplicationSessionContext,
    jobId: ReprocessJob['id'],
  ): ReprocessJob {
    const job = this.reprocessJobs.get(jobId);

    if (!job) {
      throw new Error('NOT_FOUND');
    }

    if (!this.matchesContext(context, job)) {
      this.crossWorkspaceDeny(context);
      throw new Error('NOT_FOUND');
    }

    return job;
  }

  private incrementIssueVersion(issueId: DataIssue['id']): number {
    const next = (this.issueVersions.get(issueId) ?? 0) + 1;
    this.issueVersions.set(issueId, next);

    return next;
  }
}

export function createDataQualityApi(runtime: LocalDataQualityRuntime) {
  return {
    routes: dataQualityApiRoutes,
    activateSourceAuthorityRule: (
      context: ApplicationSessionContext,
      ruleId: SourceAuthorityRule['id'],
    ) => runtime.activateSourceAuthorityRule(context, ruleId),
    assignIssue: (
      context: ApplicationSessionContext,
      input: Parameters<LocalDataQualityRuntime['assignIssue']>[1],
    ) => runtime.assignIssue(context, input),
    getDataset: (context: ApplicationSessionContext, datasetId: DatasetId) =>
      runtime.getDataset(context, datasetId),
    getImpactReports: (context: ApplicationSessionContext, datasetId: DatasetId) =>
      runtime.getImpactReports(context, datasetId),
    getLineage: (context: ApplicationSessionContext, datasetId: DatasetId) =>
      runtime.getLineage(context, datasetId),
    getReadiness: (context: ApplicationSessionContext, datasetId: DatasetId) =>
      runtime.getReadiness(context, datasetId),
    getReconciliation: (context: ApplicationSessionContext, datasetId: DatasetId) =>
      runtime.getReconciliation(context, datasetId),
    listDataIssues: (context: ApplicationSessionContext) =>
      runtime.listDataIssues(context),
    listDatasets: (context: ApplicationSessionContext) => runtime.listDatasets(context),
    listSourceAuthorityRules: (context: ApplicationSessionContext) =>
      runtime.listSourceAuthorityRules(context),
    reprocess: (
      context: ApplicationSessionContext,
      input: Parameters<LocalDataQualityRuntime['requestReprocess']>[1],
    ) => runtime.requestReprocess(context, input),
    resolveIssue: (
      context: ApplicationSessionContext,
      input: Parameters<LocalDataQualityRuntime['resolveIssue']>[1],
    ) => runtime.resolveIssue(context, input),
    reviewIssue: (
      context: ApplicationSessionContext,
      input: Parameters<LocalDataQualityRuntime['reviewIssue']>[1],
    ) => runtime.reviewIssue(context, input),
  };
}

export function createFuzzyMatchingPolicy(): FuzzyMatchingPolicy {
  return fuzzyMatchingPolicySchema.parse({
    enabled: false,
    rationale:
      'Fuzzy matching pozostaje wyłączony w Fali 3; exact matching wystarcza dla referencyjnego strumienia orders.',
    version: wave3RuleVersions.fuzzyMatching,
  });
}

export function createSourceLayerEvidence(input: SourceSnapshot) {
  return sourceLayerEvidenceSchema.parse({
    batchIds: input.batches.map((batch) => batch.id),
    connectionIds: input.connections.map((connection) => connection.id),
    contractVersion: input.records[0]?.contractVersion ?? 'domain-contracts.v1',
    providerIds: input.providers.map((provider) => provider.providerId),
    sourceRecordIds: input.records.map((record) => record.id),
  });
}

export function createReferenceMetricDefinitions() {
  return metricDefinitions;
}
