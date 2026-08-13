import {
  useMemo,
  useState,
} from 'react';

import type {
  CampaignsRecord,
  CommandCenterRecord,
  ReadinessStatus,
} from '../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  DateRange,
  ReadinessState,
} from '../../../../../contracts/ui-contract-types';
import {
  AttributionComparison,
  BudgetPacing,
  Button,
  ChartFrame,
  Combobox,
  ComparisonChart,
  DataStatusBanner,
  DataTable,
  DateRangePicker,
  DecisionQueue,
  DetailPanel,
  EvidencePanel,
  FilterBar,
  FunnelChart,
  FunnelStep,
  InlineNotice,
  MetricCard,
  MorningBrief,
  PageHeader,
  Panel,
  PlanPerformance,
  RecommendationCard,
  ResultDrivers,
  SalesSources,
  SearchField,
  ShareChart,
  TrendChart,
  WaterfallChart,
} from '../../design-system';
import type {
  AnalyticsDataState,
} from '../../design-system';
import {
  businessTrendSeries,
  dateRangePresets,
  defaultDateRange,
  defaultWorkspaceContext,
} from './businessData';
import type {
  BusinessScreenData,
  BusinessScreenDefinition,
} from './businessData';
import {
  CommandCenterWorkspace,
} from './CommandCenterWorkspace';
import './business-screen.css';

export type BusinessScreenMode =
  | 'runtime'
  | 'storybook';

export type BusinessScreenProps = {
  readonly data: BusinessScreenData | null;
  readonly definition: BusinessScreenDefinition;
  readonly loading?: boolean;
  readonly mode?: BusinessScreenMode;
  readonly onReload?: (() => void) | undefined;
  readonly problem?: string | null;
};

const commandColumns: readonly DataColumn[] = [
  {
    id: 'label',
    label: 'Metryka',
    sortable: true,
    width: 220,
  },
  {
    align: 'right',
    id: 'value',
    label: 'Wynik',
    sortable: true,
  },
  {
    align: 'right',
    id: 'target',
    label: 'Cel',
    sortable: true,
  },
  {
    align: 'right',
    id: 'delta',
    label: 'Zmiana',
    sortable: true,
  },
  {
    id: 'readinessLabel',
    label: 'Readiness',
    sortable: true,
  },
];

const campaignColumns: readonly DataColumn[] = [
  {
    id: 'name',
    label: 'Kampania',
    sortable: true,
    width: 260,
  },
  {
    id: 'channel',
    label: 'Kanał',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    sortable: true,
  },
  {
    align: 'right',
    id: 'spend',
    label: 'Koszt',
    sortable: true,
  },
  {
    align: 'right',
    id: 'revenue',
    label: 'Przychód',
    sortable: true,
  },
  {
    align: 'right',
    id: 'roas',
    label: 'ROAS',
    sortable: true,
  },
];

const readinessToneMap = {
  Częściowe: 'warning',
  Gotowe: 'success',
  Niedostępne: 'danger',
  Nieświeże: 'warning',
} satisfies Record<string, 'danger' | 'success' | 'warning'>;

const campaignStatusToneMap = {
  Aktywna: 'success',
  Draft: 'neutral',
  Pauza: 'warning',
  Zakończona: 'neutral',
} satisfies Record<string, 'neutral' | 'success' | 'warning'>;

