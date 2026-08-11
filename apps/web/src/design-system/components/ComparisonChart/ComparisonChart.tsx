import type {
  HTMLAttributes,
} from 'react';
import {
  useState,
} from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { joinClassNames } from '../Field/fieldUtils';
import './comparison-chart.css';

export type ComparisonChartVariant =
  | 'bar'
  | 'grouped'
  | 'ranking';

export type ComparisonChartRankingDirection =
  | 'ascending'
  | 'descending';

export type ComparisonChartDatum = {
  readonly id: string;
  readonly label: string;
  readonly values: Readonly<Record<string, number | null>>;
};

export type ComparisonChartSeries = {
  readonly key: string;
  readonly label: string;
};

export type ComparisonChartBenchmark = {
  readonly label: string;
  readonly value: number;
};

export type ComparisonChartLabels = {
  readonly legend: string;
};

export type ComparisonChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly ariaLabel: string;
  readonly benchmark?: ComparisonChartBenchmark | null;
  readonly data: readonly ComparisonChartDatum[];
  readonly labels?: Partial<ComparisonChartLabels>;
  readonly rankingDirection?: ComparisonChartRankingDirection;
  readonly series: readonly ComparisonChartSeries[];
  readonly unit?: string | null;
  readonly valueFormatter?: ((value: number) => string) | null;
  readonly variant?: ComparisonChartVariant;
};

type FlattenedDatum = Record<
  string,
  string | number | null
>;

type RuntimeSeries = ComparisonChartSeries & {
  readonly dataKey: string;
  readonly index: number;
};

const defaultLabels: ComparisonChartLabels = {
  legend: 'Serie porównania',
};

const seriesTokens = [
  'var(--pd-data-series-1)',
  'var(--pd-data-series-2)',
  'var(--pd-data-series-3)',
  'var(--pd-data-series-4)',
  'var(--pd-data-series-5)',
  'var(--pd-data-series-6)',
  'var(--pd-data-series-7)',
  'var(--pd-data-series-8)',
  'var(--pd-data-series-9)',
  'var(--pd-data-series-10)',
] as const;

function formatDefaultValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeValue(
  value: number | null | undefined,
): number | null {
  return typeof value === 'number'
    && Number.isFinite(value)
    ? value
    : null;
}

function getNumericValue(
  datum: FlattenedDatum,
  key: string,
): number {
  const value = datum[key];

  return typeof value === 'number'
    && Number.isFinite(value)
    ? value
    : 0;
}

function resolveSeriesToken(index: number): string {
  return seriesTokens[
    index % seriesTokens.length
  ] ?? seriesTokens[0];
}

function resolveDomain(
  data: readonly FlattenedDatum[],
  series: readonly RuntimeSeries[],
  benchmark: ComparisonChartBenchmark | null,
): [number, number] {
  const values = [
    0,
    ...data.flatMap((datum) => (
      series.flatMap(({ dataKey }) => {
        const value = datum[dataKey];

        return typeof value === 'number'
          && Number.isFinite(value)
          ? [value]
          : [];
      })
    )),
  ];

  if (
    benchmark
    && Number.isFinite(benchmark.value)
  ) {
    values.push(benchmark.value);
  }

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (minimum === maximum) {
    if (minimum === 0) {
      return [0, 1];
    }

    const padding = Math.max(
      Math.abs(minimum) * 0.1,
      1,
    );

    return [
      minimum - padding,
      maximum + padding,
    ];
  }

  const span = maximum - minimum;
  const padding = span * 0.08;

  return [
    minimum < 0
      ? minimum - padding
      : 0,
    maximum > 0
      ? maximum + padding
      : 0,
  ];
}

