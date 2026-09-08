import { useAssistantAnalysisContext } from '../../runtime/shell/papa-assistant/useAssistantAnalysisContext';
import type {
  ChangeEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  DateRangePicker,
  Dialog,
  Drawer,
  ExplorerTable,
  Icon,
  MetricCard,
  Panel,
  Popover,
  PriorityBand,
  ProductSectionFrame,
  ProductSectionTopbar,
  Select,
} from '../../design-system';
import type {
  ExplorerTableColumn,
} from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { overviewRangeLabel } from '../command-center/CommandCenterScreen.data';
import {
  customerAcquisitionRows,
  customerAffinity,
  customerAiInsights,
  customerCohortOptions,
  customerCohortRows,
  customerExplorerRows,
  customerFreshInsight,
  customerKpis,
  customerLtvPareto,
  customerParetoConcentration,
  customerProvenanceDict,
  customerRetentionCurve,
  customerRetentionLabels,
  customerRfmSegments,
  customerRiskFilterOptions,
  customerSections,
  customerSectionsById,
  customerSegmentFilterOptions,
  customerTrendModes,
} from './CustomersScreen.data';
import type {
  CustomerCohortSelection,
  CustomerExplorerRow,
  CustomerProvenanceKey,
  CustomerRiskStatus,
  CustomerSectionId,
  CustomerTrendMode,
  CustomersTone,
} from './CustomersScreen.data';
import {
  customerTrendChartData,
  defaultCustomerAnalysis,
  deriveCustomerAnalysis,
  representativeNewAov,
  representativeReturningAov,
  type CustomerAnalysis,
} from './CustomersAnalysis.data';
import './CustomersScreen.css';

type CustomerSegmentFilter = typeof customerSegmentFilterOptions[number]['value'];
type CustomerRiskFilter = typeof customerRiskFilterOptions[number]['value'];
type CustomerAiInsight = typeof customerAiInsights[number] | typeof customerFreshInsight;

const noop = () => undefined;

const chartColors = {
  amber: 'rgb(var(--pd-cbi-amber-600))',
  blue: 'rgb(var(--pd-cbi-blue-600))',
  cyan: 'rgb(var(--pd-cbi-cyan-600))',
  emerald: 'rgb(var(--pd-cbi-emerald-600))',
  indigo: 'rgb(var(--pd-cbi-indigo-600))',
  rose: 'rgb(var(--pd-cbi-rose-600))',
  slate: 'rgb(var(--pd-cbi-slate-500))',
  violet: 'rgb(var(--pd-cbi-violet-600))',
} as const satisfies Record<CustomersTone, string>;

export function CustomersScreen() {
  const [activeSection, setActiveSection] = useState<CustomerSectionId>(customerSections[0]!.id);
  const [expandedSections, setExpandedSections] = useState<Set<CustomerSectionId>>(
    () => new Set(customerSections.map((section) => section.id)),
  );
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegmentFilter>('all');
  const [riskFilter, setRiskFilter] = useState<CustomerRiskFilter>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<CustomerProvenanceKey | null>(null);
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [insights, setInsights] = useState<CustomerAiInsight[]>([...customerAiInsights]);
  const [preparedRetentionActions, setPreparedRetentionActions] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const { dateRange, setDateRange } = useShellDateRange();
  const [dateOpen, setDateOpen] = useState(false);
  const analysis = deriveCustomerAnalysis(dateRange);
  useAssistantAnalysisContext({ title: 'Klienci', route: '/app/customers', readiness: analysis.valid ? 'partial' : 'empty', source: 'Model demonstracyjny klientów',
    metrics: { 'Aktywni klienci': analysis.activeCustomers, 'Klienci w ryzyku': analysis.atRiskCustomers, 'LTV (PLN)': analysis.observedLtv },
    filters: { Segment: segmentFilter, Ryzyko: riskFilter }, tables: ['Eksplorator klientów'], charts: ['Trend klientów'] });

  const selectedCustomer = customerExplorerRows.find((customer) => customer.id === selectedCustomerId) ?? null;
  const allSectionsExpanded = customerSections.every((section) => expandedSections.has(section.id));

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0];

      if (visibleSection?.target.id) {
        setActiveSection(visibleSection.target.id as CustomerSectionId);
      }
    }, {
      rootMargin: '-112px 0px -62% 0px',
      threshold: [0, 0.08],
    });

    customerSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  function setSectionExpanded(sectionId: CustomerSectionId, expanded: boolean) {
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
      : customerSections.map((section) => section.id)));
  }

  function handleSectionChange(sectionId: CustomerSectionId) {
    setActiveSection(sectionId);
    setSectionExpanded(sectionId, true);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function filterAtRisk() {
    setRiskFilter('at_risk');
    setSegmentFilter('all');
  }

  function selectSegment(segmentName: string) {
    setSegmentFilter(toExplorerSegmentFilter(segmentName));
    setRiskFilter('all');
  }

  function generateFreshInsight() {
    setInsights([customerFreshInsight, ...insights]);
  }

  function prepareRetentionAction(customerId: string) {
    setPreparedRetentionActions((current) => new Set(current).add(customerId));
  }

  return (
    <div className="pd-cbi" data-testid="customers-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        actions={(
          <button
            className="pd-cbi-section-nav-toggle"
            onClick={handleToggleAllSections}
            type="button"
          >
            {allSectionsExpanded ? 'Zwiń szczegóły' : 'Rozwiń wszystkie'}
          </button>
        )}
        ariaLabel="Sekcje Klientów"
        items={customerSections.map((section) => ({ icon: section.icon, id: section.id, label: section.navLabel }))}
        onActiveIdChange={(sectionId) => handleSectionChange(sectionId as CustomerSectionId)}
      />

      <div className="pd-cbi__content">
        <div className="pd-cbi-page-head">
          <h1 className="pd-product-page-title">Klienci</h1>
          <Popover
            anchorId="customers-date-trigger"
            title="Okres klientów"
            modal={false}
            placement="bottom-end"
            open={dateOpen}
            onOpenChange={setDateOpen}
            trigger={(
              <Button variant="secondary" size="small">
                {overviewRangeLabel(dateRange)} <span aria-hidden="true">⌄</span>
              </Button>
            )}
          >
            <DateRangePicker
              label="Okres klientów"
              value={dateRange}
              timezone={dateRange.timezone}
              onChange={setDateRange}
              presets={[
                { label: 'Ostatnie 7 dni', value: 'last7d' },
                { label: 'Ostatnie 30 dni', value: 'last30d' },
                { label: 'Ostatnie 90 dni', value: 'last90d' },
                { label: 'Własny okres', value: 'custom' },
              ]}
            />
            {!analysis.valid && <p role="alert">Wybierz okres od 1 do 366 dni.</p>}
            <Button size="small" disabled={!analysis.valid} onClick={() => setDateOpen(false)}>
              Gotowe
            </Button>
          </Popover>
        </div>
        {!analysis.valid && (
          <p className="pd-cbi-inline-alert" role="alert">
            Wybrany okres jest nieprawidłowy (od 1 do 366 dni). Metryki i eksplorator klientów poniżej pokazują ostatni poprawny zakres.
          </p>
        )}
        <CustomerResultSection
          analysis={analysis}
          expanded={expandedSections.has('wynik')}
          onAnalyze={() => setAiContext('at-risk-priority')}
          onExpandedChange={(expanded) => setSectionExpanded('wynik', expanded)}
          onOpenProvenance={setSelectedProvenance}
          onShowCustomers={filterAtRisk}
        />
        <CustomerCohortRetention
          expanded={expandedSections.has('retencja')}
          onExpandedChange={(expanded) => setSectionExpanded('retencja', expanded)}
        />
        <CustomerRfmSegmentation
          expanded={expandedSections.has('segmentacja')}
          onExpandedChange={(expanded) => setSectionExpanded('segmentacja', expanded)}
          onSelectSegment={selectSegment}
        />
        <CustomerValuePareto
          expanded={expandedSections.has('wartosc')}
          onExpandedChange={(expanded) => setSectionExpanded('wartosc', expanded)}
        />
        <CustomerAcquisitionQuality
          expanded={expandedSections.has('pozyskanie')}
          onExpandedChange={(expanded) => setSectionExpanded('pozyskanie', expanded)}
        />
        <CustomerProductAffinity
          expanded={expandedSections.has('preferencje')}
          onExpandedChange={(expanded) => setSectionExpanded('preferencje', expanded)}
        />
        <CustomerExplorer
          dateRangeValid={analysis.valid}
          expanded={expandedSections.has('eksplorator')}
          onExpandedChange={(expanded) => setSectionExpanded('eksplorator', expanded)}
          onOpenCustomer={setSelectedCustomerId}
          onRiskFilterChange={setRiskFilter}
          onSegmentFilterChange={setSegmentFilter}
          riskFilter={riskFilter}
          rows={analysis.rows}
          segmentFilter={segmentFilter}
        />
        <CustomerAiRetentionModule
          expanded={expandedSections.has('insight')}
          insights={insights}
          onAnalyze={() => setAiContext('vip-champions')}
          onExpandedChange={(expanded) => setSectionExpanded('insight', expanded)}
          onGenerate={generateFreshInsight}
          onShowEvidence={filterAtRisk}
        />
      </div>

      <CustomerProvenanceModal
        metricKey={selectedProvenance}
        onClose={() => setSelectedProvenance(null)}
      />
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomerId(null)}
        onPrepareAction={prepareRetentionAction}
        prepared={selectedCustomer !== null && preparedRetentionActions.has(selectedCustomer.id)}
      />
      <CustomerPapaModal
        context={aiContext}
        onClose={() => setAiContext(null)}
      />
    </div>
  );
}

