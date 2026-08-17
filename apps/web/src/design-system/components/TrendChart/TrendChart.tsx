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
  XAxis,
  YAxis,
} from 'recharts';

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

  const gradientId = `pd-trend-area-${reactId.replaceAll(':', '')}`;

  const resolvedLabels: TrendChartLabels = {
    ...defaultLabels,
    ...labels,
  };

  const formatValue = valueFormatter ?? formatDefaultValue;

  const chartData = data.map((datum) => ({
    ...datum,
  }));

  const hasActual = hasNumericSeries(
    data,
    'actual',
  );

  const hasPlan = hasNumericSeries(
    data,
    'plan',
  );

  const hasPreviousPeriod = hasNumericSeries(
    data,
    'previousPeriod',
  );

  const hasMovingAverage = hasNumericSeries(
    data,
    'movingAverage',
  );

  const latestActualDatum = findLatestActualDatum(data);

  const {
    domain,
    ticks,
  } = resolveYAxisScale(data);

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
      {unit ? (
        <div
          aria-hidden="true"
          className="pd-trend-chart__axis-caption"
        >
          <span>{unit}</span>
        </div>
      ) : null}

      <div
        className="pd-trend-chart__plot"
        data-slot="plot"
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

            {variant === 'area' && hasActual ? (
              <Area
                activeDot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                baseValue={domain[0]}
                connectNulls={false}
                dataKey="actual"
                fill={`url(#${gradientId})`}
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
                connectNulls={false}
                dataKey="previousPeriod"
                dot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.previousPeriod}
                stroke="var(--pd-data-series-7)"
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
                connectNulls={false}
                dataKey="plan"
                dot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.plan}
                stroke="var(--pd-data-series-8)"
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
                connectNulls={false}
                dataKey="movingAverage"
                dot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.movingAverage}
                stroke="var(--pd-data-series-2)"
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
                connectNulls={false}
                dataKey="actual"
                dot={false}
                animationDuration={chartMotion.animationDuration}
                animationEasing="ease-out"
                isAnimationActive={chartMotion.isAnimationActive}
                name={resolvedLabels.actual}
                stroke="var(--pd-data-actual)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={1}
                strokeWidth={3.15}
                type="monotone"
              />
            ) : null}

            {latestActualDatum?.actual != null ? (
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

      <ul
        aria-label={resolvedLabels.legend}
        className="pd-trend-chart__legend"
      >
        {hasActual ? (
          <li data-series="actual">
            <span
              aria-hidden="true"
              className="pd-trend-chart__swatch"
            />
            <span>{resolvedLabels.actual}</span>
          </li>
        ) : null}

        {hasPlan ? (
          <li data-series="plan">
            <span
              aria-hidden="true"
              className="pd-trend-chart__swatch"
            />
            <span>{resolvedLabels.plan}</span>
          </li>
        ) : null}

        {hasPreviousPeriod ? (
          <li data-series="previous-period">
            <span
              aria-hidden="true"
              className="pd-trend-chart__swatch"
            />
            <span>{resolvedLabels.previousPeriod}</span>
          </li>
        ) : null}

        {hasMovingAverage ? (
          <li data-series="moving-average">
            <span
              aria-hidden="true"
              className="pd-trend-chart__swatch"
            />
            <span>{resolvedLabels.movingAverage}</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
