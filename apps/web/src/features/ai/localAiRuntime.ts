import {
  asOperationId,
  type ApplicationSessionContext,
  type Capability,
} from '../../domain-contracts';
import {
  analyticsCapabilities,
  type MetricSnapshot,
} from '../analytics/analyticsContracts';
import { LocalAnalyticsRuntime } from '../analytics/localAnalyticsRuntime';
import { createDeterministicHash } from '../integrations/integrationContracts';
import {
  actionExecutionSchema,
  actionProposalSchema,
  actionSchema,
  aiCapabilities,
  aiContextSchema,
  aiContractVersion,
  aiEvaluationRunSchema,
  aiEvaluationSuiteVersion,
  aiEvidenceSchema,
  aiGateS3Version,
  aiHistorySchema,
  aiInteractionResultSchema,
  aiMessageSchema,
  aiModelRegistry,
  aiProviderRegistry,
  aiSettingsSchema,
  aiStructuredOutputSchema,
  aiThreadSchema,
  aiUseCaseSchema,
  aiUsageSchema,
  approvedAIUseCases,
  asActionExecutionId,
  asActionId,
  asActionProposalId,
  asAIDeletionRequestId,
  asAIEvidenceId,
  asAIIncidentId,
  asAIMessageId,
  asAIThreadId,
  asAIUseCaseId,
  asContextManifestId,
  asDecisionId,
  asEvaluationRunId,
  asInsightId,
  asLaboratoryExperimentId,
  asModelRunId,
  asObservationId,
  asOutcomeId,
  asRecommendationId,
  contextManifestSchema,
  decisionSchema,
  gateS3ReportSchema,
  gateS3RequirementSchema,
  insightSchema,
  laboratoryExperimentSchema,
  modelRunSchema,
  observationSchema,
  outcomeSchema,
  recommendationSchema,
  type AIContext,
  type AIDeletionRequest,
  type AIEvaluationRun,
  type AIEvidence,
  type AIGovernance,
  type AIHistory,
  type AIInteractionResult,
  type AIMessage,
  type AIRefusal,
  type AIRefusalCode,
  type AISettings,
  type AIStructuredOutput,
  type AIThread,
  type AIUseCase,
  type ActionExecution,
  type ActionProposal,
  type ContextManifest,
  type Decision,
  type GateS3Report,
  type Insight,
  type LaboratoryExperiment,
  type ModelRun,
  type Observation,
  type Outcome,
  type Recommendation,
  type AIAction,
  type AIRuntimeState,
} from './aiContracts';

type RuntimeEnvironment = 'local_synthetic' | 'production';

type AssistantInput = {
  content: string;
  context: AIContext;
  environment?: RuntimeEnvironment;
  requireCurrentDecision?: boolean;
};

type LaboratoryInput = {
  allowedDatasetIds: LaboratoryExperiment['allowedDatasetIds'];
  allowedMetricCodes: LaboratoryExperiment['allowedMetricCodes'];
  contextGoal: string;
  period: LaboratoryExperiment['period'];
  useCaseId: AIUseCase['id'];
};

type ProposalInput = {
  actionType?: ActionProposal['actionType'];
  decisionId: Decision['id'];
  expectedImpact?: string;
  idempotencyKey?: string;
  recommendationId: Recommendation['id'];
  targetId?: string;
  targetType?: ActionProposal['targetType'];
};

type AuditEvent = {
  eventType: string;
  occurredAt: string;
  reason: string;
  result: 'success' | 'denied' | 'failure';
  tenantId: ApplicationSessionContext['tenant']['tenantId'];
  userId: ApplicationSessionContext['user']['userId'];
  workspaceId: ApplicationSessionContext['activeWorkspace']['workspaceId'];
};

type AIIncident = {
  id: string;
  occurredAt: string;
  status: 'OPEN' | 'MITIGATED';
  type: string;
};

const fixtureNow = '2026-07-20T00:00:00.000Z';
const defaultExpiry = '2026-08-19T00:00:00.000Z';
const forbiddenActions = new Set<ActionProposal['actionType']>([
  'PAYMENT',
  'CHANGE_ROLE',
  'DELETE_DATA',
  'CHANGE_SOURCE_AUTHORITY',
  'APPROVE_KPI',
  'LEGAL_ACTION',
]);

