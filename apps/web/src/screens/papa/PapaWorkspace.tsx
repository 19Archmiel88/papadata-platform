import {
  useMemo,
} from 'react';
import type {
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  Button,
  DataStatusBanner,
  DataTable,
  DecisionCard,
  EvidencePanel,
  InlineNotice,
  MetricCard,
  PageHeader,
  SectionNavigation,
} from '../../design-system';
import {
  getPapaNavigation,
  papaActionColumns,
  papaActionRows,
  papaContextColumns,
  papaContextRows,
  papaEvidenceColumns,
  papaEvidenceRefs,
  papaEvidenceRows,
  papaMemoryColumns,
  papaMemoryRows,
  papaModeColumns,
  papaModeRows,
} from './papaData';
import type {
  PapaDecision,
  PapaScreenDefinition,
  PapaWorkspaceData,
} from './papaData';
import {
  PapaAssistantRuntime,
} from './PapaAssistantPanels';
import type {
  PapaScreenContextElement,
} from '../../shell/papa-assistant';
import {
  useRegisterScreenContext,
} from '../../shell/papa-assistant';
import './papa-workspace.css';

export type PapaWorkspaceProps = {
  readonly data: PapaWorkspaceData;
  readonly definition: PapaScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
};

export function PapaWorkspace({
  data,
  definition,
  mode = 'runtime',
}: PapaWorkspaceProps) {
  const screenContext = useMemo(() => ({
    activeSection: definition.displayTitle,
    breadcrumbs: [
      'Aplikacja',
      'Papa',
      definition.displayTitle,
    ],
    charts: [
      {
        description: 'Trend pewności odpowiedzi Papa w bieżącym zakresie.',
        id: `${definition.id}-assistant-confidence-chart`,
        kind: 'chart' as const,
        label: 'Trend pewności Papa',
        value: `${data.assistantTrend.length} punktów`,
      },
    ],
    elements: [
      ...data.contextItems.map<PapaScreenContextElement>((item) => ({
        description: `${item.source}; retencja ${item.retention}`,
        id: item.id,
        kind: item.kind === 'metric'
          ? 'metric'
          : item.kind === 'decision'
            ? 'decision'
            : 'record',
        label: item.label,
        source: item.source,
        status: `${Math.round(item.confidence * 100)}% confidence`,
      })),
      ...data.actions.map<PapaScreenContextElement>((action) => ({
        description: action.operationId ?? 'Akcja bez operacji transportowej.',
        id: action.id,
        kind: 'decision',
        label: action.label,
        owner: action.owner,
        status: action.status,
        value: action.risk,
      })),
    ],
    evidence: data.evidence.map<PapaScreenContextElement>((item) => ({
      description: item.source,
      id: item.id,
      kind: 'evidence',
      label: item.claim,
      source: item.source,
      status: `${Math.round(item.confidence * 100)}% confidence`,
    })),
    filters: [
      {
        id: 'papa-date-range',
        kind: 'filter' as const,
        label: 'Zakres danych',
        value: formatPapaContextRange(data),
      },
    ],
    metrics: [
      {
        id: 'papa-context-items',
        kind: 'metric' as const,
        label: 'Elementy kontekstu',
        value: String(data.summary.contextItems),
      },
      {
        id: 'papa-evidence-count',
        kind: 'metric' as const,
        label: 'Dowody',
        value: String(data.summary.evidenceCount),
      },
      {
        id: 'papa-confidence',
        kind: 'metric' as const,
        label: 'Pewność',
        value: formatPercent(data.summary.confidence),
      },
    ],
    operationId: definition.operationId,
    readiness: resolvePapaReadinessLabel(data.summary.readiness),
    recommendations: data.recommendations.map<PapaScreenContextElement>((item) => ({
      description: item.summary,
      evidenceIds: item.evidenceIds,
      id: item.id,
      kind: 'recommendation',
      label: item.title,
      owner: item.owner,
      status: item.status,
      value: item.nextStep,
    })),
    route: definition.route ?? '/app/papa/laboratorium-ai',
    screenId: definition.id,
    summary: definition.summary,
    tables: [
      {
        description: 'Tabelaryczna alternatywa danych Papa dla bieżącego widoku.',
        id: `${definition.id}-papa-table`,
        kind: 'table' as const,
        label: 'Rejestr Papa',
        value: `${data.contextItems.length + data.evidence.length + data.actions.length} pozycji`,
      },
    ],
    title: definition.displayTitle,
  }), [
    data,
    definition,
  ]);

  useRegisterScreenContext(screenContext);

  return (
    <section
      aria-label={`Papa: ${definition.displayTitle}`}
      className="pd-papa-workspace"
      data-mode={mode}
      data-operation-id={definition.operationId ?? 'storybook-policy'}
      data-papa-variant={definition.variant}
      data-screen-id={definition.id}
    >
      <PageHeader
        className="pd-papa-workspace__header"
        actions={(
          <Button size="small" variant="secondary">
            Odśwież kontekst
          </Button>
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/papa/panel-kontekstowy-papa', label: 'Papa' },
          { href: null, label: definition.displayTitle },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki: Papa Asystent i Laboratorium AI"
        className="pd-papa-workspace__navigation"
        items={getPapaNavigation()}
        orientation="horizontal"
        size="compact"
        sticky
      />

      <DataStatusBanner
        blockingIssues={[
          { id: 'papa-cost-gap', label: 'Niepełne koszty kampanii', severity: 'warning' },
        ]}
        context={data.context}
        readiness={data.summary.readiness}
        sources={[...data.sources]}
      />

      <PapaSummary data={data} />

      <PapaAssistantRuntime
        data={data}
        variant={definition.variant}
      />

      <PapaContent
        data={data}
        definition={definition}
      />
    </section>
  );
}

function PapaSummary({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <dl className="pd-papa-workspace__summary" aria-label="Podsumowanie Papa">
      <div>
        <dt>Kontekst</dt>
        <dd>{data.summary.contextItems}</dd>
      </div>
      <div>
        <dt>Dowody</dt>
        <dd>{data.summary.evidenceCount}</dd>
      </div>
      <div>
        <dt>Decyzje</dt>
        <dd>{data.summary.decisionsDue}</dd>
      </div>
      <div>
        <dt>Pewność</dt>
        <dd>{formatPercent(data.summary.confidence)}</dd>
      </div>
    </dl>
  );
}

function PapaContent({
  data,
  definition,
}: {
  readonly data: PapaWorkspaceData;
  readonly definition: PapaScreenDefinition;
}) {
  switch (definition.variant) {
    case 'assistant-shell':
      return <ContextTable rows={papaContextRows(data.contextItems)} />;
    case 'work-modes':
      return (
        <>
          <InlineNotice
            message="Tryby pracy określają, kiedy asystent może odpowiadać, proponować działania albo wymagać zatwierdzenia."
            title="Tryby pracy Papa"
            tone="info"
          />
          <ModeTable rows={papaModeRows(data.modeRecords)} />
        </>
      );
    case 'context-basket':
      return (
        <>
          <ContextMetrics data={data} />
          <ContextTable rows={papaContextRows(data.contextItems)} />
          <EvidencePanel
            confidence={data.summary.confidence}
            context={data.context}
            evidence={[...papaEvidenceRefs(data.evidence)]}
            sources={[...data.sources]}
          />
        </>
      );
    case 'answer':
      return (
        <>
          <AnswerSection data={data} />
          <EvidenceTable rows={papaEvidenceRows(data.evidence)} />
        </>
      );
    case 'evidence':
      return (
        <>
          <EvidenceTable rows={papaEvidenceRows(data.evidence)} />
          <EvidencePanel
            confidence={data.summary.confidence}
            context={data.context}
            evidence={[...papaEvidenceRefs(data.evidence)]}
            sources={[...data.sources]}
          />
        </>
      );
    case 'confidence':
      return (
        <>
          <InlineNotice
            message="Poziom pewności pokazuje jakość dowodów i ogranicza automatyzację przy danych częściowych."
            title="Poziom pewności"
            tone="info"
          />
          <ContextMetrics data={data} />
          <EvidenceTable rows={papaEvidenceRows(data.evidence)} />
        </>
      );
    case 'lab':
      return (
        <>
          <ActionTable rows={papaActionRows(data.actions)} />
          <EvidenceTable rows={papaEvidenceRows(data.evidence)} />
        </>
      );
    case 'observations':
      return (
        <>
          <AnswerSection data={data} />
          <DecisionList decisions={data.decisions} />
        </>
      );
    case 'recommendation-variants':
      return (
        <>
          <InlineNotice
            message="Macierz wariantów rekomendacji pokazuje stany gotowości, ryzyka i zatwierdzania działań AI."
            title="Warianty rekomendacji"
            tone="info"
          />
          <ModeTable rows={papaModeRows(data.modeRecords)} />
          <DecisionList decisions={data.decisions} />
        </>
      );
    case 'proposals':
      return (
        <>
          <DecisionList decisions={data.decisions} />
          <ActionTable rows={papaActionRows(data.actions.filter((action) => action.status !== 'blocked'))} />
        </>
      );
    case 'action-approval':
      return (
        <>
          <InlineNotice
            message="Akceptacja pokazuje działania wymagające decyzji użytkownika przed wykonaniem."
            title="Akceptacja działań AI"
            tone="warning"
          />
          <ActionTable rows={papaActionRows(data.actions.filter((action) => action.status === 'approval'))} />
          <EvidenceTable rows={papaEvidenceRows(data.evidence)} />
        </>
      );
    case 'actions':
      return <ActionTable rows={papaActionRows(data.actions)} />;
    case 'blocked-actions':
      return (
        <>
          <InlineNotice
            message="Zablokowane działania pokazują powód blokady i zespół odpowiedzialny za dalszą weryfikację."
            title="Działania zablokowane"
            tone="critical"
          />
          <ActionTable rows={papaActionRows(data.actions.filter((action) => action.status === 'blocked'))} />
        </>
      );
    case 'history-memory':
      return (
        <>
          <MemoryTable rows={papaMemoryRows(data.memory)} />
          <ContextTable rows={papaContextRows(data.contextItems)} />
        </>
      );
    case 'governance':
      return (
        <>
          <ModeTable rows={papaModeRows(data.modeRecords)} />
          <ActionTable rows={papaActionRows(data.actions)} />
        </>
      );
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Warianty Papa porządkują tryby pracy, poziom pewności i ograniczenia działań AI."
            title="Warianty Papa"
            tone="info"
          />
          <ModeTable rows={papaModeRows(data.modeRecords)} />
        </>
      );
    case 'context-panel':
    default:
      return (
        <>
          <ContextMetrics data={data} />
          <ContextTable rows={papaContextRows(data.contextItems)} />
          <DecisionList decisions={data.decisions} />
        </>
      );
  }
}

function ActionTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Działania AI</h2>
        <p>Kontrakt operacji, ryzyko i zespół dla działań przygotowanych przez Papa.</p>
      </header>
      <DataTable
        ariaLabel="Działania AI Papa"
        columns={papaActionColumns}
        emptyMessage="Brak działań AI dla bieżącej przestrzeni pracy."
        emptyTitle="Brak działań"
        loading={false}
        minWidth={900}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} działania`}
      />
    </section>
  );
}

function MemoryTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Historia i pamięć</h2>
        <p>Retencja kontekstu i zdarzeń używanych przez Papa.</p>
      </header>
      <DataTable
        ariaLabel="Historia i pamięć Papa"
        columns={papaMemoryColumns}
        emptyMessage="Brak historii Papa."
        emptyTitle="Brak historii"
        loading={false}
        minWidth={820}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} zdarzenia`}
      />
    </section>
  );
}

