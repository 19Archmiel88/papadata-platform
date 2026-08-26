import {
  useId,
  useState,
} from 'react';
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
  productColumns,
} from './commandCenterOnePageModel';

const productViewBox = {
  height: 640,
  plotBottom: 520,
  plotLeft: 216,
  plotRight: 900,
  plotTop: 76,
  rowGap: 52,
  rowHeight: 20,
  width: 1000,
} as const;
const productTopLimit = 8;
const productAxisTicks = [0, 0.25, 0.5, 0.75, 1] as const;

type ProductChartRow = {
  readonly averageUnitRevenue: number | null;
  readonly changePercent: number | null;
  readonly cumulativeShare: number;
  readonly id: string;
  readonly index: number;
  readonly product: string;
  readonly quantity: number;
  readonly revenue: number;
  readonly share: number;
};

/**
 * Ordinal color: one hue, monotone lightness by rank — products are already
 * sorted by revenue, so "swapping the order would change the meaning" the
 * same way funnel stages do. Reuses the funnel's --pd-data-actual hue for a
 * consistent "this color = a real outcome metric" language across Command
 * Center, rather than picking a new one per chart.
 */
function resolveProductStepFill(index: number, total: number): string {
  const ratio = total > 1 ? index / (total - 1) : 0;
  const mixPercent = 100 - ratio * 55;

  return `color-mix(in srgb, var(--pd-data-actual) ${mixPercent.toFixed(1)}%, var(--pd-surface))`;
}

function resolveProductTooltipX(x: number): number {
  return x > productViewBox.plotRight - 190 ? x - 210 : x + 14;
}

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  currency: 'PLN',
  maximumFractionDigits: 0,
  style: 'currency',
});

const compactCurrencyFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
  style: 'percent',
});

const signedPercentFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 1,
  signDisplay: 'always',
  style: 'percent',
});

const integerFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 0,
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

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${compactCurrencyFormatter.format(value / 1_000_000)} mln zł`;
  }

  if (absoluteValue >= 10_000) {
    return `${compactCurrencyFormatter.format(value / 1_000)} tys. zł`;
  }

  return currencyFormatter.format(value);
}

function formatPercent(value: number | null): string {
  if (
    value === null
    || !Number.isFinite(value)
  ) {
    return '—';
  }

  return percentFormatter.format(value);
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

function formatIntegerValue(value: number): string {
  return integerFormatter.format(value);
}

// Pre-existing bug, not introduced by this pass: at 24 chars, a mono-font
// label anchored at plotLeft-18 routinely ran past the rank number's own
// slot at plotLeft-162 (only ~144 viewBox units of gutter for both) —
// visually confirmed via screenshot. 16 clears it with room to spare.
function truncateProductLabel(label: string): string {
  return label.length > 16 ? `${label.slice(0, 13)}...` : label;
}

function buildProductChartRows(
  productRows: readonly DataRow[],
): readonly ProductChartRow[] {
  const sortedRows = [...productRows]
    .map((row) => ({
      changePercent: readNumber(row, 'rawChangePercent'),
      id: String(row.id),
      product: readString(row, 'product'),
      quantity: readNumber(row, 'rawQuantity') ?? 0,
      revenue: readNumber(row, 'rawRevenue') ?? 0,
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, productTopLimit);
  const totalRevenue = sortedRows.reduce((sum, row) => sum + row.revenue, 0);
  let cumulativeRevenue = 0;

  return sortedRows.map((row, index) => {
    cumulativeRevenue += row.revenue;
    const share = totalRevenue > 0 ? row.revenue / totalRevenue : 0;
    const cumulativeShare = totalRevenue > 0 ? cumulativeRevenue / totalRevenue : 0;
    const averageUnitRevenue = row.quantity > 0 ? row.revenue / row.quantity : null;

    return {
      ...row,
      averageUnitRevenue,
      cumulativeShare,
      index,
      share,
    };
  });
}

function resolveProductInsight(rows: readonly ProductChartRow[]): string {
  const leader = rows[0] ?? null;
  const firstThreeShare = rows.slice(0, 3).reduce((sum, row) => sum + row.share, 0);
  const strongestGrowth = rows
    .filter((row) => row.changePercent !== null)
    .sort((left, right) => (right.changePercent ?? 0) - (left.changePercent ?? 0))[0] ?? null;
  const steepestDecline = rows
    .filter((row) => row.changePercent !== null)
    .sort((left, right) => (left.changePercent ?? 0) - (right.changePercent ?? 0))[0] ?? null;

  if (!leader) {
    return 'Brak produktów do analizy w bieżącym zakresie.';
  }

  const growthCopy = strongestGrowth && (strongestGrowth.changePercent ?? 0) > 0
    ? ` Najszybszy wzrost: ${strongestGrowth.product} (${formatSignedPercent((strongestGrowth.changePercent ?? 0) / 100)}).`
    : '';
  const declineCopy = steepestDecline && (steepestDecline.changePercent ?? 0) < 0
    ? ` Największy spadek: ${steepestDecline.product} (${formatSignedPercent((steepestDecline.changePercent ?? 0) / 100)}).`
    : '';

  return `Top 3 produktów odpowiada za ${formatPercent(firstThreeShare)} przychodu top listy. Lider: ${leader.product}, udział ${formatPercent(leader.share)}.${growthCopy}${declineCopy}`;
}

function CommandProductPortfolioChart({
  productRows,
}: {
  readonly productRows: readonly DataRow[];
}) {
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const tooltipTitleId = useId();
  const rows = buildProductChartRows(productRows);
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null;
  const leaderRevenue = rows[0]?.revenue ?? 1;
  const plotWidth = productViewBox.plotRight - productViewBox.plotLeft;
  const plotHeight = productViewBox.plotBottom - productViewBox.plotTop;
  const scaleX = (value: number) => (
    productViewBox.plotLeft
    + plotWidth * Math.max(0, Math.min(1, value / Math.max(leaderRevenue, 1)))
  );

  function resolveRowY(index: number): number {
    return productViewBox.plotTop + index * productViewBox.rowGap;
  }

  const topThreeShare = rows.slice(0, 3).reduce((sum, row) => sum + row.share, 0);
  const positiveRows = rows.filter((row) => (row.changePercent ?? 0) > 0).length;
  const negativeRows = rows.filter((row) => (row.changePercent ?? 0) < 0).length;
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const metrics = [
    {
      detail: 'suma produktów widocznych na wykresie',
      label: 'Przychód top listy',
      tone: 'leader',
      value: formatCurrency(totalRevenue),
    },
    {
      detail: 'koncentracja portfela',
      label: 'Udział TOP 3',
      tone: topThreeShare >= 0.7 ? 'warning' : 'neutral',
      value: formatPercent(topThreeShare),
    },
    {
      detail: 'produkty ze wzrostem vs spadkiem',
      label: 'Momentum',
      tone: positiveRows >= negativeRows ? 'growth' : 'decline',
      value: `${positiveRows}/${negativeRows}`,
    },
    {
      detail: 'sprzedane sztuki w top liście',
      label: 'Wolumen',
      tone: 'neutral',
      value: formatIntegerValue(totalQuantity),
    },
  ] as const;

  return (
    <div
      aria-label="Analityka produktów: przychód, udział, kumulacja i dynamika"
      className="pd-command-products-visual"
      role="group"
    >
      <svg
        aria-hidden="true"
        className="pd-command-products-chart"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${productViewBox.width} ${productViewBox.height}`}
      >
        <rect
          className="pd-command-products-chart__plot-bg"
          height={plotHeight + 74}
          width={plotWidth}
          x={productViewBox.plotLeft}
          y={productViewBox.plotTop - 36}
        />

        {productAxisTicks.map((tick) => {
          const x = productViewBox.plotLeft + plotWidth * tick;

          return (
            <g key={`product-axis-${tick}`}>
              <line
                className="pd-command-products-chart__grid-line"
                x1={x}
                x2={x}
                y1={productViewBox.plotTop - 24}
                y2={productViewBox.plotBottom + 26}
              />
              <text
                className="pd-command-products-chart__axis-value"
                textAnchor="middle"
                x={x}
                y={productViewBox.plotBottom + 52}
              >
                {formatCompactCurrency(leaderRevenue * tick)}
              </text>
            </g>
          );
        })}

        <text
          className="pd-command-products-chart__axis-title"
          x={productViewBox.plotLeft}
          y={productViewBox.plotTop - 56}
        >
          Przychód produktu
        </text>

        {rows.map((row, index) => {
          const y = resolveRowY(index);
          const barWidth = Math.max(scaleX(row.revenue) - productViewBox.plotLeft, 4);
          const averageLabel = row.averageUnitRevenue === null
            ? '—'
            : formatCompactCurrency(row.averageUnitRevenue);

          return (
            <g key={row.id}>
              <text
                className="pd-command-products-chart__rank"
                textAnchor="end"
                x={productViewBox.plotLeft - 162}
                y={y + 15}
              >
                {String(row.index + 1).padStart(2, '0')}
              </text>
              <text
                className="pd-command-products-chart__product-label"
                textAnchor="end"
                x={productViewBox.plotLeft - 18}
                y={y + 15}
              >
                {truncateProductLabel(row.product)}
              </text>
              <rect
                className="pd-command-products-chart__track"
                height={productViewBox.rowHeight}
                rx="6"
                width={plotWidth}
                x={productViewBox.plotLeft}
                y={y}
              />
              <rect
                className="pd-command-products-chart__bar"
                height={productViewBox.rowHeight}
                rx="6"
                style={{ fill: resolveProductStepFill(index, rows.length) }}
                width={barWidth}
                x={productViewBox.plotLeft}
                y={y}
              />
              <text
                className="pd-command-products-chart__value"
                x={productViewBox.plotLeft + barWidth + 12}
                y={y + 15}
              >
                {formatCurrency(row.revenue)} · {formatPercent(row.share)}
              </text>
              <text
                className="pd-command-products-chart__row-meta"
                x={productViewBox.plotLeft}
                y={y + 41}
              >
                {formatIntegerValue(row.quantity)} szt. · średnio {averageLabel}/szt. · skum. {formatPercent(row.cumulativeShare)}
              </text>
              <text
                className="pd-command-products-chart__change"
                data-change={row.changePercent === null ? 'missing' : row.changePercent >= 0 ? 'positive' : 'negative'}
                textAnchor="end"
                x={productViewBox.plotRight}
                y={y + 41}
              >
                zmiana {formatSignedPercent(row.changePercent === null ? null : row.changePercent / 100)}
              </text>

              {/* Mouse-only hit target — the whole chart is aria-hidden (the
                  real data lives in the always-reachable "Pokaż dane" table),
                  so a tab-focusable descendant here would be the
                  focusable-but-hidden anti-pattern, not an improvement. */}
              <rect
                className="pd-command-products-chart__hit-area"
                height={productViewBox.rowHeight + 26}
                width={plotWidth}
                x={productViewBox.plotLeft}
                y={y - 20}
                onMouseEnter={() => setActiveRowId(row.id)}
                onMouseLeave={() => setActiveRowId((current) => (current === row.id ? null : current))}
              />
            </g>
          );
        })}

        {activeRow ? (
          <g
            className="pd-command-products-chart__tooltip"
            transform={`translate(${resolveProductTooltipX(scaleX(activeRow.revenue))}, ${resolveRowY(activeRow.index) - 8})`}
          >
            <rect
              aria-labelledby={tooltipTitleId}
              height="112"
              rx="9"
              width="212"
            />
            <text
              className="pd-command-products-chart__tooltip-title"
              id={tooltipTitleId}
              x="14"
              y="22"
            >
              {activeRow.product}
            </text>
            <text
              className="pd-command-products-chart__tooltip-value"
              x="14"
              y="42"
            >
              {formatCurrency(activeRow.revenue)}
            </text>
            <text
              className="pd-command-products-chart__tooltip-detail"
              x="14"
              y="61"
            >
              Udział: {formatPercent(activeRow.share)} · skumulowany {formatPercent(activeRow.cumulativeShare)}
            </text>
            <text
              className="pd-command-products-chart__tooltip-detail"
              x="14"
              y="79"
            >
              {formatIntegerValue(activeRow.quantity)} szt. · zmiana {formatSignedPercent(activeRow.changePercent === null ? null : activeRow.changePercent / 100)}
            </text>
          </g>
        ) : null}
      </svg>

      <ul className="pd-command-products-visual__metrics">
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

      <p className="pd-command-products-visual__insight">
        {resolveProductInsight(rows)}
      </p>
    </div>
  );
}

export function CommandCenterProductSalesSection({
  productRows,
}: {
  readonly productRows: readonly DataRow[];
}) {
  return (
    <section
      aria-labelledby="command-center-products-title"
      className="pd-command-center-one-page__section"
    >
      <VisuallyHidden as="div">
        <CommandSectionHeader
          description="Ranking produktów według przychodu pozwala szybko znaleźć pozycje, które realnie przesuwają wynik okresu."
          eyebrow="Produkty"
          title="Najlepiej sprzedające się produkty"
          titleId="command-center-products-title"
        />
      </VisuallyHidden>
      {productRows.length === 0 ? (
        <EmptyState
          message="Kontrakt Centrum Dowodzenia nie dostarcza jeszcze sprzedaży w podziale na produkty dla wybranego zakresu."
          title="Brak danych produktowych"
          variant="configuration"
        />
      ) : (
        <>
          <CommandProductPortfolioChart productRows={productRows} />

          <CommandChartTableFallback
            ariaLabel="Produkty: przychód, ilość i zmiana"
            columns={productColumns}
            emptyMessage="Brak danych produktowych."
            minWidth={660}
            rows={productRows}
            sortColumnId="revenue"
          />
        </>
      )}
    </section>
  );
}