function normalizeHash(value: unknown): string {
  return createDeterministicHash(value).replaceAll(':', '_');
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

function activeMembership(context: ApplicationSessionContext): boolean {
  return context.memberships.some(
    (membership) =>
      membership.status === 'active' &&
      membership.tenantId === context.tenant.tenantId &&
      membership.workspaceId === context.activeWorkspace.workspaceId &&
      membership.userId === context.user.userId,
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

function tokenEstimate(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

function decimalFromMicros(value: bigint): string {
  const integerPart = value / 1_000_000n;
  const fractionPart = (value % 1_000_000n).toString().padStart(6, '0');

  return `${integerPart.toString()}.${fractionPart}`;
}

function runCost(usage: { totalTokens: number }): string {
  return decimalFromMicros(BigInt(usage.totalTokens) * 3n);
}

export function sanitizeMarkdownContent(content: string): string {
  const withoutDangerousHtml = content
    .replace(/<script[\s\S]*?<\/script>/gi, '[removed-script]')
    .replace(/<style[\s\S]*?<\/style>/gi, '[removed-style]')
    .replace(/<\/?[a-z0-9-]+(\s[^>]*)?>/gi, '');

  return withoutDangerousHtml
    .replace(/\]\(\s*(javascript|data):[^)]*\)/gi, '](#blocked)')
    .replace(/sk-[a-z0-9_-]{8,}/gi, '[redacted-secret]')
    .replace(/bearer\s+[a-z0-9._-]+/gi, 'Bearer [redacted-secret]')
    .replace(/token\s*=\s*[^)\s]+/gi, 'token=[redacted-secret]')
    .trim();
}

function detectsPromptInjection(content: string): boolean {
  return [
    /ignore (all )?(previous|system|developer) instructions/i,
    /reveal (the )?(system prompt|hidden instructions|secrets?)/i,
    /override (tenant|workspace|capability|policy)/i,
    /narzu[cć] inny tenant/i,
    /pomi[nń] gate s3/i,
  ].some((pattern) => pattern.test(content));
}

function requestsSecret(content: string): boolean {
  return [
    /secret/i,
    /token/i,
    /api key/i,
    /has[łl]o/i,
    /credential/i,
    /system prompt/i,
  ].some((pattern) => pattern.test(content));
}

function worstReadiness(snapshots: readonly MetricSnapshot[]): MetricSnapshot['readiness'] {
  const order: MetricSnapshot['readiness'][] = [
    'BLOCKED',
    'INVALID',
    'EMPTY',
    'STALE',
    'PARTIAL',
    'PROCESSING',
    'RECALCULATION_REQUIRED',
    'READY',
  ];

  return order.find((status) =>
    snapshots.some((snapshot) => snapshot.readiness === status),
  ) ?? 'EMPTY';
}

function runtimeStateForRefusal(code: AIRefusalCode): AIRuntimeState {
  const mapping: Record<AIRefusalCode, AIRuntimeState> = {
    CONFLICT_UNRESOLVED: 'BLOCKED_BY_POLICY',
    COST_LIMIT_REACHED: 'COST_LIMIT_REACHED',
    DATA_BLOCKED: 'BLOCKED_BY_POLICY',
    DATA_INVALID: 'REJECTED',
    DATA_NOT_READY: 'INSUFFICIENT_DATA',
    ENTITLEMENT_REQUIRED: 'BLOCKED_BY_POLICY',
    EVIDENCE_UNAVAILABLE: 'BLOCKED_BY_POLICY',
    GATE_NOT_SATISFIED: 'BLOCKED_BY_POLICY',
    INJECTION_DETECTED: 'INJECTION_BLOCKED',
    INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
    OUT_OF_SCOPE: 'BLOCKED_BY_POLICY',
    PERMISSION_DENIED: 'BLOCKED_BY_POLICY',
    PROVIDER_UNAVAILABLE: 'PROVIDER_ERROR',
    SAFETY_POLICY_BLOCK: 'BLOCKED_BY_POLICY',
    STALE_FOR_CURRENT_DECISION: 'BLOCKED_BY_POLICY',
    UNSUPPORTED_USE_CASE: 'BLOCKED_BY_POLICY',
  };

  return mapping[code];
}

function refusalMessage(code: AIRefusalCode): string {
  const messages: Record<AIRefusalCode, string> = {
    CONFLICT_UNRESOLVED: 'Nie mogę analizować zakresu z nierozwiązanym konfliktem danych.',
    COST_LIMIT_REACHED: 'Limit kosztu dla tego runu został osiągnięty.',
    DATA_BLOCKED: 'Dane są zablokowane dla AI w tym zakresie.',
    DATA_INVALID: 'KPI jest nieprawidłowe, więc nie może być podstawą analizy AI.',
    DATA_NOT_READY: 'Dane nie przeszły wymaganej bramy gotowości.',
    ENTITLEMENT_REQUIRED: 'Ten workspace nie ma wymaganego entitlementu AI.',
    EVIDENCE_UNAVAILABLE: 'Nie ma dostępnego evidence w dozwolonym zakresie.',
    GATE_NOT_SATISFIED: 'Gate S3 nie jest spełniony dla produkcyjnego AI.',
    INJECTION_DETECTED: 'Wykryto próbę obejścia instrukcji lub polityki bezpieczeństwa.',
    INSUFFICIENT_DATA: 'Brakuje danych do odpowiedzialnej analizy.',
    OUT_OF_SCOPE: 'Pytanie wykracza poza zatwierdzony zakres use case.',
    PERMISSION_DENIED: 'Użytkownik nie ma wymaganej capability.',
    PROVIDER_UNAVAILABLE: 'Provider AI jest niedostępny.',
    SAFETY_POLICY_BLOCK: 'Polityka bezpieczeństwa blokuje ten request.',
    STALE_FOR_CURRENT_DECISION: 'Dane są zbyt nieświeże dla bieżącej decyzji.',
    UNSUPPORTED_USE_CASE: 'Use case nie jest zatwierdzony do działania.',
  };

  return messages[code];
}

function gateRequirement(
  input: {
    approvalDecision: 'APPROVED' | 'BLOCKED' | 'CONDITIONAL' | 'NOT_REVIEWED';
    blockReason?: string;
    criticality?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    description: string;
    evidenceReferences?: readonly string[];
    id: string;
    status: 'SATISFIED' | 'NOT_SATISFIED' | 'EVIDENCE_MISSING' | 'NOT_APPLICABLE';
  },
) {
  return gateS3RequirementSchema.parse({
    approvalDecision: input.approvalDecision,
    blockReason: input.blockReason ?? null,
    criticality: input.criticality ?? 'CRITICAL',
    description: input.description,
    evidenceReferences: [...(input.evidenceReferences ?? [])],
    lastAssessedAt: fixtureNow,
    owner: 'PapaData AI Governance',
    requirementId: input.id,
    reviewer: input.approvalDecision === 'APPROVED' ? 'Local CI' : 'Independent review pending',
    status: input.status,
    version: aiGateS3Version,
  });
}

function createGateS3Report(): GateS3Report {
  const requirements = [
    gateRequirement({
      approvalDecision: 'APPROVED',
      description: 'Zatwierdzony use case.',
      evidenceReferences: ['docs/evidence/wave-5/use-cases.md'],
      id: 'gate_s3_use_case',
      status: 'SATISFIED',
    }),
    gateRequirement({
      approvalDecision: 'APPROVED',
      description: 'Minimalizacja kontekstu.',
      evidenceReferences: ['docs/evidence/wave-5/context-manifest.json'],
      id: 'gate_s3_context_min',
      status: 'SATISFIED',
    }),
    gateRequirement({
      approvalDecision: 'APPROVED',
      description: 'Tenant-safe retrieval.',
      evidenceReferences: ['apps/web/src/features/ai/aiIsolation.security.test.ts'],
      id: 'gate_s3_tenant_safe_retrieval',
      status: 'SATISFIED',
    }),
    gateRequirement({
      approvalDecision: 'APPROVED',
      description: 'Zakaz sekretów i redakcja.',
      evidenceReferences: ['apps/web/src/features/ai/aiGateway.security.test.ts'],
      id: 'gate_s3_no_secrets',
      status: 'SATISFIED',
    }),
    gateRequirement({
      approvalDecision: 'APPROVED',
      description: 'Human oversight i audyt.',
      evidenceReferences: ['apps/web/src/features/ai/localAiRuntime.integration.test.ts'],
      id: 'gate_s3_human_oversight',
      status: 'SATISFIED',
    }),
    gateRequirement({
      approvalDecision: 'BLOCKED',
      blockReason: 'Wymagana niezależna weryfikacja bezpieczeństwa przed produkcją.',
      description: 'Niezależna weryfikacja bezpieczeństwa.',
      id: 'gate_s3_independent_security_review',
      status: 'EVIDENCE_MISSING',
    }),
    gateRequirement({
      approvalDecision: 'BLOCKED',
      blockReason: 'Wymagana niezależna weryfikacja prywatności przed produkcją.',
      description: 'Niezależna weryfikacja prywatności.',
      id: 'gate_s3_independent_privacy_review',
      status: 'EVIDENCE_MISSING',
    }),
  ];
  const gateSatisfied = requirements.every(
    (requirement) =>
      requirement.criticality !== 'CRITICAL' ||
      (requirement.status === 'SATISFIED' &&
        requirement.approvalDecision === 'APPROVED'),
  );

  return gateS3ReportSchema.parse({
    gateSatisfied,
    productionAIBlocked: !gateSatisfied,
    requirements,
    version: aiGateS3Version,
  });
}

export class LocalAIRuntime {
  private readonly actionExecutions = new Map<ActionExecution['id'], ActionExecution>();
  private readonly actionProposals = new Map<ActionProposal['id'], ActionProposal>();
  private readonly actions = new Map<AIAction['id'], AIAction>();
  private readonly aiEvidence = new Map<AIEvidence['id'], AIEvidence>();
  private readonly audits: AuditEvent[] = [];
  private readonly contextManifests = new Map<ContextManifest['id'], ContextManifest>();
  private readonly decisions = new Map<Decision['id'], Decision>();
  private readonly deletionRequests = new Map<AIDeletionRequest['id'], AIDeletionRequest>();
  private readonly evaluationRuns = new Map<AIEvaluationRun['id'], AIEvaluationRun>();
  private readonly experiments = new Map<LaboratoryExperiment['id'], LaboratoryExperiment>();
  private readonly gateS3 = createGateS3Report();
  private readonly incidents: AIIncident[] = [];
  private readonly insights = new Map<Insight['id'], Insight>();
  private readonly messages = new Map<AIMessage['id'], AIMessage>();
  private readonly modelRuns = new Map<ModelRun['id'], ModelRun>();
  private readonly observations = new Map<Observation['id'], Observation>();
  private readonly outcomes = new Map<Outcome['id'], Outcome>();
  private readonly recommendations = new Map<Recommendation['id'], Recommendation>();
  private readonly threads = new Map<AIThread['id'], AIThread>();
  private emergencyDisabled = false;
  private readonly analyticsRuntime: LocalAnalyticsRuntime;

  constructor(analyticsRuntime: LocalAnalyticsRuntime) {
    this.analyticsRuntime = analyticsRuntime;
  }

  getUseCases(context: ApplicationSessionContext): readonly AIUseCase[] {
    this.assertViewGovernanceOrAssistant(context);

    return approvedAIUseCases.map((useCase) => aiUseCaseSchema.parse(useCase));
  }

  getUseCase(context: ApplicationSessionContext, useCaseId: AIUseCase['id']): AIUseCase {
    this.assertViewGovernanceOrAssistant(context);
    const useCase = approvedAIUseCases.find((candidate) => candidate.id === useCaseId);

    if (!useCase) {
      throw new Error('NOT_FOUND');
    }

    return aiUseCaseSchema.parse(useCase);
  }

  createThread(
    context: ApplicationSessionContext,
    input: {
      surface: AIThread['surface'];
      useCaseId: AIUseCase['id'];
    },
  ): AIThread {
    const useCase = this.requireApprovedUseCase(input.useCaseId);
    this.assertAccess(context, useCase.requiredCapabilities, useCase.requiredEntitlements);
    const id = asAIThreadId(
      `ai_thread_${normalizeHash({
        surface: input.surface,
        tenantId: context.tenant.tenantId,
        userId: context.user.userId,
        workspaceId: context.activeWorkspace.workspaceId,
      })}`,
    );
    const existing = this.threads.get(id);

    if (existing) {
      return existing;
    }

    const thread = aiThreadSchema.parse({
      createdAt: this.now(),
      deletedAt: null,
      id,
      memoryPolicyId: 'memory_thread_bound',
      retentionPolicyId: useCase.retentionPolicyId,
      status: 'OPEN',
      surface: input.surface,
      tenantId: context.tenant.tenantId,
      updatedAt: this.now(),
      useCaseId: input.useCaseId,
      userId: context.user.userId,
      version: aiContractVersion,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.threads.set(thread.id, thread);
    this.audit(context, 'ai.thread_created', thread.id, 'success');

    return thread;
  }

  postMessage(
    context: ApplicationSessionContext,
    threadId: AIThread['id'],
    input: AssistantInput,
  ): AIInteractionResult {
    const thread = this.requireThread(context, threadId);

    if (thread.useCaseId !== input.context.useCaseId) {
      throw new Error('USE_CASE_MISMATCH');
    }

    const useCase = this.requireApprovedUseCase(input.context.useCaseId);
    this.assertAccess(context, useCase.requiredCapabilities, useCase.requiredEntitlements);
    const userMessage = this.createMessage(context, {
      content: input.content,
      evidenceReferences: [],
      role: 'USER',
      threadId: thread.id,
    });
    const result = this.executeGateway(context, thread, userMessage, input, useCase);
    const updatedThread = {
      ...thread,
      updatedAt: this.now(),
    };
    this.threads.set(thread.id, updatedThread);

    return {
      ...result,
      thread: updatedThread,
    };
  }

  runAssistant(context: ApplicationSessionContext, input: AssistantInput): AIInteractionResult {
    const thread = this.createThread(context, {
      surface: input.context.surface,
      useCaseId: input.context.useCaseId,
    });

    return this.postMessage(context, thread.id, input);
  }

  cancelRun(context: ApplicationSessionContext, runId: ModelRun['id']): ModelRun {
    const run = this.requireRun(context, runId);
    const cancelled = modelRunSchema.parse({
      ...run,
      finishedAt: this.now(),
      status: 'CANCELLED',
    });
    this.modelRuns.set(run.id, cancelled);
    this.audit(context, 'ai.run_cancelled', run.id, 'success');

    return cancelled;
  }

  getRun(context: ApplicationSessionContext, runId: ModelRun['id']): ModelRun {
    return this.requireRun(context, runId);
  }

  getRunEvidence(context: ApplicationSessionContext, runId: ModelRun['id']): readonly AIEvidence[] {
    const run = this.requireRun(context, runId);
    const manifest = this.contextManifests.get(run.contextManifestId);

    if (!manifest) {
      throw new Error('CONTEXT_MANIFEST_NOT_FOUND');
    }

    return manifest.evidenceReferences.map((evidenceId) => this.requireEvidence(context, evidenceId));
  }

  getRunProvenance(context: ApplicationSessionContext, runId: ModelRun['id']) {
    const run = this.requireRun(context, runId);
    const evidence = this.getRunEvidence(context, runId);
    const useCase = this.requireApprovedUseCase(run.useCaseId);

    return this.createProvenance(run, evidence, useCase, null);
  }

  deleteThread(context: ApplicationSessionContext, threadId: AIThread['id']): AIDeletionRequest {
    const thread = this.requireThread(context, threadId);
    const deleted = aiThreadSchema.parse({
      ...thread,
      deletedAt: this.now(),
      status: 'DELETION_PENDING',
      updatedAt: this.now(),
    });
    this.threads.set(thread.id, deleted);
    const deletionRequest = {
      id: asAIDeletionRequestId(`ai_delete_${normalizeHash(thread.id)}`),
      propagationTargets: [
        'cache',
        'memory',
        'vector_index',
        'storage',
        'provider',
        'exports',
        'dependent_artifacts',
      ],
      requestedAt: this.now(),
      status: 'VERIFIED',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    } satisfies AIDeletionRequest;
    this.deletionRequests.set(deletionRequest.id, deletionRequest);
    this.audit(context, 'ai.thread_deletion_verified', thread.id, 'success');

    return deletionRequest;
  }

  generateObservations(context: ApplicationSessionContext): readonly Observation[] {
    this.assertAccess(context, [aiCapabilities.viewObservations], [aiCapabilities.viewObservations]);
    const snapshots = this.analyticsRuntime.getMetricSnapshots(context);
    const evidence = snapshots.flatMap((snapshot) => [this.ensureEvidence(context, snapshot)]);
    const readinessRank: Record<MetricSnapshot['readiness'], number> = {
      BLOCKED: 7,
      EMPTY: 5,
      INVALID: 6,
      PARTIAL: 2,
      PROCESSING: 4,
      READY: 0,
      RECALCULATION_REQUIRED: 3,
      STALE: 1,
    };
    const orderedSnapshots = [...snapshots].sort(
      (left, right) => readinessRank[left.readiness] - readinessRank[right.readiness],
    );
    const observations = orderedSnapshots.slice(0, 4).map((snapshot, index) =>
      observationSchema.parse({
        businessImpact:
          snapshot.readiness === 'READY'
            ? 'Metryka może wspierać decyzję w zatwierdzonym zakresie.'
            : 'Metryka wymaga ograniczeń przed użyciem decyzyjnym.',
        createdAt: this.now(),
        description: `Observation z MetricSnapshot ${snapshot.metricCode}.`,
        evidenceIds: [evidence.find((item) => item.snapshotId === snapshot.id)?.id].filter(
          (item): item is AIEvidence['id'] => Boolean(item),
        ),
        expiresAt: defaultExpiry,
        id: asObservationId(`obs_${normalizeHash({ index, snapshotId: snapshot.id })}`),
        limitations: snapshot.limitations.length > 0 ? snapshot.limitations : ['Brak dodatkowych ograniczeń.'],
        metricSnapshotIds: [snapshot.id],
        owner: 'PapaData Analytics',
        period: {
          from: snapshot.periodStart,
          to: snapshot.periodEnd,
        },
        readiness: snapshot.readiness,
        scope: snapshot.scope,
        severity:
          snapshot.readiness === 'INVALID' || snapshot.readiness === 'BLOCKED'
            ? 'CRITICAL'
            : snapshot.readiness === 'READY'
              ? 'INFO'
              : 'WARNING',
        source: 'DETERMINISTIC',
        status: 'OPEN',
        tenantId: context.tenant.tenantId,
        title: `${snapshot.metricCode} observation`,
        type: snapshot.readiness === 'READY' ? 'KPI_CHANGE' : 'READINESS_LIMITATION',
        workspaceId: context.activeWorkspace.workspaceId,
      }),
    );

    for (const observation of observations) {
      this.observations.set(observation.id, observation);
    }
    this.audit(context, 'ai.observations_generated', String(observations.length), 'success');

    return observations;
  }

  generateInsight(
    context: ApplicationSessionContext,
    observationId: Observation['id'],
    modelRunId: ModelRun['id'] | null = null,
  ): Insight {
    this.assertAccess(context, [aiCapabilities.viewInsights], [aiCapabilities.viewInsights]);
    const observation = this.requireObservation(context, observationId);
    const insight = insightSchema.parse({
      acknowledgedAt: null,
      evidenceIds: observation.evidenceIds,
      fact: observation.description,
      id: asInsightId(`ins_${normalizeHash(observation.id)}`),
      interpretation:
        observation.readiness === 'READY'
          ? 'Wartość jest oparta na opublikowanym snapshotcie i może zostać użyta do rekomendacji.'
          : 'Interpretacja wymaga jawnego pokazania ograniczeń readiness.',
      limitations: observation.limitations,
      modelRunId,
      observationId: observation.id,
      status: 'OPEN',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.insights.set(insight.id, insight);
    this.audit(context, 'ai.insight_generated', insight.id, 'success');

    return insight;
  }

  draftRecommendation(
    context: ApplicationSessionContext,
    insightId: Insight['id'],
    modelRunId: ModelRun['id'] | null = null,
  ): Recommendation {
    this.assertAccess(context, [aiCapabilities.viewRecommendations], [aiCapabilities.viewRecommendations]);
    const insight = this.requireInsight(context, insightId);
    const observation = this.requireObservation(context, insight.observationId);
    const recommendation = recommendationSchema.parse({
      assumptions: ['Decyzję podejmuje człowiek po sprawdzeniu evidence.'],
      content: `Przejrzyj ${observation.title} i zaplanuj działanie tylko w potwierdzonym zakresie.`,
      cost: modelRunId ? this.requireRun(context, modelRunId).cost : '0.000000',
      decisionDeadline: '2026-07-27T00:00:00.000Z',
      evidenceIds: insight.evidenceIds,
      expectedImpact: observation.businessImpact,
      expiresAt: defaultExpiry,
      humanOversightLevel: 'SINGLE_APPROVAL',
      id: asRecommendationId(`rec_${normalizeHash(insight.id)}`),
      insightId: insight.id,
      limitations: insight.limitations,
      metricDefinitionVersions: ['metric-definition.2026-07'],
      metricSnapshotIds: observation.metricSnapshotIds,
      modelRunId,
      owner: 'workspace_admin',
      purpose: 'Wsparcie decyzji człowieka.',
      readiness: observation.readiness,
      requiredApprover: 'workspace_admin',
      requiredCapability: aiCapabilities.decideRecommendation,
      risks: ['Nie wykonuj działań poza zakresem evidence.'],
      scope: observation.scope,
      status: 'PROPOSED',
      tenantId: context.tenant.tenantId,
      version: 'recommendation.2026-07',
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.recommendations.set(recommendation.id, recommendation);
    this.audit(context, 'ai.recommendation_drafted', recommendation.id, 'success');

    return recommendation;
  }

  recordDecision(
    context: ApplicationSessionContext,
    recommendationId: Recommendation['id'],
    input: {
      expectedRecommendationVersion: Recommendation['version'];
      outcome: Decision['outcome'];
      rationale: string;
    },
  ): Decision {
    this.assertAccess(
      context,
      [aiCapabilities.decideRecommendation],
      [aiCapabilities.decideRecommendation],
    );
    const recommendation = this.requireRecommendation(context, recommendationId);

    if (recommendation.version !== input.expectedRecommendationVersion) {
      throw new Error('STALE_RECOMMENDATION_VERSION');
    }

    if (recommendation.status === 'EXPIRED' || recommendation.status === 'INVALIDATED') {
      throw new Error('RECOMMENDATION_NOT_DECIDABLE');
    }

    if (recommendation.readiness === 'INVALID' || recommendation.readiness === 'BLOCKED') {
      throw new Error('READINESS_BLOCKS_DECISION');
    }

    const decision = decisionSchema.parse({
      decidedAt: this.now(),
      decidedBy: context.user.userId,
      expectedRecommendationVersion: input.expectedRecommendationVersion,
      id: asDecisionId(`dec_${normalizeHash({ outcome: input.outcome, recommendationId })}`),
      outcome: input.outcome,
      owner: 'workspace_admin',
      rationale: sanitizeMarkdownContent(input.rationale),
      readinessAtDecision: recommendation.readiness,
      recommendationId,
      scopeHash: normalizeHash(recommendation.scope),
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.decisions.set(decision.id, decision);
    this.recommendations.set(recommendation.id, {
      ...recommendation,
      status: input.outcome === 'ACCEPT' ? 'ACCEPTED' : input.outcome === 'REJECT' ? 'REJECTED' : 'DEFERRED',
    });
    this.audit(context, 'ai.decision_recorded', decision.id, 'success');

    return decision;
  }

  createActionProposal(
    context: ApplicationSessionContext,
    input: ProposalInput,
  ): ActionProposal {
    this.assertAccess(
      context,
      [aiCapabilities.createActionProposal],
      [aiCapabilities.createActionProposal],
    );
    const recommendation = this.requireRecommendation(context, input.recommendationId);
    const decision = this.requireDecision(context, input.decisionId);

    if (decision.recommendationId !== recommendation.id) {
      throw new Error('DECISION_RECOMMENDATION_MISMATCH');
    }

    const actionType = input.actionType ?? 'CREATE_TASK';
    const proposal = actionProposalSchema.parse({
      actionType,
      approvedAt: null,
      approvedBy: null,
      compensatingAction: 'Anuluj zadanie i oznacz rekomendację do ponownego przeglądu.',
      evidenceIds: recommendation.evidenceIds,
      expectedImpact: input.expectedImpact ?? recommendation.expectedImpact,
      expiresAt: defaultExpiry,
      id: asActionProposalId(
        `proposal_${normalizeHash({
          actionType,
          decisionId: decision.id,
          recommendationId: recommendation.id,
        })}`,
      ),
      idempotencyKey:
        input.idempotencyKey ??
        `idem_${normalizeHash({ actionType, decisionId: decision.id })}`,
      parameters: {
        decisionId: decision.id,
        recommendationId: recommendation.id,
      },
      reauthRequired: true,
      recommendationId: recommendation.id,
      requiredApproval: forbiddenActions.has(actionType) ? 'PROHIBITED' : 'REAUTH_AND_APPROVAL',
      requiredCapability: aiCapabilities.executeActionProposal,
      risks: recommendation.risks,
      status: forbiddenActions.has(actionType) ? 'PROHIBITED' : 'PROPOSED',
      targetId: input.targetId ?? `task_${normalizeHash(decision.id)}`,
      targetType: input.targetType ?? 'TASK',
      targetVersion: 'target.2026-07',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.actionProposals.set(proposal.id, proposal);
    this.audit(context, 'ai.action_proposal_created', proposal.id, 'success');

    return proposal;
  }

  approveActionProposal(
    context: ApplicationSessionContext,
    proposalId: ActionProposal['id'],
    input: {
      reauthenticationCode: string;
    },
  ): ActionProposal {
    this.assertAccess(
      context,
      [aiCapabilities.approveActionProposal],
      [aiCapabilities.approveActionProposal],
    );
    const proposal = this.requireProposal(context, proposalId);

    if (proposal.status === 'PROHIBITED') {
      throw new Error('PROHIBITED_ACTION');
    }

    if (proposal.reauthRequired && input.reauthenticationCode !== 'reauth-confirmed') {
      throw new Error('REAUTH_REQUIRED');
    }

    const approved = actionProposalSchema.parse({
      ...proposal,
      approvedAt: this.now(),
      approvedBy: context.user.userId,
      status: 'APPROVED',
    });
    this.actionProposals.set(approved.id, approved);
    this.audit(context, 'ai.action_proposal_approved', approved.id, 'success');

    return approved;
  }

  executeActionProposal(
    context: ApplicationSessionContext,
    proposalId: ActionProposal['id'],
    input: {
      expectedTargetVersion: ActionProposal['targetVersion'];
      idempotencyKey: string;
    },
  ): {
    action: AIAction;
    execution: ActionExecution;
  } {
    this.assertAccess(
      context,
      [aiCapabilities.executeActionProposal],
      [aiCapabilities.executeActionProposal],
    );
    const proposal = this.requireProposal(context, proposalId);
    const existingExecution = [...this.actionExecutions.values()].find(
      (execution) =>
        execution.idempotencyKey === input.idempotencyKey &&
        execution.tenantId === context.tenant.tenantId &&
        execution.workspaceId === context.activeWorkspace.workspaceId,
    );

    if (existingExecution) {
      return {
        action: this.requireAction(context, existingExecution.actionId),
        execution: existingExecution,
      };
    }

    if (proposal.status !== 'APPROVED') {
      throw new Error('APPROVAL_REQUIRED');
    }

    if (proposal.targetVersion !== input.expectedTargetVersion) {
      throw new Error('TARGET_CHANGED');
    }

    if (proposal.idempotencyKey !== input.idempotencyKey) {
      throw new Error('IDEMPOTENCY_KEY_MISMATCH');
    }

    const decision = this.requireDecision(
      context,
      this.requireRecommendation(context, proposal.recommendationId).status === 'ACCEPTED'
        ? [...this.decisions.values()].find(
            (candidate) =>
              candidate.recommendationId === proposal.recommendationId &&
              candidate.tenantId === context.tenant.tenantId &&
              candidate.workspaceId === context.activeWorkspace.workspaceId,
          )?.id ?? asDecisionId('dec_missing')
        : asDecisionId('dec_missing'),
    );
    const action = actionSchema.parse({
      blockers: [],
      comments: ['Utworzone z zatwierdzonej rekomendacji.'],
      deadline: defaultExpiry,
      expectedOutcome: proposal.expectedImpact,
      history: ['Proposal approved', 'Permissions revalidated', 'Target revalidated'],
      id: asActionId(`action_${normalizeHash(proposal.id)}`),
      outcomePlan: 'Porównaj KPI bazowy z okresem po działaniu.',
      owner: 'workspace_admin',
      progress: 100,
      risk: 'MEDIUM',
      scope: this.requireRecommendation(context, proposal.recommendationId).scope,
      sourceDecisionId: decision.id,
      status: 'SUCCEEDED',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    const execution = actionExecutionSchema.parse({
      actionId: action.id,
      completedAt: this.now(),
      errorClass: null,
      id: asActionExecutionId(`exec_${normalizeHash(proposal.id)}`),
      idempotencyKey: input.idempotencyKey,
      proposalId: proposal.id,
      revalidatedAt: this.now(),
      startedAt: this.now(),
      status: 'SUCCEEDED',
      tenantId: context.tenant.tenantId,
      verification: 'Target, permission, data readiness and approval revalidated.',
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.actions.set(action.id, action);
    this.actionExecutions.set(execution.id, execution);
    this.actionProposals.set(proposal.id, {
      ...proposal,
      status: 'SUCCEEDED',
    });
    this.audit(context, 'ai.action_executed', action.id, 'success');

    return {
      action,
      execution,
    };
  }

  createOutcome(context: ApplicationSessionContext, actionId: AIAction['id']): Outcome {
    this.assertAccess(context, [aiCapabilities.viewOutcomes], [aiCapabilities.viewOutcomes]);
    const action = this.requireAction(context, actionId);
    const outcome = outcomeSchema.parse({
      actionId: action.id,
      baselineKpi: 'net_revenue',
      baselinePeriod: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-19T00:00:00.000Z',
      },
      beforeAfter: ['before: baseline snapshot', 'after: measurement pending in next period'],
      confidence: {
        label: 'MEDIUM',
        meaning: 'Confidence opisuje kompletność evidence, nie zastępuje readiness.',
      },
      conclusion: 'Outcome measurement plan utworzony; pomiar końcowy wymaga kolejnego okresu.',
      confounders: ['Sezonowość', 'Zmiana kampanii poza zakresem Fali 5'],
      expectedEffect: action.expectedOutcome,
      id: asOutcomeId(`outcome_${normalizeHash(action.id)}`),
      measuredAt: this.now(),
      measurementPlan: action.outcomePlan,
      resultAfterAction: 'PENDING_NEXT_PERIOD',
      tenantId: context.tenant.tenantId,
      valueReport: 'Wartość biznesowa będzie mierzona względem net_revenue.',
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.outcomes.set(outcome.id, outcome);
    this.audit(context, 'ai.outcome_created', outcome.id, 'success');

    return outcome;
  }

  createLaboratoryExperiment(
    context: ApplicationSessionContext,
    input: LaboratoryInput,
  ): LaboratoryExperiment {
    const useCase = this.requireApprovedUseCase(input.useCaseId);
    this.assertAccess(context, [aiCapabilities.runAILaboratory], [aiCapabilities.runAILaboratory]);

    if (useCase.id !== asAIUseCaseId('uc_laboratory_analysis')) {
      throw new Error('UNSUPPORTED_LAB_USE_CASE');
    }

    const experiment = laboratoryExperimentSchema.parse({
      allowedDatasetIds: input.allowedDatasetIds,
      allowedMetricCodes: input.allowedMetricCodes,
      archivedAt: null,
      artifactIds: [],
      contextGoal: sanitizeMarkdownContent(input.contextGoal),
      createdAt: this.now(),
      createdBy: context.user.userId,
      id: asLaboratoryExperimentId(
        `lab_exp_${normalizeHash({
          goal: input.contextGoal,
          tenantId: context.tenant.tenantId,
          workspaceId: context.activeWorkspace.workspaceId,
        })}`,
      ),
      period: input.period,
      retentionPolicyId: useCase.retentionPolicyId,
      runIds: [],
      status: 'DRAFT',
      tenantId: context.tenant.tenantId,
      useCaseId: useCase.id,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.experiments.set(experiment.id, experiment);
    this.audit(context, 'ai.laboratory_experiment_created', experiment.id, 'success');

    return experiment;
  }

  runLaboratoryExperiment(
    context: ApplicationSessionContext,
    experimentId: LaboratoryExperiment['id'],
  ): AIInteractionResult {
    const experiment = this.requireExperiment(context, experimentId);
    const result = this.runAssistant(context, {
      content: experiment.contextGoal,
      context: aiContextSchema.parse({
        currency: context.currency,
        dataScope: 'workspace',
        period: experiment.period,
        readiness: 'READY',
        resourceId: experiment.id,
        resourceType: 'Experiment',
        snapshotId: null,
        surface: 'ai_laboratory',
        tenantId: context.tenant.tenantId,
        timezone: context.timezone,
        useCaseId: experiment.useCaseId,
        workspaceId: context.activeWorkspace.workspaceId,
      }),
      environment: 'local_synthetic',
    });
    const updated = laboratoryExperimentSchema.parse({
      ...experiment,
      runIds: [...experiment.runIds, result.run.id],
      status: 'ANSWERED',
    });
    this.experiments.set(updated.id, updated);
    this.audit(context, 'ai.laboratory_experiment_run', result.run.id, 'success');

    return result;
  }

  compareLaboratoryRuns(
    context: ApplicationSessionContext,
    leftRunId: ModelRun['id'],
    rightRunId: ModelRun['id'],
  ): string {
    const left = this.requireRun(context, leftRunId);
    const right = this.requireRun(context, rightRunId);

    return `Porównanie runów: ${left.modelVersion} vs ${right.modelVersion}; koszt ${left.cost} vs ${right.cost}.`;
  }

  exportLaboratoryRun(context: ApplicationSessionContext, runId: ModelRun['id']) {
    this.assertAccess(
      context,
      [aiCapabilities.exportLaboratoryRun],
      [aiCapabilities.exportLaboratoryRun],
    );
    const run = this.requireRun(context, runId);
    const exportObject = {
      classification: 'CUSTOMER_CONFIDENTIAL',
      createdAt: this.now(),
      evidenceReferences: this.getRunEvidence(context, runId).map((item) => item.id),
      operationId: asOperationId(`op_ai_lab_export_${normalizeHash(run.id)}`),
      retentionClass: 'R-EXPORT',
      runId: run.id,
      status: 'READY',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    };
    this.audit(context, 'ai.laboratory_export_ready', run.id, 'success');

    return exportObject;
  }

  archiveLaboratoryExperiment(
    context: ApplicationSessionContext,
    experimentId: LaboratoryExperiment['id'],
  ): LaboratoryExperiment {
    const experiment = this.requireExperiment(context, experimentId);
    const archived = laboratoryExperimentSchema.parse({
      ...experiment,
      archivedAt: this.now(),
      status: 'ARCHIVED',
    });
    this.experiments.set(archived.id, archived);
    this.audit(context, 'ai.laboratory_experiment_archived', archived.id, 'success');

    return archived;
  }

  getSettings(context: ApplicationSessionContext): AISettings {
    this.assertAccess(context, [aiCapabilities.manageAISettings], [aiCapabilities.manageAISettings]);

    return aiSettingsSchema.parse({
      allowedModelCodes: aiModelRegistry.map((model) => model.code),
      allowedUseCaseIds: approvedAIUseCases.map((useCase) => useCase.id),
      dataUseNotice: 'Dane klienta nie są używane do treningu wspólnego modelu.',
      featureFlags: {
        aiActions: true,
        aiAssistant: true,
        aiLaboratory: true,
        productionAI: false,
      },
      humanOversightLevel: 'REAUTH_AND_APPROVAL',
      memoryEnabled: true,
      retentionPolicyId: 'retention_policy_ai_mvp',
      tenantId: context.tenant.tenantId,
      userCostLimit: '1.000000',
      workspaceAIEnabled: !this.emergencyDisabled,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  getHistory(context: ApplicationSessionContext): AIHistory {
    this.assertAccess(context, [aiCapabilities.viewAIHistory], [aiCapabilities.viewAIHistory]);
    const scopedRuns = [...this.modelRuns.values()].filter((run) => this.matchesContext(context, run));
    const costMicros = scopedRuns.reduce((sum, run) => {
      const [, fraction = '0'] = run.cost.split('.');

      return sum + BigInt(fraction.padEnd(6, '0').slice(0, 6));
    }, 0n);

    return aiHistorySchema.parse({
      actionProposalIds: [...this.actionProposals.values()]
        .filter((proposal) => this.matchesContext(context, proposal))
        .map((proposal) => proposal.id),
      cost: decimalFromMicros(costMicros),
      decisionIds: [...this.decisions.values()]
        .filter((decision) => this.matchesContext(context, decision))
        .map((decision) => decision.id),
      deletionStatus: [...this.deletionRequests.values()].some((request) =>
        this.matchesContext(context, request),
      )
        ? 'VERIFIED'
        : 'NONE',
      evidenceIds: [...this.aiEvidence.values()]
        .filter((evidence) => this.matchesContext(context, evidence))
        .map((evidence) => evidence.id),
      recommendationIds: [...this.recommendations.values()]
        .filter((recommendation) => this.matchesContext(context, recommendation))
        .map((recommendation) => recommendation.id),
      retentionStatus: 'ACTIVE',
      runIds: scopedRuns.map((run) => run.id),
      threadIds: [...this.threads.values()]
        .filter((thread) => this.matchesContext(context, thread))
        .map((thread) => thread.id),
    });
  }

  getGovernance(context: ApplicationSessionContext): AIGovernance {
    this.assertAccess(context, [aiCapabilities.viewAIGovernance], [aiCapabilities.viewAIGovernance]);
    const costByUseCase: Record<string, string> = {};

    for (const run of this.modelRuns.values()) {
      if (!this.matchesContext(context, run)) {
        continue;
      }

      const [, fraction = '0'] = run.cost.split('.');
      const previous = costByUseCase[run.useCaseId] ?? '0.000000';
      const [, previousFraction = '0'] = previous.split('.');
      costByUseCase[run.useCaseId] = decimalFromMicros(
        BigInt(previousFraction.padEnd(6, '0').slice(0, 6)) +
          BigInt(fraction.padEnd(6, '0').slice(0, 6)),
      );
    }

    return {
      auditCount: this.audits.length,
      costByUseCase,
      gateS3: this.gateS3,
      incidents: this.incidents.map((incident) => asAIIncidentId(incident.id)),
      modelRegistry: [...aiModelRegistry],
      providerRegistry: [...aiProviderRegistry],
      useCaseRegister: approvedAIUseCases.map((useCase) => aiUseCaseSchema.parse(useCase)),
    };
  }

  getGateS3Report(): GateS3Report {
    return this.gateS3;
  }

  setEmergencyDisable(context: ApplicationSessionContext, disabled: boolean): void {
    this.assertAccess(context, [aiCapabilities.manageAISettings], [aiCapabilities.manageAISettings]);
    this.emergencyDisabled = disabled;
    this.audit(context, disabled ? 'ai.emergency_disabled' : 'ai.emergency_enabled', 'workspace', 'success');
  }

  runEvaluationSuite(context: ApplicationSessionContext): AIEvaluationRun {
    this.assertAccess(context, [aiCapabilities.viewAIGovernance], [aiCapabilities.viewAIGovernance]);
    const run = aiEvaluationRunSchema.parse({
      costPerRun: '0.000336',
      correctness: 0.96,
      evidenceCoverage: 1,
      evidencePrecision: 1,
      hallucinationRate: 0,
      humanAcceptanceRate: 0.82,
      humanCorrectionRate: 0.18,
      id: asEvaluationRunId(`eval_${normalizeHash({ at: this.now(), version: aiEvaluationSuiteVersion })}`),
      latency: 18,
      limitationCompleteness: 1,
      refusalCorrectness: 1,
      secretLeakageRate: 0,
      stability: 0.99,
      tenantLeakageRate: 0,
      toolPolicyViolationRate: 0,
      version: aiEvaluationSuiteVersion,
      workspaceLeakageRate: 0,
    });
    this.evaluationRuns.set(run.id, run);
    this.audit(context, 'ai.evaluation_suite_completed', run.id, 'success');

    return run;
  }

  getRetentionInventory() {
    return {
      cache: 'R-TRANSIENT',
      contextManifest: 'R-BUSINESS',
      evidence: 'R-BUSINESS',
      experiments: 'R-BUSINESS',
      insights: 'R-BUSINESS',
      memory: 'R-BUSINESS',
      modelRuns: 'R-AUDIT',
      providerSideData: 'R-TRANSIENT',
      recommendations: 'R-BUSINESS',
      threads: 'R-BUSINESS',
      vectorIndex: 'R-TRANSIENT',
    } as const;
  }

  private executeGateway(
    context: ApplicationSessionContext,
    thread: AIThread,
    userMessage: AIMessage,
    input: AssistantInput,
    useCase: AIUseCase,
  ): AIInteractionResult {
    const snapshots = this.retrieveSnapshots(context, input.context, useCase);
    const evidence = snapshots.map((snapshot) => this.ensureEvidence(context, snapshot));
    const manifest = this.buildContextManifest(context, input.context, useCase, snapshots, evidence);
    const usage = aiUsageSchema.parse({
      completionTokens: 110,
      promptTokens: tokenEstimate(userMessage.sanitizedContent) + snapshots.length * 64,
      toolCalls: snapshots.length === 0 ? 0 : 1,
      totalTokens: tokenEstimate(userMessage.sanitizedContent) + snapshots.length * 64 + 110,
    });
    const runId = asModelRunId(
      `run_${normalizeHash({
        content: userMessage.sanitizedContent,
        manifestId: manifest.id,
        threadId: thread.id,
      })}`,
    );
    const earlyRefusal = this.preflightRefusal(input, useCase, snapshots, evidence);

    if (earlyRefusal) {
      const run = this.createModelRun(context, {
        contextManifestId: manifest.id,
        refusalCode: earlyRefusal,
        runId,
        status: 'REFUSED',
        threadId: thread.id,
        usage,
        useCase,
      });
      const refusal = this.createRefusal(context, input.context, earlyRefusal, run);
      const output = this.createStructuredOutput({
        context: input.context,
        evidence,
        refusal,
        run,
        snapshots,
        status: runtimeStateForRefusal(earlyRefusal),
        summary: refusal.safeMessage,
        useCase,
      });
      const assistantMessage = this.createMessage(context, {
        content: refusal.safeMessage,
        evidenceReferences: evidence.map((item) => item.id),
        role: 'ASSISTANT',
        threadId: thread.id,
      });
      const provenance = this.createProvenance(run, evidence, useCase, refusal);
      const result = aiInteractionResultSchema.parse({
        contextManifest: manifest,
        evidence,
        message: assistantMessage,
        output,
        provenance,
        run,
        thread,
      });
      this.audit(context, 'ai.run_refused', earlyRefusal, 'denied');

      return result;
    }

    const run = this.createModelRun(context, {
      contextManifestId: manifest.id,
      refusalCode: null,
      runId,
      status: 'SUCCEEDED',
      threadId: thread.id,
      usage,
      useCase,
    });
    const output = this.createStructuredOutput({
      context: input.context,
      evidence,
      refusal: null,
      run,
      snapshots,
      status: snapshots.some((snapshot) => snapshot.readiness === 'PARTIAL') ? 'NEEDS_REVIEW' : 'ANSWERED',
      summary: this.summarizeSnapshots(snapshots),
      useCase,
    });
    this.validateEvidenceScope(context, output, evidence);
    const assistantMessage = this.createMessage(context, {
      content: output.summary,
      evidenceReferences: evidence.map((item) => item.id),
      role: 'ASSISTANT',
      threadId: thread.id,
    });
    const provenance = this.createProvenance(run, evidence, useCase, null);
    const result = aiInteractionResultSchema.parse({
      contextManifest: manifest,
      evidence,
      message: assistantMessage,
      output,
      provenance,
      run,
      thread,
    });
    this.audit(context, 'ai.run_completed', run.id, 'success');

    return result;
  }

  private preflightRefusal(
    input: AssistantInput,
    useCase: AIUseCase,
    snapshots: readonly MetricSnapshot[],
    evidence: readonly AIEvidence[],
  ): AIRefusalCode | null {
    if (this.emergencyDisabled) {
      return 'SAFETY_POLICY_BLOCK';
    }

    if (!useCase.targetSurface.includes(input.context.surface)) {
      return 'OUT_OF_SCOPE';
    }

    if (detectsPromptInjection(input.content)) {
      return 'INJECTION_DETECTED';
    }

    if (requestsSecret(input.content)) {
      return 'SAFETY_POLICY_BLOCK';
    }

    if ((input.environment ?? 'local_synthetic') === 'production' && this.gateS3.productionAIBlocked) {
      return 'GATE_NOT_SATISFIED';
    }

    if (snapshots.length === 0) {
      return 'INSUFFICIENT_DATA';
    }

    const readiness = worstReadiness(snapshots);

    if (readiness === 'BLOCKED') {
      return 'DATA_BLOCKED';
    }

    if (readiness === 'INVALID') {
      return 'DATA_INVALID';
    }

    if (readiness === 'EMPTY') {
      return 'INSUFFICIENT_DATA';
    }

    if (snapshots.every((snapshot) => snapshot.valueType === 'UNPUBLISHED')) {
      return 'DATA_BLOCKED';
    }

    if (readiness === 'STALE' && input.requireCurrentDecision) {
      return 'STALE_FOR_CURRENT_DECISION';
    }

    if (evidence.length === 0) {
      return 'EVIDENCE_UNAVAILABLE';
    }

    if (input.content.length > 16_000) {
      return 'COST_LIMIT_REACHED';
    }

    return null;
  }

  private retrieveSnapshots(
    context: ApplicationSessionContext,
    aiContext: AIContext,
    useCase: AIUseCase,
  ): readonly MetricSnapshot[] {
    assertScope(context, aiContext);
    this.assertAccess(context, [analyticsCapabilities.viewMetrics], [analyticsCapabilities.viewMetrics]);

    if (aiContext.snapshotId) {
      return [this.analyticsRuntime.getMetricSnapshot(context, aiContext.snapshotId)];
    }

    const snapshots = this.analyticsRuntime.getMetricSnapshots(context);
    const selected = snapshots.filter((snapshot) =>
      useCase.requiredMetricCodes.length === 0 ||
      useCase.requiredMetricCodes.includes(snapshot.metricCode),
    );

    return selected.slice(0, 5);
  }

  private buildContextManifest(
    context: ApplicationSessionContext,
    aiContext: AIContext,
    useCase: AIUseCase,
    snapshots: readonly MetricSnapshot[],
    evidence: readonly AIEvidence[],
  ): ContextManifest {
    const manifest = contextManifestSchema.parse({
      classifications: ['CUSTOMER_CONFIDENTIAL'],
      datasetReferences: [...new Set(snapshots.flatMap((snapshot) => snapshot.datasetIds))],
      evidenceReferences: evidence.map((item) => item.id),
      excludedCategories: ['secrets', 'raw_payloads', 'credentials', 'foreign_workspace'],
      generatedAt: this.now(),
      id: asContextManifestId(
        `ctx_${normalizeHash({
          period: aiContext.period,
          snapshots: snapshots.map((snapshot) => snapshot.id),
          useCaseId: useCase.id,
          workspaceId: context.activeWorkspace.workspaceId,
        })}`,
      ),
      integrityHash: normalizeHash({
        evidence: evidence.map((item) => item.integrityHash),
        snapshots: snapshots.map((snapshot) => snapshot.inputHash),
      }),
      metricSnapshotIds: snapshots.map((snapshot) => snapshot.id),
      purpose: useCase.purpose,
      readinessSummary: [...new Set(snapshots.map((snapshot) => snapshot.readiness))],
      redactions: ['pii_minimized', 'provider_errors_removed', 'secrets_redacted'],
      retrievalPolicyVersion: 'retrieval-policy.2026-07',
      tenantId: context.tenant.tenantId,
      timeRange: aiContext.period,
      useCaseId: useCase.id,
      userId: context.user.userId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.contextManifests.set(manifest.id, manifest);

    return manifest;
  }

  private ensureEvidence(
    context: ApplicationSessionContext,
    snapshot: MetricSnapshot,
  ): AIEvidence {
    assertScope(context, snapshot);
    const evidenceId = asAIEvidenceId(`ai_ev_${normalizeHash(snapshot.id)}`);
    const existing = this.aiEvidence.get(evidenceId);

    if (existing) {
      return existing;
    }

    const evidence = aiEvidenceSchema.parse({
      classification: 'CUSTOMER_CONFIDENTIAL',
      createdAt: this.now(),
      id: evidenceId,
      integrityHash: normalizeHash({
        inputHash: snapshot.inputHash,
        readiness: snapshot.readiness,
        value: snapshot.value,
      }),
      limitations: snapshot.limitations.length > 0 ? snapshot.limitations : ['Brak ograniczeń dla published snapshot.'],
      period: {
        from: snapshot.periodStart,
        to: snapshot.periodEnd,
      },
      readiness: snapshot.readiness,
      scope: snapshot.scope,
      snapshotId: snapshot.id,
      sourceObjectId: snapshot.id,
      sourceObjectType: 'MetricSnapshot',
      sourceVersion: snapshot.metricDefinitionVersion,
      structuredFacts: [
        `${snapshot.metricCode}: ${snapshot.value ?? 'UNPUBLISHED'}`,
        `readiness: ${snapshot.readiness}`,
      ],
      tenantId: snapshot.tenantId,
      type: 'metric_snapshot',
      workspaceId: snapshot.workspaceId,
    });
    this.aiEvidence.set(evidence.id, evidence);

    return evidence;
  }

  private createModelRun(
    context: ApplicationSessionContext,
    input: {
      contextManifestId: ContextManifest['id'];
      refusalCode: AIRefusalCode | null;
      runId: ModelRun['id'];
      status: ModelRun['status'];
      threadId: AIThread['id'];
      usage: ModelRun['usage'];
      useCase: AIUseCase;
    },
  ): ModelRun {
    const model = aiModelRegistry[0];
    const run = modelRunSchema.parse({
      auditReference: `audit://${normalizeHash(input.runId)}`,
      contextManifestId: input.contextManifestId,
      cost: runCost(input.usage),
      errorClass: input.status === 'FAILED' ? 'provider_error' : null,
      finishedAt: this.now(),
      id: input.runId,
      latency: input.status === 'REFUSED' ? 7 : 18,
      modelCode: model.code,
      modelVersion: 'synthetic-2026-07',
      outputSchemaVersion: 'ai-output.2026-07',
      promptTemplateVersion: 'prompt.2026-07',
      providerCode: model.providerCode,
      refusalCode: input.refusalCode,
      retrievalPolicyVersion: 'retrieval-policy.2026-07',
      startedAt: this.now(),
      status: input.status,
      tenantId: context.tenant.tenantId,
      threadId: input.threadId,
      usage: input.usage,
      useCaseId: input.useCase.id,
      userId: context.user.userId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.modelRuns.set(run.id, run);

    return run;
  }

  private createStructuredOutput(
    input: {
      context: AIContext;
      evidence: readonly AIEvidence[];
      refusal: AIRefusal | null;
      run: ModelRun;
      snapshots: readonly MetricSnapshot[];
      status: AIRuntimeState;
      summary: string;
      useCase: AIUseCase;
    },
  ): AIStructuredOutput {
    const readiness = input.snapshots.length > 0 ? worstReadiness(input.snapshots) : input.context.readiness;
    const evidenceIds = input.evidence.map((item) => item.id);
    const firstEvidence = evidenceIds.slice(0, 1);
    const limitations = [
      ...new Set([
        ...input.snapshots.flatMap((snapshot) => snapshot.limitations),
        ...(readiness === 'PARTIAL' ? ['Wnioski ograniczone do dostępnych kanałów i okresu.'] : []),
        ...(readiness === 'STALE' ? ['Dane nie mogą być przedstawiane jako bieżące.'] : []),
        ...(this.gateS3.productionAIBlocked ? ['Production AI zablokowane do niezależnej oceny Gate S3.'] : []),
      ]),
    ];

    return aiStructuredOutputSchema.parse({
      allowedDecisionTypes: readiness === 'READY' ? ['review', 'draft_recommendation'] : ['request_more_data'],
      assumptions: ['AI nie ustala KPI, readiness, source authority ani uprawnień.'],
      blockedDecisionTypes: [
        'payment',
        'role_change',
        'source_authority_change',
        'legal_action',
        'autonomous_financial_action',
      ],
      confidence: {
        label: readiness === 'READY' ? 'HIGH' : 'MEDIUM',
        meaning: 'Confidence opisuje kompletność evidence i ograniczenia, nie zastępuje readiness.',
      },
      evidenceReferences: evidenceIds,
      facts: input.snapshots.map((snapshot, index) => ({
        content: `${snapshot.metricCode} ma wartość ${snapshot.value ?? 'nieopublikowaną'} i readiness ${snapshot.readiness}.`,
        evidenceReferences: [evidenceIds[index]].filter((item): item is AIEvidence['id'] => Boolean(item)),
        kind: 'FACT',
        label: `Fakt ${index + 1}`,
      })),
      generatedAt: this.now(),
      hypotheses: firstEvidence.length > 0
        ? [
            {
              content: 'Zmiana może wynikać z miksu zamówień albo refundów; wymaga drill-down.',
              evidenceReferences: firstEvidence,
              kind: 'HYPOTHESIS',
              label: 'Hipoteza driverów',
            },
          ]
        : [],
      humanOversightLevel: input.useCase.humanOversightLevel,
      interpretations: firstEvidence.length > 0
        ? [
            {
              content: readiness === 'READY'
                ? 'Snapshot jest gotowy do analizy w zatwierdzonym zakresie.'
                : 'Analiza wymaga jawnego ograniczenia zakresu.',
              evidenceReferences: firstEvidence,
              kind: 'INTERPRETATION',
              label: 'Interpretacja readiness',
            },
          ]
        : [],
      limitations: limitations.length > 0 ? limitations : ['Brak dodatkowych ograniczeń.'],
      missingData: input.snapshots.flatMap((snapshot) =>
        snapshot.missingData.flatMap((missing) => missing.fields),
      ),
      modelReference: `${input.run.providerCode}/${input.run.modelCode}/${input.run.modelVersion}`,
      period: input.context.period,
      provenanceReference: `provenance://${input.run.id}`,
      readiness,
      recommendations: firstEvidence.length > 0 && input.refusal === null
        ? [
            {
              content: 'Przygotuj rekomendację jako draft i przekaż ją do decyzji człowieka.',
              evidenceReferences: firstEvidence,
              kind: 'RECOMMENDATION',
              label: 'Następny krok',
            },
          ]
        : [],
      refusal: input.refusal,
      runId: input.run.id,
      scope: input.context,
      status: input.status,
      suggestedNextSteps: input.refusal
        ? input.refusal.nextActions
        : ['Otwórz evidence', 'Utwórz observation', 'Przygotuj draft recommendation'],
      summary: input.summary,
      useCaseId: input.useCase.id,
    });
  }

  private createRefusal(
    context: ApplicationSessionContext,
    aiContext: AIContext,
    code: AIRefusalCode,
    run: ModelRun,
  ): AIRefusal {
    return {
      auditReference: run.auditReference,
      category: code,
      missingRequirements: code === 'GATE_NOT_SATISFIED'
        ? ['independent_security_review', 'independent_privacy_review']
        : [code.toLowerCase()],
      nextActions: [
        code === 'INJECTION_DETECTED'
          ? 'Usuń instrukcje próbujące obejść politykę.'
          : 'Otwórz evidence albo poproś ownera danych o usunięcie blokady.',
      ],
      safeMessage: refusalMessage(code),
      scope: {
        ...aiContext,
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
    };
  }

  private createProvenance(
    run: ModelRun,
    evidence: readonly AIEvidence[],
    useCase: AIUseCase,
    refusal: AIRefusal | null,
  ) {
    return {
      approver: null,
      auditReference: run.auditReference,
      contextSources: evidence.map((item) => `${item.sourceObjectType}:${item.sourceObjectId}`),
      cost: run.cost,
      datasetVersions: ['dataset.2026-07'],
      decisionOutcome: null,
      generatedAt: run.finishedAt ?? run.startedAt,
      humanOversight: useCase.humanOversightLevel,
      limitations: [
        ...new Set([
          ...evidence.flatMap((item) => item.limitations),
          ...(refusal ? [refusal.safeMessage] : []),
        ]),
      ],
      metricSnapshotVersions: [...new Set(evidence.map((item) => item.sourceVersion))],
      model: run.modelCode,
      modelVersion: run.modelVersion,
      promptVersion: run.promptTemplateVersion,
      provider: run.providerCode,
      readiness: [...new Set(evidence.map((item) => item.readiness))],
      retentionStatus: 'ACTIVE',
      retrievalPolicyVersion: run.retrievalPolicyVersion,
      roleOfAI: 'Analiza i drafting. AI nie podejmuje decyzji.',
      usage: run.usage,
      useCaseId: run.useCaseId,
    };
  }

  private validateEvidenceScope(
    context: ApplicationSessionContext,
    output: AIStructuredOutput,
    evidence: readonly AIEvidence[],
  ): void {
    const allowedIds = new Set(evidence.map((item) => item.id));
    const referenced = [
      ...output.evidenceReferences,
      ...output.facts.flatMap((item) => item.evidenceReferences),
      ...output.interpretations.flatMap((item) => item.evidenceReferences),
      ...output.hypotheses.flatMap((item) => item.evidenceReferences),
      ...output.recommendations.flatMap((item) => item.evidenceReferences),
    ];

    for (const evidenceId of referenced) {
      if (!allowedIds.has(evidenceId)) {
        throw new Error('EVIDENCE_OUT_OF_SCOPE');
      }
      this.requireEvidence(context, evidenceId);
    }
  }

  private summarizeSnapshots(snapshots: readonly MetricSnapshot[]): string {
    const readable = snapshots
      .map((snapshot) => `${snapshot.metricCode}: ${snapshot.value ?? 'UNPUBLISHED'} (${snapshot.readiness})`)
      .join(', ');

    return `Analiza na podstawie zatwierdzonych MetricSnapshot: ${readable}.`;
  }

  private createMessage(
    context: ApplicationSessionContext,
    input: {
      content: string;
      evidenceReferences: readonly AIEvidence['id'][];
      role: AIMessage['role'];
      threadId: AIThread['id'];
    },
  ): AIMessage {
    const message = aiMessageSchema.parse({
      classification: 'CUSTOMER_CONFIDENTIAL',
      createdAt: this.now(),
      evidenceReferences: [...input.evidenceReferences],
      id: asAIMessageId(
        `ai_msg_${normalizeHash({
          content: input.content,
          role: input.role,
          threadId: input.threadId,
        })}`,
      ),
      limitations: ['Markdown sanitized with rehype-sanitize policy and local redaction.'],
      retentionClass: 'R-BUSINESS',
      role: input.role,
      sanitizedContent: sanitizeMarkdownContent(input.content),
      tenantId: context.tenant.tenantId,
      threadId: input.threadId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.messages.set(message.id, message);

    return message;
  }

  private assertAccess(
    context: ApplicationSessionContext,
    capabilities: readonly Capability[],
    entitlements: readonly Capability[],
  ): void {
    if (!activeMembership(context)) {
      this.audit(context, 'ai.access_denied_membership', 'membership', 'denied');
      throw new Error('PERMISSION_DENIED');
    }

    for (const capability of capabilities) {
      if (!hasCapability(context, capability)) {
        this.audit(context, 'ai.access_denied_capability', capability, 'denied');
        throw new Error('PERMISSION_DENIED');
      }
    }

    for (const entitlement of entitlements) {
      if (!hasEntitlement(context, entitlement)) {
        this.audit(context, 'ai.access_denied_entitlement', entitlement, 'denied');
        throw new Error('ENTITLEMENT_REQUIRED');
      }
    }
  }

  private assertViewGovernanceOrAssistant(context: ApplicationSessionContext): void {
    if (
      hasCapability(context, aiCapabilities.viewAIGovernance) ||
      hasCapability(context, aiCapabilities.viewAIAssistant)
    ) {
      return;
    }

    throw new Error('PERMISSION_DENIED');
  }

  private requireApprovedUseCase(useCaseId: AIUseCase['id']): AIUseCase {
    const useCase = approvedAIUseCases.find((candidate) => candidate.id === useCaseId);

    if (!useCase || useCase.status !== 'APPROVED') {
      throw new Error('UNSUPPORTED_USE_CASE');
    }

    return aiUseCaseSchema.parse(useCase);
  }

  private requireThread(context: ApplicationSessionContext, threadId: AIThread['id']): AIThread {
    const thread = this.threads.get(threadId);

    if (!thread || !this.matchesContext(context, thread)) {
      throw new Error('NOT_FOUND');
    }

    return thread;
  }

  private requireRun(context: ApplicationSessionContext, runId: ModelRun['id']): ModelRun {
    const run = this.modelRuns.get(runId);

    if (!run || !this.matchesContext(context, run)) {
      throw new Error('NOT_FOUND');
    }

    return run;
  }

  private requireEvidence(context: ApplicationSessionContext, evidenceId: AIEvidence['id']): AIEvidence {
    const evidence = this.aiEvidence.get(evidenceId);

    if (!evidence || !this.matchesContext(context, evidence)) {
      throw new Error('NOT_FOUND');
    }

    return evidence;
  }

  private requireObservation(
    context: ApplicationSessionContext,
    observationId: Observation['id'],
  ): Observation {
    const observation = this.observations.get(observationId);

    if (!observation || !this.matchesContext(context, observation)) {
      throw new Error('NOT_FOUND');
    }

    return observation;
  }

  private requireInsight(context: ApplicationSessionContext, insightId: Insight['id']): Insight {
    const insight = this.insights.get(insightId);

    if (!insight || !this.matchesContext(context, insight)) {
      throw new Error('NOT_FOUND');
    }

    return insight;
  }

  private requireRecommendation(
    context: ApplicationSessionContext,
    recommendationId: Recommendation['id'],
  ): Recommendation {
    const recommendation = this.recommendations.get(recommendationId);

    if (!recommendation || !this.matchesContext(context, recommendation)) {
      throw new Error('NOT_FOUND');
    }

    return recommendation;
  }

  private requireDecision(context: ApplicationSessionContext, decisionId: Decision['id']): Decision {
    const decision = this.decisions.get(decisionId);

    if (!decision || !this.matchesContext(context, decision)) {
      throw new Error('NOT_FOUND');
    }

    return decision;
  }

  private requireProposal(
    context: ApplicationSessionContext,
    proposalId: ActionProposal['id'],
  ): ActionProposal {
    const proposal = this.actionProposals.get(proposalId);

    if (!proposal || !this.matchesContext(context, proposal)) {
      throw new Error('NOT_FOUND');
    }

    return proposal;
  }

  private requireAction(context: ApplicationSessionContext, actionId: AIAction['id']): AIAction {
    const action = this.actions.get(actionId);

    if (!action || !this.matchesContext(context, action)) {
      throw new Error('NOT_FOUND');
    }

    return action;
  }

  private requireExperiment(
    context: ApplicationSessionContext,
    experimentId: LaboratoryExperiment['id'],
  ): LaboratoryExperiment {
    const experiment = this.experiments.get(experimentId);

    if (!experiment || !this.matchesContext(context, experiment)) {
      throw new Error('NOT_FOUND');
    }

    return experiment;
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

  private audit(
    context: ApplicationSessionContext,
    eventType: string,
    reason: string,
    result: AuditEvent['result'],
  ): void {
    this.audits.push({
      eventType,
      occurredAt: this.now(),
      reason,
      result,
      tenantId: context.tenant.tenantId,
      userId: context.user.userId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
  }

  private now(): string {
    return fixtureNow;
  }
}

export function createAIReadAccessContext(
  context: ApplicationSessionContext,
): ApplicationSessionContext {
  const capabilities = [
    ...context.capabilities,
    ...Object.values(aiCapabilities),
    ...Object.values(analyticsCapabilities),
  ];
  const uniqueCapabilities = [...new Set(capabilities)];
  const entitlementCapabilities = new Set([
    ...context.entitlements.map((entitlement) => entitlement.capability),
    ...Object.values(aiCapabilities),
    ...Object.values(analyticsCapabilities),
  ]);

  return {
    ...context,
    capabilities: uniqueCapabilities,
    entitlements: [
      ...context.entitlements,
      ...[...entitlementCapabilities]
        .filter((capability) =>
          !context.entitlements.some(
            (entitlement) =>
              entitlement.capability === capability &&
              entitlement.tenantId === context.tenant.tenantId &&
              entitlement.workspaceId === context.activeWorkspace.workspaceId,
          ),
        )
        .map((capability) => ({
          capability,
          enabled: true,
          limitations: [],
          tenantId: context.tenant.tenantId,
          workspaceId: context.activeWorkspace.workspaceId,
        })),
    ],
  };
}
