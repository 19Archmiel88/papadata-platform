import type {
  ChangeEvent,
} from 'react';
import {
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
  Icon,
  MetricCard,
  Panel,
  PriorityBand,
  ProductSectionFrame,
  ProductSectionTopbar,
} from '../../../design-system';
import {
  customerAcquisitionRows,
  customerAffinity,
  customerAiInsights,
  customerCohortOptions,
  customerCohortRows,
  customerDefaultFilters,
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
  customerTrendLabels,
  customerTrendModes,
  customerTrendSeries,
} from './CustomersBiPage.data';
import type {
  CustomerCohortSelection,
  CustomerExplorerRow,
  CustomerGlobalFilters,
  CustomerProvenanceKey,
  CustomerRiskStatus,
  CustomerSectionId,
  CustomerTrendMode,
  CustomersTone,
} from './CustomersBiPage.data';
import './CustomersBiPage.css';

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

export function CustomersBiPage() {
  const [activeSection, setActiveSection] = useState<CustomerSectionId>(customerSections[0]!.id);
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegmentFilter>('all');
  const [riskFilter, setRiskFilter] = useState<CustomerRiskFilter>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<CustomerProvenanceKey | null>(null);
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [insights, setInsights] = useState<CustomerAiInsight[]>([...customerAiInsights]);

  const selectedCustomer = customerExplorerRows.find((customer) => customer.id === selectedCustomerId) ?? null;

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

  return (
    <main className="pd-cbi" data-testid="customers-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        ariaLabel="Sekcje Klientów"
        items={customerSections.map((section) => ({ icon: section.icon, id: section.id, label: section.navLabel }))}
        onActiveIdChange={(sectionId) => setActiveSection(sectionId as CustomerSectionId)}
      />

      <div className="pd-cbi__content">
        <CustomerResultSection
          onAnalyze={() => setAiContext('at-risk-priority')}
          onOpenProvenance={setSelectedProvenance}
          onShowCustomers={filterAtRisk}
        />
        <CustomerCohortRetention />
        <CustomerRfmSegmentation onSelectSegment={selectSegment} />
        <CustomerValuePareto />
        <CustomerAcquisitionQuality />
        <CustomerProductAffinity />
        <CustomerExplorer
          onOpenCustomer={setSelectedCustomerId}
          onRiskFilterChange={setRiskFilter}
          onSegmentFilterChange={setSegmentFilter}
          riskFilter={riskFilter}
          segmentFilter={segmentFilter}
        />
        <CustomerAiRetentionModule
          insights={insights}
          onAnalyze={() => setAiContext('vip-champions')}
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
        onPrepareAction={() => undefined}
      />
      <CustomerPapaModal
        context={aiContext}
        onClose={() => setAiContext(null)}
      />
    </main>
  );
}

