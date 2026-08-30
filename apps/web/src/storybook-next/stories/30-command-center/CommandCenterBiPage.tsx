import type {
  CSSProperties,
  FormEvent,
} from 'react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Icon,
  MetricCard,
  ProductSectionFrame,
  ProductSectionTopbar,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  commandCenterSections,
  commandCenterSectionsById,
  commandCustomerCohorts,
  commandCustomers,
  commandDecisions,
  commandDriversWaterfall,
  commandFunnel,
  commandGuardian,
  commandIntegrations,
  commandKpis,
  commandMeta,
  commandPlan,
  commandProducts,
  commandRisks,
  commandSources,
  commandTimeSeries,
  commandTrendMetrics,
} from './CommandCenterBiPage.data';
import type {
  CommandCenterSectionId,
  CommandCenterTone,
  CommandCompareMode,
  CommandDateRange,
  CommandDecision,
  CommandKpi,
  CommandKpiKey,
  CommandKpiStatus,
  CommandProductSort,
  CommandRisk,
  CommandRiskStatus,
  CommandTrendMetric,
} from './CommandCenterBiPage.data';
import './CommandCenterBiPage.css';

type CommandModal =
  | 'custom_date'
  | 'pdf'
  | 'simulation';

type ChatMessage = {
  readonly sender: 'ai' | 'user';
  readonly text: string;
};

type CommandAnalysisContext = {
  readonly impact?: string;
  readonly name: string;
  readonly unit?: string;
  readonly value?: number | string;
};

const noop = () => undefined;

const toneColors = {
  amber: 'rgb(var(--pd-ccbi-amber-500))',
  blue: 'rgb(var(--pd-ccbi-blue-500))',
  cyan: 'rgb(var(--pd-ccbi-cyan-400))',
  emerald: 'rgb(var(--pd-ccbi-emerald-500))',
  indigo: 'rgb(var(--pd-ccbi-indigo-500))',
  rose: 'rgb(var(--pd-ccbi-rose-500))',
  slate: 'rgb(var(--pd-ccbi-slate-500))',
  violet: 'rgb(var(--pd-ccbi-violet-500))',
} as const satisfies Record<CommandCenterTone, string>;

const tooltipStyle: CSSProperties = {
  background: 'rgb(58 58 54)',
  border: '1px solid rgb(96 96 88)',
  borderRadius: 'var(--pd-radius-control)',
  boxShadow: '0 18px 36px rgb(0 0 0 / 0.28)',
  color: 'white',
  fontSize: 12,
};

export function CommandCenterBiPage() {
  const [dateRange, setDateRange] = useState<CommandDateRange>('30d');
  const [compareMode] = useState<CommandCompareMode>('previous_period');
  const [activeSection, setActiveSection] = useState<CommandCenterSectionId>('pulse');
  const [modal, setModal] = useState<CommandModal | null>(null);
  const [drawerContext, setDrawerContext] = useState<CommandAnalysisContext | null>(null);
  const [simulationDecision, setSimulationDecision] = useState<CommandDecision | null>(null);
  const [simulationParam, setSimulationParam] = useState(15);
  const [risks, setRisks] = useState<CommandRisk[]>(() => commandRisks.map((risk) => ({ ...risk })));
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState<CommandProductSort>('gmv');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const simulationResults = useMemo(() => {
    if (!simulationDecision) return null;

    const multiplier = simulationParam / 15;
    const marginGain = Math.round(simulationDecision.impactValue * multiplier);
    const newGmvForecast = commandPlan.forecast + marginGain;
    const newGoalCompletion = ((newGmvForecast / commandPlan.target) * 100).toFixed(1);
    const estimatedRoas = (4.15 + (0.15 * multiplier)).toFixed(2);

    return {
      estimatedRoas,
      marginGain,
      newGoalCompletion,
      newGmvForecast,
    };
  }, [simulationDecision, simulationParam]);

  const filteredProducts = useMemo(() => commandProducts
    .filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase()))
    .sort((left, right) => (productSort === 'margin' ? right.margin - left.margin : right.gmv - left.gmv)), [productSearch, productSort]);

  function openSimulation(decision: CommandDecision) {
    setSimulationDecision(decision);
    setSimulationParam(15);
    setModal('simulation');
  }

  function updateRiskStatus(id: string, status: CommandRiskStatus) {
    setRisks((prevRisks) => prevRisks.map((risk) => (risk.id === id ? { ...risk, status } : risk)));
  }

  function openAiDrawer(context: CommandAnalysisContext) {
    setDrawerContext(context);
    setChatMessages([
      {
        sender: 'ai',
        text: `Przeanalizowałem dokładny kontekst dla metryki "${context.name}". Czy chcesz wiedzieć, jakie czynniki bezpośrednio wpłynęły na jej wartość?`,
      },
    ]);
  }

  function handleSendMessage(textToSend?: string) {
    const query = textToSend ?? chatInput;
    if (!query.trim()) return;

    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'user',
        text: query,
      },
      {
        sender: 'ai',
        text: createAiReply(query, dateRange),
      },
    ]);
    if (!textToSend) setChatInput('');
  }

  return (
    <main className="pd-ccbi" data-testid="command-center-bi-page">
      <CommandCenterAnchorNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="pd-ccbi__content">
        <CommandPulseSection
          compareMode={compareMode}
          dateRange={dateRange}
          kpis={commandKpis}
          onAnalyze={openAiDrawer}
        />
        <CommandGuardianSection
          decisions={commandDecisions}
          guardian={commandGuardian}
          onAnalyze={openAiDrawer}
          onSimulate={openSimulation}
        />
        <CommandPlanSection />
        <CommandDriversSection />
        <CommandRisksSection
          onAnalyze={openAiDrawer}
          onRiskStatusChange={updateRiskStatus}
          risks={risks}
        />
        <CommandEvidenceLayer
          filteredProducts={filteredProducts}
          onProductSearchChange={setProductSearch}
          onProductSortChange={setProductSort}
          productSearch={productSearch}
          productSort={productSort}
        />
      </div>

      <CommandSimulationModal
        decision={simulationDecision}
        onApply={() => setModal(null)}
        onClose={() => setModal(null)}
        onParamChange={setSimulationParam}
        open={modal === 'simulation'}
        param={simulationParam}
        results={simulationResults}
      />
      <CommandPdfModal
        dateRange={dateRange}
        onClose={() => setModal(null)}
        onDownload={() => setModal(null)}
        open={modal === 'pdf'}
      />
      <CommandCustomDateModal
        onApply={() => {
          setDateRange('custom');
          setModal(null);
        }}
        onClose={() => setModal(null)}
        open={modal === 'custom_date'}
      />
      <CommandPapaDrawer
        chatInput={chatInput}
        chatMessages={chatMessages}
        compareMode={compareMode}
        context={drawerContext}
        dateRange={dateRange}
        onChatInputChange={setChatInput}
        onClose={() => setDrawerContext(null)}
        onSendMessage={handleSendMessage}
      />
    </main>
  );
}

