import {
  type HTMLAttributes,
  useMemo,
  useState,
} from 'react';

import type {
  SemanticStatusTone,
} from '../../design-system';
import {
  AssistantComposer,
  Button,
  ComparisonChart,
  DataTable,
  MetricCard,
  RecommendationCard,
  ShareChart,
  StatusBadge,
  TrendChart,
} from '../../design-system';
import {
  papaEvidenceRefs,
  papaLabExperimentColumns,
  papaLabExperimentRows,
  papaReportColumns,
  papaReportRows,
} from './papaData';
import type {
  PapaAssistantStatus,
  PapaChatMessage,
  PapaElementThread,
  PapaLabExperiment,
  PapaRecommendationRecord,
  PapaReportArtifact,
  PapaScreenVariant,
  PapaWorkspaceData,
} from './papaData';
import {
  createPapaAssistantMessage,
  downloadPapaAssistantReport,
  usePapaAssistantRuntime,
  usePapaScreenContext,
} from '../../shell/papa-assistant';
import './papa-assistant-panels.css';

type RecommendationFeedback = {
  readonly recommendationId: string;
  readonly decision: 'approved' | 'rejected';
};

type ComposerSubmitValue =
  | string
  | Parameters<NonNullable<HTMLAttributes<HTMLElement>['onSubmit']>>[0];

export function PapaAssistantRuntime({
  data,
  variant,
}: {
  readonly data: PapaWorkspaceData;
  readonly variant: PapaScreenVariant;
}) {
  const showConversation = shouldShowConversation(variant);
  const showRecommendations = shouldShowRecommendations(variant);
  const showLab = variant === 'lab';

  return (
    <>
      <PapaAssistantStatusPanel data={data} />

      {showRecommendations ? (
        <PapaRecommendationPanel data={data} />
      ) : null}

      {showConversation ? (
        <PapaConversationDeck data={data} />
      ) : null}

      {showLab ? (
        <>
          <PapaAssistantLaboratory data={data} />
          <PapaReportCenter data={data} />
        </>
      ) : null}
    </>
  );
}

function PapaAssistantStatusPanel({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section
      aria-labelledby="papa-assistant-status-heading"
      className="pd-papa-assistant-panel"
    >
      <header className="pd-papa-assistant-panel__header">
        <div>
          <span>Statusy Papa Asystenta</span>
          <h2 id="papa-assistant-status-heading">Stan pracy asystenta</h2>
        </div>
        <StatusBadge
          status="Gotowość"
          text={resolveReadinessText(data.summary.readiness)}
          tone={resolveReadinessTone(data.summary.readiness)}
        />
      </header>

      <div className="pd-papa-assistant-status-grid">
        {data.statuses.map((item) => (
          <PapaAssistantStatusCard
            item={item}
            key={item.id}
          />
        ))}
      </div>

      <div className="pd-papa-assistant-metric-grid">
        <MetricCard
          comparison={{
            direction: 'up',
            label: '+4 p.p. wobec początku miesiąca',
          }}
          label="Pewność odpowiedzi"
          metricId="papa-assistant-confidence"
          signal="warning"
          sparklinePoints={data.assistantTrend.map((item) => item.actual)}
          status="partial"
          statusLabel="Częściowa"
          targetLabel="Próg 90%"
          unit="%"
          value={String(Math.round(data.summary.confidence * 100))}
        />
        <MetricCard
          comparison={{
            direction: 'flat',
            label: `${data.summary.evidenceCount} aktywne źródła`,
          }}
          label="Dowody"
          metricId="papa-assistant-evidence"
          signal="neutral"
          status="ready"
          statusLabel="Gotowe"
          unit="źródła"
          value={String(data.summary.evidenceCount)}
        />
        <MetricCard
          comparison={{
            direction: 'down',
            label: 'blokady ograniczają automatyzację',
          }}
          emphasis="alert"
          label="Decyzje człowieka"
          metricId="papa-assistant-decisions"
          signal="warning"
          status="partial"
          statusLabel="Do obsługi"
          unit="pozycje"
          value={String(data.summary.decisionsDue)}
        />
      </div>

      <div className="pd-papa-assistant-chart-row">
        <figure className="pd-papa-assistant-chart">
          <figcaption>
            <span>Trend pewności</span>
            <strong>Odpowiedzi Papa według zakresu danych</strong>
          </figcaption>
          <TrendChart
            ariaLabel="Trend pewności odpowiedzi Papa"
            data={data.assistantTrend}
            labels={{
              actual: 'Pewność',
              movingAverage: 'Średnia',
              plan: 'Próg',
            }}
            unit="%"
            variant="area"
          />
        </figure>
        <figure className="pd-papa-assistant-chart">
          <figcaption>
            <span>Skład dowodów</span>
            <strong>Źródła używane w odpowiedziach</strong>
          </figcaption>
          <ShareChart
            ariaLabel="Udział źródeł dowodowych Papa"
            display="donut"
            segments={data.sources.map((source) => ({
              id: `${source.provider}-${source.dataset}`,
              label: source.provider,
              percent: Math.round(source.completeness * 1000) / 10,
              value: Math.round(source.completeness * 100),
            }))}
            total={data.sources.reduce((sum, source) => (
              sum + Math.round(source.completeness * 100)
            ), 0)}
          />
        </figure>
      </div>
    </section>
  );
}

