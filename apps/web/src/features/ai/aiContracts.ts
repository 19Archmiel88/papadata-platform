import { z } from 'zod';

import {
  asCapability,
  currencyCodeSchema,
  dataClassificationSchema,
  retentionClassSchema,
  tenantIdSchema,
  userIdSchema,
  workspaceIdSchema,
  type Capability,
} from '../../domain-contracts';
import {
  analyticsMetricCodeSchema,
  analyticsReadinessStatusSchema,
  analyticsScopeSchema,
  metricSnapshotIdSchema,
  periodSchema,
} from '../analytics/analyticsContracts';
import {
  datasetIdSchema,
  ruleVersionSchema,
} from '../data-quality/dataQualityContracts';

const idValueSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_:-]*$/);

const isoDateTimeSchema = z.string().datetime({ offset: true });
const decimalStringSchema = z.string().regex(/^-?\d+(\.\d+)?$/);

export const aiContractVersion = 'ai-platform.v1' as const;
export const aiGatewayPolicyVersion = 'ai-gateway.2026-07' as const;
export const aiRetrievalPipelineVersion = 'ai-retrieval.2026-07' as const;
export const aiContextPolicyVersion = 'ai-context-min.2026-07' as const;
export const aiGateS3Version = 'ai-gate-s3.2026-07' as const;
export const aiEvaluationSuiteVersion = 'ai-eval.2026-07' as const;

export const aiCapabilities = {
  approveActionProposal: asCapability('ai:action-proposal:approve'),
  createActionProposal: asCapability('ai:action-proposal:create'),
  decideRecommendation: asCapability('ai:recommendation:decide'),
  executeActionProposal: asCapability('ai:action-proposal:execute'),
  exportLaboratoryRun: asCapability('ai:laboratory:export'),
  manageAISettings: asCapability('ai:settings:manage'),
  runAIAssistant: asCapability('ai:assistant:run'),
  runAILaboratory: asCapability('ai:laboratory:run'),
  viewAIAudit: asCapability('ai:audit:view'),
  viewAIGovernance: asCapability('ai:governance:view'),
  viewAIHistory: asCapability('ai:history:view'),
  viewAIProvenance: asCapability('ai:provenance:view'),
  viewAIAssistant: asCapability('ai:assistant:view'),
  viewActions: asCapability('ai:actions:view'),
  viewDecisions: asCapability('ai:decisions:view'),
  viewInsights: asCapability('ai:insights:view'),
  viewObservations: asCapability('ai:observations:view'),
  viewOutcomes: asCapability('ai:outcomes:view'),
  viewRecommendations: asCapability('ai:recommendations:view'),
} as const satisfies Record<string, Capability>;

export const aiUseCaseIdSchema = idValueSchema.brand<'AIUseCaseId'>();
export const aiThreadIdSchema = idValueSchema.brand<'AIThreadId'>();
export const aiMessageIdSchema = idValueSchema.brand<'AIMessageId'>();
export const modelRunIdSchema = idValueSchema.brand<'ModelRunId'>();
export const contextManifestIdSchema = idValueSchema.brand<'ContextManifestId'>();
export const aiEvidenceIdSchema = idValueSchema.brand<'AIEvidenceId'>();
export const observationIdSchema = idValueSchema.brand<'ObservationId'>();
export const insightIdSchema = idValueSchema.brand<'InsightId'>();
export const recommendationIdSchema = idValueSchema.brand<'RecommendationId'>();
export const decisionIdSchema = idValueSchema.brand<'DecisionId'>();
export const actionIdSchema = idValueSchema.brand<'ActionId'>();
export const actionProposalIdSchema = idValueSchema.brand<'ActionProposalId'>();
export const actionExecutionIdSchema = idValueSchema.brand<'ActionExecutionId'>();
export const outcomeIdSchema = idValueSchema.brand<'OutcomeId'>();
export const laboratoryExperimentIdSchema =
  idValueSchema.brand<'LaboratoryExperimentId'>();
export const laboratoryArtifactIdSchema =
  idValueSchema.brand<'LaboratoryArtifactId'>();
export const gateRequirementIdSchema = idValueSchema.brand<'GateRequirementId'>();
export const evaluationRunIdSchema = idValueSchema.brand<'EvaluationRunId'>();
export const aiAuditEventIdSchema = idValueSchema.brand<'AIAuditEventId'>();
export const aiIncidentIdSchema = idValueSchema.brand<'AIIncidentId'>();
export const aiDeletionRequestIdSchema =
  idValueSchema.brand<'AIDeletionRequestId'>();

export type AIUseCaseId = z.infer<typeof aiUseCaseIdSchema>;
export type AIThreadId = z.infer<typeof aiThreadIdSchema>;
export type AIMessageId = z.infer<typeof aiMessageIdSchema>;
export type ModelRunId = z.infer<typeof modelRunIdSchema>;
export type ContextManifestId = z.infer<typeof contextManifestIdSchema>;
export type AIEvidenceId = z.infer<typeof aiEvidenceIdSchema>;
export type ObservationId = z.infer<typeof observationIdSchema>;
export type InsightId = z.infer<typeof insightIdSchema>;
export type RecommendationId = z.infer<typeof recommendationIdSchema>;
export type DecisionId = z.infer<typeof decisionIdSchema>;
export type ActionId = z.infer<typeof actionIdSchema>;
export type ActionProposalId = z.infer<typeof actionProposalIdSchema>;
export type ActionExecutionId = z.infer<typeof actionExecutionIdSchema>;
export type OutcomeId = z.infer<typeof outcomeIdSchema>;
export type LaboratoryExperimentId = z.infer<typeof laboratoryExperimentIdSchema>;
export type EvaluationRunId = z.infer<typeof evaluationRunIdSchema>;

export function asAIUseCaseId(value: string): AIUseCaseId {
  return aiUseCaseIdSchema.parse(value);
}

export function asAIThreadId(value: string): AIThreadId {
  return aiThreadIdSchema.parse(value);
}

export function asAIMessageId(value: string): AIMessageId {
  return aiMessageIdSchema.parse(value);
}

export function asModelRunId(value: string): ModelRunId {
  return modelRunIdSchema.parse(value);
}

export function asContextManifestId(value: string): ContextManifestId {
  return contextManifestIdSchema.parse(value);
}

export function asAIEvidenceId(value: string): AIEvidenceId {
  return aiEvidenceIdSchema.parse(value);
}

export function asObservationId(value: string): ObservationId {
  return observationIdSchema.parse(value);
}

export function asInsightId(value: string): InsightId {
  return insightIdSchema.parse(value);
}