function CustomersSectionFrame({
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
  readonly section: typeof customerSections[number];
}) {
  const bodyId = `pd-cbi-${section.id}-content`;

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
            className="pd-cbi-section-toggle"
            onClick={() => onExpandedChange(!expanded)}
            type="button"
          >
            <span className="pd-cbi-section-toggle__label">{expanded ? 'Zwiń' : 'Rozwiń'}</span>
            <span aria-hidden="true" className="pd-cbi-section-toggle__icon">
              <svg height="14" viewBox="0 0 24 24" width="14">
                <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </button>
        </>
      )}
      className="pd-cbi-section-frame"
      data-collapsed={expanded ? undefined : 'true'}
      description={expanded ? (
        description ? <span>{description}</span> : null
      ) : (
        <span className="pd-cbi-section-summary">{collapsedSummary}</span>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {expanded ? (
        <div className="pd-cbi-section-content" id={bodyId}>{children}</div>
      ) : null}
    </ProductSectionFrame>
  );
}

export function CustomerResultSection({
  analysis = defaultCustomerAnalysis,
  expanded = true,
  onAnalyze = noop,
  onExpandedChange = noop,
  onOpenProvenance = noop,
  onShowCustomers = noop,
}: {
  readonly analysis?: CustomerAnalysis;
  readonly expanded?: boolean;
  readonly onAnalyze?: () => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenProvenance?: (key: CustomerProvenanceKey) => void;
  readonly onShowCustomers?: () => void;
}) {
  const section = customerSectionsById.wynik;
  const atRisk = analysis.atRiskCustomers;

  return (
    <CustomersSectionFrame
      collapsedSummary={`${atRisk} klientów wysokiej wartości przekroczyło cykl ponownego zakupu`}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <PriorityBand
        actions={(
          <>
            <Button
              className="pd-cbi-priority-action pd-cbi-priority-action--primary"
              onClick={onShowCustomers}
              startIcon={<Icon decorative name="customers" size={16} />}
              variant="ghost"
            >
              Pokaż {atRisk} klientów
            </Button>
            <Button
              className="pd-cbi-priority-action"
              onClick={onAnalyze}
              startIcon={<Icon decorative name="assistant" size={16} />}
              variant="ghost"
            >
              Analizuj z Papa AI
            </Button>
          </>
        )}
        badgeLabel="Papa Priorytet Retencyjny"
        timestampLabel="Sprawdzono: dzisiaj, 23:14"
        title={`${atRisk} klientów wysokiej wartości (Champions/Loyal) przekroczyło cykl ponownego zakupu`}
      >
        <p>
          Klienci z tej grupy wygenerowali dotychczas <strong>{formatMoney(analysis.observedLtv * atRisk)}</strong> przychodu (Observed LTV), a ich średni opóźniony czas zakupu wynosi obecnie <strong>19 dni</strong> powyżej ich indywidualnego interwału między zakupami. Brak reakcji w ciągu 14 dni zwiększa prawdopodobieństwo definitywnego churnu o 42%.
        </p>
      </PriorityBand>

      <Panel
        actions={(
          <span className="pd-cbi-base-pill">
            Całkowita baza klientów as-of <strong>28.08.2026</strong>: <strong>24 860</strong>
          </span>
        )}
        bordered={false}
        collapsed={false}
        collapsible={false}
        padding="md"
        title="Główne Metryki Portfela Klientów"
      >
        <div className="pd-cbi-kpi-grid">
          {customerKpis.map((kpi) => {
            const computed = customerKpiValue(kpi.provenanceKey, analysis);
            return (
              <MetricCard
                comparison={{ direction: kpiTrendDirection(computed.trend), label: `${computed.trend} ${computed.note}` }}
                detailAction={{ label: `${kpi.badge} · Źródło i wzór`, onAction: () => onOpenProvenance(kpi.provenanceKey) }}
                emphasis={kpi.provenanceKey === 'at_risk' ? 'alert' : 'default'}
                helpText={kpi.description}
                key={kpi.title}
                label={kpi.title}
                metricId={`customers-kpi-${kpi.provenanceKey}`}
                signal={kpi.badgeTone === 'emerald' ? 'positive' : kpi.badgeTone === 'amber' ? 'warning' : 'neutral'}
                status="ready"
                statusLabel={kpi.badge}
                value={computed.value}
              />
            );
          })}
        </div>
      </Panel>

      <CustomerTrendDecompositionCard analysis={analysis} />
    </CustomersSectionFrame>
  );
}

