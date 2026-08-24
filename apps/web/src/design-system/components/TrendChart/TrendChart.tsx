import type {
  HTMLAttributes,
} from 'react';

import {
  useChartMotion,
} from '../../foundations/motion';
import {
  useId,
} from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  useChartZoom,
} from '../Analytics/useChartZoom';
import {
  useSeriesVisibility,
} from '../Analytics/useSeriesVisibility';
import {
  ChartCrosshairTooltip,
} from '../ChartTooltip';
import {
  ChartLegend,
} from '../ChartLegend';
import type {
  ChartLegendItem,
} from '../ChartLegend';
import { joinClassNames } from '../Field/fieldUtils';
import './trend-chart.css';

export type TrendChartVariant = 'line' | 'area';

export type TrendChartDatum = {
  readonly label: string;
  readonly actual: number | null;
  readonly plan?: number | null;
  readonly previousPeriod?: number | null;
  readonly movingAverage?: number | null;
};

export type TrendChartLabels = {
  readonly actual: string;
  readonly legend: string;
  readonly movingAverage: string;
  readonly plan: string;
  readonly previousPeriod: string;
};

export type TrendChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly ariaLabel: string;
  readonly data: readonly TrendChartDatum[];
  readonly labels?: Partial<TrendChartLabels>;
  readonly unit?: string | null;
  readonly valueFormatter?: ((value: number) => string) | null;
  readonly variant?: TrendChartVariant;
};

type NumericSeriesKey =
  | 'actual'
  | 'plan'
  | 'previousPeriod'
  | 'movingAverage';

type YAxisScale = {
  readonly domain: [number, number];
  readonly ticks: number[];
};

const numericSeriesKeys: readonly NumericSeriesKey[] = [
  'actual',
  'plan',
  'previousPeriod',
  'movingAverage',
];

const defaultLabels: TrendChartLabels = {
  actual: 'Wynik',
  legend: 'Serie wykresu',
  movingAverage: 'Średnia krocząca',
  plan: 'Plan',
  previousPeriod: 'Poprzedni okres',
};

/** Single source of truth for series color — feeds both the plotted line and its legend swatch, so the two can't drift apart. */
const seriesColorByKey: Record<NumericSeriesKey, string> = {
  actual: 'var(--pd-data-actual)',
  movingAverage: 'var(--pd-data-series-2)',
  plan: 'var(--pd-data-series-8)',
  previousPeriod: 'var(--pd-data-series-7)',
};

function hasNumericSeries(
  data: readonly TrendChartDatum[],
  key: NumericSeriesKey,
): boolean {
  return data.some((datum) => {
    const value = datum[key];

    return typeof value === 'number' && Number.isFinite(value);
  });
}

function formatDefaultValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function resolveNiceStep(rawStep: number): number {
  if (!Number.isFinite(rawStep) || rawStep <= 0) {
    return 1;
  }

  const exponent = Math.floor(Math.log10(rawStep));
  const magnitude = 10 ** exponent;
  const normalized = rawStep / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }

  if (normalized <= 2) {
    return 2 * magnitude;
  }

  if (normalized <= 2.5) {
    return 2.5 * magnitude;
  }

  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function resolveYAxisScale(
  data: readonly TrendChartDatum[],
): YAxisScale {
  const values = data.flatMap((datum) => (
    numericSeriesKeys.flatMap((key) => {
      const value = datum[key];

      return typeof value === 'number' && Number.isFinite(value)
        ? [value]
        : [];
    })
  ));

  if (values.length === 0) {
    return {
      domain: [0, 1],
      ticks: [0, 0.25, 0.5, 0.75, 1],
    };
  }

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  const naturalSpan = maximum - minimum;
  const fallbackSpan = Math.max(
    Math.abs(maximum) * 0.1,
    1,
  );
  const span = naturalSpan > 0
    ? naturalSpan
    : fallbackSpan;

  const padding = span * 0.1;
  const paddedMinimum = minimum - padding;
  const paddedMaximum = maximum + padding;

  const step = resolveNiceStep(
    (paddedMaximum - paddedMinimum) / 4,
  );

  let domainMinimum = Math.floor(
    paddedMinimum / step,
  ) * step;

  let domainMaximum = Math.ceil(
    paddedMaximum / step,
  ) * step;

  if (domainMinimum === domainMaximum) {
    domainMinimum -= step;
    domainMaximum += step;
  }

  const ticks: number[] = [];

  for (
    let value = domainMinimum;
    value <= domainMaximum + step * 0.01;
    value += step
  ) {
    ticks.push(
      Number(value.toFixed(10)),
    );
  }

  return {
    domain: [
      Number(domainMinimum.toFixed(10)),
      Number(domainMaximum.toFixed(10)),
    ],
    ticks,
  };
}