export function asRecommendationId(value: string): RecommendationId {
  return recommendationIdSchema.parse(value);
}

export function asDecisionId(value: string): DecisionId {
  return decisionIdSchema.parse(value);
}

export function asActionId(value: string): ActionId {
  return actionIdSchema.parse(value);
}

export function asActionProposalId(value: string): ActionProposalId {
  return actionProposalIdSchema.parse(value);
}

export function asActionExecutionId(value: string): ActionExecutionId {
  return actionExecutionIdSchema.parse(value);
}

export function asOutcomeId(value: string): OutcomeId {
  return outcomeIdSchema.parse(value);
}

export function asLaboratoryExperimentId(value: string): LaboratoryExperimentId {
  return laboratoryExperimentIdSchema.parse(value);
}

export function asEvaluationRunId(value: string): EvaluationRunId {
  return evaluationRunIdSchema.parse(value);
}

export function asAIIncidentId(value: string) {
  return aiIncidentIdSchema.parse(value);
}

export function asAIDeletionRequestId(value: string) {
  return aiDeletionRequestIdSchema.parse(value);
}

export const aiSurfaceSchema = z.enum([
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
  'kpi_detail',
  'dataset_detail',
  'quality_issue',
  'integration_detail',
  'recommendation_detail',
  'decision_detail',
  'action_detail',
  'ai_laboratory',
  'ai_settings',
  'ai_history',
  'internal_control_plane',
]);

export type AISurface = z.infer<typeof aiSurfaceSchema>;

export const aiResourceTypeSchema = z.enum([
  'MetricSnapshot',
  'Dataset',
  'QualityIssue',
  'Integration',
  'Recommendation',
  'Decision',
  'Action',
  'Workspace',
  'Experiment',
]);

export const humanOversightLevelSchema = z.enum([
  'READ_ONLY',
  'HUMAN_REVIEW',
  'SINGLE_APPROVAL',
  'DOUBLE_APPROVAL',
  'REAUTH_AND_APPROVAL',
  'PROHIBITED',
]);

export type HumanOversightLevel = z.infer<typeof humanOversightLevelSchema>;

export const aiRuntimeStateSchema = z.enum([
  'DISABLED',
  'INSUFFICIENT_DATA',
  'BUILDING_CONTEXT',
  'GENERATING',
  'ANSWERED',
  'NEEDS_REVIEW',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'PROVIDER_ERROR',
  'BLOCKED_BY_POLICY',
  'INJECTION_BLOCKED',
  'COST_LIMIT_REACHED',
]);

export type AIRuntimeState = z.infer<typeof aiRuntimeStateSchema>;

export const aiRefusalCodeSchema = z.enum([
  'INSUFFICIENT_DATA',
  'DATA_NOT_READY',
  'DATA_INVALID',
  'DATA_BLOCKED',
  'STALE_FOR_CURRENT_DECISION',
  'PERMISSION_DENIED',
  'ENTITLEMENT_REQUIRED',
  'OUT_OF_SCOPE',
  'UNSUPPORTED_USE_CASE',
  'EVIDENCE_UNAVAILABLE',
  'CONFLICT_UNRESOLVED',
  'SAFETY_POLICY_BLOCK',
  'PROVIDER_UNAVAILABLE',
  'COST_LIMIT_REACHED',
  'GATE_NOT_SATISFIED',
  'INJECTION_DETECTED',
]);

export type AIRefusalCode = z.infer<typeof aiRefusalCodeSchema>;

export const aiResponsePartKindSchema = z.enum([
  'FACT',
  'INTERPRETATION',
  'HYPOTHESIS',
  'RECOMMENDATION',
]);

export const aiUseCaseStatusSchema = z.enum([
  'DRAFT',
  'EVALUATION',
  'APPROVED',
  'SUSPENDED',
  'RETIRED',
]);

export const gateRequirementStatusSchema = z.enum([
  'SATISFIED',
  'NOT_SATISFIED',
  'EVIDENCE_MISSING',
  'NOT_APPLICABLE',
]);

export const gateApprovalDecisionSchema = z.enum([
  'APPROVED',
  'BLOCKED',
  'CONDITIONAL',
  'NOT_REVIEWED',
]);

export const aiProviderStatusSchema = z.enum([
  'APPROVED_FOR_SYNTHETIC',
  'EVALUATION',
  'SUSPENDED',
  'RETIRED',
]);

export const aiModelStatusSchema = z.enum([
  'APPROVED_FOR_SYNTHETIC',
  'EVALUATION',
  'SUSPENDED',
  'RETIRED',
]);

export const aiRunStatusSchema = z.enum([
  'QUEUED',
  'BUILDING_CONTEXT',
  'RUNNING',
  'SUCCEEDED',
  'REFUSED',
  'CANCELLED',
  'FAILED',
]);

export type AIRunStatus = z.infer<typeof aiRunStatusSchema>;

export const aiThreadStatusSchema = z.enum([
  'OPEN',
  'ARCHIVED',
  'DELETION_PENDING',
  'DELETED',
]);

export const aiMessageRoleSchema = z.enum([
  'USER',
  'ASSISTANT',
  'SYSTEM_NOTICE',
  'TOOL_RESULT',
]);