export function BusinessScreen({
  data,
  definition,
  loading = false,
  mode = 'runtime',
  onReload,
  problem = null,
}: BusinessScreenProps) {
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRange>(defaultDateRange);
  const [source, setSource] = useState<string | null>('all');
  const dataState = resolveDataState({
    data,
    loading,
    problem,
  });
  const isCommand = data?.group === 'command-center';
  const isCampaigns = data?.group === 'campaigns';
  const commandRows = useMemo(
    () => (
      isCommand
        ? buildCommandRows(data.records, query)
        : []
    ),
    [data, isCommand, query],
  );
  const campaignRows = useMemo(
    () => (
      isCampaigns
        ? buildCampaignRows(data.records, query)
        : []
    ),
    [data, isCampaigns, query],
  );
  const selectedSources = data?.sources ?? [];
  const sourceOptions = [
    {
      label: 'Wszystkie źródła',
      value: 'all',
    },
    ...selectedSources.map((item) => ({
      label: `${item.provider} · ${item.dataset}`,
      value: item.dataset,
    })),
  ];
  const filteredSources = source === 'all'
    ? selectedSources
    : selectedSources.filter((item) => item.dataset === source);
  const visibleSources = filteredSources.length > 0
    ? filteredSources
    : selectedSources;
  const issueList = problem
    ? [
        {
          id: `${definition.id}-api-problem`,
          label: 'Odczyt API niedostępny',
          severity: 'critical' as const,
        },
      ]
    : buildIssues(data);
  const pageTitle = definition.group === 'command-center'
    ? 'Centrum Dowodzenia'
    : 'Kampanie płatne';
  const activeRows = isCampaigns
    ? campaignRows.length
    : commandRows.length;

  if (definition.group === 'command-center') {
    return (
      <CommandCenterWorkspace
        data={
          data?.group === 'command-center'
            ? data
            : null
        }
        definition={definition}
        loading={loading}
        mode={mode}
        onReload={onReload}
        problem={problem}
      />
    );
  }

  return (
    <section
      aria-busy={loading || undefined}
      aria-label={`${pageTitle}: ${definition.displayTitle}`}
      className="pd-business-screen"
      data-mode={mode}
      data-screen-id={definition.id}
    >
      <div className="pd-business-screen__system-strip" aria-label="Warstwa decyzyjna">
        <span>Enterprise BI</span>
        <span>Dane kontraktowe</span>
        <span>Gotowe do decyzji</span>
      </div>

      <PageHeader
        breadcrumbs={[
          {
            href: '/app',
            label: 'Aplikacja',
          },
          {
            href: '/app/campaigns',
            label: pageTitle,
          },
          {
            href: null,
            label: definition.displayTitle,
          },
        ]}
        meta={[
          {
            label: 'Screen ID',
            value: definition.id,
          },
          {
            label: 'Operacja',
            value: definition.operationId,
          },
          {
            label: 'Tryb',
            value: mode === 'runtime' ? 'Runtime' : 'Storybook',
          },
        ]}
        subtitle={definition.summary}
        title={`${pageTitle}: ${definition.displayTitle}`}
        actions={(
          <>
            {onReload ? (
              <Button
                loading={loading}
                loadingLabel="Odświeżanie"
                size="small"
                variant="secondary"
                onClick={onReload}
              >
                Odśwież dane
              </Button>
            ) : null}
            <Button size="small" variant="secondary">
              Eksportuj widok
            </Button>
          </>
        )}
      />

      <DataStatusBanner
        blockingIssues={issueList}
        context={defaultWorkspaceContext}
        readiness={resolveReadinessState(dataState)}
        sources={[...visibleSources]}
      />

      {problem ? (
        <InlineNotice
          message={problem}
          title="Dane produkcyjne nie zostały pobrane"
          tone="critical"
        />
      ) : null}

      <FilterBar
        activeCount={source && source !== 'all' ? 2 : 1}
        collapsible
        filters={[
          {
            id: 'range',
            label: 'Zakres',
            removable: false,
            tone: 'accent',
            type: 'date',
            value: formatDateRange(range),
          },
          {
            id: 'source',
            label: 'Źródło',
            tone: 'neutral',
            type: 'select',
            value: source && source !== 'all' ? source : null,
          },
        ]}
        resultCount={activeRows}
        search={(
          <SearchField
            debounceMs={0}
            hideLabel
            label="Szukaj w ekranie"
            loading={false}
            placeholder="Szukaj metryki, kampanii lub źródła"
            query={query}
            resultCount={activeRows}
            onClear={() => {
              setQuery('');
            }}
            onQueryChange={setQuery}
          />
        )}
        availableFilters={(
          <div className="pd-business-screen__filters">
            <Combobox
              label="Źródło danych"
              options={sourceOptions}
              placeholder="Wybierz źródło"
              value={source}
              onChange={setSource}
            />
            <DateRangePicker
              label="Zakres danych"
              presets={dateRangePresets}
              timezone={range.timezone}
              value={range}
              onChange={setRange}
            />
          </div>
        )}
        onClearFilters={() => {
          setQuery('');
          setSource('all');
          setRange(defaultDateRange);
        }}
        onRemoveFilter={(filterId) => {
          if (filterId === 'source') {
            setSource('all');
          }
        }}
      />

      {data ? (
        <div className="pd-business-screen__layout">
          <section
            aria-label="Podsumowanie"
            className="pd-business-screen__metrics"
          >
            <MetricCard
              label="Gotowe obszary"
              metricId={`${definition.id}-ready`}
              sparklinePoints={[2, 3, 4, data.summary.ready]}
              status={dataState}
              statusLabel={resolveDataStateLabel(dataState)}
              targetLabel={`Cel: ${data.summary.total}`}
              value={`${data.summary.ready}/${data.summary.total}`}
              comparison={{
                direction: data.summary.warning > 0 ? 'flat' : 'up',
                label: `${data.summary.warning} ostrzeżeń`,
              }}
            />
            <MetricCard
              emphasis={data.summary.critical > 0 ? 'alert' : 'default'}
              label="Ryzyka krytyczne"
              metricId={`${definition.id}-critical`}
              sparklinePoints={[0, 1, data.summary.critical]}
              status={data.summary.critical > 0 ? 'partial' : dataState}
              statusLabel={data.summary.critical > 0 ? 'Wymaga uwagi' : 'Brak blokad'}
              value={`${data.summary.critical}`}
              comparison={{
                direction: data.summary.critical > 0 ? 'down' : 'flat',
                label: 'Wpływ na readiness',
              }}
            />
            <MetricCard
              label="Ostatnia aktualizacja"
              metricId={`${definition.id}-freshness`}
              sourceLabel={data.operationId}
              status={dataState}
              statusLabel={formatDateTime(data.generatedAt)}
              value={formatShortTime(data.generatedAt)}
            />
          </section>

          <section className="pd-business-screen__main">
            {renderPrimaryContent({
              campaignRows,
              commandRows,
              data,
              dataState,
              definition,
              query,
            })}
          </section>

          <aside
            aria-label="Kontekst decyzji"
            className="pd-business-screen__side"
          >
            {renderSideContent(data, definition)}
          </aside>
        </div>
      ) : (
        <Panel
          bordered
          collapsed={false}
          collapsible={false}
          padding="lg"
          title={loading ? 'Ładowanie danych' : 'Brak danych produkcyjnych'}
          tone={problem ? 'critical' : 'data'}
        >
          <InlineNotice
            message={
              loading
                ? 'Frontend czeka na odpowiedź z BFF dla wskazanego operationId.'
                : 'Runtime nie używa danych demo. Ekran zostanie wypełniony dopiero po poprawnej odpowiedzi API.'
            }
            title={loading ? 'Odczyt w toku' : 'Dane wymagane'}
            tone={problem ? 'critical' : 'info'}
          />
        </Panel>
      )}
    </section>
  );
}