export function CustomerResultSection({
  filters = customerDefaultFilters,
  onAnalyze = noop,
  onOpenProvenance = noop,
  onShowCustomers = noop,
}: {
  readonly filters?: CustomerGlobalFilters;
  readonly onAnalyze?: () => void;
  readonly onOpenProvenance?: (key: CustomerProvenanceKey) => void;
  readonly onShowCustomers?: () => void;
}) {
  const section = customerSectionsById.wynik;

  return (
    <ProductSectionFrame
      description="Jaki jest aktualny wynik i struktura aktywnej bazy klientów?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <PriorityBand
        actions={(
          <>
            <Button
              onClick={onShowCustomers}
              startIcon={<Icon decorative name="customers" size={16} />}
              variant="primary"
            >
              Pokaż 318 klientów
            </Button>
            <Button
              onClick={onAnalyze}
              startIcon={<Icon decorative name="assistant" size={16} />}
              variant="secondary"
            >
              Analizuj z Papa AI
            </Button>
          </>
        )}
        badgeLabel="Papa Priorytet Retencyjny"
        timestampLabel="Sprawdzono: dzisiaj, 23:14"
        title="318 klientów wysokiej wartości (Champions/Loyal) przekroczyło cykl ponownego zakupu"
      >
        <p>
          Klienci z tej grupy wygenerowali dotychczas <strong>462 000 zł</strong> przychodu (Observed LTV), a ich średni opóźniony czas zakupu wynosi obecnie <strong>19 dni</strong> powyżej ich indywidualnego interpurchase interval. Brak reakcji w ciągu 14 dni zwiększa prawdopodobieństwo definitywnego churnu o 42%.
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
        description="Kluczowe wskaźniki retencji, aktywności i wartości z jawnym oznaczeniem statusu danych (Data Provenance)."
        padding="md"
        title="Główne Metryki Portfela Klientów"
      >
        <div className="pd-cbi-kpi-grid">
          {customerKpis.map((kpi) => (
            <MetricCard
              comparison={{ direction: kpiTrendDirection(kpi.trend), label: `${kpi.trend} ${kpi.note}` }}
              detailAction={{ label: `${kpi.badge} · Źródło i wzór`, onAction: () => onOpenProvenance(kpi.provenanceKey) }}
              emphasis={kpi.provenanceKey === 'at_risk' ? 'alert' : 'default'}
              key={kpi.title}
              label={kpi.title}
              metricId={`customers-kpi-${kpi.provenanceKey}`}
              signal={kpi.badgeTone === 'emerald' ? 'positive' : kpi.badgeTone === 'amber' ? 'warning' : 'neutral'}
              sourceLabel={kpi.footer}
              status="ready"
              statusLabel={kpi.badge}
              value={'periodValues' in kpi ? kpi.periodValues[filters.period] : kpi.value}
            />
          ))}
        </div>
      </Panel>

      <CustomerTrendDecompositionCard />
    </ProductSectionFrame>
  );
}

function kpiTrendDirection(change: string): 'up' | 'down' | 'flat' {
  if (change.startsWith('↑')) return 'up';
  if (change.startsWith('↓')) return 'down';
  return 'flat';
}