export const aiContextSchema = z.object({
  currency: currencyCodeSchema,
  dataScope: z.enum(['workspace', 'tenant']),
  period: periodSchema,
  readiness: analyticsReadinessStatusSchema,
  resourceId: z.string().min(1).nullable(),
  resourceType: aiResourceTypeSchema,
  snapshotId: metricSnapshotIdSchema.nullable(),
  surface: aiSurfaceSchema,
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  useCaseId: aiUseCaseIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AIContext = z.infer<typeof aiContextSchema>;

export const aiUseCaseSchema = z.object({
  allowedAIRoles: z.array(z.enum(['assistant', 'analyst', 'drafting_agent'])),
  allowedDataClassifications: z.array(dataClassificationSchema),
  allowedTools: z.array(z.string().min(1)),
  contextMinimizationPolicyId: z.string().min(1),
  costPolicyId: z.string().min(1),
  description: z.string().min(1),
  evidencePolicyId: z.string().min(1),
  gateEvidenceReferences: z.array(z.string().min(1)),
  humanOversightLevel: humanOversightLevelSchema,
  id: aiUseCaseIdSchema,
  maximumTimeRange: z.string().min(1),
  modelPolicyId: z.string().min(1),
  name: z.string().min(1),
  outputSchemaId: z.string().min(1),
  owner: z.string().min(1),
  prohibitedBehaviors: z.array(z.string().min(1)),
  promptTemplateId: z.string().min(1),
  providerPolicyId: z.string().min(1),
  purpose: z.string().min(1),
  requiredCapabilities: z.array(z.custom<Capability>()),
  requiredDataScope: z.enum(['workspace', 'tenant']),
  requiredDatasets: z.array(z.string().min(1)),
  requiredEntitlements: z.array(z.custom<Capability>()),
  requiredMetricCodes: z.array(analyticsMetricCodeSchema),
  requiredReadiness: z.array(analyticsReadinessStatusSchema),
  retentionPolicyId: z.string().min(1),
  retrievalPolicyId: z.string().min(1),
  reviewer: z.string().min(1),
  status: aiUseCaseStatusSchema,
  systemPromptTemplateId: z.string().min(1),
  targetSurface: z.array(aiSurfaceSchema),
  targetUsers: z.array(z.string().min(1)),
  tenantScope: z.enum(['CURRENT_TENANT']),
  validFrom: isoDateTimeSchema,
  validTo: isoDateTimeSchema.nullable(),
  version: ruleVersionSchema,
  workspaceScope: z.enum(['CURRENT_WORKSPACE']),
});

export type AIUseCase = z.infer<typeof aiUseCaseSchema>;

export const aiProviderSchema = z.object({
  code: z.string().min(1),
  contractReference: z.string().min(1),
  exitPlan: z.string().min(1),
  privacyAssessment: z.enum(['PASSED_SYNTHETIC_ONLY', 'PENDING_INDEPENDENT_REVIEW']),
  region: z.string().min(1),
  retention: z.string().min(1),
  safetyAssessment: z.enum(['PASSED_SYNTHETIC_ONLY', 'PENDING_INDEPENDENT_REVIEW']),
  status: aiProviderStatusSchema,
  subprocessors: z.array(z.string().min(1)),
  trainingPolicy: z.string().min(1),
});

export type AIProvider = z.infer<typeof aiProviderSchema>;

export const aiModelDefinitionSchema = z.object({
  code: z.string().min(1),
  costPerInputMillionTokens: decimalStringSchema,
  costPerOutputMillionTokens: decimalStringSchema,
  evaluationReference: z.string().min(1),
  inputTokenLimit: z.number().int().positive(),
  maxDataClassification: dataClassificationSchema,
  outputTokenLimit: z.number().int().positive(),
  providerCode: z.string().min(1),
  status: aiModelStatusSchema,
  structuredOutput: z.boolean(),
  supportedUseCases: z.array(aiUseCaseIdSchema),
  toolSupport: z.boolean(),
});

export type AIModelDefinition = z.infer<typeof aiModelDefinitionSchema>;

export const aiModelVersionSchema = z.object({
  modelCode: z.string().min(1),
  providerCode: z.string().min(1),
  releasedAt: isoDateTimeSchema,
  status: aiModelStatusSchema,
  version: z.string().min(1),
});

export const promptTemplateSchema = z.object({
  id: z.string().min(1),
  allowedSurfaces: z.array(aiSurfaceSchema),
  contentHash: z.string().min(1),
  instructions: z.array(z.string().min(1)),
  outputSchemaId: z.string().min(1),
  promptFamily: z.string().min(1),
  retentionClass: retentionClassSchema,
  status: z.enum(['APPROVED', 'EVALUATION', 'SUSPENDED']),
  version: ruleVersionSchema,
});

export const retrievalPolicySchema = z.object({
  allowRawRecords: z.literal(false),
  allowedClassifications: z.array(dataClassificationSchema),
  evidenceLimit: z.number().int().positive(),
  id: z.string().min(1),
  maxDocuments: z.number().int().nonnegative(),
  maxSnapshots: z.number().int().positive(),
  metadataFiltersRequired: z.literal(true),
  namespaceTemplate: z.literal('{tenantId}:{workspaceId}:{useCaseId}'),
  pipelineVersion: z.literal(aiRetrievalPipelineVersion),
  readinessAllowed: z.array(analyticsReadinessStatusSchema),
  version: ruleVersionSchema,
});

export const outputSchemaDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  schemaVersion: ruleVersionSchema,
  structuredOutputRequired: z.literal(true),
});

export const evidencePolicySchema = z.object({
  id: z.string().min(1),
  everyFactRequiresEvidence: z.literal(true),
  everyRecommendationRequiresEvidence: z.literal(true),
  foreignEvidenceDenied: z.literal(true),
  hiddenLimitationsDenied: z.literal(true),
  version: ruleVersionSchema,
});

export const refusalPolicySchema = z.object({
  id: z.string().min(1),
  allowedCodes: z.array(aiRefusalCodeSchema),
  refusalIsNotGenericError: z.literal(true),
  version: ruleVersionSchema,
});

export const costPolicySchema = z.object({
  id: z.string().min(1),
  hardRunLimit: decimalStringSchema,
  perUserDailyLimit: decimalStringSchema,
  trackCostPerRun: z.literal(true),
  version: ruleVersionSchema,
});

export const retentionPolicySchema = z.object({
  id: z.string().min(1),
  cacheTtl: z.string().min(1),
  contextManifestRetention: retentionClassSchema,
  deletionPropagationRequired: z.literal(true),
  memoryRetention: retentionClassSchema,
  modelRunRetention: retentionClassSchema,
  providerTrainingAllowed: z.literal(false),
  threadRetention: retentionClassSchema,
  version: ruleVersionSchema,
});

export const contextManifestSchema = z.object({
  classifications: z.array(dataClassificationSchema),
  datasetReferences: z.array(datasetIdSchema),
  evidenceReferences: z.array(aiEvidenceIdSchema),
  excludedCategories: z.array(z.string().min(1)),
  generatedAt: isoDateTimeSchema,
  id: contextManifestIdSchema,
  integrityHash: z.string().min(1),
  metricSnapshotIds: z.array(metricSnapshotIdSchema),
  purpose: z.string().min(1),
  readinessSummary: z.array(analyticsReadinessStatusSchema),
  redactions: z.array(z.string().min(1)),
  retrievalPolicyVersion: ruleVersionSchema,
  tenantId: tenantIdSchema,
  timeRange: periodSchema,
  useCaseId: aiUseCaseIdSchema,
  userId: userIdSchema,
  workspaceId: workspaceIdSchema,
});

export type ContextManifest = z.infer<typeof contextManifestSchema>;

