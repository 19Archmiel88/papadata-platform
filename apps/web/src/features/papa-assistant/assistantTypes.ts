export const papaAssistantModes = [
  'quickBrief',
  'interpretation',
  'diagnosis',
  'decision',
  'report',
  'actionPlan',
] as const;

export const papaLaboratoryModes = [
  'decision',
  'diagnosis',
  'report',
  'actionPlan',
] as const;

export const papaDataStatuses = [
  'ready',
  'partial',
  'stale',
  'restricted',
  'empty',
  'error',
  'no access',
] as const;

export const papaConfidenceLevels = [
  'wysoka',
  'ograniczona',
  'niewystarczająca',
] as const;

export const papaReportJobStatuses = [
  'queued',
  'generating',
  'ready',
  'failed',
  'expired',
] as const;

export const papaDecisionQueueStatuses = [
  'proposed',
  'needsReview',
  'approved',
  'rejected',
  'deferred',
  'expired',
  'invalidated',
  'executing',
  'succeeded',
  'failed',
  'partiallySucceeded',
  'compensated',
] as const;

export const papaExportStatuses = [
  'ready',
  'generating',
  'expired',
  'error',
  'no access',
] as const;

export const papaRefusalReasons = [
  'insufficient_evidence',
  'insufficient_data',
  'out_of_scope',
  'missing_capability',
  'prompt_injection_detected',
  'forbidden_operation',
  'cost_or_limit_exceeded',
  'approval_required',
] as const;

export const papaOperationStatuses = [
  'queued',
  'generating',
  'needsReview',
  'executing',
  'succeeded',
  'failed',
  'recovery',
] as const;

export const papaRecommendationStatuses = [
  'nowa',
  'do decyzji',
  'w planie',
  'odłożona',
  'zrealizowana',
  'odrzucona',
] as const;

export const papaArtifactTypes = [
  'summary',
  'list',
  'table',
  'chart',
  'briefing',
  'reportDraft',
  'actionPlan',
] as const;

export const papaLibraryArtifactTypes = [
  'tabela',
  'wykres',
  'decyzja',
  'brief',
  'alert',
  'raport',
] as const;

export type PapaAssistantMode =
  typeof papaAssistantModes[number];

export type PapaLaboratoryMode =
  typeof papaLaboratoryModes[number];

export type PapaDataStatus =
  typeof papaDataStatuses[number];

export type PapaConfidenceLevel =
  typeof papaConfidenceLevels[number];

export type PapaReportJobStatus =
  typeof papaReportJobStatuses[number];

export type PapaDecisionQueueStatus =
  typeof papaDecisionQueueStatuses[number];

export type PapaExportStatus =
  typeof papaExportStatuses[number];

export type PapaRefusalReason =
  typeof papaRefusalReasons[number];

export type PapaOperationStatus =
  typeof papaOperationStatuses[number];

export type PapaRecommendationStatus =
  typeof papaRecommendationStatuses[number];

export type PapaArtifactType =
  typeof papaArtifactTypes[number];

export type PapaLibraryArtifactType =
  typeof papaLibraryArtifactTypes[number];

export type PapaTone =
  | 'critical'
  | 'info'
  | 'neutral'
  | 'success'
  | 'warning';

export type PapaSourceQuality = {
  readonly completeness: string;
  readonly freshness: string;
  readonly status: PapaDataStatus;
};

export type PapaSource = {
  readonly classification: string;
  readonly dataset: string;
  readonly id: string;
  readonly provider: string;
  readonly quality: PapaSourceQuality;
  readonly retention: string;
};

export type PapaAssistantContext = {
  readonly activeScreen: string;
  readonly capabilities: readonly string[];
  readonly charts: readonly string[];
  readonly dateRange: string;
  readonly filters: readonly string[];
  readonly kpis: readonly string[];
  readonly locale: 'pl' | 'en';
  readonly tables: readonly string[];
  readonly tenant: string;
  readonly tools: readonly string[];
  readonly workspace: string;
};

