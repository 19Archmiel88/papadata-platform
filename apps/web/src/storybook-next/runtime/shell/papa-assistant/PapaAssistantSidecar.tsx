import type {
  HTMLAttributes,
} from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  AlertDialog,
  AssistantComposer,
  Button,
  Icon,
  InlineNotice,
  OverlayRoot,
  StatusBadge,
  Tabs,
  useMotionPresets,
} from '../../../../design-system/index';
import type {
  PapaChatMessage,
} from '../../screens/papa/papaData';
import type {
  PapaScreenContext,
  PapaScreenContextElement,
  PapaScreenContextElementKind,
  PapaScreenContextSnapshot,
} from './ScreenContextProvider';
import type {
  PapaAssistantOpenRequest,
  PapaAssistantReportArtifact,
  PapaAssistantReportFormat,
  PapaAssistantReportScope,
} from './PapaAssistantRuntimeContext';
import {
  createPapaAssistantMessage,
  resolvePapaElementDraftScope,
  resolvePapaMainDraftScope,
  usePapaAssistantRuntime,
} from './PapaAssistantRuntimeContext';
import {
  usePapaScreenContext,
} from './ScreenContextProvider';
import type {
  PapaMessageEvidence,
} from './PapaMessageThread';
import {
  PapaMessageThread,
} from './PapaMessageThread';
import './papa-assistant.css';

type PapaAssistantMode =
  | 'screen'
  | 'element'
  | 'report';

type ComposerSubmitValue =
  | string
  | Parameters<NonNullable<HTMLAttributes<HTMLElement>['onSubmit']>>[0];

type PapaAssistantElement = PapaScreenContextElement & {
  readonly baseMessages: readonly PapaChatMessage[];
};

const reportScopes = [
  {
    description: 'Metryki, tabele, wykresy, rekomendacje i dowody',
    id: 'screen',
    label: 'Cały widok',
  },
  {
    description: 'KPI, cele, statusy i odchylenia',
    id: 'metrics',
    label: 'KPI',
  },
  {
    description: 'Rejestry i tabele alternatywne',
    id: 'tables',
    label: 'Tabele',
  },
  {
    description: 'Rekomendacje, ryzyka i następne kroki',
    id: 'recommendations',
    label: 'Rekomendacje',
  },
] satisfies readonly {
  readonly description: string;
  readonly id: PapaAssistantReportScope;
  readonly label: string;
}[];