function PapaAssistantStatusCard({
  item,
}: {
  readonly item: PapaAssistantStatus;
}) {
  return (
    <article
      className="pd-papa-assistant-status"
      data-state={item.state}
    >
      <header>
        <div>
          <span>{item.metric}</span>
          <h3>{item.title}</h3>
        </div>
        <StatusBadge
          status="Status"
          text={resolveAssistantStatusText(item.state)}
          tone={resolveAssistantStatusTone(item.state)}
        />
      </header>
      <p>{item.description}</p>
      <dl>
        <div>
          <dt>Wartość</dt>
          <dd>{item.value}</dd>
        </div>
        <div>
          <dt>Właściciel</dt>
          <dd>{item.owner}</dd>
        </div>
        <div>
          <dt>Odświeżono</dt>
          <dd>{formatDateTime(item.updatedAt)}</dd>
        </div>
      </dl>
    </article>
  );
}

function PapaRecommendationPanel({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const evidence = papaEvidenceRefs(data.evidence);
  const [feedback, setFeedback] = useState<readonly RecommendationFeedback[]>([]);

  function updateFeedback(
    recommendationId: string,
    decision: RecommendationFeedback['decision'],
  ) {
    setFeedback((current) => [
      ...current.filter((item) => item.recommendationId !== recommendationId),
      { decision, recommendationId },
    ]);
  }

  return (
    <section
      aria-labelledby="papa-recommendation-heading"
      className="pd-papa-assistant-panel"
    >
      <header className="pd-papa-assistant-panel__header">
        <div>
          <span>Rekomendacje</span>
          <h2 id="papa-recommendation-heading">Rekomendacje do oceny</h2>
        </div>
        <StatusBadge
          status="Rekomendacje"
          text={`${data.recommendations.length} aktywne`}
          tone="info"
        />
      </header>

      <div className="pd-papa-recommendation-grid">
        {data.recommendations.map((recommendation) => {
          const itemFeedback = feedback.find((item) => (
            item.recommendationId === recommendation.id
          ));

          return (
            <div
              className="pd-papa-recommendation-item"
              key={recommendation.id}
            >
              <RecommendationCard
                context={data.context}
                effort={recommendation.effort}
                evidence={evidence.filter((item) => (
                  recommendation.evidenceIds.includes(item.id)
                ))}
                impact={recommendation.impact}
                recommendationId={recommendation.id}
                risk={recommendation.risk}
                title={recommendation.title}
                onApprove={() => {
                  updateFeedback(recommendation.id, 'approved');
                }}
                onReject={() => {
                  updateFeedback(recommendation.id, 'rejected');
                }}
              />
              <div className="pd-papa-recommendation-item__body">
                <p>{recommendation.summary}</p>
                <dl>
                  <div>
                    <dt>Właściciel</dt>
                    <dd>{recommendation.owner}</dd>
                  </div>
                  <div>
                    <dt>Następny krok</dt>
                    <dd>{recommendation.nextStep}</dd>
                  </div>
                </dl>
                {itemFeedback ? (
                  <StatusBadge
                    status="Decyzja"
                    text={itemFeedback.decision === 'approved' ? 'Oznaczono do akceptacji' : 'Oznaczono do odrzucenia'}
                    tone={itemFeedback.decision === 'approved' ? 'success' : 'critical'}
                  />
                ) : (
                  <StatusBadge
                    status="Stan"
                    text={resolveRecommendationStatusText(recommendation.status)}
                    tone={resolveRecommendationStatusTone(recommendation.status)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PapaConversationDeck({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section
      aria-labelledby="papa-conversation-heading"
      className="pd-papa-assistant-panel"
    >
      <header className="pd-papa-assistant-panel__header">
        <div>
          <span>Czaty</span>
          <h2 id="papa-conversation-heading">Rozmowa Papa i rozmowa elementu</h2>
        </div>
        <StatusBadge
          status="Conversation ID"
          text="Zachowany"
          tone="success"
        />
      </header>

      <div className="pd-papa-chat-grid">
        <PapaAssistantChat data={data} />
        <PapaElementChat data={data} />
      </div>
    </section>
  );
}

function PapaAssistantChat({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const {
    addMainMessages,
    lastSnapshot,
    messages,
  } = usePapaAssistantRuntime();

  function handleSubmit(value: ComposerSubmitValue) {
    if (typeof value !== 'string') {
      return;
    }

    const userMessage = createPapaAssistantMessage({
      author: 'user',
      body: value,
      evidenceIds: [],
    });
    const assistantMessage = createPapaAssistantMessage({
      author: 'assistant',
      body: lastSnapshot
        ? buildAssistantReplyForSnapshot(data, lastSnapshot.title)
        : buildAssistantReply(data),
      evidenceIds: data.evidence.map((item) => item.id),
    });

    addMainMessages([
      userMessage,
      assistantMessage,
    ]);
  }

  return (
    <article className="pd-papa-chat-surface">
      <header>
        <div>
          <span>Czat główny</span>
          <h3>Papa Asystent</h3>
        </div>
        <StatusBadge
          status="Tryb"
          text="Odpowiedź z dowodami"
          tone="info"
        />
      </header>

      <MessageList messages={messages} />

      <AssistantComposer
        attachments={[
          lastSnapshot
            ? {
                id: lastSnapshot.snapshotId,
                name: 'screen-context.json',
                size: JSON.stringify(lastSnapshot).length,
              }
            : {
                id: 'papa-context-basket',
                name: 'koszyk-kontekstu.json',
                size: 24800,
              },
        ]}
        className="pd-papa-chat-composer"
        contextItemIds={data.contextItems.map((item) => item.id)}
        label="Pytanie do Papa"
        placeholder="Zapytaj o rekomendacje, ryzyko albo dowody..."
        submitting={false}
        value=""
        onSubmit={handleSubmit}
      />
    </article>
  );
}

function PapaElementChat({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const initialElementId = data.elementThreads[0]?.elementId ?? '';
  const [selectedElementId, setSelectedElementId] = useState(initialElementId);
  const {
    addElementMessages,
    elementMessages,
  } = usePapaAssistantRuntime();
  const selectedThread = resolveSelectedThread(data.elementThreads, selectedElementId);
  const messages = selectedThread
    ? [
      ...selectedThread.messages,
      ...elementMessages.filter((message) => (
        message.contextItemId === selectedThread.elementId
      )),
    ]
    : [];

  function handleSubmit(value: ComposerSubmitValue) {
    if (typeof value !== 'string') {
      return;
    }

    if (!selectedThread) {
      return;
    }

    const userMessage = createPapaAssistantMessage({
      author: 'user',
      body: value,
      contextItemId: selectedThread.elementId,
      evidenceIds: [],
    });
    const assistantMessage = createPapaAssistantMessage({
      author: 'assistant',
      body: buildElementReply(selectedThread),
      contextItemId: selectedThread.elementId,
      evidenceIds: selectedThread.messages.flatMap((message) => message.evidenceIds),
    });

    addElementMessages([
      userMessage,
      assistantMessage,
    ]);
  }

  return (
    <article className="pd-papa-chat-surface">
      <header>
        <div>
          <span>Czat elementu</span>
          <h3>{selectedThread?.elementLabel ?? 'Element kontekstu'}</h3>
        </div>
        {selectedThread ? (
          <StatusBadge
            status="Stan elementu"
            text={resolveElementStatusText(selectedThread.status)}
            tone={resolveElementStatusTone(selectedThread.status)}
          />
        ) : null}
      </header>

      <div
        aria-label="Wybór elementu czatu"
        className="pd-papa-element-switcher"
        role="group"
      >
        {data.elementThreads.map((thread) => (
          <Button
            key={thread.elementId}
            size="small"
            variant={thread.elementId === selectedElementId ? 'primary' : 'secondary'}
            onClick={() => {
              setSelectedElementId(thread.elementId);
            }}
          >
            {thread.elementLabel}
          </Button>
        ))}
      </div>

      <MessageList messages={messages} />

      <AssistantComposer
        attachments={[]}
        className="pd-papa-chat-composer"
        contextItemIds={selectedThread ? [selectedThread.elementId] : []}
        label="Pytanie o wybrany element"
        placeholder="Zapytaj tylko o wybrany element..."
        submitting={false}
        value=""
        onSubmit={handleSubmit}
      />
    </article>
  );
}

function MessageList({
  messages,
}: {
  readonly messages: readonly PapaChatMessage[];
}) {
  return (
    <ol className="pd-papa-message-list">
      {messages.map((message) => (
        <li
          data-author={message.author}
          key={message.id}
        >
          <span>{resolveMessageAuthor(message.author)}</span>
          <p>{message.body}</p>
          <small>{formatDateTime(message.createdAt)}</small>
        </li>
      ))}
    </ol>
  );
}

function PapaAssistantLaboratory({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const comparisonData = useMemo(() => (
    data.labExperiments.map((experiment) => ({
      id: experiment.id,
      label: experiment.name,
      values: {
        baseline: experiment.baseline,
        variant: experiment.variant,
      },
    }))
  ), [data.labExperiments]);

  return (
    <section
      aria-labelledby="papa-lab-heading"
      className="pd-papa-assistant-panel"
    >
      <header className="pd-papa-assistant-panel__header">
        <div>
          <span>Laboratorium Papa Asystenta</span>
          <h2 id="papa-lab-heading">Eksperymenty, warianty i wyniki</h2>
        </div>
        <StatusBadge
          status="Laboratorium"
          text={`${data.labExperiments.length} eksperymenty`}
          tone="info"
        />
      </header>

      <div className="pd-papa-lab-grid">
        {data.labExperiments.map((experiment) => (
          <PapaLabExperimentCard
            experiment={experiment}
            key={experiment.id}
          />
        ))}
      </div>

      <figure className="pd-papa-lab-comparison">
        <figcaption>
          <span>Porównanie wariantów</span>
          <strong>Baseline vs wariant Papa</strong>
        </figcaption>
        <ComparisonChart
          ariaLabel="Porównanie eksperymentów Papa"
          data={comparisonData}
          series={[
            { key: 'baseline', label: 'Baseline' },
            { key: 'variant', label: 'Wariant Papa' },
          ]}
          unit=""
          variant="grouped"
        />
      </figure>

      <DataTable
        ariaLabel="Eksperymenty Laboratorium Papa"
        columns={papaLabExperimentColumns}
        density="compact"
        emptyMessage="Brak eksperymentów w bieżącym zakresie."
        emptyTitle="Brak eksperymentów"
        loading={false}
        minWidth={920}
        rowCount={data.labExperiments.length}
        rows={papaLabExperimentRows(data.labExperiments)}
        selectedRowIds={[]}
        sort={null}
        statusColumn={{
          columnId: 'status',
          label: 'Status eksperymentu',
          mapTone: {
            blocked: 'danger',
            draft: 'neutral',
            ready: 'success',
            running: 'warning',
          },
        }}
        summary={`${data.labExperiments.length} eksperymenty`}
      />
    </section>
  );
}

function PapaLabExperimentCard({
  experiment,
}: {
  readonly experiment: PapaLabExperiment;
}) {
  return (
    <article className="pd-papa-lab-experiment">
      <header>
        <div>
          <span>{experiment.owner}</span>
          <h3>{experiment.name}</h3>
        </div>
        <StatusBadge
          status="Status"
          text={resolveLabStatusText(experiment.status)}
          tone={resolveLabStatusTone(experiment.status)}
        />
      </header>
      <p>{experiment.hypothesis}</p>
      <dl>
        <div>
          <dt>Pewność</dt>
          <dd>{formatPercent(experiment.confidence)}</dd>
        </div>
        <div>
          <dt>Wariant</dt>
          <dd>{formatNumber(experiment.variant)}</dd>
        </div>
        <div>
          <dt>Różnica</dt>
          <dd>{formatSignedNumber(experiment.variant - experiment.baseline)}</dd>
        </div>
      </dl>
      <strong>{experiment.nextStep}</strong>
    </article>
  );
}

function PapaReportCenter({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const {
    addMainMessages,
    createReport,
    reports,
  } = usePapaAssistantRuntime();
  const {
    captureCurrentScreenContext,
  } = usePapaScreenContext();

  function generateCurrentScreenReport(format: 'pdf' | 'csv') {
    const snapshot = captureCurrentScreenContext(`lab-report-${format}`);
    const report = createReport(
      snapshot,
      format,
      'screen',
    );

    addMainMessages([
      createPapaAssistantMessage({
        author: 'assistant',
        body: `Wygenerowałem raport ${format.toUpperCase()} dla widoku „${snapshot.title}” i zakresu ${snapshot.dateRangeLabel}.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
    ]);
    downloadPapaAssistantReport(report);
  }

  return (
    <section
      aria-labelledby="papa-report-heading"
      className="pd-papa-assistant-panel"
    >
      <header className="pd-papa-assistant-panel__header">
        <div>
          <span>Raporty</span>
          <h2 id="papa-report-heading">Eksport PDF i CSV</h2>
        </div>
        <StatusBadge
          status="Eksport"
          text={reports.length > 0 ? `${reports.length} runtime` : 'Gotowy'}
          tone="success"
        />
      </header>

      <div className="pd-papa-runtime-report-actions">
        <Button
          size="small"
          variant="primary"
          onClick={() => generateCurrentScreenReport('pdf')}
        >
          Generuj PDF z aktualnego widoku
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => generateCurrentScreenReport('csv')}
        >
          Generuj CSV z aktualnego widoku
        </Button>
      </div>

      {reports.length > 0 ? (
        <div className="pd-papa-runtime-report-grid">
          {reports.map((report) => (
            <article
              className="pd-papa-report pd-papa-report--runtime"
              key={report.id}
            >
              <header>
                <div>
                  <span>{report.format.toUpperCase()}</span>
                  <h3>{report.title}</h3>
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
              </dl>
              <div className="pd-papa-report__actions">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => downloadPapaAssistantReport(report)}
                >
                  Pobierz ponownie
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="pd-papa-report-grid">
        {data.reports.map((report) => (
          <article
            className="pd-papa-report"
            key={report.id}
          >
            <header>
              <div>
                <span>{report.owner}</span>
                <h3>{report.title}</h3>
              </div>
              <StatusBadge
                status="Status"
                text={resolveReportStatusText(report.status)}
                tone={resolveReportStatusTone(report.status)}
              />
            </header>
            <p>{report.description}</p>
            <dl>
              <div>
                <dt>Źródła</dt>
                <dd>{report.datasets.join(', ')}</dd>
              </div>
              <div>
                <dt>Wygenerowano</dt>
                <dd>{formatDateTime(report.generatedAt)}</dd>
              </div>
            </dl>
            <div className="pd-papa-report__actions">
              {report.formats.includes('pdf') ? (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    downloadReport(report, 'pdf', data);
                  }}
                >
                  Pobierz PDF
                </Button>
              ) : null}
              {report.formats.includes('csv') ? (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    downloadReport(report, 'csv', data);
                  }}
                >
                  Pobierz CSV
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <DataTable
        ariaLabel="Raporty Papa"
        columns={papaReportColumns}
        density="compact"
        emptyMessage="Brak raportów w bieżącym zakresie."
        emptyTitle="Brak raportów"
        loading={false}
        minWidth={820}
        rowCount={data.reports.length}
        rows={papaReportRows(data.reports)}
        selectedRowIds={[]}
        sort={null}
        statusColumn={{
          columnId: 'status',
          label: 'Status raportu',
          mapTone: {
            building: 'warning',
            ready: 'success',
            stale: 'warning',
          },
        }}
        summary={`${data.reports.length} raporty`}
      />
    </section>
  );
}

function shouldShowConversation(variant: PapaScreenVariant): boolean {
  return [
    'assistant-shell',
    'context-panel',
    'answer',
    'lab',
    'observations',
    'recommendation-variants',
    'proposals',
  ].includes(variant);
}

function shouldShowRecommendations(variant: PapaScreenVariant): boolean {
  return [
    'context-panel',
    'lab',
    'recommendation-variants',
    'proposals',
    'action-approval',
  ].includes(variant);
}

function resolveSelectedThread(
  threads: readonly PapaElementThread[],
  selectedElementId: string,
): PapaElementThread | null {
  return threads.find((thread) => thread.elementId === selectedElementId)
    ?? threads[0]
    ?? null;
}

function buildAssistantReply(data: PapaWorkspaceData): string {
  const recommendation = data.recommendations.find((item) => (
    item.status === 'needs-approval'
  )) ?? data.recommendations[0];

  if (!recommendation) {
    return 'Nie widzę aktywnej rekomendacji w bieżącym zakresie. Mogę przeanalizować dowody i wskazać brakujące źródła.';
  }

  return `${recommendation.summary} Pewność odpowiedzi wynosi ${formatPercent(data.summary.confidence)}, a wykonanie działań wysokiego ryzyka pozostaje w akceptacji człowieka.`;
}

function buildAssistantReplyForSnapshot(
  data: PapaWorkspaceData,
  screenTitle: string,
): string {
  return `Kontynuuję analizę z widoku „${screenTitle}”. W Laboratorium zachowuję ten sam koszyk kontekstu, ${data.summary.evidenceCount} dowodów i pewność ${formatPercent(data.summary.confidence)}. Mogę teraz doprecyzować rekomendacje albo wygenerować raport z tego zakresu.`;
}

function buildElementReply(thread: PapaElementThread): string {
  switch (thread.status) {
    case 'blocked':
      return `Ten element jest zablokowany. Papa może wyjaśnić powód i wskazać właściciela, ale nie uruchomi działania bez zgody.`;
    case 'partial':
      return `Ten element ma częściowe dane. Najpierw trzeba uzupełnić źródło, potem wrócić do rekomendacji.`;
    case 'ready':
    default:
      return `Ten element jest gotowy do analizy. Papa może połączyć go z dowodami i decyzją w bieżącym wątku.`;
  }
}

function downloadReport(
  report: PapaReportArtifact,
  format: 'pdf' | 'csv',
  data: PapaWorkspaceData,
) {
  const blob = format === 'pdf'
    ? buildPdfBlob(report, data)
    : buildCsvBlob(report, data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${report.id}.${format}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function buildCsvBlob(
  report: PapaReportArtifact,
  data: PapaWorkspaceData,
): Blob {
  const rows = [
    ['Raport', report.title],
    ['Status', resolveReportStatusText(report.status)],
    ['Właściciel', report.owner],
    ['Wygenerowano', formatDateTime(report.generatedAt)],
    ['Zakres', formatContextRange(data)],
    ['Pewność', formatPercent(data.summary.confidence)],
    ['Rekomendacje', String(data.recommendations.length)],
    ['Dowody', String(data.evidence.length)],
    ['Źródła', report.datasets.join(' | ')],
    [],
    ['Rekomendacja', 'Właściciel', 'Ryzyko', 'Następny krok'],
    ...data.recommendations.map((recommendation) => [
      recommendation.title,
      recommendation.owner,
      resolveImpactText(recommendation.risk),
      recommendation.nextStep,
    ]),
  ];

  const csv = rows.map((row) => (
    row.map(escapeCsvCell).join(',')
  )).join('\n');

  return new Blob([csv], {
    type: 'text/csv;charset=utf-8',
  });
}

function buildPdfBlob(
  report: PapaReportArtifact,
  data: PapaWorkspaceData,
): Blob {
  const lines = [
    report.title,
    report.description,
    `Status: ${resolveReportStatusText(report.status)}`,
    `Zakres: ${formatContextRange(data)}`,
    `Pewnosc: ${formatPercent(data.summary.confidence)}`,
    `Rekomendacje: ${data.recommendations.length}`,
    `Dowody: ${data.evidence.length}`,
    ...data.recommendations.map((recommendation) => (
      `${recommendation.title}: ${recommendation.nextStep}`
    )),
  ].map(toPdfText);

  const content = [
    'BT',
    '/F1 14 Tf',
    '50 760 Td',
    ...lines.slice(0, 24).flatMap((line, index) => [
      index === 0 ? '' : '0 -22 Td',
      `(${escapePdfText(line)}) Tj`,
    ]).filter(Boolean),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  pdf += offsets.slice(1).map((offset) => (
    `${String(offset).padStart(10, '0')} 00000 n `
  )).join('\n');
  pdf += `\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], {
    type: 'application/pdf',
  });
}

function escapeCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatContextRange(data: PapaWorkspaceData): string {
  const from = data.context.range?.from ?? 'brak początku';
  const to = data.context.range?.to ?? 'brak końca';

  return `${from} - ${to}`;
}

function toPdfText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replaceAll('ł', 'l')
    .replaceAll('Ł', 'L')
    .replace(/[^\x20-\x7E]/gu, '');
}

function escapePdfText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function resolveReadinessText(value: PapaWorkspaceData['summary']['readiness']): string {
  switch (value) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'processing':
      return 'Przetwarzanie';
    case 'noData':
      return 'Brak danych';
    case 'sourceError':
      return 'Błąd źródła';
    case 'blocked':
      return 'Zablokowane';
    default:
      return 'Wymaga uwagi';
  }
}

function resolveReadinessTone(value: PapaWorkspaceData['summary']['readiness']): SemanticStatusTone {
  switch (value) {
    case 'ready':
      return 'success';
    case 'blocked':
      return 'critical';
    case 'partial':
    case 'stale':
      return 'warning';
    case 'noData':
      return 'neutral';
    case 'sourceError':
      return 'critical';
    case 'processing':
      return 'processing';
    default:
      return 'info';
  }
}

function resolveAssistantStatusText(
  state: PapaAssistantStatus['state'],
): string {
  switch (state) {
    case 'ready':
      return 'Gotowe';
    case 'attention':
      return 'Wymaga uwagi';
    case 'blocked':
      return 'Zablokowane';
    case 'learning':
      return 'W przeglądzie';
    case 'offline':
    default:
      return 'Offline';
  }
}

function resolveAssistantStatusTone(
  state: PapaAssistantStatus['state'],
): SemanticStatusTone {
  switch (state) {
    case 'ready':
      return 'success';
    case 'attention':
    case 'learning':
      return 'warning';
    case 'blocked':
      return 'critical';
    case 'offline':
    default:
      return 'neutral';
  }
}

function resolveRecommendationStatusText(
  status: PapaRecommendationRecord['status'],
): string {
  switch (status) {
    case 'blocked':
      return 'Zablokowana';
    case 'draft':
      return 'Szkic';
    case 'needs-approval':
      return 'Do akceptacji';
    case 'recommended':
    default:
      return 'Rekomendowana';
  }
}

function resolveRecommendationStatusTone(
  status: PapaRecommendationRecord['status'],
): SemanticStatusTone {
  switch (status) {
    case 'blocked':
      return 'critical';
    case 'draft':
      return 'neutral';
    case 'needs-approval':
      return 'warning';
    case 'recommended':
    default:
      return 'success';
  }
}

function resolveElementStatusText(
  status: PapaElementThread['status'],
): string {
  switch (status) {
    case 'blocked':
      return 'Zablokowany';
    case 'partial':
      return 'Częściowy';
    case 'ready':
    default:
      return 'Gotowy';
  }
}

function resolveElementStatusTone(
  status: PapaElementThread['status'],
): SemanticStatusTone {
  switch (status) {
    case 'blocked':
      return 'critical';
    case 'partial':
      return 'warning';
    case 'ready':
    default:
      return 'success';
  }
}

function resolveLabStatusText(
  status: PapaLabExperiment['status'],
): string {
  switch (status) {
    case 'blocked':
      return 'Zablokowany';
    case 'draft':
      return 'Szkic';
    case 'ready':
      return 'Gotowy';
    case 'running':
    default:
      return 'W toku';
  }
}

function resolveLabStatusTone(
  status: PapaLabExperiment['status'],
): SemanticStatusTone {
  switch (status) {
    case 'blocked':
      return 'critical';
    case 'draft':
      return 'neutral';
    case 'ready':
      return 'success';
    case 'running':
    default:
      return 'processing';
  }
}

function resolveReportStatusText(
  status: PapaReportArtifact['status'],
): string {
  switch (status) {
    case 'building':
      return 'Budowany';
    case 'stale':
      return 'Nieświeży';
    case 'ready':
    default:
      return 'Gotowy';
  }
}

function resolveReportStatusTone(
  status: PapaReportArtifact['status'],
): SemanticStatusTone {
  switch (status) {
    case 'building':
      return 'processing';
    case 'stale':
      return 'warning';
    case 'ready':
    default:
      return 'success';
  }
}

function resolveImpactText(
  value: PapaRecommendationRecord['risk'],
): string {
  switch (value) {
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
    default:
      return 'Niskie';
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSignedNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    signDisplay: 'always',
  }).format(value);
}
