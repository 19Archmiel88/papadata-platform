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
  openPapaAssistantForElement,
  productColumns,
} from './commandCenterOnePageModel';

const productSalesElementId = 'command-product-sales';
const productViewBox = {
  height: 640,
  plotBottom: 520,
  plotLeft: 216,
  plotRight: 860,
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
  readonly tone: 'decline' | 'growth' | 'leader' | 'neutral';
};

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

function truncateProductLabel(label: string): string {
  return label.length > 24 ? `${label.slice(0, 21)}...` : label;
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
    const isLeader = index === 0 || share >= 0.22;
    const tone = isLeader
      ? 'leader'
      : row.changePercent !== null && row.changePercent >= 8
        ? 'growth'
        : row.changePercent !== null && row.changePercent <= -8
          ? 'decline'
          : 'neutral';

    return {
      ...row,
      averageUnitRevenue,
      cumulativeShare,
      index,
      share,
      tone,
    };
  });
}

function buildLinePath(
  points: readonly {
    readonly x: number;
    readonly y: number;
  }[],
): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
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
  const rows = buildProductChartRows(productRows);
  const leaderRevenue = rows[0]?.revenue ?? 1;
  const plotWidth = productViewBox.plotRight - productViewBox.plotLeft;
  const plotHeight = productViewBox.plotBottom - productViewBox.plotTop;
  const scaleX = (value: number) => (
    productViewBox.plotLeft
    + plotWidth * Math.max(0, Math.min(1, value / Math.max(leaderRevenue, 1)))
  );
  const shareY = (share: number) => (
    productViewBox.plotBottom - share * plotHeight
  );
  const cumulativePoints = rows.map((row, index) => ({
    x: productViewBox.plotLeft + (plotWidth / Math.max(rows.length - 1, 1)) * index,
    y: shareY(row.cumulativeShare),
  }));
  const linePath = cumulativePoints.length > 0 ? buildLinePath(cumulativePoints) : '';
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
        <defs>
          <linearGradient id="command-products-leader" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-1)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-1) 62%, var(--pd-data-series-2) 38%)" />
          </linearGradient>
          <linearGradient id="command-products-growth" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-2)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-2) 74%, var(--pd-text) 26%)" />
          </linearGradient>
          <linearGradient id="command-products-decline" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-4)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-4) 72%, var(--pd-data-series-1) 28%)" />
          </linearGradient>
          <linearGradient id="command-products-neutral" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--pd-data-series-3) 76%, var(--pd-text) 24%)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-3) 42%, transparent)" />
          </linearGradient>
          <linearGradient id="command-products-pareto" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-2)" />
            <stop offset="100%" stopColor="var(--pd-data-series-1)" />
          </linearGradient>
        </defs>

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

        {[0.5, 0.8, 1].map((share) => (
          <g key={`product-share-${share}`}>
            <line
              className="pd-command-products-chart__pareto-grid"
              x1={productViewBox.plotLeft}
              x2={productViewBox.plotRight}
              y1={shareY(share)}
              y2={shareY(share)}
            />
            <text
              className="pd-command-products-chart__share-label"
              textAnchor="start"
              x={productViewBox.plotRight + 12}
              y={shareY(share) + 4}
            >
              {formatPercent(share)}
            </text>
          </g>
        ))}

        <text
          className="pd-command-products-chart__axis-title"
          x={productViewBox.plotLeft}
          y={productViewBox.plotTop - 56}
        >
          Przychód produktu
        </text>
        <text
          className="pd-command-products-chart__axis-title"
          textAnchor="end"
          x={productViewBox.plotRight + 74}
          y={productViewBox.plotTop - 56}
        >
          Kumulacja udziału
        </text>

        {rows.map((row, index) => {
          const y = productViewBox.plotTop + index * productViewBox.rowGap;
          const barWidth = Math.max(scaleX(row.revenue) - productViewBox.plotLeft, 4);
          const averageLabel = row.averageUnitRevenue === null
            ? '—'
            : formatCompactCurrency(row.averageUnitRevenue);

          return (
            <g
              data-tone={row.tone}
              key={row.id}
            >
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
                rx="7"
                width={plotWidth}
                x={productViewBox.plotLeft}
                y={y}
              />
              <rect
                className="pd-command-products-chart__bar"
                height={productViewBox.rowHeight}
                rx="7"
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
                {formatIntegerValue(row.quantity)} szt. · średnio {averageLabel}/szt.
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
            </g>
          );
        })}

        {linePath ? (
          <path
            className="pd-command-products-chart__pareto-line"
            d={linePath}
          />
        ) : null}

        {cumulativePoints.map((point, index) => (
          <g key={`pareto-point-${rows[index]?.id ?? index}`}>
            <circle
              className="pd-command-products-chart__pareto-point"
              cx={point.x}
              cy={point.y}
              r="5"
            />
            {index === 2 || index === cumulativePoints.length - 1 ? (
              <text
                className="pd-command-products-chart__pareto-value"
                textAnchor="middle"
                x={point.x}
                y={point.y - 12}
              >
                {formatPercent(rows[index]?.cumulativeShare ?? 0)}
              </text>
            ) : null}
          </g>
        ))}
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
      <CommandSectionHeader
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(productSalesElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Ranking produktów według przychodu pozwala szybko znaleźć pozycje, które realnie przesuwają wynik okresu."
        eyebrow="Produkty"
        title="Najlepiej sprzedające się produkty"
        titleId="command-center-products-title"
      />
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
