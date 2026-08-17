import type {
  HTMLAttributes,
  ReactElement,
} from 'react';

import {
  useChartMotion,
} from '../../foundations/motion';
import {
  Cell,
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { joinClassNames } from '../Field/fieldUtils';
import './correlation-chart.css';

export type CorrelationChartVariant =
  | 'scatter'
  | 'relationship'
  | 'driver-analysis';

export type CorrelationChartPointRole =
  | 'standard'
  | 'driver-hypothesis'
  | 'outlier'
  | 'cluster';

export type CorrelationChartEvidenceLevel =
  | 'observed-correlation'
  | 'driver-hypothesis'
  | 'validated-causal';

export type CorrelationChartPoint = {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly role?: CorrelationChartPointRole;
  readonly clusterId?: string | null;
};

export type CorrelationChartCluster = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly xRange: readonly [number, number];
  readonly yRange: readonly [number, number];
};

export type CorrelationChartEvidence = {
  readonly level: CorrelationChartEvidenceLevel;
  readonly label: string;
  readonly description: string;
};

export type CorrelationChartLabels = {
  readonly cluster: string;
  readonly correlation: string;
  readonly driverHypothesis: string;
  readonly evidence: string;
  readonly legend: string;
  readonly noCausality: string;
  readonly observations: string;
  readonly outlier: string;
  readonly relationship: string;
  readonly standardPoint: string;
  readonly strength: string;
  readonly unavailable: string;
};

export type CorrelationChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly ariaLabel: string;
  readonly clusters?: readonly CorrelationChartCluster[];
  readonly correlation: number | null;
  readonly driverHypothesis?: string | null;
  readonly evidence?: CorrelationChartEvidence | null;
  readonly labels?: Partial<CorrelationChartLabels>;
  readonly points: readonly CorrelationChartPoint[];
  readonly relationshipLabel?: string | null;
  readonly trendline?: boolean;
  readonly valueFormatter?: ((value: number) => string) | null;
  readonly variant?: CorrelationChartVariant;
  readonly xLabel: string;
  readonly yLabel: string;
};

type RuntimePoint = Required<
  Pick<CorrelationChartPoint, 'id' | 'label' | 'x' | 'y'>
> & {
  readonly annotationIndex: number;
  readonly annotationLabel: string;
  readonly clusterId: string | null;
  readonly role: CorrelationChartPointRole;
  readonly z: number;
};

type AxisScale = {
  readonly domain: [number, number];
  readonly ticks: number[];
};

type TrendSegment = readonly [
  {
    readonly x: number;
    readonly y: number;
  },
  {
    readonly x: number;
    readonly y: number;
  },
];

const defaultLabels: CorrelationChartLabels = {
  cluster: 'Klaster',
  correlation: 'Korelacja',
  driverHypothesis: 'Hipoteza wpływu',
  evidence: 'Dowód',
  legend: 'Legenda zależności',
  noCausality:
    'Korelacja i hipoteza wpływu nie są dowodem przyczynowości.',
  observations: 'Lista obserwacji',
  outlier: 'Punkt odstający',
  relationship: 'Zależność',
  standardPoint: 'Punkt obserwacji',
  strength: 'Siła korelacji',
  unavailable: 'Brak punktów do pokazania.',
};

const pointRoleLabels: Record<
  CorrelationChartPointRole,
  keyof CorrelationChartLabels
> = {
  cluster: 'cluster',
  'driver-hypothesis': 'driverHypothesis',
  outlier: 'outlier',
  standard: 'standardPoint',
};

const roleColors: Record<CorrelationChartPointRole, string> = {
  cluster: 'var(--pd-correlation-cluster)',
  'driver-hypothesis': 'var(--pd-correlation-driver)',
  outlier: 'var(--pd-correlation-outlier)',
  standard: 'var(--pd-correlation-point)',
};

type CorrelationPointShapeProps = {
  readonly cx?: number | string;
  readonly cy?: number | string;
  readonly fill?: string;
  readonly payload?: RuntimePoint;
  readonly stroke?: string;
  readonly strokeWidth?: number;
};

