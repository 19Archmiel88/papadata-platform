import { z } from 'zod';

import {
  asCapability,
  contractVersionSchema,
  correlationIdSchema,
  currencyCodeSchema,
  dataClassificationSchema,
  operationIdSchema,
  retentionClassSchema,
  tenantIdSchema,
  workspaceIdSchema,
  type Capability,
} from '../../domain-contracts';
import {
  connectionIdSchema,
  integrationSourceRecordIdSchema,
  providerIdSchema,
  sourceBatchIdSchema,
  syncJobIdSchema,
} from '../integrations/integrationContracts';

const idValueSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_:-]*$/);

const isoDateTimeSchema = z.string().datetime({ offset: true });
const decimalStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/)
  .nullable();

export const dataQualityContractVersion = 'data-quality.v1' as const;

export const dataQualityCapabilities = {
  issueAssign: asCapability('data-quality:issue:assign'),
  issueReview: asCapability('data-quality:issue:review'),
  issueResolve: asCapability('data-quality:issue:resolve'),
  read: asCapability('data-quality:read'),
  reprocess: asCapability('data-quality:reprocess'),
  sourceAuthorityManage: asCapability('data-quality:source-authority:manage'),
} as const satisfies Record<string, Capability>;

export const datasetIdSchema = idValueSchema.brand<'DatasetId'>();
export const rawNormalizedRecordIdSchema =
  idValueSchema.brand<'RawNormalizedRecordId'>();
export const canonicalOrderIdSchema = idValueSchema.brand<'CanonicalOrderId'>();
export const lineageLinkIdSchema = idValueSchema.brand<'LineageLinkId'>();
export const overlapCandidateIdSchema = idValueSchema.brand<'OverlapCandidateId'>();
export const exactMatchResultIdSchema = idValueSchema.brand<'ExactMatchResultId'>();
export const sourceAuthorityRuleIdSchema =
  idValueSchema.brand<'SourceAuthorityRuleId'>();
export const qualityAssessmentIdSchema =
  idValueSchema.brand<'QualityAssessmentId'>();
export const readinessAssessmentIdSchema =
  idValueSchema.brand<'ReadinessAssessmentId'>();
export const dataQualityIssueIdSchema = idValueSchema.brand<'DataQualityIssueId'>();
export const manualDecisionIdSchema = idValueSchema.brand<'ManualDecisionId'>();
export const reprocessJobIdSchema = idValueSchema.brand<'ReprocessJobId'>();
export const dataImpactReportIdSchema = idValueSchema.brand<'DataImpactReportId'>();
export const reconciliationReportIdSchema =
  idValueSchema.brand<'ReconciliationReportId'>();
export const metricCodeSchema = idValueSchema.brand<'MetricCode'>();
export const deletionLedgerIdSchema = idValueSchema.brand<'DeletionLedgerId'>();
export const dataInventoryIdSchema = idValueSchema.brand<'DataInventoryId'>();

export type DatasetId = z.infer<typeof datasetIdSchema>;
export type RawNormalizedRecordId = z.infer<typeof rawNormalizedRecordIdSchema>;
export type CanonicalOrderId = z.infer<typeof canonicalOrderIdSchema>;
export type DataQualityIssueId = z.infer<typeof dataQualityIssueIdSchema>;
export type ReprocessJobId = z.infer<typeof reprocessJobIdSchema>;

export function asDatasetId(value: string): DatasetId {
  return datasetIdSchema.parse(value);
}

export function asRawNormalizedRecordId(value: string): RawNormalizedRecordId {
  return rawNormalizedRecordIdSchema.parse(value);
}

export function asCanonicalOrderId(value: string): CanonicalOrderId {
  return canonicalOrderIdSchema.parse(value);
}

export function asDataQualityIssueId(value: string): DataQualityIssueId {
  return dataQualityIssueIdSchema.parse(value);
}

export function asReprocessJobId(value: string): ReprocessJobId {
  return reprocessJobIdSchema.parse(value);
}

export const ruleVersionSchema = z.string().min(1).regex(/^[a-z0-9_.:-]+$/);

