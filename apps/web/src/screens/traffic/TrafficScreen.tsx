import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import type {
  CSSProperties,
  ReactNode,
} from 'react';
import type { DateRange } from '../../../../../contracts/ui-contract-types';
import {
  useEffect,
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
  DateRangePicker,
  Drawer,
  ExplorerTable,
  Icon,
  MetricCard,
  Panel,
  Popover,
  PriorityBand,
  ProductSectionFrame,
  ProductSectionTopbar,
} from '../../design-system';
import type {
  ExplorerTableColumn,
} from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { overviewRangeLabel } from '../command-center/CommandCenterScreen.data';
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
  trafficChannelRows,
  trafficDefaultFilters,
  trafficDeviceRows,
  trafficFunnelSteps,
  trafficGeoRows,
  trafficKpis,
  trafficSections,
  trafficSectionsById,
  trafficTrendModes,
} from './TrafficScreen.data';
import type {
  LandingPageRow,
  LandingPageTone,
  PapaTerminalType,
  TrafficBacklogFilter,
  TrafficChannelQuality,
  TrafficChannelRow,
  TrafficGlobalFilters,
  TrafficSectionId,
  TrafficTone,
  TrafficTrendMode,
} from './TrafficScreen.data';
import {
  defaultTrafficAnalysis,
  deriveTrafficAnalysis,
  trafficTrendChartData,
  type TrafficAnalysis,
} from './TrafficAnalysis.data';
import './TrafficScreen.css';

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