export function PapaAssistantSidecar({
  onNavigate,
  onOpenChange,
  open,
  request = null,
}: {
  readonly onNavigate?: ((path: string) => void) | undefined;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly request?: PapaAssistantOpenRequest | null;
}) {
  const {
    captureCurrentScreenContext,
    currentContext,
  } = usePapaScreenContext();
  const {
    addMainMessages,
    captureContext,
    clearComposerDraft,
    composerDrafts,
    conversationId,
    createReport,
    downloadReport,
    elementError,
    elementMessages,
    elementSubmitting,
    lastSnapshot,
    mainError,
    mainSubmitting,
    messages,
    rememberSnapshot,
    reportError,
    reports,
    resetConversation: resetRuntimeConversation,
    setComposerDraft,
    submitElementMessage,
    submitMainMessage,
  } = usePapaAssistantRuntime();
  const [mode, setMode] = useState<PapaAssistantMode>('screen');
  const [handledRequestId, setHandledRequestId] =
    useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const { overlay: overlayTransition } = useMotionPresets();

  /* OverlayRoot unmounts the instant `open` flips false (no exit-transition
     hook of its own — see OverlayRoot.tsx), so the exit animation is driven
     here instead: keep OverlayRoot mounted a moment longer than `open` while
     AnimatePresence plays the real exit, then let onExitComplete finish the
     unmount. This is call-site-only — OverlayRoot.tsx stays untouched, so
     every other dialog/drawer built on it keeps its current behavior. */
  const [prevOpen, setPrevOpen] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setIsClosing(!open);
  }

  const overlayMounted = open || isClosing;

  const elements = useMemo(() => (
    buildAssistantElements(currentContext)
  ), [
    currentContext,
  ]);

  const [selectedElementId, setSelectedElementId] =
    useState(elements[0]?.id ?? '');
  const selectedElement = elements.find((element) => (
    element.id === selectedElementId
  )) ?? elements[0] ?? null;
  const selectedElementMessages = selectedElement
    ? [
        ...selectedElement.baseMessages,
        ...elementMessages.filter((message) => (
          message.contextItemId === selectedElement.id
        )),
      ]
    : [];
  const conversationEvidence = useMemo(() => (
    buildMessageEvidence(currentContext)
  ), [
    currentContext,
  ]);

  useEffect(() => {
    if (
      selectedElementId
      && elements.some((element) => element.id === selectedElementId)
    ) {
      return;
    }

    setSelectedElementId(elements[0]?.id ?? '');
  }, [
    elements,
    selectedElementId,
  ]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      onOpenChange(false);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onOpenChange,
    open,
  ]);

  useEffect(() => {
    if (
      !open
      || !request
      || request.id === handledRequestId
    ) {
      return;
    }

    if (request.elementId) {
      setSelectedElementId(request.elementId);
    }

    if (request.mode) {
      setMode(request.mode);
    }

    if (request.action === 'analyze-screen') {
      void analyzeCurrentScreen().catch(() => undefined);
    }

    if (request.action === 'open-element') {
      setMode('element');
    }

    if (request.action === 'report') {
      rememberSnapshot(captureCurrentScreenContext('report-request'));
      setMode('report');
    }

    setHandledRequestId(request.id);
  }, [
    captureCurrentScreenContext,
    handledRequestId,
    open,
    rememberSnapshot,
    request,
  ]);

  async function analyzeCurrentScreen() {
    const snapshot = captureCurrentScreenContext('screen-analysis');
    setMode('screen');
    await captureContext(snapshot, 'screen-analysis');
    await submitMainMessage(
      'Przeanalizuj bieżący ekran i podsumuj najważniejsze wnioski.',
    );
  }

  async function handleMainSubmit(value: string) {
    const snapshot = captureCurrentScreenContext('chat-message');
    clearComposerDraft(resolvePapaMainDraftScope());
    await captureContext(snapshot, 'chat-message');
    await submitMainMessage(value);
  }

  async function handleElementSubmit(value: string) {
    if (!selectedElement) {
      return;
    }

    clearComposerDraft(resolvePapaElementDraftScope(selectedElement.id));
    await submitElementMessage(selectedElement.id, value);
  }

  function resetConversation() {
    resetRuntimeConversation();
    setMode('screen');
    setResetConfirmOpen(false);
  }

  async function handleReportCreate(
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ): Promise<void> {
    const snapshot = captureCurrentScreenContext(`report-${scope}-${format}`);
    const report = await createReport(
      snapshot,
      format,
      scope,
    );

    addMainMessages([
      createMessage({
        author: 'system',
        body: `Raport ${report.id} został przekazany do bezpiecznego generatora backendowego dla zakresu ${report.dateRangeLabel}.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
      createMessage({
        author: 'assistant',
        body: `Raport ${report.format.toUpperCase()} obejmuje ekran „${report.screenTitle}”, ${report.metricCount} metryk, ${report.tableCount} tabel, ${report.chartCount} wykresów i ${report.recommendationCount} rekomendacji. Pobranie będzie dostępne po zakończeniu zadania.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
    ]);
  }

  return (
    <>
      <OverlayRoot
        backdrop="none"
        className="pd-papa-assistant-overlay"
        lockScroll={false}
        open={overlayMounted}
      >
        <AnimatePresence onExitComplete={() => setIsClosing(false)}>
          {open ? (
        <motion.aside
          animate={{ opacity: 1, x: 0 }}
          aria-label="Papa Asystent"
          aria-modal="false"
          className="pd-overlay-surface pd-papa-sidecar"
          exit={{ opacity: 0, x: 24 }}
          initial={{ opacity: 0, x: 24 }}
          key="papa-sidecar"
          role="dialog"
          transition={overlayTransition}
        >
          <header className="pd-papa-sidecar__header">
            <div>
              <span className="pd-papa-sidecar__eyebrow">
                Papa Asystent
              </span>
              <h2>Analiza bieżącego ekranu</h2>
              <p>
                Wspólny wątek dla dashboardu i Laboratorium. Kontekst
                jest pobierany z aktywnego widoku.
              </p>
            </div>
            <div className="pd-papa-sidecar__header-actions">
              <button
                className="pd-papa-sidecar__conversation-chip"
                title="Skopiuj conversationId"
                type="button"
                onClick={() => {
                  copyConversationId(conversationId);
                }}
              >
                {shortenConversationId(conversationId)}
              </button>
              <button
                aria-label="Zamknij Papa Asystenta"
                className="pd-papa-sidecar__close-button"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </header>

          <div className="pd-papa-sidecar__toolbar">
            <Button
              size="small"
              startIcon={<Icon decorative name="assistant" size={16} />}
              variant="primary"
              onClick={() => {
                void analyzeCurrentScreen().catch(() => undefined);
              }}
            >
              Analizuj ekran
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => onNavigate?.('/app/papa/panel-kontekstowy-papa')}
            >
              Laboratorium
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setMode('report')}
            >
              Raport
            </Button>
            <Button
              size="small"
              variant="ghost"
              onClick={() => setResetConfirmOpen(true)}
            >
              Nowa rozmowa
            </Button>
          </div>

          <section
            aria-label="Kontekst ekranu dla Papa"
            className="pd-papa-sidecar__context"
          >
            <div>
              <span>Ekran</span>
              <strong>{currentContext.title}</strong>
              <small>{currentContext.route}</small>
            </div>
            <div>
              <span>Zakres</span>
              <strong>{currentContext.dateRangeLabel}</strong>
              <small>{currentContext.workspaceName}</small>
            </div>
            <StatusBadge
              status="Readiness"
              text={currentContext.readiness ?? 'Kontekst powłoki'}
              tone={resolveReadinessTone(currentContext.readiness)}
            />
          </section>

          <Tabs
            activation="manual"
            activeId={mode}
            ariaLabel="Tryb rozmowy Papa"
            className="pd-papa-sidecar__tabs"
            items={[
              {
                badge: messages.length > 0 ? String(messages.length) : undefined,
                icon: 'assistant',
                id: 'screen',
                label: 'Rozmowa',
                panel: (
                  <PapaMainThread
                    context={currentContext}
                    conversationId={conversationId}
                    draft={composerDrafts[resolvePapaMainDraftScope()] ?? ''}
                    error={mainError}
                    evidence={conversationEvidence}
                    lastSnapshot={lastSnapshot}
                    messages={messages}
                    submitting={mainSubmitting}
                    onAnalyze={analyzeCurrentScreen}
                    onDraftChange={(value) => {
                      setComposerDraft(resolvePapaMainDraftScope(), value);
                    }}
                    onSubmit={(value) => {
                      void handleMainSubmit(value).catch(() => undefined);
                    }}
                  />
                ),
              },
              {
                badge: selectedElementMessages.length > 0
                  ? String(selectedElementMessages.length)
                  : undefined,
                icon: 'data',
                id: 'element',
                label: 'Element',
                panel: (
                  <PapaElementThread
                    draft={selectedElement
                      ? composerDrafts[resolvePapaElementDraftScope(selectedElement.id)] ?? ''
                      : ''}
                    elements={elements}
                    error={elementError}
                    evidence={conversationEvidence}
                    messages={selectedElementMessages}
                    submitting={elementSubmitting}
                    onDraftChange={(value) => {
                      if (!selectedElement) {
                        return;
                      }

                      setComposerDraft(
                        resolvePapaElementDraftScope(selectedElement.id),
                        value,
                      );
                    }}
                    onSelectElement={setSelectedElementId}
                    onSubmit={(value) => {
                      void handleElementSubmit(value).catch(() => undefined);
                    }}
                    selectedElement={selectedElement}
                    selectedElementId={selectedElementId}
                  />
                ),
              },
              {
                badge: reports.length > 0 ? String(reports.length) : undefined,
                icon: 'decisions',
                id: 'report',
                label: 'Raport',
                panel: (
                  <PapaReportThread
                    context={currentContext}
                    lastSnapshot={lastSnapshot}
                    error={reportError}
                    onCreateReport={handleReportCreate}
                    onDownloadReport={downloadReport}
                    reports={reports}
                  />
                ),
              },
            ]}
            orientation="horizontal"
            size="compact"
            onActiveIdChange={(nextId) => {
              if (isPapaAssistantMode(nextId)) {
                setMode(nextId);
              }
            }}
          />
        </motion.aside>
          ) : null}
        </AnimatePresence>
      </OverlayRoot>
      <AlertDialog
        cancelLabel="Zostaw rozmowę"
        confirmLabel="Rozpocznij od nowa"
        destructive
        message="To rozpocznie nową rozmowę w bieżącym workspace i wyczyści lokalne drafty. Poprzednia historia pozostaje po stronie serwera zgodnie z retencją."
        open={resetConfirmOpen}
        title="Rozpocząć nową rozmowę?"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={resetConversation}
        onOpenChange={(nextOpen) => setResetConfirmOpen(nextOpen)}
      />
    </>
  );
}

