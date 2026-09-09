import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode, SetStateAction } from 'react';
import type { BffReportRecord, PapaReportDefinitionRow } from '../../shared/api/bffClient';
import type { PapaScreenContextSnapshot } from './ScreenContextProvider';
import { assistantModes, RequestEpoch, selectContext, isRecord, parseSnapshot } from './assistantModel';
import type { AssistantMessage, WorkMode, AssistantView } from './assistantModel';
import { createDemoAssistantGateway, liveAssistantGateway } from './assistantGateway';
import type { AssistantGateway } from './assistantGateway';
import { safeRandomUUID } from '../../shared/id/safeRandomUUID';

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
  runId: string | null; partialText: string; nativeStreaming: boolean; attachmentIds: readonly string[]; useMemory: boolean;
  reports: readonly BffReportRecord[]; definitions: readonly PapaReportDefinitionRow[];
};
const initialState: RuntimeState = { view: 'Rozmowa', conversationId: null, parentConversationId: null, messages: [], caseThreadIds: {},
  snapshot: null, excluded: [], mode: 'brief', draft: '', selectedElementId: null, busy: false, activity: '', error: null, runId: null, partialText: '', nativeStreaming: false, attachmentIds: [], useMemory: false, reports: [], definitions: [] };
type Runtime = RuntimeState & {
  demo: boolean; scope: PapaAssistantRuntimeScope; gateway: AssistantGateway; runCommand: RunPapaCommand;
  setView: (view: AssistantView) => void;
  ensureConversation: () => Promise<string>; resumeRun: () => Promise<void>; dismissRun: () => void;
  toggleAttachment: (id: string) => void; removeAttachment: (id: string) => void; setUseMemory: (value: boolean) => void;
  restoreConversation: (id: string, caseThreadId?: string | null) => Promise<void>;
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
      const runId = parsed && typeof parsed === 'object' && 'runId' in parsed ? parsed.runId : null;
      return { ...initialState, conversationId: typeof id === 'string' ? id : null, runId: typeof runId === 'string' ? runId : null };
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
    try { localStorage.setItem(storageKey, JSON.stringify({ conversationId: state.conversationId, runId: state.runId })); } catch { /* Optional continuity only; server owns history. */ }
  }, [storageKey, state.conversationId, state.runId]);
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
    const current = stateRef.current, id = current.runId;
    epoch.current.invalidate(); abort.current?.abort();
    setState(s => ({ ...s, busy: false, activity: id ? 'Przerwano odbior. Wysylanie prosby o zatrzymanie zadania...' : 'Oczekiwanie przerwane; zapis mogl juz dotrzec do serwera.' }));
    if (id && gateway.workspace) void runRef.current(() => gateway.workspace!.commandAssistantWorkspace<{status:string}>(`runs/${id}/cancel`, {requestId:safeRandomUUID()})).then(result => {
      if(stateRef.current.runId===id)setState(s=>({...s,activity:result.status==='completed'?'Odpowiedz zostala zapisana przed anulowaniem. Odczytaj wynik zadania.':'Serwer przyjal prosbe o zatrzymanie. Nie cofa to juz wykonanych zapisow.'}));
    }).catch(error=>{if(stateRef.current.runId===id)setState(s=>({...s,error:messageOf(error),activity:'Nie potwierdzono zatrzymania na serwerze. Odczytaj stan zadania.'}));});
  }, [setState, gateway]);
  const captureOnly = useRef<Promise<string> | null>(null);
  const ensureConversation = async (): Promise<string> => {
    if(stateRef.current.conversationId)return stateRef.current.conversationId;
    if(captureOnly.current)return captureOnly.current;
    if(stateRef.current.busy)throw new Error('Poczekaj na zakonczenie biezacej operacji.');
    const snapshot=stateRef.current.snapshot;
    if(!snapshot)throw new Error('Najpierw dodaj kontekst ekranu.');
    const version=epoch.current.start();
    setState(s=>({...s,busy:true,error:null,activity:'Zapisywanie koszyka kontekstu...'}));
    const promise=runRef.current(()=>gateway.capturePapaContext({snapshot:selectContext(snapshot,stateRef.current.excluded),title:snapshot.title,captureReason:'context-attachment',conversationId:null,parentConversationId:stateRef.current.parentConversationId,idempotencyKey:`papa-capture-${safeRandomUUID()}`})).then(result=>{
      if(!alive.current||!epoch.current.isCurrent(version))throw new Error('Kontekst zmienil sie podczas zapisu.');
      setState(s=>({...s,conversationId:result.conversationId,busy:false,activity:'Koszyk kontekstu zapisany.'}));return result.conversationId;
    }).catch(error=>{if(epoch.current.isCurrent(version))setState(s=>({...s,busy:false,error:messageOf(error)}));throw error;}).finally(()=>{captureOnly.current=null;});
    captureOnly.current=promise;return promise;
  };
  const resumeRun = async () => {
    const current=stateRef.current;
    if(!current.runId||current.busy||!gateway.runs)return;
    const version=epoch.current.start(),controller=new AbortController();abort.current=controller;
    setState(s=>({...s,busy:true,error:null,activity:'Wznawianie odbioru zapisanego zadania. Bez ponownego generowania.'}));
    const valid=()=>alive.current&&epoch.current.isCurrent(version)&&stateRef.current.runId===current.runId;
    try{
      const result=await gateway.runs.watchPapaRun(current.runId,(text,native)=>{if(valid())setState(s=>({...s,partialText:text,nativeStreaming:native}));},controller.signal);
      if(!valid())return;
      // Re-read the authoritative thread rather than attaching a resumed case answer
      // to the currently selected UI element (which may differ after a reload).
      if(result.conversationId!==current.conversationId)throw new Error('Odpowiedz dotyczy innej rozmowy. Otworz ja z historii.');
      const rootAnswers=await gateway.readPapaAnswers(result.conversationId);
      let selectedElementId:string|null=null;
      let messages:AssistantMessage[]=[...rootAnswers.records].reverse();
      let caseThreadIds:Record<string,string>={...stateRef.current.caseThreadIds};
      if(result.caseThreadId){
        const basket=await gateway.readResource(`/api/v1/papa/context-basket?conversationId=${encodeURIComponent(result.caseThreadId)}`);
        const thread=isRecord(basket)&&isRecord(basket.thread)?basket.thread:null;
        const snapshot=isRecord(basket)&&isRecord(basket.latest)&&isRecord(basket.latest.snapshot)?basket.latest.snapshot:null;
        if(thread?.parentConversationId!==result.conversationId||typeof snapshot?.caseElementId!=='string')throw new Error('Nie udalo sie odtworzyc kontekstu sprawy. Otworz ja z historii.');
        selectedElementId=snapshot.caseElementId;caseThreadIds[selectedElementId]=result.caseThreadId;
        const cases=await gateway.readPapaAnswers(result.caseThreadId);
        messages=messages.concat([...cases.records].reverse().map(record=>({...record,elementId:selectedElementId!})));
      }
      if(valid())setState(s=>({...s,busy:false,partialText:'',runId:null,selectedElementId,caseThreadIds,activity:'Wynik zadania odebrany.',messages}));
    }catch(error){if(valid())setState(s=>({...s,busy:false,error:messageOf(error),activity:'Zadanie pozostaje w historii serwera. Nie utworzono nowego zapytania.'}));}
  };
  const reset = (branch = false) => {
    stop();
    setState(s => ({ ...initialState, snapshot: s.snapshot, excluded: s.excluded,
      parentConversationId: branch ? s.conversationId : null, reports: s.reports, definitions: s.definitions }));
  };
  const submit = async (prompt = stateRef.current.draft) => {
    const current = stateRef.current;
    if (!prompt.trim() || current.busy) return;
    if(current.runId){setState(s=>({...s,error:'Najpierw odczytaj poprzednie zadanie lub jawnie odrzuc jego lokalny podglad.'}));return;}
    if(prompt.length>7000){setState(s=>({...s,error:'Pytanie moze miec do 7000 znakow.'}));return;}
    if (!current.snapshot) { setState(s => ({ ...s, error: 'Dodaj kontekst ekranu przed wysłaniem pytania.' })); return; }
    const version = epoch.current.start();
    const controller = new AbortController(); abort.current = controller;
    const snapshot = selectContext(current.snapshot, current.excluded);
    const requestId = safeRandomUUID();
    const mode = assistantModes.find(item => item.id === current.mode)!;
    const userMessage: AssistantMessage = { messageId: requestId, role: 'user', content: prompt.trim(), createdAt: new Date().toISOString(),
      status: 'completed', confidence: null, riskLevel: 'low', approvalRequired: false, evidence: [], limitations: [], actionId: null,
      ...(current.selectedElementId ? { elementId: current.selectedElementId } : {}) };
    setState(s => ({ ...s, busy: true, error: null, partialText: '', activity: 'Zapisywanie kontekstu…', messages: [...s.messages, userMessage] }));
    const valid = () => alive.current && epoch.current.isCurrent(version);
    try {
      const capture = await runRef.current(() => gateway.capturePapaContext({ captureReason: current.parentConversationId ? 'conversation-branch' : 'assistant-message',
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
      const input = { conversationId: capture.conversationId, caseThreadId, parentConversationId: current.parentConversationId,
        prompt: `[${mode.label}] ${mode.prompt}\n\n${prompt.trim()}`, idempotencyKey: `papa-answer-${requestId}`, signal: controller.signal };
      let result;
      if(gateway.runs){
        // Persist the client-chosen ID before POST. A lost response can be read without generating twice.
        setState(s=>({...s,runId:requestId,activity:'Uruchamianie zadania Papa...'}));
        const run=await runRef.current(()=>gateway.runs!.startPapaRun({requestId,conversationId:capture.conversationId,caseThreadId,prompt:input.prompt,attachmentIds:current.attachmentIds,useMemory:current.useMemory},controller.signal));
        if(!valid())return;
        setState(s=>({...s,runId:run.id,nativeStreaming:run.nativeStreaming,activity:run.nativeStreaming?'Strumien odpowiedzi dostawcy. Tekst roboczy wymaga weryfikacji.':'Tryb lokalny: oczekiwanie na pelna odpowiedz, bez symulowania strumienia.'}));
        result=await gateway.runs.watchPapaRun(run.id,(text,native)=>{if(valid())setState(s=>({...s,partialText:text,nativeStreaming:native}));},controller.signal);
      }else result=await runRef.current(()=>gateway.generatePapaAnswer(input));
      if (!valid()) return;
      setState(s => ({ ...s, busy: false, runId: null, partialText: '', draft: s.draft === prompt ? '' : s.draft, activity: result.record.status === 'blocked' ? 'Odpowiedź ograniczona przez brak danych lub uprawnień.' : 'Odpowiedź gotowa.',
        messages: [...s.messages, { ...result.record, ...(current.selectedElementId ? { elementId: current.selectedElementId } : {}) }] }));
    } catch (error) {
      if (valid()) setState(s => ({ ...s, busy: false, error: messageOf(error), activity: 'Nie udało się zakończyć odpowiedzi. Pytanie pozostało w formularzu.' }));
    }
  };
  const operation = async (label: string, fn: (valid: () => boolean) => Promise<void>) => {
    if (stateRef.current.busy) return;
    const version = epoch.current.start();
    setState(s => ({ ...s, busy: true, error: null, activity: label }));
    try { await fn(() => alive.current && epoch.current.isCurrent(version)); if (epoch.current.isCurrent(version)) setState(s => ({ ...s, busy: false, activity: 'Operacja zakończona.' })); }
    catch (error) { if (epoch.current.isCurrent(version)) setState(s => ({ ...s, busy: false, error: messageOf(error), activity: 'Operacja nie powiodła się.' })); }
  };
  const restoreConversation = async (id: string, requestedCaseId: string | null = null) => {
    await operation('Otwieranie rozmowy…', async valid => {
      const loadBasket = (threadId:string) => gateway.readResource(`/api/v1/papa/context-basket?conversationId=${encodeURIComponent(threadId)}`);
      let rootId=id, caseId=requestedCaseId;
      let basket=await loadBasket(id);
      const initialThread=isRecord(basket)&&isRecord(basket.thread)?basket.thread:null;
      if(initialThread?.kind==='case'&&typeof initialThread.parentConversationId==='string'){
        rootId=initialThread.parentConversationId;caseId=id;basket=await loadBasket(rootId);
      }
      if (!valid()) return;
      const snapshot=isRecord(basket)&&isRecord(basket.latest)?parseSnapshot(basket.latest.snapshot):null;
      if(!snapshot)throw new Error('Nie udało się odtworzyć kontekstu tej rozmowy.');
      const answers=await gateway.readPapaAnswers(rootId);
      let messages:AssistantMessage[]=[...answers.records].reverse(), selectedElementId:string|null=null;
      let caseThreadIds:Record<string,string>={};
      if(caseId){
        const caseBasket=await loadBasket(caseId);
        const thread=isRecord(caseBasket)&&isRecord(caseBasket.thread)?caseBasket.thread:null;
        const caseSnapshot=isRecord(caseBasket)&&isRecord(caseBasket.latest)&&isRecord(caseBasket.latest.snapshot)?caseBasket.latest.snapshot:null;
        const element=caseSnapshot?.caseElementId;
        if(thread?.kind!=='case'||thread.parentConversationId!==rootId||typeof element!=='string')throw new Error('Sprawa nie należy do tej rozmowy lub nie ma kontekstu elementu.');
        if(![...snapshot.elements,...snapshot.metrics,...snapshot.charts,...snapshot.tables,...snapshot.recommendations,...snapshot.evidence].some(item=>item.id===element))throw new Error('Element sprawy nie występuje w odtwarzanym koszyku kontekstu.');
        const caseAnswers=await gateway.readPapaAnswers(caseId);
        messages=messages.concat([...caseAnswers.records].reverse().map(message=>({...message,elementId:element})));
        selectedElementId=element;caseThreadIds={[element]:caseId};
      }
      if (!valid()) return;
      const rootThread=isRecord(basket)&&isRecord(basket.thread)?basket.thread:null;
      setState(s=>({...s,conversationId:rootId,parentConversationId:typeof rootThread?.parentConversationId==='string'?rootThread.parentConversationId:null,messages,snapshot,excluded:[],caseThreadIds,selectedElementId,draft:'',view:'Rozmowa',runId:null,partialText:'',attachmentIds:[],useMemory:false}));
    });
  };
  const refreshReports = async () => {
    await operation('Wczytywanie biblioteki…', async valid => {
      const result = await gateway.readPapaReportDefinitions({ limit: 50 });
      if (valid()) setState(s => ({ ...s, definitions: result.reports }));
    });
  };
  const saveReport = async (name: string) => {
    if (!name.trim()) return;
    await operation('Zapisywanie szkicu raportu…', async valid => {
      const s = stateRef.current;
      if (!s.snapshot?.dateRange) throw new Error('Brak okresu raportu. Dodaj kontekst ekranu.');
      const snapshot = selectContext(s.snapshot, s.excluded);
      const answer = [...s.messages].reverse().find(m => m.role === 'assistant');
      const record = await runRef.current(() => gateway.upsertPapaReportDefinition({
        idempotencyKey: `papa-draft-${safeRandomUUID()}`, name: name.trim(), description: answer?.content ?? snapshot.summary,
        visibility: 'private', status: 'draft', chartTypes: snapshot.charts.map(item => item.kind),
        metricSelection: snapshot.metrics.map(item => ({ id: item.id, label: item.label })),
        layout: [{ type: 'summary', content: answer?.content ?? snapshot.summary }], filters: { screen: snapshot.route, filters: snapshot.filters, conversationId:s.conversationId, caseThreadId:s.selectedElementId?s.caseThreadIds[s.selectedElementId]??null:null }, dateRange: { ...snapshot.dateRange },
      }));
      if (valid()) setState(v => ({ ...v, definitions: [record, ...v.definitions.filter(item => item.id !== record.id)] }));
    });
  };
  const exportReport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    await operation('Zlecanie generowania raportu…', async valid => {
      const s = stateRef.current;
      if (!s.snapshot?.dateRange) throw new Error('Brak zakresu dat raportu.');
      const snapshot = selectContext(s.snapshot, s.excluded);
      const report = await runRef.current(() => gateway.createPapaReport({ dateFrom: snapshot.dateRange!.from, dateTo: snapshot.dateRange!.to,
        format, idempotencyKey: `papa-export-${safeRandomUUID()}`, reportType: 'papa-laboratory',
        filters: { snapshotId: snapshot.snapshotId, route: snapshot.route, conversationId:s.conversationId, caseThreadId:s.selectedElementId?s.caseThreadIds[s.selectedElementId]??null:null, metricIds: snapshot.metrics.map(i => i.id), chartIds: snapshot.charts.map(i => i.id),
          tableIds: snapshot.tables.map(i => i.id), evidenceIds: snapshot.evidence.map(i => i.id) } }));
      if (valid()) setState(v => ({ ...v, reports: [report, ...v.reports] }));
    });
  };
  const downloadReport = async (report: BffReportRecord) => {
    await operation('Sprawdzanie raportu…', async valid => {
      const latest = await gateway.readPapaReport(report.id);
      if (!valid()) return;
      setState(s => ({ ...s, reports: s.reports.map(item => item.id === latest.id ? latest : item) }));
      if (latest.status !== 'ready') throw new Error(latest.status === 'failed' ? 'Generowanie raportu nie powiodło się.' : 'Raport jest jeszcze przetwarzany. Sprawdź ponownie za chwilę.');
      const result = await runRef.current(() => gateway.getPapaReportDownload(report.id));
      if (!valid()) return;
      const link = document.createElement('a'); link.href = result.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
    });
  };
  return <RuntimeContext.Provider value={{ ...state, scope, demo, gateway, runCommand,
    restoreConversation, ensureConversation, resumeRun, dismissRun:()=>{if(!stateRef.current.busy)setState(s=>({...s,runId:null,partialText:'',error:null,activity:'Usunieto lokalny podglad zadania. Historia serwera nie zostala usunieta.'}));},
    toggleAttachment:id=>{if(!stateRef.current.busy)setState(s=>({...s,attachmentIds:s.attachmentIds.includes(id)?s.attachmentIds.filter(x=>x!==id):[...s.attachmentIds,id]}));},
    removeAttachment:id=>setState(s=>({...s,attachmentIds:s.attachmentIds.filter(x=>x!==id)})),
    setUseMemory:useMemory=>{if(!stateRef.current.busy)setState(s=>({...s,useMemory}));}, setView: view => setState(s => ({ ...s, view })),
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
