import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  EmptyState,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  customerColumns,
  formatMetricValue,
  formatPercent,
  openPapaAssistantForElement,
} from './commandCenterOnePageModel';

const customerSplitElementId = 'command-customer-split';
const customerViewBox = {
  height: 690,
  matrixBottom: 566,
  matrixLeft: 96,
  matrixRight: 918,
  matrixTop: 292,
  mixLeft: 96,
  mixRight: 918,
  width: 1000,
} as const;
const customerShareTicks = [0, 0.25, 0.5, 0.75, 1] as const;

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
  const matrixWidth = customerViewBox.matrixRight - customerViewBox.matrixLeft;
  const matrixHeight = customerViewBox.matrixBottom - customerViewBox.matrixTop;
  const scaleMixX = (share: number) => customerViewBox.mixLeft + mixWidth * Math.max(0, Math.min(1, share));
  const scaleMatrixX = (share: number) => customerViewBox.matrixLeft + matrixWidth * Math.max(0, Math.min(1, share));
  const scaleMatrixY = (share: number) => customerViewBox.matrixBottom - matrixHeight * Math.max(0, Math.min(1, share));
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
      aria-label="Analityka klientów nowych i powracających: miks przychodu, miks bazy i matryca wartości"
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
          <radialGradient id="command-customers-bubble" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--pd-text) 100%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-text) 12%, transparent)" />
          </radialGradient>
        </defs>

        <text
          className="pd-command-customers-chart__axis-title"
          x={customerViewBox.mixLeft}
          y="58"
        >
          Miks segmentów
        </text>

        {customerShareTicks.map((tick) => {
          const x = scaleMixX(tick);

          return (
            <g key={`customer-mix-axis-${tick}`}>
              <line
                className="pd-command-customers-chart__grid-line"
                x1={x}
                x2={x}
                y1="84"
                y2="206"
              />
              <text
                className="pd-command-customers-chart__axis-value"
                textAnchor="middle"
                x={x}
                y="232"
              >
                {formatPercent(tick)}
              </text>
            </g>
          );
        })}

        {[
          { kind: 'revenue' as const, label: 'Przychód', segments: revenueSegments, y: 104 },
          { kind: 'customers' as const, label: 'Baza klientów', segments: customerSegments, y: 166 },
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
          x={customerViewBox.matrixLeft}
          y="262"
        >
          Matryca wartości segmentu
        </text>

        <rect
          className="pd-command-customers-chart__matrix-bg"
          height={matrixHeight}
          width={matrixWidth}
          x={customerViewBox.matrixLeft}
          y={customerViewBox.matrixTop}
        />

        {customerShareTicks.map((tick) => {
          const x = scaleMatrixX(tick);
          const y = scaleMatrixY(tick);

          return (
            <g key={`customer-matrix-axis-${tick}`}>
              <line
                className="pd-command-customers-chart__matrix-grid"
                x1={x}
                x2={x}
                y1={customerViewBox.matrixTop}
                y2={customerViewBox.matrixBottom}
              />
              <line
                className="pd-command-customers-chart__matrix-grid"
                x1={customerViewBox.matrixLeft}
                x2={customerViewBox.matrixRight}
                y1={y}
                y2={y}
              />
              <text
                className="pd-command-customers-chart__axis-value"
                textAnchor="middle"
                x={x}
                y={customerViewBox.matrixBottom + 32}
              >
                {formatPercent(tick)}
              </text>
              <text
                className="pd-command-customers-chart__axis-value"
                textAnchor="end"
                x={customerViewBox.matrixLeft - 14}
                y={y + 4}
              >
                {formatPercent(tick)}
              </text>
            </g>
          );
        })}

        <line
          className="pd-command-customers-chart__parity-line"
          x1={customerViewBox.matrixLeft}
          x2={customerViewBox.matrixRight}
          y1={customerViewBox.matrixBottom}
          y2={customerViewBox.matrixTop}
        />
        <text
          className="pd-command-customers-chart__parity-label"
          textAnchor="end"
          x={customerViewBox.matrixRight - 14}
          y={customerViewBox.matrixTop + 18}
        >
          parytet: udział przychodu = udział bazy
        </text>

        {points.map((point) => {
          const x = scaleMatrixX(point.customerShare);
          const y = scaleMatrixY(point.revenueShare);
          const radius = Math.min(Math.max(14 + point.arpuIndex * 7, 14), 28);

          return (
            <g
              data-tone={point.tone}
              key={`matrix-${point.id}`}
            >
              <line
                className="pd-command-customers-chart__value-gap"
                x1={x}
                x2={x}
                y1={scaleMatrixY(point.customerShare)}
                y2={y}
              />
              <circle
                className="pd-command-customers-chart__bubble-halo"
                cx={x}
                cy={y}
                r={radius + 8}
              />
              <circle
                className="pd-command-customers-chart__bubble"
                cx={x}
                cy={y}
                r={radius}
              />
              <text
                className="pd-command-customers-chart__bubble-label"
                textAnchor="middle"
                x={x}
                y={y - radius - 12}
              >
                {point.id === 'returning' ? 'powracający' : 'nowi'} · ARPU {decimalFormatter.format(point.arpuIndex)}x
              </text>
              <text
                className="pd-command-customers-chart__bubble-value"
                textAnchor="middle"
                x={x}
                y={y + 4}
              >
                {formatCompactCurrency(point.revenue)}
              </text>
            </g>
          );
        })}

        <text
          className="pd-command-customers-chart__axis-title"
          textAnchor="middle"
          x={(customerViewBox.matrixLeft + customerViewBox.matrixRight) / 2}
          y={customerViewBox.matrixBottom + 70}
        >
          Udział w bazie klientów
        </text>
        <text
          className="pd-command-customers-chart__axis-title"
          textAnchor="middle"
          transform={`rotate(-90 ${customerViewBox.matrixLeft - 70} ${(customerViewBox.matrixTop + customerViewBox.matrixBottom) / 2})`}
          x={customerViewBox.matrixLeft - 70}
          y={(customerViewBox.matrixTop + customerViewBox.matrixBottom) / 2}
        >
          Udział w przychodzie
        </text>

        <text
          className="pd-command-customers-chart__total"
          x={customerViewBox.mixLeft}
          y="650"
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
      <CommandSectionHeader
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(customerSplitElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Udział przychodu i podstawowa ekonomika segmentów nowych i powracających klientów."
        eyebrow="Klienci"
        title="Nowi i powracający"
        titleId="command-center-customers-title"
      />
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
