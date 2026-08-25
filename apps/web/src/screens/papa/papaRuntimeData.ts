import type {
  ReadinessState,
} from '../../../../../contracts/ui-contract-types';
import type {
  PapaAssistantReportArtifact,
  PapaAssistantRuntimeScope,
  PapaScreenContextElement,
  PapaScreenContextSnapshot,
} from '../../shell/papa-assistant';
import type {
  PapaAssistantStatus,
  PapaAssistantTrendDatum,
  PapaChatMessage,
  PapaContextItem,
  PapaEvidenceItem,
  PapaMemoryRecord,
  PapaRecommendationRecord,
  PapaReportArtifact,
  PapaWorkspaceData,
} from './papaData';

export function createPapaRuntimeData({
  lastSnapshot,
  messages,
  reports,
  scope,
}: {
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly messages: readonly PapaChatMessage[];
  readonly reports: readonly PapaAssistantReportArtifact[];
  readonly scope: PapaAssistantRuntimeScope;
}): PapaWorkspaceData {
  const snapshot = lastSnapshot;
  const contextItems = snapshot
    ? buildContextItems(snapshot)
    : [];
  const evidence = snapshot
    ? buildEvidence(snapshot)
    : [];
  const recommendations = snapshot
    ? buildRecommendations(snapshot)
    : [];
  const confidence = resolveConfidence(evidence, contextItems, messages);
  const readiness = resolveReadiness(snapshot?.readiness ?? null, contextItems.length);
  const generatedAt = new Date().toISOString();

  return {
    actions: [],
    assistantTrend: buildAssistantTrend(messages),
    chatMessages: messages,
    context: {
      locale: 'pl',
      ...(snapshot?.dateRange ? { range: snapshot.dateRange } : {}),
      tenantId: scope.tenantId ?? 'unresolved-tenant',
      ...(scope.userId ? { userId: scope.userId } : {}),
      workspaceId: scope.workspaceId ?? snapshot?.workspaceId ?? 'unresolved-workspace',
    },
    contextItems,
    decisions: [],
    elementThreads: contextItems.map((item) => ({
      elementId: item.id,
      elementKind: item.kind,
      elementLabel: item.label,
      messages: [],
      status: item.confidence >= 0.85
        ? 'ready'
        : isRuntimeConfidenceAtLeastAttention(item.confidence)
          ? 'partial'
          : 'blocked',
    })),
    evidence,
    generatedAt,
    labExperiments: [],
    memory: buildMemory(messages),
    modeRecords: [],
    recommendations,
    reports: reports.map(mapRuntimeReport),
    sources: buildSources(evidence, snapshot),
    statuses: buildStatuses({
      confidence,
      contextItems,
      evidence,
      generatedAt,
      readiness,
      snapshot,
    }),
    summary: {
      confidence,
      contextItems: contextItems.length,
      decisionsDue: recommendations.filter((item) => item.status === 'needs-approval').length,
      evidenceCount: evidence.length,
      readiness,
    },
  };
}

function buildContextItems(
  snapshot: PapaScreenContextSnapshot,
): readonly PapaContextItem[] {
  const source = uniqueById([
    ...snapshot.metrics,
    ...snapshot.elements,
    ...snapshot.tables,
  ]);

  return source.map((item) => ({
    confidence: resolveRuntimeElementConfidence(item),
    id: item.id,
    kind: resolveContextKind(item),
    label: item.label,
    retention: 'Zgodnie z retencją rozmowy',
    source: item.source ?? item.description ?? snapshot.title,
  }));
}

function buildEvidence(
  snapshot: PapaScreenContextSnapshot,
): readonly PapaEvidenceItem[] {
  return uniqueById(snapshot.evidence).map((item) => ({
    claim: item.label,
    confidence: resolveRuntimeElementConfidence(item),
    freshnessAt: snapshot.capturedAt,
    id: item.id,
    source: item.source ?? item.description ?? snapshot.title,
  }));
}

function buildRecommendations(
  snapshot: PapaScreenContextSnapshot,
): readonly PapaRecommendationRecord[] {
  return uniqueById(snapshot.recommendations).map((item) => ({
    effort: resolveRecommendationEffort(item),
    evidenceIds: item.evidenceIds ?? [],
    id: item.id,
    impact: resolveImpact(item.value),
    nextStep: item.value ?? item.description ?? 'Zweryfikuj rekomendację i dowody.',
    owner: resolveRecommendationOwner(item),
    risk: resolveRecommendationRisk(item),
    status: resolveRecommendationStatus(item.status),
    summary: item.description ?? 'Rekomendacja pochodzi z bieżącego kontekstu ekranu.',
    title: item.label,
  }));
}


function resolveRuntimeElementConfidence(
  item: PapaScreenContextElement,
): number {
  const explicit = readRuntimeElementText(item, 'confidence');
  const parsedExplicit = parseConfidence(explicit);
  if (parsedExplicit !== null) return parsedExplicit;

  const parsedStatus = parseConfidence(item.status);
  if (parsedStatus !== null) return parsedStatus;

  return 0;
}