function PapaMainThread({
  context,
  conversationId,
  draft,
  error,
  evidence,
  lastSnapshot,
  messages,
  submitting,
  onAnalyze,
  onDraftChange,
  onSubmit,
}: {
  readonly context: PapaScreenContext;
  readonly conversationId: string | null;
  readonly draft: string;
  readonly error: string | null;
  readonly evidence: readonly PapaMessageEvidence[];
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly messages: readonly PapaChatMessage[];
  readonly submitting: boolean;
  readonly onAnalyze: () => void;
  readonly onDraftChange: (value: string) => void;
  readonly onSubmit: (value: string) => void;
}) {
  function handleSubmit(value: ComposerSubmitValue) {
    if (typeof value === 'string') {
      onSubmit(value);
    }
  }

  return (
    <section
      aria-labelledby="papa-main-thread-heading"
      className="pd-papa-sidecar__thread pd-papa-sidecar__thread--chat"
    >
      <header className="pd-papa-sidecar__thread-header">
        <div>
          <span>Conversation ID</span>
          <h3 id="papa-main-thread-heading">
            {conversationId ?? 'Nowa rozmowa (zostanie zapisana po pierwszej wiadomości)'}
          </h3>
        </div>
        <small>
          {lastSnapshot
            ? `Snapshot: ${lastSnapshot.captureReason}`
            : `${countContextElements(context)} elementy kontekstu`}
        </small>
      </header>

      <PapaMessageThread
        emptyActionLabel="Analizuj ekran"
        emptyMessage="Papa nie pokaże tu przykładowej rozmowy. Uruchom analizę ekranu albo zadaj pytanie z bieżącym koszykiem kontekstu."
        emptyTitle="Rozmowa jest pusta"
        evidence={evidence}
        messages={messages}
        pending={submitting}
        onEmptyAction={onAnalyze}
      />

      {error ? (
        <InlineNotice
          className="pd-papa-sidecar__error"
          message={error}
          title="Papa nie odpowiedział"
          tone="critical"
        />
      ) : null}

      <AssistantComposer
        attachments={lastSnapshot ? [
          {
            id: lastSnapshot.snapshotId,
            name: 'screen-context.json',
            size: JSON.stringify(lastSnapshot).length,
          },
        ] : []}
        className="pd-papa-sidecar__composer"
        contextItemIds={[
          ...context.metrics,
          ...context.tables,
          ...context.charts,
          ...context.recommendations,
        ].map((item) => item.id)}
        label="Pytanie do Papa"
        placeholder="Zapytaj o wynik, ryzyko, rekomendację albo dowody..."
        submitting={submitting}
        value={draft}
        onValueChange={onDraftChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function PapaElementThread({
  draft,
  elements,
  error,
  evidence,
  messages,
  submitting,
  onDraftChange,
  onSelectElement,
  onSubmit,
  selectedElement,
  selectedElementId,
}: {
  readonly draft: string;
  readonly elements: readonly PapaAssistantElement[];
  readonly error: string | null;
  readonly evidence: readonly PapaMessageEvidence[];
  readonly messages: readonly PapaChatMessage[];
  readonly submitting: boolean;
  readonly onDraftChange: (value: string) => void;
  readonly onSelectElement: (elementId: string) => void;
  readonly onSubmit: (value: string) => void;
  readonly selectedElement: PapaAssistantElement | null;
  readonly selectedElementId: string;
}) {
  function handleSubmit(value: ComposerSubmitValue) {
    if (typeof value === 'string') {
      onSubmit(value);
    }
  }

  return (
    <section
      aria-labelledby="papa-element-thread-heading"
      className="pd-papa-sidecar__thread pd-papa-sidecar__thread--element"
    >
      <header className="pd-papa-sidecar__thread-header">
        <div>
          <span>Case thread</span>
          <h3 id="papa-element-thread-heading">
            {selectedElement?.label ?? 'Brak elementu'}
          </h3>
        </div>
        {selectedElement ? (
          <StatusBadge
            status="Element"
            text={resolveElementKindLabel(selectedElement.kind)}
            tone="info"
          />
        ) : null}
      </header>

      <div
        aria-label="Element do analizy"
        className="pd-papa-sidecar__element-picker"
        role="group"
      >
        {elements.map((element) => (
          <button
            aria-pressed={element.id === selectedElementId}
            key={element.id}
            type="button"
            onClick={() => onSelectElement(element.id)}
          >
            <span>{resolveElementKindLabel(element.kind)}</span>
            <strong>{element.label}</strong>
          </button>
        ))}
      </div>

      <PapaMessageThread
        emptyMessage="Wybierz element z bieżącego ekranu, żeby zawęzić rozmowę."
        emptyTitle="Brak rozmowy elementu"
        evidence={evidence}
        messages={messages}
        pending={submitting}
      />

      {error ? (
        <InlineNotice
          className="pd-papa-sidecar__error"
          message={error}
          title="Papa nie odpowiedział"
          tone="critical"
        />
      ) : null}

      <AssistantComposer
        attachments={[]}
        className="pd-papa-sidecar__composer"
        contextItemIds={selectedElement ? [selectedElement.id] : []}
        label="Pytanie o wybrany element"
        placeholder="Zapytaj tylko o ten KPI, rekord, wykres albo rekomendację..."
        submitting={submitting}
        value={draft}
        onValueChange={onDraftChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function PapaReportThread({
  context,
  error,
  lastSnapshot,
  onCreateReport,
  onDownloadReport,
  reports,
}: {
  readonly context: PapaScreenContext;
  readonly error: string | null;
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly onCreateReport: (
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ) => Promise<void>;
  readonly onDownloadReport: (report: PapaAssistantReportArtifact) => Promise<void>;
  readonly reports: readonly PapaAssistantReportArtifact[];
}) {
  const [scope, setScope] =
    useState<PapaAssistantReportScope>('screen');
  const snapshotLabel = lastSnapshot
    ? lastSnapshot.snapshotId
    : 'Snapshot zostanie utworzony przy generowaniu';
  const scopedCounts = resolveReportScopeCounts(context, scope);

  return (
    <section
      aria-labelledby="papa-report-thread-heading"
      className="pd-papa-sidecar__thread pd-papa-sidecar__thread--report"
    >
      <header className="pd-papa-sidecar__thread-header">
        <div>
          <span>Raport z widoku</span>
          <h3 id="papa-report-thread-heading">{context.title}</h3>
        </div>
        <StatusBadge
          status="Zakres"
          text={context.dateRangeLabel}
          tone="info"
        />
      </header>

      <div className="pd-papa-sidecar__report-builder">
        <div>
          <span>Snapshot</span>
          <strong>{snapshotLabel}</strong>
          <p>
            Raport zawiera metryki, tabele, wykresy, rekomendacje,
            dowody, freshness, filtry i route bieżącego ekranu.
          </p>
        </div>

        <div
          aria-label="Zakres raportu Papa"
          className="pd-papa-sidecar__report-scope"
          role="group"
        >
          {reportScopes.map((item) => (
            <button
              aria-pressed={scope === item.id}
              key={item.id}
              type="button"
              onClick={() => setScope(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </div>

        <dl className="pd-papa-sidecar__report-counts">
          <div>
            <dt>Metryki</dt>
            <dd>{scopedCounts.metrics}</dd>
          </div>
          <div>
            <dt>Tabele</dt>
            <dd>{scopedCounts.tables}</dd>
          </div>
          <div>
            <dt>Wykresy</dt>
            <dd>{scopedCounts.charts}</dd>
          </div>
          <div>
            <dt>Dowody</dt>
            <dd>{scopedCounts.evidence}</dd>
          </div>
        </dl>

        <div className="pd-papa-sidecar__report-actions">
          <Button
            disabled
            size="small"
            title="PDF zostanie włączony po podłączeniu bezpiecznego renderera backendowego."
            variant="secondary"
          >
            PDF niedostępny
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={() => {
              void onCreateReport('csv', scope).catch(() => undefined);
            }}
          >
            Generuj CSV
          </Button>
        </div>

        {error ? (
          <InlineNotice
            message={error}
            title="Raport nie został przygotowany"
            tone="critical"
          />
        ) : null}
      </div>

      <div className="pd-papa-sidecar__report-list">
        {reports.length === 0 ? (
          <p className="pd-papa-sidecar__empty-thread">
            Brak wygenerowanych raportów w bieżącej rozmowie.
          </p>
        ) : (
          reports.map((report) => (
            <article key={report.id}>
              <header>
                <div>
                  <span>{report.format.toUpperCase()}</span>
                  <strong>{report.title}</strong>
                </div>
                <StatusBadge
                  status="Status"
                  text={resolveRuntimeReportStatusText(report.status)}
                  tone={resolveRuntimeReportStatusTone(report.status)}
                />
              </header>
              <p>{report.description}</p>
              <dl>
                <div>
                  <dt>Zakres</dt>
                  <dd>{report.dateRangeLabel}</dd>
                </div>
                <div>
                  <dt>Snapshot</dt>
                  <dd>{report.snapshotId}</dd>
                </div>
                <div>
                  <dt>Rozmiar</dt>
                  <dd>{formatBytes(report.size)}</dd>
                </div>
              </dl>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  void onDownloadReport(report).catch(() => undefined);
                }}
              >
                Pobierz ponownie
              </Button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function buildAssistantElements(
  context: PapaScreenContext,
): readonly PapaAssistantElement[] {
  return uniqueElements([
    ...context.metrics,
    ...context.recommendations,
    ...context.tables,
    ...context.charts,
    ...context.evidence,
    ...context.elements,
  ]);
}

function uniqueElements(
  elements: readonly (PapaAssistantElement | PapaScreenContextElement)[],
): readonly PapaAssistantElement[] {
  const seen = new Set<string>();
  const result: PapaAssistantElement[] = [];

  for (const element of elements) {
    if (seen.has(element.id)) {
      continue;
    }

    seen.add(element.id);
    result.push({
      ...element,
      baseMessages: 'baseMessages' in element
        ? element.baseMessages
        : [],
    });
  }

  return result;
}

function createMessage({
  author,
  body,
  contextItemId,
  evidenceIds,
}: {
  readonly author: PapaChatMessage['author'];
  readonly body: string;
  readonly contextItemId?: string;
  readonly evidenceIds: readonly string[];
}): PapaChatMessage {
  return createPapaAssistantMessage({
    author,
    body,
    contextItemId,
    evidenceIds,
  });
}

function countContextElements(
  context: PapaScreenContext,
): number {
  return [
    ...context.metrics,
    ...context.tables,
    ...context.charts,
    ...context.recommendations,
    ...context.evidence,
    ...context.elements,
  ].length;
}

function buildMessageEvidence(
  context: PapaScreenContext,
): readonly PapaMessageEvidence[] {
  return context.evidence.map((item) => ({
    id: item.id,
    label: item.label,
    source: item.source ?? item.description ?? null,
  }));
}

function resolveRuntimeReportStatusText(
  status: PapaAssistantReportArtifact['status'],
): string {
  switch (status) {
    case 'ready':
      return 'Gotowy';
    case 'failed':
      return 'Błąd';
    case 'expired':
      return 'Wygasł';
    case 'cancelled':
      return 'Anulowany';
    case 'generating':
      return 'Generowanie';
    case 'queued':
    default:
      return 'W kolejce';
  }
}

function resolveRuntimeReportStatusTone(
  status: PapaAssistantReportArtifact['status'],
): 'critical' | 'neutral' | 'success' | 'warning' {
  if (status === 'ready') return 'success';
  if (status === 'failed') return 'critical';
  if (status === 'queued' || status === 'generating') return 'warning';
  return 'neutral';
}

function copyConversationId(conversationId: string | null): void {
  if (
    !conversationId
    || typeof navigator === 'undefined'
    || !navigator.clipboard
  ) {
    return;
  }

  void navigator.clipboard.writeText(conversationId);
}

function isPapaAssistantMode(
  value: string,
): value is PapaAssistantMode {
  return value === 'screen'
    || value === 'element'
    || value === 'report';
}

function shortenConversationId(conversationId: string | null): string {
  if (!conversationId) {
    return 'Nowa rozmowa';
  }

  if (conversationId.length <= 22) {
    return conversationId;
  }

  return `${conversationId.slice(0, 14)}...${conversationId.slice(-6)}`;
}

function resolveReportScopeCounts(
  context: PapaScreenContext,
  scope: PapaAssistantReportScope,
) {
  return {
    charts: scope === 'tables' || scope === 'recommendations'
      ? 0
      : context.charts.length,
    evidence: context.evidence.length,
    metrics: scope === 'tables' || scope === 'recommendations'
      ? 0
      : context.metrics.length,
    recommendations: scope === 'tables' || scope === 'metrics'
      ? 0
      : context.recommendations.length,
    tables: scope === 'metrics' || scope === 'recommendations'
      ? 0
      : context.tables.length,
  };
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B';
  }

  if (value < 1024) {
    return `${Math.round(value)} B`;
  }

  return `${Math.round((value / 1024) * 10) / 10} KB`;
}

function resolveReadinessTone(
  readiness: string | null,
) {
  if (!readiness) return 'neutral';
  const normalized = readiness.toLowerCase();

  if (
    normalized.includes('gotowe')
    || normalized.includes('ready')
  ) {
    return 'success';
  }

  if (
    normalized.includes('blok')
    || normalized.includes('error')
    || normalized.includes('critical')
  ) {
    return 'critical';
  }

  if (
    normalized.includes('części')
    || normalized.includes('partial')
    || normalized.includes('warning')
    || normalized.includes('uwag')
  ) {
    return 'warning';
  }

  return 'info';
}

function resolveElementKindLabel(
  kind: PapaScreenContextElementKind,
): string {
  switch (kind) {
    case 'chart':
      return 'Wykres';
    case 'decision':
      return 'Decyzja';
    case 'evidence':
      return 'Dowód';
    case 'filter':
      return 'Filtr';
    case 'metric':
      return 'Metryka';
    case 'recommendation':
      return 'Rekomendacja';
    case 'table':
      return 'Tabela';
    case 'record':
    default:
      return 'Rekord';
  }
}
