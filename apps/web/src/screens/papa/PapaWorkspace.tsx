import type {
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  AssistantComposer,
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
      return (
        <>
          <AssistantSurface data={data} />
          <ContextTable rows={papaContextRows(data.contextItems)} />
        </>
      );
    case 'work-modes':
      return (
        <>
          <InlineNotice
            message="To polityka Storybook. Tryby pracy nie mają osobnej ścieżki aplikacyjnej i nie wykonują akcji AI."
            title="Tryby bez endpointu"
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
            message="To polityka Storybook. Poziom pewności nie ma osobnej ścieżki aplikacyjnej i nie może udawać pełnej pewności przy danych częściowych."
            title="Poziom pewności bez endpointu"
            tone="info"
          />
          <ContextMetrics data={data} />
          <EvidenceTable rows={papaEvidenceRows(data.evidence)} />
        </>
      );
    case 'lab':
      return (
        <>
          <AssistantSurface data={data} />
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
            message="To storybookowa macierz wariantów rekomendacji. Nie rejestruje ścieżki aplikacyjnej ani fikcyjnej operacji zapisu."
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
            message="Akceptacja jest pokazana jako stan odczytu. Storybook nie zatwierdza działania i nie wywołuje mutacji."
            title="Akceptacja bez mutacji"
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
            message="Zablokowane działania nie mają kontraktu wykonania. Pokazujemy powód i zespół odpowiedzialny."
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
            message="Warianty Papa pozostają polityką Storybook: bez ścieżki aplikacyjnej, bez fikcyjnego endpointu i bez pozornych działań AI."
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

function AssistantSurface({
  data,
}: {
  readonly data: PapaWorkspaceData;
}) {
  return (
    <section className="pd-papa-workspace__section">
      <header>
        <h2>Kompozytor</h2>
        <p>Formularz przyjmuje pytanie, ale Storybook nie wysyła go do modelu ani backendu.</p>
      </header>
      <AssistantComposer
        attachments={[
          { id: 'papa-attachment-brief', name: 'morning-brief.json', size: 24800 },
        ]}
        contextItemIds={data.contextItems.map((item) => item.id)}
        label="Pytanie do Papa"
        placeholder="Zapytaj o wpływ kosztów kampanii na marżę..."
        submitting={false}
        value="Wyjaśnij, które źródła ograniczają pewność rekomendacji."
      />
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
        <p>Propozycje Papa pozostają w trybie przeglądu, bez wykonania mutacji.</p>
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

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}
