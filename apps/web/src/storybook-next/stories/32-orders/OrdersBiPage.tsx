import type {
  FormEvent,
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
  ordersDiscountCodes,
  ordersDiscountSegments,
  ordersExecutiveInsights,
  ordersFunnelSteps,
  ordersKpis,
  ordersLifecycleStages,
  ordersOperationalStats,
  ordersPaymentsDistribution,
  ordersProvenanceDict,
  ordersRefundedProducts,
  ordersReturnsSummary,
  ordersSections,
  ordersSectionsById,
  ordersShippingPerformance,
  ordersTrendLabels,
  ordersTrendModes,
  ordersTrendSeries,
  sampleOrders,
} from './OrdersBiPage.data';
import type {
  OrdersDataBadgeLevel,
  OrdersLifecycleFilter,
  OrdersProvenanceKey,
  OrdersSectionId,
  OrdersTone,
  OrdersTrendMode,
  SampleOrder,
} from './OrdersBiPage.data';
import './OrdersBiPage.css';

type ExplorerFilter =
  | {
      readonly kind: 'all';
    }
  | {
      readonly kind: 'lifecycle';
      readonly value: OrdersLifecycleFilter;
    }
  | {
      readonly kind: 'sla';
      readonly value: SampleOrder['slaStatus'];
    };

const chartColors = {
  amber: 'rgb(var(--pd-obi-amber-600))',
  blue: 'rgb(var(--pd-obi-blue-600))',
  emerald: 'rgb(var(--pd-obi-emerald-600))',
  indigo: 'rgb(var(--pd-obi-indigo-600))',
  red: 'rgb(var(--pd-obi-red-600))',
  sky: 'rgb(var(--pd-obi-sky-600))',
  slate: 'rgb(var(--pd-obi-slate-500))',
  violet: 'rgb(var(--pd-obi-violet-600))',
} as const;

const noop = () => undefined;

export function OrdersBiPage() {
  const [activeSection, setActiveSection] = useState<OrdersSectionId>(ordersSections[0]!.id);
  const [explorerFilter, setExplorerFilter] = useState<ExplorerFilter>({ kind: 'all' });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<OrdersProvenanceKey | null>(null);
  const [papaTopic, setPapaTopic] = useState<string | null>(null);

  const selectedOrder = sampleOrders.find((order) => order.id === selectedOrderId) ?? null;

  function handleSectionChange(sectionId: OrdersSectionId) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExplorerFilter(filter: ExplorerFilter) {
    setExplorerFilter(filter);
  }

  return (
    <main className="pd-obi" data-testid="orders-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        ariaLabel="Sekcje Zamówień"
        items={ordersSections.map((section) => ({
          id: section.id,
          label: section.navLabel,
        }))}
        onActiveIdChange={(id) => handleSectionChange(id as OrdersSectionId)}
      />

      <div className="pd-obi__content">
        <OrdersResultSection
          onAnalyze={() => setPapaTopic('SLA_Breach')}
          onOpenProvenance={setSelectedProvenance}
          onShowCritical={() => handleExplorerFilter({ kind: 'sla', value: 'breached' })}
        />
        <OrdersLifecycleFlow
          onSelectStage={(stage) => handleExplorerFilter(stage === 'breached'
            ? { kind: 'sla', value: 'breached' }
            : { kind: 'lifecycle', value: stage })}
        />
        <OrderExplorer
          explorerFilter={explorerFilter}
          onOpenOrder={setSelectedOrderId}
          onReset={() => handleExplorerFilter({ kind: 'all' })}
        />
        <OrdersPaymentsAndShipping onOpenProvenance={setSelectedProvenance} />
        <OrdersDiscountsAndReturns onOpenProvenance={setSelectedProvenance} />
        <OrdersPurchaseFunnel onOpenProvenance={setSelectedProvenance} />
        <OrdersExecutiveInsight />
      </div>

      <OrdersProvenanceModal
        metricKey={selectedProvenance}
        onClose={() => setSelectedProvenance(null)}
      />
      <OrderDrawer
        onClose={() => setSelectedOrderId(null)}
        order={selectedOrder}
      />
      <PapaTopicModal
        onClose={() => setPapaTopic(null)}
        topic={papaTopic}
      />
    </main>
  );
}

