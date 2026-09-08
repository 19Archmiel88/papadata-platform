import { bffClient } from '../../shared/api/bffClient';
import type { PapaAnswerRecord, PapaReportDefinitionRow } from '../../shared/api/bffClient';
import type { PapaScreenContextSnapshot } from './ScreenContextProvider';
import { contextItems } from './assistantModel';

export type AssistantGateway = Pick<typeof bffClient,
  'capturePapaContext' | 'generatePapaAnswer' | 'readPapaAnswers' | 'readPapaReportDefinitions'
  | 'upsertPapaReportDefinition' | 'createPapaReport' | 'readPapaReport' | 'getPapaReportDownload'
  | 'commandPapaAction' | 'savePapaObservation'> & { readResource: (path: `/api/v1/${string}`) => Promise<unknown> };
export const liveAssistantGateway: AssistantGateway = {
  capturePapaContext: input => bffClient.capturePapaContext(input),
  generatePapaAnswer: input => bffClient.generatePapaAnswer(input),
  readPapaAnswers: id => bffClient.readPapaAnswers(id),
  readPapaReportDefinitions: input => bffClient.readPapaReportDefinitions(input),
  upsertPapaReportDefinition: input => bffClient.upsertPapaReportDefinition(input),
  createPapaReport: input => bffClient.createPapaReport(input),
  readPapaReport: id => bffClient.readPapaReport(id),
  getPapaReportDownload: id => bffClient.getPapaReportDownload(id),
  commandPapaAction: input => bffClient.commandPapaAction(input),
  savePapaObservation: input => bffClient.savePapaObservation(input),
  readResource: path => bffClient.readDomainScreen(path),
};

