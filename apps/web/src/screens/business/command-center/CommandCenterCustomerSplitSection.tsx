import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  EmptyState,
  VisuallyHidden,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  customerColumns,
  formatMetricValue,
  formatPercent,
} from './commandCenterOnePageModel';

const customerViewBox = {
  gapRowGap: 66,
  gapRowHeight: 28,
  gapTop: 322,
  height: 560,
  // Wide enough for the longest row label ("Baza klientów") right-anchored
  // 18 units before it, in user-unit space — the chart's aspect ratio (and
  // therefore how much accidental letterboxing margin the browser adds
  // around it) can change independently of this, so the label itself must
  // never depend on that margin to stay on-canvas.
  mixLeft: 168,
  mixRight: 918,
  width: 1000,
} as const;
const customerShareTicks = [0, 0.25, 0.5, 0.75, 1] as const;
const minGapDomain = 0.2;

type CustomerSegmentPoint = {
  readonly arpu: number;
  readonly arpuIndex: number;
  readonly customers: number;
  readonly customerShare: number;
  readonly frequency: number;
  readonly id: string;
  readonly productsPerOrder: number;
  readonly revenue: number;
  readonly revenueShare: number;
  readonly segment: string;
  readonly tone: 'new' | 'returning';
  readonly valueGap: number;
};

const integerFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
});

const decimalFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 2,
});

const signedPercentFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
  signDisplay: 'always',
  style: 'percent',
});