function findLatestActualDatum(
  data: readonly TrendChartDatum[],
): TrendChartDatum | null {
  for (let index = data.length - 1; index >= 0; index -= 1) {
    const datum = data[index];

    if (
      datum
      && typeof datum.actual === 'number'
      && Number.isFinite(datum.actual)
    ) {
      return datum;
    }
  }

  return null;
}

export function TrendChart({
  ariaLabel,
  className,
  data,
  labels,
  unit = null,
  valueFormatter = null,
  variant = 'line',
  ...props
}: TrendChartProps) {
  const reactId = useId();
  const chartMotion = useChartMotion();
  const seriesVisibility = useSeriesVisibility();
  const {
    isZoomed,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    onWheel,
    resetZoom,
    visibleData,
  } = useChartZoom(data, 6);

  const elementIdBase = reactId.replaceAll(':', '');
  const gradientId = `pd-trend-area-${elementIdBase}`;

  const resolvedLabels: TrendChartLabels = {
    ...defaultLabels,
    ...labels,
  };

  const formatValue = valueFormatter ?? formatDefaultValue;

  const chartData = visibleData.map((datum) => ({
    ...datum,
  }));

  const hasActual = hasNumericSeries(
    visibleData,
    'actual',
  );

  const hasPlan = hasNumericSeries(
    visibleData,
    'plan',
  );

  const hasPreviousPeriod = hasNumericSeries(
    visibleData,
    'previousPeriod',
  );

  const hasMovingAverage = hasNumericSeries(
    visibleData,
    'movingAverage',
  );

  const latestActualDatum = findLatestActualDatum(visibleData);

  const {
    domain,
    ticks,
  } = resolveYAxisScale(visibleData);
  const legendItems: ChartLegendItem[] = [];

  if (hasActual) {
    legendItems.push({
      color: seriesColorByKey.actual,
      id: 'actual',
      label: resolvedLabels.actual,
    });
  }

  if (hasPlan) {
    legendItems.push({
      color: seriesColorByKey.plan,
      id: 'plan',
      label: resolvedLabels.plan,
      lineStyle: 'dashed',
    });
  }

  if (hasPreviousPeriod) {
    legendItems.push({
      color: seriesColorByKey.previousPeriod,
      id: 'previousPeriod',
      label: resolvedLabels.previousPeriod,
      lineStyle: 'dotted',
    });
  }

  if (hasMovingAverage) {
    legendItems.push({
      color: seriesColorByKey.movingAverage,
      id: 'movingAverage',
      label: resolvedLabels.movingAverage,
    });
  }

  function isSeriesShown(key: NumericSeriesKey): boolean {
    return seriesVisibility.isVisible(key);
  }

  function seriesClassName(key: NumericSeriesKey): string | undefined {
    return isSeriesShown(key) ? undefined : 'pd-trend-chart__series--hidden';
  }

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-trend-chart',
        className,
      )}
      data-component="trend-chart"
      data-variant={variant}
      role="group"
    >
      <div className="pd-trend-chart__topline">
        {unit ? (
          <div
            aria-hidden="true"
            className="pd-trend-chart__axis-caption"
          >
            <span>{unit}</span>
          </div>
        ) : null}

        <div className="pd-trend-chart__interaction-hint">
          <span>przeciągnij lub przewiń = przybliż</span>
          {isZoomed ? (
            <button
              onClick={resetZoom}
              type="button"
            >
              Reset zakresu
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="pd-trend-chart__plot"
        data-slot="plot"
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        <ResponsiveContainer
          debounce={80}
          height="100%"
          minWidth={0}
          width="100%"
        >
          <ComposedChart
            accessibilityLayer
            data={chartData}
            margin={{
              bottom: 5,
              left: 0,
              right: 13,
              top: 13,
            }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--pd-data-actual)"
                  stopOpacity={0.19}
                />

                <stop
                  offset="28%"
                  stopColor="var(--pd-data-actual)"
                  stopOpacity={0.095}
                />

                <stop
                  offset="58%"
                  stopColor="var(--pd-data-actual)"
                  stopOpacity={0.032}
                />

                <stop
                  offset="82%"
                  stopColor="var(--pd-data-actual)"
                  stopOpacity={0.006}
                />

                <stop
                  offset="100%"
                  stopColor="var(--pd-data-actual)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--pd-separator-subtle)"
              strokeOpacity={0.64}
              vertical={false}
            />

            <XAxis
              axisLine={false}
              dataKey="label"
              interval="preserveStartEnd"
              minTickGap={34}
              padding={{
                left: 2,
                right: 2,
              }}
              tick={{
                fill: 'var(--pd-text-muted)',
                fontSize: 11.5,
              }}
              tickLine={false}
              tickMargin={14}
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
              ticks={ticks}
              width={55}
            />

            <Tooltip
              content={(tooltipProps) => (
                <ChartCrosshairTooltip
                  {...tooltipProps}
                  isSeriesVisible={(dataKey) => isSeriesShown(dataKey as NumericSeriesKey)}
                  valueFormatter={formatValue}
                />
              )}
              cursor={{
                stroke: 'var(--pd-separator-strong)',
              }}
            />

            {variant === 'area' && hasActual ? (
              <Area
                activeDot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                baseValue={domain[0]}
                className={seriesClassName('actual')}
                connectNulls={false}
                dataKey="actual"
                fill={`url(#${gradientId})`}
                id={`pd-trend-${elementIdBase}-actual-area`}
                fillOpacity={1}
                isAnimationActive={chartMotion.isAnimationActive}
                legendType="none"
                stroke="none"
                type="monotone"
              />
            ) : null}

            {hasPreviousPeriod ? (
              <Line
                activeDot={false}
                className={seriesClassName('previousPeriod')}
                connectNulls={false}
                dataKey="previousPeriod"
                dot={false}
                id={`pd-trend-${elementIdBase}-previous-period-line`}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.previousPeriod}
                stroke={seriesColorByKey.previousPeriod}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.82}
                strokeWidth={1.7}
                type="monotone"
              />
            ) : null}

            {hasPlan ? (
              <Line
                activeDot={false}
                className={seriesClassName('plan')}
                connectNulls={false}
                dataKey="plan"
                dot={false}
                id={`pd-trend-${elementIdBase}-plan-line`}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.plan}
                stroke={seriesColorByKey.plan}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.9}
                strokeWidth={1.8}
                type="monotone"
              />
            ) : null}

            {hasMovingAverage ? (
              <Line
                activeDot={false}
                className={seriesClassName('movingAverage')}
                connectNulls={false}
                dataKey="movingAverage"
                dot={false}
                id={`pd-trend-${elementIdBase}-moving-average-line`}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.movingAverage}
                stroke={seriesColorByKey.movingAverage}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.84}
                strokeWidth={1.8}
                type="monotone"
              />
            ) : null}

            {hasActual ? (
              <Line
                activeDot={false}
                className={seriesClassName('actual')}
                connectNulls={false}
                dataKey="actual"
                dot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                id={`pd-trend-${elementIdBase}-actual-line`}
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.actual}
                stroke={seriesColorByKey.actual}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={1}
                strokeWidth={3.15}
                type="monotone"
              />
            ) : null}

            {latestActualDatum?.actual != null && isSeriesShown('actual') ? (
              <>
                <ReferenceDot
                  className="pd-trend-chart__latest-point-ring"
                  fill="var(--pd-surface)"
                  zIndex={700}
                  r={5}
                  stroke="var(--pd-data-actual)"
                  strokeWidth={2}
                  x={latestActualDatum.label}
                  y={latestActualDatum.actual}
                />

                <ReferenceDot
                  className="pd-trend-chart__latest-point-core"
                  fill="var(--pd-data-actual)"
                  zIndex={701}
                  r={2.25}
                  stroke="none"
                  x={latestActualDatum.label}
                  y={latestActualDatum.actual}
                />
              </>
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend
        ariaLabel={resolvedLabels.legend}
        className="pd-trend-chart__legend-control"
        isVisible={seriesVisibility.isVisible}
        items={legendItems}
        onToggle={seriesVisibility.toggle}
      />
    </div>
  );
}
