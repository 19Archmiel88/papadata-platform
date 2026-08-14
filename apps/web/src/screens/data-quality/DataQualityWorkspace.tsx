import type {
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  ReadinessState,
} from '../../../../../contracts/ui-contract-types';
import {
  Button,
  ComparisonChart,
  DataStatusBanner,
  DataTable,
  EvidencePanel,
  InlineNotice,
  LineageGraph,
  MetricCard,
  PageHeader,
  ReconciliationPanel,
  SectionNavigation,
  ShareChart,
  StatusBadge,
} from '../../design-system';
import {
  conflictColumns,
  conflictRows,
  dataQualityColumns,
  dataQualityRows,
  getDataQualityNavigation,
  readinessShareSegments,
  resolveReadinessLabel,
  reviewColumns,
  reviewRows,
  sourceComparisonData,
  sourceComparisonSeries,
  sourceQualityColumns,
  sourceQualityRows,
  variantColumns,
  variantRows,
} from './dataQualityData';
import type {
  DataQualityDiagnostic,
  DataQualityScreenDefinition,
  DataQualityWorkspaceData,
} from './dataQualityData';
import './data-quality-workspace.css';

export type DataQualityWorkspaceProps = {
  readonly data: DataQualityWorkspaceData;
  readonly definition: DataQualityScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
};

