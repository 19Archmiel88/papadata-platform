import * as React from 'react';

import type {
  CampaignsRecord,
  CustomersRecord,
  DiagnosticFinding,
  FunnelStepView,
  Money,
  OrdersRecord,
  ProductsRecord,
  RecommendationView,
  TrafficRecord,
} from '../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  Button,
  DataTable,
  FunnelChart,
  InlineNotice,
  PageHeader,
  SearchField,
  SectionNavigation,
  StatusBadge,
} from '../../design-system';
import {
  analyticsModuleRootRoutes,
  analyticsModuleTitles,
  getAnalyticsDetailDefinition,
  getAnalyticsModuleNavigation,
} from './analyticsModuleData';
import type {
  AnalyticsModuleData,
  AnalyticsModuleGroup,
  AnalyticsScreenDefinition,
  CampaignsModuleData,
  CustomersModuleData,
  OrdersModuleData,
  ProductsModuleData,
  TrafficModuleData,
} from './analyticsModuleData';
import './analytics-module-workspace.css';

export type AnalyticsModuleWorkspaceProps = {
  readonly data: AnalyticsModuleData | null;
  readonly definition: AnalyticsScreenDefinition;
  readonly loading?: boolean;
  readonly mode?: 'runtime' | 'storybook';
  readonly onReload?: (() => void) | undefined;
  readonly path?: string;
  readonly problem?: string | null;
};

type SummaryLike = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: string;
  readonly warning: number;
};

const campaignColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Kampania', sortable: true, width: 240 },
  { id: 'channel', label: 'Kanał', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { align: 'right', id: 'spend', label: 'Koszt', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { align: 'right', id: 'roas', label: 'ROAS', sortable: true },
];

const orderColumns: readonly DataColumn[] = [
  { id: 'externalOrderId', label: 'Zamówienie', sortable: true, width: 180 },
  { id: 'orderedAt', label: 'Data', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'source', label: 'Źródło', sortable: true },
  { align: 'right', id: 'amount', label: 'Wartość', sortable: true },
  { id: 'customerPseudonym', label: 'Klient', sortable: true },
];

const productColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Produkt', sortable: true, width: 250 },
  { id: 'sku', label: 'SKU', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'category', label: 'Kategoria', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { align: 'right', id: 'units', label: 'Sztuki', sortable: true },
  { align: 'right', id: 'margin', label: 'Marża', sortable: true },
];

const customerColumns: readonly DataColumn[] = [
  { id: 'customerPseudonym', label: 'Klient', sortable: true, width: 190 },
  { id: 'segmentId', label: 'Segment', sortable: true },
  { id: 'cohortKey', label: 'Kohorta', sortable: true },
  { align: 'right', id: 'ordersCount', label: 'Zamówienia', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { align: 'right', id: 'ltv', label: 'LTV', sortable: true },
  { id: 'consentStatus', label: 'Zgoda', sortable: true },
];

const trafficColumns: readonly DataColumn[] = [
  { id: 'channel', label: 'Kanał / wymiar', sortable: true, width: 220 },
  { align: 'right', id: 'sessions', label: 'Sesje', sortable: true },
  { align: 'right', id: 'users', label: 'Użytkownicy', sortable: true },
  { align: 'right', id: 'conversions', label: 'Konwersje', sortable: true },
  { align: 'right', id: 'conversionRate', label: 'CR', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { align: 'right', id: 'eventQuality', label: 'Jakość eventów', sortable: true },
];

export function AnalyticsModuleWorkspace({
  data,
  definition,
  loading = false,
  mode = 'runtime',
  onReload,
  path = definition.routeBase,
  problem = null,
}: AnalyticsModuleWorkspaceProps) {
  const moduleTitle = analyticsModuleTitles[definition.group];
  const navigation = getAnalyticsModuleNavigation(definition.group);
  const summary = data?.summary ?? null;

  return (
    <section
      aria-busy={loading || undefined}
      aria-label={`${moduleTitle}: ${definition.displayTitle}`}
      className="pd-analytics-module"
      data-analytics-group={definition.group}
      data-analytics-variant={definition.variant}
      data-mode={mode}
      data-screen-id={definition.id}
    >
      <PageHeader
        className="pd-analytics-module__header"
        actions={
          onReload ? (
            <Button
              loading={loading}
              loadingLabel="Odświeżanie"
              size="small"
              variant="secondary"
              onClick={onReload}
            >
              Odśwież dane
            </Button>
          ) : null
        }
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: analyticsModuleRootRoutes[definition.group], label: moduleTitle },
          { href: null, label: definition.displayTitle },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel={`Widoki: ${moduleTitle}`}
        className="pd-analytics-module__navigation"
        items={navigation}
        orientation="horizontal"
        size="compact"
        sticky
      />

      {problem ? (
        <InlineNotice
          message={problem}
          title="Nie udało się pobrać danych"
          tone="critical"
        />
      ) : null}

      {summary ? (
        <ModuleSummaryStrip
          generatedAt={data?.generatedAt ?? summary.updatedAt}
          summary={summary}
        />
      ) : null}

      {data ? (
        <ModuleContent
          data={data}
          definition={definition}
          path={path}
        />
      ) : (
        <InlineNotice
          message={
            loading
              ? 'Widok zachowuje strukturę, ale nie prezentuje wartości zastępczych przed odpowiedzią BFF.'
              : 'Dane pojawią się po poprawnej odpowiedzi dla bieżącego workspace.'
          }
          title={loading ? 'Pobieramy aktualny stan' : 'Brak danych dla widoku'}
          tone={problem ? 'critical' : 'info'}
        />
      )}
    </section>
  );
}

function ModuleContent({
  data,
  definition,
  path,
}: {
  readonly data: AnalyticsModuleData;
  readonly definition: AnalyticsScreenDefinition;
  readonly path: string;
}) {
  switch (data.group) {
    case 'campaigns':
      return <CampaignsContent data={data} definition={definition} path={path} />;
    case 'orders':
      return <OrdersContent data={data} definition={definition} path={path} />;
    case 'products':
      return <ProductsContent data={data} definition={definition} path={path} />;
    case 'customers':
      return <CustomersContent data={data} definition={definition} path={path} />;
    case 'traffic':
      return <TrafficContent data={data} definition={definition} path={path} />;
  }
}

function CampaignsContent({
  data,
  definition,
}: {
  readonly data: CampaignsModuleData;
  readonly definition: AnalyticsScreenDefinition;
  readonly path: string;
}) {
  const detail = getAnalyticsDetailDefinition('campaigns');

  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <MetricLine
            items={campaignOverviewMetrics(data.records)}
            label="Sygnały kampanii"
          />
          <ModuleSection
            description="Najważniejsze kampanie uporządkowane według aktualnych danych z bieżącego widoku."
            title="Wynik kampanii"
          >
            <ModuleTable
              columns={campaignColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="name"
              rows={campaignRows(data.records)}
              summary={`${data.records.length} kampanii`}
            />
          </ModuleSection>
          <DistributionList
            items={aggregateCampaignChannels(data.records)}
            title="Kanały"
          />
        </>
      );
    case 'list':
      return (
        <SearchableTableSection
          columns={campaignColumns}
          detailDefinition={detail}
          primaryColumnId="name"
          rows={campaignRows(data.records)}
          title="Lista kampanii"
        />
      );
    case 'detail':
      return (
        <CampaignDetail record={data.record} />
      );
    case 'attribution':
      return (
        <>
          <AttributionView data={data.attribution} />
          <ModuleSection
            description="Kampanie pozostają widoczne jako kontekst, a model atrybucji korzysta z dostępnych danych sprzedaży i źródeł ruchu."
            title="Kontekst kampanii"
          >
            <ModuleTable
              columns={campaignColumns}
              loading={false}
              primaryColumnId="name"
              rows={campaignRows(data.records)}
              summary={`${data.records.length} kampanii`}
            />
          </ModuleSection>
        </>
      );
    case 'budget':
      return <CampaignBudget records={data.records} />;
    case 'diagnostics':
      return (
        <>
          <DiagnosticsList diagnostics={data.diagnostics} />
          <ModuleSection
            description="Rejestr kampanii pozwala odnieść sygnał diagnostyczny do bieżącego wyniku."
            title="Kampanie w kontekście diagnostyki"
          >
            <ModuleTable
              columns={campaignColumns}
              loading={false}
              primaryColumnId="name"
              rows={campaignRows(data.records)}
              summary={`${data.records.length} kampanii`}
            />
          </ModuleSection>
        </>
      );
    case 'recommendations':
      return <RecommendationsReadOnly recommendations={data.recommendations} />;
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Widok agreguje warianty ready, partial, empty, error, stale, forbidden i offline w jednym kontrakcie odczytu."
            title="Warianty kampanii"
            tone="info"
          />
          <ModuleSection
            description="Tabela pozostaje kanoniczną alternatywą danych dla wariantów kampanii."
            title="Zakres kampanii"
          >
            <ModuleTable
              columns={campaignColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="name"
              rows={campaignRows(data.records)}
              summary={`${data.records.length} kampanii`}
            />
          </ModuleSection>
        </>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function OrdersContent({
  data,
  definition,
}: {
  readonly data: OrdersModuleData;
  readonly definition: AnalyticsScreenDefinition;
  readonly path: string;
}) {
  const detail = getAnalyticsDetailDefinition('orders');

  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <MetricLine items={orderOverviewMetrics(data.records)} label="Sygnały zamówień" />
          <DistributionList items={aggregateOrderSources(data.records)} title="Źródła zamówień" />
          <ModuleSection description="Ostatnie rekordy dostępne w kontrakcie przeglądu." title="Ostatnie zamówienia">
            <ModuleTable
              columns={orderColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="externalOrderId"
              rows={orderRows(data.records)}
              summary={`${data.records.length} zamówień`}
            />
          </ModuleSection>
        </>
      );
    case 'list':
      return (
        <SearchableTableSection
          columns={orderColumns}
          detailDefinition={detail}
          primaryColumnId="externalOrderId"
          rows={orderRows(data.records)}
          title="Lista zamówień"
        />
      );
    case 'detail':
      return <OrderDetail record={data.record} />;
    case 'timeline':
      return <OrdersTimeline records={data.records} />;
    case 'source-comparison':
      return <DistributionList items={aggregateOrderSources(data.records)} title="Porównanie źródeł" />;
    case 'reconciliation':
      return (
        <>
          <InlineNotice
            message="W bieżącym zakresie nie ma otwartych konfliktów ani gotowych propozycji rozstrzygnięć. Widok pokazuje rekordy możliwe do porównania."
            title="Rekoncyliacja danych"
            tone="info"
          />
          <ModuleSection title="Rejestr do porównania">
            <ModuleTable
              columns={orderColumns}
              loading={false}
              primaryColumnId="externalOrderId"
              rows={orderRows(data.records)}
              summary={`${data.records.length} rekordów`}
            />
          </ModuleSection>
        </>
      );
    case 'export':
      return (
        <>
          <InlineNotice
            message="Eksport nie jest jeszcze dostępny dla tego widoku. Możesz ocenić zakres danych przed uruchomieniem pobrania."
            title="Eksport w przygotowaniu"
            tone="info"
          />
          <ModuleSection description="Zakres danych dostępny do oceny przed uruchomieniem przyszłej operacji eksportu." title="Dane objęte zakresem">
            <ModuleTable
              columns={orderColumns}
              loading={false}
              primaryColumnId="externalOrderId"
              rows={orderRows(data.records)}
              summary={`${data.records.length} rekordów`}
            />
          </ModuleSection>
        </>
      );
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Widok pokazuje warianty stanu zamówień, rekoncyliacji i eksportu bez uruchamiania operacji mutujących."
            title="Warianty zamówień"
            tone="info"
          />
          <ModuleSection
            description="Ten sam zestaw rekordów obsługuje gotowe dane, częściową gotowość, pusty zbiór i ograniczenia źródeł."
            title="Zakres zamówień"
          >
            <ModuleTable
              columns={orderColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="externalOrderId"
              rows={orderRows(data.records)}
              summary={`${data.records.length} zamówień`}
            />
          </ModuleSection>
        </>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function ProductsContent({
  data,
  definition,
}: {
  readonly data: ProductsModuleData;
  readonly definition: AnalyticsScreenDefinition;
  readonly path: string;
}) {
  const detail = getAnalyticsDetailDefinition('products');

  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <MetricLine items={productOverviewMetrics(data.records)} label="Sygnały produktów" />
          <ModuleSection description="Produkty o największym znaczeniu dla bieżącego wyniku." title="Kondycja katalogu">
            <ModuleTable
              columns={productColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="name"
              rows={productRows(data.records)}
              summary={`${data.records.length} produktów`}
            />
          </ModuleSection>
        </>
      );
    case 'catalog':
      return (
        <SearchableTableSection
          columns={productColumns}
          detailDefinition={detail}
          primaryColumnId="name"
          rows={productRows(data.records)}
          title="Katalog produktów"
        />
      );
    case 'detail':
      return <ProductDetail record={data.record} />;
    case 'mapping':
      return (
        <MappingView records={data.records} />
      );
    case 'offers':
      return (
        <ModuleSection description="Oferty są prezentowane na podstawie aktualnych danych produktowych dostępnych w tym widoku." title="Oferty w bieżącym zakresie">
          <ModuleTable
            columns={productColumns}
            loading={false}
            primaryColumnId="name"
            rows={productRows(data.records)}
            summary={`${data.records.length} pozycji`}
          />
        </ModuleSection>
      );
    case 'performance':
      return <ProductPerformance records={data.records} />;
    case 'gaps':
      return <ProductGaps records={data.records} />;
    case 'impact':
      return <ProductImpact records={data.records} />;
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Widok zbiera warianty katalogu, mapowania, ofert, wydajności, braków i wpływu w jednym ekranie odczytu."
            title="Warianty produktów"
            tone="info"
          />
          <ModuleSection
            description="Lista produktów pozostaje tabelaryczną alternatywą dla wariantów i pokazuje tylko dostępne dane katalogu."
            title="Zakres produktów"
          >
            <ModuleTable
              columns={productColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="name"
              rows={productRows(data.records)}
              summary={`${data.records.length} produktów`}
            />
          </ModuleSection>
        </>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function CustomersContent({
  data,
  definition,
}: {
  readonly data: CustomersModuleData;
  readonly definition: AnalyticsScreenDefinition;
  readonly path: string;
}) {
  const detail = getAnalyticsDetailDefinition('customers');

  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <MetricLine items={customerOverviewMetrics(data.records)} label="Sygnały klientów" />
          <ModuleSection description="Wyłącznie pseudonimizowane rekordy dostępne w kontrakcie." title="Klienci w bieżącym zakresie">
            <ModuleTable
              columns={customerColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="customerPseudonym"
              rows={customerRows(data.records)}
              summary={`${data.records.length} pseudonimów`}
            />
          </ModuleSection>
        </>
      );
    case 'segments':
      return <CustomerSegmentsView records={data.records} />;
    case 'cohorts':
      return <CohortMatrixView cohorts={data.cohorts} />;
    case 'detail':
      return <CustomerDetail record={data.record} />;
    case 'identity-conflicts':
      return <IdentityConflictsView records={data.records} />;
    case 'privacy':
      return <PrivacyView records={data.records} />;
    case 'impact':
      return <CustomerImpact records={data.records} />;
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Widok zbiera warianty pseudonimizacji, segmentów, kohort, konfliktów tożsamości, prywatności i wpływu bez ujawniania PII."
            title="Warianty klientów"
            tone="info"
          />
          <ModuleSection
            description="Tabela zachowuje alternatywę tekstową dla wszystkich stanów klienta i pokazuje tylko pseudonimizowane identyfikatory."
            title="Zakres klientów"
          >
            <ModuleTable
              columns={customerColumns}
              detailDefinition={detail}
              loading={false}
              primaryColumnId="customerPseudonym"
              rows={customerRows(data.records)}
              summary={`${data.records.length} pseudonimów`}
            />
          </ModuleSection>
        </>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function TrafficContent({
  data,
  definition,
  path,
}: {
  readonly data: TrafficModuleData;
  readonly definition: AnalyticsScreenDefinition;
  readonly path: string;
}) {
  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <MetricLine items={trafficOverviewMetrics(data.records)} label="Sygnały ruchu" />
          <ChannelBreakdown records={data.records} />
        </>
      );
    case 'channels':
      return <ChannelBreakdown records={data.records} />;
    case 'funnel':
      return <SalesFunnelView steps={data.steps} />;
    case 'funnel-step':
      return <FunnelStepDetail path={path} steps={data.steps} />;
    case 'funnel-definitions':
      return <FunnelDefinitions steps={data.steps} />;
    case 'ga4-orders':
      return (
        <>
          <InlineNotice
            message="W bieżącym zakresie dostępne są metryki ruchu. Dane zamówień nie są jeszcze spięte do pełnego porównania w tym widoku."
            title="Porównanie ograniczone zakresem danych"
            tone="info"
          />
          <ChannelBreakdown records={data.records} />
        </>
      );
    case 'event-quality':
      return (
        <>
          <DiagnosticsList diagnostics={data.diagnostics} />
          <ModuleSection description="Jakość eventów pokazana razem z kanałem, którego dotyczy." title="Jakość danych ruchu">
            <ModuleTable
              columns={trafficColumns}
              loading={false}
              primaryColumnId="channel"
              rows={trafficRows(data.records)}
              summary={`${data.records.length} wymiarów`}
            />
          </ModuleSection>
        </>
      );
    case 'landing-pages':
      return <LandingPagesView records={data.records} />;
    case 'variants':
      return (
        <>
          <InlineNotice
            message="Widok zbiera warianty przeglądu ruchu, kanałów, lejka, jakości eventów, porównania GA4 z zamówieniami i stron wejścia."
            title="Warianty ruchu"
            tone="info"
          />
          <ModuleSection
            description="Tabela ruchu pozostaje kanoniczną alternatywą danych dla stanów ready, partial, empty, error, stale i offline."
            title="Zakres ruchu"
          >
            <ModuleTable
              columns={trafficColumns}
              loading={false}
              primaryColumnId="channel"
              rows={trafficRows(data.records)}
              summary={`${data.records.length} wymiarów`}
            />
          </ModuleSection>
        </>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function ModuleSummaryStrip({
  generatedAt,
  summary,
}: {
  readonly generatedAt: string;
  readonly summary: SummaryLike;
}) {
  const readiness = resolveSummaryReadiness(summary);

  return (
    <dl className="pd-analytics-module__summary" aria-label="Podsumowanie danych">
      <div>
        <dt>Readiness</dt>
        <dd>
          <StatusBadge
            status="Readiness"
            text={readiness.label}
            tone={readiness.tone}
          />
        </dd>
      </div>
      <div>
        <dt>Rekordy</dt>
        <dd>{formatInteger(summary.total)}</dd>
      </div>
      <div>
        <dt>Wymaga uwagi</dt>
        <dd>{formatInteger(summary.warning + summary.critical)}</dd>
      </div>
      <div>
        <dt>Aktualizacja</dt>
        <dd>{formatDateTime(generatedAt)}</dd>
      </div>
    </dl>
  );
}

function MetricLine({
  items,
  label,
}: {
  readonly items: readonly {
    readonly label: string;
    readonly note?: string;
    readonly value: string;
  }[];
  readonly label: string;
}) {
  return (
    <dl className="pd-analytics-module__metric-line" aria-label={label}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          {item.note ? <small>{item.note}</small> : null}
        </div>
      ))}
    </dl>
  );
}

function ModuleSection({
  children,
  description = null,
  title,
}: {
  readonly children: React.ReactNode;
  readonly description?: string | null;
  readonly title: string;
}) {
  return (
    <section className="pd-analytics-module__section">
      <header className="pd-analytics-module__section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function SearchableTableSection({
  columns,
  detailDefinition = null,
  primaryColumnId,
  rows,
  title,
}: {
  readonly columns: readonly DataColumn[];
  readonly detailDefinition?: AnalyticsScreenDefinition | null;
  readonly primaryColumnId: string;
  readonly rows: readonly DataRow[];
  readonly title: string;
}) {
  const [query, setQuery] = React.useState(readUrlQuery());
  const visibleRows = filterRows(rows, query);

  function updateQuery(value: string) {
    setQuery(value);
    writeUrlQuery(value);
  }

  return (
    <ModuleSection title={title}>
      <SearchField
        className="pd-analytics-module__search"
        debounceMs={120}
        hideLabel
        label={`Szukaj: ${title}`}
        loading={false}
        onClear={() => updateQuery('')}
        onQueryChange={updateQuery}
        placeholder="Szukaj w bieżącym widoku"
        query={query}
        resultCount={visibleRows.length}
        size="compact"
      />
      <ModuleTable
        columns={columns}
        detailDefinition={detailDefinition}
        loading={false}
        primaryColumnId={primaryColumnId}
        rows={visibleRows}
        summary={`${visibleRows.length} wyników`}
      />
    </ModuleSection>
  );
}

function ModuleTable({
  columns,
  detailDefinition = null,
  loading,
  primaryColumnId,
  rows,
  summary,
}: {
  readonly columns: readonly DataColumn[];
  readonly detailDefinition?: AnalyticsScreenDefinition | null;
  readonly loading: boolean;
  readonly primaryColumnId: string;
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <div className="pd-analytics-module__table">
      <DataTable
        ariaLabel={summary}
        cellRenderers={
          detailDefinition
            ? {
                [primaryColumnId]: (row) => {
                  const value = row[primaryColumnId];
                  const resourceId = String(row.resourceId ?? '');
                  return resourceId ? (
                    <a href={`${detailDefinition.routeBase}/${encodeURIComponent(resourceId)}`}>
                      {String(value ?? '—')}
                    </a>
                  ) : String(value ?? '—');
                },
              }
            : undefined
        }
        columns={columns}
        emptyMessage="Brak rekordów dla bieżącego zakresu."
        emptyTitle="Brak danych"
        loading={loading}
        minWidth={820}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={summary}
      />
    </div>
  );
}

function DistributionList({
  items,
  title,
}: {
  readonly items: readonly {
    readonly label: string;
    readonly secondary: string;
    readonly value: number;
    readonly valueLabel: string;
  }[];
  readonly title: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ModuleSection title={title}>
      {items.length > 0 ? (
        <ol className="pd-analytics-module__distribution">
          {items.map((item) => (
            <li key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.secondary}</span>
              </div>
              <span aria-hidden="true" className="pd-analytics-module__track">
                <span style={{ inlineSize: `${Math.max((item.value / max) * 100, 4)}%` }} />
              </span>
              <b>{item.valueLabel}</b>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyDomainMessage />
      )}
    </ModuleSection>
  );
}

function AttributionView({
  data,
}: {
  readonly data: CampaignsModuleData['attribution'];
}) {
  const total = data.reduce((sum, item) => sum + item.revenue.amount, 0);

  return (
    <ModuleSection
      description="Źródła i udział wynikają z aktualnych danych atrybucji dla bieżącego zakresu."
      title="Atrybucja sprzedaży"
    >
      {data.length > 0 ? (
        <ol className="pd-analytics-module__distribution">
          {data.map((item) => (
            <li key={`${item.source}-${item.model}`}>
              <div>
                <strong>{item.source}</strong>
                <span>{item.model} · {formatInteger(item.orders)} zamówień</span>
              </div>
              <span aria-hidden="true" className="pd-analytics-module__track">
                <span style={{ inlineSize: `${Math.max(item.contribution * 100, 4)}%` }} />
              </span>
              <b>{formatMoney(item.revenue)}</b>
            </li>
          ))}
        </ol>
      ) : (
        <InlineNotice
          message="Brak danych atrybucji dla bieżącego zakresu. Udziały pojawią się po dostępnej synchronizacji źródeł sprzedaży."
          title="Brak danych atrybucji"
          tone="info"
        />
      )}
      {data.length > 0 ? (
        <p className="pd-analytics-module__footnote">Suma przychodu w modelu: {formatMoneyAmount(total, data[0]?.revenue.currency ?? 'PLN')}.</p>
      ) : null}
    </ModuleSection>
  );
}

function CampaignBudget({ records }: { readonly records: readonly CampaignsRecord[] }) {
  return (
    <ModuleSection
      description="Tempo wydatków obliczone wyłącznie z budżetu i kosztu bieżących rekordów; brak sztucznej prognozy."
      title="Budżet i wykorzystanie"
    >
      {records.length > 0 ? (
        <ol className="pd-analytics-module__budget-list">
          {records.map((record) => {
            const ratio = record.budget.amount > 0
              ? record.spend.amount / record.budget.amount
              : 0;
            return (
              <li key={record.campaignId}>
                <div>
                  <strong>{record.name}</strong>
                  <span>{campaignChannelLabel(record.channel)}</span>
                </div>
                <span aria-hidden="true" className="pd-analytics-module__track">
                  <span style={{ inlineSize: `${Math.min(Math.max(ratio * 100, 2), 100)}%` }} />
                </span>
                <b>{formatPercent(ratio)} · {formatMoney(record.spend)} / {formatMoney(record.budget)}</b>
              </li>
            );
          })}
        </ol>
      ) : <EmptyDomainMessage />}
    </ModuleSection>
  );
}

function DiagnosticsList({ diagnostics }: { readonly diagnostics: readonly DiagnosticFinding[] }) {
  return (
    <ModuleSection title="Diagnostyka">
      {diagnostics.length > 0 ? (
        <ul className="pd-analytics-module__diagnostics">
          {diagnostics.map((finding) => (
            <li
              data-finding-code={finding.code}
              data-severity={finding.severity}
              key={finding.findingId}
            >
              <StatusBadge
                status="Waga"
                text={diagnosticSeverityLabel(finding.severity)}
                tone={finding.severity === 'error' ? 'critical' : finding.severity === 'warning' ? 'warning' : 'info'}
              />
              <div>
                <strong>{finding.message}</strong>
                {finding.sourceRef ? <span>{finding.sourceRef}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <InlineNotice
          message="Brak sygnałów diagnostycznych dla bieżącego zakresu."
          title="Brak diagnostyki"
          tone="info"
        />
      )}
    </ModuleSection>
  );
}

function RecommendationsReadOnly({ recommendations }: { readonly recommendations: readonly RecommendationView[] }) {
  return (
    <ModuleSection
      description="Rekomendacje pozostają tylko do odczytu, ponieważ ekran nie deklaruje osobnej operacji approve/reject."
      title="Rekomendacje"
    >
      {recommendations.length > 0 ? (
        <div className="pd-analytics-module__recommendations">
          {recommendations.map((item) => (
            <article key={item.recommendationId}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.rationale}</p>
              </div>
              <dl>
                <div><dt>Wpływ</dt><dd>{impactLabel(item.impact)}</dd></div>
                <div><dt>Confidence</dt><dd>{formatPercent(item.confidence)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <InlineNotice
          message="Brak rekomendacji dla bieżącego kontekstu."
          title="Brak rekomendacji"
          tone="info"
        />
      )}
    </ModuleSection>
  );
}

function OrdersTimeline({ records }: { readonly records: readonly OrdersRecord[] }) {
  const ordered = [...records].sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  return (
    <ModuleSection
      description="Chronologia pokazuje zamówienia według czasu złożenia, bez dopisywania zdarzeń niedostępnych w bieżącym widoku."
      title="Chronologia rekordów"
    >
      {ordered.length > 0 ? (
        <ol className="pd-analytics-module__timeline">
          {ordered.map((record) => (
            <li key={record.orderId}>
              <time dateTime={record.orderedAt}>{formatDateTime(record.orderedAt)}</time>
              <div>
                <strong>{record.externalOrderId}</strong>
                <span>{record.source} · {orderStatusLabel(record.status)}</span>
              </div>
              <b>{formatMoney(record.amount)}</b>
            </li>
          ))}
        </ol>
      ) : <EmptyDomainMessage />}
    </ModuleSection>
  );
}

function MappingView({ records }: { readonly records: readonly ProductsRecord[] }) {
  const gaps = records.filter((record) => record.status === 'missingMapping' || !record.category);
  return (
    <>
      <InlineNotice
        message="Zmiana mapowania nie jest jeszcze dostępna w tym widoku. Lista wskazuje pozycje wymagające pracy katalogowej."
        title="Mapowanie produktów"
        tone="info"
      />
      <ModuleSection title="Pozycje wymagające mapowania">
        <ModuleTable
          columns={productColumns}
          loading={false}
          primaryColumnId="name"
          rows={productRows(gaps)}
          summary={`${gaps.length} pozycji`}
        />
      </ModuleSection>
    </>
  );
}

function ProductPerformance({ records }: { readonly records: readonly ProductsRecord[] }) {
  const sorted = [...records].sort((a, b) => b.revenue.amount - a.revenue.amount);
  return (
    <>
      <MetricLine items={productOverviewMetrics(records)} label="Wydajność produktów" />
      <DistributionList
        items={sorted.map((record) => ({
          label: record.name,
          secondary: `${formatInteger(record.units)} szt. · marża ${formatNullablePercent(record.margin)}`,
          value: record.revenue.amount,
          valueLabel: formatMoney(record.revenue),
        }))}
        title="Przychód według produktu"
      />
    </>
  );
}

function ProductGaps({ records }: { readonly records: readonly ProductsRecord[] }) {
  const gaps = records.filter((record) => (
    record.status === 'missingMapping'
    || !record.category
    || record.margin === null
  ));
  return (
    <ModuleSection description="Kolejka wynika z braków widocznych w danych katalogu." title="Kolejka braków">
      <ModuleTable
        columns={productColumns}
        loading={false}
        primaryColumnId="name"
        rows={productRows(gaps)}
        summary={`${gaps.length} pozycji wymagających uwagi`}
      />
    </ModuleSection>
  );
}

function ProductImpact({ records }: { readonly records: readonly ProductsRecord[] }) {
  const items = [...records]
    .sort((a, b) => b.revenue.amount - a.revenue.amount)
    .map((record) => ({
      label: record.name,
      secondary: `${record.category ?? 'Brak kategorii'} · marża ${formatNullablePercent(record.margin)}`,
      value: record.revenue.amount,
      valueLabel: formatMoney(record.revenue),
    }));
  return (
    <DistributionList items={items} title="Ekspozycja wyniku na produkty" />
  );
}

function CustomerSegmentsView({ records }: { readonly records: readonly CustomersRecord[] }) {
  const segments = aggregateCustomerSegments(records);
  return (
    <ModuleSection
      description="Agregacja wykorzystuje wyłącznie pseudonimizowany segmentId, przychód i LTV."
      title="Segmenty klientów"
    >
      {segments.length > 0 ? (
        <div className="pd-analytics-module__segments">
          {segments.map((segment) => (
            <article key={segment.id}>
              <div>
                <span>Segment</span>
                <strong>{segment.label}</strong>
              </div>
              <dl>
                <div><dt>Klienci</dt><dd>{formatInteger(segment.customers)}</dd></div>
                <div><dt>Przychód</dt><dd>{formatMoneyAmount(segment.revenue, 'PLN')}</dd></div>
                <div><dt>Śr. LTV</dt><dd>{formatMoneyAmount(segment.ltv, 'PLN')}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : <EmptyDomainMessage />}
    </ModuleSection>
  );
}

function CohortMatrixView({ cohorts }: { readonly cohorts: CustomersModuleData['cohorts'] }) {
  return (
    <ModuleSection
      description="Kohorty pokazują retencję, liczbę użytkowników i przychód dla dostępnych grup klientów."
      title="Kohorty"
    >
      {cohorts.length > 0 ? (
        <div className="pd-analytics-module__cohorts" role="table" aria-label="Macierz kohort">
          <div className="pd-analytics-module__cohort-row" role="row">
            <strong role="columnheader">Kohorta</strong>
            <strong role="columnheader">Użytkownicy</strong>
            <strong role="columnheader">Retencja</strong>
            <strong role="columnheader">Przychód</strong>
          </div>
          {cohorts.map((cohort) => (
            <div className="pd-analytics-module__cohort-row" key={cohort.cohortKey} role="row">
              <span role="cell">{cohort.cohortKey}</span>
              <span role="cell">{formatInteger(cohort.users)}</span>
              <span role="cell">{formatNullablePercent(cohort.retentionRate)}</span>
              <span role="cell">{formatMoney(cohort.revenue)}</span>
            </div>
          ))}
        </div>
      ) : (
        <InlineNotice message="Brak danych kohortowych dla bieżącego zakresu." title="Brak kohort" tone="info" />
      )}
    </ModuleSection>
  );
}

function IdentityConflictsView({ records }: { readonly records: readonly CustomersRecord[] }) {
  const candidates = records.filter((record) => !record.segmentId || !record.cohortKey || record.consentStatus === 'unknown');
  return (
    <>
      <InlineNotice
        message="Lista wskazuje rekordy z brakującym kontekstem, bez oznaczania ich jako potwierdzonych konfliktów tożsamości."
        title="Sygnały do przeglądu"
        tone="info"
      />
      <ModuleSection title="Rekordy wymagające weryfikacji">
        <ModuleTable
          columns={customerColumns}
          loading={false}
          primaryColumnId="customerPseudonym"
          rows={customerRows(candidates)}
          summary={`${candidates.length} sygnałów`}
        />
      </ModuleSection>
    </>
  );
}

function PrivacyView({ records }: { readonly records: readonly CustomersRecord[] }) {
  const counts = countBy(records, (record) => record.consentStatus);
  const total = records.length || 1;
  return (
    <ModuleSection description="Widok operuje wyłącznie na statusach zgód i pseudonimach." title="Prywatność i zgody">
      <div className="pd-analytics-module__privacy">
        {(['granted', 'withdrawn', 'unknown'] as const).map((status) => {
          const count = counts.get(status) ?? 0;
          return (
            <div key={status}>
              <span>{consentStatusLabel(status)}</span>
              <strong>{formatInteger(count)}</strong>
              <small>{formatPercent(count / total)}</small>
            </div>
          );
        })}
      </div>
    </ModuleSection>
  );
}

function CustomerImpact({ records }: { readonly records: readonly CustomersRecord[] }) {
  const segments = aggregateCustomerSegments(records);
  return (
    <DistributionList
      items={segments.map((segment) => ({
        label: segment.label,
        secondary: `${formatInteger(segment.customers)} klientów · LTV ${formatMoneyAmount(segment.ltv, 'PLN')}`,
        value: segment.revenue,
        valueLabel: formatMoneyAmount(segment.revenue, 'PLN'),
      }))}
      title="Wpływ segmentów na przychód"
    />
  );
}

function ChannelBreakdown({ records }: { readonly records: readonly TrafficRecord[] }) {
  const channels = aggregateTrafficChannels(records);
  return (
    <>
      <DistributionList items={channels} title="Kanały ruchu" />
      <ModuleSection description="Pełne wartości źródłowe dla bieżącego zakresu." title="Rejestr kanałów">
        <ModuleTable
          columns={trafficColumns}
          loading={false}
          primaryColumnId="channel"
          rows={trafficRows(records)}
          summary={`${records.length} wymiarów`}
        />
      </ModuleSection>
    </>
  );
}

function SalesFunnelView({ steps }: { readonly steps: readonly FunnelStepView[] }) {
  return (
    <ModuleSection
      description="Lejek wykorzystuje dostępne kroki ścieżki zakupowej dla bieżącego zakresu."
      title="Lejek sprzedażowy"
    >
      {steps.length > 0 ? (
        <div className="pd-analytics-module__funnel">
          <FunnelChart
            orientation="vertical"
            showDropoff
            steps={steps.map((step) => ({
              conversionRate: step.conversionRate,
              id: step.stepId,
              label: step.label,
              value: step.entrants,
            }))}
          />
        </div>
      ) : (
        <InlineNotice message="Brak kroków lejka dla bieżącego zakresu." title="Brak danych lejka" tone="info" />
      )}
    </ModuleSection>
  );
}

function FunnelStepDetail({ path, steps }: { readonly path: string; readonly steps: readonly FunnelStepView[] }) {
  const resourceId = decodeURIComponent(path.split('?')[0]?.split('/').filter(Boolean).at(-1) ?? '');
  const step = steps.find((item) => item.stepId === resourceId) ?? steps[0] ?? null;

  if (!step) {
    return <InlineNotice message="Brak szczegółu kroku lejka dla bieżącego zakresu." title="Brak szczegółu kroku" tone="info" />;
  }

  return (
    <ModuleSection title={step.label}>
      <dl className="pd-analytics-module__detail-grid">
        <div><dt>Wejścia</dt><dd>{formatInteger(step.entrants)}</dd></div>
        <div><dt>Ukończenia</dt><dd>{formatInteger(step.completions)}</dd></div>
        <div><dt>Konwersja</dt><dd>{formatPercent(step.conversionRate)}</dd></div>
        <div><dt>Odpływ</dt><dd>{formatPercent(Math.max(0, 1 - step.conversionRate))}</dd></div>
      </dl>
    </ModuleSection>
  );
}

function FunnelDefinitions({ steps }: { readonly steps: readonly FunnelStepView[] }) {
  return (
    <>
      <InlineNotice
        message="Ekran posiada tylko traffic.funnel-definitions.read. Definicje są prezentowane bez przycisku zapisu lub edycji."
        title="Definicje w trybie odczytu"
        tone="info"
      />
      <ModuleSection title="Kroki lejka">
        {steps.length > 0 ? (
          <ol className="pd-analytics-module__definitions">
            {steps.map((step, index) => (
              <li key={step.stepId}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{step.label}</strong><small>{step.stepId}</small></div>
                <b>{formatPercent(step.conversionRate)}</b>
              </li>
            ))}
          </ol>
        ) : <EmptyDomainMessage />}
      </ModuleSection>
    </>
  );
}

function LandingPagesView({ records }: { readonly records: readonly TrafficRecord[] }) {
  const byPage = new Map<string, { conversions: number; revenue: number; sessions: number }>();
  for (const record of records) {
    const key = record.landingPage ?? 'Brak strony wejścia';
    const current = byPage.get(key) ?? { conversions: 0, revenue: 0, sessions: 0 };
    current.conversions += record.conversions;
    current.revenue += record.revenue.amount;
    current.sessions += record.sessions;
    byPage.set(key, current);
  }
  const items = [...byPage.entries()]
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .map(([label, value]) => ({
      label,
      secondary: `${formatInteger(value.conversions)} konwersji · ${formatMoneyAmount(value.revenue, 'PLN')}`,
      value: value.sessions,
      valueLabel: `${formatInteger(value.sessions)} sesji`,
    }));
  return <DistributionList items={items} title="Strony wejścia" />;
}

function CampaignDetail({ record }: { readonly record: CampaignsRecord | null }) {
  if (!record) return <EmptyDomainMessage />;
  return (
    <RecordDetail
      groups={[
        ['Kampania', [
          ['Nazwa', record.name],
          ['Kanał', campaignChannelLabel(record.channel)],
          ['Status', campaignStatusLabel(record.status)],
        ]],
        ['Wynik', [
          ['Budżet', formatMoney(record.budget)],
          ['Koszt', formatMoney(record.spend)],
          ['Przychód', formatMoney(record.revenue)],
          ['ROAS', formatNullableNumber(record.roas)],
        ]],
      ]}
      title={record.name}
    />
  );
}

function OrderDetail({ record }: { readonly record: OrdersRecord | null }) {
  if (!record) return <EmptyDomainMessage />;
  return (
    <RecordDetail
      groups={[
        ['Zamówienie', [
          ['ID zewnętrzne', record.externalOrderId],
          ['Data', formatDateTime(record.orderedAt)],
          ['Status', orderStatusLabel(record.status)],
          ['Źródło', record.source],
        ]],
        ['Wartość i klient', [
          ['Wartość', formatMoney(record.amount)],
          ['Klient', record.customerPseudonym ?? 'Brak pseudonimu'],
        ]],
      ]}
      title={record.externalOrderId}
    />
  );
}

function ProductDetail({ record }: { readonly record: ProductsRecord | null }) {
  if (!record) return <EmptyDomainMessage />;
  return (
    <RecordDetail
      groups={[
        ['Produkt', [
          ['Nazwa', record.name],
          ['SKU', record.sku],
          ['Status', productStatusLabel(record.status)],
          ['Kategoria', record.category ?? 'Brak kategorii'],
        ]],
        ['Wynik', [
          ['Przychód', formatMoney(record.revenue)],
          ['Sztuki', formatInteger(record.units)],
          ['Marża', formatNullablePercent(record.margin)],
        ]],
      ]}
      title={record.name}
    />
  );
}

function CustomerDetail({ record }: { readonly record: CustomersRecord | null }) {
  if (!record) return <EmptyDomainMessage />;
  return (
    <RecordDetail
      groups={[
        ['Pseudonimizacja', [
          ['Pseudonim', record.customerPseudonym],
          ['Segment', shortId(record.segmentId)],
          ['Kohorta', record.cohortKey ?? 'Brak kohorty'],
          ['Status zgody', consentStatusLabel(record.consentStatus)],
        ]],
        ['Wynik', [
          ['Zamówienia', formatInteger(record.ordersCount)],
          ['Przychód', formatMoney(record.revenue)],
          ['LTV', record.ltv ? formatMoney(record.ltv) : '—'],
        ]],
      ]}
      title={record.customerPseudonym}
    />
  );
}

function RecordDetail({
  groups,
  title,
}: {
  readonly groups: readonly [string, readonly [string, string][]][];
  readonly title: string;
}) {
  return (
    <ModuleSection title={title}>
      <div className="pd-analytics-module__record-detail">
        {groups.map(([groupTitle, fields]) => (
          <section key={groupTitle}>
            <h3>{groupTitle}</h3>
            <dl>
              {fields.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </ModuleSection>
  );
}

function UnsupportedVariant({ definition }: { readonly definition: AnalyticsScreenDefinition }) {
  return (
    <InlineNotice
      message={`Wariant ${definition.variant} nie ma jeszcze dedykowanej kompozycji w tym module.`}
      title="Brak kompozycji"
      tone="warning"
    />
  );
}

function EmptyDomainMessage() {
  return (
    <InlineNotice
      message="Brak rekordów potrzebnych do zbudowania tej części widoku."
      title="Brak danych"
      tone="info"
    />
  );
}

function campaignRows(records: readonly CampaignsRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    id: record.campaignId,
    channel: campaignChannelLabel(record.channel),
    name: record.name,
    resourceId: record.campaignId,
    revenue: formatMoney(record.revenue),
    roas: formatNullableNumber(record.roas),
    spend: formatMoney(record.spend),
    status: campaignStatusLabel(record.status),
  }));
}

function orderRows(records: readonly OrdersRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    id: record.orderId,
    amount: formatMoney(record.amount),
    customerPseudonym: record.customerPseudonym ?? '—',
    externalOrderId: record.externalOrderId,
    orderedAt: formatDateTime(record.orderedAt),
    resourceId: record.orderId,
    source: record.source,
    status: orderStatusLabel(record.status),
  }));
}

function productRows(records: readonly ProductsRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    id: record.productId,
    category: record.category ?? '—',
    margin: formatNullablePercent(record.margin),
    name: record.name,
    resourceId: record.productId,
    revenue: formatMoney(record.revenue),
    sku: record.sku,
    status: productStatusLabel(record.status),
    units: record.units,
  }));
}

function customerRows(records: readonly CustomersRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    id: record.customerPseudonym,
    cohortKey: record.cohortKey ?? '—',
    consentStatus: consentStatusLabel(record.consentStatus),
    customerPseudonym: record.customerPseudonym,
    ltv: record.ltv ? formatMoney(record.ltv) : '—',
    ordersCount: record.ordersCount,
    resourceId: record.customerPseudonym,
    revenue: formatMoney(record.revenue),
    segmentId: shortId(record.segmentId),
  }));
}

function trafficRows(records: readonly TrafficRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    id: record.dimensionKey,
    channel: record.channel || record.dimensionKey,
    conversionRate: formatPercent(record.conversionRate),
    conversions: record.conversions,
    eventQuality: formatNullablePercent(record.eventQuality),
    revenue: formatMoney(record.revenue),
    sessions: record.sessions,
    users: record.users,
  }));
}

function campaignOverviewMetrics(records: readonly CampaignsRecord[]) {
  const spend = sumMoney(records.map((record) => record.spend));
  const revenue = sumMoney(records.map((record) => record.revenue));
  return [
    { label: 'Kampanie', value: formatInteger(records.length) },
    { label: 'Koszt', value: formatMoneyAmount(spend, records[0]?.spend.currency ?? 'PLN') },
    { label: 'Przychód', value: formatMoneyAmount(revenue, records[0]?.revenue.currency ?? 'PLN') },
    { label: 'ROAS blended', value: spend > 0 ? formatNumber(revenue / spend) : '—' },
  ] as const;
}

function orderOverviewMetrics(records: readonly OrdersRecord[]) {
  const revenue = sumMoney(records.map((record) => record.amount));
  const sources = new Set(records.map((record) => record.source)).size;
  const attention = records.filter((record) => record.status === 'cancelled' || record.status === 'refunded').length;
  return [
    { label: 'Zamówienia', value: formatInteger(records.length) },
    { label: 'Wartość', value: formatMoneyAmount(revenue, records[0]?.amount.currency ?? 'PLN') },
    { label: 'Źródła', value: formatInteger(sources) },
    { label: 'Anulowane / refund', value: formatInteger(attention) },
  ] as const;
}

function productOverviewMetrics(records: readonly ProductsRecord[]) {
  const revenue = sumMoney(records.map((record) => record.revenue));
  const units = records.reduce((sum, record) => sum + record.units, 0);
  const gaps = records.filter((record) => record.status === 'missingMapping' || !record.category).length;
  return [
    { label: 'Produkty', value: formatInteger(records.length) },
    { label: 'Przychód', value: formatMoneyAmount(revenue, records[0]?.revenue.currency ?? 'PLN') },
    { label: 'Sztuki', value: formatInteger(units) },
    { label: 'Braki mapowania', value: formatInteger(gaps) },
  ] as const;
}

function customerOverviewMetrics(records: readonly CustomersRecord[]) {
  const revenue = sumMoney(records.map((record) => record.revenue));
  const orders = records.reduce((sum, record) => sum + record.ordersCount, 0);
  const consentAttention = records.filter((record) => record.consentStatus !== 'granted').length;
  return [
    { label: 'Pseudonimy', value: formatInteger(records.length) },
    { label: 'Przychód', value: formatMoneyAmount(revenue, records[0]?.revenue.currency ?? 'PLN') },
    { label: 'Zamówienia', value: formatInteger(orders) },
    { label: 'Zgody do uwagi', value: formatInteger(consentAttention) },
  ] as const;
}

function trafficOverviewMetrics(records: readonly TrafficRecord[]) {
  const sessions = records.reduce((sum, record) => sum + record.sessions, 0);
  const users = records.reduce((sum, record) => sum + record.users, 0);
  const conversions = records.reduce((sum, record) => sum + record.conversions, 0);
  const revenue = sumMoney(records.map((record) => record.revenue));
  return [
    { label: 'Sesje', value: formatInteger(sessions) },
    { label: 'Użytkownicy', value: formatInteger(users) },
    { label: 'Konwersje', value: formatInteger(conversions) },
    { label: 'Przychód', value: formatMoneyAmount(revenue, records[0]?.revenue.currency ?? 'PLN') },
  ] as const;
}

function aggregateCampaignChannels(records: readonly CampaignsRecord[]) {
  const groups = new Map<string, { count: number; revenue: number }>();
  for (const record of records) {
    const label = campaignChannelLabel(record.channel);
    const current = groups.get(label) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += record.revenue.amount;
    groups.set(label, current);
  }
  return [...groups.entries()].map(([label, value]) => ({
    label,
    secondary: `${formatInteger(value.count)} kampanii`,
    value: value.revenue,
    valueLabel: formatMoneyAmount(value.revenue, records[0]?.revenue.currency ?? 'PLN'),
  }));
}

function aggregateOrderSources(records: readonly OrdersRecord[]) {
  const groups = new Map<string, { count: number; revenue: number }>();
  for (const record of records) {
    const current = groups.get(record.source) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += record.amount.amount;
    groups.set(record.source, current);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([label, value]) => ({
      label,
      secondary: `${formatInteger(value.count)} zamówień`,
      value: value.revenue,
      valueLabel: formatMoneyAmount(value.revenue, records[0]?.amount.currency ?? 'PLN'),
    }));
}

function aggregateCustomerSegments(records: readonly CustomersRecord[]) {
  const groups = new Map<string, { customers: number; ltv: number; ltvCount: number; revenue: number }>();
  for (const record of records) {
    const key = record.segmentId ?? 'bez-segmentu';
    const current = groups.get(key) ?? { customers: 0, ltv: 0, ltvCount: 0, revenue: 0 };
    current.customers += 1;
    current.revenue += record.revenue.amount;
    if (record.ltv) {
      current.ltv += record.ltv.amount;
      current.ltvCount += 1;
    }
    groups.set(key, current);
  }
  return [...groups.entries()].map(([id, value]) => ({
    customers: value.customers,
    id,
    label: id === 'bez-segmentu' ? 'Bez segmentu' : shortId(id),
    ltv: value.ltvCount > 0 ? value.ltv / value.ltvCount : 0,
    revenue: value.revenue,
  }));
}

function aggregateTrafficChannels(records: readonly TrafficRecord[]) {
  const groups = new Map<string, { conversions: number; revenue: number; sessions: number }>();
  for (const record of records) {
    const key = record.channel || record.dimensionKey;
    const current = groups.get(key) ?? { conversions: 0, revenue: 0, sessions: 0 };
    current.conversions += record.conversions;
    current.revenue += record.revenue.amount;
    current.sessions += record.sessions;
    groups.set(key, current);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .map(([label, value]) => ({
      label,
      secondary: `${formatInteger(value.conversions)} konwersji · ${formatMoneyAmount(value.revenue, records[0]?.revenue.currency ?? 'PLN')}`,
      value: value.sessions,
      valueLabel: `${formatInteger(value.sessions)} sesji`,
    }));
}

function filterRows(rows: readonly DataRow[], query: string): readonly DataRow[] {
  const normalized = query.trim().toLocaleLowerCase('pl-PL');
  if (!normalized) return rows;
  return rows.filter((row) => Object.values(row).some((value) => (
    String(value ?? '').toLocaleLowerCase('pl-PL').includes(normalized)
  )));
}

function readUrlQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') ?? '';
}

function writeUrlQuery(query: string) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (query.trim()) url.searchParams.set('q', query.trim());
  else url.searchParams.delete('q');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function countBy<T>(items: readonly T[], keyOf: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function resolveSummaryReadiness(summary: SummaryLike) {
  if (summary.critical > 0) return { label: 'Wymaga reakcji', tone: 'critical' as const };
  if (summary.warning > 0) return { label: 'Częściowe', tone: 'warning' as const };
  if (summary.total === 0) return { label: 'Brak danych', tone: 'neutral' as const };
  return { label: 'Gotowe', tone: 'success' as const };
}

function sumMoney(values: readonly Money[]) {
  return values.reduce((sum, item) => sum + item.amount, 0);
}

function formatMoney(value: Money) {
  return formatMoneyAmount(value.amount, value.currency);
}

function formatMoneyAmount(amount: number, currency: Money['currency']) {
  return new Intl.NumberFormat('pl-PL', {
    currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(amount);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(value);
}

function formatNullableNumber(value: number | null) {
  return value === null ? '—' : formatNumber(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1, style: 'percent' }).format(value);
}

function formatNullablePercent(value: number | null) {
  return value === null ? '—' : formatPercent(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function shortId(value: string | null) {
  if (!value) return '—';
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

function campaignChannelLabel(value: CampaignsRecord['channel']) {
  return ({ googleAds: 'Google Ads', metaAds: 'Meta Ads', other: 'Inne', tiktokAds: 'TikTok Ads' } as const)[value];
}

function campaignStatusLabel(value: CampaignsRecord['status']) {
  return ({ active: 'Aktywna', draft: 'Draft', ended: 'Zakończona', paused: 'Pauza' } as const)[value];
}

function orderStatusLabel(value: OrdersRecord['status']) {
  return ({ cancelled: 'Anulowane', fulfilled: 'Zrealizowane', new: 'Nowe', paid: 'Opłacone', refunded: 'Refund' } as const)[value];
}

function productStatusLabel(value: ProductsRecord['status']) {
  return ({ active: 'Aktywny', archived: 'Archiwalny', inactive: 'Nieaktywny', missingMapping: 'Brak mapowania' } as const)[value];
}

function consentStatusLabel(value: CustomersRecord['consentStatus']) {
  return ({ granted: 'Udzielona', unknown: 'Nieznana', withdrawn: 'Wycofana' } as const)[value];
}

function diagnosticSeverityLabel(value: DiagnosticFinding['severity']) {
  return ({ error: 'Błąd', info: 'Informacja', warning: 'Ostrzeżenie' } as const)[value];
}

function impactLabel(value: RecommendationView['impact']) {
  return ({ high: 'Wysoki', low: 'Niski', medium: 'Średni' } as const)[value];
}