function resolveRecommendationEffort(
  item: PapaScreenContextElement,
): PapaRecommendationRecord['effort'] {
  return resolveKnownLevel(readRuntimeElementText(item, 'effort')) ?? 'low';
}

function resolveRecommendationRisk(
  item: PapaScreenContextElement,
): PapaRecommendationRecord['risk'] {
  return resolveKnownLevel(readRuntimeElementText(item, 'risk')) ?? 'low';
}

function resolveRecommendationOwner(
  item: PapaScreenContextElement,
): string {
  return item.owner ?? 'Nie przypisano właściciela w danych domenowych';
}

function resolveKnownLevel(
  value: string | null,
): 'low' | 'medium' | 'high' | null {
  const normalized = value?.toLowerCase() ?? '';
  if (!normalized) return null;
  if (normalized.includes('high') || normalized.includes('wysok')) return 'high';
  if (normalized.includes('medium') || normalized.includes('śred')) return 'medium';
  if (normalized.includes('low') || normalized.includes('nis')) return 'low';
  return null;
}

function readRuntimeElementText(
  item: PapaScreenContextElement,
  key: string,
): string | null {
  const value = (item as unknown as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}



const PAPA_RUNTIME_CONFIDENCE_READY_THRESHOLD = 17 / 20;
const PAPA_RUNTIME_CONFIDENCE_ATTENTION_THRESHOLD = 1 / 2;

function isRuntimeConfidenceAtLeastAttention(confidence: unknown): boolean {
  return typeof confidence === "number"
    && Number.isFinite(confidence)
    && confidence >= PAPA_RUNTIME_CONFIDENCE_ATTENTION_THRESHOLD;
}

function resolveRuntimeConfidenceState(
  confidence: unknown,
): "attention" | "blocked" | "ready" {
  if (typeof confidence !== "number" || !Number.isFinite(confidence)) {
    return "blocked";
  }

  if (confidence >= PAPA_RUNTIME_CONFIDENCE_READY_THRESHOLD) {
    return "ready";
  }

  return isRuntimeConfidenceAtLeastAttention(confidence)
    ? "attention"
    : "blocked";
}

function buildAssistantTrend(
  messages: readonly PapaChatMessage[],
): readonly PapaAssistantTrendDatum[] {
  const points = messages
    .filter((message) => message.author === 'assistant' && message.confidence !== undefined && message.confidence !== null)
    .slice(-6);

  return points.map((message, index) => {
    const actual = Math.round((message.confidence ?? 0) * 100);
    const previous = points.slice(0, index + 1)
      .map((item) => Math.round((item.confidence ?? 0) * 100));
    const movingAverage = Math.round(
      previous.reduce((sum, value) => sum + value, 0) / previous.length,
    );

    return {
      actual,
      label: new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'short',
      }).format(new Date(message.createdAt)),
      movingAverage,
      plan: 90,
    };
  });
}

function buildMemory(
  messages: readonly PapaChatMessage[],
): readonly PapaMemoryRecord[] {
  return messages.slice(-20).reverse().map((message) => ({
    event: summarize(message.body),
    id: `memory-${message.id}`,
    retention: 'Retencja rozmowy',
    source: message.author === 'assistant'
      ? 'Odpowiedź Papa'
      : message.author === 'user'
        ? 'Pytanie użytkownika'
        : 'Zdarzenie systemowe',
    timestamp: message.createdAt,
  }));
}

function mapRuntimeReport(
  report: PapaAssistantReportArtifact,
): PapaReportArtifact {
  return {
    datasets: ['metric_snapshots'],
    description: report.description,
    formats: ['csv'],
    generatedAt: report.generatedAt,
    id: report.id,
    owner: report.owner,
    status: report.status === 'ready'
      ? 'ready'
      : report.status === 'failed'
        ? 'stale'
        : 'building',
    title: report.title,
  };
}

function buildSources(
  evidence: readonly PapaEvidenceItem[],
  snapshot: PapaScreenContextSnapshot | null,
) {
  const grouped = new Map<string, PapaEvidenceItem[]>();
  evidence.forEach((item) => {
    const items = grouped.get(item.source) ?? [];
    grouped.set(item.source, [...items, item]);
  });

  return [...grouped.entries()].map(([source, items]) => ({
    completeness: Math.max(0, Math.min(1,
      items.reduce((sum, item) => sum + item.confidence, 0) / items.length,
    )),
    dataset: source,
    lastSyncAt: items[0]?.freshnessAt ?? snapshot?.capturedAt ?? new Date().toISOString(),
    provider: source,
  }));
}