export function DataQualityWorkspace({
  data,
  definition,
  mode = 'runtime',
}: DataQualityWorkspaceProps) {
  const rows = dataQualityRows(data.datasets);

  return (
    <section
      aria-label={`Jakość danych: ${definition.displayTitle}`}
      className="pd-data-quality-workspace"
      data-data-quality-variant={definition.variant}
      data-mode={mode}
      data-operation-id={definition.operationId ?? 'storybook-policy'}
      data-screen-id={definition.id}
    >
      <PageHeader
        className="pd-data-quality-workspace__header"
        actions={(
          <Button size="small" variant="secondary">
            Odśwież stan danych
          </Button>
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/data-quality/centrum-jakosci', label: 'Jakość danych' },
          { href: null, label: definition.displayTitle },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki: Jakość danych i integralność"
        className="pd-data-quality-workspace__navigation"
        items={getDataQualityNavigation()}
        orientation="horizontal"
        size="compact"
      />

      <DataStatusBanner
        blockingIssues={data.diagnostics.map((diagnostic) => ({
          id: diagnostic.id,
          label: diagnostic.label,
          severity: diagnostic.severity,
        }))}
        context={data.context}
        readiness={data.summary.readiness}
        sources={[...data.sources]}
      />

      <DataQualitySummary data={data} />

      <DataQualityContent
        data={data}
        definition={definition}
        rows={rows}
      />
    </section>
  );
}

function DataQualitySummary({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <dl className="pd-data-quality-workspace__summary" aria-label="Podsumowanie jakości danych">
      <div>
        <dt>Stan</dt>
        <dd>{resolveReadinessLabel(data.summary.readiness)}</dd>
      </div>
      <div>
        <dt>Gotowe zbiory</dt>
        <dd>{data.summary.completeDatasets}</dd>
      </div>
      <div>
        <dt>Częściowe zbiory</dt>
        <dd>{data.summary.partialDatasets}</dd>
      </div>
      <div>
        <dt>Konflikty</dt>
        <dd>{data.summary.conflicts}</dd>
      </div>
    </dl>
  );
}

function DataQualityContent({
  data,
  definition,
  rows,
}: {
  readonly data: DataQualityWorkspaceData;
  readonly definition: DataQualityScreenDefinition;
  readonly rows: readonly DataRow[];
}) {
  switch (definition.variant) {
    case 'dataset':
      return (
        <>
          <InlineNotice
            message="Filtry i sortowanie są traktowane jako stan adresowalny; Storybook pokazuje dane gotowe do odtworzenia po odświeżeniu."
            title="Zbiór z odtwarzalnym kontekstem"
            tone="info"
          />
          <DatasetTable rows={rows} />
          <DiagnosticsPanel diagnostics={data.diagnostics} />
        </>
      );
    case 'lineage':
      return (
        <>
          <LineageGraph
            context={data.context}
            edges={[
              { from: 'shopify', reason: 'order_id', to: 'normalize-orders' },
              { from: 'google-ads', reason: 'campaign_id', to: 'match-attribution' },
              { from: 'normalize-orders', reason: 'revenue metric', to: 'gross-margin' },
              { from: 'match-attribution', reason: 'pewność źródła', to: 'gross-margin' },
            ]}
            nodes={[
              { id: 'shopify', label: 'Shopify Orders', status: 'ready', type: 'source' },
              { id: 'google-ads', label: 'Google Ads Costs', status: 'partial', type: 'source' },
              { id: 'normalize-orders', label: 'Normalizacja zamówień', status: 'ready', type: 'transform' },
              { id: 'match-attribution', label: 'Dopasowanie atrybucji', status: 'partial', type: 'transform' },
              { id: 'gross-margin', label: 'Marża brutto', status: 'partial', type: 'metric' },
            ]}
            rootRecordId="metric:gross-margin"
          />
          <EvidencePanel
            confidence={0.86}
            context={data.context}
            evidence={[...data.evidence]}
            sources={[...data.sources]}
          />
        </>
      );
    case 'source-overlap':
      return (
        <>
          <SourceQualityTable rows={sourceQualityRows(data.sourceRecords)} />
          <ComparisonPanel
            ariaLabel="Nakładanie źródeł i pewność"
            data={data}
            title="Porównanie nakładania"
          />
        </>
      );
    case 'source-priority':
      return (
        <>
          <InlineNotice
            message="Reguły nadrzędności pokazują, które źródło wygrywa dla pola i jaki ma wpływ na pewność decyzji."
            title="Priorytet źródeł"
            tone="info"
          />
          <ComparisonPanel
            ariaLabel="Nadrzędność źródła według reguł"
            data={data}
            title="Pewność według źródła nadrzędnego"
          />
          <SourceQualityTable rows={sourceQualityRows(data.sourceRecords)} />
        </>
      );
    case 'conflicts':
      return (
        <>
          <InlineNotice
            message="Konflikty są tylko odczytem kolejki. Rozstrzygnięcie wymaga osobnego kontraktu operacji, potwierdzenia i zdarzenia audytowego poza tym story."
            title="Kolejka konfliktów bez mutacji"
            tone="warning"
          />
          <ConflictTable rows={conflictRows(data.conflicts)} />
          <DiagnosticsPanel diagnostics={data.diagnostics} />
        </>
      );
    case 'manual-review':
      return (
        <>
          <ManualReviewMetrics data={data} />
          <ReviewTable rows={reviewRows(data.reviewItems)} />
          <EvidencePanel
            confidence={0.84}
            context={data.context}
            evidence={[...data.evidence]}
            sources={[...data.sources]}
          />
        </>
      );
    case 'reprocessing':
      return (
        <>
          <InlineNotice
            message="Storybook pokazuje zakres i skutki ponownego przetwarzania. Nie uruchamia zadania, nie zapisuje formularza i nie generuje klucza idempotencji."
            title="Ponowne przetwarzanie w trybie odczytu"
            tone="info"
          />
          <ReprocessingSteps />
          <DatasetTable rows={rows} />
        </>
      );
    case 'reconciliation':
      return (
        <>
          <ReconciliationPanel
            conflicts={[...data.conflicts].map((conflict) => ({
              entityType: conflict.entityType,
              id: conflict.id,
              proposedResolution: conflict.proposedResolution,
              sourceA: conflict.sourceA,
              sourceB: conflict.sourceB,
            }))}
            context={data.context}
          />
          <EvidencePanel
            confidence={0.87}
            context={data.context}
            evidence={[...data.evidence]}
            sources={[...data.sources]}
          />
        </>
      );
    case 'variants':
      return (
        <>
          <InlineNotice
            message="To storybookowa powierzchnia wariantów. Dokument 41.10 nie ma ścieżki aplikacyjnej ani fikcyjnej operacji zapisu."
            title="Warianty bez ścieżki aplikacyjnej"
            tone="info"
          />
          <VariantTable rows={variantRows(data.variants)} />
        </>
      );
    case 'quality-center':
    default:
      return (
        <>
          <ReadinessShare data={data} />
          <DatasetTable rows={rows} />
          <DiagnosticsPanel diagnostics={data.diagnostics} />
        </>
      );
  }
}

function ConflictTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Konflikty źródeł</h2>
        <p>Wpływ konfliktów, źródła i proponowany kierunek rozstrzygnięcia.</p>
      </header>
      <DataTable
        ariaLabel="Konflikty jakości danych"
        columns={conflictColumns}
        emptyMessage="Brak konfliktów dla bieżącej przestrzeni pracy."
        emptyTitle="Brak konfliktów"
        loading={false}
        minWidth={920}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} konflikty`}
      />
    </section>
  );
}

function ReviewTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Kolejka przeglądu</h2>
        <p>Rekordy wymagające ręcznej decyzji z poziomem pewności i zespołem odpowiedzialnym.</p>
      </header>
      <DataTable
        ariaLabel="Kolejka ręcznego przeglądu"
        columns={reviewColumns}
        emptyMessage="Brak pozycji do ręcznego przeglądu."
        emptyTitle="Brak pozycji"
        loading={false}
        minWidth={760}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} pozycje`}
      />
    </section>
  );
}

function VariantTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Macierz wariantów</h2>
        <p>Warunek, kompozycja i ograniczenie dla każdego stanu jakości danych.</p>
      </header>
      <DataTable
        ariaLabel="Warianty jakości danych"
        columns={variantColumns}
        emptyMessage="Brak wariantów jakości danych."
        emptyTitle="Brak wariantów"
        loading={false}
        minWidth={860}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} warianty`}
      />
    </section>
  );
}

function DatasetTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Zbiory danych</h2>
        <p>Kompletność, świeżość i konflikty bez fałszywych zer dla braków danych.</p>
      </header>
      <DataTable
        ariaLabel="Zbiory jakości danych"
        cellRenderers={{
          readinessLabel: (row) => (
            <StatusBadge
              status="Stan"
              text={String(row.readinessLabel ?? '')}
              tone={resolveReadinessTone(row.readiness as ReadinessState)}
            />
          ),
        }}
        columns={dataQualityColumns}
        emptyMessage="Brak zbiorów danych dla bieżącej przestrzeni pracy."
        emptyTitle="Brak zbiorów"
        loading={false}
        minWidth={860}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} zbiory`}
      />
    </section>
  );
}

function SourceQualityTable({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Reguły źródeł</h2>
        <p>Decyzje o nadrzędności, nakładaniu i poziomie pewności dla pól krytycznych.</p>
      </header>
      <DataTable
        ariaLabel="Reguły jakości źródeł"
        columns={sourceQualityColumns}
        emptyMessage="Brak reguł dla bieżącej przestrzeni pracy."
        emptyTitle="Brak reguł"
        loading={false}
        minWidth={900}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={`${rows.length} reguły`}
      />
    </section>
  );
}

function ManualReviewMetrics({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Priorytet przeglądu</h2>
        <p>Metryki pomagają ustalić kolejność pracy bez wykonywania decyzji.</p>
      </header>
      <div className="pd-data-quality-workspace__metric-strip">
        <MetricCard
          label="Do przeglądu"
          metricId="manual-review-count"
          status="ready"
          statusLabel="Dane aktualne"
          unit="pozycje"
          value={String(data.reviewItems.length)}
        />
        <MetricCard
          label="Zablokowane"
          metricId="manual-review-blocked"
          signal="warning"
          status="partial"
          statusLabel="Wymaga źródła"
          unit="pozycje"
          value={String(data.reviewItems.filter((item) => item.status === 'blocked').length)}
        />
        <MetricCard
          label="Średnia pewność"
          metricId="manual-review-confidence"
          status="ready"
          statusLabel="Dane aktualne"
          unit="%"
          value="85"
        />
      </div>
    </section>
  );
}