function CustomerTrendDecompositionCard() {
  const [mode, setMode] = useState<CustomerTrendMode>('customers');
  const activeSeries = customerTrendSeries[mode];
  const chartData = useMemo(() => customerTrendLabels.map((label, index) => ({
    label,
    newCustomers: activeSeries.newCustomers[index],
    returningCustomers: activeSeries.returningCustomers[index],
  })), [activeSeries]);

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
          <CustomerSplitRow label="Nowi Klienci:" tone="indigo" value={activeSeries.newValue} width="61.6%" />
          <CustomerSplitRow label="Powracający Klienci:" tone="emerald" value={activeSeries.returningValue} width="38.4%" />
          <div className="pd-cbi-insight-box">
            <strong>Kluczowy Wnioski:</strong> Powracający klienci stanowią 38,4% kupujących, ale generują aż <strong>54,2% całkowitego przychodu</strong> ze względu na wyższy AOV (312 zł vs 218 zł).
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

export function CustomerCohortRetention() {
  const [cohort, setCohort] = useState<CustomerCohortSelection>('all');
  const curveData = customerRetentionLabels.map((label, index) => ({
    label,
    value: customerRetentionCurve[cohort][index],
  }));
  const section = customerSectionsById.retencja;

  return (
    <ProductSectionFrame
      actions={(
        <label className="pd-cbi-mini-select">
          <span>Wizualizuj kohortę:</span>
          <select
            onChange={(event) => setCohort(event.target.value as CustomerCohortSelection)}
            value={cohort}
          >
            {customerCohortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
      description={(
        <>
          <span className="pd-cbi-context-pill">Cohort Heatmap &amp; Decay Curve</span>
          <br />
          Miesiąc 1. kwalifikowanego zakupu ($M_0$). Komórki przyszłe wykazują status <span className="pd-cbi-inline-tag">N/A (Right Censored)</span> zamiast zafałszowanego 0%.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-cbi-cohort-layout">
        <div className="pd-cbi-table-scroll">
          <table className="pd-cbi-simple-table">
            <thead>
              <tr>
                <th>Kohorta (M0)</th>
                <th>Baza M0</th>
                <th>M0</th>
                <th>M1</th>
                <th>M2</th>
                <th>M3</th>
                <th>M4</th>
                <th>M6</th>
              </tr>
            </thead>
            <tbody>
              {customerCohortRows.map((row) => (
                <tr key={row.cohort}>
                  <td><strong>{row.cohort}</strong></td>
                  <td>{row.base.toLocaleString('pl-PL')}</td>
                  <CohortCell value={row.m0} />
                  <CohortCell value={row.m1} />
                  <CohortCell value={row.m2} />
                  <CohortCell value={row.m3} />
                  <CohortCell value={row.m4} />
                  <CohortCell value={row.m6} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
    </ProductSectionFrame>
  );
}

function CohortCell({
  value,
}: {
  readonly value: string;
}) {
  if (value === 'N/A') {
    return <td className="pd-cbi-cohort-cell pd-cbi-cohort-cell--empty">N/A</td>;
  }

  if (value === '100%') {
    return <td className="pd-cbi-cohort-cell pd-cbi-cohort-cell--base">100%</td>;
  }

  const parsed = Number(value.replace(',', '.').replace('%', ''));
  const strength = parsed > 35 ? 'strong' : parsed > 25 ? 'mid' : 'soft';

  return <td className={`pd-cbi-cohort-cell pd-cbi-cohort-cell--${strength}`}>{value}</td>;
}

export function CustomerRfmSegmentation({
  onSelectSegment = noop,
}: {
  readonly onSelectSegment?: (segment: string) => void;
}) {
  const section = customerSectionsById.segmentacja;

  return (
    <ProductSectionFrame
      description={(
        <>
          <span className="pd-cbi-context-pill">RFM &amp; Behavioral Lifecycle</span>
          <br />
          Klasyfikacja oparta o pełny model trójwymiarowy: <strong>R (Recency)</strong>, <strong>F (Frequency)</strong> oraz <strong>M (Monetary Gross Margin)</strong> z punktacją 1–5.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
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
    </ProductSectionFrame>
  );
}

export function CustomerValuePareto() {
  const section = customerSectionsById.wartosc;

  return (
    <ProductSectionFrame
      description={(
        <>
          <span className="pd-cbi-context-pill">Ekonomika Portfela · LTV Pareto</span>
          <br />
          Rozkład rzeczywistej skumulowanej wartości klientów (<strong>Observed Customer Value</strong>) oraz analiza koncentracji przychodu.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
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
    </ProductSectionFrame>
  );
}

export function CustomerAcquisitionQuality() {
  const section = customerSectionsById.pozyskanie;

  return (
    <ProductSectionFrame
      description={(
        <>
          <span className="pd-cbi-context-pill">Jakość Pozyskania · CAC vs LTV</span>
          <br />
          Atrybucja pozyskania zamrożona na 1. zakupie (<strong>First-touch / Acquisition Cohort</strong>). Porównanie kosztu pozyskania z rzeczywistym LTV.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
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

        <div className="pd-cbi-table-scroll">
          <table className="pd-cbi-simple-table pd-cbi-simple-table--compact">
            <thead>
              <tr>
                <th>Kanał</th>
                <th>Nowi</th>
                <th>CAC</th>
                <th>LTV</th>
                <th>LTV:CAC</th>
              </tr>
            </thead>
            <tbody>
              {customerAcquisitionRows.map((row) => (
                <tr key={row.source}>
                  <td><strong>{row.source}</strong></td>
                  <td>{row.newCust}</td>
                  <td className="pd-cbi-rose-text">{row.cacLabel}</td>
                  <td className="pd-cbi-emerald-text">{row.ltvLabel}</td>
                  <td className="pd-cbi-indigo-text"><strong>{row.ratio}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProductSectionFrame>
  );
}

export function CustomerProductAffinity() {
  const section = customerSectionsById.preferencje;

  return (
    <ProductSectionFrame
      description={(
        <>
          <span className="pd-cbi-context-pill">Afinitet Produktowy: Nowi vs Powracający</span>
          <br />
          Rzeczywiste pozycje zamówień z <strong>FactOrderLine</strong> rozdzielone według statusu klienta w momencie zakupu.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
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
    </ProductSectionFrame>
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
      <table className="pd-cbi-mini-table">
        <thead>
          <tr>
            <th>Produkt</th>
            <th>Zamówienia</th>
            <th>Przychód</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td><strong>{row.name}</strong></td>
              <td>{row.orders}</td>
              <td>{row.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export function CustomerExplorer({
  onOpenCustomer = noop,
  onRiskFilterChange = noop,
  onSegmentFilterChange = noop,
  riskFilter = 'all',
  segmentFilter = 'all',
}: {
  readonly onOpenCustomer?: (customerId: string) => void;
  readonly onRiskFilterChange?: (risk: CustomerRiskFilter) => void;
  readonly onSegmentFilterChange?: (segment: CustomerSegmentFilter) => void;
  readonly riskFilter?: CustomerRiskFilter;
  readonly segmentFilter?: CustomerSegmentFilter;
}) {
  const [query, setQuery] = useState('');
  const filteredRows = filterCustomers({
    query,
    riskFilter,
    segmentFilter,
  });

  const section = customerSectionsById.eksplorator;

  return (
    <ProductSectionFrame
      actions={(
        <div className="pd-cbi-explorer-controls">
          <input
            aria-label="Szukaj ID lub hashu"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj ID lub hashu..."
            type="search"
            value={query}
          />
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
        </div>
      )}
      description={(
        <>
          <span className="pd-cbi-context-pill">Server-Side Analytical View</span>
          <br />
          Analityczna tabela klientów zgodna z Privacy-by-Design. Zanonimizowane pseudonimy, brak wycieku PII.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-cbi-table-scroll">
        <table className="pd-cbi-simple-table">
          <thead>
            <tr>
              <th>Tożsamość</th>
              <th>Segment RFM</th>
              <th>Score</th>
              <th>Recency</th>
              <th>Orders</th>
              <th>Observed LTV</th>
              <th>AOV</th>
              <th>Status Ryzyka</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td><strong className="pd-cbi-mono">{row.id}</strong></td>
                <td>{row.segment}</td>
                <td className="pd-cbi-mono">{row.score}</td>
                <td>{row.recency}</td>
                <td>{row.orders}</td>
                <td><strong>{row.ltv}</strong></td>
                <td>{row.aov}</td>
                <td><CustomerRiskBadge risk={row.risk} label={row.riskLabel} /></td>
                <td>
                  <button className="pd-cbi-row-button" onClick={() => onOpenCustomer(row.id)} type="button">
                    Szczegóły →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="pd-cbi-table-footer">
        <span>Pokazano <strong>{filteredRows.length}</strong> z 24 860 klientów (Serwerowa paginacja)</span>
        <div>
          <button disabled type="button">Poprzednia</button>
          <strong>1</strong>
          <button type="button">2</button>
          <button type="button">Następna</button>
        </div>
      </footer>
    </ProductSectionFrame>
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
    <select aria-label={ariaLabel} onChange={onChange} value={value}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
  insights = customerAiInsights,
  onAnalyze = noop,
  onGenerate = noop,
  onShowEvidence = noop,
}: {
  readonly insights?: readonly CustomerAiInsight[];
  readonly onAnalyze?: () => void;
  readonly onGenerate?: () => void;
  readonly onShowEvidence?: () => void;
}) {
  const section = customerSectionsById.insight;

  return (
    <ProductSectionFrame
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
      description="Rekomendacje oparte o standard Obserwacja → Dowód → Rekomendacja → Wpływ."
      icon={section.icon}
      id={section.id}
      title={section.title}
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
    </ProductSectionFrame>
  );
}

function CustomerProvenanceModal({
  metricKey,
  onClose,
}: {
  readonly metricKey: CustomerProvenanceKey | null;
  readonly onClose: () => void;
}) {
  if (!metricKey) return null;

  const provenance = customerProvenanceDict[metricKey];

  return (
    <div className="pd-cbi-modal-backdrop" role="presentation">
      <section aria-label="Provenance danych klientów" aria-modal="true" className="pd-cbi-modal" role="dialog">
        <div className="pd-cbi-modal__head">
          <div>
            <span className={`pd-cbi-data-badge pd-cbi-data-badge--${provenance.badge === 'Model' ? 'amber' : 'emerald'}`}>{provenance.badge}</span>
            <h2>{provenance.title}</h2>
          </div>
          <button aria-label="Zamknij provenance" className="pd-cbi-icon-button" onClick={onClose} type="button">×</button>
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
      </section>
    </div>
  );
}

function CustomerDrawer({
  customer,
  onClose,
  onPrepareAction,
}: {
  readonly customer: CustomerExplorerRow | null;
  readonly onClose: () => void;
  readonly onPrepareAction: () => void;
}) {
  if (!customer) return null;

  return (
    <div className="pd-cbi-drawer-backdrop" role="presentation">
      <section aria-label="Customer Drawer" aria-modal="true" className="pd-cbi-drawer" role="dialog">
        <div className="pd-cbi-drawer__body">
          <header className="pd-cbi-drawer__head">
            <div>
              <div>
                <h2>{customer.id}</h2>
                <span>{customer.segment}</span>
              </div>
              <p>Privacy status: Hashed Identity (No PII Leaked)</p>
            </div>
            <button aria-label="Zamknij Customer Drawer" className="pd-cbi-icon-button" onClick={onClose} type="button">×</button>
          </header>

          <div className="pd-cbi-drawer-grid">
            <MetricTile label="Pierwsze zamówienie:" value="12.03.2024" />
            <MetricTile label="Ostatnie zamówienie:" value={`19.08.2026 (${customer.recency} temu)`} />
            <MetricTile label="Wartość (Observed LTV):" tone="emerald" value={customer.ltv} />
            <MetricTile label="Liczba zamówień:" value={`${customer.orders} zamówień`} />
          </div>

          <section>
            <h3>RFM Score Breakdown</h3>
            <div className="pd-cbi-rfm-breakdown">
              <MetricTile label="Recency Score" tone="indigo" value="5 / 5" />
              <MetricTile label="Frequency Score" tone="indigo" value="4 / 5" />
              <MetricTile label="Monetary Score" tone="indigo" value="5 / 5" />
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
        </div>

        <footer className="pd-cbi-drawer__footer">
          <button className="pd-cbi-primary-button" onClick={onPrepareAction} type="button">
            Przygotuj Działanie Retencyjne
          </button>
          <button className="pd-cbi-muted-button" onClick={onClose} type="button">
            Zamknij
          </button>
        </footer>
      </section>
    </div>
  );
}

function CustomerPapaModal({
  context,
  onClose,
}: {
  readonly context: string | null;
  readonly onClose: () => void;
}) {
  if (!context) return null;

  return (
    <div className="pd-cbi-modal-backdrop" role="presentation">
      <section aria-label="Papa AI dla Klientów" aria-modal="true" className="pd-cbi-modal" role="dialog">
        <div className="pd-cbi-modal__head">
          <div>
            <span className="pd-cbi-data-badge pd-cbi-data-badge--indigo">Papa AI</span>
            <h2>Retencyjny moduł rekomendacyjny</h2>
          </div>
          <button aria-label="Zamknij Papa AI" className="pd-cbi-icon-button" onClick={onClose} type="button">×</button>
        </div>
        <p className="pd-cbi-modal-copy">
          Uruchomiono moduł rekomendacyjny Papa AI dla kontekstu: {context}. Analiza została zrejestrowana w audycie.
        </p>
        <div className="pd-cbi-modal-actions">
          <button className="pd-cbi-primary-button" onClick={onClose} type="button">
            Zamknij analizę
          </button>
        </div>
      </section>
    </div>
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
  query,
  riskFilter,
  segmentFilter,
}: {
  readonly query: string;
  readonly riskFilter: CustomerRiskFilter;
  readonly segmentFilter: CustomerSegmentFilter;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return customerExplorerRows.filter((customer) => {
    const queryMatches = !normalizedQuery
      || customer.id.toLowerCase().includes(normalizedQuery)
      || customer.score.includes(normalizedQuery);
    const segmentMatches = segmentFilter === 'all' || customer.segment.includes(segmentFilter);
    const riskMatches = riskFilter === 'all' || customer.risk === riskFilter;

    return queryMatches && segmentMatches && riskMatches;
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
