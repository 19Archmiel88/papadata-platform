import type { ReactNode } from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, ProductSectionFrame } from '../../design-system';
import {
  ordersSections,
  ordersSectionsById,
  ordersProvenanceDict,
  ordersPaymentsDistribution,
  ordersShippingPerformance,
  ordersDiscountSegments,
  ordersDiscountCodes,
  ordersReturnsSummary,
  ordersRefundedProducts,
  ordersFunnelSteps,
  ordersExecutiveInsights,
} from './OrdersScreen.data';
import type { OrdersDataBadgeLevel, OrdersProvenanceKey, OrdersTone } from './OrdersScreen.data';
import './OrdersScreen.css';
const noop = () => undefined;
const chartColors = {
  blue: 'var(--pd-data-actual)',
  red: 'var(--pd-status-danger)',
  emerald: 'var(--pd-data-series-2)',
  amber: 'var(--pd-data-series-3)',
  slate: 'var(--pd-text-muted)',
};
function OrdersSectionFrame({
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
  readonly section: (typeof ordersSections)[number];
}) {
  const bodyId = `pd-obi-${section.id}-content`;

  return (
    <ProductSectionFrame
      accentClassName={accentClassName}
      actions={
        <>
          {expanded ? actions : null}
          {onExpandedChange !== noop && (
            <button
              aria-controls={bodyId}
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Zwiń' : 'Rozwiń'} sekcję ${section.title}`}
              className="pd-obi-section-toggle"
              onClick={() => onExpandedChange(!expanded)}
              type="button"
            >
              <span className="pd-obi-section-toggle__label">{expanded ? 'Zwiń' : 'Rozwiń'}</span>
              <span aria-hidden="true" className="pd-obi-section-toggle__icon">
                <svg height="14" viewBox="0 0 24 24" width="14">
                  <path
                    d="m6 9 6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </button>
          )}
        </>
      }
      className="pd-obi-section-frame"
      data-collapsed={expanded ? undefined : 'true'}
      description={
        expanded ? (
          description ? (
            <span>{description}</span>
          ) : null
        ) : (
          <span className="pd-obi-section-summary">{collapsedSummary}</span>
        )
      }
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {expanded ? (
        <div className="pd-obi-section-content" id={bodyId}>
          {children}
        </div>
      ) : null}
    </ProductSectionFrame>
  );
}