function buildStatuses({
  confidence,
  contextItems,
  evidence,
  generatedAt,
  readiness,
  snapshot,
}: {
  readonly confidence: number;
  readonly contextItems: readonly PapaContextItem[];
  readonly evidence: readonly PapaEvidenceItem[];
  readonly generatedAt: string;
  readonly readiness: ReadinessState;
  readonly snapshot: PapaScreenContextSnapshot | null;
}): readonly PapaAssistantStatus[] {
  const readinessState: PapaAssistantStatus['state'] = readiness === 'ready'
    ? 'ready'
    : readiness === 'blocked' || readiness === 'sourceError'
      ? 'blocked'
      : 'attention';

  return [
    {
      description: snapshot
        ? `Kontekst pochodzi z realnego snapshotu „${snapshot.title}”.`
        : 'Brak zapisanego snapshotu. Papa nie powinien generować analizy kontekstowej.',
      evidenceIds: evidence.map((item) => item.id),
      id: 'papa-runtime-readiness',
      metric: 'Gotowość',
      owner: 'Papa Asystent',
      state: readinessState,
      title: 'Gotowość kontekstu',
      updatedAt: generatedAt,
      value: snapshot ? `${contextItems.length} elementów` : 'Brak snapshotu',
    },
    {
      description: evidence.length > 0
        ? 'Dowody pochodzą z aktywnego kontekstu ekranu i są przekazywane do odpowiedzi.'
        : 'Brak dowodów w aktywnym kontekście.',
      evidenceIds: evidence.map((item) => item.id),
      id: 'papa-runtime-evidence',
      metric: 'Dowody',
      owner: 'Źródła danych',
      state: evidence.length > 0 ? 'ready' : 'attention',
      title: 'Dowody i pochodzenie',
      updatedAt: generatedAt,
      value: `${evidence.length} źródeł`,
    },
    {
      description: 'Pewność jest liczona z realnych dowodów/kontekstu lub odpowiedzi backendu, bez danych demonstracyjnych.',
      evidenceIds: evidence.map((item) => item.id),
      id: 'papa-runtime-confidence',
      metric: 'Pewność',
      owner: 'Papa Asystent',
      state: resolveRuntimeConfidenceState(confidence),
      title: 'Pewność odpowiedzi',
      updatedAt: generatedAt,
      value: `${Math.round(confidence * 100)}%`,
    },
  ];
}

function resolveConfidence(
  evidence: readonly PapaEvidenceItem[],
  contextItems: readonly PapaContextItem[],
  messages: readonly PapaChatMessage[],
): number {
  const latestAnswer = [...messages]
    .reverse()
    .find((message) => message.author === 'assistant' && message.confidence !== undefined && message.confidence !== null);
  if (latestAnswer?.confidence !== undefined && latestAnswer.confidence !== null) {
    return clamp(latestAnswer.confidence);
  }
  const values = evidence.length > 0
    ? evidence.map((item) => item.confidence)
    : contextItems.map((item) => item.confidence);
  if (values.length === 0) return 0;
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function resolveReadiness(
  value: string | null,
  contextCount: number,
): ReadinessState {
  const normalized = value?.toLowerCase() ?? '';
  if (normalized.includes('ready') || normalized.includes('gotow')) return 'ready';
  if (normalized.includes('block') || normalized.includes('zablok')) return 'blocked';
  if (normalized.includes('stale') || normalized.includes('nieświe')) return 'stale';
  if (normalized.includes('process') || normalized.includes('przetwarz')) return 'processing';
  if (normalized.includes('error') || normalized.includes('błąd')) return 'sourceError';
  if (normalized.includes('partial') || normalized.includes('części')) return 'partial';
  return contextCount > 0 ? 'partial' : 'noData';
}

function resolveContextKind(
  item: PapaScreenContextElement,
): PapaContextItem['kind'] {
  switch (item.kind) {
    case 'metric':
      return 'metric';
    case 'decision':
      return 'decision';
    case 'recommendation':
      return 'decision';
    default:
      return 'record';
  }
}

function resolveRecommendationStatus(
  status: string | null | undefined,
): PapaRecommendationRecord['status'] {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized.includes('block')) return 'blocked';
  if (normalized.includes('approval') || normalized.includes('akcept')) return 'needs-approval';
  if (normalized.includes('draft') || normalized.includes('szkic')) return 'draft';
  return 'recommended';
}

function resolveRisk(
  status: string | null | undefined,
): PapaRecommendationRecord['risk'] {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized.includes('critical') || normalized.includes('high') || normalized.includes('wysok')) return 'high';
  if (normalized.includes('medium') || normalized.includes('warning') || normalized.includes('śred')) return 'medium';
  return 'low';
}

function resolveImpact(
  value: string | null | undefined,
): PapaRecommendationRecord['impact'] {
  const normalized = value?.toLowerCase() ?? '';
  if (normalized.includes('high') || normalized.includes('wysok')) return 'high';
  if (normalized.includes('medium') || normalized.includes('śred')) return 'medium';
  return 'low';
}

function parseConfidence(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*%/u);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(',', '.')) / 100;
  return Number.isFinite(parsed) ? clamp(parsed) : null;
}

function uniqueById<T extends { readonly id: string }>(
  values: readonly T[],
): readonly T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value.id)) return false;
    seen.add(value.id);
    return true;
  });
}

function summarize(value: string): string {
  const compact = value.replace(/\s+/gu, ' ').trim();
  return compact.length > 120 ? `${compact.slice(0, 117)}...` : compact;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
