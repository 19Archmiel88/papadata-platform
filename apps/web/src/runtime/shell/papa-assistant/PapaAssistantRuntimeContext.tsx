import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode, SetStateAction } from 'react';
import type { BffReportRecord, PapaReportDefinitionRow } from '../../shared/api/bffClient';
import type { PapaScreenContextSnapshot } from './ScreenContextProvider';
import { assistantModes, RequestEpoch, selectContext, isRecord, parseSnapshot } from './assistantModel';
import type { AssistantMessage, WorkMode, AssistantView } from './assistantModel';
import { createDemoAssistantGateway, liveAssistantGateway } from './assistantGateway';
import type { AssistantGateway } from './assistantGateway';

export type PapaAssistantMode = 'screen' | 'element' | 'report';
export type PapaAssistantOpenAction = 'analyze-screen' | 'open' | 'open-element' | 'report';
export type PapaAssistantOpenRequest = { readonly action: PapaAssistantOpenAction; readonly elementId?: string | null; readonly id: string; readonly mode?: PapaAssistantMode | null };
export type PapaAssistantRuntimeScope = { readonly tenantId: string | null; readonly userId: string | null; readonly workspaceId: string | null };
export type RunPapaCommand = <T>(operation: () => Promise<T>) => Promise<T>;
const directCommand: RunPapaCommand = operation => operation();
const emptyScope: PapaAssistantRuntimeScope = { tenantId: null, userId: null, workspaceId: null };

type RuntimeState = {
  view: AssistantView; conversationId: string | null; parentConversationId: string | null; messages: readonly AssistantMessage[];
  caseThreadIds: Readonly<Record<string, string>>; snapshot: PapaScreenContextSnapshot | null;
  excluded: readonly string[]; mode: WorkMode; draft: string; selectedElementId: string | null;
  busy: boolean; activity: string; error: string | null;
  reports: readonly BffReportRecord[]; definitions: readonly PapaReportDefinitionRow[];
};
const initialState: RuntimeState = { view: 'Rozmowa', conversationId: null, parentConversationId: null, messages: [], caseThreadIds: {},
  snapshot: null, excluded: [], mode: 'brief', draft: '', selectedElementId: null, busy: false, activity: '', error: null, reports: [], definitions: [] };
type Runtime = RuntimeState & {
  demo: boolean; scope: PapaAssistantRuntimeScope; gateway: AssistantGateway; runCommand: RunPapaCommand;
  setView: (view: AssistantView) => void;
  restoreConversation: (id: string) => Promise<void>;
  setDraft: (draft: string) => void; setMode: (mode: WorkMode) => void;
  setContext: (snapshot: PapaScreenContextSnapshot, elementId?: string | null) => void;
  toggleContext: (id: string) => void; selectElement: (id: string | null) => void;
  submit: (prompt?: string) => Promise<void>; stop: () => void; reset: (branch?: boolean) => void;
  saveReport: (name: string) => Promise<void>; exportReport: (format: 'csv' | 'pdf' | 'xlsx') => Promise<void>;
  refreshReports: () => Promise<void>; downloadReport: (report: BffReportRecord) => Promise<void>;
};
const RuntimeContext = createContext<Runtime | null>(null);

