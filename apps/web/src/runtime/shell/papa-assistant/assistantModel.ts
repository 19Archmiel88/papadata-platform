import type { PapaAnswerRecord } from '../../shared/api/bffClient';
import type { PapaScreenContextSnapshot, PapaScreenContextElement } from './ScreenContextProvider';

export const assistantModes = [
  { id: 'brief', label: 'Szybki brief', prompt: 'Podsumuj wynik, najważniejszą zmianę i następny krok.' },
  { id: 'interpretation', label: 'Interpretacja', prompt: 'Wyjaśnij wynik i jego znaczenie dla biznesu.' },
  { id: 'diagnosis', label: 'Diagnoza', prompt: 'Wskaż możliwe przyczyny, dowody i luki danych.' },
  { id: 'decision', label: 'Decyzja', prompt: 'Porównaj warianty decyzji, ryzyko i dowody.' },
  { id: 'report', label: 'Raport', prompt: 'Przygotuj treść raportu: wynik, dowody, ograniczenia i wnioski.' },
  { id: 'plan', label: 'Plan działań', prompt: 'Przygotuj plan z właścicielem, terminem i sposobem pomiaru.' },
] as const;
export type WorkMode = typeof assistantModes[number]['id'];
export const assistantViews = ['Rozmowa', 'Kontekst', 'Dowody', 'Laboratorium', 'Propozycje', 'Obserwacje', 'Raporty', 'Działania', 'Historia', 'Ustawienia AI'] as const;
export type AssistantView = typeof assistantViews[number];
export type AssistantMessage = PapaAnswerRecord & { readonly elementId?: string };
export type ActionProposal = {
  readonly id: string; readonly operationId: string; readonly status: string;
  readonly targetRef: unknown; readonly beforeState: unknown; readonly proposedAfterState: unknown;
  readonly diff: unknown; readonly evidence: unknown; readonly simulation: unknown; readonly limits: unknown;
};
export type AssistantHistory = { readonly eventId: string; readonly description: string; readonly occurredAt: string };