function resolveShapeNumber(value: unknown): number | null {
  const numericValue = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : Number.NaN;

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function renderCorrelationPointShape(
  shapeProps: unknown,
): ReactElement | null {
  const props = shapeProps as CorrelationPointShapeProps;
  const cx = resolveShapeNumber(props.cx);
  const cy = resolveShapeNumber(props.cy);

  if (
    cx === null
    || cy === null
  ) {
    return null;
  }

  const role = props.payload?.role ?? 'standard';
  const fill = props.fill ?? roleColors[role];
  const stroke = props.stroke ?? 'var(--pd-surface)';
  const strokeWidth = typeof props.strokeWidth === 'number'
    && Number.isFinite(props.strokeWidth)
    ? props.strokeWidth
    : role === 'standard'
      ? 1.2
      : 1.8;

  const className = `pd-correlation-chart__point-shape pd-correlation-chart__point-shape--${role}`;

  if (role === 'cluster') {
    return (
      <rect
        aria-hidden="true"
        className={className}
        fill={fill}
        height={8.4}
        rx={1.3}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={8.4}
        x={cx - 4.2}
        y={cy - 4.2}
      />
    );
  }

  if (role === 'driver-hypothesis') {
    return (
      <path
        aria-hidden="true"
        className={className}
        d={`M ${cx} ${cy - 5.6} L ${cx + 5.2} ${cy + 4.6} L ${cx - 5.2} ${cy + 4.6} Z`}
        fill={fill}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    );
  }

  if (role === 'outlier') {
    return (
      <path
        aria-hidden="true"
        className={className}
        d={`M ${cx} ${cy - 5.2} L ${cx + 5.2} ${cy} L ${cx} ${cy + 5.2} L ${cx - 5.2} ${cy} Z`}
        fill={fill}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <circle
      aria-hidden="true"
      className={className}
      cx={cx}
      cy={cy}
      fill={fill}
      r={3.8}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

function formatDefaultValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizePoints(
  points: readonly CorrelationChartPoint[],
): readonly RuntimePoint[] {
  const visibleClusterLabels = new Set<string>();

  return points.flatMap((point, index) => {
    if (
      !Number.isFinite(point.x)
      || !Number.isFinite(point.y)
    ) {
      return [];
    }

    const role = point.role ?? 'standard';
    const clusterKey = point.clusterId ?? point.id;

    const shouldShowAnnotation = role === 'outlier'
      || role === 'driver-hypothesis'
      || (
        role === 'cluster'
        && !visibleClusterLabels.has(clusterKey)
      );

    if (
      role === 'cluster'
      && shouldShowAnnotation
    ) {
      visibleClusterLabels.add(clusterKey);
    }

    return [{
      id: point.id,
      annotationIndex: index + 1,
      annotationLabel: shouldShowAnnotation
        ? String(index + 1)
        : '',
      clusterId: point.clusterId ?? null,
      label: point.label,
      role,
      x: point.x,
      y: point.y,
      z: role === 'standard'
        ? 64
        : 96,
    }];
  });
}

function resolveNiceStep(rawStep: number): number {
  if (
    !Number.isFinite(rawStep)
    || rawStep <= 0
  ) {
    return 1;
  }

  const exponent = Math.floor(
    Math.log10(rawStep),
  );
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

function resolveAxisScale(
  values: readonly number[],
): AxisScale {
  const finiteValues = values.filter((value) => (
    Number.isFinite(value)
  ));

  if (finiteValues.length === 0) {
    return {
      domain: [0, 1],
      ticks: [0, 0.25, 0.5, 0.75, 1],
    };
  }

  const minimum = Math.min(...finiteValues);
  const maximum = Math.max(...finiteValues);
  const naturalSpan = maximum - minimum;
  const span = naturalSpan > 0
    ? naturalSpan
    : Math.max(
      Math.abs(maximum) * 0.1,
      1,
    );
  const padding = span * 0.12;
  const step = resolveNiceStep(
    (span + padding * 2) / 4,
  );
  let domainMinimum = Math.floor(
    (minimum - padding) / step,
  ) * step;
  let domainMaximum = Math.ceil(
    (maximum + padding) / step,
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

function resolveTrendSegment(
  points: readonly RuntimePoint[],
  xDomain: [number, number],
): TrendSegment | null {
  if (points.length < 2) {
    return null;
  }

  const xMean = points.reduce(
    (sum, point) => sum + point.x,
    0,
  ) / points.length;

  const yMean = points.reduce(
    (sum, point) => sum + point.y,
    0,
  ) / points.length;

  const denominator = points.reduce(
    (sum, point) => (
      sum + (point.x - xMean) ** 2
    ),
    0,
  );

  if (denominator === 0) {
    return null;
  }

  const numerator = points.reduce(
    (sum, point) => (
      sum + (
        (point.x - xMean)
        * (point.y - yMean)
      )
    ),
    0,
  );

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  const [xStart, xEnd] = xDomain;

  return [
    {
      x: xStart,
      y: slope * xStart + intercept,
    },
    {
      x: xEnd,
      y: slope * xEnd + intercept,
    },
  ];
}

function formatCorrelationValue(
  correlation: number,
): string {
  const prefix = correlation > 0
    ? '+'
    : '';

  return `${prefix}${correlation.toFixed(2)}`;
}

function formatObservationMeasure(
  point: RuntimePoint,
  xLabel: string,
  yLabel: string,
  valueFormatter: (value: number) => string,
): string {
  return `${xLabel}: ${valueFormatter(point.x)} · ${yLabel}: ${valueFormatter(point.y)}`;
}

function resolveStrengthCopy(
  correlation: number | null,
  labels: CorrelationChartLabels,
): string {
  if (
    typeof correlation !== 'number'
    || !Number.isFinite(correlation)
  ) {
    return `${labels.strength}: brak stabilnego współczynnika.`;
  }

  const absolute = Math.abs(correlation);
  const strength = absolute >= 0.75
    ? 'silna'
    : absolute >= 0.45
      ? 'umiarkowana'
      : absolute >= 0.2
        ? 'słaba'
        : 'brak wyraźnej';

  const direction = correlation >= 0
    ? 'dodatnia'
    : 'ujemna';

  return `${labels.strength}: ${strength} ${direction} korelacja (r = ${formatCorrelationValue(
    correlation,
  )}).`;
}

function normalizeClusterRange(
  range: readonly [number, number],
): readonly [number, number] {
  const [first, second] = range;

  return first <= second
    ? [first, second]
    : [second, first];
}

export function CorrelationChart({
  ariaLabel,
  className,
  clusters = [],
  correlation,
  driverHypothesis = null,
  evidence = null,
  labels,
  points,
  relationshipLabel = null,
  trendline = true,
  valueFormatter = null,
  variant = 'scatter',
  xLabel,
  yLabel,
  ...props
}: CorrelationChartProps) {
  const chartMotion = useChartMotion();
  const resolvedLabels: CorrelationChartLabels = {
    ...defaultLabels,
    ...labels,
  };

  const formatValue = (
    valueFormatter ?? formatDefaultValue
  );

  const runtimePoints = normalizePoints(
    points,
  );

  const normalizedClusters = clusters.filter((cluster) => {
    const [xStart, xEnd] = cluster.xRange;
    const [yStart, yEnd] = cluster.yRange;

    return Number.isFinite(xStart)
      && Number.isFinite(xEnd)
      && Number.isFinite(yStart)
      && Number.isFinite(yEnd);
  });

  const xScale = resolveAxisScale([
    ...runtimePoints.map((point) => point.x),
    ...normalizedClusters.flatMap((cluster) => [
      ...cluster.xRange,
    ]),
  ]);

  const yScale = resolveAxisScale([
    ...runtimePoints.map((point) => point.y),
    ...normalizedClusters.flatMap((cluster) => [
      ...cluster.yRange,
    ]),
  ]);

  const trendSegment = trendline
    ? resolveTrendSegment(
      runtimePoints,
      xScale.domain,
    )
    : null;

  const strengthCopy = resolveStrengthCopy(
    correlation,
    resolvedLabels,
  );

  const evidenceLevel = evidence?.level
    ?? 'observed-correlation';

  const hasCausalEvidence = (
    evidenceLevel === 'validated-causal'
  );

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-correlation-chart',
        className,
      )}
      data-causality-evidence={hasCausalEvidence ? 'validated' : 'not-provided'}
      data-component="correlation-chart"
      data-evidence-level={evidenceLevel}
      data-has-cluster={normalizedClusters.length > 0 ? 'true' : 'false'}
      data-variant={variant}
      role="group"
    >
      {runtimePoints.length > 0 ? (
        <>
          <div className="pd-correlation-chart__axis-summary">
            <span>{xLabel}</span>
            <span>{yLabel}</span>
          </div>

          <div
            className="pd-correlation-chart__plot"
            data-slot="plot"
          >
            <ResponsiveContainer
              debounce={80}
              height="100%"
              minWidth={0}
              width="100%"
            >
              <ScatterChart
                accessibilityLayer
                margin={{
                  bottom: 18,
                  left: 10,
                  right: 26,
                  top: 24,
                }}
              >
                <CartesianGrid
                  className="pd-correlation-chart__grid"
                  stroke="var(--pd-separator-subtle)"
                  strokeOpacity={0.66}
                />

                <XAxis
                  axisLine={false}
                  dataKey="x"
                  domain={xScale.domain}
                  tick={{
                    fill: 'var(--pd-text-secondary)',
                    fontSize: 11.5,
                  }}
                  tickFormatter={formatValue}
                  tickLine={false}
                  tickMargin={12}
                  ticks={xScale.ticks}
                  type="number"
                />

                <YAxis
                  axisLine={false}
                  dataKey="y"
                  domain={yScale.domain}
                  tick={{
                    fill: 'var(--pd-text-secondary)',
                    fontSize: 11.5,
                  }}
                  tickFormatter={formatValue}
                  tickLine={false}
                  tickMargin={12}
                  ticks={yScale.ticks}
                  type="number"
                  width={64}
                />

                <ZAxis
                  dataKey="z"
                  range={[72, 126]}
                  type="number"
                />

                {normalizedClusters.map((cluster) => {
                  const [x1, x2] = normalizeClusterRange(
                    cluster.xRange,
                  );
                  const [y1, y2] = normalizeClusterRange(
                    cluster.yRange,
                  );

                  return (
                    <ReferenceArea
                      className="pd-correlation-chart__cluster-area"
                      ifOverflow="extendDomain"
                      key={cluster.id}
                      stroke="var(--pd-correlation-cluster)"
                      strokeDasharray="4 5"
                      strokeOpacity={0.52}
                      x1={x1}
                      x2={x2}
                      y1={y1}
                      y2={y2}
                    />
                  );
                })}

                {trendSegment ? (
                  <ReferenceLine
                    className="pd-correlation-chart__trendline"
                    ifOverflow="extendDomain"
                    segment={trendSegment}
                    stroke="var(--pd-correlation-trendline)"
                    strokeOpacity={0.86}
                    strokeWidth={1.8}
                  />
                ) : null}

                <Scatter
                  data={runtimePoints}
                  dataKey="y"
                  animationDuration={chartMotion.animationDuration}
                  isAnimationActive={chartMotion.isAnimationActive}
                  name={resolvedLabels.relationship}
                  shape={renderCorrelationPointShape}
                >
                  {runtimePoints.map((point) => (
                    <Cell
                      fill={roleColors[point.role]}
                      key={point.id}
                      stroke="var(--pd-surface)"
                      strokeWidth={point.role === 'standard' ? 1.2 : 1.8}
                    />
                  ))}

                  <LabelList
                    className="pd-correlation-chart__point-label"
                    dataKey="annotationLabel"
                    offset={8}
                    position="top"
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <ol
            aria-label={resolvedLabels.observations}
            className="pd-correlation-chart__observations"
          >
            {runtimePoints.map((point) => (
              <li
                data-role={point.role}
                key={point.id}
              >
                <span className="pd-correlation-chart__observation-marker">
                  {point.annotationIndex}
                </span>
                <span className="pd-correlation-chart__observation-copy">
                  <strong>{point.label}</strong>
                  <span>
                    {resolvedLabels[pointRoleLabels[point.role]]}
                  </span>
                </span>
                <span className="pd-correlation-chart__observation-measure">
                  {formatObservationMeasure(
                    point,
                    xLabel,
                    yLabel,
                    formatValue,
                  )}
                </span>
              </li>
            ))}
          </ol>

          <dl
            className="pd-correlation-chart__semantics"
          >
            <div>
              <dt>{resolvedLabels.correlation}</dt>
              <dd>{strengthCopy}</dd>
            </div>
            <div>
              <dt>{resolvedLabels.relationship}</dt>
              <dd>
                {relationshipLabel
                  ?? 'Zależność opisuje wspólny kierunek lub rozkład punktów.'}
              </dd>
            </div>
            <div>
              <dt>{resolvedLabels.driverHypothesis}</dt>
              <dd>
                {driverHypothesis
                  ?? 'Hipoteza wpływu wymaga osobnej walidacji przed decyzją przyczynową.'}
              </dd>
            </div>
            <div>
              <dt>{resolvedLabels.evidence}</dt>
              <dd>
                {hasCausalEvidence && evidence
                  ? `${evidence.label}: ${evidence.description}`
                  : resolvedLabels.noCausality}
              </dd>
            </div>
          </dl>

          {normalizedClusters.length > 0 ? (
            <ul
              className="pd-correlation-chart__cluster-notes"
            >
              {normalizedClusters.map((cluster) => (
                <li key={cluster.id}>
                  <strong>{cluster.label}</strong>
                  <span>{cluster.description}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <ol
            aria-label={resolvedLabels.legend}
            className="pd-correlation-chart__legend"
          >
            {(
              [
                'standard',
                'cluster',
                'driver-hypothesis',
                'outlier',
              ] as const
            ).map((role) => (
              <li
                data-role={role}
                key={role}
              >
                <span
                  aria-hidden="true"
                  className="pd-correlation-chart__swatch"
                  style={{
                    background: roleColors[role],
                  }}
                />
                <span>
                  {resolvedLabels[pointRoleLabels[role]]}
                </span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p
          className="pd-correlation-chart__empty"
          role="status"
        >
          {resolvedLabels.unavailable}
        </p>
      )}
    </div>
  );
}