export function PapaAssistantRuntimeProvider({ children, scope = emptyScope, demo = false, gateway, runCommand = directCommand }: {
  readonly children: ReactNode; readonly scope?: PapaAssistantRuntimeScope; readonly demo?: boolean;
  readonly gateway?: AssistantGateway; readonly runCommand?: RunPapaCommand;
}) {
  // Remount the entire consumer tree before a different workspace can render old state.
  const key = JSON.stringify([scope.tenantId, scope.workspaceId, scope.userId, demo]);
  return <ScopedRuntime key={key} scope={scope} demo={demo} gateway={gateway} runCommand={runCommand}>{children}</ScopedRuntime>;
}
function ScopedRuntime({ children, scope, demo, gateway: providedGateway, runCommand }: {
  children: ReactNode; scope: PapaAssistantRuntimeScope; demo: boolean; gateway?: AssistantGateway; runCommand: RunPapaCommand;
}) {
  const [gateway] = useState(() => providedGateway ?? (demo ? createDemoAssistantGateway() : liveAssistantGateway));
  const storageKey = !demo && scope.tenantId && scope.workspaceId && scope.userId
    ? `papadata.papa-assistant.v5:${JSON.stringify(scope)}` : null;
  const [state, setReactState] = useState<RuntimeState>(() => {
    try {
      const parsed: unknown = storageKey ? JSON.parse(localStorage.getItem(storageKey) ?? 'null') : null;
      const id = parsed && typeof parsed === 'object' && 'conversationId' in parsed ? parsed.conversationId : null;
      return { ...initialState, conversationId: typeof id === 'string' ? id : null };
    } catch { return initialState; }
  });
  const stateRef = useRef(state);
  const alive = useRef(true);
  const epoch = useRef(new RequestEpoch());
  const abort = useRef<AbortController | null>(null);
  const runRef = useRef(runCommand);
  runRef.current = runCommand;
  const setState = useCallback((update: SetStateAction<RuntimeState>) => {
    if (!alive.current) return;
    const next = typeof update === 'function' ? update(stateRef.current) : update;
    stateRef.current = next;
    setReactState(next);
  }, []);
  useEffect(() => { alive.current = true; return () => { alive.current = false; epoch.current.invalidate(); abort.current?.abort(); }; }, []);
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ conversationId: state.conversationId })); } catch { /* Optional continuity only; server owns history. */ }
  }, [storageKey, state.conversationId]);
  useEffect(() => {
    if (!state.conversationId || state.messages.length) return;
    let active = true;
    const conversationId = state.conversationId;
    void Promise.all([gateway.readPapaAnswers(conversationId), gateway.readResource(`/api/v1/papa/context-basket?conversationId=${encodeURIComponent(conversationId)}`)]).then(([result, basket]) => {
      const snapshot = isRecord(basket) && isRecord(basket.latest) ? parseSnapshot(basket.latest.snapshot) : null;
      if (active && stateRef.current.conversationId === conversationId && !stateRef.current.busy) setState(s => ({ ...s, messages: [...result.records].reverse(), snapshot: s.snapshot ?? snapshot }));
    }).catch(error => { if (active) setState(s => ({ ...s, error: messageOf(error) })); });
    return () => { active = false; };
  }, [gateway, state.conversationId, setState]);

  const stop = useCallback(() => {
    epoch.current.invalidate(); abort.current?.abort();
    setState(s => ({ ...s, busy: false, activity: 'Oczekiwanie przerwane. Operacja mogła już dotrzeć do serwera.' }));
  }, [setState]);
  const reset = (branch = false) => {
    stop();
    setState(s => ({ ...initialState, snapshot: s.snapshot, excluded: s.excluded,
      parentConversationId: branch ? s.conversationId : null, reports: s.reports, definitions: s.definitions }));
  };
  const submit = async (prompt = stateRef.current.draft) => {
    const current = stateRef.current;
    if (!prompt.trim() || current.busy) return;
    if (!current.snapshot) { setState(s => ({ ...s, error: 'Dodaj kontekst ekranu przed wysłaniem pytania.' })); return; }
    const version = epoch.current.start();
    const controller = new AbortController(); abort.current = controller;
    const snapshot = selectContext(current.snapshot, current.excluded);
    const requestId = crypto.randomUUID();
    const mode = assistantModes.find(item => item.id === current.mode)!;
    const userMessage: AssistantMessage = { messageId: requestId, role: 'user', content: prompt.trim(), createdAt: new Date().toISOString(),
      status: 'completed', confidence: null, riskLevel: 'low', approvalRequired: false, evidence: [], limitations: [], actionId: null,
      ...(current.selectedElementId ? { elementId: current.selectedElementId } : {}) };
    setState(s => ({ ...s, busy: true, error: null, activity: 'Zapisywanie kontekstu…', messages: [...s.messages, userMessage] }));
    const valid = () => alive.current && epoch.current.isCurrent(version);
    try {
      const capture = await runRef.current(() => gateway.capturePapaContext({ captureReason: 'assistant-message',
        conversationId: current.conversationId, parentConversationId: current.parentConversationId,
        snapshot, title: snapshot.title, idempotencyKey: `papa-context-${requestId}`, signal: controller.signal }));
      if (!valid()) return;
      let caseThreadId = current.selectedElementId ? current.caseThreadIds[current.selectedElementId] ?? null : null;
      if (current.selectedElementId) {
        const item = snapshot.elements.concat(snapshot.metrics, snapshot.charts, snapshot.tables, snapshot.recommendations, snapshot.evidence).find(item => item.id === current.selectedElementId);
        const child = await runRef.current(() => gateway.capturePapaContext({ captureReason: `case:${current.selectedElementId}`,
          conversationId: caseThreadId, parentConversationId: capture.conversationId,
          snapshot: { ...snapshot, caseElementId: current.selectedElementId }, title: item?.label ?? 'Sprawa Papa',
          idempotencyKey: `papa-case-${requestId}`, signal: controller.signal }));
        if (!valid()) return;
        caseThreadId = child.conversationId;
      }
      setState(s => ({ ...s, conversationId: capture.conversationId, activity: 'Papa analizuje wybrany kontekst…',
        caseThreadIds: current.selectedElementId && caseThreadId ? { ...s.caseThreadIds, [current.selectedElementId]: caseThreadId } : s.caseThreadIds }));
      const result = await runRef.current(() => gateway.generatePapaAnswer({ conversationId: capture.conversationId,
        caseThreadId, parentConversationId: current.parentConversationId,
        prompt: `[${mode.label}] ${mode.prompt}\n\n${prompt.trim()}`, idempotencyKey: `papa-answer-${requestId}`, signal: controller.signal }));
      if (!valid()) return;
      setState(s => ({ ...s, busy: false, draft: s.draft === prompt ? '' : s.draft, activity: result.record.status === 'blocked' ? 'Odpowiedź ograniczona przez brak danych lub uprawnień.' : 'Odpowiedź gotowa.',
        messages: [...s.messages, { ...result.record, ...(current.selectedElementId ? { elementId: current.selectedElementId } : {}) }] }));
    } catch (error) {
      if (valid()) setState(s => ({ ...s, busy: false, error: messageOf(error), activity: 'Nie udało się zakończyć odpowiedzi. Pytanie pozostało w formularzu.' }));
    }
  };
  const operation = async (label: string, fn: () => Promise<void>) => {
    if (stateRef.current.busy) return;
    const version = epoch.current.start();
    setState(s => ({ ...s, busy: true, error: null, activity: label }));
    try { await fn(); if (epoch.current.isCurrent(version)) setState(s => ({ ...s, busy: false, activity: 'Operacja zakończona.' })); }
    catch (error) { if (epoch.current.isCurrent(version)) setState(s => ({ ...s, busy: false, error: messageOf(error), activity: 'Operacja nie powiodła się.' })); }
  };
  const restoreConversation = async (id: string) => {
    await operation('Otwieranie rozmowy…', async () => {
      const [answers, basket] = await Promise.all([gateway.readPapaAnswers(id), gateway.readResource(`/api/v1/papa/context-basket?conversationId=${encodeURIComponent(id)}`)]);
      const snapshot = isRecord(basket) && isRecord(basket.latest) ? parseSnapshot(basket.latest.snapshot) : null;
      if (!snapshot) throw new Error('Nie udało się odtworzyć kontekstu tej rozmowy.');
      setState(s => ({ ...s, conversationId: id, parentConversationId: null, messages: [...answers.records].reverse(), snapshot, excluded: [], caseThreadIds: {}, selectedElementId: null, draft: '', view: 'Rozmowa' }));
    });
  };
  const refreshReports = async () => {
    await operation('Wczytywanie biblioteki…', async () => {
      const result = await gateway.readPapaReportDefinitions({ limit: 50 });
      setState(s => ({ ...s, definitions: result.reports }));
    });
  };
  const saveReport = async (name: string) => {
    if (!name.trim()) return;
    await operation('Zapisywanie szkicu raportu…', async () => {
      const s = stateRef.current;
      if (!s.snapshot?.dateRange) throw new Error('Brak okresu raportu. Dodaj kontekst ekranu.');
      const snapshot = selectContext(s.snapshot, s.excluded);
      const answer = [...s.messages].reverse().find(m => m.role === 'assistant');
      const record = await runRef.current(() => gateway.upsertPapaReportDefinition({
        idempotencyKey: `papa-draft-${crypto.randomUUID()}`, name: name.trim(), description: answer?.content ?? snapshot.summary,
        visibility: 'private', status: 'draft', chartTypes: snapshot.charts.map(item => item.kind),
        metricSelection: snapshot.metrics.map(item => ({ id: item.id, label: item.label })),
        layout: [{ type: 'summary', content: answer?.content ?? snapshot.summary }], filters: { screen: snapshot.route, filters: snapshot.filters }, dateRange: { ...snapshot.dateRange },
      }));
      setState(v => ({ ...v, definitions: [record, ...v.definitions.filter(item => item.id !== record.id)] }));
    });
  };
  const exportReport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    await operation('Zlecanie generowania raportu…', async () => {
      const s = stateRef.current;
      if (!s.snapshot?.dateRange) throw new Error('Brak zakresu dat raportu.');
      const snapshot = selectContext(s.snapshot, s.excluded);
      const report = await runRef.current(() => gateway.createPapaReport({ dateFrom: snapshot.dateRange!.from, dateTo: snapshot.dateRange!.to,
        format, idempotencyKey: `papa-export-${crypto.randomUUID()}`, reportType: 'papa-laboratory',
        filters: { snapshotId: snapshot.snapshotId, route: snapshot.route, metricIds: snapshot.metrics.map(i => i.id), chartIds: snapshot.charts.map(i => i.id),
          tableIds: snapshot.tables.map(i => i.id), evidenceIds: snapshot.evidence.map(i => i.id) } }));
      setState(v => ({ ...v, reports: [report, ...v.reports] }));
    });
  };
  const downloadReport = async (report: BffReportRecord) => {
    await operation('Sprawdzanie raportu…', async () => {
      const latest = await gateway.readPapaReport(report.id);
      setState(s => ({ ...s, reports: s.reports.map(item => item.id === latest.id ? latest : item) }));
      if (latest.status !== 'ready') throw new Error(latest.status === 'failed' ? 'Generowanie raportu nie powiodło się.' : 'Raport jest jeszcze przetwarzany. Sprawdź ponownie za chwilę.');
      const result = await runRef.current(() => gateway.getPapaReportDownload(report.id));
      const link = document.createElement('a'); link.href = result.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
    });
  };
  return <RuntimeContext.Provider value={{ ...state, scope, demo, gateway, runCommand,
    restoreConversation, setView: view => setState(s => ({ ...s, view })),
    setDraft: draft => setState(s => ({ ...s, draft })), setMode: mode => setState(s => ({ ...s, mode })),
    setContext: (snapshot, elementId = null) => setState(s => ({ ...s, snapshot, excluded: [], selectedElementId: elementId })),
    toggleContext: id => setState(s => ({ ...s, excluded: s.excluded.includes(id) ? s.excluded.filter(item => item !== id) : [...s.excluded, id], selectedElementId: s.selectedElementId === id ? null : s.selectedElementId })),
    selectElement: selectedElementId => setState(s => ({ ...s, selectedElementId })), submit, stop, reset, saveReport, exportReport, refreshReports, downloadReport,
  }}>{children}</RuntimeContext.Provider>;
}
export function usePapaAssistantRuntime(): Runtime {
  const value = useContext(RuntimeContext);
  if (!value) throw new Error('Papa Asystent wymaga PapaAssistantRuntimeProvider.');
  return value;
}
function messageOf(error: unknown): string { return error instanceof Error ? error.message : 'Nie udało się wykonać operacji Papa.'; }