function renderCommandCenterOverview({
  data,
  dataState,
  definition,
  loading,
  mode,
  onReload,
  problem,
}: {
  readonly data: Extract<
    BusinessScreenData,
    { readonly group: 'command-center' }
  > | null;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly loading: boolean;
  readonly mode: BusinessScreenMode;
  readonly onReload: BusinessScreenProps['onReload'];
  readonly problem: string | null;
}) {
  const issueList = problem
    ? [
        {
          id: `${definition.id}-api-problem`,
          label: 'Odczyt danych jest niedostępny',
          severity: 'critical' as const,
        },
      ]
    : buildIssues(data);
  const rows = data
    ? buildCommandRows(data.records, '')
    : [];
  const attentionCount = data
    ? countAttentionRecords(data.records)
    : 0;

  return (
    <section
      aria-busy={loading || undefined}
      aria-label="Centrum Dowodzenia: Widok główny"
      className="pd-business-screen pd-business-screen--overview"
      data-mode={mode}
      data-screen-id={definition.id}
    >
      <PageHeader
        breadcrumbs={[
          {
            href: '/app',
            label: 'Aplikacja',
          },
          {
            href: '/app/command-center',
            label: 'Centrum Dowodzenia',
          },
          {
            href: null,
            label: definition.displayTitle,
          },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
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
      />

      {problem ? (
        <InlineNotice
          message={problem}
          title="Nie udało się odświeżyć widoku"
          tone="critical"
        />
      ) : null}

      {data ? (
        <>
          <section
            aria-label="Najważniejsze sygnały"
            className="pd-command-overview__brief"
          >
            <MorningBrief
              context={defaultWorkspaceContext}
              dataReadiness={resolveSummaryReadiness(data)}
              decisionsDue={attentionCount}
              highlights={buildHighlights(data.records)}
            />
          </section>

          <section
            aria-label="Stan danych"
            className="pd-command-overview__status"
          >
            <DataStatusBanner
              blockingIssues={issueList}
              context={defaultWorkspaceContext}
              readiness={resolveReadinessState(dataState)}
              sources={[...data.sources]}
            />
          </section>

          <section
            aria-label="Podsumowanie kondycji"
            className="pd-command-overview__metrics"
          >
            <MetricCard
              label="Gotowe obszary"
              metricId={`${definition.id}-ready`}
              status={dataState}
              statusLabel={resolveDataStateLabel(dataState)}
              targetLabel={`Cel: ${data.summary.total}`}
              value={`${data.summary.ready}/${data.summary.total}`}
              comparison={{
                direction: data.summary.warning > 0 ? 'flat' : 'up',
                label: `${data.summary.warning} ostrzeżeń`,
              }}
            />

            <MetricCard
              emphasis={data.summary.critical > 0 ? 'alert' : 'default'}
              label="Wymagają uwagi"
              metricId={`${definition.id}-attention`}
              status={data.summary.critical > 0 ? 'partial' : dataState}
              statusLabel={
                data.summary.critical > 0
                  ? 'Wymaga reakcji'
                  : resolveDataStateLabel(dataState)
              }
              value={`${data.summary.warning + data.summary.critical}`}
              comparison={{
                direction: data.summary.critical > 0 ? 'down' : 'flat',
                label: `${data.summary.critical} krytyczne`,
              }}
            />

            <MetricCard
              freshnessLabel={formatDateTime(data.generatedAt)}
              label="Ostatnia aktualizacja"
              metricId={`${definition.id}-freshness`}
              status={dataState}
              statusLabel={resolveDataStateLabel(dataState)}
              value={formatShortTime(data.generatedAt)}
            />
          </section>

          <section
            aria-labelledby="command-overview-kpi-title"
            className="pd-command-overview__register"
          >
            <header className="pd-command-overview__section-header">
              <div>
                <p>KPI i kondycja</p>
                <h2 id="command-overview-kpi-title">
                  Najważniejsze wyniki
                </h2>
              </div>
              <span>{rows.length} metryk</span>
            </header>

            {renderCommandOverviewTable(rows)}
          </section>
        </>
      ) : (
        <Panel
          bordered
          collapsed={false}
          collapsible={false}
          padding="lg"
          title={loading ? 'Pobieramy aktualny stan' : 'Brak danych dla widoku'}
          tone={problem ? 'critical' : 'data'}
        >
          <InlineNotice
            message={
              loading
                ? 'Widok zachowuje układ bez prezentowania fałszywych zer.'
                : 'Dane pojawią się po poprawnej odpowiedzi źródeł dla bieżącego workspace.'
            }
            title={loading ? 'Odświeżanie danych' : 'Dane wymagane'}
            tone={problem ? 'critical' : 'info'}
          />
        </Panel>
      )}
    </section>
  );
}

function renderPrimaryContent({
  campaignRows,
  commandRows,
  data,
  dataState,
  definition,
}: {
  readonly campaignRows: readonly DataRow[];
  readonly commandRows: readonly DataRow[];
  readonly data: BusinessScreenData;
  readonly dataState: AnalyticsDataState;
  readonly definition: BusinessScreenDefinition;
  readonly query: string;
}) {
  if (data.group === 'campaigns') {
    return (
      <>
        <ChartFrame
          businessQuestion="Jak płatne kanały wpływają na sprzedaż?"
          freshnessLabel={formatDateTime(data.generatedAt)}
          rangeLabel={formatDateRange(defaultDateRange)}
          sourceLabel="ads.spend_normalized"
          status={dataState}
          statusLabel={resolveDataStateLabel(dataState)}
          title="Wynik kampanii"
          visualization={(
            <ComparisonChart
              ariaLabel="Porównanie kosztu, przychodu i ROAS kampanii"
              data={data.records.map((record) => ({
                id: record.campaignId,
                label: record.name,
                values: {
                  revenue: record.revenue.amount,
                  spend: record.spend.amount,
                },
              }))}
              series={[
                {
                  key: 'revenue',
                  label: 'Przychód',
                },
                {
                  key: 'spend',
                  label: 'Koszt',
                },
              ]}
              unit="PLN"
              valueFormatter={formatCurrency}
              variant="grouped"
            />
          )}
          visualizationLabel="Wykres kampanii"
          alternativeTable={renderCampaignTable(campaignRows)}
        />
        {renderCampaignVariant(data, definition, campaignRows)}
      </>
    );
  }

  return (
    <>
      <ChartFrame
        businessQuestion="Czy wynik bieżącego okresu realizuje plan?"
        freshnessLabel={formatDateTime(data.generatedAt)}
        rangeLabel={formatDateRange(defaultDateRange)}
        sourceLabel="orders.daily_fact"
        status={dataState}
        statusLabel={resolveDataStateLabel(dataState)}
        title="Trend wyniku i planu"
        visualization={(
          <TrendChart
            ariaLabel="Trend wyniku względem planu"
            data={businessTrendSeries[0]?.points.map((point, index) => ({
              actual: point.y,
              label: point.x,
              plan: businessTrendSeries[1]?.points[index]?.y ?? null,
            })) ?? []}
            unit="PLN"
            valueFormatter={formatCurrency}
            variant="area"
          />
        )}
        visualizationLabel="Wykres trendu"
        alternativeTable={renderCommandTable(commandRows)}
      />
      {renderCommandVariant(data, definition, commandRows)}
    </>
  );
}

function renderCommandVariant(
  data: Extract<BusinessScreenData, { readonly group: 'command-center' }>,
  definition: BusinessScreenDefinition,
  rows: readonly DataRow[],
) {
  switch (definition.variant) {
    case 'overview':
      return renderCommandTable(rows);
    case 'attention':
    case 'sales-signals':
      return (
        <DecisionQueue
          context={defaultWorkspaceContext}
          decisions={buildDecisionQueue(data.records)}
          onOpenDecision={() => undefined}
        />
      );
    case 'kpi':
    case 'traffic':
    case 'products':
    case 'customers':
      return (
        <div className="pd-business-screen__stack">
          {renderCommandTable(rows)}
          <InlineNotice
            message={
              definition.variant === 'customers'
                ? 'Widok klientów pokazuje wyłącznie agregaty i pseudonimizowane segmenty; dane osobowe nie są prezentowane.'
                : 'Tabela jest alternatywą tekstową dla wykresu i zachowuje sortowanie oraz status danych.'
            }
            title={definition.variant === 'customers' ? 'Privacy by design' : 'Alternatywa danych'}
            tone="info"
          />
        </div>
      );
    case 'plan':
      return (
        <PlanPerformance
          actualSeries={businessTrendSeries[0] ?? emptySeries('actual')}
          context={defaultWorkspaceContext}
          gapToTarget={72400}
          pace="ahead"
          planSeries={businessTrendSeries[1] ?? emptySeries('plan')}
        />
      );
    case 'drivers':
      return (
        <ResultDrivers
          baselineValue={840000}
          context={defaultWorkspaceContext}
          currentValue={912400}
          drivers={[
            {
              contribution: 57000,
              direction: 'positive',
              evidence: [...data.evidence],
              id: 'driver-search',
              label: 'Search high intent',
            },
            {
              contribution: 39000,
              direction: 'positive',
              evidence: [...data.evidence],
              id: 'driver-margin',
              label: 'Mix produktów o wyższej marży',
            },
            {
              contribution: -23600,
              direction: 'negative',
              evidence: [...data.evidence],
              id: 'driver-meta',
              label: 'Wzrost CPA Meta',
            },
          ]}
        />
      );
    case 'sales-sources':
      return (
        <SalesSources
          compareToPrevious
          context={defaultWorkspaceContext}
          sources={[
            {
              channel: 'Google Ads',
              id: 'google-ads',
              margin: 34,
              orders: 2180,
              readiness: 'ready',
              revenue: 421000,
            },
            {
              channel: 'Meta Ads',
              id: 'meta-ads',
              margin: 29,
              orders: 1390,
              readiness: 'partial',
              revenue: 256000,
            },
            {
              channel: 'Organic',
              id: 'organic',
              margin: 38,
              orders: 740,
              readiness: 'ready',
              revenue: 147000,
            },
          ]}
        />
      );
    case 'funnel':
      return (
        <div className="pd-business-screen__stack">
          <FunnelChart
            orientation="horizontal"
            showDropoff
            steps={data.funnelSteps.map((step) => ({
              conversionRate: step.conversionRate,
              id: step.stepId,
              label: step.label,
              value: step.completions,
            }))}
          />
          <div className="pd-business-screen__cards">
            {data.funnelSteps.map((step) => (
              <FunnelStep
                key={step.stepId}
                context={defaultWorkspaceContext}
                conversionRate={step.conversionRate}
                conversions={step.completions}
                label={step.label}
                stepId={step.stepId}
                visitors={step.entrants}
              />
            ))}
          </div>
        </div>
      );
    case 'recommendations':
      return (
        <div className="pd-business-screen__cards">
          {data.recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.recommendationId}
              context={defaultWorkspaceContext}
              effort="medium"
              evidence={[...data.evidence]}
              impact={recommendation.impact}
              recommendationId={recommendation.recommendationId}
              risk="medium"
              title={recommendation.title}
              onApprove={() => undefined}
              onReject={() => undefined}
            />
          ))}
        </div>
      );
    case 'waterfall':
      return (
        <WaterfallChart
          items={data.waterfall.map((item) => ({
            id: item.key,
            kind: item.value < 0 ? 'decrease' : item.key === 'actual' ? 'total' : 'increase',
            label: item.label,
            value: item.value,
          }))}
          showCumulative
          unit="currency"
        />
      );
    default:
      return renderCommandTable(rows);
  }
}