export type PapaContextBasketItem = {
  readonly freshness: string;
  readonly id: string;
  readonly label: string;
  readonly range: string;
  readonly removable: boolean;
  readonly source: string;
  readonly type:
    | 'chart'
    | 'chartRange'
    | 'file'
    | 'helpProcedure'
    | 'kpi'
    | 'recommendation'
    | 'report'
    | 'tableRow';
};

export type PapaEvidenceItem = {
  readonly audit: string;
  readonly completeness: string;
  readonly confidence: PapaConfidenceLevel;
  readonly dataset: string;
  readonly dateRange: string;
  readonly estimation: string;
  readonly filters: string;
  readonly freshness: string;
  readonly id: string;
  readonly limitations: string;
  readonly lineage: string;
  readonly snapshot: string;
  readonly source: string;
  readonly title: string;
};

export type PapaAnswerStructure = {
  readonly facts: readonly string[];
  readonly interpretations: readonly string[];
  readonly hypotheses: readonly string[];
  readonly recommendations: readonly string[];
  readonly limitations: readonly string[];
  readonly suggestedNextSteps: readonly string[];
};

export type PapaConversationMessage = {
  readonly answer?: PapaAnswerStructure;
  readonly author: 'assistant' | 'system' | 'user';
  readonly body: string;
  readonly createdAt: string;
  readonly evidenceIds: readonly string[];
  readonly id: string;
};

export type PapaToolActivity = {
  readonly detail: string;
  readonly evidenceIds: readonly string[];
  readonly id: string;
  readonly requiresApproval: boolean;
  readonly source: string;
  readonly status: PapaOperationStatus;
  readonly title: string;
};

export type PapaOperation = {
  readonly detail: string;
  readonly id: string;
  readonly recovery: string;
  readonly status: PapaOperationStatus;
  readonly title: string;
};

export type PapaArtifactColumn = {
  readonly id: string;
  readonly label: string;
};

export type PapaArtifactRow = Record<string, string>;

export type PapaArtifact = {
  readonly columns: readonly PapaArtifactColumn[];
  readonly id: string;
  readonly rows: readonly PapaArtifactRow[];
  readonly status: PapaDataStatus;
  readonly title: string;
  readonly type: PapaArtifactType;
};

export type PapaRecommendationScenario = {
  readonly delta: string;
  readonly label: string;
  readonly metric: string;
  readonly value: string;
};

export type PapaRecommendation = {
  readonly assumptions: readonly string[];
  readonly confidence: PapaConfidenceLevel;
  readonly current: PapaRecommendationScenario;
  readonly evidenceIds: readonly string[];
  readonly horizon: string;
  readonly id: string;
  readonly impact: string;
  readonly noAction: PapaRecommendationScenario;
  readonly owner: string;
  readonly requiresApproval: boolean;
  readonly risk: string;
  readonly status: PapaRecommendationStatus;
  readonly title: string;
  readonly withAction: PapaRecommendationScenario;
};

export type PapaDecisionQueueItem = {
  readonly approver: string;
  readonly audit: string;
  readonly canRollback: boolean;
  readonly dueAt: string;
  readonly id: string;
  readonly integration: string;
  readonly revalidation: string;
  readonly risk: string;
  readonly sideEffects: string;
  readonly status: PapaDecisionQueueStatus;
  readonly title: string;
};

export type PapaReportJob = {
  readonly artifactId: string;
  readonly channel: string;
  readonly id: string;
  readonly progress: number;
  readonly status: PapaReportJobStatus;
  readonly title: string;
};

export type PapaExportJob = {
  readonly destination: 'biblioteka' | 'brief zespołu' | 'csv' | 'mcp' | 'pdf' | 'workflow';
  readonly id: string;
  readonly label: string;
  readonly status: PapaExportStatus;
};

