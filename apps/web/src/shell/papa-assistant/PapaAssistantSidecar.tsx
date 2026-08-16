import type {
  HTMLAttributes,
} from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AssistantComposer,
  Button,
  Icon,
  OverlayRoot,
  StatusBadge,
} from '../../design-system';
import {
  createPapaStorybookData,
} from '../../screens/papa/papaData';
import type {
  PapaChatMessage,
  PapaElementThread,
  PapaWorkspaceData,
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
  downloadPapaAssistantReport,
  usePapaAssistantRuntime,
} from './PapaAssistantRuntimeContext';
import {
  usePapaScreenContext,
} from './ScreenContextProvider';
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
    addElementMessages,
    addMainMessages,
    conversationId,
    createReport,
    elementMessages,
    lastSnapshot,
    messages,
    rememberSnapshot,
    reports,
    resetConversation: resetRuntimeConversation,
  } = usePapaAssistantRuntime();
  const papaData = useMemo(() => createPapaStorybookData(), []);
  const [mode, setMode] = useState<PapaAssistantMode>('screen');
  const [handledRequestId, setHandledRequestId] =
    useState<string | null>(null);

  const elements = useMemo(() => (
    buildAssistantElements(currentContext, papaData)
  ), [
    currentContext,
    papaData,
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
      analyzeCurrentScreen();
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

  function analyzeCurrentScreen() {
    const snapshot = captureCurrentScreenContext('screen-analysis');
    rememberSnapshot(snapshot);
    setMode('screen');
    addMainMessages([
      createMessage({
        author: 'system',
        body: `Snapshot ${snapshot.snapshotId} zapisany z ekranu ${snapshot.title}.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
      createMessage({
        author: 'assistant',
        body: buildScreenAnalysisReply(snapshot, papaData),
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
    ]);
  }

  function handleMainSubmit(value: string) {
    const snapshot = captureCurrentScreenContext('chat-message');
    rememberSnapshot(snapshot);
    addMainMessages([
      createMessage({
        author: 'user',
        body: value,
        evidenceIds: [],
      }),
      createMessage({
        author: 'assistant',
        body: buildMainReply(value, snapshot, papaData),
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
    ]);
  }

  function handleElementSubmit(value: string) {
    if (!selectedElement) {
      return;
    }

    const reply = buildElementReply(value, selectedElement);

    addElementMessages([
      createMessage({
        author: 'user',
        body: value,
        contextItemId: selectedElement.id,
        evidenceIds: [],
      }),
      createMessage({
        author: 'assistant',
        body: reply,
        contextItemId: selectedElement.id,
        evidenceIds: selectedElement.evidenceIds ?? [],
      }),
    ]);
  }

  function resetConversation() {
    resetRuntimeConversation();
    setMode('screen');
  }

  function handleReportCreate(
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ) {
    const snapshot = captureCurrentScreenContext(`report-${scope}-${format}`);
    const report = createReport(
      snapshot,
      format,
      scope,
    );

    addMainMessages([
      createMessage({
        author: 'system',
        body: `Raport ${report.id} został wygenerowany dla zakresu ${report.dateRangeLabel}.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
      createMessage({
        author: 'assistant',
        body: `Gotowe. Raport ${report.format.toUpperCase()} obejmuje ekran „${report.screenTitle}”, ${report.metricCount} metryk, ${report.tableCount} tabel, ${report.chartCount} wykresów i ${report.recommendationCount} rekomendacji.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
    ]);
    downloadPapaAssistantReport(report);
  }

  return (
    <OverlayRoot
      backdrop="none"
      className="pd-papa-assistant-overlay"
      lockScroll={false}
      open={open}
    >
      <aside
        aria-label="Papa Asystent"
        aria-modal="false"
        className="pd-overlay-surface pd-papa-sidecar"
        role="dialog"
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
          <Button
            aria-label="Zamknij Papa Asystenta"
            size="small"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Zamknij
          </Button>
        </header>

        <div className="pd-papa-sidecar__toolbar">
          <Button
            size="small"
            startIcon={<Icon decorative name="assistant" size={16} />}
            variant="primary"
            onClick={analyzeCurrentScreen}
          >
            Analizuj ekran
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => onNavigate?.('/app/papa/laboratorium-ai')}
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
            onClick={resetConversation}
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

        <nav
          aria-label="Tryb rozmowy Papa"
          className="pd-papa-sidecar__mode-switch"
        >
          <button
            aria-pressed={mode === 'screen'}
            type="button"
            onClick={() => setMode('screen')}
          >
            Czat główny
          </button>
          <button
            aria-pressed={mode === 'element'}
            type="button"
            onClick={() => setMode('element')}
          >
            Czat elementu
          </button>
          <button
            aria-pressed={mode === 'report'}
            type="button"
            onClick={() => setMode('report')}
          >
            Raport
          </button>
        </nav>

        {mode === 'screen' ? (
          <PapaMainThread
            context={currentContext}
            conversationId={conversationId}
            lastSnapshot={lastSnapshot}
            messages={messages}
            onSubmit={handleMainSubmit}
          />
        ) : mode === 'element' ? (
          <PapaElementThread
            elements={elements}
            messages={selectedElementMessages}
            onSelectElement={setSelectedElementId}
            onSubmit={handleElementSubmit}
            selectedElement={selectedElement}
            selectedElementId={selectedElementId}
          />
        ) : (
          <PapaReportThread
            context={currentContext}
            lastSnapshot={lastSnapshot}
            onCreateReport={handleReportCreate}
            reports={reports}
          />
        )}
      </aside>
    </OverlayRoot>
  );
}

function PapaMainThread({
  context,
  conversationId,
  lastSnapshot,
  messages,
  onSubmit,
}: {
  readonly context: PapaScreenContext;
  readonly conversationId: string;
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly messages: readonly PapaChatMessage[];
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
      className="pd-papa-sidecar__thread"
    >
      <header className="pd-papa-sidecar__thread-header">
        <div>
          <span>Conversation ID</span>
          <h3 id="papa-main-thread-heading">{conversationId}</h3>
        </div>
        <small>
          {lastSnapshot
            ? `Snapshot: ${lastSnapshot.captureReason}`
            : `${countContextElements(context)} elementy kontekstu`}
        </small>
      </header>

      <PapaMessageList messages={messages} />

      <AssistantComposer
        key={`main-${messages.length}`}
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
        submitting={false}
        value=""
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function PapaElementThread({
  elements,
  messages,
  onSelectElement,
  onSubmit,
  selectedElement,
  selectedElementId,
}: {
  readonly elements: readonly PapaAssistantElement[];
  readonly messages: readonly PapaChatMessage[];
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
      className="pd-papa-sidecar__thread"
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

      <PapaMessageList
        emptyMessage="Wybierz element z bieżącego ekranu, żeby zawęzić rozmowę."
        messages={messages}
      />

      <AssistantComposer
        key={`element-${selectedElementId}-${messages.length}`}
        attachments={[]}
        className="pd-papa-sidecar__composer"
        contextItemIds={selectedElement ? [selectedElement.id] : []}
        label="Pytanie o wybrany element"
        placeholder="Zapytaj tylko o ten KPI, rekord, wykres albo rekomendację..."
        submitting={false}
        value=""
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function PapaReportThread({
  context,
  lastSnapshot,
  onCreateReport,
  reports,
}: {
  readonly context: PapaScreenContext;
  readonly lastSnapshot: PapaScreenContextSnapshot | null;
  readonly onCreateReport: (
    format: PapaAssistantReportFormat,
    scope: PapaAssistantReportScope,
  ) => void;
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
      className="pd-papa-sidecar__thread"
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
            size="small"
            variant="primary"
            onClick={() => onCreateReport('pdf', scope)}
          >
            Generuj PDF
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => onCreateReport('csv', scope)}
          >
            Generuj CSV
          </Button>
        </div>
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
                  text="Gotowy"
                  tone="success"
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
                onClick={() => downloadPapaAssistantReport(report)}
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

function PapaMessageList({
  emptyMessage = 'Brak wiadomości w bieżącym wątku.',
  messages,
}: {
  readonly emptyMessage?: string;
  readonly messages: readonly PapaChatMessage[];
}) {
  if (messages.length === 0) {
    return (
      <p className="pd-papa-sidecar__empty-thread">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="pd-papa-sidecar__messages">
      {messages.map((message) => (
        <li
          data-author={message.author}
          key={message.id}
        >
          <span>{resolveMessageAuthor(message.author)}</span>
          <p>{message.body}</p>
          <small>{formatShortDateTime(message.createdAt)}</small>
        </li>
      ))}
    </ol>
  );
}

function buildAssistantElements(
  context: PapaScreenContext,
  data: PapaWorkspaceData,
): readonly PapaAssistantElement[] {
  return uniqueElements([
    ...context.metrics,
    ...context.recommendations,
    ...context.tables,
    ...context.charts,
    ...context.evidence,
    ...context.elements,
    ...data.contextItems.map<PapaAssistantElement>((item) => ({
      description: `${item.source}; retencja ${item.retention}`,
      evidenceIds: [],
      id: item.id,
      kind: item.kind === 'metric'
        ? 'metric'
        : item.kind === 'decision'
          ? 'decision'
          : 'record',
      label: item.label,
      source: item.source,
      status: `${Math.round(item.confidence * 100)}% confidence`,
      value: null,
      baseMessages: [],
    })),
    ...data.elementThreads.map((thread) => threadToElement(thread)),
  ]);
}

function threadToElement(
  thread: PapaElementThread,
): PapaAssistantElement {
  const kind: PapaScreenContextElementKind =
    thread.elementKind === 'action'
      ? 'decision'
      : thread.elementKind === 'segment'
        ? 'record'
        : thread.elementKind;

  return {
    description: `Wątek elementu ${thread.elementLabel}`,
    evidenceIds: Array.from(new Set(
      thread.messages.flatMap((message) => message.evidenceIds),
    )),
    id: thread.elementId,
    kind,
    label: thread.elementLabel,
    source: 'Papa',
    status: thread.status,
    value: null,
    baseMessages: thread.messages,
  };
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

function buildScreenAnalysisReply(
  snapshot: PapaScreenContextSnapshot,
  data: PapaWorkspaceData,
): string {
  const headlineMetric =
    snapshot.metrics[0]
    ?? snapshot.elements.find((item) => item.kind === 'metric')
    ?? null;
  const recommendation =
    snapshot.recommendations[0]
    ?? data.recommendations.find((item) => item.status === 'needs-approval')
    ?? data.recommendations[0]
    ?? null;
  const evidenceCount =
    snapshot.evidence.length || data.evidence.length;
  const metricsSummary = snapshot.metrics
    .slice(0, 4)
    .map((item) => (
      `${item.label}${item.value ? ` ${item.value}` : ''}${item.status ? ` (${item.status})` : ''}`
    ))
    .join('; ');
  const chartSummary = snapshot.charts
    .slice(0, 3)
    .map((item) => item.label)
    .join(', ');
  const tableSummary = snapshot.tables
    .slice(0, 3)
    .map((item) => (
      item.value ? `${item.label}: ${item.value}` : item.label
    ))
    .join('; ');

  const fragments = [
    `Analizuję ekran „${snapshot.title}” dla zakresu ${snapshot.dateRangeLabel}.`,
    snapshot.readiness
      ? `Stan danych: ${snapshot.readiness}.`
      : 'Stan danych wynika z kontekstu powłoki.',
    headlineMetric
      ? `Najważniejszy element: ${headlineMetric.label}${headlineMetric.value ? ` (${headlineMetric.value})` : ''}.`
      : 'Na ekranie nie ma jeszcze zarejestrowanej metryki, więc pracuję na kontekście route i workspace.',
    metricsSummary
      ? `KPI w koszyku kontekstu: ${metricsSummary}.`
      : 'Brak KPI w koszyku kontekstu.',
    chartSummary
      ? `Wykresy do interpretacji: ${chartSummary}.`
      : 'Brak wykresów zgłoszonych do Papa.',
    tableSummary
      ? `Tabele raportowe: ${tableSummary}.`
      : 'Brak tabel alternatywnych w snapshotcie.',
    recommendation
      ? `Rekomendacja: ${'summary' in recommendation ? recommendation.summary : recommendation.description ?? recommendation.label}.`
      : 'Nie widzę aktywnej rekomendacji w snapshotcie.',
    `Dowody dostępne dla odpowiedzi: ${evidenceCount}.`,
  ];

  return fragments.join(' ');
}

function buildMainReply(
  value: string,
  snapshot: PapaScreenContextSnapshot,
  data: PapaWorkspaceData,
): string {
  const normalized = value.toLowerCase();

  if (normalized.includes('dowod') || normalized.includes('evidence')) {
    return `Na ekranie „${snapshot.title}” mam ${snapshot.evidence.length || data.evidence.length} dowody. Najpierw sprawdziłbym świeżość źródeł, potem wpływ na decyzję i dopiero wtedy przygotował rekomendację.`;
  }

  if (normalized.includes('ryzyk') || normalized.includes('blokad')) {
    const blocked = data.statuses.find((status) => status.state === 'blocked');

    return blocked
      ? `${blocked.title}: ${blocked.description} To wymaga decyzji człowieka przed akcją AI.`
      : 'Nie widzę blokady krytycznej, ale każda mutacja nadal wymaga capability, idempotency key i zatwierdzenia.';
  }

  if (
    normalized.includes('raport')
    || normalized.includes('pdf')
    || normalized.includes('csv')
  ) {
    return `Mogę wygenerować raport PDF lub CSV dla widoku „${snapshot.title}” i zakresu ${snapshot.dateRangeLabel}. Przejdź do trybu „Raport”, wybierz cały widok, KPI, tabele albo rekomendacje i uruchom eksport.`;
  }

  return buildScreenAnalysisReply(snapshot, data);
}

function buildElementReply(
  value: string,
  element: PapaAssistantElement,
): string {
  const ask = value.trim();
  const status = element.status
    ? ` Status elementu: ${element.status}.`
    : '';
  const evidence = element.evidenceIds?.length
    ? ` Dowody powiązane: ${element.evidenceIds.length}.`
    : ' Brak jawnie podpiętych dowodów w rejestrze elementu.';

  return `Wątek dotyczy elementu „${element.label}”. ${ask ? `Pytanie: ${ask}.` : ''}${status}${evidence} Papa ogranicza odpowiedź do tego elementu i nie miesza go z resztą dashboardu.`;
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

function resolveMessageAuthor(
  author: PapaChatMessage['author'],
): string {
  switch (author) {
    case 'assistant':
      return 'Papa';
    case 'system':
      return 'System';
    case 'user':
    default:
      return 'Ty';
  }
}

function formatShortDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}
