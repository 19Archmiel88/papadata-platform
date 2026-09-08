import { useEffect, useId, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, Dialog, Icon } from '../../../design-system';
import { useShellNavigate } from '../app-shell/ShellNavigationContext';
import { usePapaAssistantRuntime } from './PapaAssistantRuntimeContext';
import { usePapaScreenContext } from './ScreenContextProvider';
import { assistantModes, assistantViews, canReviewAction, contextItems, isAssistantPath, isRecord, parseActions, parseHistory, parseLab, parseObservations, parseProposals, selectContext } from './assistantModel';
import type { ActionProposal, LabResult, ObservationRecord, ProposalRecord } from './assistantModel';
import type { PapaAssistantOpenRequest } from './PapaAssistantRuntimeContext';
import './assistant-experience.css';

export function PapaAssistantExperience({ compact = false, onExpand, request }: {
  readonly compact?: boolean; readonly onExpand?: () => void; readonly request?: PapaAssistantOpenRequest | null;
}) {
  const runtime = usePapaAssistantRuntime();
  const { currentContext, captureCurrentScreenContext } = usePapaScreenContext();
  const navigate = useShellNavigate();
  const { view, setView } = runtime;
  const [resetOpen, setResetOpen] = useState(false);
  const [reportName, setReportName] = useState('Analiza biznesowa');
  const composerId = useId();
  const seenRequest = useRef<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const items = contextItems(runtime.snapshot);
  const sourceIsAssistant = isAssistantPath(currentContext.route);
  useEffect(() => {
    if (!runtime.snapshot && !sourceIsAssistant) runtime.setContext(captureCurrentScreenContext('assistant-open'));
  }, [runtime.snapshot, sourceIsAssistant, captureCurrentScreenContext]);
  useEffect(() => {
    if (!request || seenRequest.current === request.id) return;
    seenRequest.current = request.id;
    if (!sourceIsAssistant) runtime.setContext(captureCurrentScreenContext('assistant-request'), request.elementId);
    else runtime.selectElement(request.elementId ?? null);
    setView(request.mode === 'report' || request.action === 'report' ? 'Raporty' : 'Rozmowa');
    if (request.action === 'analyze-screen') { runtime.setDraft(assistantModes[0].prompt); textarea.current?.focus(); }
  }, [request, sourceIsAssistant, captureCurrentScreenContext]);
  const snapshot = runtime.snapshot;
  const selectedMessages = runtime.messages.filter(message => (message.elementId ?? null) === runtime.selectedElementId);
  const answerEvidence = [...new Map(selectedMessages.flatMap(m => m.evidence).map(item => [item.evidenceId, item])).values()];

  return <section className={`pd-assistant ${compact ? 'pd-assistant--compact' : ''}`} aria-label="Przestrzeń Papa Asystenta">
    <header className="pd-assistant__header">
      <div className="pd-assistant__identity"><span className="pd-assistant__mark"><Icon name="assistant" size={24} /></span><div>
        {compact ? <h2>Papa Asystent</h2> : <h1>Papa Asystent</h1>}
        <p>Od pytania do decyzji opartej na danych</p>
      </div></div>
      <div className="pd-assistant__actions">
        <span className="pd-assistant__badge">{runtime.demo ? 'Demonstracja' : 'Odpowiedzi AI'}</span>
        {onExpand && <Button variant="secondary" size="small" onClick={onExpand}>Pełny widok</Button>}
        <Button variant="ghost" size="small" disabled={runtime.busy} onClick={() => setResetOpen(true)}>Nowa rozmowa</Button>
      </div>
    </header>
    <div className="pd-assistant__context-line">
      <div><strong>{snapshot?.title ?? 'Wybierz kontekst analizy'}</strong><span>{snapshot ? `${snapshot.workspaceName} · ${snapshot.dateRangeLabel}` : 'Otwórz Papa z ekranu, który chcesz przeanalizować.'}</span></div>
      <Button variant="ghost" size="small" onClick={() => setView('Kontekst')}>{items.length - runtime.excluded.length} elementów kontekstu</Button>
    </div>
    <nav className="pd-assistant__nav" aria-label="Widoki Papa Asystenta">
      {assistantViews.map(tab => <button type="button" key={tab} aria-current={view === tab ? 'page' : undefined} onClick={() => setView(tab)}>{tab}</button>)}
    </nav>
    <div className="pd-assistant__body">
      {view === 'Rozmowa' && <>
        <div className="pd-assistant__mode-row"><label>Tryb analizy<select value={runtime.mode} onChange={e => runtime.setMode(e.target.value as typeof runtime.mode)} disabled={runtime.busy}>
          {assistantModes.map(mode => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
        </select></label>
        <label>Zakres rozmowy<select value={runtime.selectedElementId ?? ''} disabled={runtime.busy} onChange={e => runtime.selectElement(e.target.value || null)}>
          <option value="">Cały kontekst</option>{items.filter(item => !runtime.excluded.includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label></div>
        {!selectedMessages.length && <div className="pd-assistant__welcome">
          <span className="pd-assistant__eyebrow">TWÓJ KONTEKST. KONKRETNE WNIOSKI.</span>
          <h2>Co warto dziś sprawdzić?</h2><p>Zacznij od wyniku, znajdź jego przyczyny albo przygotuj plan. Papa pokaże dowody i ograniczenia odpowiedzi.</p>
          <div className="pd-assistant__suggestions">{assistantModes.filter(m => ['brief', 'diagnosis', 'plan'].includes(m.id)).map(mode => <button key={mode.id} type="button" onClick={() => { runtime.setMode(mode.id); runtime.setDraft(mode.prompt); textarea.current?.focus(); }}>
            <strong>{mode.label} <span aria-hidden="true">↗</span></strong><span>{mode.prompt}</span>
          </button>)}</div>
        </div>}
        <ol className="pd-assistant__messages" aria-label="Historia rozmowy">{selectedMessages.map(message => <li key={message.messageId} className={`pd-assistant__message pd-assistant__message--${message.role}`}>
          <header><strong>{message.role === 'user' ? 'Ty' : message.role === 'assistant' ? 'Papa · AI' : 'Status'}</strong><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</time></header>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          {message.role === 'assistant' && <footer>
            <span className="pd-assistant__badge">{message.status === 'blocked' ? 'Ograniczona odpowiedź' : message.evidence.length ? 'Odpowiedź ze źródłami' : 'Brak źródeł odpowiedzi'}</span>
            {message.limitations.map((text, i) => <p key={i}>{text}</p>)}
            <div className="pd-assistant__actions"><Button variant="ghost" size="small" onClick={() => setView('Dowody')}>Sprawdź dowody ({message.evidence.length})</Button>
            <Button variant="secondary" size="small" onClick={() => { setReportName(snapshot?.title ? `Raport: ${snapshot.title}` : 'Analiza biznesowa'); setView('Raporty'); }}>Przygotuj raport</Button>
            {message.approvalRequired && <Button variant="secondary" size="small" onClick={() => setView('Działania')}>Przejrzyj propozycję</Button>}</div>
          </footer>}
        </li>)}</ol>
      </>}
      {view === 'Kontekst' && <div className="pd-assistant__section">
        <div className="pd-assistant__section-head"><div><h2>Koszyk kontekstu</h2><p>Wybierz, które elementy dołączyć do kolejnego pytania.</p></div>
        <Button variant="secondary" disabled={sourceIsAssistant || runtime.busy} onClick={() => runtime.setContext(captureCurrentScreenContext('context-refresh'))}>Pobierz bieżący ekran</Button></div>
        {sourceIsAssistant && <p>Pełny widok zachowuje kontekst źródłowego ekranu. Aby go zmienić, otwórz Papa z wybranej analizy.</p>}
        {snapshot && <dl className="pd-assistant__facts"><div><dt>Okres</dt><dd>{snapshot.dateRangeLabel}</dd></div><div><dt>Gotowość danych</dt><dd>{snapshot.readiness ?? 'Nie określono'}</dd></div><div><dt>Filtry</dt><dd>{snapshot.filters.map(f => `${f.label}: ${f.value ?? '—'}`).join(', ') || 'Brak dodatkowych filtrów'}</dd></div><div><dt>Kontekst pobrany</dt><dd>{new Date(snapshot.capturedAt).toLocaleString('pl-PL')}</dd></div></dl>}
        {!items.length && <p className="pd-assistant__empty">Ten ekran nie udostępnił elementów analizy. Wybierz ekran z KPI lub dodaj źródło.</p>}
        <ul className="pd-assistant__context-list">{items.map(item => <li key={item.id}><label><input type="checkbox" checked={!runtime.excluded.includes(item.id)} disabled={runtime.busy} onChange={() => runtime.toggleContext(item.id)} /><span><strong>{item.label}</strong><small>{item.source ?? 'Źródło nieopisane'} · {item.value ?? item.description ?? item.kind}</small></span></label>
          <Button size="small" variant="ghost" disabled={runtime.excluded.includes(item.id) || runtime.busy} onClick={() => { runtime.selectElement(item.id); setView('Rozmowa'); }}>Zapytaj o element</Button></li>)}</ul>
        <p className="pd-assistant__note">Dołączanie plików nie jest jeszcze dostępne. Papa otrzymuje wybrane dane z ekranu.</p>
      </div>}
      {view === 'Dowody' && <div className="pd-assistant__section"><h2>Dowody i ograniczenia</h2><p>Źródła przypisane przez serwer do odpowiedzi. Brak dowodu nie oznacza potwierdzenia hipotezy.</p>
        {!answerEvidence.length ? <p className="pd-assistant__empty">Brak dowodów w bieżącej rozmowie.</p> : <ul className="pd-assistant__evidence">{answerEvidence.map(item => <li key={item.evidenceId}><strong>{items.find(i => i.id === item.evidenceId)?.label ?? item.source}</strong><p>{item.source}</p><small>Zebrano: {new Date(item.collectedAt).toLocaleString('pl-PL')}</small><code>{item.evidenceId}</code></li>)}</ul>}
        {snapshot && <Button variant="secondary" onClick={() => navigate(snapshot.route)}>Wróć do źródłowego ekranu</Button>}
      </div>}
      {view === 'Raporty' && <div className="pd-assistant__section"><div className="pd-assistant__section-head"><div><h2>Raporty i artefakty</h2><p>Zachowaj analizę wraz z okresem i wybranymi źródłami.</p></div><Button variant="ghost" disabled={runtime.busy} onClick={() => void runtime.refreshReports()}>Odśwież bibliotekę</Button></div>
        <form className="pd-assistant__report-form" onSubmit={e => { e.preventDefault(); void runtime.saveReport(reportName); }}><label>Nazwa raportu<input required maxLength={160} value={reportName} onChange={e => setReportName(e.target.value)} /></label><Button type="submit" disabled={runtime.busy || !snapshot}>Zapisz szkic</Button></form>
        <div className="pd-assistant__actions">{(['csv', 'pdf', 'xlsx'] as const).map(format => <Button key={format} variant="secondary" disabled={runtime.busy || !snapshot || runtime.demo} onClick={() => void runtime.exportReport(format)}>Generuj {format.toUpperCase()}</Button>)}
          <Button variant="ghost" disabled={!snapshot} onClick={() => snapshot && downloadContextCsv(selectContext(snapshot, runtime.excluded))}>Pobierz CSV kontekstu</Button></div>
        {runtime.demo && <p className="pd-assistant__note">W demonstracji szkice są lokalne. Generowanie PDF/XLSX jest dostępne po podłączeniu serwera raportów.</p>}
        <h3>Biblioteka szkiców Papa</h3>{!runtime.definitions.length && <p>Brak wczytanych szkiców. Zapisz analizę lub odśwież bibliotekę.</p>}
        {runtime.definitions.map(report => <details className="pd-assistant__artifact" key={report.id}><summary>{report.name} · {report.status === 'draft' ? 'Szkic' : report.status}</summary><ReactMarkdown remarkPlugins={[remarkGfm]}>{report.description ?? 'Brak opisu'}</ReactMarkdown></details>)}
        {!!runtime.reports.length && <h3>Zadania generowania</h3>}{runtime.reports.map(report => <div className="pd-assistant__artifact" key={report.id}><strong>{report.format.toUpperCase()} · {report.status}</strong><p>{report.date_from} — {report.date_to}</p><Button variant="secondary" disabled={runtime.busy} onClick={() => void runtime.downloadReport(report)}>Sprawdź i pobierz</Button></div>)}
        <Button variant="ghost" onClick={() => navigate('/app/papa')}>Otwórz Zapisane raporty</Button>
      </div>}
      {view === 'Laboratorium' && <Laboratorium />}
      {view === 'Propozycje' && <Propozycje />}
      {view === 'Obserwacje' && <Obserwacje />}
      {view === 'Działania' && <ActionReview />}
      {view === 'Historia' && <History />}
      {view === 'Ustawienia AI' && <Governance />}
    </div>
    <div className="pd-assistant__status" role="status" aria-live="polite">{runtime.activity || (runtime.demo ? 'Tryb demonstracyjny · bez zmian w systemach zewnętrznych' : 'Papa korzysta z danych i uprawnień aktywnego workspace’u.')}</div>
    {runtime.error && <p className="pd-assistant__error" role="alert">{runtime.error}</p>}
    {view === 'Rozmowa' && <form className="pd-assistant__composer" onSubmit={e => { e.preventDefault(); void runtime.submit(); }}>
      <label htmlFor={composerId}>Twoje pytanie</label><textarea id={composerId} ref={textarea} value={runtime.draft} maxLength={12000} rows={3}
        placeholder="Co zmieniło wynik i od czego zacząć?" onChange={e => runtime.setDraft(e.target.value)}
        onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void runtime.submit(); } }} />
      <div><small>Ctrl/⌘ + Enter · Odpowiedź AI może wymagać weryfikacji.</small>
        {runtime.busy ? <Button variant="secondary" onClick={runtime.stop}>Przerwij oczekiwanie</Button> : <Button type="submit" disabled={!runtime.draft.trim() || !snapshot}>Wyślij pytanie</Button>}</div>
    </form>}
    <Dialog closeOnEscape open={resetOpen} onOpenChange={setResetOpen} title="Rozpocząć nową rozmowę?" description="Bieżąca historia pozostaje na serwerze. Nowy wątek zachowa wybrany kontekst." dismissible modal>
      <div className="pd-assistant__actions"><Button onClick={() => { runtime.reset(); setResetOpen(false); setView('Rozmowa'); }}>Rozpocznij nową</Button><Button variant="secondary" disabled={!runtime.conversationId} onClick={() => { runtime.reset(true); setResetOpen(false); setView('Rozmowa'); }}>Utwórz odgałęzienie</Button><Button variant="ghost" onClick={() => setResetOpen(false)}>Anuluj</Button></div>
    </Dialog>
  </section>;
}

function useResource(path: `/api/v1/${string}`) {
  const { gateway, scope } = usePapaAssistantRuntime();
  const [key, reload] = useState(0);
  const [state, setState] = useState<{ data: unknown; error: string | null; loading: boolean }>({ data: null, error: null, loading: true });
  useEffect(() => { let active = true; setState({ data: null, error: null, loading: true });
    void gateway.readResource(path).then(data => { if (active) setState({ data, error: null, loading: false }); }).catch(error => { if (active) setState({ data: null, error: error instanceof Error ? error.message : 'Nie udało się wczytać danych.', loading: false }); });
    return () => { active = false; };
  }, [gateway, path, key, scope.workspaceId]);
  return { ...state, reload: () => reload(k => k + 1) };
}
function ActionReview() {
  const runtime = usePapaAssistantRuntime();
  const resource = useResource(`/api/v1/papa/ai-actions${runtime.conversationId && !runtime.demo ? `?conversationId=${encodeURIComponent(runtime.conversationId)}` : ''}`);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  let actions: readonly ActionProposal[] = []; let parseError = '';
  try { if (resource.data) actions = parseActions(resource.data); } catch (error) { parseError = String(error); }
  const action = actions.find(a => a.id === selected);
  const operation = async (kind: 'validate' | 'approve' | 'reject') => {
    if (!action || pending) return;
    setPending(true); setNotice('');
    try {
      await runtime.runCommand(() => runtime.gateway.commandPapaAction({ action: kind, actionProposalId: action.id, reason,
        idempotencyKey: `papa-${action.id}-${kind}-${crypto.randomUUID()}` }));
      setNotice(kind === 'approve' ? 'Propozycja zatwierdzona. Zmiana zewnętrzna nie została wykonana.' : kind === 'reject' ? 'Propozycja odrzucona.' : 'Walidacja zakończona. Sprawdź aktualny status.');
      setConsent(false); resource.reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Operacja nie powiodła się.'); }
    finally { setPending(false); }
  };
  return <div className="pd-assistant__section"><div className="pd-assistant__section-head"><div><h2>Propozycje i decyzje</h2><p>Przejrzyj cel, zmianę i dowody przed zatwierdzeniem.</p></div><Button variant="ghost" onClick={resource.reload} disabled={pending}>Odśwież</Button></div>
    <p className="pd-assistant__note">Wykonanie i cofanie zmian zewnętrznych nie są jeszcze dostępne. Zatwierdzenie zapisuje decyzję.</p>
    {resource.loading && <p role="status">Wczytywanie propozycji…</p>}{(resource.error || parseError) && <p role="alert">{resource.error || parseError}</p>}
    {!resource.loading && !resource.error && !parseError && !actions.length && <p className="pd-assistant__empty">Brak propozycji dla tej rozmowy.</p>}
    <div className="pd-assistant__actions">{actions.map(a => <Button key={a.id} variant={selected === a.id ? 'primary' : 'secondary'} disabled={pending} onClick={() => { setSelected(a.id); setConsent(false); setReason(''); setNotice(''); }}>{a.operationId} · {a.status}</Button>)}</div>
    {action && <div className="pd-assistant__review"><h3>{action.operationId}</h3><dl className="pd-assistant__facts">
      {([['Cel', action.targetRef], ['Przed zmianą', action.beforeState], ['Po zmianie', action.proposedAfterState], ['Różnice', action.diff], ['Dowody', action.evidence], ['Symulacja', action.simulation], ['Limity', action.limits]] as const).map(([label, value]) => <div key={label}><dt>{label}</dt><dd><pre>{displayValue(value)}</pre></dd></div>)}
      </dl>{canReviewAction(action.status) && <><label>Uzasadnienie decyzji<textarea rows={3} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <label className="pd-assistant__consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />Zapoznałem się ze zmianą i zatwierdzam tę propozycję.</label>
      <div className="pd-assistant__actions"><Button variant="secondary" disabled={pending} onClick={() => void operation('validate')}>Zweryfikuj propozycję</Button><Button disabled={pending || !consent || !reason.trim()} onClick={() => void operation('approve')}>Zatwierdź propozycję</Button><Button variant="danger" disabled={pending || !reason.trim()} onClick={() => void operation('reject')}>Odrzuć</Button></div></>}
      </div>}
    {notice && <p role="status">{notice}</p>}
  </div>;
}
function Laboratorium() {
  const resource = useResource('/api/v1/papa/laboratorium-ai');
  let lab: LabResult | null = null; let error = resource.error;
  try { if (resource.data) lab = parseLab(resource.data); } catch (cause) { error = String(cause); }
  const empty = lab !== null && !lab.cases.length && !lab.recommendations.length && !lab.decisions.length && !lab.outcomes.length && !lab.experiments.length;
  return <div className="pd-assistant__section">
    <div className="pd-assistant__section-head"><div><h2>Laboratorium</h2><p>Sprawy, rekomendacje, decyzje, wyniki i warianty eksperymentów powiązane z rozmowami.</p></div>
    <Button variant="ghost" onClick={resource.reload}>Odśwież</Button></div>
    {resource.loading && <p role="status">Wczytywanie laboratorium…</p>}{error && <p role="alert">{error}</p>}
    {empty && <p className="pd-assistant__empty">Brak spraw w Laboratorium dla tego workspace’u.</p>}
    {!!lab?.cases.length && <><h3>Sprawy</h3>{lab.cases.map(item => <div className="pd-assistant__artifact" key={item.id}><strong>{item.title || 'Sprawa bez tytułu'}</strong><small>Typ: {item.type || 'nieokreślony'} · Waga: {item.severity || 'nieokreślona'} · Status: {item.status}</small></div>)}</>}
    {!!lab?.recommendations.length && <><h3>Rekomendacje</h3>{lab.recommendations.map(item => <div className="pd-assistant__artifact" key={item.id}><strong>{item.title}</strong><p>{item.summary}</p><small>Ryzyko: {item.riskLevel} · Wysiłek: {item.effortLevel} · Status: {item.status}</small></div>)}</>}
    {!!lab?.decisions.length && <><h3>Decyzje</h3>{lab.decisions.map(item => <div className="pd-assistant__artifact" key={item.id}><strong>{item.decision || 'Decyzja bez treści'}</strong><p>{item.rationale}</p><small>Status: {item.status}</small></div>)}</>}
    {!!lab?.experiments.length && <><h3>Warianty i eksperymenty</h3>{lab.experiments.map(item => <details className="pd-assistant__artifact" key={item.id}>
      <summary>{item.title || 'Eksperyment bez tytułu'} · {item.status}</summary>
      <p>{item.hypothesis}</p>
      <dl className="pd-assistant__facts">
        <div><dt>Konfiguracja wariantu</dt><dd><pre>{displayValue(item.variantConfig)}</pre></dd></div>
        <div><dt>Wynik oczekiwany</dt><dd><pre>{displayValue(item.expectedOutcome)}</pre></dd></div>
        <div><dt>Wynik zmierzony</dt><dd><pre>{displayValue(item.measuredOutcome)}</pre></dd></div>
      </dl>
    </details>)}</>}
    {!!lab?.outcomes.length && <><h3>Wyniki</h3>{lab.outcomes.map(item => <div className="pd-assistant__artifact" key={item.id}><strong>Status: {item.status}</strong><pre>{displayValue(item.measuredOutcome)}</pre></div>)}</>}
  </div>;
}
function Propozycje() {
  const resource = useResource('/api/v1/papa/propozycje-ai');
  let proposals: readonly ProposalRecord[] = []; let error = resource.error;
  try { if (resource.data) proposals = parseProposals(resource.data); } catch (cause) { error = String(cause); }
  return <div className="pd-assistant__section">
    <div className="pd-assistant__section-head"><div><h2>Propozycje</h2><p>Rekomendacje Papa wynikające z rozmów i obserwacji — osobne od zatwierdzania konkretnych działań AI w zakładce Działania.</p></div>
    <Button variant="ghost" onClick={resource.reload}>Odśwież</Button></div>
    {resource.loading && <p role="status">Wczytywanie propozycji…</p>}{error && <p role="alert">{error}</p>}
    {!resource.loading && !error && !proposals.length && <p className="pd-assistant__empty">Brak propozycji dla tego workspace’u.</p>}
    {proposals.map(item => <div className="pd-assistant__artifact" key={item.id}><strong>{item.title}</strong><p>{item.summary}</p>
      {item.nextStep && <p><em>Następny krok:</em> {item.nextStep}</p>}
      <small>Ryzyko: {item.riskLevel} · Wysiłek: {item.effortLevel} · Pewność: {item.confidence !== null ? `${Math.round(item.confidence * 100)}%` : 'nieznana'} · Status: {item.status}</small>
    </div>)}
  </div>;
}
function Obserwacje() {
  const runtime = usePapaAssistantRuntime();
  const resource = useResource('/api/v1/papa/obserwacje');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  let observations: readonly ObservationRecord[] = []; let error = resource.error;
  try { if (resource.data) observations = parseObservations(resource.data); } catch (cause) { error = String(cause); }
  async function save() {
    if (!content.trim() || pending) return;
    setPending(true); setNotice('');
    try {
      await runtime.runCommand(() => runtime.gateway.savePapaObservation({
        content: content.trim(), conversationId: runtime.conversationId, idempotencyKey: `papa-observation-${crypto.randomUUID()}`,
      }));
      setContent(''); setNotice('Zapisano obserwację.'); resource.reload();
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Nie udało się zapisać obserwacji.'); }
    finally { setPending(false); }
  }
  return <div className="pd-assistant__section">
    <div className="pd-assistant__section-head"><div><h2>Obserwacje</h2><p>Zapisuj krótkie spostrzeżenia niezależnie od pytania w Rozmowie.</p></div>
    <Button variant="ghost" onClick={resource.reload} disabled={pending}>Odśwież</Button></div>
    <div className="pd-assistant__report-form">
      <label>Nowa obserwacja<textarea rows={3} maxLength={2000} value={content} onChange={e => setContent(e.target.value)} placeholder="Co warto zapamiętać?" /></label>
      <Button disabled={pending || !content.trim()} onClick={() => void save()}>Zapisz obserwację</Button>
    </div>
    {notice && <p role="status">{notice}</p>}
    {resource.loading && <p role="status">Wczytywanie obserwacji…</p>}{error && <p role="alert">{error}</p>}
    {!resource.loading && !error && !observations.length && <p className="pd-assistant__empty">Brak zapisanych obserwacji.</p>}
    <ul className="pd-assistant__timeline">{observations.map(item => <li key={item.id}><strong>{item.content}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString('pl-PL')}</time></li>)}</ul>
  </div>;
}
function History() {
  const runtime = usePapaAssistantRuntime();
  const resource = useResource('/api/v1/papa/historia-i-pamiec-papa?limit=50');
  const basket = useResource('/api/v1/papa/context-basket?limit=50');
  const threads = isRecord(basket.data) && Array.isArray(basket.data.records) ? [...new Map(basket.data.records.flatMap(row => isRecord(row) && typeof row.conversationId === 'string' && isRecord(row.snapshot) && typeof row.snapshot.title === 'string' ? [[row.conversationId, { id: row.conversationId, title: row.snapshot.title }] as const] : [])).values()] : [];
  let events: ReturnType<typeof parseHistory> = []; let error = resource.error;
  try { if (resource.data) events = parseHistory(resource.data); } catch (cause) { error = String(cause); }
  return <div className="pd-assistant__section"><div className="pd-assistant__section-head"><h2>Historia workspace’u</h2><Button variant="ghost" onClick={resource.reload}>Odśwież historię</Button></div>
    <p>Bieżąca rozmowa: <code>{runtime.conversationId ?? 'Nowy wątek'}</code></p>{runtime.parentConversationId && <p>Odgałęzienie rozmowy: <code>{runtime.parentConversationId}</code></p>}
    {resource.loading && <p role="status">Wczytywanie historii…</p>}{error && <p role="alert">{error}</p>}
    {!resource.loading && !error && !events.length && <p className="pd-assistant__empty">Brak zapisanych zdarzeń.</p>}
    <div className="pd-assistant__actions">{threads.map(thread => <Button key={thread.id} variant="secondary" disabled={runtime.busy} onClick={() => void runtime.restoreConversation(thread.id)}>Otwórz: {thread.title}</Button>)}</div>
    <ol className="pd-assistant__timeline">{events.map(event => <li key={event.eventId}><strong>{event.description}</strong><time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString('pl-PL')}</time></li>)}</ol>
    <p className="pd-assistant__note">Historia pokazuje zdarzenia kontekstu. Usuwanie pamięci i zarządzanie retencją wymagają osobnych operacji serwerowych.</p>
  </div>;
}
function Governance() {
  const resource = useResource('/api/v1/papa/ustawienia-ai-i-governance');
  const navigate = useShellNavigate();
  return <div className="pd-assistant__section"><h2>Zasady pracy Papa</h2><p>Odczyt zasad aktywnego workspace’u. Uprawnienia i limity egzekwuje serwer.</p>
    {resource.loading && <p role="status">Wczytywanie zasad…</p>}{resource.error && <p role="alert">{resource.error}</p>}
    {resource.data !== null && <details className="pd-assistant__artifact"><summary>Aktywna polityka i wykorzystanie</summary><pre>{displayValue(resource.data)}</pre></details>}
    <ul><li>Odpowiedź powstaje z wybranego kontekstu i może zawierać błędy.</li><li>Dane i historia są ograniczone do workspace’u.</li><li>Brak dowodów może ograniczyć odpowiedź.</li><li>Propozycja działania wymaga osobnego zatwierdzenia.</li></ul>
    <Button variant="secondary" onClick={() => navigate('/app/settings/organizacja')}>Otwórz ustawienia workspace’u</Button>
    <p className="pd-assistant__note">Eksport przez MCP i zapis ustawień pamięci nie mają podłączonej operacji w tym widoku.</p>
  </div>;
}
function displayValue(value: unknown): string { return value === undefined || value === null ? 'Brak danych' : typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
export function downloadContextCsv(snapshot: Parameters<typeof contextItems>[0]) {
  const cell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
  const rows = [['Element', 'Wartość', 'Źródło'], ...contextItems(snapshot).map(item => [item.label, item.value ?? '', item.source ?? ''])];
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'papa-kontekst.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