function renderCampaignVariant(
  data: Extract<BusinessScreenData, { readonly group: 'campaigns' }>,
  definition: BusinessScreenDefinition,
  rows: readonly DataRow[],
) {
  switch (definition.variant) {
    case 'campaign-overview':
      return (
        <div className="pd-business-screen__stack">
          <ShareChart
            ariaLabel="Udział kampanii w przychodzie"
            display="donut"
            segments={data.records.map((record) => ({
              id: record.campaignId,
              label: record.name,
              percent: resolveShare(record.revenue.amount, sumCampaignRevenue(data.records)),
              value: record.revenue.amount,
            }))}
            total={sumCampaignRevenue(data.records)}
            valueFormatter={formatCurrency}
          />
          {renderCampaignTable(rows)}
        </div>
      );
    case 'campaign-list':
      return renderCampaignTable(rows);
    case 'campaign-detail':
      return (
        <DetailPanel
          open
          recordId={data.records[0]?.campaignId ?? 'campaign'}
          sections={buildCampaignDetailSections(data.records[0] ?? null)}
          title={data.records[0]?.name ?? 'Szczegóły kampanii'}
          width="lg"
        />
      );
    case 'attribution':
      return (
        <AttributionComparison
          context={defaultWorkspaceContext}
          models={data.attribution.map((item) => ({
            confidence: Math.max(item.contribution, 0.68),
            id: item.source,
            label: `${item.source} · ${item.model}`,
            revenue: item.revenue.amount,
            roas: item.orders > 0 ? item.revenue.amount / item.orders / 100 : 0,
          }))}
          selectedModelId={data.attribution[0]?.source ?? 'data-driven'}
        />
      );
    case 'budget':
      return (
        <BudgetPacing
          actualSpend={data.records[0]?.spend.amount ?? 0}
          campaignId={data.records[0]?.campaignId ?? 'campaign'}
          context={defaultWorkspaceContext}
          evidence={[...data.evidence]}
          forecastSpend={165000}
          plannedSpend={data.records[0]?.budget.amount ?? 1}
          recommendation="Utrzymaj Search, ogranicz prospecting o 8% do czasu poprawy CPA."
          status="onPace"
          onCreateDecision={() => undefined}
        />
      );
    case 'diagnostics':
      return (
        <Panel
          bordered
          collapsed={false}
          collapsible={false}
          padding="lg"
          title="Macierz diagnostyczna"
          tone="warning"
        >
          <ul className="pd-business-screen__diagnostics">
            {data.diagnostics.map((finding) => (
              <li key={finding.findingId} data-severity={finding.severity}>
                <strong>{finding.code}</strong>
                <span>{finding.message}</span>
                <small>{finding.sourceRef ?? 'brak źródła'}</small>
              </li>
            ))}
          </ul>
        </Panel>
      );
    default:
      return renderCampaignTable(rows);
  }
}