export const wave3RuleVersions = {
  canonicalSchema: 'canonical-order.v1',
  currencyPolicy: 'currency-policy.pln-only.2026-07',
  deletionPolicy: 'deletion-ledger.2026-07',
  deduplication: 'dedupe.exact-order-number.2026-07',
  exactMatching: 'exact-match.order-number.2026-07',
  fuzzyMatching: 'fuzzy.disabled.2026-07',
  normalizationMapping: 'woocommerce-orders.mapping.2026-07',
  qualityRules: 'quality.orders.mvp.2026-07',
  readinessRules: 'readiness.orders.mvp.2026-07',
  reconciliationTolerance: 'reconciliation.orders.0-01.2026-07',
  reprocessingPolicy: 'reprocess.dataset-versioned.2026-07',
  sourceAuthority: 'authority.woocommerce-orders.2026-07',
  sourceSchema: 'woocommerce-orders.source.2026-07',
  statusMapping: 'woocommerce-status.mapping.2026-07',
  timezonePolicy: 'timezone.workspace-iana.2026-07',
} as const;

export const datasetReadinessStatusSchema = z.enum([
  'NO_DATA',
  'INGESTING',
  'PARTIAL',
  'DELAYED',
  'INVALID',
  'PROCESSING',
  'READY',
  'RESYNC_REQUIRED',
  'BLOCKED',
]);

export type DatasetReadinessStatus = z.infer<typeof datasetReadinessStatusSchema>;

export const normalizationErrorCodeSchema = z.enum([
  'MISSING_REQUIRED_FIELD',
  'INVALID_TYPE',
  'INVALID_DATE',
  'INVALID_NUMBER',
  'UNKNOWN_CURRENCY',
  'UNKNOWN_STATUS',
  'SCHEMA_MISMATCH',
  'UNSUPPORTED_CONTRACT_VERSION',
  'CORRUPTED_PAYLOAD',
  'MISSING_STABLE_EXTERNAL_ID',
]);

export const normalizationErrorSchema = z.object({
  code: normalizationErrorCodeSchema,
  evidenceRef: z.string().min(1),
  field: z.string().min(1),
  message: z.string().min(1),
});

export type NormalizationError = z.infer<typeof normalizationErrorSchema>;

export const canonicalOrderStatusSchema = z.enum([
  'created',
  'pending',
  'confirmed',
  'processing',
  'fulfilled',
  'partiallyFulfilled',
  'cancelled',
  'refunded',
  'partiallyRefunded',
  'returned',
  'disputed',
  'unknown',
]);

export const orderAmountsSchema = z.object({
  discount: decimalStringSchema,
  gross: decimalStringSchema,
  net: decimalStringSchema,
  refund: decimalStringSchema,
  shipping: decimalStringSchema,
  tax: decimalStringSchema,
});

export const rawNormalizedOrderDataSchema = z.object({
  amounts: orderAmountsSchema.extend({
    lineGrossTotal: decimalStringSchema,
  }),
  currency: currencyCodeSchema.nullable(),
  externalOrderId: z.string().min(1).nullable(),
  orderNumber: z.string().min(1).nullable(),
  statusCanonical: canonicalOrderStatusSchema,
  statusSource: z.string().min(1).nullable(),
  zeroEvidenceFields: z.array(z.string()),
});

export type RawNormalizedOrderData = z.infer<typeof rawNormalizedOrderDataSchema>;

export const rawNormalizedRecordSchema = z.object({
  businessTime: isoDateTimeSchema.nullable(),
  connectionId: connectionIdSchema,
  data: rawNormalizedOrderDataSchema,
  mappingVersion: ruleVersionSchema,
  normalizedAt: isoDateTimeSchema,
  providerEventTime: isoDateTimeSchema.nullable(),
  providerId: providerIdSchema,
  schemaVersion: ruleVersionSchema,
  sourceRecordId: integrationSourceRecordIdSchema,
  stream: z.string().min(1),
  tenantId: tenantIdSchema,
  validation: z.object({
    errors: z.array(normalizationErrorSchema),
    status: z.enum(['VALID', 'PARTIAL', 'INVALID']),
  }),
  workspaceId: workspaceIdSchema,
  id: rawNormalizedRecordIdSchema,
});

export type RawNormalizedRecord = z.infer<typeof rawNormalizedRecordSchema>;

export const sourceAuthorityRuleSchema = z.object({
  approvedBy: z.string().min(1).nullable(),
  factType: z.string().min(1),
  id: sourceAuthorityRuleIdSchema,
  ownerId: z.string().min(1),
  priority: z.number().int().nonnegative(),
  providerId: providerIdSchema,
  rationale: z.string().min(1),
  scope: z.record(z.string(), z.unknown()),
  status: z.enum(['DRAFT', 'ACTIVE', 'SUPERSEDED', 'DISABLED']),
  stream: z.string().min(1),
  tenantId: tenantIdSchema.nullable(),
  validFrom: isoDateTimeSchema,
  validTo: isoDateTimeSchema.nullable(),
  version: ruleVersionSchema,
  workspaceId: workspaceIdSchema.nullable(),
});