export function CommandCenterAnchorNav({
  activeSection = 'pulse',
  onSectionChange = noop,
}: {
  readonly activeSection?: CommandCenterSectionId;
  readonly onSectionChange?: (section: CommandCenterSectionId) => void;
}) {
  return (
    <ProductSectionTopbar
      activeId={activeSection}
      ariaLabel="Sekcje Centrum Dowodzenia"
      items={commandCenterSections.map((section) => ({
        id: section.id,
        label: section.navLabel,
      }))}
      onActiveIdChange={(id) => onSectionChange(id as CommandCenterSectionId)}
    />
  );
}

export function CommandPulseSection({
  compareMode = 'previous_period',
  dateRange = '30d',
  kpis = commandKpis,
  onAnalyze = noop,
}: {
  readonly compareMode?: CommandCompareMode;
  readonly dateRange?: CommandDateRange;
  readonly kpis?: readonly CommandKpi[];
  readonly onAnalyze?: (context: CommandAnalysisContext) => void;
}) {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-blue"
      description={`Jaki jest wynik biznesowy w wybranym okresie (${dateRange})?`}
      icon={commandCenterSectionsById.pulse.icon}
      id={commandCenterSectionsById.pulse.id}
      title={commandCenterSectionsById.pulse.title}
    >
      <div className="pd-ccbi-kpi-grid">
        {kpis.map((kpi) => {
          const isNegativeBad = kpi.id === 'ad_spend' || kpi.id === 'cac';
          const isPositiveChange = kpi.change >= 0;
          const isGoodChange = isNegativeBad ? !isPositiveChange : isPositiveChange;
          return (
            <MetricCard
              comparison={{
                direction: isPositiveChange ? 'up' : 'down',
                label: `${Math.abs(kpi.change)}% vs ${compareMode === 'previous_period' ? 'poprzednie 30 dni' : 'rok wcześniej'}`,
              }}
              detailAction={{ label: 'Analizuj →', onAction: () => onAnalyze({ name: kpi.name, unit: kpi.unit, value: kpi.value }) }}
              helpText={kpi.description}
              key={kpi.id}
              label={kpi.name}
              metricId={`command-kpi-${kpi.id}`}
              signal={kpi.status === 'critical' ? 'negative' : kpi.status === 'warning' ? 'warning' : isGoodChange ? 'positive' : 'neutral'}
              sparklinePoints={kpi.sparkline}
              status={commandKpiStatusToDataState(kpi.status)}
              statusLabel={commandKpiStatusLabel(kpi.status)}
              unit={kpi.unit}
              value={formatMetricValue(kpi.value, kpi.id)}
            />
          );
        })}
      </div>

      <CommandTrendAreaChart />
    </ProductSectionFrame>
  );
}

function commandKpiStatusToDataState(status: CommandKpi['status']): AnalyticsDataState {
  switch (status) {
    case 'critical':
      return 'error';
    case 'warning':
      return 'stale';
    default:
      return 'ready';
  }
}

function commandKpiStatusLabel(status: CommandKpi['status']): string {
  const labels = {
    critical: 'Anomalia',
    insight: 'Insight',
    normal: 'W normie',
    warning: 'Ryzyko',
  } as const;

  return labels[status];
}

function InfoTip({
  label,
}: {
  readonly label: string;
}) {
  return (
    <span className="pd-ccbi-info-tip">
      <button aria-label={`Informacja: ${label}`} className="pd-ccbi-info-tip__trigger" type="button">
        ?
      </button>
      <div className="pd-ccbi-info-tip__bubble" role="tooltip">{label}</div>
    </span>
  );
}