function ReprocessingSteps() {
  const steps = [
    'Wybór zakresu danych',
    'Walidacja uprawnień',
    'Oszacowanie wpływu',
    'Potwierdzenie operatora',
    'Kolejka operacji w tle',
  ];

  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Zakres przetwarzania</h2>
        <p>Kroki przygotowania zadania bez uruchamiania operacji w Storybooku.</p>
      </header>
      <ol className="pd-data-quality-workspace__diagnostics">
        {steps.map((step, index) => (
          <li key={step}>
            <StatusBadge
              status="Krok"
              text={`${index + 1}`}
              tone={index < 3 ? 'success' : 'info'}
            />
            <div>
              <strong>{step}</strong>
              <span>Stan odczytu, bez mutacji i bez zapisania operacji.</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReadinessShare({
  data,
}: {
  readonly data: DataQualityWorkspaceData;
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Rozkład stanów gotowości</h2>
        <p>Udział gotowych, częściowych i nieświeżych zbiorów.</p>
      </header>
      <ShareChart
        ariaLabel="Rozkład stanów gotowości zbiorów danych"
        display="bar"
        segments={readinessShareSegments(data)}
        total={data.datasets.length}
      />
    </section>
  );
}

function ComparisonPanel({
  ariaLabel,
  data,
  title,
}: {
  readonly ariaLabel: string;
  readonly data: DataQualityWorkspaceData;
  readonly title: string;
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>{title}</h2>
        <p>Wykres ma alternatywę tabelaryczną w tej samej historii.</p>
      </header>
      <ComparisonChart
        ariaLabel={ariaLabel}
        benchmark={{ label: 'Próg akceptacji', value: 90 }}
        data={sourceComparisonData(data.sourceRecords)}
        series={sourceComparisonSeries}
        unit="%"
        variant="grouped"
      />
    </section>
  );
}

function DiagnosticsPanel({
  diagnostics,
}: {
  readonly diagnostics: readonly DataQualityDiagnostic[];
}) {
  return (
    <section className="pd-data-quality-workspace__section">
      <header>
        <h2>Diagnostyka</h2>
        <p>Blokady i ograniczenia widoczne przed podjęciem decyzji.</p>
      </header>
      <ol className="pd-data-quality-workspace__diagnostics">
        {diagnostics.map((diagnostic) => (
          <li key={diagnostic.id}>
            <StatusBadge
              status="Diagnoza"
              text={resolveSeverityLabel(diagnostic.severity)}
              tone={resolveSeverityTone(diagnostic.severity)}
            />
            <div>
              <strong>{diagnostic.label}</strong>
              <span>{diagnostic.source} · rekordy: {diagnostic.affectedRecords.toLocaleString('pl-PL')}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function resolveReadinessTone(
  readiness: ReadinessState,
): 'success' | 'warning' | 'critical' | 'info' {
  switch (readiness) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
    case 'processing':
      return 'warning';
    case 'sourceError':
    case 'blocked':
      return 'critical';
    case 'noData':
    default:
      return 'info';
  }
}

function resolveSeverityTone(
  severity: DataQualityDiagnostic['severity'],
): 'critical' | 'info' | 'warning' {
  return severity;
}

function resolveSeverityLabel(
  severity: DataQualityDiagnostic['severity'],
): string {
  switch (severity) {
    case 'critical':
      return 'Krytyczne';
    case 'warning':
      return 'Ostrzeżenie';
    case 'info':
    default:
      return 'Info';
  }
}