export const aiEvidenceSchema = z.object({
  classification: dataClassificationSchema,
  createdAt: isoDateTimeSchema,
  id: aiEvidenceIdSchema,
  integrityHash: z.string().min(1),
  limitations: z.array(z.string().min(1)),
  period: periodSchema,
  readiness: analyticsReadinessStatusSchema,
  scope: analyticsScopeSchema,
  snapshotId: metricSnapshotIdSchema,
  sourceObjectId: z.string().min(1),
  sourceObjectType: z.enum(['MetricSnapshot', 'TrustDrawer', 'Lineage', 'Reconciliation']),
  sourceVersion: ruleVersionSchema,
  structuredFacts: z.array(z.string().min(1)),
  tenantId: tenantIdSchema,
  type: z.enum(['metric_snapshot', 'lineage', 'readiness', 'reconciliation']),
  workspaceId: workspaceIdSchema,
});

export type AIEvidence = z.infer<typeof aiEvidenceSchema>;

export const aiThreadSchema = z.object({
  createdAt: isoDateTimeSchema,
  deletedAt: isoDateTimeSchema.nullable(),
  id: aiThreadIdSchema,
  memoryPolicyId: z.string().min(1),
  retentionPolicyId: z.string().min(1),
  status: aiThreadStatusSchema,
  surface: aiSurfaceSchema,
  tenantId: tenantIdSchema,
  updatedAt: isoDateTimeSchema,
  useCaseId: aiUseCaseIdSchema,
  userId: userIdSchema,
  version: ruleVersionSchema,
  workspaceId: workspaceIdSchema,
});

export type AIThread = z.infer<typeof aiThreadSchema>;