function kpiTrendDirection(change: string): 'up' | 'down' | 'flat' {
  if (change.startsWith('↑')) return 'up';
  if (change.startsWith('↓')) return 'down';
  return 'flat';
}

function kpiSignal(tone: string): 'positive' | 'negative' | 'neutral' | 'warning' {
  if (tone === 'red') return 'negative';
  if (tone === 'amber') return 'warning';
  return 'neutral';
}

/**
 * "Wynik operacyjny": combines the top Papa priority recommendation, the
 * headline operational KPIs, and the sales/operations trend chart into one
 * section frame -- one business answer to "what is the current operational
 * result of orders?", not three separate stories.
 */
export function OrdersResultSection({
  onAnalyze = noop,
  onOpenProvenance = noop,
  onShowCritical = noop,
}: {
  readonly onAnalyze?: () => void;
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
  readonly onShowCritical?: () => void;
}) {
  const [trendMode, setTrendMode] = useState<OrdersTrendMode>('sales');
  const trendData = useMemo(() => buildTrendData(trendMode), [trendMode]);
  const section = ordersSectionsById.wynik;

  return (
    <ProductSectionFrame
      description="Jaki jest aktualny wynik operacyjny zamówień?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <PriorityBand
        actions={(
          <>
            <Button onClick={onShowCritical} variant="primary">
              Pokaż 63 krytyczne zamówienia
            </Button>
            <Button onClick={onAnalyze} variant="secondary">
              Analizuj z Papa AI
            </Button>
          </>
        )}
        badgeLabel="Priorytet Operacyjny Papa"
        timestampLabel="Alertyzacja w czasie rzeczywistym"
        title="214 zamówień przekroczyło cel SLA (>36 godzin)"
      >
        <p>
          Wartość zamówień zagrożonych opóźnieniem wynosi <strong>94 120 zł</strong> (+41% vs poprz. okres). <strong>72% problemu</strong> skupia się w zamówieniach z wybraną metodą wysyłki <em>Kurier DPD</em>. Najbardziej krytyczne jest 63 zamówień opóźnionych o ponad 12 godzin.
        </p>
        <p className="pd-obi-priority__meta">
          <span>Pewność AI: <strong>91%</strong></span>
          <span>•</span>
          <span>Pokrycie danych timestampów: <strong>96,0%</strong> (L3 Wyliczone)</span>
        </p>
      </PriorityBand>

      <Panel
        bordered={false}
        collapsed={false}
        collapsible={false}
        description="Przegąd wyniku transakcyjnego i ryzyka z zachowaniem rygoru semantycznego. Kliknij „Źródło i wzór” na karcie, aby sprawdzić poziom jakości danych (L1-L5)."
        padding="md"
        title="Główne Wskaźniki Operacyjne (KPI)"
      >
        <div className="pd-obi-kpi-grid">
          {ordersKpis.map((kpi) => {
            const provenance = ordersProvenanceDict[kpi.key];
            return (
              <MetricCard
                comparison={{ direction: kpiTrendDirection(kpi.change), label: kpi.change.replace(/^[↑↓]\s*/, '') }}
                key={kpi.key}
                label={kpi.label}
                metricId={`orders-kpi-${kpi.key}`}
                signal={kpiSignal(kpi.tone)}
                detailAction={{ label: `${provenance.badge} · Źródło i wzór`, onAction: () => onOpenProvenance(kpi.key) }}
                status="ready"
                statusLabel={provenance.badge}
                unit={'suffix' in kpi ? kpi.suffix : null}
                value={kpi.value}
              />
            );
          })}
        </div>

        <div className="pd-obi-operational-grid">
          {ordersOperationalStats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small className={`pd-obi-tone-text pd-obi-tone-text--${stat.tone}`}>{stat.note}</small>
            </article>
          ))}
        </div>
      </Panel>

      <section className="pd-obi-panel" aria-labelledby="pd-obi-trend-title">
        <div className="pd-obi-panel-head">
          <div>
            <h3 id="pd-obi-trend-title">Sprzedaż i Operacje w Czasie</h3>
            <p>Analiza dynamiki wolumenu, przychodu i wskaźników operacyjnych w układzie dziennym.</p>
          </div>
          <div className="pd-obi-segmented" role="group" aria-label="Tryb trendu zamówień">
            {ordersTrendModes.map((mode) => (
              <button
                data-active={trendMode === mode.id ? 'true' : 'false'}
                key={mode.id}
                onClick={() => setTrendMode(mode.id)}
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pd-obi-chart" data-testid="orders-trend-chart">
          <ResponsiveContainer height="100%" width="100%">
            <RechartsLineChart data={trendData} margin={{ bottom: 8, left: 0, right: 18, top: 8 }}>
              <CartesianGrid stroke="rgb(var(--pd-obi-slate-200))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={58} />
              <Tooltip />
              <Legend />
              {ordersTrendSeries[trendMode].map((series) => (
                <Line
                  dataKey={series.key}
                  dot={false}
                  key={series.key}
                  name={series.label}
                  stroke={chartColors[series.color]}
                  strokeDasharray={series.dash ? '5 5' : undefined}
                  strokeWidth={series.dash ? 2 : 3}
                  type="monotone"
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </ProductSectionFrame>
  );
}

export function OrdersLifecycleFlow({
  onSelectStage = noop,
}: {
  readonly onSelectStage?: (stage: OrdersLifecycleFilter) => void;
}) {
  const section = ordersSectionsById.cykl;

  return (
    <ProductSectionFrame
      actions={<span className="pd-obi-code-pill">Łącznie aktywnych: <strong>15 620</strong></span>}
      description="Kliknij dowolny etap cyklu, aby natychmiast przefiltrować tabelę Eksploratora zamówień do odpowiednich dowodów."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-obi-lifecycle-grid">
        {ordersLifecycleStages.map((stage) => (
          <button
            className={`pd-obi-lifecycle-stage pd-obi-lifecycle-stage--${stage.tone}`}
            key={stage.filter}
            onClick={() => onSelectStage(stage.filter)}
            type="button"
          >
            <span>{stage.label}</span>
            <strong>{stage.count}</strong>
            <small>{stage.note}</small>
          </button>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

export function OrderExplorer({
  explorerFilter = { kind: 'all' },
  onOpenOrder = noop,
  onReset = noop,
}: {
  readonly explorerFilter?: ExplorerFilter;
  readonly onOpenOrder?: (orderId: string) => void;
  readonly onReset?: () => void;
}) {
  const [query, setQuery] = useState('');
  const visibleOrders = useMemo(
    () => filterOrders(sampleOrders, query, explorerFilter),
    [explorerFilter, query],
  );
  const section = ordersSectionsById.explorer;

  function reset() {
    setQuery('');
    onReset();
  }

  return (
    <ProductSectionFrame
      actions={(
        <div className="pd-obi-explorer-actions">
          <label>
            <Icon decorative name="search" size={16} />
            <input
              aria-label="Szukaj ID, SKU, kanału"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj ID, SKU, kanału..."
              type="search"
              value={query}
            />
          </label>
          <button className="pd-obi-muted-button" onClick={reset} type="button">
            Reset filtrów
          </button>
        </div>
      )}
      description={(
        <>
          <span className="pd-obi-pill pd-obi-pill--blue-soft">Server-Side Query</span>
          <br />
          Przeglądaj konkretne zamówienia stanowiące dowody dla agregatów. Kliknij wiersz, aby otworzyć Order Drawer.
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-obi-table-wrap">
        <table className="pd-obi-orders-table">
          <thead>
            <tr>
              <th>Zamówienie</th>
              <th>Data (orderedAt)</th>
              <th>Kanał</th>
              <th>Wartość brutto</th>
              <th>Płatność</th>
              <th>Realizacja</th>
              <th>SLA Status</th>
              <th>Refund</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 ? (
              <tr>
                <td className="pd-obi-empty-cell" colSpan={9}>
                  Brak zamówień dla wybranych filtrów.
                </td>
              </tr>
            ) : visibleOrders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.date}</td>
                <td><span className="pd-obi-source-badge">{order.channel}</span></td>
                <td><strong>{formatMoney(order.grossValue)}</strong></td>
                <td>
                  <OrderPaymentBadge status={order.paymentStatus} />
                  <small>{order.paymentProvider}</small>
                </td>
                <td><span className="pd-obi-fulfillment-badge">{order.fulfillmentStatus}</span></td>
                <td><OrderSlaBadge order={order} /></td>
                <td className={order.refund > 0 ? 'pd-obi-refund-value' : 'pd-obi-muted-value'}>
                  {order.refund > 0 ? formatMoney(order.refund) : '—'}
                </td>
                <td>
                  <button className="pd-obi-link-button" onClick={() => onOpenOrder(order.id)} type="button">
                    Szczegóły →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="pd-obi-table-footer">
        <div>Pokazano <strong>{visibleOrders.length}</strong> z <strong>15 620</strong> zamówień</div>
        <div>
          <button disabled type="button">« Poprzednia</button>
          <span>Strona 1 z 156</span>
          <button type="button">Następna »</button>
        </div>
      </footer>
    </ProductSectionFrame>
  );
}

export function OrdersPaymentsAndShipping({
  onOpenProvenance = noop,
}: {
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
}) {
  const section = ordersSectionsById.platnosci;

  return (
    <ProductSectionFrame
      description="Udział operatorów płatności i ryzyko koncentracji transakcji oraz rozkład metod dostawy, koszty i opóźnienia."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
    <div className="pd-obi-two-column">
      <section className="pd-obi-panel pd-obi-stack" aria-labelledby="pd-obi-payments-title">
        <div className="pd-obi-panel-head">
          <div>
            <h3 id="pd-obi-payments-title">Analiza Płatności</h3>
            <p>Udział operatorów, skuteczność i ryzyko koncentracji transakcji.</p>
          </div>
          <DataLevelBadge badge={ordersProvenanceDict.payments.badge} onClick={() => onOpenProvenance('payments')} />
        </div>
        <div className="pd-obi-payment-grid">
          <div className="pd-obi-chart pd-obi-chart--short">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsPieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={ordersPaymentsDistribution}
                  dataKey="share"
                  innerRadius={48}
                  nameKey="label"
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {ordersPaymentsDistribution.map((entry, index) => (
                    <Cell fill={paymentSliceColor(index)} key={entry.label} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="pd-obi-payment-side">
            <article className="pd-obi-warning-note">
              <strong>⚠️ Alert Koncentracji Płatności</strong>
              <p><strong>68,4%</strong> zamówień przechodzi przez PayU. Awaria tego jednego operatora uniemożliwi realizację większości checkoutów.</p>
            </article>
            <dl>
              {ordersPaymentsDistribution.map((payment) => (
                <div key={payment.label}>
                  <dt>{payment.label}:</dt>
                  <dd>{payment.value} ({payment.share.toFixed(1).replace('.', ',')}%)</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="pd-obi-panel pd-obi-stack" aria-labelledby="pd-obi-shipping-title">
        <div className="pd-obi-panel-head">
          <div>
            <h3 id="pd-obi-shipping-title">Analiza Metod Dostawy</h3>
            <p>Rozkład metod wysyłki, realne koszty i wskaźnik opóźnień magazynowych.</p>
          </div>
          <DataLevelBadge badge={ordersProvenanceDict.shipping.badge} onClick={() => onOpenProvenance('shipping')} />
        </div>
        <div className="pd-obi-chart">
          <ResponsiveContainer height="100%" width="100%">
            <RechartsBarChart data={ordersShippingPerformance} margin={{ bottom: 8, left: 0, right: 18, top: 8 }}>
              <CartesianGrid stroke="rgb(var(--pd-obi-slate-200))" vertical={false} />
              <XAxis dataKey="method" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={54} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill={chartColors.blue} name="Liczba Zamówień" radius={[4, 4, 0, 0]} />
              <Bar dataKey="breached" fill={chartColors.red} name="Po SLA (>36h)" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
        <div className="pd-obi-info-note">
          💡 <strong>Sprostowanie semantyczne:</strong> Pokazujemy wskaźniki metody dostawy na poziomie magazynu (czas do $fulfilledAt$), a nie bezpośrednie wyniki przewoźników kurierskich.
        </div>
      </section>
    </div>
    </ProductSectionFrame>
  );
}

export function OrdersDiscountsAndReturns({
  onOpenProvenance = noop,
}: {
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
}) {
  const section = ordersSectionsById.rabaty;

  return (
    <ProductSectionFrame
      description="Porównanie ekonomiki zamówień z rabatem vs bez rabatu oraz wpływ zwrotów i refundów na przychód."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
    <div className="pd-obi-two-column">
      <section className="pd-obi-panel pd-obi-stack" aria-labelledby="pd-obi-discounts-title">
        <div className="pd-obi-panel-head">
          <div>
            <h3 id="pd-obi-discounts-title">Wpływ Rabatów i Promocji</h3>
            <p>Porównanie ekonomiki zamówień z rabatem vs bez rabatu oraz skuteczność kodów.</p>
          </div>
          <DataLevelBadge badge={ordersProvenanceDict.discounts.badge} onClick={() => onOpenProvenance('discounts')} />
        </div>
        <div className="pd-obi-discount-segments">
          {ordersDiscountSegments.map((segment) => (
            <article className={`pd-obi-segment-card pd-obi-segment-card--${segment.tone}`} key={segment.label}>
              <span>{segment.label}</span>
              <strong>{segment.orders} <small>({segment.share})</small></strong>
              <p>AOV: <strong>{segment.aov}</strong> {'aovDelta' in segment && segment.aovDelta ? <b>{segment.aovDelta}</b> : null}</p>
              <p>Refund rate: <strong>{segment.refundRate}</strong> {'refundDelta' in segment && segment.refundDelta ? <b>{segment.refundDelta}</b> : null}</p>
            </article>
          ))}
        </div>
        <div className="pd-obi-simple-table-wrap">
          <table className="pd-obi-simple-table">
            <thead>
              <tr>
                <th>Kod Rabatu</th>
                <th>Zamówienia</th>
                <th>Udzielony Rabat</th>
                <th>AOV</th>
                <th>Refund %</th>
              </tr>
            </thead>
            <tbody>
              {ordersDiscountCodes.map((code) => (
                <tr key={code.code}>
                  <td><strong>{code.code}</strong></td>
                  <td>{code.orders}</td>
                  <td>{code.discount}</td>
                  <td>{code.aov}</td>
                  <td className={`pd-obi-tone-text pd-obi-tone-text--${code.tone}`}>{code.refundRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pd-obi-panel pd-obi-stack" aria-labelledby="pd-obi-returns-title">
        <div className="pd-obi-panel-head">
          <div>
            <h3 id="pd-obi-returns-title">Zwroty i Refundy</h3>
            <p>Analiza wartości utraconego przychodu oraz produktów o najwyższej powrotności.</p>
          </div>
          <DataLevelBadge badge={ordersProvenanceDict.returns.badge} onClick={() => onOpenProvenance('returns')} />
        </div>
        <div className="pd-obi-return-summary">
          {ordersReturnsSummary.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong className={`pd-obi-tone-text pd-obi-tone-text--${item.tone}`}>{item.value}</strong>
            </article>
          ))}
        </div>
        <div className="pd-obi-stack pd-obi-stack--tight">
          <h3>Produkty o Najwyższym Wskaźniku Zwrotów</h3>
          {ordersRefundedProducts.map((product) => (
            <article className="pd-obi-refunded-product" key={product.label}>
              <div>
                <strong>{product.label}</strong>
                <span>{product.refunds} · Wartość: {product.value}</span>
              </div>
              <b className={`pd-obi-tone-text pd-obi-tone-text--${product.tone}`}>{product.rate}</b>
            </article>
          ))}
        </div>
      </section>
    </div>
    </ProductSectionFrame>
  );
}

export function OrdersPurchaseFunnel({
  onOpenProvenance = noop,
}: {
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
}) {
  const section = ordersSectionsById.lejek;

  return (
    <ProductSectionFrame
      actions={<DataLevelBadge badge={ordersProvenanceDict.funnel.badge} onClick={() => onOpenProvenance('funnel')} />}
      description="Uwaga: Etapy pośrednie są modelowane na podstawie dostępnego ruchu i zamówień. Nie reprezentują bezpośrednich obserwacji zdarzeń checkout."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-obi-funnel-grid">
        {ordersFunnelSteps.map((step) => (
          <article className={`pd-obi-funnel-step pd-obi-funnel-step--${step.tone}`} key={step.label}>
            <span>{step.label}</span>
            <strong>{step.value}</strong>
            <small>{step.note}</small>
          </article>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

export function OrdersExecutiveInsight() {
  const section = ordersSectionsById.insight;

  return (
    <ProductSectionFrame
      actions={(
        <>
          <span className="pd-obi-insight__mark">
            <Icon decorative name="assistant" size={16} />
            PAPA INSIGHT
          </span>
          <span className="pd-obi-insight__confidence">Weryfikacja Pewności: 91%</span>
        </>
      )}
      description="Synteza wniosków operacyjnych i biznesowych na podstawie 15 620 przeanalizowanych zamówień."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-obi-insight-grid">
        {ordersExecutiveInsights.map((insight) => (
          <article key={insight.label}>
            <strong className={`pd-obi-tone-text pd-obi-tone-text--${insight.tone}`}>{insight.label}</strong>
            {insight.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

function OrdersProvenanceModal({
  metricKey,
  onClose,
}: {
  readonly metricKey: OrdersProvenanceKey | null;
  readonly onClose: () => void;
}) {
  if (!metricKey) return null;
  const provenance = ordersProvenanceDict[metricKey];

  return (
    <div className="pd-obi-modal-backdrop">
      <section aria-label="Provenance danych zamówień" aria-modal="true" className="pd-obi-modal" role="dialog">
        <header>
          <div>
            <DataLevelBadge badge={provenance.badge} />
            <h2>{provenance.title}</h2>
          </div>
          <button aria-label="Zamknij provenance" onClick={onClose} type="button">✕</button>
        </header>
        <div className="pd-obi-modal__body">
          <section>
            <span>Źródło Danych (Source)</span>
            <strong>{provenance.source}</strong>
          </section>
          <section>
            <span>Pokrycie Danych (Coverage)</span>
            <strong>{provenance.coverage}</strong>
          </section>
          <section>
            <span>Uwagi Semantyczne / Wykluczenia</span>
            <p>{provenance.notes}</p>
          </section>
        </div>
        <footer>
          <button className="pd-obi-dark-button" onClick={onClose} type="button">Rozumiem</button>
        </footer>
      </section>
    </div>
  );
}

function OrderDrawer({
  onClose,
  order,
}: {
  readonly onClose: () => void;
  readonly order: SampleOrder | null;
}) {
  const [question, setQuestion] = useState('');
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

  if (!order) return null;

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setAskedQuestion(question.trim());
    setQuestion('');
  }

  return (
    <div className="pd-obi-drawer-backdrop">
      <aside aria-label="Order Drawer" aria-modal="true" className="pd-obi-drawer" role="dialog">
        <div className="pd-obi-drawer__content">
          <header className="pd-obi-drawer__head">
            <div>
              <div className="pd-obi-heading-with-pill">
                <h2>{order.id}</h2>
                <span className="pd-obi-source-badge">{order.channel}</span>
              </div>
              <p>Szanuj prywatność: Dane klienta są pseudonimizowane (Customer ID: <strong>{order.customerId}</strong>)</p>
            </div>
            <button aria-label="Zamknij Order Drawer" onClick={onClose} type="button">✕</button>
          </header>

          <section>
            <h3>Oś Czasu Cyklu (Timeline)</h3>
            <div className="pd-obi-timeline-grid">
              <TimelineFact label="1. Złożono" note="✓ Fakt (L1)" value={order.date} />
              <TimelineFact label="2. Opłacono" note={order.paymentStatus === 'Paid' ? '✓ PayU' : 'Błąd operatora'} value={order.paymentStatus === 'Paid' ? '27.08 · 09:17' : 'Brak płatności'} />
              <TimelineFact label="3. Wysłano" note={order.fulfillmentStatus === 'Fulfilled' ? '✓ DPD' : 'Oczekuje'} value={order.fulfillmentStatus === 'Fulfilled' ? '28.08 · 15:22' : '—'} />
              <TimelineFact label="4. SLA Status" note={order.slaStatus === 'breached' ? '⚠️ Opóźnienie' : 'W normie'} tone={order.slaStatus === 'breached' ? 'red' : 'emerald'} value={order.slaHours} />
            </div>
          </section>

          <section>
            <h3>Ekonomika Zamówienia</h3>
            <div className="pd-obi-economics">
              <MetricFact label="Wartość Brutto:" value={formatMoney(order.grossValue)} />
              <MetricFact label={`Rabat (Kod: ${order.discountCode}):`} tone="amber" value={`-${formatMoney(order.discount)}`} />
              <MetricFact label="Koszt Dostawy:" value="14,00 zł" />
              <MetricFact label="Zarejestrowana Płatność:" tone="emerald" value={formatMoney(order.grossValue - order.discount + 14)} />
              <MetricFact label="COGS (Koszt własny):" note="L1 Fakt z systemu ERP" value="48,20 zł" />
              <MetricFact label="Szacowana Marża Brutto:" tone="emerald" value="64,21 zł (51,4%)" />
            </div>
          </section>

          <section>
            <h3>Pozycje Zamówienia (Order Lines)</h3>
            <div className="pd-obi-line-items">
              {order.items.map((item) => (
                <article key={`${order.id}-${item.sku}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>SKU: {item.sku} · Ilość: {item.qty}</span>
                  </div>
                  <strong>{formatMoney(item.price)}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="pd-obi-order-ai">
            <div>
              <Icon decorative name="assistant" size={16} />
              <strong>Papa AI dla tego Zamówienia</strong>
            </div>
            <p>Zamówienie posiada opóźnienie w wysyłce ze względu na oczekiwanie na dostawę SKU-102. Brak ryzyka defraudacji płatności.</p>
            <form onSubmit={submitQuestion}>
              <input
                aria-label="Zapytaj Papa o to zamówienie"
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Zapytaj Papa o to zamówienie..."
                value={question}
              />
              <button type="submit">Zapytaj</button>
            </form>
            {askedQuestion ? <small>Papa AI przetwarza zapytanie: {askedQuestion}</small> : null}
          </section>
        </div>

        <footer className="pd-obi-drawer__footer">
          <button className="pd-obi-dark-button" onClick={onClose} type="button">
            Zamknij podgląd
          </button>
        </footer>
      </aside>
    </div>
  );
}

function TimelineFact({
  label,
  note,
  tone = 'emerald',
  value,
}: {
  readonly label: string;
  readonly note: string;
  readonly tone?: OrdersTone;
  readonly value: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <strong className={`pd-obi-tone-text pd-obi-tone-text--${tone}`}>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function MetricFact({
  label,
  note,
  tone = 'slate',
  value,
}: {
  readonly label: string;
  readonly note?: string;
  readonly tone?: OrdersTone;
  readonly value: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <strong className={`pd-obi-tone-text pd-obi-tone-text--${tone}`}>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

function PapaTopicModal({
  onClose,
  topic,
}: {
  readonly onClose: () => void;
  readonly topic: string | null;
}) {
  if (!topic) return null;

  return (
    <div className="pd-obi-modal-backdrop">
      <section aria-label="Papa AI analiza SLA" aria-modal="true" className="pd-obi-modal" role="dialog">
        <header>
          <div>
            <span className="pd-obi-pill pd-obi-pill--violet-strong">Papa AI</span>
            <h2>Analiza: {topic}</h2>
          </div>
          <button aria-label="Zamknij analizę Papa AI" onClick={onClose} type="button">✕</button>
        </header>
        <div className="pd-obi-modal__body">
          <section>
            <span>Diagnoza</span>
            <p>Największe przeciążenie dotyczy kolejki kompletacji dla metody Kurier DPD. Problem koreluje z produktami SKU-102 i zamówieniami COD.</p>
          </section>
          <section>
            <span>Rekomendacja</span>
            <p>Przenieś 2 osoby do pakowania DPD na 48 godzin, odseparuj COD od opłaconych zamówień i eskaluj 63 zamówienia z opóźnieniem powyżej 12 godzin.</p>
          </section>
        </div>
        <footer>
          <button className="pd-obi-dark-button" onClick={onClose} type="button">Rozumiem</button>
        </footer>
      </section>
    </div>
  );
}

function DataLevelBadge({
  badge,
  onClick,
}: {
  readonly badge: OrdersDataBadgeLevel;
  readonly onClick?: () => void;
}) {
  return (
    <button className={`pd-obi-data-badge pd-obi-data-badge--${dataBadgeTone(badge)}`} onClick={onClick} type="button">
      {badge}
    </button>
  );
}

function OrderPaymentBadge({
  status,
}: {
  readonly status: SampleOrder['paymentStatus'];
}) {
  return (
    <span className={`pd-obi-payment-badge pd-obi-payment-badge--${status === 'Paid' ? 'ok' : 'failed'}`}>
      {status === 'Paid' ? 'Opłacone' : 'Błąd płatności'}
    </span>
  );
}

function OrderSlaBadge({
  order,
}: {
  readonly order: SampleOrder;
}) {
  const label = order.slaStatus === 'ok' ? 'OK' : order.slaHours;
  return (
    <span className={`pd-obi-sla-badge pd-obi-sla-badge--${order.slaStatus}`}>
      {label}
    </span>
  );
}

function buildTrendData(mode: OrdersTrendMode) {
  const series = ordersTrendSeries[mode];
  return ordersTrendLabels.map((label, index) => {
    const item: Record<string, number | string> = { label };
    series.forEach((entry) => {
      item[entry.key] = entry.values[index] ?? 0;
    });
    return item;
  });
}

function filterOrders(orders: readonly SampleOrder[], query: string, explorerFilter: ExplorerFilter) {
  const normalizedQuery = query.trim().toLowerCase();

  return orders.filter((order) => {
    const queryMatch = !normalizedQuery
      || order.id.toLowerCase().includes(normalizedQuery)
      || order.channel.toLowerCase().includes(normalizedQuery)
      || order.paymentProvider.toLowerCase().includes(normalizedQuery)
      || order.items.some((item) => item.sku.toLowerCase().includes(normalizedQuery));

    if (!queryMatch) return false;

    if (explorerFilter.kind === 'sla') {
      return order.slaStatus === explorerFilter.value;
    }

    if (explorerFilter.kind === 'lifecycle') {
      if (explorerFilter.value === 'nowe') return order.fulfillmentStatus === 'Processing' || order.fulfillmentStatus === 'Pending';
      if (explorerFilter.value === 'paid') return order.paymentStatus === 'Paid';
      if (explorerFilter.value === 'processing') return order.fulfillmentStatus === 'Processing';
      if (explorerFilter.value === 'delivered') return order.fulfillmentStatus === 'Fulfilled';
      if (explorerFilter.value === 'pending_payment') return order.paymentStatus === 'Failed';
      return true;
    }

    return true;
  });
}

function paymentSliceColor(index: number) {
  const colors = [
    chartColors.blue,
    chartColors.emerald,
    chartColors.amber,
    chartColors.slate,
  ];
  return colors[index] ?? chartColors.slate;
}

function formatMoney(value: number) {
  return `${value.toLocaleString('pl-PL', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} zł`;
}

function dataBadgeTone(badge: OrdersDataBadgeLevel): OrdersTone {
  if (badge.startsWith('L1')) return 'emerald';
  if (badge.startsWith('L2')) return 'blue';
  if (badge.startsWith('L3')) return 'violet';
  if (badge.startsWith('L4')) return 'amber';
  return 'slate';
}