function kpiTrendDirection(change: string): 'up' | 'down' | 'flat' {
  if (change.startsWith('↑')) return 'up';
  if (change.startsWith('↓')) return 'down';
  return 'flat';
}

// Node's Intl.NumberFormat "auto" grouping (the toLocaleString default)
// leaves 4-digit numbers like 3842 ungrouped -- explicit useGrouping keeps
// this consistent with the rest of the screen's always-grouped convention
// (e.g. "24 860").
function plNumber(value: number) {
  return value.toLocaleString('pl-PL', { useGrouping: true });
}

function formatMoney(value: number) {
  return `${plNumber(Math.round(value))} zł`;
}

function trendCount(current: number, previous: number) {
  const delta = current - previous;
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  return `${arrow} ${plNumber(Math.abs(Math.round(delta)))}`;
}

function trendPercentChange(current: number, previous: number) {
  const pct = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
  return `${arrow} ${Math.abs(pct).toFixed(1)}%`;
}

function trendPoints(current: number, previous: number) {
  const delta = current - previous;
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  return `${arrow} ${Math.abs(delta).toFixed(1)} pp`;
}

function trendMoney(current: number, previous: number) {
  const delta = current - previous;
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  return `${arrow} ${plNumber(Math.abs(Math.round(delta)))} zł`;
}

function customerKpiValue(
  provenanceKey: CustomerProvenanceKey,
  analysis: CustomerAnalysis,
): { readonly value: string; readonly trend: string; readonly note: string } {
  const { previous } = analysis;
  switch (provenanceKey) {
    case 'active_customers':
      return {
        value: plNumber(analysis.activeCustomers),
        trend: trendPercentChange(analysis.activeCustomers, previous.activeCustomers),
        note: 'vs poprz. okres',
      };
    case 'new_customers': {
      const activeSharePct = analysis.activeCustomers > 0 ? (analysis.newCustomers / analysis.activeCustomers) * 100 : 0;
      return {
        value: plNumber(analysis.newCustomers),
        trend: trendPercentChange(analysis.newCustomers, previous.newCustomers),
        note: `${activeSharePct.toFixed(1).replace('.', ',')}% aktywnych`,
      };
    }
    case 'returning_share':
      return {
        value: `${analysis.returningSharePct.toFixed(1).replace('.', ',')}%`,
        trend: trendPoints(analysis.returningSharePct, previous.returningSharePct),
        note: `${plNumber(analysis.returningCustomers)} klientów`,
      };
    case 'repeat_rate':
      return {
        value: `${analysis.repeatRatePct.toFixed(1).replace('.', ',')}%`,
        trend: trendPoints(analysis.repeatRatePct, previous.repeatRatePct),
        note: 'kohorta M1+',
      };
    case 'observed_ltv':
      return {
        value: formatMoney(analysis.observedLtv),
        trend: trendMoney(analysis.observedLtv, previous.observedLtv),
        note: 'suma historyczna/klient',
      };
    case 'at_risk':
      return {
        value: plNumber(analysis.atRiskCustomers),
        trend: trendCount(analysis.atRiskCustomers, previous.atRiskCustomers),
        note: 'przekroczony cykl',
      };
    default:
      return { value: '—', trend: '→ 0', note: '' };
  }
}

function customerTrendSplit(analysis: CustomerAnalysis, mode: CustomerTrendMode) {
  const chartData = customerTrendChartData(analysis, mode);
  const isRateMode = mode === 'aov' || mode === 'margin';
  const totals = chartData.reduce(
    (sum, point) => ({
      newCustomers: sum.newCustomers + point.newCustomers,
      returningCustomers: sum.returningCustomers + point.returningCustomers,
    }),
    { newCustomers: 0, returningCustomers: 0 },
  );
  const newAmount = isRateMode ? (chartData[0]?.newCustomers ?? 0) : totals.newCustomers;
  const returningAmount = isRateMode ? (chartData[0]?.returningCustomers ?? 0) : totals.returningCustomers;
  const denominator = newAmount + returningAmount;
  const newSharePct = denominator > 0 ? (newAmount / denominator) * 100 : 0;
  const returningSharePct = 100 - newSharePct;
  const suffix = mode === 'aov' ? '(Średni AOV)' : mode === 'margin' ? 'Średnia Marża' : `(${newSharePct.toFixed(1)}%)`;
  const returningSuffix = mode === 'aov' ? '(Średni AOV)' : mode === 'margin' ? 'Średnia Marża' : `(${returningSharePct.toFixed(1)}%)`;
  return {
    chartData,
    newValue: `${formatMetricValue(newAmount, mode)} ${suffix}`,
    newSharePct,
    returningValue: `${formatMetricValue(returningAmount, mode)} ${returningSuffix}`,
    returningSharePct,
  };
}

