import type {
  ChangeEvent,
  CSSProperties,
} from 'react';
import {
  useMemo,
  useState,
} from 'react';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  Icon,
  MetricCard,
  Panel,
  PriorityBand,
  ProductSectionFrame,
  ProductSectionTopbar,
} from '../../../design-system';
import {
  backlogFilterOptions,
  funnelScenario,
  landingDrawerInsight,
  landingDrawerSources,
  landingPageFilterOptions,
  landingPageRows,
  papaTerminalReports,
  trackingQualityCards,
  trafficBacklogRows,
  trafficChannelOptions,
  trafficChannelRows,
  trafficCompareOptions,
  trafficDefaultFilters,
  trafficDeviceOptions,
  trafficDeviceRows,
  trafficFunnelSteps,
  trafficGeoRows,
  trafficKpis,
  trafficSections,
  trafficSectionsById,
  trafficTimeRangeOptions,
  trafficTrendLabels,
  trafficTrendModes,
  trafficTrendSeries,
} from './TrafficBiPage.data';
import type {
  LandingPageRow,
  LandingPageTone,
  PapaTerminalType,
  TrafficBacklogFilter,
  TrafficChannelQuality,
  TrafficGlobalFilters,
  TrafficSectionId,
  TrafficTone,
  TrafficTrendMode,
} from './TrafficBiPage.data';
import './TrafficBiPage.css';

type TrafficChartPoint = {
  readonly current: number;
  readonly label: string;
  readonly previous: number;
};

const noop = () => undefined;

const chartColors = {
  amber: 'rgb(var(--pd-tbi-amber-600))',
  emerald: 'rgb(var(--pd-tbi-emerald-600))',
  indigo: 'rgb(var(--pd-tbi-indigo-600))',
  rose: 'rgb(var(--pd-tbi-rose-600))',
  slate: 'rgb(var(--pd-tbi-slate-500))',
} as const satisfies Record<TrafficTone, string>;

const tooltipStyle: CSSProperties = {
  background: 'rgb(58 58 54)',
  border: '1px solid rgb(96 96 88)',
  borderRadius: 'var(--pd-radius-control)',
  boxShadow: '0 14px 30px rgb(0 0 0 / 0.22)',
  color: 'white',
  fontSize: 12,
};