export function OrdersPaymentsAndShipping({
  expanded = true,
  onExpandedChange = noop,
  onOpenProvenance = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
}) {
  const section = ordersSectionsById.platnosci;

  return (
    <OrdersSectionFrame
      collapsedSummary="68,4% zamówień przez PayU · ryzyko koncentracji płatności"
      description="Udział operatorów płatności i ryzyko koncentracji transakcji oraz rozkład metod dostawy, koszty i opóźnienia."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-obi-two-column">
        <section className="pd-obi-panel pd-obi-stack" aria-labelledby="pd-obi-payments-title">
          <div className="pd-obi-panel-head">
            <div>
              <h3 id="pd-obi-payments-title">Analiza Płatności</h3>
              <p>Udział operatorów, skuteczność i ryzyko koncentracji transakcji.</p>
            </div>
            <DataLevelBadge
              badge={ordersProvenanceDict.payments.badge}
              onClick={() => onOpenProvenance('payments')}
            />
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
                <p>
                  <strong>68,4%</strong> zamówień przechodzi przez PayU. Awaria tego jednego
                  operatora uniemożliwi realizację większości checkoutów.
                </p>
              </article>
              <dl>
                {ordersPaymentsDistribution.map((payment) => (
                  <div key={payment.label}>
                    <dt>{payment.label}:</dt>
                    <dd>
                      {payment.value} ({payment.share.toFixed(1).replace('.', ',')}%)
                    </dd>
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
            <DataLevelBadge
              badge={ordersProvenanceDict.shipping.badge}
              onClick={() => onOpenProvenance('shipping')}
            />
          </div>
          <div className="pd-obi-chart">
            <ResponsiveContainer height="100%" width="100%">
              <RechartsBarChart
                data={ordersShippingPerformance}
                margin={{ bottom: 8, left: 0, right: 18, top: 8 }}
              >
                <CartesianGrid stroke="rgb(var(--pd-obi-slate-200))" vertical={false} />
                <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={54} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="orders"
                  fill={chartColors.blue}
                  name="Liczba Zamówień"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="breached"
                  fill={chartColors.red}
                  name="Po SLA (>36h)"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          <div className="pd-obi-info-note">
            💡 <strong>Sprostowanie semantyczne:</strong> Pokazujemy wskaźniki metody dostawy na
            poziomie magazynu (czas do $fulfilledAt$), a nie bezpośrednie wyniki przewoźników
            kurierskich.
          </div>
        </section>
      </div>
    </OrdersSectionFrame>
  );
}

export function OrdersDiscountsAndReturns({
  expanded = true,
  onExpandedChange = noop,
  onOpenProvenance = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
}) {
  const section = ordersSectionsById.rabaty;

  return (
    <OrdersSectionFrame
      collapsedSummary="Ekonomika rabatów vs bez rabatu · wpływ zwrotów i refundów na przychód"
      description="Porównanie ekonomiki zamówień z rabatem vs bez rabatu oraz wpływ zwrotów i refundów na przychód."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-obi-two-column">
        <section className="pd-obi-panel pd-obi-stack" aria-labelledby="pd-obi-discounts-title">
          <div className="pd-obi-panel-head">
            <div>
              <h3 id="pd-obi-discounts-title">Wpływ Rabatów i Promocji</h3>
              <p>Porównanie ekonomiki zamówień z rabatem vs bez rabatu oraz skuteczność kodów.</p>
            </div>
            <DataLevelBadge
              badge={ordersProvenanceDict.discounts.badge}
              onClick={() => onOpenProvenance('discounts')}
            />
          </div>
          <div className="pd-obi-discount-segments">
            {ordersDiscountSegments.map((segment) => (
              <article
                className={`pd-obi-segment-card pd-obi-segment-card--${segment.tone}`}
                key={segment.label}
              >
                <span>{segment.label}</span>
                <strong>
                  {segment.orders} <small>({segment.share})</small>
                </strong>
                <p>
                  AOV: <strong>{segment.aov}</strong>{' '}
                  {'aovDelta' in segment && segment.aovDelta ? <b>{segment.aovDelta}</b> : null}
                </p>
                <p>
                  Wskaźnik zwrotów: <strong>{segment.refundRate}</strong>{' '}
                  {'refundDelta' in segment && segment.refundDelta ? (
                    <b>{segment.refundDelta}</b>
                  ) : null}
                </p>
              </article>
            ))}
          </div>
          <div
            className="pd-obi-simple-table-wrap"
            role="region"
            aria-label="Skuteczność kodów rabatowych"
            tabIndex={0}
          >
            <table className="pd-obi-simple-table">
              <thead>
                <tr>
                  <th>Kod Rabatu</th>
                  <th>Zamówienia</th>
                  <th>Udzielony Rabat</th>
                  <th>AOV</th>
                  <th>% Zwrotów</th>
                </tr>
              </thead>
              <tbody>
                {ordersDiscountCodes.map((code) => (
                  <tr key={code.code}>
                    <td>
                      <strong>{code.code}</strong>
                    </td>
                    <td>{code.orders}</td>
                    <td>{code.discount}</td>
                    <td>{code.aov}</td>
                    <td className={`pd-obi-tone-text pd-obi-tone-text--${code.tone}`}>
                      {code.refundRate}
                    </td>
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
            <DataLevelBadge
              badge={ordersProvenanceDict.returns.badge}
              onClick={() => onOpenProvenance('returns')}
            />
          </div>
          <div className="pd-obi-return-summary">
            {ordersReturnsSummary.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong className={`pd-obi-tone-text pd-obi-tone-text--${item.tone}`}>
                  {item.value}
                </strong>
              </article>
            ))}
          </div>
          <div className="pd-obi-stack pd-obi-stack--tight">
            <h3>Produkty o Najwyższym Wskaźniku Zwrotów</h3>
            {ordersRefundedProducts.map((product) => (
              <article className="pd-obi-refunded-product" key={product.label}>
                <div>
                  <strong>{product.label}</strong>
                  <span>
                    {product.refunds} · Wartość: {product.value}
                  </span>
                </div>
                <b className={`pd-obi-tone-text pd-obi-tone-text--${product.tone}`}>
                  {product.rate}
                </b>
              </article>
            ))}
          </div>
        </section>
      </div>
    </OrdersSectionFrame>
  );
}

export function OrdersPurchaseFunnel({
  expanded = true,
  onExpandedChange = noop,
  onOpenProvenance = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly onOpenProvenance?: (key: OrdersProvenanceKey) => void;
}) {
  const section = ordersSectionsById.lejek;

  return (
    <OrdersSectionFrame
      actions={
        <DataLevelBadge
          badge={ordersProvenanceDict.funnel.badge}
          onClick={() => onOpenProvenance('funnel')}
        />
      }
      collapsedSummary="Lejek zakupowy modelowany na podstawie ruchu i zamówień"
      description="Uwaga: Etapy pośrednie są modelowane na podstawie dostępnego ruchu i zamówień. Nie reprezentują bezpośrednich obserwacji zdarzeń checkout."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-obi-funnel-grid">
        {ordersFunnelSteps.map((step) => (
          <article
            className={`pd-obi-funnel-step pd-obi-funnel-step--${step.tone}`}
            key={step.label}
          >
            <span>{step.label}</span>
            <strong>{step.value}</strong>
            <small>{step.note}</small>
          </article>
        ))}
      </div>
    </OrdersSectionFrame>
  );
}

export function OrdersExecutiveInsight({
  expanded = true,
  onExpandedChange = noop,
}: {
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
}) {
  const section = ordersSectionsById.insight;

  return (
    <OrdersSectionFrame
      collapsedSummary="Przykładowe wnioski operacyjne · sierpień 2026"
      description="Zapisany przykład analizy za sierpień 2026. Nie jest bieżącą odpowiedzią AI ani analizą próbki w kolejce realizacji."
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      section={section}
    >
      <div className="pd-obi-insight-grid">
        {ordersExecutiveInsights.map((insight) => (
          <article key={insight.label}>
            <strong className={`pd-obi-tone-text pd-obi-tone-text--${insight.tone}`}>
              {insight.label}
            </strong>
            {insight.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ))}
      </div>
    </OrdersSectionFrame>
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
    <Button
      className={`pd-obi-data-badge pd-obi-data-badge--${dataBadgeTone(badge)}`}
      size="small"
      variant="ghost"
      onClick={onClick}
    >
      {badge}
    </Button>
  );
}

function paymentSliceColor(index: number) {
  const colors = [chartColors.blue, chartColors.emerald, chartColors.amber, chartColors.slate];
  return colors[index] ?? chartColors.slate;
}

function dataBadgeTone(badge: OrdersDataBadgeLevel): OrdersTone {
  if (badge.startsWith('L1')) return 'emerald';
  if (badge.startsWith('L2')) return 'blue';
  if (badge.startsWith('L3')) return 'violet';
  if (badge.startsWith('L4')) return 'amber';
  return 'slate';
}