function CustomerTrendDecompositionCard({ analysis }: { readonly analysis: CustomerAnalysis }) {
  const [mode, setMode] = useState<CustomerTrendMode>('customers');
  const activeSeries = useMemo(() => customerTrendSplit(analysis, mode), [analysis, mode]);
  const chartData = activeSeries.chartData;
  const revenueSplit = useMemo(() => customerTrendSplit(analysis, 'revenue'), [analysis]);
  const customersSplitForMode = useMemo(() => customerTrendSplit(analysis, 'customers'), [analysis]);
  const customersSplit = mode === 'customers' ? activeSeries : customersSplitForMode;

  return (
    <section className="pd-cbi-panel">
      <div className="pd-cbi-panel-heading">
        <div>
          <h2>Dekompozycja Aktywnych Klientów: Nowi vs Powracający</h2>
          <p>
            Poprawny model strukturalny: <strong>AKTYWNI KLIENCI = NOWI + POWRACAJĄCY</strong>. Nowi i powracający są rozłącznymi podzbiorami aktywnych kupujących.
          </p>
        </div>
        <div className="pd-cbi-segmented" role="group" aria-label="Metryka trendu klientów">
          {customerTrendModes.map((item) => (
            <button
              className={mode === item.value ? 'pd-cbi-segmented__button pd-cbi-segmented__button--active' : 'pd-cbi-segmented__button'}
              key={item.value}
              onClick={() => setMode(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pd-cbi-trend-layout">
        <div className="pd-cbi-chart" role="img" aria-label={`Trend klientów: ${customerTrendModes.find((item) => item.value === mode)?.label}`}>
          <ResponsiveContainer height="100%" width="100%">
            <RechartsBarChart data={chartData} margin={{ bottom: 8, left: 4, right: 16, top: 12 }}>
              <CartesianGrid stroke="rgb(var(--pd-cbi-slate-200))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: chartColors.slate, fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: chartColors.slate, fontSize: 11 }} tickFormatter={(value) => formatCompact(Number(value))} tickLine={false} width={52} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => formatMetricValue(Number(value), mode)}
                labelStyle={{ color: 'rgb(190 190 187)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="newCustomers" fill={chartColors.indigo} name="Nowi Klienci" radius={[5, 5, 0, 0]} stackId="customers" />
              <Bar dataKey="returningCustomers" fill={chartColors.emerald} name="Powracający Klienci" radius={[5, 5, 0, 0]} stackId="customers" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <aside className="pd-cbi-summary-card">
          <h3>Podsumowanie Podziału</h3>
          <CustomerSplitRow label="Nowi Klienci:" tone="indigo" value={activeSeries.newValue} width={`${activeSeries.newSharePct.toFixed(1)}%`} />
          <CustomerSplitRow label="Powracający Klienci:" tone="emerald" value={activeSeries.returningValue} width={`${activeSeries.returningSharePct.toFixed(1)}%`} />
          <div className="pd-cbi-insight-box">
            <strong>Kluczowy Wnioski:</strong> Powracający klienci stanowią {customersSplit.returningSharePct.toFixed(1)}% kupujących, ale generują aż <strong>{revenueSplit.returningSharePct.toFixed(1)}% całkowitego przychodu</strong> ze względu na wyższy AOV ({representativeReturningAov} zł vs {representativeNewAov} zł).
          </div>
        </aside>
      </div>
    </section>
  );
}

function CustomerSplitRow({
  label,
  tone,
  value,
  width,
}: {
  readonly label: string;
  readonly tone: CustomersTone;
  readonly value: string;
  readonly width: string;
}) {
  return (
    <div className="pd-cbi-split-row">
      <div>
        <span>
          <i className={`pd-cbi-dot pd-cbi-dot--${tone}`} />
          {label}
        </span>
        <strong>{value}</strong>
      </div>
      <div className="pd-cbi-progress">
        <span className={`pd-cbi-progress__bar pd-cbi-progress__bar--${tone}`} style={{ width }} />
      </div>
    </div>
  );
}

function cohortToneClassName(value: string): string {
  if (value === 'N/A') return 'pd-cbi-cohort-cell pd-cbi-cohort-cell--empty';
  if (value === '100%') return 'pd-cbi-cohort-cell pd-cbi-cohort-cell--base';

  const parsed = Number(value.replaceAll(',', '.').replaceAll('%', ''));
  const strength = parsed > 35 ? 'strong' : parsed > 25 ? 'mid' : 'soft';
  return `pd-cbi-cohort-cell pd-cbi-cohort-cell--${strength}`;
}

const cohortMonthColumns = [
  { id: 'm0' as const, label: 'M0' },
  { id: 'm1' as const, label: 'M1' },
  { id: 'm2' as const, label: 'M2' },
  { id: 'm3' as const, label: 'M3' },
  { id: 'm4' as const, label: 'M4' },
  { id: 'm6' as const, label: 'M6' },
];

const customerCohortColumns: readonly ExplorerTableColumn<(typeof customerCohortRows)[number] & { readonly id: string }>[] = [
  {
    csvValue: (row) => row.cohort,
    id: 'cohort',
    label: 'Kohorta (M0)',
    render: (row) => <strong>{row.cohort}</strong>,
    required: true,
    sortAccessor: (row) => row.cohort,
    width: 140,
  },
  {
    align: 'right',
    csvValue: (row) => row.base,
    id: 'base',
    label: 'Baza M0',
    render: (row) => row.base.toLocaleString('pl-PL'),
    required: true,
    sortAccessor: (row) => row.base,
    width: 100,
  },
  ...cohortMonthColumns.map(({ id, label }) => ({
    align: 'right' as const,
    csvValue: (row: (typeof customerCohortRows)[number]) => row[id],
    id,
    label,
    render: (row: (typeof customerCohortRows)[number]) => (
      <span className={cohortToneClassName(row[id])}>{row[id]}</span>
    ),
  })),
];

export function CustomerCohortRetention({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const [cohort, setCohort] = useState<CustomerCohortSelection>('all');
  const curveData = customerRetentionLabels.map((label, index) => ({
    label,
    value: customerRetentionCurve[cohort][index],
  }));
  const section = customerSectionsById.retencja;
  const cohortRows = useMemo(
    () => customerCohortRows.map((row) => ({ ...row, id: row.cohort })),
    [],
  );

  return (
    <CustomersSectionFrame
      actions={(
        <div className="pd-cbi-mini-select">
          <Select
            label="Wizualizuj kohortę"
            onChange={(event) => setCohort(event.currentTarget.value as CustomerCohortSelection)}
            options={customerCohortOptions}
            placeholder="Wybierz kohortę"
            value={cohort}
          />
        </div>
      )}
      description={(
        <>
          Miesiąc 1. kwalifikowanego zakupu ($M_0$). Komórki przyszłe wykazują status <span className="pd-cbi-inline-tag">N/A (Right Censored)</span> zamiast zafałszowanego 0%.
        </>
      )}
      collapsedSummary="Największy spadek retencji: M0 → M1 (-63,2 pp)"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-cbi-cohort-layout">
        <ExplorerTable
          ariaLabel="Retencja klientów"
          columns={customerCohortColumns}
          rows={cohortRows}
        />

        <div>
          <h3>Krzywa Odpływu Retencji (Retention Decay Curve)</h3>
          <div className="pd-cbi-chart pd-cbi-chart--small" role="img" aria-label="Krzywa odpływu retencji">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsLineChart data={curveData} margin={{ bottom: 8, left: 0, right: 16, top: 12 }}>
                <CartesianGrid stroke="rgb(var(--pd-cbi-slate-200))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartColors.slate, fontSize: 11 }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: chartColors.slate, fontSize: 11 }} tickFormatter={(value) => `${value}%`} tickLine={false} width={44} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Retencja']} />
                <Line connectNulls={false} dataKey="value" name="Retencja" stroke={chartColors.indigo} strokeWidth={3} type="monotone" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="pd-cbi-note-box">
        <Icon decorative name="assistant" size={16} />
        <p>
          <strong>Interpretacja Papa AI:</strong> Największa utrata klientów występuje w punkcie <strong>M0 → M1 (spadek o 63.2 pp)</strong>. Klienci przetrzymani do M2 wykazują bardzo wysoką retencję długoterminową (stabilizacja na poziomie 18-22%). Rekomendacja: Skieruj działania automatyzacji onboardingowej na pierwsze 30 dni od zakupu zakwalifikowanego.
        </p>
      </div>
    </CustomersSectionFrame>
  );
}

export function CustomerRfmSegmentation({
  expanded = true,
  onExpandedChange = noop,
  onSelectSegment = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onSelectSegment?: (segment: string) => void;
}) {
  const section = customerSectionsById.segmentacja;

  return (
    <CustomersSectionFrame
      collapsedSummary="Segmentacja RFM: Recency × Frequency × Monetary, punktacja 1-5"
      description={(
        <>
          Klasyfikacja oparta o pełny model trójwymiarowy: <strong>R (Recency)</strong>, <strong>F (Frequency)</strong> oraz <strong>M (Monetary Gross Margin)</strong> z punktacją 1–5.
        </>
      )}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-cbi-rfm-layout">
        <div className="pd-cbi-chart" role="img" aria-label="Rozkład segmentów RFM">
          <ResponsiveContainer height="100%" width="100%">
            <RechartsPieChart>
              <Pie data={customerRfmSegments} dataKey="numericCount" innerRadius={70} nameKey="name" outerRadius={118} paddingAngle={2}>
                {customerRfmSegments.map((segment) => (
                  <Cell fill={chartColors[segment.tone]} key={segment.name} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [Number(value).toLocaleString('pl-PL'), name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="pd-cbi-rfm-cards">
          {customerRfmSegments.map((segment) => (
            <button className="pd-cbi-rfm-card" key={segment.name} onClick={() => onSelectSegment(segment.name)} type="button">
              <div>
                <strong>{segment.name}</strong>
                <span>{segment.score}</span>
              </div>
              <strong>{segment.count}</strong>
              <p>{segment.description}</p>
            </button>
          ))}
        </div>
      </div>
    </CustomersSectionFrame>
  );
}

export function CustomerValuePareto({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = customerSectionsById.wartosc;

  return (
    <CustomersSectionFrame
      collapsedSummary="Utrata 10% kluczowych odbiorców zredukuje marżę brutto o ponad połowę"
      description={(
        <>
          Rozkład rzeczywistej skumulowanej wartości klientów (<strong>Observed Customer Value</strong>) oraz analiza koncentracji przychodu.
        </>
      )}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-cbi-value-layout">
        <div className="pd-cbi-chart" role="img" aria-label="Rozkład wartości klienta i kumulacyjny przychód">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart data={customerLtvPareto} margin={{ bottom: 8, left: 4, right: 12, top: 12 }}>
              <CartesianGrid stroke="rgb(var(--pd-cbi-slate-200))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: chartColors.slate, fontSize: 11 }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: chartColors.slate, fontSize: 11 }} tickFormatter={(value) => formatCompact(Number(value))} tickLine={false} width={52} />
              <YAxis domain={[0, 100]} orientation="right" tick={{ fill: chartColors.emerald, fontSize: 11 }} tickFormatter={(value) => `${value}%`} tickLine={false} yAxisId="right" width={48} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="customers" fill="rgb(var(--pd-cbi-slate-400))" name="Liczba Klientów" radius={[5, 5, 0, 0]} yAxisId="left" />
              <Line dataKey="cumulativeRevenue" name="Kumulacyjny Przychód (%)" stroke={chartColors.emerald} strokeWidth={3} type="monotone" yAxisId="right" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <aside className="pd-cbi-value-aside">
          <article className="pd-cbi-pareto-card">
            <h3>Analiza Koncentracji Pareto</h3>
            {customerParetoConcentration.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
            <p><strong>Ryzyko koncentracji:</strong> Utrata 10% kluczowych odbiorców zredukuje całkowitą marżę brutto o ponad połowę.</p>
          </article>

          <article className="pd-cbi-ltv-card">
            <strong>Prognoza Wartości LTV 12M (Model Podstawowy):</strong>
            <span>812 zł <small>/ klient</small></span>
            <p>Założenia: Expected Orders 12M (1.82) × Expected AOV (446 zł) uwzględniając średnią stopę retencji.</p>
          </article>
        </aside>
      </div>
    </CustomersSectionFrame>
  );
}

export function CustomerAcquisitionQuality({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = customerSectionsById.pozyskanie;

  return (
    <CustomersSectionFrame
      collapsedSummary="Koszt pozyskania (CAC) vs rzeczywisty LTV wg kanału"
      description={(
        <>
          Atrybucja pozyskania zamrożona na 1. zakupie (<strong>First-touch / Acquisition Cohort</strong>). Porównanie kosztu pozyskania z rzeczywistym LTV.
        </>
      )}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-cbi-acq-layout">
        <div className="pd-cbi-chart" role="img" aria-label="CAC i Observed LTV według kanału">
          <ResponsiveContainer height="100%" width="100%">
            <RechartsBarChart data={customerAcquisitionRows} margin={{ bottom: 8, left: 4, right: 12, top: 12 }}>
              <CartesianGrid stroke="rgb(var(--pd-cbi-slate-200))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="source" tick={{ fill: chartColors.slate, fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: chartColors.slate, fontSize: 11 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toLocaleString('pl-PL')} zł`, '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="cac" fill={chartColors.rose} name="CAC (zł)" radius={[5, 5, 0, 0]} />
              <Bar dataKey="ltv" fill={chartColors.emerald} name="Observed LTV (zł)" radius={[5, 5, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <ExplorerTable
          ariaLabel="Kanały pozyskania klientów"
          columns={customerAcquisitionColumns}
          exportFilenameBase="kanaly-pozyskania-klientow"
          rows={customerAcquisitionRows.map((row) => ({ ...row, id: row.source }))}
        />
      </div>
    </CustomersSectionFrame>
  );
}

export function CustomerProductAffinity({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = customerSectionsById.preferencje;

  return (
    <CustomersSectionFrame
      collapsedSummary="Afinitet produktowy: produkty inicjujące vs powtórne"
      description={(
        <>
          Rzeczywiste pozycje zamówień z <strong>FactOrderLine</strong> rozdzielone według statusu klienta w momencie zakupu.
        </>
      )}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-cbi-affinity-grid">
        <AffinityTable
          badge="First Purchase"
          rows={customerAffinity.newProducts}
          title="Produkty Inicjujące (Nowi Klienci)"
          tone="indigo"
        />
        <AffinityTable
          badge="Repeat Drivers"
          rows={customerAffinity.returningProducts}
          title="Produkty Powtórne (Powracający)"
          tone="emerald"
        />
      </div>
    </CustomersSectionFrame>
  );
}

function AffinityTable({
  badge,
  rows,
  title,
  tone,
}: {
  readonly badge: string;
  readonly rows: readonly {
    readonly name: string;
    readonly orders: number;
    readonly revenue: string;
  }[];
  readonly title: string;
  readonly tone: CustomersTone;
}) {
  return (
    <article className="pd-cbi-affinity-card">
      <header>
        <h3 className={`pd-cbi-${tone}-text`}>{title}</h3>
        <span className={`pd-cbi-data-badge pd-cbi-data-badge--${tone}`}>{badge}</span>
      </header>
      <ExplorerTable
        ariaLabel={title}
        columns={affinityColumns}
        exportFilenameBase={title}
        rows={rows.map((row) => ({ ...row, id: row.name }))}
      />
    </article>
  );
}

const affinityColumns: readonly ExplorerTableColumn<{ readonly id: string; readonly name: string; readonly orders: number; readonly revenue: string }>[] = [
  {
    csvValue: (row) => row.name,
    id: 'name',
    label: 'Produkt',
    render: (row) => <strong>{row.name}</strong>,
    required: true,
    sortAccessor: (row) => row.name,
  },
  {
    csvValue: (row) => row.orders,
    id: 'orders',
    label: 'Zamówienia',
    render: (row) => row.orders,
    sortAccessor: (row) => row.orders,
  },
  {
    csvValue: (row) => row.revenue,
    id: 'revenue',
    label: 'Przychód',
    render: (row) => row.revenue,
  },
];

const customerAcquisitionColumns: readonly ExplorerTableColumn<(typeof customerAcquisitionRows)[number] & { readonly id: string }>[] = [
  {
    csvValue: (row) => row.source,
    id: 'source',
    label: 'Kanał',
    render: (row) => <strong>{row.source}</strong>,
    required: true,
    sortAccessor: (row) => row.source,
  },
  {
    csvValue: (row) => row.newCust,
    id: 'newCust',
    label: 'Nowi',
    render: (row) => row.newCust,
    sortAccessor: (row) => row.newCust,
  },
  {
    csvValue: (row) => row.cac,
    id: 'cac',
    label: 'CAC',
    render: (row) => <span className="pd-cbi-rose-text">{row.cacLabel}</span>,
    sortAccessor: (row) => row.cac,
  },
  {
    csvValue: (row) => row.ltv,
    id: 'ltv',
    label: 'LTV',
    render: (row) => <span className="pd-cbi-emerald-text">{row.ltvLabel}</span>,
    sortAccessor: (row) => row.ltv,
  },
  {
    csvValue: (row) => row.ratio,
    id: 'ratio',
    label: 'LTV:CAC',
    render: (row) => <strong className="pd-cbi-indigo-text">{row.ratio}</strong>,
  },
];

const customerExplorerColumns: readonly ExplorerTableColumn<CustomerExplorerRow>[] = [
  {
    csvValue: (row) => row.id,
    id: 'id',
    label: 'Tożsamość',
    render: (row) => <strong className="pd-cbi-mono">{row.id}</strong>,
    required: true,
    sortAccessor: (row) => row.id,
  },
  {
    csvValue: (row) => row.segment,
    id: 'segment',
    label: 'Segment RFM',
    render: (row) => row.segment,
    sortAccessor: (row) => row.segment,
  },
  {
    csvValue: (row) => row.score,
    id: 'score',
    label: 'Wynik',
    render: (row) => <span className="pd-cbi-mono">{row.score}</span>,
    sortAccessor: (row) => row.score,
  },
  {
    csvValue: (row) => row.recency,
    id: 'recency',
    label: 'Świeżość',
    render: (row) => row.recency,
  },
  {
    csvValue: (row) => row.orders,
    id: 'orders',
    label: 'Zamówienia',
    render: (row) => row.orders,
  },
  {
    csvValue: (row) => row.ltv,
    id: 'ltv',
    label: 'Observed LTV',
    render: (row) => <strong>{row.ltv}</strong>,
  },
  {
    csvValue: (row) => row.aov,
    id: 'aov',
    label: 'AOV',
    render: (row) => row.aov,
  },
  {
    csvValue: (row) => row.riskLabel,
    id: 'risk',
    label: 'Status Ryzyka',
    render: (row) => <CustomerRiskBadge label={row.riskLabel} risk={row.risk} />,
  },
];

const customerRowActions = [
  { id: 'details', label: 'Otwórz szczegóły' },
];

export function CustomerExplorer({
  dateRangeValid = true,
  expanded = true,
  onExpandedChange = noop,
  onOpenCustomer = noop,
  onRiskFilterChange = noop,
  onSegmentFilterChange = noop,
  riskFilter = 'all',
  rows = customerExplorerRows,
  segmentFilter = 'all',
}: {
  readonly dateRangeValid?: boolean;
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenCustomer?: (customerId: string) => void;
  readonly onRiskFilterChange?: (risk: CustomerRiskFilter) => void;
  readonly onSegmentFilterChange?: (segment: CustomerSegmentFilter) => void;
  readonly riskFilter?: CustomerRiskFilter;
  readonly rows?: readonly CustomerExplorerRow[];
  readonly segmentFilter?: CustomerSegmentFilter;
}) {
  const filteredRows = filterCustomers({
    riskFilter,
    rows,
    segmentFilter,
  });

  const section = customerSectionsById.eksplorator;
  const filterState = [
    segmentFilter !== 'all' ? {
      id: 'segment',
      label: 'Segment RFM',
      removable: true,
      type: 'select' as const,
      value: customerSegmentFilterOptions.find((option) => option.value === segmentFilter)?.label ?? segmentFilter,
    } : null,
    riskFilter !== 'all' ? {
      id: 'risk',
      label: 'Ryzyko',
      removable: true,
      type: 'select' as const,
      value: customerRiskFilterOptions.find((option) => option.value === riskFilter)?.label ?? riskFilter,
    } : null,
  ].filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return (
    <CustomersSectionFrame
      description={(
        <>
          Analityczna tabela klientów zgodna z Privacy-by-Design. Zanonimizowane pseudonimy, brak wycieku PII.
        </>
      )}
      collapsedSummary={`${filteredRows.length} z 24 860 klientów widocznych · kliknij, aby przeszukać`}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <ExplorerTable
        ariaLabel="Eksplorator klientów"
        columns={customerExplorerColumns}
        emptyMessage={dateRangeValid ? undefined : 'Wybierz poprawny okres (od 1 do 366 dni) w nagłówku strony.'}
        emptyTitle={dateRangeValid ? undefined : 'Nieprawidłowy okres'}
        filterState={filterState}
        filters={(
          <>
            <SelectControl
              ariaLabel="Filtr segmentu RFM"
              onChange={(event) => onSegmentFilterChange(event.target.value as CustomerSegmentFilter)}
              options={customerSegmentFilterOptions}
              value={segmentFilter}
            />
            <SelectControl
              ariaLabel="Filtr statusu ryzyka"
              onChange={(event) => onRiskFilterChange(event.target.value as CustomerRiskFilter)}
              options={customerRiskFilterOptions}
              value={riskFilter}
            />
          </>
        )}
        onClearFilters={() => {
          onSegmentFilterChange('all');
          onRiskFilterChange('all');
        }}
        onRemoveFilter={(filterId) => {
          if (filterId === 'segment') onSegmentFilterChange('all');
          if (filterId === 'risk') onRiskFilterChange('all');
        }}
        onRowAction={(rowId, actionId) => {
          if (actionId === 'details') onOpenCustomer(rowId);
        }}
        onRowClick={(customer) => onOpenCustomer(customer.id)}
        rowActions={() => customerRowActions}
        rows={filteredRows}
        searchFields={['id', 'score']}
        searchLabel="Szukaj ID lub hashu"
        searchPlaceholder="Szukaj ID lub hashu..."
      />
    </CustomersSectionFrame>
  );
}

function SelectControl({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  readonly ariaLabel: string;
  readonly onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly options: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly value: string;
}) {
  return (
    <Select
      className="pd-cbi-select-control"
      label={ariaLabel}
      onChange={onChange}
      options={options}
      placeholder={ariaLabel}
      value={value}
    />
  );
}

function CustomerRiskBadge({
  label,
  risk,
}: {
  readonly label: string;
  readonly risk: CustomerRiskStatus;
}) {
  return (
    <span className={`pd-cbi-risk-badge pd-cbi-risk-badge--${risk}`}>{label}</span>
  );
}

export function CustomerAiRetentionModule({
  expanded = true,
  insights = customerAiInsights,
  onAnalyze = noop,
  onExpandedChange = noop,
  onGenerate = noop,
  onShowEvidence = noop,
}: {
  readonly expanded?: boolean;
  readonly insights?: readonly CustomerAiInsight[];
  readonly onAnalyze?: () => void;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onGenerate?: () => void;
  readonly onShowEvidence?: () => void;
}) {
  const section = customerSectionsById.insight;

  return (
    <CustomersSectionFrame
      actions={(
        <>
          <div className="pd-cbi-ai-mark">
            <Icon decorative name="assistant" size={20} />
          </div>
          <button className="pd-cbi-primary-button" onClick={onGenerate} type="button">
            <Icon decorative name="integration" size={16} />
            Wygeneruj Nowy Insight
          </button>
        </>
      )}
      collapsedSummary={`${insights.length} rekomendacje Papa AI · standard Obserwacja → Dowód → Rekomendacja → Wpływ`}
      description="Rekomendacje oparte o standard Obserwacja → Dowód → Rekomendacja → Wpływ."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-cbi-ai-grid">
        {insights.map((insight) => (
          <article className="pd-cbi-ai-card" key={insight.title}>
            <div>
              <span className={`pd-cbi-${insight.tone}-text`}>{insight.title}</span>
              <small>{insight.confidence}</small>
            </div>
            <div className="pd-cbi-ai-card__body">
              {insight.lines.map(([label, value]) => (
                <p key={`${insight.title}-${label}`}>
                  <strong>{label}</strong> {value}
                </p>
              ))}
            </div>
            <footer>
              <span>{insight.impact}</span>
              <button
                onClick={insight.actionKind === 'filter' ? onShowEvidence : onAnalyze}
                type="button"
              >
                {insight.action}
              </button>
            </footer>
          </article>
        ))}
      </div>
    </CustomersSectionFrame>
  );
}

function CustomerProvenanceModal({
  metricKey,
  onClose,
}: {
  readonly metricKey: CustomerProvenanceKey | null;
  readonly onClose: () => void;
}) {
  const provenance = metricKey ? customerProvenanceDict[metricKey] : null;

  return (
    <Dialog
      closeOnEscape
      description={null}
      dismissible
      modal
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={provenance !== null}
      secondaryActionLabel="Zamknij provenance"
      title="Provenance danych klientów"
    >
      {provenance && (
        <div className="pd-cbi-provenance-body">
          <div className="pd-cbi-provenance-heading">
            <span className={`pd-cbi-data-badge pd-cbi-data-badge--${provenance.badge === 'Model' ? 'amber' : 'emerald'}`}>{provenance.badge}</span>
            <h3>{provenance.title}</h3>
          </div>
          <dl className="pd-cbi-definition-list">
            <div>
              <dt>Źródło</dt>
              <dd>{provenance.source}</dd>
            </div>
            <div>
              <dt>Pokrycie</dt>
              <dd>{provenance.coverage}</dd>
            </div>
            <div>
              <dt>Uwagi</dt>
              <dd>{provenance.notes}</dd>
            </div>
          </dl>
        </div>
      )}
    </Dialog>
  );
}

function CustomerDrawer({
  customer,
  onClose,
  onPrepareAction,
  prepared,
}: {
  readonly customer: CustomerExplorerRow | null;
  readonly onClose: () => void;
  readonly onPrepareAction: (customerId: string) => void;
  readonly prepared: boolean;
}) {
  return (
    <Drawer
      dismissible
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={customer !== null}
      secondaryActionLabel="Zamknij Customer Drawer"
      side="right"
      title="Customer Drawer"
      width={560}
    >
      {customer && (
        <div className="pd-cbi-drawer-content">
          <header className="pd-cbi-drawer__head">
            <div>
              <div>
                <h2>{customer.id}</h2>
                <span>{customer.segment}</span>
              </div>
              <p>Privacy status: Hashed Identity (No PII Leaked)</p>
            </div>
          </header>

          <div className="pd-cbi-drawer-grid">
            <MetricTile label="Pierwsze zamówienie:" value="12.03.2024" />
            <MetricTile label="Ostatnie zamówienie:" value={`19.08.2026 (${customer.recency} temu)`} />
            <MetricTile label="Wartość (Observed LTV):" tone="emerald" value={customer.ltv} />
            <MetricTile label="Liczba zamówień:" value={`${customer.orders} zamówień`} />
          </div>

          <section>
            <h3>Rozbicie Wyniku RFM</h3>
            <div className="pd-cbi-rfm-breakdown">
              <MetricTile label="Wynik Świeżości" tone="indigo" value="5 / 5" />
              <MetricTile label="Wynik Częstotliwości" tone="indigo" value="4 / 5" />
              <MetricTile label="Wynik Wartości" tone="indigo" value="5 / 5" />
            </div>
          </section>

          <section>
            <h3>Oś Czasu Kwalifikowanych Zamówień</h3>
            <div className="pd-cbi-timeline">
              <article>
                <strong>19.08.2026 · Zamówienie #ORD-9841</strong>
                <span>Wartość: {customer.aov} · Refill Serum Witamina C</span>
              </article>
              <article>
                <strong>12.03.2024 · Pierwsze Zakwalifikowane Zamówienie</strong>
                <span>Wartość: 280 zł · Starter Set Pielęgnacyjny</span>
              </article>
            </div>
          </section>

          <div className="pd-cbi-drawer-inline-actions">
            <button
              className="pd-cbi-primary-button"
              disabled={prepared}
              onClick={() => onPrepareAction(customer.id)}
              type="button"
            >
              {prepared ? 'Działanie zaplanowane ✓' : 'Przygotuj Działanie Retencyjne'}
            </button>
            {prepared && (
              <span className="pd-cbi-drawer__confirm" role="status">
                Zapisano lokalnie dla {customer.id}.
              </span>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function CustomerPapaModal({
  context,
  onClose,
}: {
  readonly context: string | null;
  readonly onClose: () => void;
}) {
  return (
    <Dialog
      closeOnEscape
      description={null}
      dismissible
      modal
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={context !== null}
      secondaryActionLabel="Zamknij analizę"
      title="Retencyjny moduł rekomendacyjny"
    >
      {context && (
        <>
          <span className="pd-cbi-data-badge pd-cbi-data-badge--indigo">Papa AI</span>
          <p className="pd-cbi-modal-copy">
            Uruchomiono moduł rekomendacyjny Papa AI dla kontekstu: {context}. Analiza została zrejestrowana w audycie.
          </p>
        </>
      )}
    </Dialog>
  );
}

function MetricTile({
  label,
  tone = 'slate',
  value,
}: {
  readonly label: string;
  readonly tone?: CustomersTone;
  readonly value: string;
}) {
  return (
    <article className="pd-cbi-metric-tile">
      <span>{label}</span>
      <strong className={`pd-cbi-${tone}-text`}>{value}</strong>
    </article>
  );
}

const tooltipStyle = {
  background: 'rgb(58 58 54)',
  border: '0',
  borderRadius: 10,
  color: 'white',
  fontSize: 12,
};

function filterCustomers({
  riskFilter,
  rows,
  segmentFilter,
}: {
  readonly riskFilter: CustomerRiskFilter;
  readonly rows: readonly CustomerExplorerRow[];
  readonly segmentFilter: CustomerSegmentFilter;
}) {
  return rows.filter((customer) => {
    const segmentMatches = segmentFilter === 'all' || customer.segment.includes(segmentFilter);
    const riskMatches = riskFilter === 'all' || customer.risk === riskFilter;

    return segmentMatches && riskMatches;
  });
}

function toExplorerSegmentFilter(segmentName: string): CustomerSegmentFilter {
  if (segmentName.includes('Champions')) return 'Champions';
  if (segmentName.includes('Loyal')) return 'Loyal';
  if (segmentName.includes('At Risk')) return 'At Risk';
  if (segmentName.includes('Hibernating')) return 'Hibernating';
  return 'all';
}

function formatCompact(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function formatMetricValue(value: number, mode: CustomerTrendMode) {
  if (mode === 'revenue') return `${value.toLocaleString('pl-PL')} zł`;
  if (mode === 'aov') return `${value.toLocaleString('pl-PL')} zł`;
  if (mode === 'margin') return `${value.toLocaleString('pl-PL')}%`;
  return value.toLocaleString('pl-PL');
}