export function TrafficScreen() {
  const [activeSection, setActiveSection] = useState<TrafficSectionId>(trafficSections[0]!.id);
  const [expandedSections, setExpandedSections] = useState<Set<TrafficSectionId>>(
    () => new Set(trafficSections.map((section) => section.id)),
  );
  const [filters, setFilters] = useState<TrafficGlobalFilters>(trafficDefaultFilters);
  const [chartMetric, setChartMetric] = useState<TrafficTrendMode>('sessions');
  const [landingFilter, setLandingFilter] = useState<LandingPageTone>('all');
  const [selectedLandingPath, setSelectedLandingPath] = useState<string | null>(null);
  const [funnelCompletionRate, setFunnelCompletionRate] = useState<number>(funnelScenario.baseCompletionRate);
  const [backlogFilter, setBacklogFilter] = useState<TrafficBacklogFilter>('all');
  const [terminalType, setTerminalType] = useState<PapaTerminalType>('ready');
  const [toast, setToast] = useState('Sekcja Ruch na stronie gotowa');
  const { dateRange, setDateRange } = useShellDateRange();
  const [dateOpen, setDateOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const analysis = deriveTrafficAnalysis(dateRange);
  useAssistantAnalysisContext({ title: 'Ruch na stronie', route: '/app/traffic', readiness: analysis.valid ? 'partial' : 'empty', source: 'Model demonstracyjny ruchu',
    metrics: { Sesje: analysis.sessions, Zakupy: analysis.purchases, 'Przychód (PLN)': analysis.revenue },
    tables: ['Kanały', 'Strony wejścia', 'Geografia'], charts: ['Trend ruchu'] });

  const selectedLandingPage = landingPageRows.find((page) => page.path === selectedLandingPath) ?? null;
  const allSectionsExpanded = trafficSections.every((section) => expandedSections.has(section.id));

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0];

      if (visibleSection?.target.id) {
        setActiveSection(visibleSection.target.id as TrafficSectionId);
      }
    }, {
      rootMargin: '-112px 0px -62% 0px',
      threshold: [0, 0.08],
    });

    trafficSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  function setSectionExpanded(sectionId: TrafficSectionId, expanded: boolean) {
    setExpandedSections((currentSections) => {
      const nextSections = new Set(currentSections);
      if (expanded) nextSections.add(sectionId);
      else nextSections.delete(sectionId);
      return nextSections;
    });
  }

  function handleToggleAllSections() {
    setExpandedSections(new Set(allSectionsExpanded
      ? []
      : trafficSections.map((section) => section.id)));
  }

  function handleSectionChange(sectionId: TrafficSectionId) {
    setActiveSection(sectionId);
    setSectionExpanded(sectionId, true);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showMobileFunnel() {
    setFilters({
      ...filters,
      deviceFilter: 'mobile',
    });
    setToast('Wyświetlono kontekst mobile funnel');
    setSectionExpanded('lejek', true);
    globalThis.document?.getElementById(trafficSectionsById.lejek.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function showPaidCampaignsNotice() {
    setToast('Moduł Kampanie Płatne (ID-2): spend, ROAS, CPC, CPM oraz atrybucja płatna');
  }

  function exportTrafficCsv() {
    const header = 'Data,Sesje,Zakupy GA4,Przychód GA4 (PLN)';
    const rows = analysis.days.map((day) => `${day.date},${day.sessions},${day.purchases},${day.revenue}`);
    downloadCsv(
      [header, ...rows].join('\n'),
      `ruch-na-stronie-${dateRange.from}-${dateRange.to}.csv`,
    );
    setToast(`Eksport CSV przygotowany: ${analysis.days.length} dni, ${overviewRangeLabel(dateRange)}`);
  }

  function refreshTrafficData() {
    setLastSyncedAt(new Date());
    setToast('Dane GA4 zostały odświeżone. Synchronizacja aktualna: przed chwilą');
  }

  return (
    <div className="pd-tbi" data-testid="traffic-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        actions={(
          <button
            className="pd-tbi-section-nav-toggle"
            onClick={handleToggleAllSections}
            type="button"
          >
            {allSectionsExpanded ? 'Zwiń szczegóły' : 'Rozwiń wszystkie'}
          </button>
        )}
        ariaLabel="Sekcje Ruchu"
        items={trafficSections.map((section) => ({ icon: section.icon, id: section.id, label: section.navLabel }))}
        onActiveIdChange={(sectionId) => handleSectionChange(sectionId as TrafficSectionId)}
      />

      <TrafficHeader
        dateOpen={dateOpen}
        dateRange={dateRange}
        freshnessLabel={lastSyncedAt ? 'przed chwilą' : '14 min temu'}
        onDateOpenChange={setDateOpen}
        onDateRangeChange={setDateRange}
        onExport={exportTrafficCsv}
        onRefresh={refreshTrafficData}
        rangeValid={analysis.valid}
      />
      {!analysis.valid && (
        <p className="pd-tbi-inline-alert" role="alert">
          Wybrany okres jest nieprawidłowy (od 1 do 366 dni). Metryki i trend poniżej pokazują ostatni poprawny zakres.
        </p>
      )}
      <div className="pd-tbi__content">
        <TrafficResultSection
          analysis={analysis}
          expanded={expandedSections.has('wynik')}
          metric={chartMetric}
          onExpandedChange={(expanded) => setSectionExpanded('wynik', expanded)}
          onOpenAnalysis={() => {
            setTerminalType('mobile_drop');
            setToast('Wygenerowano pełną analizę Papa AI dla mobile drop');
          }}
          onMetricChange={setChartMetric}
          onShowMobileFunnel={showMobileFunnel}
        />
        <TrafficChannelExplorer
          channelFilter={filters.channelFilter}
          expanded={expandedSections.has('kanaly')}
          onExpandedChange={(expanded) => setSectionExpanded('kanaly', expanded)}
          onPaidCampaignsNotice={showPaidCampaignsNotice}
        />
        <TrafficLandingPageExplorer
          expanded={expandedSections.has('strony')}
          filter={landingFilter}
          onExpandedChange={(expanded) => setSectionExpanded('strony', expanded)}
          onFilterChange={setLandingFilter}
          onOpenLandingPage={setSelectedLandingPath}
        />
        <TrafficFunnelSimulation
          completionRate={funnelCompletionRate}
          expanded={expandedSections.has('lejek')}
          onCompletionRateChange={setFunnelCompletionRate}
          onExpandedChange={(expanded) => setSectionExpanded('lejek', expanded)}
        />
        <TrafficDeviceGeoPerformance
          expanded={expandedSections.has('urzadzenia')}
          onExpandedChange={(expanded) => setSectionExpanded('urzadzenia', expanded)}
        />
        <TrafficTrackingQuality
          expanded={expandedSections.has('jakosc')}
          onExpandedChange={(expanded) => setSectionExpanded('jakosc', expanded)}
        />
        <TrafficGovernanceBacklog
          expanded={expandedSections.has('alerty')}
          filter={backlogFilter}
          onExpandedChange={(expanded) => setSectionExpanded('alerty', expanded)}
          onFilterChange={setBacklogFilter}
        />
        <TrafficPapaTerminal
          expanded={expandedSections.has('papa-ai')}
          onExpandedChange={(expanded) => setSectionExpanded('papa-ai', expanded)}
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
    </div>
  );
}