export const aiMessageSchema = z.object({
  classification: dataClassificationSchema,
  createdAt: isoDateTimeSchema,
  evidenceReferences: z.array(aiEvidenceIdSchema),
  id: aiMessageIdSchema,
  limitations: z.array(z.string().min(1)),
  retentionClass: retentionClassSchema,
  role: aiMessageRoleSchema,
  sanitizedContent: z.string().min(1),
  tenantId: tenantIdSchema,
  threadId: aiThreadIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AIMessage = z.infer<typeof aiMessageSchema>;

export const aiUsageSchema = z.object({
  completionTokens: z.number().int().nonnegative(),
  promptTokens: z.number().int().nonnegative(),
  toolCalls: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export const modelRunSchema = z.object({
  auditReference: z.string().min(1),
  contextManifestId: contextManifestIdSchema,
  cost: decimalStringSchema,
  errorClass: z.string().min(1).nullable(),
  finishedAt: isoDateTimeSchema.nullable(),
  id: modelRunIdSchema,
  latency: z.number().int().nonnegative(),
  modelCode: z.string().min(1),
  modelVersion: z.string().min(1),
  outputSchemaVersion: ruleVersionSchema,
  promptTemplateVersion: ruleVersionSchema,
  providerCode: z.string().min(1),
  refusalCode: aiRefusalCodeSchema.nullable(),
  retrievalPolicyVersion: ruleVersionSchema,
  startedAt: isoDateTimeSchema,
  status: aiRunStatusSchema,
  tenantId: tenantIdSchema,
  threadId: aiThreadIdSchema,
  usage: aiUsageSchema,
  useCaseId: aiUseCaseIdSchema,
  userId: userIdSchema,
  workspaceId: workspaceIdSchema,
});

export type ModelRun = z.infer<typeof modelRunSchema>;

export const aiAnswerPartSchema = z.object({
  content: z.string().min(1),
  evidenceReferences: z.array(aiEvidenceIdSchema),
  kind: aiResponsePartKindSchema,
  label: z.string().min(1),
});

export const aiConfidenceSchema = z.object({
  label: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  meaning: z.string().min(1),
});

export const aiRefusalSchema = z.object({
  auditReference: z.string().min(1),
  category: aiRefusalCodeSchema,
  missingRequirements: z.array(z.string().min(1)),
  nextActions: z.array(z.string().min(1)),
  safeMessage: z.string().min(1),
  scope: aiContextSchema,
});

export type AIRefusal = z.infer<typeof aiRefusalSchema>;

export const aiStructuredOutputSchema = z.object({
  allowedDecisionTypes: z.array(z.string().min(1)),
  assumptions: z.array(z.string().min(1)),
  blockedDecisionTypes: z.array(z.string().min(1)),
  confidence: aiConfidenceSchema,
  evidenceReferences: z.array(aiEvidenceIdSchema),
  facts: z.array(aiAnswerPartSchema),
  generatedAt: isoDateTimeSchema,
  hypotheses: z.array(aiAnswerPartSchema),
  humanOversightLevel: humanOversightLevelSchema,
  interpretations: z.array(aiAnswerPartSchema),
  limitations: z.array(z.string().min(1)),
  missingData: z.array(z.string().min(1)),
  modelReference: z.string().min(1),
  period: periodSchema,
  provenanceReference: z.string().min(1),
  readiness: analyticsReadinessStatusSchema,
  recommendations: z.array(aiAnswerPartSchema),
  refusal: aiRefusalSchema.nullable(),
  runId: modelRunIdSchema,
  scope: aiContextSchema,
  status: aiRuntimeStateSchema,
  suggestedNextSteps: z.array(z.string().min(1)),
  summary: z.string().min(1),
  useCaseId: aiUseCaseIdSchema,
});

export type AIStructuredOutput = z.infer<typeof aiStructuredOutputSchema>;

export const observationSchema = z.object({
  businessImpact: z.string().min(1),
  createdAt: isoDateTimeSchema,
  description: z.string().min(1),
  evidenceIds: z.array(aiEvidenceIdSchema),
  expiresAt: isoDateTimeSchema,
  id: observationIdSchema,
  limitations: z.array(z.string().min(1)),
  metricSnapshotIds: z.array(metricSnapshotIdSchema),
  owner: z.string().min(1),
  period: periodSchema,
  readiness: analyticsReadinessStatusSchema,
  scope: analyticsScopeSchema,
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  source: z.enum(['DETERMINISTIC', 'AI']),
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'EXPIRED', 'INVALIDATED']),
  tenantId: tenantIdSchema,
  title: z.string().min(1),
  type: z.enum(['KPI_CHANGE', 'READINESS_LIMITATION', 'DATA_QUALITY', 'ANOMALY']),
  workspaceId: workspaceIdSchema,
});

export type Observation = z.infer<typeof observationSchema>;

export const insightSchema = z.object({
  acknowledgedAt: isoDateTimeSchema.nullable(),
  evidenceIds: z.array(aiEvidenceIdSchema),
  fact: z.string().min(1),
  id: insightIdSchema,
  interpretation: z.string().min(1),
  limitations: z.array(z.string().min(1)),
  modelRunId: modelRunIdSchema.nullable(),
  observationId: observationIdSchema,
  status: z.enum([
    'OPEN',
    'ACKNOWLEDGED',
    'DISMISSED',
    'CONVERTED_TO_RECOMMENDATION',
    'EXPIRED',
    'INVALIDATED',
  ]),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type Insight = z.infer<typeof insightSchema>;

export const recommendationSchema = z.object({
  assumptions: z.array(z.string().min(1)),
  content: z.string().min(1),
  cost: decimalStringSchema,
  decisionDeadline: isoDateTimeSchema,
  evidenceIds: z.array(aiEvidenceIdSchema),
  expectedImpact: z.string().min(1),
  expiresAt: isoDateTimeSchema,
  humanOversightLevel: humanOversightLevelSchema,
  id: recommendationIdSchema,
  insightId: insightIdSchema,
  limitations: z.array(z.string().min(1)),
  metricDefinitionVersions: z.array(ruleVersionSchema),
  metricSnapshotIds: z.array(metricSnapshotIdSchema),
  modelRunId: modelRunIdSchema.nullable(),
  owner: z.string().min(1),
  purpose: z.string().min(1),
  readiness: analyticsReadinessStatusSchema,
  requiredApprover: z.string().min(1),
  requiredCapability: z.custom<Capability>(),
  risks: z.array(z.string().min(1)),
  scope: analyticsScopeSchema,
  status: z.enum([
    'DRAFT',
    'PROPOSED',
    'IN_REVIEW',
    'ACCEPTED',
    'REJECTED',
    'DEFERRED',
    'EXPIRED',
    'INVALIDATED',
  ]),
  tenantId: tenantIdSchema,
  version: ruleVersionSchema,
  workspaceId: workspaceIdSchema,
});

export type Recommendation = z.infer<typeof recommendationSchema>;

export const decisionSchema = z.object({
  decidedAt: isoDateTimeSchema,
  decidedBy: userIdSchema,
  expectedRecommendationVersion: ruleVersionSchema,
  id: decisionIdSchema,
  outcome: z.enum(['ACCEPT', 'REJECT', 'DEFER', 'NEED_MORE_DATA', 'MODIFY']),
  owner: z.string().min(1),
  rationale: z.string().min(1),
  readinessAtDecision: analyticsReadinessStatusSchema,
  recommendationId: recommendationIdSchema,
  scopeHash: z.string().min(1),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type Decision = z.infer<typeof decisionSchema>;

export const actionSchema = z.object({
  blockers: z.array(z.string().min(1)),
  comments: z.array(z.string().min(1)),
  deadline: isoDateTimeSchema,
  expectedOutcome: z.string().min(1),
  history: z.array(z.string().min(1)),
  id: actionIdSchema,
  outcomePlan: z.string().min(1),
  owner: z.string().min(1),
  progress: z.number().int().min(0).max(100),
  risk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  scope: analyticsScopeSchema,
  sourceDecisionId: decisionIdSchema,
  status: z.enum([
    'PROPOSED',
    'APPROVED',
    'EXECUTING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED',
    'COMPENSATED',
    'PROHIBITED',
  ]),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AIAction = z.infer<typeof actionSchema>;

export const actionProposalSchema = z.object({
  approvedAt: isoDateTimeSchema.nullable(),
  approvedBy: userIdSchema.nullable(),
  compensatingAction: z.string().min(1),
  evidenceIds: z.array(aiEvidenceIdSchema),
  expectedImpact: z.string().min(1),
  expiresAt: isoDateTimeSchema,
  id: actionProposalIdSchema,
  idempotencyKey: z.string().min(1),
  parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  reauthRequired: z.boolean(),
  recommendationId: recommendationIdSchema,
  requiredApproval: humanOversightLevelSchema,
  requiredCapability: z.custom<Capability>(),
  risks: z.array(z.string().min(1)),
  status: z.enum([
    'DRAFT',
    'PROPOSED',
    'APPROVED',
    'REJECTED',
    'EXECUTING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED',
    'COMPENSATED',
    'PROHIBITED',
  ]),
  targetId: z.string().min(1),
  targetType: z.enum(['TASK', 'CAMPAIGN', 'MARKETPLACE_LISTING', 'REPORT', 'WORKSPACE_SETTING']),
  targetVersion: ruleVersionSchema,
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
  actionType: z.enum([
    'CREATE_TASK',
    'CREATE_REPORT_DRAFT',
    'PAYMENT',
    'CHANGE_ROLE',
    'DELETE_DATA',
    'CHANGE_SOURCE_AUTHORITY',
    'APPROVE_KPI',
    'LEGAL_ACTION',
  ]),
});

export type ActionProposal = z.infer<typeof actionProposalSchema>;

export const actionExecutionSchema = z.object({
  actionId: actionIdSchema,
  completedAt: isoDateTimeSchema.nullable(),
  errorClass: z.string().min(1).nullable(),
  id: actionExecutionIdSchema,
  idempotencyKey: z.string().min(1),
  proposalId: actionProposalIdSchema,
  revalidatedAt: isoDateTimeSchema,
  startedAt: isoDateTimeSchema,
  status: z.enum(['SUCCEEDED', 'FAILED', 'CANCELLED', 'COMPENSATED']),
  tenantId: tenantIdSchema,
  verification: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type ActionExecution = z.infer<typeof actionExecutionSchema>;

export const outcomeSchema = z.object({
  actionId: actionIdSchema,
  baselineKpi: analyticsMetricCodeSchema,
  baselinePeriod: periodSchema,
  beforeAfter: z.array(z.string().min(1)),
  confidence: aiConfidenceSchema,
  conclusion: z.string().min(1),
  confounders: z.array(z.string().min(1)),
  expectedEffect: z.string().min(1),
  id: outcomeIdSchema,
  measuredAt: isoDateTimeSchema,
  measurementPlan: z.string().min(1),
  resultAfterAction: z.string().min(1),
  tenantId: tenantIdSchema,
  valueReport: z.string().min(1),
  workspaceId: workspaceIdSchema,
});

export type Outcome = z.infer<typeof outcomeSchema>;

export const laboratoryExperimentSchema = z.object({
  allowedDatasetIds: z.array(datasetIdSchema),
  allowedMetricCodes: z.array(analyticsMetricCodeSchema),
  archivedAt: isoDateTimeSchema.nullable(),
  artifactIds: z.array(laboratoryArtifactIdSchema),
  contextGoal: z.string().min(1),
  createdAt: isoDateTimeSchema,
  createdBy: userIdSchema,
  id: laboratoryExperimentIdSchema,
  period: periodSchema,
  retentionPolicyId: z.string().min(1),
  runIds: z.array(modelRunIdSchema),
  status: z.enum(['DRAFT', 'RUNNING', 'ANSWERED', 'ARCHIVED', 'DELETION_PENDING']),
  tenantId: tenantIdSchema,
  useCaseId: aiUseCaseIdSchema,
  workspaceId: workspaceIdSchema,
});

export type LaboratoryExperiment = z.infer<typeof laboratoryExperimentSchema>;

export const gateS3RequirementSchema = z.object({
  approvalDecision: gateApprovalDecisionSchema,
  blockReason: z.string().min(1).nullable(),
  criticality: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']),
  description: z.string().min(1),
  evidenceReferences: z.array(z.string().min(1)),
  lastAssessedAt: isoDateTimeSchema,
  owner: z.string().min(1),
  requirementId: gateRequirementIdSchema,
  reviewer: z.string().min(1),
  status: gateRequirementStatusSchema,
  version: ruleVersionSchema,
});

export type GateS3Requirement = z.infer<typeof gateS3RequirementSchema>;

export const gateS3ReportSchema = z.object({
  gateSatisfied: z.boolean(),
  productionAIBlocked: z.boolean(),
  requirements: z.array(gateS3RequirementSchema),
  version: z.literal(aiGateS3Version),
});

export type GateS3Report = z.infer<typeof gateS3ReportSchema>;

export const aiSettingsSchema = z.object({
  allowedModelCodes: z.array(z.string().min(1)),
  allowedUseCaseIds: z.array(aiUseCaseIdSchema),
  dataUseNotice: z.string().min(1),
  featureFlags: z.record(z.string(), z.boolean()),
  humanOversightLevel: humanOversightLevelSchema,
  memoryEnabled: z.boolean(),
  retentionPolicyId: z.string().min(1),
  tenantId: tenantIdSchema,
  userCostLimit: decimalStringSchema,
  workspaceAIEnabled: z.boolean(),
  workspaceId: workspaceIdSchema,
});

export type AISettings = z.infer<typeof aiSettingsSchema>;

export const aiHistorySchema = z.object({
  actionProposalIds: z.array(actionProposalIdSchema),
  cost: decimalStringSchema,
  decisionIds: z.array(decisionIdSchema),
  deletionStatus: z.enum(['NONE', 'PENDING', 'VERIFIED']),
  evidenceIds: z.array(aiEvidenceIdSchema),
  recommendationIds: z.array(recommendationIdSchema),
  retentionStatus: z.enum(['ACTIVE', 'ARCHIVED', 'EXPIRED']),
  runIds: z.array(modelRunIdSchema),
  threadIds: z.array(aiThreadIdSchema),
});

export type AIHistory = z.infer<typeof aiHistorySchema>;

export const aiGovernanceSchema = z.object({
  auditCount: z.number().int().nonnegative(),
  costByUseCase: z.record(z.string(), decimalStringSchema),
  gateS3: gateS3ReportSchema,
  incidents: z.array(aiIncidentIdSchema),
  modelRegistry: z.array(aiModelDefinitionSchema),
  providerRegistry: z.array(aiProviderSchema),
  useCaseRegister: z.array(aiUseCaseSchema),
});

export type AIGovernance = z.infer<typeof aiGovernanceSchema>;

export const aiEvaluationCaseSchema = z.object({
  expectedRefusal: aiRefusalCodeSchema.nullable(),
  id: z.string().min(1),
  prompt: z.string().min(1),
  scenario: z.enum([
    'complete_data',
    'partial',
    'stale',
    'no_data',
    'confirmed_zero',
    'invalid_kpi',
    'blocked_kpi',
    'conflict',
    'multiple_sources',
    'definition_change',
    'out_of_scope',
    'foreign_data',
    'secret_request',
    'prompt_injection',
    'indirect_injection',
    'retrieval_poisoning',
    'disallowed_tool',
    'payment',
    'role_change',
    'delete_data',
    'provider_timeout',
    'provider_error',
    'cost_limit',
  ]),
});

export const aiEvaluationRunSchema = z.object({
  costPerRun: decimalStringSchema,
  correctness: z.number().min(0).max(1),
  evidenceCoverage: z.number().min(0).max(1),
  evidencePrecision: z.number().min(0).max(1),
  hallucinationRate: z.number().min(0).max(1),
  humanAcceptanceRate: z.number().min(0).max(1),
  humanCorrectionRate: z.number().min(0).max(1),
  id: evaluationRunIdSchema,
  latency: z.number().int().nonnegative(),
  limitationCompleteness: z.number().min(0).max(1),
  refusalCorrectness: z.number().min(0).max(1),
  secretLeakageRate: z.literal(0),
  stability: z.number().min(0).max(1),
  tenantLeakageRate: z.literal(0),
  toolPolicyViolationRate: z.literal(0),
  version: z.literal(aiEvaluationSuiteVersion),
  workspaceLeakageRate: z.literal(0),
});

export type AIEvaluationRun = z.infer<typeof aiEvaluationRunSchema>;

export const aiRetentionInventorySchema = z.object({
  cache: retentionClassSchema,
  contextManifest: retentionClassSchema,
  evidence: retentionClassSchema,
  experiments: retentionClassSchema,
  insights: retentionClassSchema,
  memory: retentionClassSchema,
  modelRuns: retentionClassSchema,
  providerSideData: retentionClassSchema,
  recommendations: retentionClassSchema,
  threads: retentionClassSchema,
  vectorIndex: retentionClassSchema,
});

export type AIRetentionInventory = z.infer<typeof aiRetentionInventorySchema>;

export const aiDeletionRequestSchema = z.object({
  id: aiDeletionRequestIdSchema,
  propagationTargets: z.array(z.enum([
    'cache',
    'memory',
    'vector_index',
    'storage',
    'provider',
    'exports',
    'dependent_artifacts',
  ])),
  requestedAt: isoDateTimeSchema,
  status: z.enum(['REQUESTED', 'PROPAGATED', 'VERIFIED']),
  tenantId: tenantIdSchema,
  workspaceId: workspaceIdSchema,
});

export type AIDeletionRequest = z.infer<typeof aiDeletionRequestSchema>;

export const aiProvenancePanelSchema = z.object({
  approver: z.string().min(1).nullable(),
  auditReference: z.string().min(1),
  contextSources: z.array(z.string().min(1)),
  cost: decimalStringSchema,
  datasetVersions: z.array(ruleVersionSchema),
  decisionOutcome: z.string().min(1).nullable(),
  generatedAt: isoDateTimeSchema,
  humanOversight: humanOversightLevelSchema,
  limitations: z.array(z.string().min(1)),
  metricSnapshotVersions: z.array(ruleVersionSchema),
  model: z.string().min(1),
  modelVersion: z.string().min(1),
  promptVersion: ruleVersionSchema,
  provider: z.string().min(1),
  readiness: z.array(analyticsReadinessStatusSchema),
  retentionStatus: z.enum(['ACTIVE', 'ARCHIVED', 'EXPIRED']),
  retrievalPolicyVersion: ruleVersionSchema,
  roleOfAI: z.string().min(1),
  usage: aiUsageSchema,
  useCaseId: aiUseCaseIdSchema,
});

export type AIProvenancePanel = z.infer<typeof aiProvenancePanelSchema>;

export const aiInteractionResultSchema = z.object({
  contextManifest: contextManifestSchema,
  evidence: z.array(aiEvidenceSchema),
  message: aiMessageSchema,
  output: aiStructuredOutputSchema,
  provenance: aiProvenancePanelSchema,
  run: modelRunSchema,
  thread: aiThreadSchema,
});

export type AIInteractionResult = z.infer<typeof aiInteractionResultSchema>;

export const aiApiRoutes = [
  'GET /v1/ai/use-cases',
  'GET /v1/ai/use-cases/{useCaseId}',
  'POST /v1/ai/threads',
  'GET /v1/ai/threads',
  'GET /v1/ai/threads/{threadId}',
  'DELETE /v1/ai/threads/{threadId}',
  'POST /v1/ai/threads/{threadId}/messages',
  'GET /v1/ai/runs/{runId}',
  'POST /v1/ai/runs/{runId}/cancel',
  'GET /v1/ai/runs/{runId}/evidence',
  'GET /v1/ai/runs/{runId}/provenance',
  'POST /v1/ai/laboratory/experiments',
  'GET /v1/ai/laboratory/experiments',
  'GET /v1/ai/laboratory/experiments/{experimentId}',
  'POST /v1/ai/laboratory/experiments/{experimentId}/runs',
  'POST /v1/ai/laboratory/runs/{runId}/compare',
  'POST /v1/ai/laboratory/runs/{runId}/export',
  'GET /v1/observations',
  'GET /v1/observations/{observationId}',
  'GET /v1/insights',
  'GET /v1/insights/{insightId}',
  'POST /v1/insights/{insightId}/dismiss',
  'GET /v1/recommendations',
  'GET /v1/recommendations/{recommendationId}',
  'POST /v1/recommendations/{recommendationId}/decisions',
  'GET /v1/decisions',
  'GET /v1/decisions/{decisionId}',
  'GET /v1/actions',
  'GET /v1/actions/{actionId}',
  'POST /v1/actions/{actionId}/updates',
  'POST /v1/action-proposals',
  'POST /v1/action-proposals/{proposalId}/approve',
  'POST /v1/action-proposals/{proposalId}/reject',
  'POST /v1/action-proposals/{proposalId}/execute',
  'POST /v1/action-proposals/{proposalId}/cancel',
  'POST /v1/outcomes',
  'GET /v1/outcomes/{outcomeId}',
] as const;

type AIUseCaseBase = Omit<
  AIUseCase,
  'description' | 'id' | 'name' | 'purpose' | 'requiredMetricCodes' | 'targetSurface'
>;

const useCaseBase: AIUseCaseBase = {
  allowedAIRoles: ['assistant', 'analyst', 'drafting_agent'],
  allowedDataClassifications: ['CUSTOMER_CONFIDENTIAL'],
  allowedTools: ['metric_snapshot.read', 'evidence.read', 'recommendation.draft'],
  contextMinimizationPolicyId: 'context_min_workspace_metrics',
  costPolicyId: 'cost_policy_ai_mvp',
  evidencePolicyId: 'evidence_policy_fact_level',
  gateEvidenceReferences: ['docs/evidence/wave-5/gate-s3.md'],
  humanOversightLevel: 'HUMAN_REVIEW',
  maximumTimeRange: 'P90D',
  modelPolicyId: 'model_policy_synthetic_mvp',
  outputSchemaId: 'ai_structured_output_v1',
  owner: 'PapaData AI Governance',
  prohibitedBehaviors: [
    'permission_decision',
    'source_authority_decision',
    'payment_execution',
    'role_change',
    'secret_disclosure',
  ],
  providerPolicyId: 'provider_policy_synthetic_mvp',
  promptTemplateId: 'prompt_ai_structured_response',
  requiredCapabilities: [aiCapabilities.runAIAssistant],
  requiredDataScope: 'workspace',
  requiredDatasets: ['orders'],
  requiredEntitlements: [aiCapabilities.runAIAssistant],
  requiredReadiness: ['READY', 'PARTIAL', 'STALE'],
  retentionPolicyId: 'retention_policy_ai_mvp',
  retrievalPolicyId: 'retrieval_policy_workspace_metrics',
  reviewer: 'PapaData Security',
  status: 'APPROVED',
  systemPromptTemplateId: 'system_prompt_ai_guardrails',
  targetUsers: ['tenant_owner', 'workspace_admin', 'analyst'],
  tenantScope: 'CURRENT_TENANT',
  validFrom: '2026-07-20T00:00:00.000Z',
  validTo: null,
  version: 'ai-use-case.2026-07',
  workspaceScope: 'CURRENT_WORKSPACE',
};

export const approvedAIUseCases = [
  {
    ...useCaseBase,
    description: 'Wyjaśnia zatwierdzone KPI wraz z readiness i evidence.',
    id: asAIUseCaseId('uc_contextual_kpi_explanation'),
    name: 'Contextual KPI explanation',
    purpose: 'Wyjaśnienie metryki bez zmiany danych.',
    requiredMetricCodes: ['order_count', 'gross_revenue', 'refund_value', 'net_revenue'],
    targetSurface: ['kpi_detail', 'command_center'],
  },
  {
    ...useCaseBase,
    description: 'Podsumowuje Command Center na podstawie MetricSnapshot.',
    id: asAIUseCaseId('uc_command_center_analysis'),
    name: 'Command Center analysis',
    purpose: 'Analiza aktualnego widoku decyzyjnego.',
    requiredMetricCodes: ['order_count', 'gross_revenue', 'net_revenue'],
    targetSurface: ['command_center'],
  },
  {
    ...useCaseBase,
    description: 'Interpretuje anomalie bez autonomicznej decyzji.',
    id: asAIUseCaseId('uc_anomaly_interpretation'),
    name: 'Anomaly interpretation',
    purpose: 'Hipotezy przyczyn zmian KPI.',
    requiredMetricCodes: ['order_count', 'gross_revenue'],
    targetSurface: ['command_center', 'orders'],
  },
  {
    ...useCaseBase,
    description: 'Wyjaśnia problemy jakości danych i ich wpływ.',
    id: asAIUseCaseId('uc_data_quality_explanation'),
    name: 'Data-quality explanation',
    purpose: 'Tłumaczenie ograniczeń readiness.',
    requiredMetricCodes: ['order_count'],
    targetSurface: ['quality_issue', 'dataset_detail'],
  },
  {
    ...useCaseBase,
    description: 'Analizuje kampanie, gdy dane paid są zatwierdzone.',
    id: asAIUseCaseId('uc_campaign_analysis'),
    name: 'Campaign analysis',
    purpose: 'Analiza paid campaigns w bramkowanym zakresie.',
    requiredMetricCodes: ['advertising_spend', 'roas'],
    targetSurface: ['paid_campaigns'],
  },
  {
    ...useCaseBase,
    description: 'Analizuje marketplace, gdy fees i kanały są gotowe.',
    id: asAIUseCaseId('uc_marketplace_analysis'),
    name: 'Marketplace analysis',
    purpose: 'Interpretacja marketplace bez zmiany ofert.',
    requiredMetricCodes: ['marketplace_fees', 'revenue_after_marketplace_fees'],
    targetSurface: ['marketplace'],
  },
  {
    ...useCaseBase,
    description: 'Wyjaśnia profitability po gotowości kosztów.',
    id: asAIUseCaseId('uc_profitability_explanation'),
    name: 'Profitability explanation',
    purpose: 'Wyjaśnienie marży z ograniczeniami.',
    requiredMetricCodes: ['contribution_margin'],
    targetSurface: ['profitability'],
  },
  {
    ...useCaseBase,
    description: 'Przygotowuje draft rekomendacji do decyzji człowieka.',
    id: asAIUseCaseId('uc_recommendation_drafting'),
    name: 'Recommendation drafting',
    purpose: 'Draft rekomendacji z evidence i ryzykami.',
    requiredMetricCodes: ['order_count', 'net_revenue'],
    targetSurface: ['recommendation_detail', 'command_center'],
  },
  {
    ...useCaseBase,
    description: 'Pomaga udokumentować decyzję człowieka.',
    id: asAIUseCaseId('uc_decision_documentation'),
    name: 'Decision documentation',
    purpose: 'Dokumentacja rationale bez podejmowania decyzji.',
    requiredMetricCodes: ['order_count', 'net_revenue'],
    targetSurface: ['decision_detail'],
  },
  {
    ...useCaseBase,
    description: 'Kontrolowane eksperymenty w Laboratorium AI.',
    id: asAIUseCaseId('uc_laboratory_analysis'),
    name: 'Laboratory analysis',
    purpose: 'Eksperyment analityczny na dopuszczonych datasetach i KPI.',
    requiredCapabilities: [aiCapabilities.runAILaboratory],
    requiredEntitlements: [aiCapabilities.runAILaboratory],
    requiredMetricCodes: ['order_count', 'gross_revenue', 'net_revenue'],
    targetSurface: ['ai_laboratory'],
  },
  {
    ...useCaseBase,
    allowedTools: ['action_proposal.preview', 'permission.revalidate'],
    description: 'Generuje kontrolowaną propozycję działania.',
    humanOversightLevel: 'REAUTH_AND_APPROVAL',
    id: asAIUseCaseId('uc_action_proposal_generation'),
    name: 'Action Proposal generation',
    purpose: 'Propozycja działania z approval i rewalidacją.',
    requiredCapabilities: [aiCapabilities.createActionProposal],
    requiredEntitlements: [aiCapabilities.createActionProposal],
    requiredMetricCodes: ['order_count', 'net_revenue'],
    targetSurface: ['recommendation_detail', 'decision_detail', 'action_detail'],
  },
] satisfies AIUseCase[];

export const aiProviderRegistry = [
  {
    code: 'papadata_local_synthetic',
    contractReference: 'docs/architecture/ai-gateway.md#local-synthetic-provider',
    exitPlan: 'Provider jest lokalnym adapterem CI i nie przechowuje danych poza procesem.',
    privacyAssessment: 'PASSED_SYNTHETIC_ONLY',
    region: 'local-ci',
    retention: 'Brak retencji provider-side.',
    safetyAssessment: 'PASSED_SYNTHETIC_ONLY',
    status: 'APPROVED_FOR_SYNTHETIC',
    subprocessors: [],
    trainingPolicy: 'Dane klienta nie są używane do treningu.',
  },
  {
    code: 'external_llm_placeholder',
    contractReference: 'docs/architecture/ai-gateway.md#production-provider-gate',
    exitPlan: 'Wymaga planu wyjścia przed produkcją.',
    privacyAssessment: 'PENDING_INDEPENDENT_REVIEW',
    region: 'not-enabled',
    retention: 'Zablokowane do Gate S3.',
    safetyAssessment: 'PENDING_INDEPENDENT_REVIEW',
    status: 'EVALUATION',
    subprocessors: ['pending-review'],
    trainingPolicy: 'Zablokowane bez osobnej decyzji.',
  },
] satisfies AIProvider[];

export const aiModelRegistry = [
  {
    code: 'papadata_structured_synthetic_v1',
    costPerInputMillionTokens: '0.0000',
    costPerOutputMillionTokens: '0.0000',
    evaluationReference: 'docs/evaluations/evaluation-results.md',
    inputTokenLimit: 16_000,
    maxDataClassification: 'CUSTOMER_CONFIDENTIAL',
    outputTokenLimit: 4_000,
    providerCode: 'papadata_local_synthetic',
    status: 'APPROVED_FOR_SYNTHETIC',
    structuredOutput: true,
    supportedUseCases: approvedAIUseCases.map((useCase) => useCase.id),
    toolSupport: true,
  },
  {
    code: 'production_model_pending_gate_s3',
    costPerInputMillionTokens: '0.0000',
    costPerOutputMillionTokens: '0.0000',
    evaluationReference: 'docs/evaluations/evaluation-results.md#blocked-production-model',
    inputTokenLimit: 1,
    maxDataClassification: 'CUSTOMER_CONFIDENTIAL',
    outputTokenLimit: 1,
    providerCode: 'external_llm_placeholder',
    status: 'EVALUATION',
    structuredOutput: true,
    supportedUseCases: [],
    toolSupport: false,
  },
] satisfies AIModelDefinition[];

export const aiRouteSet = new Set<string>(aiApiRoutes);