function ContextMetrics({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Stan kontekstu</h2>
        <p>Metryki opisują gotowość odpowiedzi bez uruchamiania akcji AI.</p>
      </header>
      <div className="pd-papa-workspace__metric-strip">
        <MetricCard
          label="Elementy kontekstu"
          metricId="papa-context-count"
          status="ready"
          statusLabel="Dane aktualne"
          unit="elementy"
          value={String(data.summary.contextItems)}
        />
        <MetricCard
          label="Dowody"
          metricId="papa-evidence-count"
          status="ready"
          statusLabel="Dane aktualne"
          unit="źródła"
          value={String(data.summary.evidenceCount)}
        />
        <MetricCard
          label="Pewność"
          metricId="papa-confidence"
          signal="warning"
          status="partial"
          statusLabel="Częściowe koszty"
          unit="%"
          value={String(Math.round(data.summary.confidence * 100))}
        />
      </div>
    </section>
  );
}

function AnswerSection({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Odpowiedź z dowodami</h2>
        <p>Każde twierdzenie jest połączone ze źródłem i poziomem pewności.</p>
      </header>
      <ol className="pd-papa-workspace__list">
        {data.evidence.map((item) => (
          <li key={item.id}>
            <strong>{item.claim}</strong>
            <span>{item.source} · pewność {formatPercent(item.confidence)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ContextTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Kontekst</h2>
        <p>Elementy przekazywane do asystenta z retencją i poziomem pewności.</p>
      </header>
      <DataTable
        ariaLabel="Kontekst Papa"
        columns={papaContextColumns}
        emptyMessage="Brak kontekstu dla bieżącej przestrzeni pracy."
        emptyTitle="Brak kontekstu"
        loading={false}
        minWidth={820}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} elementy`}
      />
    </section>
  );
}

function EvidenceTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Dowody odpowiedzi</h2>
        <p>Źródła i poziom pewności dla odpowiedzi Papa.</p>
      </header>
      <DataTable
        ariaLabel="Dowody odpowiedzi Papa"
        columns={papaEvidenceColumns}
        emptyMessage="Brak dowodów odpowiedzi."
        emptyTitle="Brak dowodów"
        loading={false}
        minWidth={820}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} dowody`}
      />
    </section>
  );
}

function ModeTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Macierz trybów pracy</h2>
        <p>Zasady użycia Papa, wymagane zgody i blokady bezpieczeństwa.</p>
      </header>
      <DataTable
        ariaLabel="Tryby pracy Papa"
        columns={papaModeColumns}
        emptyMessage="Brak trybów pracy."
        emptyTitle="Brak trybów"
        loading={false}
        minWidth={900}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} tryby`}
      />
    </section>
  );
}

function DecisionList({
  decisions,
}: {
  readonly decisions: readonly PapaDecision[];
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Decyzje do akceptacji</h2>
        <p>Propozycje Papa pozostają w trybie przeglądu przed wykonaniem działania.</p>
      </header>
      <div className="pd-papa-workspace__decision-list">
        {decisions.map((decision) => (
          <DecisionCard
            decisionId={decision.id}
            dueAt={decision.dueAt}
            impact={decision.impact}
            key={decision.id}
            owner={decision.owner}
            priority={decision.impact}
            status={resolveDecisionCardStatus(decision.status)}
            title={decision.title}
          />
        ))}
      </div>
    </section>
  );
}

function resolveDecisionCardStatus(
  status: PapaDecision['status'],
): 'approved' | 'rejected' | 'measured' | 'proposed' | 'executing' {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'review':
      return 'executing';
    case 'new':
    default:
      return 'proposed';
  }
}

function resolvePapaReadinessLabel(
  value: PapaWorkspaceData['summary']['readiness'],
): string {
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

function formatPapaContextRange(
  data: PapaWorkspaceData,
): string {
  const from = data.context.range?.from ?? 'brak początku';
  const to = data.context.range?.to ?? 'brak końca';

  return `${from} - ${to}`;
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}
