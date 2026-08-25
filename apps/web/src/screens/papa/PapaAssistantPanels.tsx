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
  InlineNotice,
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
} from './papaData';
import type {
  PapaAssistantStatus,
  PapaElementThread,
  PapaLabExperiment,
  PapaRecommendationRecord,
  PapaScreenVariant,
  PapaWorkspaceData,
} from './papaData';
import type {
  PapaMessageEvidence,
} from '../../shell/papa-assistant';
import {
  PapaMessageThread,
  createPapaAssistantMessage,
  resolvePapaElementDraftScope,
  resolvePapaMainDraftScope,
  usePapaAssistantRuntime,
  usePapaScreenContext,
} from '../../shell/papa-assistant';
import './papa-assistant-panels.css';

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
      <PapaAssistantReadinessStrip data={data} />

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

export function PapaAssistantReadinessStrip({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section
      aria-label="Gotowość Papa Asystenta"
      className="pd-papa-readiness-strip"
    >
      <div>
        <span>Gotowość</span>
        <strong>{resolveReadinessText(data.summary.readiness)}</strong>
      </div>
      <div>
        <span>Kontekst</span>
        <strong>{data.summary.contextItems}</strong>
      </div>
      <div>
        <span>Dowody</span>
        <strong>{data.summary.evidenceCount}</strong>
      </div>
      <div>
        <span>Pewność</span>
        <strong>{formatPercent(data.summary.confidence)}</strong>
      </div>
      <StatusBadge
        status="Stan danych"
        text={resolveReadinessText(data.summary.readiness)}
        tone={resolveReadinessTone(data.summary.readiness)}
      />
    </section>
  );
}