export const contextGroups = ['metrics', 'charts', 'tables', 'recommendations', 'evidence', 'elements'] as const;
export function contextItems(snapshot: PapaScreenContextSnapshot | null): readonly PapaScreenContextElement[] {
  return snapshot ? [...new Map(contextGroups.flatMap(key => snapshot[key]).map(item => [item.id, item])).values()] : [];
}
export function selectContext(snapshot: PapaScreenContextSnapshot, excluded: readonly string[]): PapaScreenContextSnapshot {
  const result = { ...snapshot };
  for (const key of contextGroups) result[key] = snapshot[key].filter(item => !excluded.includes(item.id));
  return result;
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function parseActions(payload: unknown): readonly ActionProposal[] {
  if (!isRecord(payload) || !Array.isArray(payload.actions)) throw new Error('Nieprawidłowa odpowiedź listy działań.');
  return payload.actions.map(row => {
    if (!isRecord(row) || typeof row.id !== 'string' || typeof row.status !== 'string') throw new Error('Nieprawidłowa propozycja działania.');
    return { id: row.id, status: row.status, operationId: typeof row.operationId === 'string' ? row.operationId : 'Operacja bez nazwy',
      targetRef: row.targetRef, beforeState: row.beforeState, proposedAfterState: row.proposedAfterState,
      diff: row.diff, evidence: row.evidence, simulation: row.simulation, limits: row.limits };
  });
}
export function parseHistory(payload: unknown): readonly AssistantHistory[] {
  if (!isRecord(payload) || !Array.isArray(payload.timeline)) throw new Error('Nieprawidłowa odpowiedź historii.');
  return payload.timeline.flatMap(row => isRecord(row) && typeof row.eventId === 'string' && typeof row.description === 'string' && typeof row.occurredAt === 'string'
    ? [{ eventId: row.eventId, description: row.description, occurredAt: row.occurredAt }] : []);
}
export type LabCase = {
  readonly id: string; readonly title: string; readonly type: string; readonly severity: string; readonly status: string;
};
export type LabRecommendation = {
  readonly id: string; readonly caseId: string | null; readonly title: string; readonly summary: string;
  readonly riskLevel: string; readonly effortLevel: string; readonly confidence: number | null; readonly status: string;
};
export type LabDecision = {
  readonly id: string; readonly caseId: string | null; readonly status: string; readonly decision: string; readonly rationale: string;
};
export type LabOutcome = {
  readonly id: string; readonly caseId: string | null; readonly status: string; readonly measuredOutcome: unknown; readonly expectedOutcome: unknown;
};
export type LabExperiment = {
  readonly id: string; readonly caseId: string | null; readonly title: string; readonly hypothesis: string;
  readonly variantConfig: unknown; readonly status: string; readonly measuredOutcome: unknown; readonly expectedOutcome: unknown;
};
export type LabResult = {
  readonly cases: readonly LabCase[]; readonly recommendations: readonly LabRecommendation[]; readonly decisions: readonly LabDecision[];
  readonly outcomes: readonly LabOutcome[]; readonly experiments: readonly LabExperiment[];
};
function stringField(row: Record<string, unknown>, key: string, fallback = ''): string {
  return typeof row[key] === 'string' ? row[key] as string : fallback;
}
function nullableStringField(row: Record<string, unknown>, key: string): string | null {
  return typeof row[key] === 'string' ? row[key] as string : null;
}
function numberField(row: Record<string, unknown>, key: string): number | null {
  return typeof row[key] === 'number' ? row[key] : null;
}
export function parseLab(payload: unknown): LabResult {
  if (!isRecord(payload) || !Array.isArray(payload.cases) || !Array.isArray(payload.recommendations)
    || !Array.isArray(payload.decisions) || !Array.isArray(payload.outcomes) || !Array.isArray(payload.experiments))
    throw new Error('Nieprawidłowa odpowiedź Laboratorium.');
  const rows = (key: string): readonly Record<string, unknown>[] => (payload[key] as unknown[]).filter(isRecord);
  return {
    cases: rows('cases').map(row => ({ id: stringField(row, 'id'), title: stringField(row, 'title'), type: stringField(row, 'type'), severity: stringField(row, 'severity'), status: stringField(row, 'status') })),
    decisions: rows('decisions').map(row => ({ id: stringField(row, 'id'), caseId: nullableStringField(row, 'caseId'), status: stringField(row, 'status'), decision: stringField(row, 'decision'), rationale: stringField(row, 'rationale') })),
    experiments: rows('experiments').map(row => ({ id: stringField(row, 'id'), caseId: nullableStringField(row, 'caseId'), title: stringField(row, 'title'), hypothesis: stringField(row, 'hypothesis'), variantConfig: row.variantConfig, status: stringField(row, 'status'), measuredOutcome: row.measuredOutcome, expectedOutcome: row.expectedOutcome })),
    outcomes: rows('outcomes').map(row => ({ id: stringField(row, 'id'), caseId: nullableStringField(row, 'caseId'), status: stringField(row, 'status'), measuredOutcome: row.measuredOutcome, expectedOutcome: row.expectedOutcome })),
    recommendations: rows('recommendations').map(row => ({ id: stringField(row, 'id'), caseId: nullableStringField(row, 'caseId'), title: stringField(row, 'title'), summary: stringField(row, 'summary'), riskLevel: stringField(row, 'riskLevel'), effortLevel: stringField(row, 'effortLevel'), confidence: numberField(row, 'confidence'), status: stringField(row, 'status') })),
  };
}
export type ProposalRecord = {
  readonly id: string; readonly title: string; readonly summary: string; readonly nextStep: string | null;
  readonly riskLevel: string; readonly effortLevel: string; readonly confidence: number | null; readonly status: string;
};
export function parseProposals(payload: unknown): readonly ProposalRecord[] {
  if (!isRecord(payload) || !Array.isArray(payload.records)) throw new Error('Nieprawidłowa odpowiedź propozycji.');
  return payload.records.filter(isRecord).map(row => ({
    id: stringField(row, 'id'), title: stringField(row, 'title'), summary: stringField(row, 'summary'),
    nextStep: nullableStringField(row, 'nextStep'), riskLevel: stringField(row, 'riskLevel'), effortLevel: stringField(row, 'effortLevel'),
    confidence: numberField(row, 'confidence'), status: stringField(row, 'status'),
  }));
}
export type ObservationRecord = {
  readonly id: string; readonly content: string; readonly confidence: number | null; readonly createdAt: string;
};
export function parseObservations(payload: unknown): readonly ObservationRecord[] {
  if (!isRecord(payload) || !Array.isArray(payload.records)) throw new Error('Nieprawidłowa odpowiedź obserwacji.');
  // papa.observations.read maps DB rows through the same
  // toPapaObservationRecord()/PapaConversationRecord shape used elsewhere
  // (messageId, content, createdAt, confidence, ...), not raw DB columns.
  return payload.records.filter(isRecord).map(row => ({
    id: stringField(row, 'messageId'), content: stringField(row, 'content'),
    confidence: numberField(row, 'confidence'), createdAt: stringField(row, 'createdAt'),
  }));
}
export function canReviewAction(status: string): boolean { return ['proposed', 'validated', 'approval_required'].includes(status); }
export function isAssistantPath(path: string): boolean {
  const pathname = path.split('?')[0];
  return pathname === '/app/assistant' || pathname?.startsWith('/app/assistant/') === true
    || (pathname?.startsWith('/app/papa/') === true && pathname !== '/app/papa/raporty');
}

/** A late answer must never repopulate a reset conversation or an unmounted workspace. */
export class RequestEpoch {
  private version = 0;
  start(): number { return ++this.version; }
  invalidate(): void { this.version++; }
  isCurrent(version: number): boolean { return this.version === version; }
}

export function parseSnapshot(value: unknown): PapaScreenContextSnapshot | null {
  if (!isRecord(value) || typeof value.snapshotId !== 'string' || typeof value.title !== 'string' || typeof value.route !== 'string'
    || !value.route.startsWith('/app') || typeof value.capturedAt !== 'string' || typeof value.dateRangeLabel !== 'string'
    || typeof value.workspaceName !== 'string' || ![...contextGroups, 'filters'].every(key => Array.isArray(value[key]) && value[key].every((item: unknown) => isRecord(item) && typeof item.id === 'string' && typeof item.label === 'string' && typeof item.kind === 'string')))
    return null;
  return value as unknown as PapaScreenContextSnapshot;
}
