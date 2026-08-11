import type {
  HTMLAttributes,
} from 'react';
import {
  useId,
} from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { joinClassNames } from '../Field/fieldUtils';
import './forecast-chart.css';

export type ForecastChartSeriesPoint = {
  readonly label: string;
  readonly value: number | null;
};

export type ForecastChartQualityLevel =
  | 'high'
  | 'medium'
  | 'limited';

export type ForecastChartQuality = {
  readonly label: string;
  readonly description: string;
  readonly level: ForecastChartQualityLevel;
};

export type ForecastChartScenarioTone =
  | 'baseline'
  | 'optimistic'
  | 'conservative';

export type ForecastChartScenario = {
  readonly id: string;
  readonly label: string;
  readonly valueLabel: string;
  readonly description: string;
  readonly tone?: ForecastChartScenarioTone;
};

export type ForecastChartLabels = {
  readonly actual: string;
  readonly confidence: string;
  readonly forecast: string;
  readonly forecastDisclaimer: string;
  readonly horizon: string;
  readonly legend: string;
  readonly quality: string;
  readonly scenarios: string;
  readonly uncertainty: string;
  readonly unavailable: string;
};

export type ForecastChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly actual: readonly ForecastChartSeriesPoint[];
  readonly ariaLabel: string;
  readonly confidence?: number | null;
  readonly forecast: readonly ForecastChartSeriesPoint[];
  readonly horizonLabel?: string | null;
  readonly labels?: Partial<ForecastChartLabels>;
  readonly lowerBound: readonly ForecastChartSeriesPoint[];
  readonly quality?: ForecastChartQuality | null;
  readonly scenarios?: readonly ForecastChartScenario[];
  readonly unit?: string | null;
  readonly upperBound: readonly ForecastChartSeriesPoint[];
  readonly valueFormatter?: ((value: number) => string) | null;
};

type RuntimeDatum = {
  readonly actual: number | null;
  readonly forecast: number | null;
  readonly label: string;
  readonly lowerBand: number | null;
  readonly lowerBound: number | null;
  readonly uncertaintyRange: number | null;
  readonly upperBound: number | null;
};

type YAxisScale = {
  readonly domain: [number, number];
  readonly ticks: number[];
};

const defaultLabels: ForecastChartLabels = {
  actual: 'Dane historyczne',
  confidence: 'Pewność zapytania',
  forecast: 'Prognoza',
  forecastDisclaimer:
    'Prognoza nie jest faktem. Linia „dziś” oddziela historię od prognozy, a zakres pokazuje niepewność.',
  horizon: 'Horyzont',
  legend: 'Serie prognozy',
  quality: 'Jakość predykcji',
  scenarios: 'Scenariusze',
  uncertainty: 'Zakres niepewności',
  unavailable: 'Brak danych do pokazania prognozy.',
};

const numericKeys = [
  'actual',
  'forecast',
  'lowerBound',
  'upperBound',
] as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue
    ? normalizedValue
    : null;
}

function joinDefinedIds(
  ids: readonly (string | null | undefined)[],
): string | undefined {
  const resolvedIds = ids
    .map((id) => normalizeOptionalText(id))
    .filter((id): id is string => Boolean(id));

  return resolvedIds.length > 0
    ? resolvedIds.join(' ')
    : undefined;
}