export function CommandTrendAreaChart({
  initialMetric = 'gmv',
}: {
  readonly initialMetric?: CommandTrendMetric;
}) {
  const [activeMetric, setActiveMetric] = useState<CommandTrendMetric>(initialMetric);
  const metricConfig = commandTrendMetrics.find((metric) => metric.value === activeMetric) ?? commandTrendMetrics[0];

  return (
    <section className="pd-ccbi-chart-panel">
      <div className="pd-ccbi-chart-panel__head">
        <div>
          <span className={`pd-ccbi-dot pd-ccbi-dot--${metricConfig.tone}`} />
          <h3>Dynamika Czasowa: {metricConfig.label}</h3>
        </div>

        <div className="pd-ccbi-chart-toggle" role="group" aria-label="Metryka trendu Centrum Dowodzenia">
          {commandTrendMetrics.map((metric) => (
            <button
              className={metric.value === activeMetric ? 'is-active' : ''}
              key={metric.value}
              onClick={() => setActiveMetric(metric.value)}
              type="button"
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-label={`Dynamika Czasowa: ${metricConfig.label}`}
        className="pd-ccbi-chart"
        role="img"
      >
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={commandTimeSeries} margin={{ bottom: 8, left: 0, right: 14, top: 12 }}>
            <defs>
              <linearGradient id={`pd-ccbi-trend-${activeMetric}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={toneColors[metricConfig.tone]} stopOpacity={0.36} />
                <stop offset="100%" stopColor={toneColors[metricConfig.tone]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(var(--pd-ccbi-slate-800))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgb(var(--pd-ccbi-slate-500))"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="rgb(var(--pd-ccbi-slate-500))"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => formatChartTick(Number(value), activeMetric)}
              tickLine={false}
              width={64}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${formatChartValue(Number(value), activeMetric)} ${metricConfig.unit}`, metricConfig.label]}
              labelStyle={{ color: 'rgb(185 189 192)', fontWeight: 800 }}
            />
            <Area
              dataKey={activeMetric}
              fill={`url(#pd-ccbi-trend-${activeMetric})`}
              stroke={toneColors[metricConfig.tone]}
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pd-ccbi-chart-panel__footer">
        <span>{commandTimeSeries[0].date}</span>
        <span>Kontekst dzienny w wybranym okresie</span>
        <span>{commandTimeSeries[commandTimeSeries.length - 1].date}</span>
      </div>
    </section>
  );
}

export function CommandGuardianSection({
  decisions = commandDecisions,
  guardian = commandGuardian,
  onAnalyze = noop,
  onSimulate = noop,
}: {
  readonly decisions?: readonly CommandDecision[];
  readonly guardian?: typeof commandGuardian;
  readonly onAnalyze?: (context: CommandAnalysisContext) => void;
  readonly onSimulate?: (decision: CommandDecision) => void;
}) {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-indigo"
      description="Syntetyczna diagnoza AI oraz sugerowane kroki optymalizacyjne"
      icon={commandCenterSectionsById.guardian.icon}
      id={commandCenterSectionsById.guardian.id}
      title={commandCenterSectionsById.guardian.title}
    >
      <div className="pd-ccbi-guardian">
        <div className="pd-ccbi-guardian__label">
          <span className="pd-ccbi-live-dot" />
          Syntetyczna Narracja Papa Guardian
        </div>
        <div className="pd-ccbi-guardian-grid">
          <InsightTile label="Stan biznesu:" tone="slate" value={guardian.summary} />
          <InsightTile label="Przyczyna (Dlaczego):" tone="slate" value={guardian.why} />
          <InsightTile label="Rekomendacja akcji:" tone="emerald" value={guardian.action} />
        </div>
      </div>

      <div className="pd-ccbi-card-panel">
        <h3>Rekomendacje z priorytetem ("Decyzje na teraz")</h3>
        <div className="pd-ccbi-decision-list">
          {decisions.map((decision) => (
            <article className="pd-ccbi-decision-card" key={decision.id}>
              <div>
                <div className="pd-ccbi-decision-card__title">
                  <span>{decision.category}</span>
                  <h4>{decision.title}</h4>
                </div>
                <p>{decision.reason}</p>
                <div className="pd-ccbi-decision-card__meta">
                  <span>Wpływ: <strong>{decision.impact}</strong></span>
                  <span>Pewność AI: <strong>{decision.confidence}</strong></span>
                  <span>Typ: <code>{decision.type}</code></span>
                </div>
              </div>
              <div className="pd-ccbi-decision-card__actions">
                {decision.simulatable ? (
                  <button className="pd-ccbi-primary-button" onClick={() => onSimulate(decision)} type="button">
                    <Icon decorative name="trend" size={16} />
                    Symuluj wpływ
                  </button>
                ) : null}
                <button className="pd-ccbi-muted-button" onClick={() => onAnalyze({ impact: decision.impact, name: decision.title })} type="button">
                  Analizuj
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ProductSectionFrame>
  );
}

export function CommandPlanSection() {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-emerald"
      actions={(
        <div className="pd-ccbi-plan-stat">
          <span>Prognozowana realizacja celu</span>
          <strong>{commandPlan.forecastCompletion}%</strong>
        </div>
      )}
      description="Czy dowieziemy cel biznesowy przy obecnym tempie (Pace Projection)?"
      icon={commandCenterSectionsById.plan.icon}
      id={commandCenterSectionsById.plan.id}
      title={commandCenterSectionsById.plan.title}
    >
      <div className="pd-ccbi-plan-progress">
        <div>
          <span>Aktualny wynik: {formatMoney(commandPlan.actual)} ({commandPlan.completion}%)</span>
          <span>Cel: {formatMoney(commandPlan.target)}</span>
        </div>
        <div className="pd-ccbi-plan-track">
          <i style={{ width: `${commandPlan.completion}%` }} />
          <b style={{ left: `${commandPlan.forecastCompletion}%` }} />
        </div>
        <div>
          <span>Początek okresu</span>
          <span>Prognoza na koniec: <strong>{formatMoney(commandPlan.forecast)}</strong></span>
          <span>100% Cel</span>
        </div>
      </div>

      <div className="pd-ccbi-warning-note">
        <Icon decorative name="warning" size={16} />
        <span>{commandPlan.statusText}</span>
      </div>
    </ProductSectionFrame>
  );
}

export function CommandDriversSection() {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-cyan"
      description="Co spowodowało zmianę wyniku względem poprzedniego okresu (+14 170 zł netto)?"
      icon={commandCenterSectionsById.drivers.icon}
      id={commandCenterSectionsById.drivers.id}
      title={commandCenterSectionsById.drivers.title}
    >
      <div className="pd-ccbi-driver-summary">
        <InsightTile label="Największy hamulec:" tone="rose" value="Spadek AOV (-4 240 zł)" />
        <InsightTile label="Największe wsparcie:" tone="emerald" value="Liczba zamówień (+12 210 zł)" />
        <InsightTile label="Wpływ netto delta:" tone="blue" value="+14 170 PLN" />
      </div>

      <CommandWaterfallChart />
    </ProductSectionFrame>
  );
}

export function CommandRisksSection({
  onAnalyze = noop,
  onRiskStatusChange = noop,
  risks = commandRisks,
}: {
  readonly onAnalyze?: (context: CommandAnalysisContext) => void;
  readonly onRiskStatusChange?: (id: string, status: CommandRiskStatus) => void;
  readonly risks?: readonly CommandRisk[];
}) {
  const visibleRisks = risks.filter((risk) => risk.status !== 'dismissed');

  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-rose"
      actions={(
        <div className="pd-ccbi-risk-counts">
          <span>1 Krytyczne</span>
          <span>1 Ostrzeżenie</span>
        </div>
      )}
      description="Zarządzanie operacyjnymi zagrożeniami wyniku biznesowego"
      icon={commandCenterSectionsById.alerts.icon}
      id={commandCenterSectionsById.alerts.id}
      title={commandCenterSectionsById.alerts.title}
    >
      <div className="pd-ccbi-risk-list">
        {visibleRisks.map((risk) => (
          <article className={`pd-ccbi-risk-card pd-ccbi-risk-card--${risk.severity}`} key={risk.id}>
            <div>
              <div className="pd-ccbi-risk-card__title">
                <span>{risk.severity}</span>
                <h3>{risk.title}</h3>
                {risk.status === 'acknowledged' ? <em>Przyjęte do wiadomości</em> : null}
              </div>
              <p>{risk.desc}</p>
              <small>
                Szacowany wpływ: <strong>{risk.impact}</strong> · Rekomendacja: <b>{risk.action}</b>
              </small>
            </div>

            <div className="pd-ccbi-risk-card__actions">
              {risk.status === 'open' ? (
                <button className="pd-ccbi-muted-button" onClick={() => onRiskStatusChange(risk.id, 'acknowledged')} type="button">
                  Przyjmij
                </button>
              ) : null}
              <button className="pd-ccbi-ghost-button" onClick={() => onRiskStatusChange(risk.id, 'dismissed')} type="button">
                Odrzuć
              </button>
              <button className="pd-ccbi-danger-button" onClick={() => onAnalyze({ impact: risk.impact, name: risk.title })} type="button">
                Analizuj
              </button>
            </div>
          </article>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

export function CommandEvidenceLayer({
  filteredProducts = commandProducts,
  onExport = noop,
  onProductSearchChange = noop,
  onProductSortChange = noop,
  productSearch = '',
  productSort = 'gmv',
}: {
  readonly filteredProducts?: readonly typeof commandProducts[number][];
  readonly onExport?: (type: 'products' | 'sources') => void;
  readonly onProductSearchChange?: (value: string) => void;
  readonly onProductSortChange?: (sort: CommandProductSort) => void;
  readonly productSearch?: string;
  readonly productSort?: CommandProductSort;
}) {
  return (
    <div className="pd-ccbi-evidence-layer">
      <CommandFunnelSection />
      <CommandSourcesSection onExport={() => onExport('sources')} />
      <CommandProductsSection
        onExport={() => onExport('products')}
        onProductSearchChange={onProductSearchChange}
        onProductSortChange={onProductSortChange}
        productSearch={productSearch}
        productSort={productSort}
        products={filteredProducts}
      />
      <CommandCustomersSection />
      <CommandDataHealthSection />
    </div>
  );
}

export function CommandFunnelSection() {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-violet"
      description="W którym miejscu proces zakupu traci najwięcej klientów?"
      icon={commandCenterSectionsById.funnel.icon}
      id={commandCenterSectionsById.funnel.id}
      title={commandCenterSectionsById.funnel.title}
    >
      <div className="pd-ccbi-funnel-grid">
        {commandFunnel.map((step) => (
          <article className="pd-ccbi-funnel-card" key={step.stage}>
            <span className="pd-ccbi-funnel-card__title">
              <span>{step.stage}</span>
              <InfoTip label={step.description} />
            </span>
            <strong>{formatNumber(step.count)}</strong>
            <div>
              <b>{step.rate} przejść</b>
              <em className={step.delta.startsWith('+') ? 'pd-ccbi-text-emerald' : 'pd-ccbi-text-rose'}>{step.delta}</em>
            </div>
            <div className="pd-ccbi-mini-track">
              <i className={`pd-ccbi-bg-${step.tone}`} style={{ width: `${step.pctOfTotal}%` }} />
            </div>
          </article>
        ))}
      </div>

      <div className="pd-ccbi-insight-note">
        <strong>Diagnostyka lejka:</strong>
        <span>Największa utrata występuje na etapie Checkout → Zakup (-14.0%). Zalecana weryfikacja dostępności szybkich metod płatności (BLIK/Apple Pay) oraz kosztów dostawy na ostatnim kroku koszyka.</span>
      </div>
    </ProductSectionFrame>
  );
}

export function CommandSourcesSection({
  onExport = noop,
}: {
  readonly onExport?: () => void;
}) {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-amber"
      actions={(
        <button className="pd-ccbi-muted-button" onClick={onExport} type="button">
          <Icon decorative name="data" size={16} />
          Eksportuj CSV
        </button>
      )}
      description="Podział GMV i udziału według kanałów pozyskania ruchu"
      icon={commandCenterSectionsById.sources.icon}
      id={commandCenterSectionsById.sources.id}
      title={commandCenterSectionsById.sources.title}
    >
      <RevenueDonutChart />

      <CommandDataTable
        columns={['Kanał', 'GMV', 'Udział w sprzedaży', 'Zmiana', 'Współczynnik Konwersji']}
        rows={commandSources.map((source) => [
          source.name,
          `${formatNumber(source.gmv)} PLN`,
          <ShareCell key={`${source.name}-share`} share={source.share} tone={source.tone} />,
          <span className={source.change.startsWith('+') ? 'pd-ccbi-text-emerald' : 'pd-ccbi-text-rose'} key={`${source.name}-change`}>{source.change}</span>,
          source.cr,
        ])}
      />
    </ProductSectionFrame>
  );
}

export function CommandProductsSection({
  onExport = noop,
  onProductSearchChange = noop,
  onProductSortChange = noop,
  productSearch = '',
  productSort = 'gmv',
  products = commandProducts,
}: {
  readonly onExport?: () => void;
  readonly onProductSearchChange?: (value: string) => void;
  readonly onProductSortChange?: (sort: CommandProductSort) => void;
  readonly productSearch?: string;
  readonly productSort?: CommandProductSort;
  readonly products?: readonly typeof commandProducts[number][];
}) {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-slate"
      actions={(
        <div className="pd-ccbi-product-tools">
          <input
            aria-label="Szukaj produktu"
            onChange={(event) => onProductSearchChange(event.target.value)}
            placeholder="Szukaj produktu..."
            type="search"
            value={productSearch}
          />
          <CommandSortMenu onChange={onProductSortChange} value={productSort} />
          <button className="pd-ccbi-muted-button" onClick={onExport} type="button">
            <Icon decorative name="data" size={16} />
            CSV
          </button>
        </div>
      )}
      description="Co najmocniej sprzedaje i generuje marżę?"
      icon={commandCenterSectionsById.products.icon}
      id={commandCenterSectionsById.products.id}
      title={commandCenterSectionsById.products.title}
    >
      <ProductScatterMatrix products={products} />

      <CommandDataTable
        columns={['Produkt', 'Przychód (GMV)', 'Udział %', 'Marża %', 'Sygnał AI']}
        rows={products.map((product) => [
          product.name,
          `${formatNumber(product.gmv)} PLN`,
          `${product.share}%`,
          <span className="pd-ccbi-text-emerald" key={`${product.id}-margin`}>{product.margin}%</span>,
          <span className={`pd-ccbi-signal pd-ccbi-signal--${signalTone(product.signal)}`} key={`${product.id}-signal`}>{product.signal}</span>,
        ])}
      />
    </ProductSectionFrame>
  );
}

const productSortOptions: readonly {
  readonly label: string;
  readonly value: CommandProductSort;
}[] = [
  { label: 'Sortuj: GMV', value: 'gmv' },
  { label: 'Sortuj: Marża %', value: 'margin' },
];

function CommandSortMenu({
  onChange,
  value,
}: {
  readonly onChange: (value: CommandProductSort) => void;
  readonly value: CommandProductSort;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeOption = productSortOptions.find((option) => option.value === value) ?? productSortOptions[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="pd-ccbi-sort-menu" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="pd-ccbi-sort-menu__trigger"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        type="button"
      >
        {activeOption.label}
        <svg aria-hidden="true" height="14" viewBox="0 0 24 24" width="14">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
      {open ? (
        <ul aria-label="Sortowanie produktów" className="pd-ccbi-sort-menu__list" role="listbox">
          {productSortOptions.map((option) => (
            <li
              aria-selected={option.value === value}
              className={option.value === value ? 'is-selected' : ''}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              role="option"
            >
              {option.label}
              {option.value === value ? (
                <svg aria-hidden="true" height="14" viewBox="0 0 24 24" width="14">
                  <path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CommandCustomersSection() {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-indigo"
      description="Nowi vs Powracający kupujący w wybranym okresie"
      icon={commandCenterSectionsById.customers.icon}
      id={commandCenterSectionsById.customers.id}
      title={commandCenterSectionsById.customers.title}
    >
      <CohortsStackedChart />

      <div className="pd-ccbi-customer-grid">
        <MetricBox
          description="Klienci, którzy złożyli pierwsze zamówienie w wybranym okresie."
          label="Nowi klienci"
          meta={`AOV: ${commandCustomers.newAov}`}
          tone="slate"
          value={String(commandCustomers.newCount)}
        />
        <MetricBox
          description="Klienci z co najmniej jednym wcześniejszym zamówieniem sprzed wybranego okresu."
          label="Powracający klienci"
          meta={`AOV: ${commandCustomers.retAov}`}
          tone="slate"
          value={String(commandCustomers.retCount)}
        />
        <MetricBox
          description="Udział przychodu wygenerowanego przez klientów powracających w całkowitym GMV okresu."
          label="Udział powracających"
          tone="blue"
          value={commandCustomers.returningShare}
        />
        <MetricBox
          description="Odsetek klientów z co najmniej dwoma zamówieniami w analizowanym okresie."
          label="Repeat Purchase Rate"
          tone="emerald"
          value={commandCustomers.repeatPurchaseRate}
        />
      </div>

      <div className="pd-ccbi-insight-note">
        <strong>Wniosek dotyczący LTV:</strong>
        <span>{commandCustomers.takeaway}</span>
      </div>
    </ProductSectionFrame>
  );
}

export function CommandDataHealthSection() {
  return (
    <ProductSectionFrame
      accentClassName="pd-ccbi-text-blue"
      description="Spójność oraz opóźnienia źródeł zasilających raport"
      icon={commandCenterSectionsById['data-health'].icon}
      id={commandCenterSectionsById['data-health'].id}
      title={commandCenterSectionsById['data-health'].title}
    >
      <DataQualityGauge />
    </ProductSectionFrame>
  );
}

function InsightTile({
  label,
  tone,
  value,
}: {
  readonly label: string;
  readonly tone: CommandCenterTone;
  readonly value: string;
}) {
  return (
    <article className={`pd-ccbi-insight-tile pd-ccbi-insight-tile--${tone}`}>
      <span>{label}</span>
      <p>{value}</p>
    </article>
  );
}

function CommandWaterfallChart() {
  const maxAmount = Math.max(...commandDriversWaterfall.map((driver) => Math.abs(driver.amount)));

  return (
    <section className="pd-ccbi-chart-panel">
      <h3>Kaskada Zmiany Wyniku (Waterfall Drivers)</h3>
      <div className="pd-ccbi-waterfall" role="img" aria-label="Kaskada Zmiany Wyniku">
        {commandDriversWaterfall.map((driver) => {
          const tone = driver.type === 'positive'
            ? 'emerald'
            : driver.type === 'negative'
              ? 'rose'
              : driver.type === 'total'
                ? 'indigo'
                : 'slate';
          const height = Math.max(12, (Math.abs(driver.amount) / maxAmount) * 100);

          return (
            <article className="pd-ccbi-waterfall__bar" key={driver.name}>
              <strong>{driver.amount > 0 && driver.type !== 'base' && driver.type !== 'total' ? '+' : ''}{formatNumber(driver.amount)}</strong>
              <div>
                <i className={`pd-ccbi-bg-${tone}`} style={{ height: `${height}%` }} />
              </div>
              <span>{driver.name.split(' ')[0]}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RevenueDonutChart() {
  const totalGmv = commandSources.reduce((sum, source) => sum + source.gmv, 0);
  let cursor = 0;
  const gradientStops = commandSources.map((source) => {
    const start = cursor;
    cursor += source.share;
    return `${toneColors[source.tone]} ${start}% ${cursor}%`;
  }).join(', ');

  return (
    <section className="pd-ccbi-chart-panel pd-ccbi-donut-panel">
      <div className="pd-ccbi-donut" style={{ background: `conic-gradient(${gradientStops})` }}>
        <div>
          <span>Łącznie GMV</span>
          <strong>{formatMoney(totalGmv)}</strong>
        </div>
      </div>
      <div className="pd-ccbi-donut-legend">
        {commandSources.map((source) => (
          <div key={source.name}>
            <span className={`pd-ccbi-dot pd-ccbi-dot--${source.tone}`} />
            <strong>{source.name}</strong>
            <code>{formatMoney(source.gmv)}</code>
            <em>{source.share}%</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductScatterMatrix({
  products,
}: {
  readonly products: readonly typeof commandProducts[number][];
}) {
  return (
    <section className="pd-ccbi-chart-panel">
      <div className="pd-ccbi-chart-panel__head">
        <div>
          <h3>Macierz Marża vs Przychód (BCG Product Quadrants)</h3>
        </div>
        <span>Y: Marża % | X: GMV</span>
      </div>

      <div className="pd-ccbi-scatter" role="img" aria-label="Macierz Marża vs Przychód">
        <div className="pd-ccbi-scatter__quadrants">
          <span>Gwiazdy</span>
          <span>Okazje</span>
          <span>Wyzwania</span>
          <span>Niska marża</span>
        </div>
        {products.map((product) => {
          const left = 8 + (product.gmv / 55000) * 84;
          const bottom = 8 + (product.margin / 70) * 78;
          const tone = product.margin > 40 ? 'emerald' : 'amber';

          return (
            <div
              className={`pd-ccbi-scatter__point pd-ccbi-bg-${tone}`}
              key={product.id}
              style={{ bottom: `${bottom}%`, left: `${left}%` }}
              title={`${product.name}: ${product.margin}%`}
            >
              <span>{product.name.split(' ')[0]} ({product.margin}%)</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CohortsStackedChart() {
  return (
    <section className="pd-ccbi-chart-panel">
      <div className="pd-ccbi-chart-panel__head">
        <div>
          <h3>Struktura Nabywców w Czasie (Nowi vs Powracający)</h3>
        </div>
        <div className="pd-ccbi-inline-legend">
          <span><i className="pd-ccbi-bg-indigo" />Nowi Klienci</span>
          <span><i className="pd-ccbi-bg-emerald" />Powracający</span>
        </div>
      </div>

      <div className="pd-ccbi-cohort-bars">
        {commandCustomerCohorts.map((cohort) => {
          const totalGmv = cohort.newGmv + cohort.retGmv;
          const newPct = (cohort.newGmv / totalGmv) * 100;
          const retPct = (cohort.retGmv / totalGmv) * 100;

          return (
            <article key={cohort.week}>
              <div>
                <i className="pd-ccbi-bg-emerald" style={{ height: `${retPct}%` }} />
                <i className="pd-ccbi-bg-indigo" style={{ height: `${newPct}%` }} />
              </div>
              <strong>{cohort.week}</strong>
              <span>{(totalGmv / 1000).toFixed(1)}k PLN</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DataQualityGauge() {
  return (
    <section className="pd-ccbi-chart-panel pd-ccbi-health-panel">
      <div className="pd-ccbi-gauge" style={{ background: `conic-gradient(${toneColors.indigo} ${commandMeta.dataQualityScore}%, rgb(var(--pd-ccbi-slate-800)) 0)` }}>
        <div>
          <strong>{commandMeta.dataQualityScore}</strong>
          <span>Score</span>
        </div>
      </div>

      <div className="pd-ccbi-latency-list">
        <strong>Opóźnienia API i Status Synchronizacji:</strong>
        {commandIntegrations.map((integration) => (
          <div key={integration.name}>
            <div>
              <span>{integration.name}</span>
              <code>{integration.latency}</code>
            </div>
            <b>
              <i className={integration.status === 'fresh' ? 'pd-ccbi-bg-emerald' : 'pd-ccbi-bg-amber'} style={{ width: integration.status === 'fresh' ? '30%' : '80%' }} />
            </b>
            <small>{integration.lastSync}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function Sparkline({
  data,
  tone,
}: {
  readonly data: readonly number[];
  readonly tone: CommandCenterTone;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 96;
  const height = 34;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg aria-hidden="true" className="pd-ccbi-sparkline" height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <polyline fill="none" points={points} stroke={toneColors[tone]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CommandDataTable({
  columns,
  rows,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly React.ReactNode[])[];
}) {
  return (
    <div className="pd-ccbi-table-wrap">
      <table className="pd-ccbi-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.map((cell) => String(cell)).join('-') || rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${columns[cellIndex]}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ShareCell({
  share,
  tone,
}: {
  readonly share: number;
  readonly tone: CommandCenterTone;
}) {
  return (
    <span className="pd-ccbi-share-cell">
      {share}%
      <i>
        <b className={`pd-ccbi-bg-${tone}`} style={{ width: `${share}%` }} />
      </i>
    </span>
  );
}

function MetricBox({
  description,
  label,
  meta,
  tone,
  value,
}: {
  readonly description?: string;
  readonly label: string;
  readonly meta?: string;
  readonly tone: CommandCenterTone;
  readonly value: string;
}) {
  return (
    <article className="pd-ccbi-metric-box">
      <span className="pd-ccbi-metric-box__title">
        <span>{label}</span>
        {description ? <InfoTip label={description} /> : null}
      </span>
      <strong className={`pd-ccbi-text-${tone}`}>{value}</strong>
      {meta ? <small>{meta}</small> : null}
    </article>
  );
}

function CommandSimulationModal({
  decision,
  onApply,
  onClose,
  onParamChange,
  open,
  param,
  results,
}: {
  readonly decision: CommandDecision | null;
  readonly onApply: () => void;
  readonly onClose: () => void;
  readonly onParamChange: (param: number) => void;
  readonly open: boolean;
  readonly param: number;
  readonly results: {
    readonly estimatedRoas: string;
    readonly marginGain: number;
    readonly newGoalCompletion: string;
    readonly newGmvForecast: number;
  } | null;
}) {
  if (!open || !decision || !results) return null;

  return (
    <div className="pd-ccbi-modal-overlay">
      <section aria-label="Symulator Scenariuszy What-If" className="pd-ccbi-modal" role="dialog">
        <div className="pd-ccbi-modal__head">
          <div>
            <span>Symulator Scenariuszy What-If</span>
            <h3>{decision.title}</h3>
          </div>
          <button aria-label="Zamknij symulator" onClick={onClose} type="button">×</button>
        </div>

        <label className="pd-ccbi-sim-slider">
          <span>Dostosuj próg optymalizacji / zmianę budżetu: <strong>{param}%</strong></span>
          <input
            max={50}
            min={5}
            onChange={(event) => onParamChange(Number(event.target.value))}
            type="range"
            value={param}
          />
          <small><span>Konserwatywnie (-5%)</span><span>Agresywnie (-50%)</span></small>
        </label>

        <div className="pd-ccbi-modal-grid">
          <MetricBox label="Stan bazowy (Aktualny):" meta="ROAS 4.15x" tone="slate" value="18 200 PLN Koszt" />
          <MetricBox label="Scenariusz po zmianie:" meta={`ROAS ~${results.estimatedRoas}x · Cel: ${results.newGoalCompletion}%`} tone="emerald" value={`+${formatNumber(results.marginGain)} PLN marży`} />
        </div>

        <div className="pd-ccbi-info-note">
          <strong>Uwaga:</strong>
          <span>Wynik jest predykcją algorytmu predykcyjnego (Pewność: {decision.confidence}).</span>
        </div>

        <div className="pd-ccbi-modal-actions">
          <button className="pd-ccbi-muted-button" onClick={onClose} type="button">Zamknij</button>
          <button className="pd-ccbi-primary-button" onClick={onApply} type="button">Zastosuj zmianę w kampanii</button>
        </div>
      </section>
    </div>
  );
}

function CommandPdfModal({
  dateRange,
  onClose,
  onDownload,
  open,
}: {
  readonly dateRange: CommandDateRange;
  readonly onClose: () => void;
  readonly onDownload: () => void;
  readonly open: boolean;
}) {
  if (!open) return null;

  return (
    <div className="pd-ccbi-modal-overlay">
      <section aria-label="Eksport Raportu PDF dla Zarządu" className="pd-ccbi-modal pd-ccbi-modal--narrow" role="dialog">
        <div className="pd-ccbi-modal__head">
          <h3>Eksport Raportu PDF dla Zarządu</h3>
          <button aria-label="Zamknij PDF" onClick={onClose} type="button">×</button>
        </div>
        <p>Wybrany zakres dashboardu to <strong>{dateRange}</strong>. Zgodnie z wytycznymi produktowymi raport PDF zostanie skalibrowany do podsumowania ostatnich 30 dni.</p>
        <div className="pd-ccbi-pdf-list">
          <span>✓ Executive summary i Puls biznesu</span>
          <span>✓ Narracja Papa Guardian i kluczowe ryzyka</span>
          <span>✓ Stopień realizacji planu oraz prognoza pace_projection</span>
        </div>
        <div className="pd-ccbi-modal-actions">
          <button className="pd-ccbi-muted-button" onClick={onClose} type="button">Anuluj</button>
          <button className="pd-ccbi-primary-button" onClick={onDownload} type="button">Pobierz PDF</button>
        </div>
      </section>
    </div>
  );
}

function CommandCustomDateModal({
  onApply,
  onClose,
  open,
}: {
  readonly onApply: () => void;
  readonly onClose: () => void;
  readonly open: boolean;
}) {
  if (!open) return null;

  return (
    <div className="pd-ccbi-modal-overlay">
      <section aria-label="Wybierz Własny Zakres Dat" className="pd-ccbi-modal pd-ccbi-modal--narrow" role="dialog">
        <div className="pd-ccbi-modal__head">
          <h3>Wybierz Własny Zakres Dat</h3>
          <button aria-label="Zamknij zakres dat" onClick={onClose} type="button">×</button>
        </div>
        <label className="pd-ccbi-date-input">
          <span>Data początkowa:</span>
          <input defaultValue="2026-08-01" type="date" />
        </label>
        <label className="pd-ccbi-date-input">
          <span>Data końcowa:</span>
          <input defaultValue="2026-08-28" type="date" />
        </label>
        <div className="pd-ccbi-modal-actions">
          <button className="pd-ccbi-muted-button" onClick={onClose} type="button">Anuluj</button>
          <button className="pd-ccbi-primary-button" onClick={onApply} type="button">Zastosuj</button>
        </div>
      </section>
    </div>
  );
}

function CommandPapaDrawer({
  chatInput,
  chatMessages,
  compareMode,
  context,
  dateRange,
  onChatInputChange,
  onClose,
  onSendMessage,
}: {
  readonly chatInput: string;
  readonly chatMessages: readonly ChatMessage[];
  readonly compareMode: CommandCompareMode;
  readonly context: CommandAnalysisContext | null;
  readonly dateRange: CommandDateRange;
  readonly onChatInputChange: (value: string) => void;
  readonly onClose: () => void;
  readonly onSendMessage: (message?: string) => void;
}) {
  if (!context) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSendMessage();
  }

  return (
    <aside aria-label="Papa Asystent AI" className="pd-ccbi-ai-drawer" role="dialog">
      <div className="pd-ccbi-ai-drawer__body">
        <div className="pd-ccbi-ai-drawer__head">
          <div>
            <span className="pd-ccbi-live-dot" />
            <h3>Papa Asystent AI</h3>
          </div>
          <button aria-label="Zamknij Papa Asystenta" onClick={onClose} type="button">×</button>
        </div>

        <div className="pd-ccbi-active-context">
          <span>Aktywny Kontekst Analizy</span>
          <strong>{context.name}</strong>
          <p>Wartość: <b>{context.value ?? context.impact} {context.unit ?? ''}</b></p>
          <small>Zakres: {dateRange} · Compare: {compareMode}</small>
        </div>

        <div className="pd-ccbi-question-chips">
          <button onClick={() => onSendMessage('Dlaczego ta wartość się zmieniła?')} type="button">Dlaczego ta wartość się zmieniła?</button>
          <button onClick={() => onSendMessage('Jak zoptymalizować ten wynik?')} type="button">Jak zoptymalizować ten wynik?</button>
        </div>

        <div className="pd-ccbi-chat-list">
          {chatMessages.map((message, index) => (
            <p className={`pd-ccbi-chat-message pd-ccbi-chat-message--${message.sender}`} key={`${message.sender}-${index}`}>
              {message.text}
            </p>
          ))}
        </div>
      </div>

      <form className="pd-ccbi-ai-form" onSubmit={handleSubmit}>
        <input
          aria-label="Zapytaj Papa"
          onChange={(event) => onChatInputChange(event.target.value)}
          placeholder="Zapytaj Papa..."
          type="text"
          value={chatInput}
        />
        <button className="pd-ccbi-primary-button" type="submit">Wyślij</button>
      </form>
    </aside>
  );
}

function formatMetricValue(value: number, key: CommandKpiKey) {
  if (key === 'aov' || key === 'cac' || key === 'roas') {
    return value.toLocaleString('pl-PL', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  return formatNumber(value);
}

function formatChartValue(value: number, metric: CommandTrendMetric) {
  if (metric === 'roas') return value.toFixed(2);
  return formatNumber(value);
}

function formatChartTick(value: number, metric: CommandTrendMetric) {
  if (metric === 'roas') return value.toFixed(1);
  if (metric === 'orders') return String(Math.round(value));
  return `${Math.round(value / 1000)}k`;
}

function formatMoney(value: number) {
  return `${formatNumber(value)} PLN`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pl-PL').format(value);
}

function statusToTone(status: CommandKpiStatus): CommandCenterTone {
  if (status === 'critical') return 'rose';
  if (status === 'warning') return 'amber';
  if (status === 'insight') return 'blue';
  return 'blue';
}

function signalTone(signal: string) {
  if (signal === 'Koncentracja') return 'amber';
  if (signal === 'Niski zapas') return 'rose';
  return 'slate';
}

function createAiReply(query: string, dateRange: CommandDateRange) {
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.includes('aov')) {
    return 'AOV spadł głównie z powodu zwiększonego udziału zakupów z kodami rabatowymi letniej wyprzedaży. Rekomenduję wprowadzenie darmowej dostawy dopiero od 150 PLN.';
  }

  if (normalizedQuery.includes('stockout') || normalizedQuery.includes('zapas')) {
    return 'Produkt Alpha wyprzedaje się w tempie 120 sztuk/dzień. Zamówienie uzupełniające w systemie ERP powinno zostać wygenerowane w ciągu 24h.';
  }

  return `Oto analiza dla metryki w kontekście ${dateRange}: Głównym czynnikiem jest zmiana progu konwersji w płatnych kanałach (Meta/Google). Zalecam zoptymalizowanie budżetu i przesunięcie 10-15% środków do grup produktowych o najwyższej marży.`;
}