function renderSideContent(
  data: BusinessScreenData,
  definition: BusinessScreenDefinition,
) {
  return (
    <div className="pd-business-screen__stack">
      <EvidencePanel
        confidence={resolveConfidence(data)}
        context={defaultWorkspaceContext}
        evidence={[...data.evidence]}
        sources={[...data.sources]}
      />
      {data.recommendations[0] ? (
        <RecommendationCard
          context={defaultWorkspaceContext}
          effort="medium"
          evidence={[...data.evidence]}
          impact={data.recommendations[0].impact}
          recommendationId={data.recommendations[0].recommendationId}
          risk={definition.group === 'campaigns' ? 'high' : 'medium'}
          title={data.recommendations[0].title}
          onApprove={() => undefined}
          onReject={() => undefined}
        />
      ) : null}
    </div>
  );
}

function renderCommandOverviewTable(rows: readonly DataRow[]) {
  return (
    <DataTable
      ariaLabel="KPI Centrum Dowodzenia"
      columns={commandColumns}
      density="compact"
      emptyMessage="Brak KPI dla bieżącego widoku."
      loading={false}
      minWidth={720}
      pagination={{
        cursor: null,
        loading: false,
        nextCursor: null,
        previousCursor: null,
        summary: `${rows.length} metryk`,
      }}
      rowCount={rows.length}
      rowHeaderColumnId="label"
      rows={rows}
      selectedRowIds={[]}
      sort={{
        columnId: 'value',
        direction: 'desc',
      }}
      statusColumn={{
        columnId: 'readinessLabel',
        label: 'Readiness',
        mapTone: readinessToneMap,
      }}
      summary={`${rows.length} najważniejszych metryk w bieżącym widoku.`}
    />
  );
}