export type PapaLibraryArtifact = {
  readonly author: string;
  readonly date: string;
  readonly id: string;
  readonly link: string;
  readonly name: string;
  readonly range: string;
  readonly sources: string;
  readonly status: PapaDataStatus;
  readonly type: PapaLibraryArtifactType;
  readonly version: string;
};

export type PapaBriefing = {
  readonly area: string;
  readonly attachments: readonly string[];
  readonly channel: string;
  readonly context: string;
  readonly dueAt: string;
  readonly expectedOutcome: string;
  readonly id: string;
  readonly owner: string;
  readonly priority: 'high' | 'low' | 'medium';
  readonly purpose: string;
  readonly reportJobId: string;
  readonly status: PapaReportJobStatus;
  readonly topic: string;
};

export type PapaRefusal = {
  readonly detail: string;
  readonly evidenceIds: readonly string[];
  readonly id: string;
  readonly reason: PapaRefusalReason;
  readonly title: string;
};

export type PapaAuditEvent = {
  readonly detail: string;
  readonly id: string;
  readonly title: string;
  readonly timestamp: string;
};

export type PapaAssistantFixture = {
  readonly alerts: readonly string[];
  readonly artifacts: readonly PapaArtifact[];
  readonly auditTrail: readonly PapaAuditEvent[];
  readonly basket: readonly PapaContextBasketItem[];
  readonly briefings: readonly PapaBriefing[];
  readonly context: PapaAssistantContext;
  readonly conversation: readonly PapaConversationMessage[];
  readonly decisions: readonly PapaDecisionQueueItem[];
  readonly evidence: readonly PapaEvidenceItem[];
  readonly exports: readonly PapaExportJob[];
  readonly library: readonly PapaLibraryArtifact[];
  readonly operations: readonly PapaOperation[];
  readonly recommendations: readonly PapaRecommendation[];
  readonly refusals: readonly PapaRefusal[];
  readonly reports: readonly PapaReportJob[];
  readonly toolActivity: readonly PapaToolActivity[];
};

export function toneForDataStatus(status: PapaDataStatus): PapaTone {
  switch (status) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
      return 'warning';
    case 'restricted':
    case 'error':
    case 'no access':
      return 'critical';
    case 'empty':
    default:
      return 'neutral';
  }
}

export function toneForConfidence(confidence: PapaConfidenceLevel): PapaTone {
  switch (confidence) {
    case 'wysoka':
      return 'success';
    case 'ograniczona':
      return 'warning';
    case 'niewystarczająca':
    default:
      return 'critical';
  }
}

export function toneForDecisionStatus(status: PapaDecisionQueueStatus): PapaTone {
  switch (status) {
    case 'approved':
    case 'succeeded':
    case 'compensated':
      return 'success';
    case 'failed':
    case 'expired':
    case 'invalidated':
      return 'critical';
    case 'executing':
    case 'needsReview':
    case 'partiallySucceeded':
      return 'warning';
    case 'proposed':
    case 'deferred':
    case 'rejected':
    default:
      return 'info';
  }
}

export function toneForReportStatus(status: PapaReportJobStatus): PapaTone {
  switch (status) {
    case 'ready':
      return 'success';
    case 'generating':
    case 'queued':
      return 'warning';
    case 'failed':
    case 'expired':
    default:
      return 'critical';
  }
}

export function exportArtifactTableCsv(
  artifact: PapaArtifact,
  visibleColumnIds: readonly string[] = artifact.columns.map((column) => column.id),
): string {
  const visibleColumns = artifact.columns.filter((column) => (
    visibleColumnIds.includes(column.id)
  ));
  const header = visibleColumns.map((column) => quoteCsv(column.label)).join(',');
  const rows = artifact.rows.map((row) => (
    visibleColumns.map((column) => quoteCsv(row[column.id] ?? '')).join(',')
  ));

  return [
    header,
    ...rows,
  ].join('\n');
}

function quoteCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