function readNumber(row: DataRow, key: string): number | null {
  const value = row[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function readString(row: DataRow, key: string): string {
  const value = row[key];

  return typeof value === 'string' ? value : String(value ?? '');
}

function formatIntegerValue(value: number): string {
  return integerFormatter.format(value);
}

function formatCompactCurrency(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${compactCurrencyFormatter.format(value / 1_000_000)} mln zł`;
  }

  if (absoluteValue >= 10_000) {
    return `${compactCurrencyFormatter.format(value / 1_000)} tys. zł`;
  }

  return formatMetricValue(value, 'currency');
}

function formatSignedPercent(value: number | null): string {
  if (
    value === null
    || !Number.isFinite(value)
  ) {
    return '—';
  }

  return signedPercentFormatter.format(value);
}

function buildCustomerSegmentPoints(
  customerRows: readonly DataRow[],
): readonly CustomerSegmentPoint[] {
  const baseRows = customerRows.map((row) => ({
    arpu: readNumber(row, 'rawArpu') ?? 0,
    customers: readNumber(row, 'rawCustomers') ?? 0,
    frequency: readNumber(row, 'rawFrequency') ?? 0,
    id: String(row.id),
    productsPerOrder: readNumber(row, 'rawProductsPerOrder') ?? 0,
    revenue: readNumber(row, 'rawRevenue') ?? 0,
    segment: readString(row, 'segment'),
  }));
  const totalRevenue = baseRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalCustomers = baseRows.reduce((sum, row) => sum + row.customers, 0);
  const averageArpu = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return baseRows
    .map((row) => {
      const revenueShare = totalRevenue > 0 ? row.revenue / totalRevenue : 0;
      const customerShare = totalCustomers > 0 ? row.customers / totalCustomers : 0;

      return {
        ...row,
        arpuIndex: averageArpu > 0 ? row.arpu / averageArpu : 0,
        customerShare,
        revenueShare,
        tone: row.id === 'returning' ? 'returning' as const : 'new' as const,
        valueGap: revenueShare - customerShare,
      };
    })
    .sort((left, right) => right.revenue - left.revenue);
}

function buildStackSegments(
  points: readonly CustomerSegmentPoint[],
  key: 'customerShare' | 'revenueShare',
): readonly (CustomerSegmentPoint & {
  readonly end: number;
  readonly start: number;
})[] {
  let cursor = 0;

  return points.map((point) => {
    const start = cursor;
    const end = cursor + point[key];
    cursor = end;

    return {
      ...point,
      end,
      start,
    };
  });
}

function resolveArpuLift(
  points: readonly CustomerSegmentPoint[],
): number | null {
  const returning = points.find((point) => point.id === 'returning');
  const fresh = points.find((point) => point.id === 'new');

  if (!returning || !fresh || fresh.arpu === 0) {
    return null;
  }

  return (returning.arpu - fresh.arpu) / fresh.arpu;
}

function resolveCustomerInsight(points: readonly CustomerSegmentPoint[]): string {
  const returning = points.find((point) => point.id === 'returning') ?? null;
  const fresh = points.find((point) => point.id === 'new') ?? null;
  const arpuLift = resolveArpuLift(points);
  const dominant = [...points].sort((left, right) => Math.abs(right.valueGap) - Math.abs(left.valueGap))[0] ?? null;

  if (!returning && !fresh) {
    return 'Brak segmentów klientów do analizy w bieżącym zakresie.';
  }

  const returningCopy = returning
    ? `Powracający: ${formatPercent(returning.revenueShare)} przychodu przy ${formatPercent(returning.customerShare)} bazy klientów.`
    : '';
  const newCopy = fresh
    ? ` Nowi: ${formatPercent(fresh.revenueShare)} przychodu przy ${formatPercent(fresh.customerShare)} bazy.`
    : '';
  const arpuCopy = arpuLift === null
    ? ''
    : ` Premia ARPU powracających vs nowych: ${formatSignedPercent(arpuLift)}.`;
  const gapCopy = dominant
    ? ` Największe odchylenie wartości ma segment ${dominant.segment}: ${formatSignedPercent(dominant.valueGap)} względem udziału w bazie.`
    : '';

  return `${returningCopy}${newCopy}${arpuCopy}${gapCopy}`;
}

/**
 * The gap chart's row label matches the legend above it ("Powracający"/
 * "Nowi") rather than the free-text `segment` field (e.g. "Powracający
 * klienci") used elsewhere on this screen — that string's length isn't
 * bounded by the contract, and the plot's left margin is sized for these
 * two known, short tone labels, not for arbitrary segment text.
 */
function resolveSegmentToneLabel(tone: CustomerSegmentPoint['tone']): string {
  return tone === 'returning' ? 'Powracający' : 'Nowi';
}

/** Symmetric domain around 0, rounded up to the nearest 5pp, with a floor so a near-zero gap doesn't render as an invisible sliver. */
function resolveGapDomain(points: readonly CustomerSegmentPoint[]): number {
  const maxAbsGap = points.reduce((max, point) => Math.max(max, Math.abs(point.valueGap)), 0);

  return Math.max(minGapDomain, Math.ceil((maxAbsGap + 0.02) * 20) / 20);
}

function CommandCustomerEconomicsChart({
  customerRows,
}: {
  readonly customerRows: readonly DataRow[];
}) {
  const points = buildCustomerSegmentPoints(customerRows);
  const revenueSegments = buildStackSegments(points, 'revenueShare');
  const customerSegments = buildStackSegments(points, 'customerShare');
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const totalCustomers = points.reduce((sum, point) => sum + point.customers, 0);
  const returning = points.find((point) => point.id === 'returning') ?? null;
  const strongestSegment = [...points].sort((left, right) => right.arpuIndex - left.arpuIndex)[0] ?? null;
  const arpuLift = resolveArpuLift(points);
  const mixWidth = customerViewBox.mixRight - customerViewBox.mixLeft;
  const gapCenterX = customerViewBox.mixLeft + mixWidth / 2;
  const gapHalfWidth = mixWidth / 2;
  const gapDomain = resolveGapDomain(points);
  const scaleMixX = (share: number) => customerViewBox.mixLeft + mixWidth * Math.max(0, Math.min(1, share));
  const scaleGapX = (gap: number) => (
    gapCenterX + gapHalfWidth * Math.max(-1, Math.min(1, gap / gapDomain))
  );
  const metrics = [
    {
      detail: 'udział powracających w przychodzie',
      label: 'Revenue returning',
      tone: 'returning',
      value: returning ? formatPercent(returning.revenueShare) : '—',
    },
    {
      detail: 'udział powracających w bazie klientów',
      label: 'Baza returning',
      tone: 'neutral',
      value: returning ? formatPercent(returning.customerShare) : '—',
    },
    {
      detail: 'powracający vs nowi',
      label: 'Premia ARPU',
      tone: arpuLift !== null && arpuLift >= 0 ? 'returning' : 'new',
      value: formatSignedPercent(arpuLift),
    },
    {
      detail: strongestSegment?.segment ?? 'brak segmentu',
      label: 'Najmocniejszy ARPU',
      tone: strongestSegment?.tone ?? 'neutral',
      value: strongestSegment ? `${decimalFormatter.format(strongestSegment.arpuIndex)}x` : '—',
    },
  ] as const;

  return (
    <div
      aria-label="Analityka klientów nowych i powracających: miks przychodu, miks bazy i odchylenie wartości segmentu"
      className="pd-command-customers-visual"
      role="group"
    >
      <svg
        aria-hidden="true"
        className="pd-command-customers-chart"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${customerViewBox.width} ${customerViewBox.height}`}
      >
        <defs>
          <linearGradient id="command-customers-returning" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-1)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-1) 60%, var(--pd-data-series-2) 40%)" />
          </linearGradient>
          <linearGradient id="command-customers-new" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-2)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-2) 54%, var(--pd-data-series-3) 46%)" />
          </linearGradient>
        </defs>

        <text
          className="pd-command-customers-chart__axis-title"
          x={customerViewBox.mixLeft}
          y="34"
        >
          Miks segmentów
        </text>

        {/* Explicit legend — without it the reader has no way to tell which
            color means "nowi" vs "powracający" from the mix bars alone; the
            tone/color mapping was previously only discoverable by scrolling
            down to the metric cards. */}
        <g className="pd-command-customers-chart__legend">
          <rect
            className="pd-command-customers-chart__legend-swatch"
            data-tone="returning"
            height="14"
            rx="4"
            width="14"
            x={customerViewBox.mixLeft}
            y="46"
          />
          <text
            className="pd-command-customers-chart__legend-label"
            x={customerViewBox.mixLeft + 22}
            y="57"
          >
            Powracający
          </text>
          <rect
            className="pd-command-customers-chart__legend-swatch"
            data-tone="new"
            height="14"
            rx="4"
            width="14"
            x={customerViewBox.mixLeft + 170}
            y="46"
          />
          <text
            className="pd-command-customers-chart__legend-label"
            x={customerViewBox.mixLeft + 192}
            y="57"
          >
            Nowi
          </text>
        </g>

        {customerShareTicks.map((tick) => {
          const x = scaleMixX(tick);

          return (
            <g key={`customer-mix-axis-${tick}`}>
              <line
                className="pd-command-customers-chart__grid-line"
                x1={x}
                x2={x}
                y1="86"
                y2="208"
              />
              <text
                className="pd-command-customers-chart__axis-value"
                textAnchor="middle"
                x={x}
                y="234"
              >
                {formatPercent(tick)}
              </text>
            </g>
          );
        })}

        {[
          { kind: 'revenue' as const, label: 'Przychód', segments: revenueSegments, y: 106 },
          { kind: 'customers' as const, label: 'Baza klientów', segments: customerSegments, y: 168 },
        ].map((row) => (
          <g key={row.label}>
            <text
              className="pd-command-customers-chart__row-label"
              textAnchor="end"
              x={customerViewBox.mixLeft - 18}
              y={row.y + 22}
            >
              {row.label}
            </text>
            <rect
              className="pd-command-customers-chart__track"
              height="30"
              rx="10"
              width={mixWidth}
              x={customerViewBox.mixLeft}
              y={row.y}
            />
            {row.segments.map((segment) => {
              const x = scaleMixX(segment.start);
              const width = Math.max(scaleMixX(segment.end) - x, 2);
              const share = row.kind === 'revenue' ? segment.revenueShare : segment.customerShare;

              return (
                <g
                  data-tone={segment.tone}
                  key={`${row.label}-${segment.id}`}
                >
                  <rect
                    className="pd-command-customers-chart__mix-segment"
                    height="30"
                    rx="10"
                    width={width}
                    x={x}
                    y={row.y}
                  />
                  {width > 92 ? (
                    <text
                      className="pd-command-customers-chart__segment-value"
                      textAnchor="middle"
                      x={x + width / 2}
                      y={row.y + 20}
                    >
                      {formatPercent(share)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        ))}

        <text
          className="pd-command-customers-chart__axis-title"
          x={customerViewBox.mixLeft}
          y="286"
        >
          Odchylenie wartości segmentu
        </text>
        <text
          className="pd-command-customers-chart__axis-subtitle"
          x={customerViewBox.mixLeft}
          y="304"
        >
          udział w przychodzie − udział w bazie klientów
        </text>

        <line
          className="pd-command-customers-chart__gap-zero-line"
          x1={gapCenterX}
          x2={gapCenterX}
          y1={customerViewBox.gapTop - 12}
          y2={customerViewBox.gapTop + customerViewBox.gapRowGap + customerViewBox.gapRowHeight + 12}
        />

        {points.map((point, index) => {
          const y = customerViewBox.gapTop + index * customerViewBox.gapRowGap;
          const barX = scaleGapX(point.valueGap);
          const barStart = Math.min(barX, gapCenterX);
          const barWidth = Math.max(Math.abs(barX - gapCenterX), 2);
          const isPositive = point.valueGap >= 0;

          return (
            <g
              data-tone={point.tone}
              key={`gap-${point.id}`}
            >
              <text
                className="pd-command-customers-chart__row-label"
                textAnchor="end"
                x={customerViewBox.mixLeft - 18}
                y={y + customerViewBox.gapRowHeight / 2 + 5}
              >
                {resolveSegmentToneLabel(point.tone)}
              </text>
              <rect
                className="pd-command-customers-chart__gap-track"
                height={customerViewBox.gapRowHeight}
                rx="8"
                width={mixWidth}
                x={customerViewBox.mixLeft}
                y={y}
              />
              <rect
                className="pd-command-customers-chart__gap-bar"
                height={customerViewBox.gapRowHeight}
                rx="8"
                width={barWidth}
                x={barStart}
                y={y}
              />
              <text
                className="pd-command-customers-chart__gap-value"
                data-direction={isPositive ? 'positive' : 'negative'}
                textAnchor={isPositive ? 'start' : 'end'}
                x={isPositive ? barX + 10 : barX - 10}
                y={y + customerViewBox.gapRowHeight / 2 + 5}
              >
                {formatSignedPercent(point.valueGap)}
              </text>
            </g>
          );
        })}

        <text
          className="pd-command-customers-chart__axis-value"
          textAnchor="middle"
          x={scaleGapX(-gapDomain)}
          y={customerViewBox.gapTop + customerViewBox.gapRowGap + customerViewBox.gapRowHeight + 34}
        >
          {formatSignedPercent(-gapDomain)}
        </text>
        <text
          className="pd-command-customers-chart__axis-value"
          textAnchor="middle"
          x={gapCenterX}
          y={customerViewBox.gapTop + customerViewBox.gapRowGap + customerViewBox.gapRowHeight + 34}
        >
          parytet 0%
        </text>
        <text
          className="pd-command-customers-chart__axis-value"
          textAnchor="middle"
          x={scaleGapX(gapDomain)}
          y={customerViewBox.gapTop + customerViewBox.gapRowGap + customerViewBox.gapRowHeight + 34}
        >
          {formatSignedPercent(gapDomain)}
        </text>

        <text
          className="pd-command-customers-chart__total"
          x={customerViewBox.mixLeft}
          y={customerViewBox.height - 24}
        >
          Razem: {formatMetricValue(totalRevenue, 'currency')} · {formatIntegerValue(totalCustomers)} klientów
        </text>
      </svg>

      <ul className="pd-command-customers-visual__metrics">
        {metrics.map((metric) => (
          <li
            data-tone={metric.tone}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </li>
        ))}
      </ul>

      <div className="pd-command-customers-visual__segments">
        {points.map((point) => (
          <article
            data-tone={point.tone}
            key={point.id}
          >
            <header>
              <h3>{point.segment}</h3>
              <strong>{formatMetricValue(point.revenue, 'currency')}</strong>
            </header>
            <dl>
              <div><dt>Klienci</dt><dd>{formatIntegerValue(point.customers)}</dd></div>
              <div><dt>ARPU</dt><dd>{formatMetricValue(point.arpu, 'currency')}</dd></div>
              <div><dt>Śr. produktów</dt><dd>{decimalFormatter.format(point.productsPerOrder)}</dd></div>
              <div><dt>Częstotliwość</dt><dd>{decimalFormatter.format(point.frequency)}</dd></div>
              <div><dt>Value gap</dt><dd>{formatSignedPercent(point.valueGap)}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <p className="pd-command-customers-visual__insight">
        {resolveCustomerInsight(points)}
      </p>
    </div>
  );
}

export function CommandCenterCustomerSplitSection({
  customerRows,
}: {
  readonly customerRows: readonly DataRow[];
}) {
  return (
    <section
      aria-labelledby="command-center-customers-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__customer-section"
    >
      <VisuallyHidden as="div">
        <CommandSectionHeader
          description="Udział przychodu i podstawowa ekonomika segmentów nowych i powracających klientów."
          eyebrow="Klienci"
          title="Nowi i powracający"
          titleId="command-center-customers-title"
        />
      </VisuallyHidden>
      {customerRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze podziału na klientów nowych i powracających dla wybranego zakresu."
          title="Brak segmentów klientów"
          variant="configuration"
        />
      ) : (
        <>
          <CommandCustomerEconomicsChart customerRows={customerRows} />

          <CommandChartTableFallback
            ariaLabel="Segmenty klientów: liczba, przychód, ARPU i częstotliwość"
            columns={customerColumns}
            emptyMessage="Brak segmentów klientów."
            minWidth={920}
            rows={customerRows}
            sortColumnId="revenue"
          />
        </>
      )}
    </section>
  );
}