function renderCommandTable(rows: readonly DataRow[]) {
  return (
    <DataTable
      actionsMenuItems={() => [
        {
          id: 'open',
          label: 'Otwórz szczegóły',
        },
        {
          id: 'evidence',
          label: 'Pokaż dowody',
        },
      ]}
      ariaLabel="Tabela metryk Centrum Dowodzenia"
      columns={commandColumns}
      emptyMessage="Nie ma metryk dla tego filtra."
      loading={false}
      minWidth={760}
      pagination={{
        cursor: null,
        loading: false,
        nextCursor: null,
        previousCursor: null,
        summary: `${rows.length} metryk`,
      }}
      rowCount={rows.length}
      rowHeaderColumnId="label"
      rows={rows}
      selectedRowIds={[]}
      sort={{
        columnId: 'value',
        direction: 'desc',
      }}
      statusColumn={{
        columnId: 'readinessLabel',
        label: 'Readiness',
        mapTone: readinessToneMap,
      }}
      summary={`${rows.length} metryk w bieżącym widoku.`}
    />
  );
}

function renderCampaignTable(rows: readonly DataRow[]) {
  return (
    <DataTable
      actionsMenuItems={() => [
        {
          id: 'open',
          label: 'Otwórz kampanię',
        },
        {
          id: 'budget',
          label: 'Sprawdź budżet',
        },
      ]}
      ariaLabel="Tabela kampanii płatnych"
      columns={campaignColumns}
      emptyMessage="Nie ma kampanii dla tego filtra."
      loading={false}
      minWidth={820}
      pagination={{
        cursor: null,
        loading: false,
        nextCursor: null,
        previousCursor: null,
        summary: `${rows.length} kampanii`,
      }}
      rowCount={rows.length}
      rowHeaderColumnId="name"
      rows={rows}
      selectedRowIds={[]}
      sort={{
        columnId: 'roas',
        direction: 'desc',
      }}
      statusColumn={{
        columnId: 'status',
        label: 'Status kampanii',
        mapTone: campaignStatusToneMap,
      }}
      summary={`${rows.length} kampanii w bieżącym widoku.`}
    />
  );
}

