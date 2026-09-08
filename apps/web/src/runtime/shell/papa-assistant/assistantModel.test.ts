import { describe, expect, it } from 'vitest';
import { canReviewAction, contextItems, isAssistantPath, parseActions, parseHistory, parseSnapshot, RequestEpoch, selectContext } from './assistantModel';
import type { PapaScreenContextSnapshot } from './ScreenContextProvider';
import { createDemoAssistantGateway } from './assistantGateway';

const snapshot: PapaScreenContextSnapshot = {
  title: 'Przegląd', route: '/app/command-center', screenId: null, summary: null, activeSection: null, breadcrumbs: [],
  operationId: null, readiness: 'ready', dateRange: { from: '2026-08-01', to: '2026-08-31', timezone: 'Europe/Warsaw' }, dateRangeLabel: 'Sierpień', sectionLabel: 'Przegląd',
  updatedAt: '2026-09-08T08:00:00Z', capturedAt: '2026-09-08T08:00:00Z', snapshotId: 'test', captureReason: 'test',
  userLabel: 'User', workspaceId: 'one', workspaceName: 'Workspace', charts: [], tables: [], recommendations: [], elements: [], filters: [], evidence: [],
  metrics: [{ id: 'revenue', label: 'Przychód', kind: 'metric', value: '120', source: 'Demo' }],
};
describe('Papa runtime model', () => {
  it('separates assistant routes and report library, preserving old deep links', () => {
    expect(isAssistantPath('/app/papa')).toBe(false);
    expect(isAssistantPath('/app/reports')).toBe(false);
    expect(isAssistantPath('/app/papa/raporty')).toBe(false);
    expect(isAssistantPath('/app/papa/laboratorium-ai')).toBe(true);
    expect(isAssistantPath('/app/papa/panel-kontekstowy-papa')).toBe(true);
    expect(isAssistantPath('/app/assistant?from=2026-08-01')).toBe(true);
    expect(isAssistantPath('/app/assistant-other')).toBe(false);
  });
  it('drops excluded evidence from outgoing context without mutating source', () => {
    const next = selectContext(snapshot, ['revenue']);
    expect(contextItems(next)).toEqual([]);
    expect(snapshot.metrics).toHaveLength(1);
    expect(next.dateRange).toEqual(snapshot.dateRange);
  });
  it('deduplicates shared KPI references', () => {
    expect(contextItems({ ...snapshot, elements: snapshot.metrics })).toHaveLength(1);
  });
  it('does not turn unavailable or malformed action responses into an empty success', () => {
    expect(() => parseActions({})).toThrow();
    expect(() => parseActions({ actions: [{ id: '1' }] })).toThrow();
    expect(parseActions({ actions: [] })).toEqual([]);
    expect(() => parseHistory({ records: [] })).toThrow();
  });
  it('keeps executed, rejected and unknown proposals outside approval flow', () => {
    for (const state of ['executed', 'rejected', 'approved', 'unknown']) expect(canReviewAction(state)).toBe(false);
    expect(canReviewAction('approval_required')).toBe(true);
  });
  it('invalidates responses after stop, reset, unmount and subsequent request', () => {
    const epoch = new RequestEpoch(); const first = epoch.start();
    expect(epoch.isCurrent(first)).toBe(true); epoch.invalidate();
    expect(epoch.isCurrent(first)).toBe(false);
    const next = epoch.start(); expect(epoch.isCurrent(next)).toBe(true);
    epoch.start(); expect(epoch.isCurrent(next)).toBe(false);
  });
  it('rejects malformed context instead of hydrating unsafe routes or missing arrays', () => {
    expect(parseSnapshot(snapshot)).toEqual(snapshot);
    expect(parseSnapshot({ ...snapshot, route: 'https://outside.example' })).toBeNull();
    expect(parseSnapshot({ ...snapshot, metrics: [null] })).toBeNull();
  });
});
describe('explicit demo gateway', () => {
  it('retains grounded answers within one instance and isolates a different workspace', async () => {
    const a = createDemoAssistantGateway(); const b = createDemoAssistantGateway();
    const capture = await a.capturePapaContext({ snapshot, captureReason: 'test', title: snapshot.title, conversationId: null, parentConversationId: null });
    const result = await a.generatePapaAnswer({ conversationId: capture.conversationId, caseThreadId: null, parentConversationId: null, prompt: 'Wynik?' });
    expect(result.record.evidence[0]?.evidenceId).toBe('revenue');
    expect((await a.readPapaAnswers(capture.conversationId)).records).toHaveLength(2);
    expect((await b.readPapaAnswers(capture.conversationId)).records).toHaveLength(0);
  });
  it('aborts pending answer without saving a fabricated completion', async () => {
    const gateway = createDemoAssistantGateway(); const controller = new AbortController();
    const promise = gateway.generatePapaAnswer({ conversationId: 'one', caseThreadId: null, parentConversationId: null, prompt: 'Pytanie', signal: controller.signal });
    controller.abort(); await expect(promise).rejects.toHaveProperty('name', 'AbortError');
    expect((await gateway.readPapaAnswers('one')).records).toEqual([]);
  });
});