/** Explicitly isolated demo transport: no live requests, no claims of external execution. */
export function createDemoAssistantGateway(): AssistantGateway {
  const conversations = new Map<string, PapaAnswerRecord[]>();
  const snapshots = new Map<string, PapaScreenContextSnapshot>();
  const definitions = new Map<string, PapaReportDefinitionRow>();
  // Shape matches what papa.observations.read actually returns in
  // production (toPapaObservationRecord()'s PapaConversationRecord), not
  // raw DB columns -- verified against a live backend 2026-09-08.
  const observations: { readonly messageId: string; readonly content: string; readonly confidence: number; readonly createdAt: string }[] = [];
  const now = () => new Date().toISOString();
  let actionStatus = 'approval_required';
  const actions = () => ({ actions: [{ id: 'demo-budget-review', operationId: 'campaigns.budget.review', status: actionStatus,
    targetRef: { campaign: 'Meta • Prospecting' }, beforeState: { dailyBudget: 1000 }, proposedAfterState: { dailyBudget: 900 },
    diff: { dailyBudget: '-100 PLN' }, evidence: ['Koszt rośnie szybciej niż sprzedaż w próbce demonstracyjnej'],
    simulation: { description: 'Scenariusz budżetowy; brak prognozy popytu.' }, limits: { externalExecution: 'blocked' } }] });
  return {
    async capturePapaContext(input) {
      const id = input.conversationId ?? crypto.randomUUID();
      snapshots.set(id, input.snapshot as unknown as PapaScreenContextSnapshot);
      if (!conversations.has(id)) conversations.set(id, []);
      return { conversationId: id, snapshotId: String(input.snapshot.snapshotId) };
    },
    async generatePapaAnswer(input) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 350);
        input.signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Anulowano', 'AbortError')); }, { once: true });
      });
      const id = input.caseThreadId ?? input.conversationId ?? crypto.randomUUID();
      const snapshot = snapshots.get(id) ?? snapshots.get(input.conversationId ?? '');
      const items = contextItems(snapshot ?? null);
      const evidence = items.filter(item => item.kind === 'metric' || item.kind === 'evidence');
      const user: PapaAnswerRecord = { messageId: crypto.randomUUID(), role: 'user', content: input.prompt,
        createdAt: now(), evidence: [], confidence: null, status: 'completed', riskLevel: 'low', approvalRequired: false, actionId: null, limitations: [] };
      const record: PapaAnswerRecord = { ...user, messageId: crypto.randomUUID(), role: 'assistant',
        content: evidence.length ? `### Fakty\n${evidence.map(item => `- ${item.label}: ${item.value ?? item.description ?? 'Dowód do sprawdzenia'}`).join('\n')}\n\n### Interpretacja\nPorównaj zmianę kosztu ze zmianą sprzedaży w tym samym okresie.\n\n### Hipotezy\nZmiana miksu kanałów może wpływać na wynik. Wymaga potwierdzenia.\n\n### Rekomendacje\nSprawdź źródła i przygotuj wariant decyzji.\n\n### Następne kroki\nZapisz raport lub przejdź do propozycji działań.`
          : 'Brakuje dowodów liczbowych. Dodaj KPI lub źródła do kontekstu, zanim wyciągniesz wnioski.',
        evidence: evidence.map(item => ({ evidenceId: item.id, source: item.source ?? 'Dane demonstracyjne', collectedAt: now(), confidence: 0.7 })),
        confidence: evidence.length ? 0.7 : null, status: evidence.length ? 'completed' : 'blocked',
        limitations: ['Odpowiedź demonstracyjna. Nie jest analizą danych produkcyjnych.'] };
      conversations.set(id, [...(conversations.get(id) ?? []), user, record]);
      return { conversationId: input.conversationId ?? id, caseThreadId: input.caseThreadId, messageId: record.messageId, record };
    },
    async readPapaAnswers(id) { const records = [...(conversations.get(id) ?? [])].reverse(); return { records, summary: { total: records.length, ready: records.length, warning: 0, critical: 0, updatedAt: now() } }; },
    async readPapaReportDefinitions() { return { reports: [...definitions.values()], exports: [], schedules: [], pageInfo: { nextCursor: null, total: definitions.size }, summary: {} }; },
    async upsertPapaReportDefinition(input) {
      const record: PapaReportDefinitionRow = { id: input.idempotencyKey, name: input.name, description: input.description ?? null,
        visibility: input.visibility ?? 'private', status: input.status ?? 'draft', currentVersion: 1, chartTypes: input.chartTypes,
        metricSelection: input.metricSelection, layout: input.layout, filters: input.filters ?? {}, dateRange: input.dateRange ?? {}, createdAt: now(), updatedAt: now() };
      definitions.set(record.id, record); return record;
    },
    async createPapaReport() { throw new Error('W demonstracji pobierz CSV kontekstu. PDF/XLSX wymagają uruchomionego generatora raportów.'); },
    async readPapaReport() { throw new Error('Raport serwerowy jest niedostępny w demonstracji.'); },
    async getPapaReportDownload() { throw new Error('Raport serwerowy jest niedostępny w demonstracji.'); },
    async commandPapaAction(input) { actionStatus = input.action === 'approve' ? 'approved' : input.action === 'reject' ? 'rejected' : 'validated'; return actions(); },
    async savePapaObservation(input) {
      const conversationId = input.conversationId ?? crypto.randomUUID();
      observations.unshift({ messageId: crypto.randomUUID(), content: input.content, confidence: 1, createdAt: now() });
      return { conversationId, observationId: observations[0]!.messageId };
    },
    async readResource(path) {
      if (path.includes('context-basket')) { const id = new URL(path, 'http://demo').searchParams.get('conversationId'); const records = [...snapshots].filter(([key]) => !id || key === id).map(([key, snapshot]) => ({ conversationId: key, snapshot })); return { records, latest: records.at(-1) ?? null }; }
      if (path.includes('ai-actions')) return actions();
      if (path.includes('historia-i-pamiec')) return { timeline: [...snapshots].map(([id, snapshot]) => ({ eventId: id, description: snapshot.title, occurredAt: snapshot.capturedAt })) };
      if (path.includes('ustawienia-ai')) return { governance: { aiMode: 'demo', approvalRequiredForExternalEffects: true, externalEffects: { execute: 'blocked', rollback: 'blocked' } }, summary: { description: 'Historia demonstracji trwa do przeładowania strony.' } };
      if (path.includes('laboratorium-ai')) return { cases: [], recommendations: [], decisions: [], outcomes: [], experiments: [] };
      if (path.includes('propozycje-ai')) return { records: [] };
      if (path.includes('obserwacje')) return { records: observations };
      return { records: [] };
    },
  };
}