function buildCommandRows(
  records: readonly CommandCenterRecord[],
  query: string,
): readonly DataRow[] {
  return records
    .filter((record) => matchesQuery(record.label, query))
    .map((record) => ({
      delta: record.delta === null ? '—' : formatSignedPercent(record.delta),
      id: record.metricId,
      label: record.label,
      readinessLabel: resolveReadinessLabel(record.readiness),
      target: record.target === null ? '—' : formatMetricValue(record.target, record.unit),
      value: formatMetricValue(record.value, record.unit),
    }));
}

function buildCampaignRows(
  records: readonly CampaignsRecord[],
  query: string,
): readonly DataRow[] {
  return records
    .filter((record) => matchesQuery(`${record.name} ${record.channel}`, query))
    .map((record) => ({
      channel: resolveCampaignChannel(record.channel),
      id: record.campaignId,
      name: record.name,
      revenue: formatCurrency(record.revenue.amount),
      roas: record.roas === null ? '—' : formatNumber(record.roas),
      spend: formatCurrency(record.spend.amount),
      status: resolveCampaignStatus(record.status),
    }));
}

function buildHighlights(
  records: readonly CommandCenterRecord[],
) {
  return [...records]
    .sort((left, right) => {
      const readinessDelta = Number(left.readiness === 'ready')
        - Number(right.readiness === 'ready');

      if (readinessDelta !== 0) {
        return readinessDelta;
      }

      return (left.delta ?? 0) - (right.delta ?? 0);
    })
    .slice(0, 3)
    .map((record) => ({
      id: record.metricId,
      metric: `${formatMetricValue(record.value, record.unit)} · ${resolveReadinessLabel(record.readiness)}`,
      severity: record.readiness === 'ready'
        ? 'info' as const
        : 'warning' as const,
      title: record.label,
    }));
}

function countAttentionRecords(
  records: readonly CommandCenterRecord[],
): number {
  return records.filter((record) => (
    record.readiness !== 'ready'
    || (record.delta ?? 0) < 0
  )).length;
}

function buildDecisionQueue(
  records: readonly CommandCenterRecord[],
) {
  return records
    .filter((record) => record.readiness !== 'ready' || (record.delta ?? 0) < 0)
    .slice(0, 4)
    .map((record) => ({
      dueAt: '2026-08-13',
      id: record.metricId,
      owner: 'Owner Growth',
      priority: record.readiness === 'stale' ? 'high' as const : 'medium' as const,
      status: 'new' as const,
      title: `Sprawdź: ${record.label}`,
    }));
}

function buildCampaignDetailSections(
  record: CampaignsRecord | null,
) {
  if (!record) {
    return [
      {
        fields: [
          {
            label: 'Stan',
            value: 'Brak rekordu',
          },
        ],
        id: 'empty',
        title: 'Kampania',
      },
    ];
  }

  return [
    {
      fields: [
        {
          label: 'Kanał',
          value: resolveCampaignChannel(record.channel),
        },
        {
          label: 'Status',
          value: resolveCampaignStatus(record.status),
        },
        {
          label: 'Budżet',
          value: formatCurrency(record.budget.amount),
        },
      ],
      id: 'overview',
      title: 'Podsumowanie',
    },
    {
      fields: [
        {
          label: 'Koszt',
          value: formatCurrency(record.spend.amount),
        },
        {
          label: 'Przychód',
          value: formatCurrency(record.revenue.amount),
        },
        {
          label: 'ROAS',
          value: record.roas === null ? '—' : formatNumber(record.roas),
        },
      ],
      id: 'performance',
      title: 'Wynik',
    },
  ];
}