function TrafficHeader({
  dateOpen = false,
  dateRange,
  freshnessLabel = '14 min temu',
  onDateOpenChange = noop,
  onDateRangeChange = noop,
  onExport = noop,
  onRefresh = noop,
  rangeValid = true,
}: {
  readonly dateOpen?: boolean;
  readonly dateRange?: DateRange;
  readonly freshnessLabel?: string;
  readonly onDateOpenChange?: (open: boolean) => void;
  readonly onDateRangeChange?: (range: DateRange) => void;
  readonly onExport?: () => void;
  readonly onRefresh?: () => void;
  readonly rangeValid?: boolean;
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
              GA4 Status: <strong>Świeże ({freshnessLabel})</strong>
            </span>
            <span className="pd-tbi-header-pill">
              Pokrycie zakupów: <strong>94,3%</strong>
            </span>
            {dateRange && (
              <Popover
                anchorId="traffic-date-trigger"
                title="Okres ruchu"
                modal={false}
                placement="bottom-end"
                open={dateOpen}
                onOpenChange={onDateOpenChange}
                trigger={(
                  <Button variant="secondary" size="small">
                    {overviewRangeLabel(dateRange)} <span aria-hidden="true">⌄</span>
                  </Button>
                )}
              >
                <DateRangePicker
                  label="Okres ruchu"
                  value={dateRange}
                  timezone={dateRange.timezone}
                  onChange={onDateRangeChange}
                  presets={[
                    { label: 'Ostatnie 7 dni', value: 'last7d' },
                    { label: 'Ostatnie 30 dni', value: 'last30d' },
                    { label: 'Ostatnie 90 dni', value: 'last90d' },
                    { label: 'Własny okres', value: 'custom' },
                  ]}
                />
                {!rangeValid && <p role="alert">Wybierz okres od 1 do 366 dni.</p>}
                <Button size="small" disabled={!rangeValid} onClick={() => onDateOpenChange(false)}>
                  Gotowe
                </Button>
              </Popover>
            )}
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

function TrafficSectionFrame({
  accentClassName,
  actions = null,
  children,
  collapsedSummary,
  description,
  expanded = true,
  onExpandedChange = noop,
  section,
}: {
  readonly accentClassName?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly collapsedSummary: string;
  readonly description?: ReactNode;
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly section: typeof trafficSections[number];
}) {
  const bodyId = `pd-tbi-${section.id}-content`;

  return (
    <ProductSectionFrame
      accentClassName={accentClassName}
      actions={(
        <>
          {expanded ? actions : null}
          <button
            aria-controls={bodyId}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Zwiń' : 'Rozwiń'} sekcję ${section.title}`}
            className="pd-tbi-section-toggle"
            onClick={() => onExpandedChange(!expanded)}
            type="button"
          >
            <span className="pd-tbi-section-toggle__label">{expanded ? 'Zwiń' : 'Rozwiń'}</span>
            <span aria-hidden="true" className="pd-tbi-section-toggle__icon">
              <svg height="14" viewBox="0 0 24 24" width="14">
                <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </button>
        </>
      )}
      className="pd-tbi-section-frame"
      data-collapsed={expanded ? undefined : 'true'}
      description={expanded ? (
        description ? <span>{description}</span> : null
      ) : (
        <span className="pd-tbi-section-summary">{collapsedSummary}</span>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {expanded ? (
        <div className="pd-tbi-section-content" id={bodyId}>{children}</div>
      ) : null}
    </ProductSectionFrame>
  );
}

export function TrafficResultSection({
  analysis = defaultTrafficAnalysis,
  expanded = true,
  metric = 'sessions',
  onExpandedChange = noop,
  onMetricChange = noop,
  onOpenAnalysis = noop,
  onShowMobileFunnel = noop,
}: {
  readonly analysis?: TrafficAnalysis;
  readonly expanded?: boolean;
  readonly metric?: TrafficTrendMode;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onMetricChange?: (metric: TrafficTrendMode) => void;
  readonly onOpenAnalysis?: () => void;
  readonly onShowMobileFunnel?: () => void;
}) {
  const section = trafficSectionsById.wynik;

  return (
    <TrafficSectionFrame
      collapsedSummary="Sprawdź, czy ruch dowozi wynik, czy problem leży w konwersji"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <TrafficPrioritySignal
        onOpenAnalysis={onOpenAnalysis}
        onShowMobileFunnel={onShowMobileFunnel}
      />
      <TrafficKpiScorecard analysis={analysis} />
      <TrafficTrendDynamics analysis={analysis} metric={metric} onMetricChange={onMetricChange} />
    </TrafficSectionFrame>
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
            className="pd-tbi-priority-action pd-tbi-priority-action--primary"
            onClick={onShowMobileFunnel}
            startIcon={<Icon decorative name="billing" size={16} />}
            variant="ghost"
          >
            Pokaż lejek mobile
          </Button>
          <Button
            className="pd-tbi-priority-action"
            onClick={onOpenAnalysis}
            startIcon={<Icon decorative name="assistant" size={16} />}
            variant="ghost"
          >
            Pełna analiza Papa AI
          </Button>
        </>
      )}
      badgeLabel="Diagnostyka Papa AI"
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

function trafficPlNumber(value: number) {
  return value.toLocaleString('pl-PL', { useGrouping: true });
}

function trafficTrendPercent(current: number, previous: number) {
  const pct = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '→';
  return { arrow, text: `${arrow} ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` };
}

function trafficTrendPoints(current: number, previous: number) {
  const delta = current - previous;
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '→';
  return { arrow, text: `${arrow} ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} pp` };
}

function trafficKpiValue(
  title: (typeof trafficKpis)[number]['title'],
  analysis: TrafficAnalysis,
): { readonly value: string; readonly trend: string; readonly note: string } {
  const { previous } = analysis;
  switch (title) {
    case 'Sesje': {
      const t = trafficTrendPercent(analysis.sessions, previous.sessions);
      return { value: trafficPlNumber(analysis.sessions), trend: t.text, note: 'vs poprz. okres' };
    }
    case 'Aktywni Użytkownicy': {
      const t = trafficTrendPercent(analysis.activeUsers, previous.activeUsers);
      return { value: trafficPlNumber(analysis.activeUsers), trend: t.text, note: 'unikalni w okresie' };
    }
    case 'CR Zakupowy': {
      const t = trafficTrendPoints(analysis.crPct, previous.crPct);
      return { value: `${analysis.crPct.toFixed(2)}%`, trend: t.text, note: 'vs poprz. okres' };
    }
    case 'Zakupy (GA4)': {
      const t = trafficTrendPercent(analysis.purchases, previous.purchases);
      return { value: trafficPlNumber(analysis.purchases), trend: t.text, note: 'vs poprz. okres' };
    }
    case 'Przychód GA4': {
      const t = trafficTrendPercent(analysis.revenue, previous.revenue);
      return { value: `${trafficPlNumber(Math.round(analysis.revenue))} zł`, trend: t.text, note: 'vs poprz. okres' };
    }
    case 'Przychód / Sesję': {
      const delta = analysis.revPerSession - previous.revPerSession;
      const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '→';
      return {
        value: `${analysis.revPerSession.toFixed(2)} zł`,
        trend: `${arrow} ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} zł`,
        note: 'vs poprz. okres',
      };
    }
    default:
      return { value: '—', trend: '→ 0', note: '' };
  }
}

export function TrafficKpiScorecard({
  analysis = defaultTrafficAnalysis,
}: {
  readonly analysis?: TrafficAnalysis;
}) {
  return (
    <Panel
      bordered={false}
      collapsed={false}
      collapsible={false}
      padding="md"
      title="Główny Wynik Ruchu i Konwersji (Kluczowe KPI)"
    >
      <div className="pd-tbi-kpi-grid">
        {trafficKpis.map((kpi) => {
          const trendTone = kpi.trendTone;
          const computed = trafficKpiValue(kpi.title, analysis);
          return (
            <MetricCard
              comparison={{ direction: trafficTrendDirection(computed.trend), label: `${computed.trend.replace(/^[▲▼→]\s*/, '')} ${computed.note}` }}
              helpText={kpi.description}
              key={kpi.title}
              label={kpi.title}
              metricId={`traffic-kpi-${kpi.title}`}
              signal={trendTone === 'emerald' ? 'positive' : trendTone === 'rose' ? 'negative' : trendTone === 'amber' ? 'warning' : 'neutral'}
              sourceLabel={`${kpi.footerLeft} · ${kpi.footerRight}`}
              status="ready"
              statusLabel={kpi.badge}
              value={computed.value}
            />
          );
        })}
      </div>
    </Panel>
  );
}

export function TrafficTrendDynamics({
  analysis = defaultTrafficAnalysis,
  metric = 'sessions',
  onMetricChange = noop,
}: {
  readonly analysis?: TrafficAnalysis;
  readonly metric?: TrafficTrendMode;
  readonly onMetricChange?: (metric: TrafficTrendMode) => void;
}) {
  const chartData = useMemo(() => trafficTrendChartData(analysis, metric), [analysis, metric]);
  const metricLabel = trafficTrendModes.find((mode) => mode.value === metric)?.label ?? metric;

  return (
    <section className="pd-tbi-panel">
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Trend Ruchu i Konwersji w Czasie</h2>
          <p>Wybierz metrykę, aby przeanalizować dzienną lub tygodniową dynamikę onsite oraz porównać z poprzednim okresem.</p>
        </div>

        <div className="pd-tbi-segmented pd-tbi-segmented--trend" role="group" aria-label="Metryka trendu">
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
        aria-label={`Trend ruchu: ${metricLabel}`}
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
                name === 'current' ? `Aktualny okres (${analysis.dayCount} dni)` : `Poprzedni okres (${analysis.dayCount} dni)`,
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

type TrafficChannelExplorerRow = TrafficChannelRow & { readonly id: string };

export function TrafficChannelExplorer({
  channelFilter = 'all',
  expanded = true,
  onExpandedChange = noop,
  onPaidCampaignsNotice = noop,
}: {
  readonly channelFilter?: TrafficGlobalFilters['channelFilter'];
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onPaidCampaignsNotice?: () => void;
}) {
  const filteredRows: readonly TrafficChannelExplorerRow[] = useMemo(() => trafficChannelRows
    .filter((channel) => channelFilter === 'all' || channel.group === channelFilter)
    .map((channel) => ({ ...channel, id: channel.group })), [channelFilter]);
  const section = trafficSectionsById.kanaly;

  const columns: readonly ExplorerTableColumn<TrafficChannelExplorerRow>[] = [
    {
      id: 'group',
      label: 'Grupa Kanałów / Source / Medium',
      render: (row) => <strong>{row.group}</strong>,
      required: true,
      sortAccessor: (row) => row.group,
    },
    {
      align: 'right',
      csvValue: (row) => row.sessions,
      id: 'sessions',
      label: 'Sesje',
      render: (row) => formatNumber(row.sessions),
      sortAccessor: (row) => row.sessions,
    },
    {
      align: 'right',
      csvValue: (row) => row.users,
      id: 'users',
      label: 'Użytkownicy (Exact)',
      render: (row) => formatNumber(row.users),
      sortAccessor: (row) => row.users,
    },
    {
      align: 'right',
      csvValue: (row) => row.purchases,
      id: 'purchases',
      label: 'Zakupy GA4',
      render: (row) => formatNumber(row.purchases),
      sortAccessor: (row) => row.purchases,
    },
    {
      align: 'right',
      csvValue: (row) => formatPercent(row.cr),
      id: 'cr',
      label: 'CR Zakupu',
      render: (row) => (
        <span className={row.cr >= 3 ? 'pd-tbi-text-emerald' : row.cr < 1 ? 'pd-tbi-text-rose' : undefined}>
          {formatPercent(row.cr)}
        </span>
      ),
      sortAccessor: (row) => row.cr,
    },
    {
      align: 'right',
      csvValue: (row) => row.revenue,
      id: 'revenue',
      label: 'Przychód GA4',
      render: (row) => formatMoney(row.revenue),
      sortAccessor: (row) => row.revenue,
    },
    {
      align: 'right',
      csvValue: (row) => row.revPerSession,
      id: 'revPerSession',
      label: 'Przychód / Sesja',
      render: (row) => <strong>{formatDecimalMoney(row.revPerSession)}</strong>,
      sortAccessor: (row) => row.revPerSession,
    },
    {
      csvValue: (row) => row.quality,
      id: 'quality',
      label: 'Jakość / Ocena',
      render: (row) => <QualityBadge quality={row.quality} />,
    },
  ];

  return (
    <TrafficSectionFrame
      collapsedSummary={`${filteredRows.length} kanałów widocznych · sesje, zakupy i przychód bez mieszania spendu`}
      description="Które źródła ruchu dowożą sesje, zakupy i przychód bez mieszania spendu i ROAS?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Ekosystem Kanałów Ruchu (Channel Mix Taxonomy)</h2>
          <p>Hierarchia kanałów znormalizowana według reguł PapaData taxonomy (GA4 Default Channel Grouping). Nie klasyfikujemy Google Organic jako Paid!</p>
        </div>
      </div>

      <ExplorerTable
        ariaLabel="Kanały ruchu"
        columns={columns}
        rows={filteredRows}
        searchFields={['group']}
        searchLabel="Szukaj kanału lub źródła"
        searchPlaceholder="Szukaj kanału / źródła..."
      />

      <div className="pd-tbi-semantic-note">
        <p><strong>Uwaga semantyczna:</strong> Wiersz <strong>Unassigned (3.2%)</strong> odzwierciedla ruch bez poprawnych parametrów UTM. Nagły wzrost tego wskaźnika generuje alert jakości danych.</p>
        <button className="pd-tbi-link-button" onClick={onPaidCampaignsNotice} type="button">
          Przejdź do Kampanii Płatnych (Spend & ROAS) ➔
        </button>
      </div>
    </TrafficSectionFrame>
  );
}

const landingPageColumns: readonly ExplorerTableColumn<(typeof landingPageRows)[number] & { readonly id: string }>[] = [
  {
    csvValue: (row) => row.path,
    id: 'path',
    label: 'Ścieżka Strony (Page Path)',
    render: (row) => <code>{row.path}</code>,
    required: true,
    sortAccessor: (row) => row.path,
  },
  {
    csvValue: (row) => row.sessions,
    id: 'sessions',
    label: 'Sesje',
    render: (row) => formatNumber(row.sessions),
    sortAccessor: (row) => row.sessions,
  },
  {
    csvValue: (row) => row.users,
    id: 'users',
    label: 'Użytkownicy',
    render: (row) => formatNumber(row.users),
    sortAccessor: (row) => row.users,
  },
  {
    csvValue: (row) => row.cr ?? '',
    id: 'cr',
    label: 'CR Zakupu',
    render: (row) => formatNullablePercent(row.cr),
    sortAccessor: (row) => row.cr ?? -1,
  },
  {
    csvValue: (row) => row.revenue,
    id: 'revenue',
    label: 'Przychód GA4',
    render: (row) => formatMoney(row.revenue),
    sortAccessor: (row) => row.revenue,
  },
  {
    csvValue: (row) => row.revPerSession ?? '',
    id: 'revPerSession',
    label: 'Przychód / Sesję',
    render: (row) => (row.revPerSession === null ? 'N/A' : formatDecimalMoney(row.revPerSession)),
    sortAccessor: (row) => row.revPerSession ?? -1,
  },
  {
    csvValue: (row) => row.mobileRatio,
    id: 'mobileRatio',
    label: 'Udział Mobile',
    render: (row) => <span className={row.mobileRatio > 70 ? 'pd-tbi-text-amber' : undefined}>{row.mobileRatio}% Mobile</span>,
    sortAccessor: (row) => row.mobileRatio,
  },
];

const landingPageRowActions = [{ id: 'details', label: 'Otwórz szczegóły' }];

const trafficGeoColumns: readonly ExplorerTableColumn<(typeof trafficGeoRows)[number] & { readonly id: string }>[] = [
  {
    csvValue: (row) => row.country,
    id: 'country',
    label: 'Kraj (Country)',
    render: (row) => <><span className="pd-tbi-flag">{row.flag}</span>{row.country}</>,
    required: true,
    sortAccessor: (row) => row.country,
  },
  {
    csvValue: (row) => row.sessions,
    id: 'sessions',
    label: 'Sesje',
    render: (row) => row.sessions,
  },
  {
    csvValue: (row) => row.cr,
    id: 'cr',
    label: 'CR Zakupu',
    render: (row) => <span className={`pd-tbi-text-${row.tone}`}>{row.cr}</span>,
  },
  {
    csvValue: (row) => row.revenue,
    id: 'revenue',
    label: 'Przychód GA4',
    render: (row) => row.revenue,
  },
];

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
  expanded = true,
  filter = 'all',
  onExpandedChange = noop,
  onFilterChange = noop,
  onOpenLandingPage = noop,
}: {
  readonly expanded?: boolean;
  readonly filter?: LandingPageTone;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onFilterChange?: (filter: LandingPageTone) => void;
  readonly onOpenLandingPage?: (path: string) => void;
}) {
  const filteredPages = useMemo(() => landingPageRows.filter((page) => {
    if (filter === 'all') return true;
    return page.tone === filter;
  }), [filter]);
  const section = trafficSectionsById.strony;

  return (
    <TrafficSectionFrame
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
      collapsedSummary={`${filteredPages.length} stron wejścia widocznych · sprawdź tracking i mobile`}
      description="Jakie strony wejścia przyjmują ruch i gdzie widać problemy z trackingiem lub mobile?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-tbi-panel__head">
        <div>
          <h2>Eksplorator Stron Wejścia (Landing Page Explorer)</h2>
          <p>Analiza skuteczności stron, na które trafiają użytkownicy. Kanał mówi skąd przyszli, a Landing Page mówi co zastali.</p>
        </div>
      </div>

      <ExplorerTable
        ariaLabel="Eksplorator stron wejścia"
        columns={landingPageColumns}
        exportFilenameBase="strony-wejscia"
        onRowAction={(rowId, actionId) => {
          if (actionId === 'details') onOpenLandingPage(rowId);
        }}
        onRowClick={(page) => onOpenLandingPage(page.path)}
        rowActions={() => landingPageRowActions}
        rows={filteredPages.map((page) => ({ ...page, id: page.path }))}
      />
    </TrafficSectionFrame>
  );
}

export function TrafficFunnelSimulation({
  completionRate = funnelScenario.baseCompletionRate,
  expanded = true,
  onCompletionRateChange = noop,
  onExpandedChange = noop,
}: {
  readonly completionRate?: number;
  readonly expanded?: boolean;
  readonly onCompletionRateChange?: (rate: number) => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const extraPurchases = Math.round(funnelScenario.checkoutSessions * ((completionRate - funnelScenario.baseCompletionRate) / 100));
  const extraRevenue = Math.round(extraPurchases * funnelScenario.aov);
  const section = trafficSectionsById.lejek;

  return (
    <TrafficSectionFrame
      collapsedSummary="Symulacja odzyskiwania porzuconych koszyków · efekt finansowy poprawy checkoutu"
      description="Na którym etapie sesje tracą zakup i jaki jest finansowy efekt poprawy checkoutu?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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
    </TrafficSectionFrame>
  );
}

export function TrafficDeviceGeoPerformance({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = trafficSectionsById.urzadzenia;

  return (
    <TrafficSectionFrame
      collapsedSummary="Wyniki wg urządzeń i rynków geograficznych"
      description="Jak zachowanie i przychód różnią się między urządzeniami oraz rynkami?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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

          <ExplorerTable
            ariaLabel="Geografia użytkowników"
            columns={trafficGeoColumns}
            exportFilenameBase="geografia-uzytkownikow"
            rows={trafficGeoRows.map((geo) => ({ ...geo, id: geo.country }))}
          />
        </section>
      </div>
    </TrafficSectionFrame>
  );
}

export function TrafficTrackingQuality({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = trafficSectionsById.jakosc;

  return (
    <TrafficSectionFrame
      actions={<span className="pd-tbi-status-pill pd-tbi-status-pill--emerald">Status Integracji: GA4 Production Ready</span>}
      collapsedSummary="Status integracji GA4: Production Ready · uzgodnienie z commerce"
      description="Czy dane GA4 są spójne z commerce i gotowe do decyzji operacyjnych?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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
    </TrafficSectionFrame>
  );
}

export function TrafficGovernanceBacklog({
  expanded = true,
  filter = 'all',
  onExpandedChange = noop,
  onFilterChange = noop,
}: {
  readonly expanded?: boolean;
  readonly filter?: TrafficBacklogFilter;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onFilterChange?: (filter: TrafficBacklogFilter) => void;
}) {
  const visibleRows = trafficBacklogRows.filter((row) => {
    if (filter === 'all') return true;
    return row.priority === filter;
  });
  const section = trafficSectionsById.alerty;

  return (
    <TrafficSectionFrame
      collapsedSummary={`${visibleRows.length} pozycji backlogu P0/P1 wymaga działania`}
      description="Jakie anomalie, błędy semantyczne i backlog P0/P1 wymagają działania?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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
    </TrafficSectionFrame>
  );
}

export function TrafficPapaTerminal({
  expanded = true,
  onExpandedChange = noop,
  onTerminalTypeChange = noop,
  terminalType = 'ready',
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onTerminalTypeChange?: (type: PapaTerminalType) => void;
  readonly terminalType?: PapaTerminalType;
}) {
  const report = papaTerminalReports[terminalType];
  const section = trafficSectionsById['papa-ai'];

  return (
    <TrafficSectionFrame
      collapsedSummary="Diagnostyka Papa AI: mobile drop, tracking gap, skoki direct"
      description="Jak Papa AI syntetyzuje diagnozy dla mobile, tracking gap i skoków direct?"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
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
    </TrafficSectionFrame>
  );
}

function TrafficLandingDrawer({
  landingPage,
  onClose,
}: {
  readonly landingPage: LandingPageRow | null;
  readonly onClose: () => void;
}) {
  return (
    <Drawer
      dismissible
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={landingPage !== null}
      primaryActionLabel="Zamknij Szczegóły Strony"
      side="right"
      title="Landing Page Drawer"
      width={560}
    >
      {landingPage && (
        <div className="pd-tbi-drawer-content">
          <div className="pd-tbi-drawer__head">
            <div>
              <span>Landing Page Drawer</span>
              <h3>{landingPage.path}</h3>
            </div>
          </div>

          <div className="pd-tbi-drawer-metrics">
            <MetricTile label="Sesje wejściowe" tone="slate" value={formatNumber(landingPage.sessions)} />
            <MetricTile label="CR Zakupu" tone="emerald" value={formatNullablePercent(landingPage.cr)} />
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
            <strong>Obserwacja Papa AI dla tej strony:</strong>
            <p>{landingDrawerInsight}</p>
          </div>
        </div>
      )}
    </Drawer>
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


function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