export function TrafficBiPage() {
  const [activeSection, setActiveSection] = useState<TrafficSectionId>(trafficSections[0]!.id);
  const [filters, setFilters] = useState<TrafficGlobalFilters>(trafficDefaultFilters);
  const [chartMetric, setChartMetric] = useState<TrafficTrendMode>('sessions');
  const [channelSearch, setChannelSearch] = useState('');
  const [landingFilter, setLandingFilter] = useState<LandingPageTone>('all');
  const [selectedLandingPath, setSelectedLandingPath] = useState<string | null>(null);
  const [funnelCompletionRate, setFunnelCompletionRate] = useState<number>(funnelScenario.baseCompletionRate);
  const [backlogFilter, setBacklogFilter] = useState<TrafficBacklogFilter>('all');
  const [terminalType, setTerminalType] = useState<PapaTerminalType>('ready');
  const [toast, setToast] = useState('Sekcja Ruch na stronie gotowa');

  const selectedLandingPage = landingPageRows.find((page) => page.path === selectedLandingPath) ?? null;

  function showMobileFunnel() {
    setFilters({
      ...filters,
      deviceFilter: 'mobile',
    });
    setToast('Wyświetlono kontekst mobile funnel');
    globalThis.document?.getElementById(trafficSectionsById.lejek.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function showPaidCampaignsNotice() {
    setToast('Moduł Kampanie Płatne (ID-2): spend, ROAS, CPC, CPM oraz atrybucja płatna');
  }

  return (
    <main className="pd-tbi" data-testid="traffic-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        ariaLabel="Sekcje Ruchu"
        items={trafficSections.map((section) => ({ icon: section.icon, id: section.id, label: section.navLabel }))}
        onActiveIdChange={(sectionId) => setActiveSection(sectionId as TrafficSectionId)}
      />

      <TrafficHeader
        onExport={() => setToast('Eksport CSV przygotowany dla kanałów ruchu')}
        onRefresh={() => setToast('Dane GA4 zostały odświeżone. Synchronizacja aktualna: 14 min temu')}
      />
      <TrafficGlobalControls
        filters={filters}
        onFilterChange={(nextFilters) => {
          setFilters(nextFilters);
          setToast('Zaktualizowano globalne filtry ruchu');
        }}
      />

      <div className="pd-tbi__content">
        <TrafficResultSection
          metric={chartMetric}
          onOpenAnalysis={() => {
            setTerminalType('mobile_drop');
            setToast('Wygenerowano pełną analizę Papa AI dla mobile drop');
          }}
          onMetricChange={setChartMetric}
          onShowMobileFunnel={showMobileFunnel}
        />
        <TrafficChannelExplorer
          channelFilter={filters.channelFilter}
          onPaidCampaignsNotice={showPaidCampaignsNotice}
          onSearchChange={setChannelSearch}
          searchValue={channelSearch}
        />
        <TrafficLandingPageExplorer
          filter={landingFilter}
          onFilterChange={setLandingFilter}
          onOpenLandingPage={setSelectedLandingPath}
        />
        <TrafficFunnelSimulation
          completionRate={funnelCompletionRate}
          onCompletionRateChange={setFunnelCompletionRate}
        />
        <TrafficDeviceGeoPerformance />
        <TrafficTrackingQuality />
        <TrafficGovernanceBacklog
          filter={backlogFilter}
          onFilterChange={setBacklogFilter}
        />
        <TrafficPapaTerminal
          onTerminalTypeChange={(nextType) => {
            setTerminalType(nextType);
            setToast(`Terminal Papa AI: ${papaTerminalReports[nextType].title}`);
          }}
          terminalType={terminalType}
        />
      </div>

      <TrafficFooter />
      <TrafficLandingDrawer
        landingPage={selectedLandingPage}
        onClose={() => setSelectedLandingPath(null)}
      />
      <TrafficToast message={toast} />
    </main>
  );
}

function TrafficHeader({
  onExport = noop,
  onRefresh = noop,
}: {
  readonly onExport?: () => void;
  readonly onRefresh?: () => void;
}) {
  return (
    <header className="pd-tbi-header">
      <div className="pd-tbi-header__inner">
        <div className="pd-tbi-header__top">
          <div className="pd-tbi-brand-block">
            <span className="pd-tbi-id">ID-6</span>
            <div>
              <div className="pd-tbi-title-row">
                <h1>Ruch na stronie</h1>
                <span>Website & Commerce Traffic Intelligence</span>
              </div>
              <p>Onsite Diagnostic & Behavioral Intelligence System</p>
            </div>
          </div>

          <div className="pd-tbi-header-actions">
            <span className="pd-tbi-header-pill pd-tbi-header-pill--fresh">
              <span className="pd-tbi-live-dot" />
              GA4 Status: <strong>Świeże (14 min temu)</strong>
            </span>
            <span className="pd-tbi-header-pill">
              Pokrycie zakupów: <strong>94,3%</strong>
            </span>
            <button className="pd-tbi-primary-button" onClick={onRefresh} type="button">
              <Icon decorative name="trend" size={16} />
              Odśwież
            </button>
            <button className="pd-tbi-muted-button pd-tbi-muted-button--dark" onClick={onExport} type="button">
              <Icon decorative name="data" size={16} />
              Eksport CSV
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function TrafficGlobalControls({
  filters = trafficDefaultFilters,
  onFilterChange = noop,
}: {
  readonly filters?: TrafficGlobalFilters;
  readonly onFilterChange?: (filters: TrafficGlobalFilters) => void;
}) {
  function update<K extends keyof TrafficGlobalFilters>(key: K, value: TrafficGlobalFilters[K]) {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="pd-tbi-control-bar" aria-label="Globalne filtry ruchu">
      <div className="pd-tbi-control-bar__inner">
        <div className="pd-tbi-filter-row">
          <SelectFilter
            label="Okres:"
            onChange={(event) => update('timeRange', event.target.value as TrafficGlobalFilters['timeRange'])}
            options={trafficTimeRangeOptions}
            value={filters.timeRange}
          />
          <SelectFilter
            label="Porównanie:"
            onChange={(event) => update('compare', event.target.value as TrafficGlobalFilters['compare'])}
            options={trafficCompareOptions}
            value={filters.compare}
          />
          <SelectFilter
            label="Kanał:"
            onChange={(event) => update('channelFilter', event.target.value as TrafficGlobalFilters['channelFilter'])}
            options={trafficChannelOptions}
            value={filters.channelFilter}
          />
          <SelectFilter
            label="Urządzenie:"
            onChange={(event) => update('deviceFilter', event.target.value as TrafficGlobalFilters['deviceFilter'])}
            options={trafficDeviceOptions}
            value={filters.deviceFilter}
          />
        </div>

        <div className="pd-tbi-scope-notice">
          <strong>Zakres:</strong>
          <span>Analiza zachowania Onsite (GA4). Wydatki i ROAS znajdziesz w module <strong>Kampanie Płatne (ID-2)</strong>.</span>
        </div>
      </div>
    </section>
  );
}

function SelectFilter<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  readonly label: string;
  readonly onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly options: readonly {
    readonly label: string;
    readonly value: TValue;
  }[];
  readonly value: TValue;
}) {
  return (
    <label className="pd-tbi-select-filter">
      <span>{label}</span>
      <select onChange={onChange} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TrafficResultSection({
  metric = 'sessions',
  onMetricChange = noop,
  onOpenAnalysis = noop,
  onShowMobileFunnel = noop,
}: {
  readonly metric?: TrafficTrendMode;
  readonly onMetricChange?: (metric: TrafficTrendMode) => void;
  readonly onOpenAnalysis?: () => void;
  readonly onShowMobileFunnel?: () => void;
}) {
  const section = trafficSectionsById.wynik;

  return (
    <ProductSectionFrame
      description="Czy ruch dowozi wynik, czy problem leży w konwersji i koszyku?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <TrafficPrioritySignal
        onOpenAnalysis={onOpenAnalysis}
        onShowMobileFunnel={onShowMobileFunnel}
      />
      <TrafficKpiScorecard />
      <TrafficTrendDynamics metric={metric} onMetricChange={onMetricChange} />
    </ProductSectionFrame>
  );
}

export function TrafficPrioritySignal({
  onOpenAnalysis = noop,
  onShowMobileFunnel = noop,
}: {
  readonly onOpenAnalysis?: () => void;
  readonly onShowMobileFunnel?: () => void;
}) {
  return (
    <PriorityBand
      actions={(
        <>
          <Button
            onClick={onShowMobileFunnel}
            startIcon={<Icon decorative name="billing" size={16} />}
            variant="primary"
          >
            Pokaż mobile funnel
          </Button>
          <Button
            onClick={onOpenAnalysis}
            startIcon={<Icon decorative name="assistant" size={16} />}
            variant="secondary"
          >
            Pełna analiza Papa AI
          </Button>
        </>
      )}
      badgeLabel="Papa AI Diagnostics"
      timestampLabel="Sygnał Operacyjny #T-842"
      title="Urządzenia mobilne odpowiadają za 71.4% ruchu, ale CR jest o 38.2% niższy niż desktop"
    >
      <p>
        Największa spadek konwersji występuje na etapie <strong>Rozpoczęcie checkoutu ➔ Zakup</strong> (-11.2 pp na urządzeniach mobilnych vs desktop). Ruch doprowadzony do sklepu nie jest problemem - wąskim gardłem jest proces płatności mobilnej.
      </p>
      <p className="pd-tbi-impact-row">
        <span>Potencjalny wpływ odzyskania mediany 90d: <strong>+84 000 - +116 000 zł / mies.</strong></span>
        <span>Pewność analizy: <strong>Wysoka (94%)</strong></span>
      </p>
    </PriorityBand>
  );
}

function trafficTrendDirection(trend: string): 'up' | 'down' | 'flat' {
  if (trend.startsWith('▲')) return 'up';
  if (trend.startsWith('▼')) return 'down';
  return 'flat';
}

export function TrafficKpiScorecard() {
  return (
    <Panel
      bordered={false}
      collapsed={false}
      collapsible={false}
      description="Kluczowe metryki diagnostyczne onsite. Każda metryka ma jawnie zdefiniowane źródło oraz agregację. Baza: GA4 + Commerce Reconciliation"
      padding="md"
      title="Główny Wynik Ruchu & Konwersji (Executive KPI)"
    >
      <div className="pd-tbi-kpi-grid">
        {trafficKpis.map((kpi) => {
          const isFeatured = 'featured' in kpi && kpi.featured === true;
          const trendTone = kpi.trendTone;
          return (
            <MetricCard
              comparison={{ direction: trafficTrendDirection(kpi.trend), label: `${kpi.trend.replace(/^[▲▼]\s*/, '')} ${kpi.note}` }}
              depth={isFeatured ? 'hero' : 'default'}
              key={kpi.title}
              label={kpi.title}
              metricId={`traffic-kpi-${kpi.title}`}
              signal={trendTone === 'emerald' ? 'positive' : trendTone === 'rose' ? 'negative' : trendTone === 'amber' ? 'warning' : 'neutral'}
              sourceLabel={`${kpi.footerLeft} · ${kpi.footerRight}`}
              status="ready"
              statusLabel={kpi.badge}
              value={kpi.value}
            />
          );
        })}
      </div>
    </Panel>
  );
}

export function TrafficTrendDynamics({
  metric = 'sessions',
  onMetricChange = noop,
}: {
  readonly metric?: TrafficTrendMode;
  readonly onMetricChange?: (metric: TrafficTrendMode) => void;
}) {
  const chartData = useMemo(() => buildTrendData(metric), [metric]);

  return (
    <section className="pd-tbi-panel">
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Trend Ruchu i Konwersji w Czasie (Traffic & Conversion Dynamics)</h2>
          <p>Wybierz metrykę, aby przeanalizować dzienną lub tygodniową dynamikę onsite oraz porównać z poprzednim okresem.</p>
        </div>

        <div className="pd-tbi-segmented" role="group" aria-label="Metryka trendu">
          {trafficTrendModes.map((mode) => (
            <button
              className={mode.value === metric ? 'is-active' : ''}
              key={mode.value}
              onClick={() => onMetricChange(mode.value)}
              type="button"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-label={`Trend ruchu: ${trafficTrendLabels[metric]}`}
        className="pd-tbi-chart"
        role="img"
      >
        <ResponsiveContainer height="100%" width="100%">
          <RechartsLineChart data={chartData} margin={{ bottom: 8, left: 0, right: 16, top: 12 }}>
            <CartesianGrid stroke="rgb(var(--pd-tbi-slate-100))" vertical={false} />
            <XAxis
              dataKey="label"
              interval={4}
              stroke="rgb(var(--pd-tbi-slate-400))"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="rgb(var(--pd-tbi-slate-400))"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => formatTrendValue(Number(value), metric)}
              tickLine={false}
              width={64}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                formatTrendValue(Number(value), metric),
                name === 'current' ? 'Aktualny okres (30 dni)' : 'Poprzedni okres (30 dni)',
              ]}
              labelStyle={{ color: 'rgb(227 216 201)', fontWeight: 800 }}
            />
            <Line
              activeDot={{ r: 6 }}
              dataKey="current"
              dot={{ r: 3 }}
              name="current"
              stroke={chartColors.indigo}
              strokeWidth={3}
              type="monotone"
            />
            <Line
              dataKey="previous"
              dot={false}
              name="previous"
              stroke="rgb(var(--pd-tbi-slate-300))"
              strokeDasharray="5 5"
              strokeWidth={2}
              type="monotone"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div className="pd-tbi-chart-note">
        <span><i className="pd-tbi-legend-dot pd-tbi-legend-dot--current" />Aktualny okres (30 dni)</span>
        <span><i className="pd-tbi-legend-dot pd-tbi-legend-dot--previous" />Poprzedni okres (30 dni)</span>
        <strong>Wskazówka: Spadek CR w dniach 14-18 zgadza się z aktualizacją mobile checkoutu.</strong>
      </div>
    </section>
  );
}

export function TrafficChannelExplorer({
  channelFilter = 'all',
  onPaidCampaignsNotice = noop,
  onSearchChange = noop,
  searchValue = '',
}: {
  readonly channelFilter?: TrafficGlobalFilters['channelFilter'];
  readonly onPaidCampaignsNotice?: () => void;
  readonly onSearchChange?: (value: string) => void;
  readonly searchValue?: string;
}) {
  const filteredRows = useMemo(() => trafficChannelRows.filter((channel) => {
    if (channelFilter !== 'all' && channel.group !== channelFilter) return false;
    return channel.group.toLowerCase().includes(searchValue.trim().toLowerCase());
  }), [channelFilter, searchValue]);
  const section = trafficSectionsById.kanaly;

  return (
    <ProductSectionFrame
      actions={(
        <input
          aria-label="Szukaj kanału lub źródła"
          className="pd-tbi-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Szukaj kanału / źródła..."
          type="search"
          value={searchValue}
        />
      )}
      description="Które źródła ruchu dowożą sesje, zakupy i przychód bez mieszania spendu i ROAS?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Ekosystem Kanałów Ruchu (Channel Mix Taxonomy)</h2>
          <p>Hierarchia kanałów znormalizowana według reguł PapaData taxonomy (GA4 Default Channel Grouping). Nie klasyfikujemy Google Organic jako Paid!</p>
        </div>
      </div>

      <div className="pd-tbi-table-wrap">
        <table className="pd-tbi-table">
          <thead>
            <tr>
              <th>Grupa Kanałów / Source / Medium</th>
              <th>Sesje</th>
              <th>Użytkownicy (Exact)</th>
              <th>Zakupy GA4</th>
              <th>Purchase CR</th>
              <th>Przychód GA4</th>
              <th>Przychód / Sesja</th>
              <th>Jakość / Ocena</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((channel) => (
              <tr key={channel.group}>
                <td><strong>{channel.group}</strong></td>
                <td>{formatNumber(channel.sessions)}</td>
                <td>{formatNumber(channel.users)}</td>
                <td>{formatNumber(channel.purchases)}</td>
                <td className={channel.cr >= 3 ? 'pd-tbi-text-emerald' : channel.cr < 1 ? 'pd-tbi-text-rose' : undefined}>{formatPercent(channel.cr)}</td>
                <td>{formatMoney(channel.revenue)}</td>
                <td><strong>{formatDecimalMoney(channel.revPerSession)}</strong></td>
                <td><QualityBadge quality={channel.quality} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pd-tbi-semantic-note">
        <p><strong>Uwaga semantyczna:</strong> Wiersz <strong>Unassigned (3.2%)</strong> odzwierciedla ruch bez poprawnych parametrów UTM. Nagły wzrost tego wskaźnika generuje alert jakości danych.</p>
        <button className="pd-tbi-link-button" onClick={onPaidCampaignsNotice} type="button">
          Przejdź do Kampanii Płatnych (Spend & ROAS) ➔
        </button>
      </div>
    </ProductSectionFrame>
  );
}

function QualityBadge({
  quality,
}: {
  readonly quality: TrafficChannelQuality;
}) {
  return (
    <span className={`pd-tbi-quality pd-tbi-quality--${quality.toLowerCase()}`}>
      {quality}
    </span>
  );
}

export function TrafficLandingPageExplorer({
  filter = 'all',
  onFilterChange = noop,
  onOpenLandingPage = noop,
}: {
  readonly filter?: LandingPageTone;
  readonly onFilterChange?: (filter: LandingPageTone) => void;
  readonly onOpenLandingPage?: (path: string) => void;
}) {
  const filteredPages = useMemo(() => landingPageRows.filter((page) => {
    if (filter === 'all') return true;
    return page.tone === filter;
  }), [filter]);
  const section = trafficSectionsById.strony;

  return (
    <ProductSectionFrame
      actions={(
        <div className="pd-tbi-segmented" role="group" aria-label="Filtr stron wejścia">
          {landingPageFilterOptions.map((option) => (
            <button
              className={filter === option.value ? 'is-active' : ''}
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      description="Jakie strony wejścia przyjmują ruch i gdzie widać problemy z trackingiem lub mobile?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Eksplorator Stron Wejścia (Landing Page Explorer)</h2>
          <p>Analiza skuteczności stron, na które trafiają użytkownicy. Kanał mówi skąd przyszli, a Landing Page mówi co zastali.</p>
        </div>
      </div>

      <div className="pd-tbi-table-wrap">
        <table className="pd-tbi-table">
          <thead>
            <tr>
              <th>Ścieżka Strony (Page Path)</th>
              <th>Sesje</th>
              <th>Użytkownicy</th>
              <th>Purchase CR</th>
              <th>Przychód GA4</th>
              <th>Przychód / Sesję</th>
              <th>Mobile Ratio</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr key={page.path}>
                <td><code>{page.path}</code></td>
                <td>{formatNumber(page.sessions)}</td>
                <td>{formatNumber(page.users)}</td>
                <td>{formatNullablePercent(page.cr)}</td>
                <td>{formatMoney(page.revenue)}</td>
                <td>{page.revPerSession === null ? 'N/A' : formatDecimalMoney(page.revPerSession)}</td>
                <td><span className={page.mobileRatio > 70 ? 'pd-tbi-text-amber' : undefined}>{page.mobileRatio}% Mobile</span></td>
                <td>
                  <button className="pd-tbi-row-button" onClick={() => onOpenLandingPage(page.path)} type="button">
                    Szczegóły ➔
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProductSectionFrame>
  );
}

export function TrafficFunnelSimulation({
  completionRate = funnelScenario.baseCompletionRate,
  onCompletionRateChange = noop,
}: {
  readonly completionRate?: number;
  readonly onCompletionRateChange?: (rate: number) => void;
}) {
  const extraPurchases = Math.round(funnelScenario.checkoutSessions * ((completionRate - funnelScenario.baseCompletionRate) / 100));
  const extraRevenue = Math.round(extraPurchases * funnelScenario.aov);
  const section = trafficSectionsById.lejek;

  return (
    <ProductSectionFrame
      description="Na którym etapie sesje tracą zakup i jaki jest finansowy efekt poprawy checkoutu?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Spójny Lejek Konwersji Onsite (Session-Scoped Funnel)</h2>
          <p>Jednolita populacja sesji przechodząca przez kolejne etapy e-commerce. Nie łączymy kliknięć reklam z koszykami sklepowymi!</p>
        </div>
        <span className="pd-tbi-status-pill pd-tbi-status-pill--emerald">Jednostka: Sesje unikalne etapu</span>
      </div>

      <div className="pd-tbi-funnel-grid">
        {trafficFunnelSteps.map((step) => (
          <article className={`pd-tbi-funnel-step pd-tbi-funnel-step--${step.tone}`} key={step.step}>
            <span>{step.step}</span>
            <h3>{step.label}</h3>
            <strong>{step.value}</strong>
            <p>{step.meta}</p>
            <div className="pd-tbi-progress">
              <i style={{ width: `${step.progress}%` }} />
            </div>
          </article>
        ))}
      </div>

      <div className="pd-tbi-simulator">
        <div className="pd-tbi-simulator__head">
          <h3>Kalkulator Scenariuszowy Odzyskiwania Porzuconych Koszyków</h3>
          <span>Model estymacji finansowej scenariusza (Scenariusz ≠ Fakt)</span>
        </div>

        <div className="pd-tbi-simulator__grid">
          <label className="pd-tbi-slider-label">
            <span>Symulacja poprawy Checkout Completion Rate:</span>
            <div>
              <input
                max={funnelScenario.maxCompletionRate}
                min={funnelScenario.baseCompletionRate}
                onChange={(event) => onCompletionRateChange(Number(event.target.value))}
                step="0.5"
                type="range"
                value={completionRate}
              />
              <strong>{completionRate.toFixed(1)}%</strong>
            </div>
          </label>
          <MetricTile
            label="Dodatkowe odzyskane zakupy:"
            tone="emerald"
            value={`+${formatNumber(extraPurchases)} zamówień`}
          />
          <MetricTile
            label={`Szacowany dodatkowy przychód (AOV ${funnelScenario.aov} zł):`}
            tone="emerald"
            value={`+${formatMoney(extraRevenue)} / mies.`}
          />
        </div>
      </div>
    </ProductSectionFrame>
  );
}

export function TrafficDeviceGeoPerformance() {
  const section = trafficSectionsById.urzadzenia;

  return (
    <ProductSectionFrame
      description="Jak zachowanie i przychód różnią się między urządzeniami oraz rynkami?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-tbi-split">
        <section className="pd-tbi-panel">
          <div className="pd-tbi-panel__head pd-tbi-panel__head--simple">
            <div>
              <h2>Urządzenia (Device Performance Matrix)</h2>
              <p>Segmentacja zachowania użytkowników według urządzeń z bazy FactAnalyticsDaily (deviceCategory).</p>
            </div>
          </div>

          <div className="pd-tbi-device-list">
            {trafficDeviceRows.map((device) => (
              <article className="pd-tbi-device-card" key={device.label}>
                <div>
                  <div className="pd-tbi-device-card__title">
                    <span className="pd-tbi-device-icon">{device.icon}</span>
                    <strong>{device.label}</strong>
                    <em className={`pd-tbi-badge pd-tbi-badge--${device.tone}`}>{device.share}</em>
                  </div>
                  <p>Sesje: {device.sessions} | Użytkownicy: {device.users}</p>
                </div>
                <div>
                  <strong className={`pd-tbi-text-${device.tone}`}>CR: {device.cr}</strong>
                  <span>Rev/Session: {device.revPerSession}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pd-tbi-panel">
          <div className="pd-tbi-panel__head pd-tbi-panel__head--simple">
            <div>
              <h2>Geografia (Geographic Markets)</h2>
              <p>Kraje pochodzenia użytkowników (dane FactAnalyticsDaily.country).</p>
            </div>
          </div>

          <div className="pd-tbi-table-wrap">
            <table className="pd-tbi-table">
              <thead>
                <tr>
                  <th>Kraj (Country)</th>
                  <th>Sesje</th>
                  <th>Purchase CR</th>
                  <th>Przychód GA4</th>
                </tr>
              </thead>
              <tbody>
                {trafficGeoRows.map((geo) => (
                  <tr key={geo.country}>
                    <td><span className="pd-tbi-flag">{geo.flag}</span>{geo.country}</td>
                    <td>{geo.sessions}</td>
                    <td className={`pd-tbi-text-${geo.tone}`}>{geo.cr}</td>
                    <td>{geo.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ProductSectionFrame>
  );
}

export function TrafficTrackingQuality() {
  const section = trafficSectionsById.jakosc;

  return (
    <ProductSectionFrame
      actions={<span className="pd-tbi-status-pill pd-tbi-status-pill--emerald">Status Integracji: GA4 Production Ready</span>}
      description="Czy dane GA4 są spójne z commerce i gotowe do decyzji operacyjnych?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Jakość Trackingu & Uzgodnienie Danych (Tracking Health & Reconciliation)</h2>
          <p>Diagnostyka poprawności spływu danych analitycznych oraz porównanie ze źródłem prawdy księgowej (Commerce FactOrder).</p>
        </div>
      </div>

      <div className="pd-tbi-quality-grid">
        {trackingQualityCards.map((card) => (
          <MetricTile
            key={card.label}
            label={card.label}
            meta={card.meta}
            tone={card.tone}
            value={card.value}
          />
        ))}
      </div>
    </ProductSectionFrame>
  );
}

export function TrafficGovernanceBacklog({
  filter = 'all',
  onFilterChange = noop,
}: {
  readonly filter?: TrafficBacklogFilter;
  readonly onFilterChange?: (filter: TrafficBacklogFilter) => void;
}) {
  const visibleRows = trafficBacklogRows.filter((row) => {
    if (filter === 'all') return true;
    return row.priority === filter;
  });
  const section = trafficSectionsById.alerty;

  return (
    <ProductSectionFrame
      description="Jakie anomalie, błędy semantyczne i backlog P0/P1 wymagają działania?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <section className="pd-tbi-governance">
        <div className="pd-tbi-governance__head">
          <div>
            <h2>Audyt Poprawności Semantycznej Danych i Rejestr P0/P1 Backlog</h2>
            <p>Przegląd naprawionych i planowanych problemów architektonicznych przed dalszą rozbudową UI.</p>
          </div>
          <div className="pd-tbi-segmented pd-tbi-segmented--dark" role="group" aria-label="Filtr backlogu">
            {backlogFilterOptions.map((option) => (
              <button
                className={filter === option.value ? 'is-active' : ''}
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pd-tbi-backlog-list">
          {visibleRows.map((item) => (
            <article className="pd-tbi-backlog-item" key={item.id}>
              <div>
                <div className="pd-tbi-backlog-item__title">
                  <span className={`pd-tbi-priority-tag pd-tbi-priority-tag--${item.priority.toLowerCase()}`}>{item.id}</span>
                  <strong>{item.title}</strong>
                </div>
                <p>{item.desc}</p>
              </div>
              <em>{item.status}</em>
            </article>
          ))}
        </div>
      </section>
    </ProductSectionFrame>
  );
}

export function TrafficPapaTerminal({
  onTerminalTypeChange = noop,
  terminalType = 'ready',
}: {
  readonly onTerminalTypeChange?: (type: PapaTerminalType) => void;
  readonly terminalType?: PapaTerminalType;
}) {
  const report = papaTerminalReports[terminalType];
  const section = trafficSectionsById['papa-ai'];

  return (
    <ProductSectionFrame
      actions={<span className="pd-tbi-status-pill">Context: traffic.overview</span>}
      description="Jak Papa AI syntetyzuje diagnozy dla mobile, tracking gap i skoków direct?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Terminal Diagnostyczny Papa AI (Traffic Intelligence Prompt)</h2>
          <p>Generowanie ustrukturyzowanej analizy z uwzględnieniem canonical screen traffic.overview.</p>
        </div>
      </div>

      <div className="pd-tbi-ai-actions">
        <button className="pd-tbi-primary-button" onClick={() => onTerminalTypeChange('mobile_drop')} type="button">
          <Icon decorative name="search" size={16} />
          Diagnoza Mobile CR Drop
        </button>
        <button className="pd-tbi-dark-button" onClick={() => onTerminalTypeChange('tracking_gap')} type="button">
          <Icon decorative name="security" size={16} />
          Diagnoza GA4 vs Commerce Gap
        </button>
        <button className="pd-tbi-dark-button" onClick={() => onTerminalTypeChange('direct_spike')} type="button">
          <Icon decorative name="integration" size={16} />
          Analiza Skoku Ruchu Direct
        </button>
      </div>

      <div className="pd-tbi-terminal" aria-live="polite">
        <div className="pd-tbi-terminal__title">[{report.contextLabel}] {terminalType === 'ready' ? report.title : null}</div>
        {report.lines.map((line) => (
          <p key={line.label}>
            <strong className={`pd-tbi-text-${line.tone}`}>{line.label}</strong>
            {' '}
            {line.value}
          </p>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

function TrafficLandingDrawer({
  landingPage,
  onClose,
}: {
  readonly landingPage: LandingPageRow | null;
  readonly onClose: () => void;
}) {
  if (!landingPage) return null;

  return (
    <div className="pd-tbi-drawer-overlay">
      <aside aria-label="Landing Page Drawer" className="pd-tbi-drawer" role="dialog">
        <div className="pd-tbi-drawer__body">
          <div className="pd-tbi-drawer__head">
            <div>
              <span>Landing Page Drawer</span>
              <h3>{landingPage.path}</h3>
            </div>
            <button aria-label="Zamknij drawer" onClick={onClose} type="button">×</button>
          </div>

          <div className="pd-tbi-drawer-metrics">
            <MetricTile label="Sesje wejściowe" tone="slate" value={formatNumber(landingPage.sessions)} />
            <MetricTile label="Purchase CR" tone="emerald" value={formatNullablePercent(landingPage.cr)} />
            <MetricTile label="Przychód GA4" tone="slate" value={formatMoney(landingPage.revenue)} />
            <MetricTile label="Przychód / Sesję" tone="indigo" value={landingPage.revPerSession === null ? 'N/A' : formatDecimalMoney(landingPage.revPerSession)} />
          </div>

          <div className="pd-tbi-drawer-section">
            <h4>Rozkład ruchu według źródła</h4>
            <div className="pd-tbi-source-list">
              {landingDrawerSources.map((source) => (
                <div key={source.label}>
                  <span>{source.label}:</span>
                  <strong>{source.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="pd-tbi-ai-insight">
            <strong>Papa AI Insight dla tej strony:</strong>
            <p>{landingDrawerInsight}</p>
          </div>
        </div>

        <div className="pd-tbi-drawer__footer">
          <button className="pd-tbi-dark-button" onClick={onClose} type="button">Zamknij Szczegóły Strony</button>
        </div>
      </aside>
    </div>
  );
}

function MetricTile({
  label,
  meta,
  tone,
  value,
}: {
  readonly label: string;
  readonly meta?: string;
  readonly tone: TrafficTone;
  readonly value: string;
}) {
  return (
    <article className={`pd-tbi-metric-tile pd-tbi-metric-tile--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {meta ? <small>{meta}</small> : null}
    </article>
  );
}

function TrafficFooter() {
  return (
    <footer className="pd-tbi-footer">
      <div>
        <strong>Website & Commerce Traffic Intelligence (ID-6)</strong>
        <span>Moduł Analityczny Onsite Analytics</span>
      </div>
      <p>Data Provenance: GA4 Connector (Production Ready) | Commerce FactOrder Reconciliation</p>
    </footer>
  );
}

function TrafficToast({
  message,
}: {
  readonly message: string;
}) {
  return (
    <output className="pd-tbi-toast" aria-live="polite">
      {message}
    </output>
  );
}

function buildTrendData(metric: TrafficTrendMode): TrafficChartPoint[] {
  const series = trafficTrendSeries[metric];

  return series.current.map((current, index) => ({
    current,
    label: `Dzień ${index + 1}`,
    previous: series.previous[index] ?? 0,
  }));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pl-PL').format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} zł`;
}

function formatDecimalMoney(value: number) {
  return `${value.toLocaleString('pl-PL', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} zł`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatNullablePercent(value: number | null) {
  if (value === null) return 'Brak danych (N/A)';
  return formatPercent(value);
}

function formatTrendValue(value: number, metric: TrafficTrendMode) {
  if (metric === 'cr') return `${value.toFixed(1)}%`;
  if (metric === 'revenue') return `${Math.round(value / 1000)}k zł`;
  if (metric === 'revPerSession') return `${value.toFixed(1)} zł`;

  return formatNumber(Math.round(value));
}