function clampRatio(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function formatDefaultValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatConfidence(value: number): string {
  const normalizedValue = value > 1
    ? value / 100
    : value;

  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(clampRatio(normalizedValue));
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
  data: readonly RuntimeDatum[],
): YAxisScale {
  const values = data.flatMap((datum) => (
    numericKeys.flatMap((key) => {
      const value = datum[key];

      return isFiniteNumber(value)
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
  const span = naturalSpan > 0
    ? naturalSpan
    : Math.max(Math.abs(maximum) * 0.1, 1);
  const padding = span * 0.1;
  const step = resolveNiceStep(
    ((maximum + padding) - (minimum - padding)) / 4,
  );
  let domainMinimum = Math.floor((minimum - padding) / step) * step;
  let domainMaximum = Math.ceil((maximum + padding) / step) * step;

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
    ticks.push(Number(value.toFixed(10)));
  }

  return {
    domain: [
      Number(domainMinimum.toFixed(10)),
      Number(domainMaximum.toFixed(10)),
    ],
    ticks,
  };
}

function resolveYAxisWidth(
  ticks: readonly number[],
  formatValue: (value: number) => string,
): number {
  const longestLabelLength = ticks.reduce((longestLength, tick) => {
    const labelLength = formatValue(tick).length;

    return Math.max(longestLength, labelLength);
  }, 0);

  return Math.min(
    116,
    Math.max(68, Math.ceil(longestLabelLength * 7.5) + 24),
  );
}

function toSeriesMap(
  series: readonly ForecastChartSeriesPoint[],
): Map<string, number | null> {
  return new Map(
    series.map((point) => [
      point.label,
      isFiniteNumber(point.value)
        ? point.value
        : null,
    ]),
  );
}

function mergeSeries({
  actual,
  forecast,
  lowerBound,
  upperBound,
}: {
  readonly actual: readonly ForecastChartSeriesPoint[];
  readonly forecast: readonly ForecastChartSeriesPoint[];
  readonly lowerBound: readonly ForecastChartSeriesPoint[];
  readonly upperBound: readonly ForecastChartSeriesPoint[];
}): readonly RuntimeDatum[] {
  const labels = new Set<string>();

  for (const series of [
    actual,
    forecast,
    lowerBound,
    upperBound,
  ]) {
    for (const point of series) {
      labels.add(point.label);
    }
  }

  const actualMap = toSeriesMap(actual);
  const forecastMap = toSeriesMap(forecast);
  const lowerBoundMap = toSeriesMap(lowerBound);
  const upperBoundMap = toSeriesMap(upperBound);

  return Array.from(labels).map((label) => {
    const resolvedActual = actualMap.get(label) ?? null;
    const resolvedForecast = forecastMap.get(label) ?? null;
    const resolvedLowerBound = lowerBoundMap.get(label) ?? null;
    const resolvedUpperBound = upperBoundMap.get(label) ?? null;
    const hasBounds = isFiniteNumber(resolvedLowerBound)
      && isFiniteNumber(resolvedUpperBound)
      && resolvedUpperBound >= resolvedLowerBound;

    return {
      actual: resolvedActual,
      forecast: resolvedForecast,
      label,
      lowerBand: hasBounds
        ? resolvedLowerBound
        : null,
      lowerBound: resolvedLowerBound,
      uncertaintyRange: hasBounds
        ? resolvedUpperBound - resolvedLowerBound
        : null,
      upperBound: resolvedUpperBound,
    };
  });
}

function hasSeriesValue(
  data: readonly RuntimeDatum[],
  key: keyof Pick<RuntimeDatum, 'actual' | 'forecast' | 'uncertaintyRange'>,
): boolean {
  return data.some((datum) => isFiniteNumber(datum[key]));
}

function resolveForecastStartLabel(
  data: readonly RuntimeDatum[],
): string | null {
  const start = data.find((datum) => isFiniteNumber(datum.forecast));

  return start?.label ?? null;
}

export function ForecastChart({
  actual,
  ariaLabel,
  'aria-describedby': ariaDescribedBy,
  className,
  confidence = null,
  forecast,
  horizonLabel = null,
  labels,
  lowerBound,
  quality = null,
  scenarios = [],
  unit = null,
  upperBound,
  valueFormatter = null,
  ...props
}: ForecastChartProps) {
  const generatedId = useId();
  const resolvedLabels: ForecastChartLabels = {
    ...defaultLabels,
    ...labels,
  };
  const formatValue = valueFormatter ?? formatDefaultValue;
  const chartData = mergeSeries({
    actual,
    forecast,
    lowerBound,
    upperBound,
  });
  const hasActual = hasSeriesValue(chartData, 'actual');
  const hasForecast = hasSeriesValue(chartData, 'forecast');
  const hasUncertainty = hasSeriesValue(chartData, 'uncertaintyRange');
  const forecastStartLabel = resolveForecastStartLabel(chartData);
  const hasRenderableData = hasActual || hasForecast || hasUncertainty;
  const hasLegend = hasActual || hasForecast || hasUncertainty;
  const normalizedUnit = normalizeOptionalText(unit);
  const normalizedHorizonLabel = normalizeOptionalText(horizonLabel);
  const hasConfidence = isFiniteNumber(confidence);
  const hasEvidence = Boolean(normalizedHorizonLabel)
    || hasConfidence
    || Boolean(quality);
  const axisCaptionId = normalizedUnit
    ? `${generatedId}-axis-caption`
    : null;
  const disclaimerId = `${generatedId}-disclaimer`;
  const describedBy = joinDefinedIds([
    ariaDescribedBy,
    axisCaptionId,
    disclaimerId,
  ]);
  const {
    domain,
    ticks,
  } = resolveYAxisScale(chartData);
  const yAxisWidth = resolveYAxisWidth(ticks, formatValue);

  return (
    <div
      {...props}
      aria-describedby={describedBy}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-forecast-chart',
        className,
      )}
      data-component="forecast-chart"
      role="group"
    >
      {normalizedUnit ? (
        <div
          className="pd-forecast-chart__axis-caption"
          id={axisCaptionId ?? undefined}
        >
          <span>{normalizedUnit}</span>
        </div>
      ) : null}

      {hasRenderableData ? (
        <div
          className="pd-forecast-chart__plot"
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
                bottom: 12,
                left: 8,
                right: 34,
                top: 24,
              }}
            >
              <CartesianGrid
                stroke="var(--pd-forecast-grid-color)"
                strokeOpacity="var(--pd-forecast-grid-opacity)"
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
                  fill: 'var(--pd-forecast-axis-color)',
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
                tickLine={false}
                tickMargin={16}
              />

              <YAxis
                axisLine={false}
                domain={domain}
                tick={{
                  fill: 'var(--pd-forecast-axis-color)',
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
                tickFormatter={formatValue}
                tickLine={false}
                tickMargin={14}
                ticks={ticks}
                width={yAxisWidth}
              />

              {hasUncertainty ? (
                <>
                  <Area
                    activeDot={false}
                    connectNulls={false}
                    dataKey="lowerBand"
                    fill="transparent"
                    isAnimationActive={false}
                    legendType="none"
                    stackId="forecast-uncertainty"
                    stroke="none"
                    type="monotone"
                  />

                  <Area
                    activeDot={false}
                    connectNulls={false}
                    dataKey="uncertaintyRange"
                    fill="var(--pd-forecast-uncertainty-fill)"
                    fillOpacity="var(--pd-forecast-uncertainty-fill-opacity)"
                    isAnimationActive={false}
                    legendType="none"
                    stackId="forecast-uncertainty"
                    stroke="none"
                    type="monotone"
                  />
                </>
              ) : null}

              {hasUncertainty ? (
                <>
                  <Line
                    activeDot={false}
                    connectNulls={false}
                    dataKey="upperBound"
                    dot={false}
                    isAnimationActive={false}
                    legendType="none"
                    stroke="var(--pd-forecast-uncertainty-stroke)"
                    strokeDasharray="3 5"
                    strokeLinecap="round"
                    strokeOpacity="var(--pd-forecast-uncertainty-stroke-opacity)"
                    strokeWidth={1.25}
                    type="monotone"
                  />

                  <Line
                    activeDot={false}
                    connectNulls={false}
                    dataKey="lowerBound"
                    dot={false}
                    isAnimationActive={false}
                    legendType="none"
                    stroke="var(--pd-forecast-uncertainty-stroke)"
                    strokeDasharray="3 5"
                    strokeLinecap="round"
                    strokeOpacity="var(--pd-forecast-uncertainty-stroke-opacity)"
                    strokeWidth={1.25}
                    type="monotone"
                  />
                </>
              ) : null}

              {forecastStartLabel ? (
                <ReferenceLine
                  ifOverflow="extendDomain"
                  stroke="var(--pd-forecast-reference-line-color)"
                  strokeDasharray="4 5"
                  strokeOpacity="var(--pd-forecast-reference-line-opacity)"
                  x={forecastStartLabel}
                />
              ) : null}

              {hasActual ? (
                <Line
                  activeDot={false}
                  connectNulls={false}
                  dataKey="actual"
                  dot={false}
                  isAnimationActive={false}
                  name={resolvedLabels.actual}
                  stroke="var(--pd-data-actual)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={1}
                  strokeWidth={3}
                  type="monotone"
                />
              ) : null}

              {hasForecast ? (
                <Line
                  activeDot={false}
                  connectNulls={false}
                  dataKey="forecast"
                  dot={false}
                  isAnimationActive={false}
                  name={resolvedLabels.forecast}
                  stroke="var(--pd-data-forecast)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.96}
                  strokeWidth={2.6}
                  type="monotone"
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="pd-forecast-chart__unavailable">
          {resolvedLabels.unavailable}
        </p>
      )}

      {hasEvidence ? (
        <div className="pd-forecast-chart__evidence">
          {normalizedHorizonLabel ? (
            <dl>
              <div>
                <dt>{resolvedLabels.horizon}</dt>
                <dd>{normalizedHorizonLabel}</dd>
              </div>
            </dl>
          ) : null}

          {hasConfidence ? (
            <dl>
              <div>
                <dt>{resolvedLabels.confidence}</dt>
                <dd>{formatConfidence(confidence)}</dd>
              </div>
            </dl>
          ) : null}

          {quality ? (
            <dl data-quality={quality.level}>
              <div>
                <dt>{resolvedLabels.quality}</dt>
                <dd>
                  <strong>{quality.label}</strong>
                  <span>{quality.description}</span>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}

      {scenarios.length > 0 ? (
        <div className="pd-forecast-chart__scenarios">
          <p className="pd-forecast-chart__scenarios-heading">
            {resolvedLabels.scenarios}
          </p>
          <ul>
            {scenarios.map((scenario) => (
              <li
                data-scenario-tone={scenario.tone ?? 'baseline'}
                data-series="scenario"
                key={scenario.id}
              >
                <span>{scenario.label}</span>
                <strong>{scenario.valueLabel}</strong>
                <p>{scenario.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p
        className="pd-forecast-chart__disclaimer"
        id={disclaimerId}
      >
        {resolvedLabels.forecastDisclaimer}
      </p>

      {hasLegend ? (
        <ul
          aria-label={resolvedLabels.legend}
          className="pd-forecast-chart__legend"
        >
          {hasActual ? (
            <li data-series="actual">
              <span
                aria-hidden="true"
                className="pd-forecast-chart__swatch"
              />
              <span>{resolvedLabels.actual}</span>
            </li>
          ) : null}

          {hasForecast ? (
            <li data-series="forecast">
              <span
                aria-hidden="true"
                className="pd-forecast-chart__swatch"
              />
              <span>{resolvedLabels.forecast}</span>
            </li>
          ) : null}

          {hasUncertainty ? (
            <li data-series="uncertainty">
              <span
                aria-hidden="true"
                className="pd-forecast-chart__swatch"
              />
              <span>{resolvedLabels.uncertainty}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
