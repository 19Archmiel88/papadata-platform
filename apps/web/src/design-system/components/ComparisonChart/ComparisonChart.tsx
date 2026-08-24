import type {
  HTMLAttributes,
} from 'react';

import {
  useChartMotion,
} from '../../foundations/motion';
import {
  resolveSeriesColor,
} from '../../foundations/tokens';
import {
  useId,
  useState,
} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  useSeriesVisibility,
} from '../Analytics/useSeriesVisibility';
import {
  ChartMarkTooltip,
} from '../ChartTooltip';
import {
  ChartLegend,
} from '../ChartLegend';
import type {
  ChartLegendItem,
} from '../ChartLegend';
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

export type ComparisonChartVisualStyle = 'flat' | 'vivid';

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
  /**
   * 'vivid' renders each bar as a top-to-bottom gradient of its series color
   * instead of a flat fill. Defaults to 'flat' so every existing consumer
   * (Papa Assistant panels, Data Quality, the legacy per-screen Command
   * Center report) keeps today's appearance unchanged.
   */
  readonly visualStyle?: ComparisonChartVisualStyle;
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
  visualStyle = 'flat',
  ...props
}: ComparisonChartProps) {
  const chartMotion = useChartMotion();
  const seriesVisibility = useSeriesVisibility();
  const reactId = useId();
  const gradientBaseId = `pd-comparison-gradient-${reactId.replaceAll(':', '')}`;
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

  const renderedSeries = runtimeSeries.filter(
    (item) => seriesVisibility.isVisible(item.key),
  );

  const domain = resolveDomain(
    chartData,
    renderedSeries,
    visibleBenchmark,
  );

  const isRanking = variant === 'ranking';
  const legendItems: readonly ChartLegendItem[] = [
    ...runtimeSeries.map((item): ChartLegendItem => ({
      color: resolveSeriesColor(item.index),
      id: item.key,
      label: item.label,
      swatch: 'square',
    })),
    ...(visibleBenchmark
      ? [
          {
            color: 'var(--pd-data-target)',
            id: 'benchmark',
            label: visibleBenchmark.label,
            lineStyle: 'dashed' as const,
            readonly: true,
            valueLabel: formatValue(visibleBenchmark.value),
          },
        ]
      : []),
  ];

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
      data-visual-style={visualStyle}
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
          <BarChart
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
            {visualStyle === 'vivid' ? (
              <defs>
                {runtimeSeries.map((item) => (
                  <linearGradient
                    id={`${gradientBaseId}-${item.index}`}
                    key={item.key}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={resolveSeriesColor(item.index)}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={resolveSeriesColor(item.index)}
                      stopOpacity={0.62}
                    />
                  </linearGradient>
                ))}
              </defs>
            ) : null}

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

            <Tooltip
              content={(tooltipProps) => (
                <ChartMarkTooltip
                  {...tooltipProps}
                  valueFormatter={formatValue}
                />
              )}
              cursor={false}
              shared={false}
            />

            {renderedSeries.map((item) => (
              <Bar
                activeBar={{
                  stroke: 'var(--pd-text)',
                  strokeWidth: 1.5,
                }}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                dataKey={item.dataKey}
                fill={
                  visualStyle === 'vivid'
                    ? `url(#${gradientBaseId}-${item.index})`
                    : resolveSeriesColor(item.index)
                }
                fillOpacity={
                  item.index === 0
                    ? 1
                    : item.index === 1
                      ? 0.88
                      : 0.82
                }
                isAnimationActive={chartMotion.isAnimationActive}
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
          </BarChart>
        </ResponsiveContainer>

        {renderedSeries.length === 0 ? (
          <p className="pd-comparison-chart__all-hidden" role="status">
            Wszystkie serie ukryte. Kliknij w legendzie, aby je przywrócić.
          </p>
        ) : null}
      </div>

      <ChartLegend
        ariaLabel={resolvedLabels.legend}
        isVisible={seriesVisibility.isVisible}
        items={legendItems}
        onToggle={seriesVisibility.toggle}
        size="compact"
      />
    </div>
  );
}