export type SourceAuthorityRule = z.infer<typeof sourceAuthorityRuleSchema>;

export const overlapCandidateSchema = z.object({
  createdAt: isoDateTimeSchema,
  detectionRuleVersion: ruleVersionSchema,
  factType: z.string().min(1),
  id: overlapCandidateIdSchema,
  matchType: z.enum(['EXACT', 'FUZZY', 'MANUAL']),
  reasonCodes: z.array(z.string().min(1)),
  resolvedAt: isoDateTimeSchema.nullable(),
  sourceRecordIds: z.array(integrationSourceRecordIdSchema).min(1),
  status: z.enum([
    'DETECTED',
    'CONFIRMED_SAME_FACT',
    'CONFIRMED_DIFFERENT_FACT',
    'REVIEW_REQUIRED',
    'RESOLVED',
  ]),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type OverlapCandidate = z.infer<typeof overlapCandidateSchema>;

export const exactMatchResultSchema = z.object({
  factIdentity: z.string().min(1),
  id: exactMatchResultIdSchema,
  matchedAt: isoDateTimeSchema,
  reasonCode: z.string().min(1),
  ruleVersion: ruleVersionSchema,
  sourceRecordIds: z.array(integrationSourceRecordIdSchema).min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type ExactMatchResult = z.infer<typeof exactMatchResultSchema>;

export const fuzzyMatchingPolicySchema = z.object({
  enabled: z.literal(false),
  rationale: z.string().min(1),
  version: ruleVersionSchema,
});

export type FuzzyMatchingPolicy = z.infer<typeof fuzzyMatchingPolicySchema>;

export const canonicalOrderSchema = z.object({
  amounts: orderAmountsSchema,
  authorityVersion: ruleVersionSchema,
  businessTime: isoDateTimeSchema,
  canonicalSchemaVersion: ruleVersionSchema,
  currency: currencyCodeSchema,
  deduplicationVersion: ruleVersionSchema,
  effectiveTime: isoDateTimeSchema,
  id: canonicalOrderIdSchema,
  mappingVersion: ruleVersionSchema,
  occurredAt: isoDateTimeSchema,
  processingTime: isoDateTimeSchema,
  status: canonicalOrderStatusSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type CanonicalOrder = z.infer<typeof canonicalOrderSchema>;

export const lineageLinkSchema = z.object({
  authorityVersion: ruleVersionSchema,
  canonicalEntityId: canonicalOrderIdSchema,
  canonicalEntityType: z.literal('CanonicalOrder'),
  contributionType: z.enum(['PRIMARY', 'SUPPORTING', 'EXCLUDED', 'CONFLICTING']),
  createdAt: isoDateTimeSchema,
  deduplicationVersion: ruleVersionSchema,
  id: lineageLinkIdSchema,
  mappingVersion: ruleVersionSchema,
  reasonCode: z.string().min(1),
  sourceRecordId: integrationSourceRecordIdSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type LineageLink = z.infer<typeof lineageLinkSchema>;

export const sourceCoverageSchema = z.object({
  acceptedRecords: z.number().int().nonnegative(),
  expectedStreams: z.array(z.string().min(1)),
  lastSuccessfulSyncAt: isoDateTimeSchema.nullable(),
  providerIds: z.array(providerIdSchema),
  sourceRecords: z.number().int().nonnegative(),
  streamsWithData: z.array(z.string().min(1)),
});

export type SourceCoverage = z.infer<typeof sourceCoverageSchema>;

export const datasetLimitationSchema = z.object({
  code: z.string().min(1),
  impact: z.string().min(1),
  message: z.string().min(1),
});

export type DatasetLimitation = z.infer<typeof datasetLimitationSchema>;

export const datasetSchema = z.object({
  canonicalModelVersion: ruleVersionSchema,
  currency: currencyCodeSchema.nullable(),
  generatedAt: isoDateTimeSchema,
  id: datasetIdSchema,
  lastUpdatedAt: isoDateTimeSchema,
  limitations: z.array(datasetLimitationSchema),
  period: z.object({
    from: isoDateTimeSchema,
    to: isoDateTimeSchema,
  }),
  readinessStatus: datasetReadinessStatusSchema,
  schemaVersion: ruleVersionSchema,
  sourceCoverage: sourceCoverageSchema,
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  type: z.literal('orders'),
  workspaceId: workspaceIdSchema,
});

export type Dataset = z.infer<typeof datasetSchema>;

export const qualityDimensionResultSchema = z.object({
  evidenceRefs: z.array(z.string().min(1)),
  impact: z.string().min(1),
  nextAction: z.string().min(1),
  range: z.string().min(1),
  reasonCodes: z.array(z.string().min(1)),
  status: z.enum(['PASS', 'WARN', 'FAIL']),
  threshold: z.string().min(1),
  value: z.string().min(1),
});

export type QualityDimensionResult = z.infer<typeof qualityDimensionResultSchema>;

export const qualityAssessmentSchema = z.object({
  affectedMetricCodes: z.array(metricCodeSchema),
  assessedAt: isoDateTimeSchema,
  completeness: qualityDimensionResultSchema,
  currency: qualityDimensionResultSchema,
  datasetId: datasetIdSchema,
  evidenceRefs: z.array(z.string().min(1)),
  financialIntegrity: qualityDimensionResultSchema,
  freshness: qualityDimensionResultSchema,
  id: qualityAssessmentIdSchema,
  lineage: qualityDimensionResultSchema,
  overlap: qualityDimensionResultSchema,
  result: z.enum(['PASS', 'WARN', 'FAIL']),
  ruleSetVersion: ruleVersionSchema,
  schema: qualityDimensionResultSchema,
  statusMapping: qualityDimensionResultSchema,
  tenantId: tenantIdSchema,
  uniqueness: qualityDimensionResultSchema,
  workspaceId: workspaceIdSchema,
});

export type QualityAssessment = z.infer<typeof qualityAssessmentSchema>;

export const nextActionSchema = z.object({
  capability: z.string().min(1).nullable(),
  label: z.string().min(1),
  ownerId: z.string().min(1).nullable(),
  operationRef: z.string().min(1).nullable(),
});

export type NextAction = z.infer<typeof nextActionSchema>;

export const readinessAssessmentSchema = z.object({
  affectedMetricCodes: z.array(metricCodeSchema),
  allowedMetricCodes: z.array(metricCodeSchema),
  blockedMetricCodes: z.array(metricCodeSchema),
  currency: currencyCodeSchema.nullable(),
  datasetId: datasetIdSchema,
  evidenceRefs: z.array(z.string().min(1)),
  generatedAt: isoDateTimeSchema,
  id: readinessAssessmentIdSchema,
  limitations: z.array(datasetLimitationSchema),
  nextActions: z.array(nextActionSchema),
  ownerId: z.string().min(1).nullable(),
  period: z.object({
    from: isoDateTimeSchema,
    to: isoDateTimeSchema,
  }),
  ruleVersion: ruleVersionSchema,
  scope: z.record(z.string(), z.unknown()),
  sourceCoverage: sourceCoverageSchema,
  status: datasetReadinessStatusSchema,
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type ReadinessAssessment = z.infer<typeof readinessAssessmentSchema>;

export const dataIssueStatusSchema = z.enum([
  'OPEN',
  'ASSIGNED',
  'IN_REVIEW',
  'RESOLUTION_PENDING',
  'REPROCESSING',
  'RESOLVED',
  'REJECTED',
  'BLOCKED',
]);

export const dataIssueResolutionSchema = z.object({
  actorId: z.string().min(1),
  evidenceRefs: z.array(z.string().min(1)),
  rationale: z.string().min(1),
  resolvedAt: isoDateTimeSchema,
  resolutionType: z.enum(['FIXED', 'ACCEPTED_LIMITATION', 'REJECTED', 'REPROCESS_REQUIRED']),
});

export const dataIssueSchema = z.object({
  affectedMetricCodes: z.array(metricCodeSchema),
  class: z.string().min(1),
  createdAt: isoDateTimeSchema,
  datasetId: datasetIdSchema,
  evidenceRefs: z.array(z.string().min(1)),
  id: dataQualityIssueIdSchema,
  impact: z.string().min(1),
  ownerId: z.string().min(1).nullable(),
  resolution: dataIssueResolutionSchema.nullable(),
  ruleVersion: ruleVersionSchema,
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: dataIssueStatusSchema,
  tenantId: tenantIdSchema,
  updatedAt: isoDateTimeSchema,
  workspaceId: workspaceIdSchema,
});

export type DataIssue = z.infer<typeof dataIssueSchema>;
export type DataIssueResolution = z.infer<typeof dataIssueResolutionSchema>;

export const manualDataDecisionSchema = z.object({
  actorId: z.string().min(1),
  after: z.record(z.string(), z.unknown()),
  affectedDatasetId: datasetIdSchema,
  affectedMetricCodes: z.array(metricCodeSchema),
  affectedPeriod: z.object({
    from: isoDateTimeSchema,
    to: isoDateTimeSchema,
  }),
  auditEventRef: z.string().min(1),
  before: z.record(z.string(), z.unknown()),
  capability: z.string().min(1),
  decidedAt: isoDateTimeSchema,
  evidenceRefs: z.array(z.string().min(1)),
  expectedVersion: z.number().int().nonnegative(),
  id: manualDecisionIdSchema,
  issueId: dataQualityIssueIdSchema,
  rationale: z.string().min(1),
  reprocessingImpact: z.string().min(1),
  ruleVersion: ruleVersionSchema,
  sourceRecordIds: z.array(integrationSourceRecordIdSchema),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type ManualDataDecision = z.infer<typeof manualDataDecisionSchema>;

export const reprocessJobSchema = z.object({
  createdAt: isoDateTimeSchema,
  datasetId: datasetIdSchema,
  finishedAt: isoDateTimeSchema.nullable(),
  id: reprocessJobIdSchema,
  idempotencyKey: z.string().min(8).max(128),
  impactReportRef: dataImpactReportIdSchema.nullable(),
  range: z.object({
    from: isoDateTimeSchema,
    to: isoDateTimeSchema,
  }),
  reason: z.string().min(1),
  requestedBy: z.string().min(1),
  sourceRuleVersions: z.record(z.string(), z.string()),
  status: z.enum([
    'QUEUED',
    'RUNNING',
    'VALIDATING',
    'READY_TO_PUBLISH',
    'SUCCESS',
    'FAILED',
    'CANCELLED',
  ]),
  targetRuleVersions: z.record(z.string(), z.string()),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type ReprocessJob = z.infer<typeof reprocessJobSchema>;

export const countDifferenceSchema = z.object({
  after: z.number().int().nonnegative(),
  before: z.number().int().nonnegative(),
  delta: z.number().int(),
});

export const decimalDifferenceSchema = z.object({
  after: decimalStringSchema,
  before: decimalStringSchema,
  delta: decimalStringSchema,
});

export const dataImpactReportSchema = z.object({
  affectedIssues: z.array(dataQualityIssueIdSchema),
  affectedMetricCodes: z.array(metricCodeSchema),
  amountDifferences: z.record(z.string(), decimalDifferenceSchema),
  canonicalRecordDifference: countDifferenceSchema,
  datasetId: datasetIdSchema,
  evidenceRefs: z.array(z.string().min(1)),
  generatedAt: isoDateTimeSchema,
  id: dataImpactReportIdSchema,
  newlyExcludedRecords: z.number().int().nonnegative(),
  newlyIncludedRecords: z.number().int().nonnegative(),
  previousVersions: z.record(z.string(), z.string()),
  proposedVersions: z.record(z.string(), z.string()),
  range: z.object({
    from: isoDateTimeSchema,
    to: isoDateTimeSchema,
  }),
  readinessAfter: datasetReadinessStatusSchema,
  readinessBefore: datasetReadinessStatusSchema,
  sourceRecordDifference: countDifferenceSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type DataImpactReport = z.infer<typeof dataImpactReportSchema>;

export const reconciliationReportSchema = z.object({
  affectedMetricCodes: z.array(metricCodeSchema),
  canonicalFactCount: z.number().int().nonnegative(),
  canonicalTotals: z.record(z.string(), decimalStringSchema),
  conflictCount: z.number().int().nonnegative(),
  connectionId: connectionIdSchema,
  currency: currencyCodeSchema.nullable(),
  datasetId: datasetIdSchema,
  duplicateCount: z.number().int().nonnegative(),
  evidenceHash: z.string().min(1),
  excludedRecordCount: z.number().int().nonnegative(),
  excludedValues: z.record(z.string(), decimalStringSchema),
  generatedAt: isoDateTimeSchema,
  id: reconciliationReportIdSchema,
  normalizedRecordCount: z.number().int().nonnegative(),
  overlapCount: z.number().int().nonnegative(),
  period: z.object({
    from: isoDateTimeSchema,
    to: isoDateTimeSchema,
  }),
  providerId: providerIdSchema,
  readinessResult: datasetReadinessStatusSchema,
  reasonCodes: z.array(z.string().min(1)),
  ruleVersions: z.record(z.string(), z.string()),
  sourceRecordCount: z.number().int().nonnegative(),
  sourceTotals: z.record(z.string(), decimalStringSchema),
  status: z.enum(['PASS', 'FAIL']),
  tenantId: tenantIdSchema,
  tolerance: decimalStringSchema,
  unresolvedOverlapCount: z.number().int().nonnegative(),
  workspaceId: workspaceIdSchema,
});

export type ReconciliationReport = z.infer<typeof reconciliationReportSchema>;

export const metricDefinitionSchema = z.object({
  approverId: z.string().min(1).nullable(),
  businessDefinition: z.string().min(1),
  currencyPolicyVersion: ruleVersionSchema.nullable(),
  formulaRef: z.string().min(1),
  metricCode: metricCodeSchema,
  missingDataPolicy: z.enum(['UNKNOWN', 'BLOCK', 'PARTIAL', 'ZERO_ALLOWED']),
  ownerId: z.string().min(1),
  readinessRuleVersion: ruleVersionSchema,
  reprocessingPolicyVersion: ruleVersionSchema,
  requiredDatasets: z.array(z.string().min(1)),
  requiredFields: z.array(z.string().min(1)),
  scopeDimensions: z.array(z.string().min(1)),
  sourcePolicyVersion: ruleVersionSchema,
  testVectorRefs: z.array(z.string().min(1)),
  timezonePolicyVersion: ruleVersionSchema.nullable(),
  validFrom: isoDateTimeSchema,
  validTo: isoDateTimeSchema.nullable(),
  version: ruleVersionSchema,
});

export type MetricDefinition = z.infer<typeof metricDefinitionSchema>;

export const dataInventoryEntrySchema = z.object({
  classification: dataClassificationSchema,
  deletionMethod: z.string().min(1),
  evidenceOwner: z.string().min(1),
  id: dataInventoryIdSchema,
  legalHold: z.string().nullable(),
  location: z.string().min(1),
  purpose: z.string().min(1),
  recipients: z.array(z.string().min(1)),
  retentionClass: retentionClassSchema,
  retentionTrigger: z.string().min(1),
  subprocessors: z.array(z.string().min(1)),
  system: z.string().min(1),
  tenantId: tenantIdSchema.nullable(),
  workspaceId: workspaceIdSchema.nullable(),
});

export type DataInventoryEntry = z.infer<typeof dataInventoryEntrySchema>;

export const deletionSystemStatusSchema = z.object({
  evidenceRef: z.string().min(1).nullable(),
  status: z.enum(['PENDING', 'RUNNING', 'VERIFIED', 'FAILED', 'PARTIAL']),
  system: z.string().min(1),
});

export const legalHoldSchema = z.object({
  reason: z.string().min(1),
  reviewAt: isoDateTimeSchema,
  scope: z.record(z.string(), z.unknown()),
});

export const deletionLedgerEntrySchema = z.object({
  backupCutoff: isoDateTimeSchema.nullable(),
  deletionId: deletionLedgerIdSchema,
  effectiveAt: isoDateTimeSchema.nullable(),
  evidenceRefs: z.array(z.string().min(1)),
  legalBasis: z.string().min(1).nullable(),
  legalHold: legalHoldSchema.nullable(),
  reason: z.string().min(1),
  requestedAt: isoDateTimeSchema,
  resourceScope: z.record(z.string(), z.unknown()),
  status: z.enum(['PENDING', 'RUNNING', 'VERIFIED', 'FAILED', 'PARTIAL']),
  systems: z.array(deletionSystemStatusSchema),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema.nullable(),
});

export type DeletionLedgerEntry = z.infer<typeof deletionLedgerEntrySchema>;

export const dataQualityAuditEventTypeSchema = z.enum([
  'SOURCE_BATCH_CREATED',
  'SOURCE_BATCH_COMPLETED',
  'SOURCE_BATCH_FAILED',
  'SOURCE_RECORD_ACCEPTED',
  'SOURCE_RECORD_QUARANTINED',
  'NORMALIZATION_STARTED',
  'NORMALIZATION_COMPLETED',
  'NORMALIZATION_FAILED',
  'OVERLAP_DETECTED',
  'OVERLAP_RESOLVED',
  'SOURCE_AUTHORITY_CREATED',
  'SOURCE_AUTHORITY_ACTIVATED',
  'SOURCE_AUTHORITY_SUPERSEDED',
  'CANONICALIZATION_STARTED',
  'CANONICALIZATION_COMPLETED',
  'CANONICALIZATION_FAILED',
  'QUALITY_ASSESSMENT_COMPLETED',
  'READINESS_CHANGED',
  'DATA_ISSUE_CREATED',
  'DATA_ISSUE_ASSIGNED',
  'DATA_ISSUE_REVIEWED',
  'DATA_ISSUE_RESOLVED',
  'DATA_ISSUE_BLOCKED',
  'MANUAL_DATA_DECISION_RECORDED',
  'REPROCESS_REQUESTED',
  'REPROCESS_STARTED',
  'REPROCESS_COMPLETED',
  'REPROCESS_FAILED',
  'RECONCILIATION_COMPLETED',
  'RECONCILIATION_FAILED',
  'DATA_RULE_VERSION_CHANGED',
]);

export type DataQualityAuditEventType = z.infer<
  typeof dataQualityAuditEventTypeSchema
>;

export const dataQualityAuditEventSchema = z.object({
  action: dataQualityAuditEventTypeSchema,
  actorId: z.string().min(1).nullable(),
  afterHash: z.string().min(1).nullable(),
  beforeHash: z.string().min(1).nullable(),
  correlationId: correlationIdSchema,
  datasetId: datasetIdSchema.nullable(),
  evidenceRef: z.string().min(1).nullable(),
  id: idValueSchema,
  jobId: z.union([syncJobIdSchema, reprocessJobIdSchema]).nullable(),
  occurredAt: isoDateTimeSchema,
  operationId: operationIdSchema.nullable(),
  reason: z.string().min(1),
  ruleVersions: z.record(z.string(), z.string()),
  targetId: z.string().min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type DataQualityAuditEvent = z.infer<typeof dataQualityAuditEventSchema>;

export const monitoringSnapshotSchema = z.object({
  alerts: z.array(
    z.object({
      alertType: z.string().min(1),
      correlationId: correlationIdSchema,
      severity: z.enum(['info', 'warning', 'critical']),
    }),
  ),
  logs: z.array(
    z.object({
      correlationId: correlationIdSchema,
      datasetId: datasetIdSchema.nullable(),
      event: z.string().min(1),
      jobId: z.string().min(1).nullable(),
      reasonCode: z.string().min(1).nullable(),
      ruleVersion: z.string().min(1).nullable(),
      tenantId: tenantIdSchema,
      workspaceId: workspaceIdSchema,
    }),
  ),
  metrics: z.record(z.string(), z.number().nonnegative()),
});

export type MonitoringSnapshot = z.infer<typeof monitoringSnapshotSchema>;

export const dataQualityApiRoutes = {
  dataIssue: '/v1/data-issues/{issueId}',
  dataIssueAssign: '/v1/data-issues/{issueId}/assign',
  dataIssueCollection: '/v1/data-issues',
  dataIssueResolve: '/v1/data-issues/{issueId}/resolve',
  dataIssueReview: '/v1/data-issues/{issueId}/review',
  dataset: '/v1/datasets/{datasetId}',
  datasetCollection: '/v1/datasets',
  impactReports: '/v1/datasets/{datasetId}/impact-reports',
  lineage: '/v1/datasets/{datasetId}/lineage',
  operation: '/v1/operations/{operationId}',
  readiness: '/v1/datasets/{datasetId}/readiness',
  reconciliation: '/v1/datasets/{datasetId}/reconciliation',
  reprocess: '/v1/datasets/{datasetId}/reprocess',
  sourceAuthorityActivate: '/v1/source-authority-rules/{ruleId}/activate',
  sourceAuthorityCollection: '/v1/source-authority-rules',
} as const;

export const analyticalResponseMetaSchema = z.object({
  contractVersion: z.literal(dataQualityContractVersion),
  correlationId: correlationIdSchema,
  generatedAt: isoDateTimeSchema,
  limitations: z.array(datasetLimitationSchema),
  readiness: readinessAssessmentSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AnalyticalResponseMeta = z.infer<typeof analyticalResponseMetaSchema>;

export const operationAcceptedSchema = z.object({
  contractVersion: z.literal(dataQualityContractVersion),
  correlationId: correlationIdSchema,
  operationId: operationIdSchema,
  status: z.enum(['accepted', 'completed', 'partial', 'error']),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type OperationAccepted = z.infer<typeof operationAcceptedSchema>;

export const sourceLayerEvidenceSchema = z.object({
  batchIds: z.array(sourceBatchIdSchema),
  connectionIds: z.array(connectionIdSchema),
  contractVersion: contractVersionSchema,
  providerIds: z.array(providerIdSchema),
  sourceRecordIds: z.array(integrationSourceRecordIdSchema),
});

export type SourceLayerEvidence = z.infer<typeof sourceLayerEvidenceSchema>;

export const evidenceBundleSchema = z.object({
  canonicalOrders: z.array(canonicalOrderSchema),
  dataset: datasetSchema,
  deletionLedgerEntries: z.array(deletionLedgerEntrySchema),
  impactReports: z.array(dataImpactReportSchema),
  inventory: z.array(dataInventoryEntrySchema),
  issues: z.array(dataIssueSchema),
  lineage: z.array(lineageLinkSchema),
  manualDecisions: z.array(manualDataDecisionSchema),
  normalizedRecords: z.array(rawNormalizedRecordSchema),
  qualityAssessments: z.array(qualityAssessmentSchema),
  readiness: readinessAssessmentSchema,
  reconciliationReports: z.array(reconciliationReportSchema),
  reprocessJobs: z.array(reprocessJobSchema),
  source: sourceLayerEvidenceSchema,
});

export type EvidenceBundle = z.infer<typeof evidenceBundleSchema>;

export const metricDefinitions: readonly MetricDefinition[] = [
  metricDefinitionSchema.parse({
    approverId: 'artur_wisniewski',
    businessDefinition:
      'Liczba unikalnych zamówień kanonicznych w lokalnym zakresie datasetu orders.',
    currencyPolicyVersion: null,
    formulaRef: 'formula://orders/order-count/v1',
    metricCode: metricCodeSchema.parse('order_count'),
    missingDataPolicy: 'BLOCK',
    ownerId: 'artur_wisniewski',
    readinessRuleVersion: wave3RuleVersions.readinessRules,
    reprocessingPolicyVersion: wave3RuleVersions.reprocessingPolicy,
    requiredDatasets: ['orders'],
    requiredFields: ['canonicalOrderId', 'status', 'occurredAt'],
    scopeDimensions: ['tenantId', 'workspaceId', 'period', 'timezone'],
    sourcePolicyVersion: wave3RuleVersions.sourceAuthority,
    testVectorRefs: ['docs/evidence/wave-3/test-vectors.md#order-count'],
    timezonePolicyVersion: wave3RuleVersions.timezonePolicy,
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.order-count.v1',
  }),
  metricDefinitionSchema.parse({
    approverId: 'artur_wisniewski',
    businessDefinition:
      'Suma wartości brutto kwalifikujących się zamówień kanonicznych w jednej walucie.',
    currencyPolicyVersion: wave3RuleVersions.currencyPolicy,
    formulaRef: 'formula://orders/gross-revenue/v1',
    metricCode: metricCodeSchema.parse('gross_revenue'),
    missingDataPolicy: 'BLOCK',
    ownerId: 'artur_wisniewski',
    readinessRuleVersion: wave3RuleVersions.readinessRules,
    reprocessingPolicyVersion: wave3RuleVersions.reprocessingPolicy,
    requiredDatasets: ['orders'],
    requiredFields: ['canonicalOrderId', 'amounts.gross', 'currency'],
    scopeDimensions: ['tenantId', 'workspaceId', 'period', 'currency', 'timezone'],
    sourcePolicyVersion: wave3RuleVersions.sourceAuthority,
    testVectorRefs: ['docs/evidence/wave-3/test-vectors.md#gross-revenue'],
    timezonePolicyVersion: wave3RuleVersions.timezonePolicy,
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.gross-revenue.v1',
  }),
  metricDefinitionSchema.parse({
    approverId: null,
    businessDefinition:
      'Przychód po potwierdzonych opłatach marketplace; Fala 3 blokuje go bez datasetu fees.',
    currencyPolicyVersion: wave3RuleVersions.currencyPolicy,
    formulaRef: 'formula://orders/revenue-after-fees/v1',
    metricCode: metricCodeSchema.parse('revenue_after_fees'),
    missingDataPolicy: 'BLOCK',
    ownerId: 'artur_wisniewski',
    readinessRuleVersion: wave3RuleVersions.readinessRules,
    reprocessingPolicyVersion: wave3RuleVersions.reprocessingPolicy,
    requiredDatasets: ['orders', 'marketplace_fees'],
    requiredFields: ['canonicalOrderId', 'amounts.gross', 'fee.amount'],
    scopeDimensions: ['tenantId', 'workspaceId', 'period', 'currency', 'timezone'],
    sourcePolicyVersion: wave3RuleVersions.sourceAuthority,
    testVectorRefs: ['docs/evidence/wave-3/test-vectors.md#missing-fees'],
    timezonePolicyVersion: wave3RuleVersions.timezonePolicy,
    validFrom: '2026-07-19T00:00:00.000Z',
    validTo: null,
    version: 'metric.revenue-after-fees.v1',
  }),
];