export function PapaAssistantStatusPanel({
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

      <InlineNotice
        message="Rekomendacje są prezentowane w trybie tylko do odczytu. Akceptacja, odrzucenie i wykonanie wymagają trwałego workflow decyzji po stronie backendu; lokalny klik nie zmienia stanu biznesowego."
        title="Decyzje AI wymagają trwałego zatwierdzenia"
        tone="info"
      />

      <div className="pd-papa-recommendation-grid">
        {data.recommendations.map((recommendation) => {
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
                <StatusBadge
                  status="Stan"
                  text={resolveRecommendationStatusText(recommendation.status)}
                  tone={resolveRecommendationStatusTone(recommendation.status)}
                />
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

export function PapaAssistantChat({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const {
    captureContext,
    clearComposerDraft,
    composerDrafts,
    lastSnapshot,
    mainError,
    mainSubmitting,
    messages,
    setComposerDraft,
    submitMainMessage,
  } = usePapaAssistantRuntime();
  const {
    captureCurrentScreenContext,
  } = usePapaScreenContext();
  const evidence = useMemo(() => (
    buildMessageEvidence(data)
  ), [
    data,
  ]);

  function handleSubmit(value: ComposerSubmitValue) {
    if (typeof value !== 'string') {
      return;
    }

    clearComposerDraft(resolvePapaMainDraftScope());
    void submitWithContext(value).catch(() => undefined);
  }

  async function submitWithContext(value: string) {
    await captureContext(
      captureCurrentScreenContext('chat-message'),
      'chat-message',
    );
    await submitMainMessage(value);
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

      <PapaMessageThread
        className="pd-papa-chat-thread"
        evidence={evidence}
        messages={messages}
      />

      {mainError ? (
        <InlineNotice
          message={mainError}
          title="Papa nie odpowiedział"
          tone="critical"
        />
      ) : null}

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
        submitting={mainSubmitting}
        value={composerDrafts[resolvePapaMainDraftScope()] ?? ''}
        onSubmit={handleSubmit}
        onValueChange={(nextValue) => {
          setComposerDraft(resolvePapaMainDraftScope(), nextValue);
        }}
      />
    </article>
  );
}

export function PapaElementChat({
  data,
  initialElementId,
}: {
  readonly data: PapaWorkspaceData;
  readonly initialElementId?: string;
}) {
  const resolvedInitialElementId = data.elementThreads.some((thread) => (
    thread.elementId === initialElementId
  ))
    ? initialElementId ?? ''
    : data.elementThreads[0]?.elementId ?? '';
  const [selectedElementId, setSelectedElementId] = useState(resolvedInitialElementId);
  const {
    clearComposerDraft,
    composerDrafts,
    elementError,
    elementMessages,
    elementSubmitting,
    setComposerDraft,
    submitElementMessage,
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
  const evidence = useMemo(() => (
    buildMessageEvidence(data)
  ), [
    data,
  ]);
  const draftScope = selectedThread
    ? resolvePapaElementDraftScope(selectedThread.elementId)
    : null;

  function handleSubmit(value: ComposerSubmitValue) {
    if (typeof value !== 'string') {
      return;
    }

    if (!selectedThread || !draftScope) {
      return;
    }

    clearComposerDraft(draftScope);
    void submitElementMessage(selectedThread.elementId, value).catch(() => undefined);
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

      <PapaMessageThread
        className="pd-papa-chat-thread"
        emptyMessage="Wybierz element z bieżącego ekranu, żeby zawęzić rozmowę."
        emptyTitle="Brak rozmowy elementu"
        evidence={evidence}
        messages={messages}
      />

      {elementError ? (
        <InlineNotice
          message={elementError}
          title="Papa nie odpowiedział"
          tone="critical"
        />
      ) : null}

      <AssistantComposer
        attachments={[]}
        className="pd-papa-chat-composer"
        contextItemIds={selectedThread ? [selectedThread.elementId] : []}
        label="Pytanie o wybrany element"
        placeholder="Zapytaj tylko o wybrany element..."
        submitting={elementSubmitting}
        value={draftScope ? composerDrafts[draftScope] ?? '' : ''}
        onSubmit={handleSubmit}
        onValueChange={(nextValue) => {
          if (!draftScope) {
            return;
          }

          setComposerDraft(draftScope, nextValue);
        }}
      />
    </article>
  );
}

function buildMessageEvidence(
  data: PapaWorkspaceData,
): readonly PapaMessageEvidence[] {
  return data.evidence.map((item) => ({
    confidence: item.confidence,
    freshnessAt: item.freshnessAt,
    id: item.id,
    label: item.claim,
    source: item.source,
  }));
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

      {data.labExperiments.length === 0 ? (
        <InlineNotice
          message="Laboratorium nie pokazuje danych demonstracyjnych. Eksperymenty i warianty pojawią się tutaj dopiero po podłączeniu trwałego źródła spraw AI i wyników eksperymentów."
          title="Brak utrwalonych eksperymentów"
          tone="info"
        />
      ) : (
        <>
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
        </>
      )}
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

export function PapaReportCenter({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  const {
    addMainMessages,
    createReport,
    downloadReport,
    reportError,
    reports,
  } = usePapaAssistantRuntime();
  const {
    captureCurrentScreenContext,
  } = usePapaScreenContext();

  async function generateCurrentScreenReport(
    format: 'csv' | 'pdf' | 'xlsx',
  ): Promise<void> {
    const snapshot = captureCurrentScreenContext(`lab-report-${format}`);
    const report = await createReport(snapshot, format, 'screen');

    addMainMessages([
      createPapaAssistantMessage({
        author: 'system',
        body: `Raport ${format.toUpperCase()} ${report.id} został przekazany do generatora backendowego dla widoku „${snapshot.title}”.`,
        evidenceIds: snapshot.evidence.map((item) => item.id),
      }),
    ]);
  }

  return (
    <section
      aria-labelledby="papa-report-heading"
      className="pd-papa-assistant-panel"
    >
      <header className="pd-papa-assistant-panel__header">
        <div>
          <span>Raporty</span>
          <h2 id="papa-report-heading">Raporty z Laboratorium</h2>
        </div>
        <StatusBadge
          status="Eksport"
          text={reports.length > 0 ? `${reports.length} zadania` : 'Brak raportów'}
          tone={reports.some((item) => item.status === 'failed') ? 'critical' : 'info'}
        />
      </header>

      <InlineNotice
        message="Raporty są generowane po stronie backendu jako kontrolowane eksporty CSV, PDF i XLSX. Interfejs nie tworzy pozornego PDF w przeglądarce."
        title="Eksport kontrolowany przez backend"
        tone="info"
      />

      <div className="pd-papa-runtime-report-actions">
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            void generateCurrentScreenReport('pdf').catch(() => undefined);
          }}
        >
          Generuj PDF
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            void generateCurrentScreenReport('xlsx').catch(() => undefined);
          }}
        >
          Generuj XLSX
        </Button>
        <Button
          size="small"
          variant="primary"
          onClick={() => {
            void generateCurrentScreenReport('csv').catch(() => undefined);
          }}
        >
          Generuj CSV z aktualnego widoku
        </Button>
      </div>

      {reportError ? (
        <InlineNotice
          message={reportError}
          title="Raport nie został przygotowany"
          tone="critical"
        />
      ) : null}

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
                  text={resolveBackendReportStatusText(report.status)}
                  tone={resolveBackendReportStatusTone(report.status)}
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
                  <dt>Elementy</dt>
                  <dd>{report.metricCount + report.tableCount + report.chartCount}</dd>
                </div>
              </dl>
              <div className="pd-papa-report__actions">
                <Button
                  disabled={report.status === 'failed' || report.status === 'cancelled' || report.status === 'expired'}
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    void downloadReport(report).catch(() => undefined);
                  }}
                >
                  {report.status === 'ready' ? 'Pobierz' : 'Sprawdź i pobierz'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="pd-papa-assistant-panel__empty">
          Brak raportów utworzonych dla bieżącej rozmowy i workspace.
        </p>
      )}

      {data.recommendations.length > 0 ? (
        <p className="pd-papa-assistant-panel__footnote">
          Bieżący snapshot zawiera {data.recommendations.length} rekomendacje; zostaną ujęte w eksporcie zgodnie z zakresem raportu.
        </p>
      ) : null}
    </section>
  );
}

function resolveBackendReportStatusText(
  status: 'cancelled' | 'expired' | 'failed' | 'generating' | 'queued' | 'ready',
): string {
  switch (status) {
    case 'ready':
      return 'Gotowy';
    case 'failed':
      return 'Błąd';
    case 'cancelled':
      return 'Anulowany';
    case 'expired':
      return 'Wygasł';
    case 'generating':
      return 'Generowanie';
    case 'queued':
    default:
      return 'W kolejce';
  }
}

function resolveBackendReportStatusTone(
  status: 'cancelled' | 'expired' | 'failed' | 'generating' | 'queued' | 'ready',
): SemanticStatusTone {
  if (status === 'ready') return 'success';
  if (status === 'failed') return 'critical';
  if (status === 'queued' || status === 'generating') return 'processing';
  return 'neutral';
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

export function resolveElementStatusText(
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

export function resolveElementStatusTone(
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