function buildIssues(
  data: BusinessScreenData | null,
) {
  if (!data) {
    return [];
  }

  if (data.summary.critical > 0) {
    return [
      {
        id: `${data.operationId}-critical`,
        label: `${data.summary.critical} blokady krytyczne`,
        severity: 'critical' as const,
      },
    ];
  }

  if (data.summary.warning > 0) {
    return [
      {
        id: `${data.operationId}-warning`,
        label: `${data.summary.warning} ostrzeżenia danych`,
        severity: 'warning' as const,
      },
    ];
  }

  return [];
}

function resolveDataState({
  data,
  loading,
  problem,
}: {
  readonly data: BusinessScreenData | null;
  readonly loading: boolean;
  readonly problem: string | null;
}): AnalyticsDataState {
  if (loading) {
    return 'loading';
  }

  if (problem) {
    return 'error';
  }

  if (!data || data.summary.total === 0) {
    return 'noData';
  }

  if (data.summary.critical > 0) {
    return 'partial';
  }

  if (data.summary.warning > 0) {
    return 'stale';
  }

  return 'ready';
}

function resolveDataStateLabel(
  state: AnalyticsDataState,
): string {
  switch (state) {
    case 'ready':
      return 'Dane aktualne';
    case 'loading':
      return 'Ładowanie';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'error':
      return 'Błąd źródła';
    case 'noData':
      return 'Brak danych';
    default:
      return state;
  }
}

function resolveReadinessState(
  state: AnalyticsDataState,
): ReadinessState {
  switch (state) {
    case 'ready':
      return 'ready';
    case 'loading':
      return 'processing';
    case 'partial':
      return 'partial';
    case 'stale':
      return 'stale';
    case 'error':
      return 'sourceError';
    case 'noData':
      return 'noData';
    default:
      return 'partial';
  }
}

function resolveSummaryReadiness(
  data: BusinessScreenData,
): ReadinessState {
  if (data.summary.critical > 0) {
    return 'partial';
  }

  if (data.summary.warning > 0) {
    return 'stale';
  }

  return 'ready';
}

function resolveReadinessLabel(
  readiness: ReadinessStatus,
): string {
  switch (readiness) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'unavailable':
      return 'Niedostępne';
    default:
      return readiness;
  }
}

function resolveCampaignChannel(value: CampaignsRecord['channel']): string {
  switch (value) {
    case 'googleAds':
      return 'Google Ads';
    case 'metaAds':
      return 'Meta Ads';
    case 'tiktokAds':
      return 'TikTok Ads';
    case 'other':
      return 'Inne';
    default:
      return value;
  }
}

function resolveCampaignStatus(value: CampaignsRecord['status']): string {
  switch (value) {
    case 'active':
      return 'Aktywna';
    case 'draft':
      return 'Draft';
    case 'paused':
      return 'Pauza';
    case 'ended':
      return 'Zakończona';
    default:
      return value;
  }
}

function formatMetricValue(
  value: number,
  unit: CommandCenterRecord['unit'],
): string {
  switch (unit) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return formatPercent(value);
    case 'ratio':
      return formatNumber(value);
    case 'duration':
      return `${formatNumber(value)} min`;
    case 'number':
    default:
      return formatNumber(value);
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    currency: 'PLN',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(Math.abs(value) <= 1 ? value : value / 100);
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? '+' : '';

  return `${sign}${formatPercent(value)}`;
}

function formatDateRange(range: DateRange): string {
  return `${range.from} - ${range.to}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatShortTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function matchesQuery(
  value: string,
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL');

  if (!normalizedQuery) {
    return true;
  }

  return value.toLocaleLowerCase('pl-PL').includes(normalizedQuery);
}

function resolveConfidence(data: BusinessScreenData): number {
  const values = data.evidence.flatMap((item) => (
    typeof item.confidence === 'number' ? [item.confidence] : []
  ));

  if (values.length === 0) {
    return data.summary.critical > 0 ? 0.68 : 0.86;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function emptySeries(id: string) {
  return {
    id,
    label: id,
    points: [],
  };
}

function sumCampaignRevenue(records: readonly CampaignsRecord[]): number {
  return records.reduce((sum, record) => sum + record.revenue.amount, 0);
}

function resolveShare(
  value: number,
  total: number,
): number {
  return total > 0 ? (value / total) * 100 : 0;
}