export function ComparisonChart({
  ariaLabel,
  benchmark = null,
  className,
  data,
  labels,
  rankingDirection = 'descending',
  series,
  unit = null,
  valueFormatter = null,
  variant = 'bar',
  ...props
}: ComparisonChartProps) {
  const [isCompactPlot, setIsCompactPlot] =
    useState(false);

  const resolvedLabels: ComparisonChartLabels = {
    ...defaultLabels,
    ...labels,
  };

  const formatValue = (
    valueFormatter ?? formatDefaultValue
  );

  const visibleSeries = (
    variant === 'grouped'
      ? series
      : series.slice(0, 1)
  );

  const runtimeSeries: readonly RuntimeSeries[] = (
    visibleSeries.map((item, index) => ({
      ...item,
      dataKey: `pdSeries${index}`,
      index,
    }))
  );

  const flattenedData: readonly FlattenedDatum[] = (
    data.map((datum) => {
      const row: FlattenedDatum = {
        id: datum.id,
        label: datum.label,
      };

      runtimeSeries.forEach((item) => {
        row[item.dataKey] = normalizeValue(
          datum.values[item.key],
        );
      });

      return row;
    })
  );

  const primaryDataKey = (
    runtimeSeries[0]?.dataKey ?? null
  );

  const chartData = (
    variant === 'ranking'
      && primaryDataKey
      ? [...flattenedData].sort((left, right) => {
          const leftValue = getNumericValue(
            left,
            primaryDataKey,
          );
          const rightValue = getNumericValue(
            right,
            primaryDataKey,
          );

          return rankingDirection === 'ascending'
            ? leftValue - rightValue
            : rightValue - leftValue;
        })
      : flattenedData
  );

  const visibleBenchmark = (
    benchmark
    && Number.isFinite(benchmark.value)
      ? benchmark
      : null
  );

  const domain = resolveDomain(
    chartData,
    runtimeSeries,
    visibleBenchmark,
  );

  const isRanking = variant === 'ranking';

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-comparison-chart',
        className,
      )}
      data-component="comparison-chart"
      data-series-count={runtimeSeries.length}
      data-variant={variant}
      role="group"
    >
      {unit ? (
        <div
          aria-hidden="true"
          className="pd-comparison-chart__axis-caption"
        >
          <span>{unit}</span>
        </div>
      ) : null}

      <div
        className="pd-comparison-chart__plot"
        data-slot="plot"
      >
        <ResponsiveContainer
          debounce={80}
          height="100%"
          minWidth={0}
          onResize={(width) => {
            const nextIsCompact = (
              width > 0
              && width <= 620
            );

            setIsCompactPlot((current) => (
              current === nextIsCompact
                ? current
                : nextIsCompact
            ));
          }}
          width="100%"
        >
          <ComposedChart
            accessibilityLayer
            barCategoryGap={
              variant === 'grouped'
                ? (
                    isCompactPlot
                      ? '12%'
                      : '24%'
                  )
                : (
                    isCompactPlot
                      ? '22%'
                      : '34%'
                  )
            }
            barGap={isCompactPlot ? 2 : 4}
            data={chartData}
            layout={
              isRanking
                ? 'vertical'
                : 'horizontal'
            }
            margin={
              isRanking
                ? {
                    bottom: 8,
                    left: 2,
                    right: 18,
                    top: 10,
                  }
                : {
                    bottom: 8,
                    left: 0,
                    right: 12,
                    top: 12,
                  }
            }
          >
            <CartesianGrid
              horizontal={!isRanking}
              stroke="var(--pd-separator-subtle)"
              strokeOpacity={0.64}
              vertical={isRanking}
            />

            {isRanking ? (
              <>
                <XAxis
                  axisLine={false}
                  domain={domain}
                  tick={{
                    fill: 'var(--pd-text-secondary)',
                    fontSize: 11.5,
                  }}
                  tickFormatter={formatValue}
                  tickLine={false}
                  tickMargin={12}
                  type="number"
                />

                <YAxis
                  axisLine={false}
                  dataKey="label"
                  interval={0}
                  tick={{
                    fill: 'var(--pd-text-secondary)',
                    fontSize: 11.5,
                  }}
                  tickLine={false}
                  tickMargin={10}
                  type="category"
                  width={132}
                />
              </>
            ) : (
              <>
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={{
                    fill: 'var(--pd-text-secondary)',
                    fontSize: 11.5,
                  }}
                  tickLine={false}
                  tickMargin={14}
                  type="category"
                />

                <YAxis
                  axisLine={false}
                  domain={domain}
                  tick={{
                    fill: 'var(--pd-text-secondary)',
                    fontSize: 11.5,
                  }}
                  tickFormatter={formatValue}
                  tickLine={false}
                  tickMargin={12}
                  type="number"
                  width={62}
                />
              </>
            )}

            {isRanking ? (
              <ReferenceLine
                className="pd-comparison-chart__zero-line"
                stroke="var(--pd-text-secondary)"
                strokeOpacity={0.78}
                strokeWidth={1.6}
                x={0}
              />
            ) : (
              <ReferenceLine
                className="pd-comparison-chart__zero-line"
                stroke="var(--pd-text-secondary)"
                strokeOpacity={0.78}
                strokeWidth={1.6}
                y={0}
              />
            )}

            {visibleBenchmark && isRanking ? (
              <ReferenceLine
                className="pd-comparison-chart__benchmark-line"
                label={{
                  className:
                    'pd-comparison-chart__benchmark-label',
                  fill: 'var(--pd-text-secondary)',
                  fontSize: 11,
                  position: 'insideTopRight',
                  value: `${visibleBenchmark.label} · ${formatValue(
                    visibleBenchmark.value,
                  )}`,
                }}
                stroke="var(--pd-data-target)"
                strokeOpacity={0.78}
                strokeWidth={1.55}
                x={visibleBenchmark.value}
              />
            ) : null}

            {visibleBenchmark && !isRanking ? (
              <ReferenceLine
                className="pd-comparison-chart__benchmark-line"
                label={{
                  className:
                    'pd-comparison-chart__benchmark-label',
                  fill: 'var(--pd-text-secondary)',
                  fontSize: 11,
                  position: 'insideTopRight',
                  value: `${visibleBenchmark.label} · ${formatValue(
                    visibleBenchmark.value,
                  )}`,
                }}
                stroke="var(--pd-data-target)"
                strokeOpacity={0.78}
                strokeWidth={1.55}
                y={visibleBenchmark.value}
              />
            ) : null}

            {runtimeSeries.map((item) => (
              <Bar
                dataKey={item.dataKey}
                fill={resolveSeriesToken(item.index)}
                fillOpacity={
                  item.index === 0
                    ? 1
                    : item.index === 1
                      ? 0.88
                      : 0.82
                }
                isAnimationActive={false}
                key={item.key}
                maxBarSize={
                  isRanking
                    ? 20
                    : variant === 'grouped'
                      ? (
                          isCompactPlot
                            ? 26
                            : 23
                        )
                      : (
                          isCompactPlot
                            ? 40
                            : 38
                        )
                }
                name={item.label}
                radius={4}
                stroke="none"
                strokeOpacity={0}
                strokeWidth={0}
              >
                {isRanking && item.index === 0 ? (
                  <LabelList
                    className="pd-comparison-chart__value-label"
                    dataKey={item.dataKey}
                    formatter={(value) => (
                      typeof value === 'number'
                        ? formatValue(value)
                        : ''
                    )}
                    offset={10}
                    position="right"
                  />
                ) : null}
              </Bar>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ul
        aria-label={resolvedLabels.legend}
        className="pd-comparison-chart__legend"
      >
        {runtimeSeries.map((item) => (
          <li
            data-series-index={item.index}
            key={item.key}
          >
            <span
              aria-hidden="true"
              className="pd-comparison-chart__swatch"
            />
            <span>{item.label}</span>
          </li>
        ))}

        {visibleBenchmark ? (
          <li data-series="benchmark">
            <span
              aria-hidden="true"
              className="pd-comparison-chart__benchmark-swatch"
            />
            <span className="pd-comparison-chart__legend-label">
              {visibleBenchmark.label}
              <span className="pd-comparison-chart__benchmark-value">
                {' · '}
                {formatValue(visibleBenchmark.value)}
              </span>
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
