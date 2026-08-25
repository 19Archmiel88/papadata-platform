import type {
  CommandCenterRecord,
  DriverDecompositionView,
  DriverRelationshipPointView,
  DriverRelationshipView,
  DriverRelationships,
} from '../../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  EmptyState,
  SegmentedControl,
} from '../../../design-system';
import type {
  CommandLens,
  CommandLensDefinition,
} from './commandCenterLens';
import {
  commandLensDefinitions,
  findCommandLens,
  isCommandLensAvailable,
} from './commandCenterLens';
import {
  CommandChartTableFallback,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  findRecordById,
  formatMetricValue,
  openPapaAssistantForElement,
} from './commandCenterOnePageModel';

const driversElementId = 'command-sales-costs';
const bridgeViewBox = {
  height: 430,
  plotBottom: 318,
  plotLeft: 86,
  plotRight: 944,
  plotTop: 46,
  width: 1000,
} as const;
const efficiencyViewBox = {
  height: 448,
  plotBottom: 328,
  plotLeft: 96,
  plotRight: 920,
  plotTop: 48,
  width: 1000,
} as const;
const driverAxisTickCount = 5;

/** Shared by the data table fallback for paired relationship points. */
function formatRelationshipValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 }).format(value);
}

function isRecord(
  record: CommandCenterRecord | null,
): record is CommandCenterRecord {
  return record !== null;
}

function resolveLensRecords(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const ids = lens === 'cost'
    ? ['command-kpi-revenue', 'command-kpi-ad-cost']
    : lens === 'volume'
      ? ['command-kpi-orders', 'command-kpi-aov']
      : ['command-kpi-ad-cost', 'command-kpi-roas', 'command-kpi-cpa'];

  return ids
    .map((id) => findRecordById(records, id))
    .filter(isRecord);
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

const ratioFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 1,
});

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

function formatSignedCurrency(value: number): string {
  if (value === 0) {
    return formatCurrency(0);
  }

  return `${value > 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`;
}

function formatShare(value: number | null): string {
  if (
    value === null
    || !Number.isFinite(value)
  ) {
    return '—';
  }

  return percentFormatter.format(value);
}

function formatRoas(value: number | null): string {
  if (
    value === null
    || !Number.isFinite(value)
  ) {
    return '—';
  }

  return `${ratioFormatter.format(value)}x`;
}

type DriverMetric = {
  readonly detail: string;
  readonly label: string;
  readonly tone?: 'danger' | 'neutral' | 'positive' | 'warning';
  readonly value: string;
};

type DriverBridgeStepKind =
  | 'decrease'
  | 'increase'
  | 'start'
  | 'total';

type DriverBridgeStep = {
  readonly detail: string;
  readonly id: string;
  readonly kind: DriverBridgeStepKind;
  readonly label: string;
  readonly value: number;
};

type RuntimeBridgeStep = DriverBridgeStep & {
  readonly cumulativeValue: number;
  readonly endValue: number;
  readonly startValue: number;
};

function buildRuntimeBridgeSteps(
  steps: readonly DriverBridgeStep[],
): readonly RuntimeBridgeStep[] {
  let runningTotal = 0;

  return steps.map((step) => {
    const previousTotal = runningTotal;
    const nextTotal = step.kind === 'start' || step.kind === 'total'
      ? step.value
      : runningTotal + step.value;

    runningTotal = nextTotal;

    return {
      ...step,
      cumulativeValue: nextTotal,
      endValue: nextTotal,
      startValue: step.kind === 'start' || step.kind === 'total'
        ? 0
        : previousTotal,
    };
  });
}

function resolveNumberDomain(
  values: readonly number[],
  paddingRatio = 0.1,
): readonly [number, number] {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) {
    return [0, 1];
  }

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);
  const span = Math.max(max - min, Math.abs(max), 1);

  return [
    min - span * paddingRatio,
    max + span * paddingRatio,
  ];
}

function buildAxisTicks(
  min: number,
  max: number,
  count = driverAxisTickCount,
): readonly number[] {
  if (count <= 1) {
    return [min];
  }

  const step = (max - min) / (count - 1);

  return Array.from({ length: count }, (_unused, index) => min + step * index);
}

function clampPositiveDomain(
  domain: readonly [number, number],
): readonly [number, number] {
  const min = Math.max(0, domain[0]);
  const max = Math.max(domain[1], min + 1);

  return [min, max];
}

function buildBridgePath(
  points: readonly {
    readonly x: number;
    readonly y: number;
  }[],
): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function CommandDriverBridgeChart({
  ariaLabel,
  description,
  idPrefix,
  metrics,
  steps,
  title,
}: {
  readonly ariaLabel: string;
  readonly description: string;
  readonly idPrefix: string;
  readonly metrics: readonly DriverMetric[];
  readonly steps: readonly DriverBridgeStep[];
  readonly title: string;
}) {
  const runtimeSteps = buildRuntimeBridgeSteps(steps);
  const domain = resolveNumberDomain([
    0,
    ...runtimeSteps.flatMap((step) => [
      step.startValue,
      step.endValue,
    ]),
  ], 0.08);
  const axisTicks = buildAxisTicks(domain[0], domain[1]);
  const plotHeight = bridgeViewBox.plotBottom - bridgeViewBox.plotTop;
  const plotWidth = bridgeViewBox.plotRight - bridgeViewBox.plotLeft;
  const stepWidth = plotWidth / Math.max(runtimeSteps.length, 1);
  const barWidth = Math.min(128, stepWidth * 0.52);
  const scaleY = (value: number) => (
    bridgeViewBox.plotBottom
    - ((value - domain[0]) / Math.max(domain[1] - domain[0], 1)) * plotHeight
  );
  const baselineY = scaleY(0);

  return (
    <div
      aria-label={ariaLabel}
      className="pd-command-driver-visual pd-command-driver-visual--bridge"
      role="group"
    >
      <div className="pd-command-driver-visual__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <svg
        aria-hidden="true"
        className="pd-command-driver-bridge"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${bridgeViewBox.width} ${bridgeViewBox.height}`}
      >
        <defs>
          <linearGradient id={`${idPrefix}-bridge-start`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-data-series-2)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-2) 38%, transparent)" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-bridge-increase`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-data-series-6)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-6) 35%, transparent)" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-bridge-decrease`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-data-series-4)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-4) 32%, transparent)" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-bridge-total`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-data-series-1)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-1) 36%, transparent)" />
          </linearGradient>
        </defs>

        <rect
          className="pd-command-driver-chart__plot-bg"
          height={plotHeight}
          width={plotWidth}
          x={bridgeViewBox.plotLeft}
          y={bridgeViewBox.plotTop}
        />

        {axisTicks.map((tick) => {
          const y = scaleY(tick);

          return (
            <g key={`bridge-tick-${tick.toFixed(3)}`}>
              <line
                className="pd-command-driver-chart__grid-line"
                x1={bridgeViewBox.plotLeft}
                x2={bridgeViewBox.plotRight}
                y1={y}
                y2={y}
              />
              <text
                className="pd-command-driver-chart__axis-value"
                textAnchor="end"
                x={bridgeViewBox.plotLeft - 14}
                y={y + 4}
              >
                {formatCompactCurrency(tick)}
              </text>
            </g>
          );
        })}

        <line
          className="pd-command-driver-chart__baseline"
          x1={bridgeViewBox.plotLeft}
          x2={bridgeViewBox.plotRight}
          y1={baselineY}
          y2={baselineY}
        />

        {runtimeSteps.slice(0, -1).map((step, index) => {
          const x = bridgeViewBox.plotLeft + stepWidth * (index + 0.5);
          const nextX = bridgeViewBox.plotLeft + stepWidth * (index + 1.5);
          const y = scaleY(step.endValue);

          return (
            <line
              className="pd-command-driver-bridge__connector"
              key={`connector-${step.id}`}
              x1={x + barWidth / 2}
              x2={nextX - barWidth / 2}
              y1={y}
              y2={y}
            />
          );
        })}

        {runtimeSteps.map((step, index) => {
          const centerX = bridgeViewBox.plotLeft + stepWidth * (index + 0.5);
          const barX = centerX - barWidth / 2;
          const topValue = Math.max(step.startValue, step.endValue);
          const bottomValue = Math.min(step.startValue, step.endValue);
          const rawTopY = scaleY(topValue);
          const rawBottomY = scaleY(bottomValue);
          const rawHeight = Math.abs(rawBottomY - rawTopY);
          const height = Math.max(rawHeight, 5);
          const y = rawHeight < 5
            ? rawTopY - 2.5
            : rawTopY;
          const valueLabel = step.kind === 'increase' || step.kind === 'decrease'
            ? formatSignedCurrency(step.value)
            : formatCurrency(step.value);

          return (
            <g
              data-kind={step.kind}
              key={step.id}
            >
              <rect
                className="pd-command-driver-bridge__bar"
                fill={`url(#${idPrefix}-bridge-${step.kind})`}
                height={height}
                rx="8"
                width={barWidth}
                x={barX}
                y={y}
              />
              <text
                className="pd-command-driver-chart__value-label"
                textAnchor="middle"
                x={centerX}
                y={Math.max(22, y - 12)}
              >
                {valueLabel}
              </text>
              <text
                className="pd-command-driver-chart__category-label"
                textAnchor="middle"
                x={centerX}
                y={bridgeViewBox.plotBottom + 34}
              >
                {step.label}
              </text>
              <text
                className="pd-command-driver-chart__category-detail"
                textAnchor="middle"
                x={centerX}
                y={bridgeViewBox.plotBottom + 56}
              >
                {step.detail}
              </text>
            </g>
          );
        })}

        <text
          className="pd-command-driver-chart__axis-title"
          textAnchor="middle"
          x={bridgeViewBox.plotLeft - 54}
          y={bridgeViewBox.plotTop - 16}
        >
          PLN
        </text>
      </svg>

      <ul className="pd-command-driver-visual__metrics">
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
    </div>
  );
}

function buildCostWaterfall(records: readonly CommandCenterRecord[]) {
  const revenue = findRecordById(records, 'command-kpi-revenue');
  const adCost = findRecordById(records, 'command-kpi-ad-cost');

  if (!revenue) {
    return null;
  }

  const adCostValue = adCost?.value ?? 0;
  const contributionAfterMedia = revenue.value - adCostValue;
  const mediaShare = revenue.value === 0
    ? null
    : adCostValue / revenue.value;

  return (
    <CommandDriverBridgeChart
      ariaLabel="Wykres mostkowy: przychód pomniejszony o koszt mediów"
      description="Most pokazuje, ile przychodu zostaje po odjęciu kosztu mediów. To nie miesza różnych jednostek na jednej osi: wszystkie słupki są w PLN."
      idPrefix="command-driver-cost"
      metrics={[
        {
          detail: 'Wynik sprzedaży w okresie',
          label: 'Przychód',
          tone: 'positive',
          value: formatCurrency(revenue.value),
        },
        {
          detail: 'Koszt pozyskania ruchu',
          label: 'Koszt mediów',
          tone: 'danger',
          value: formatSignedCurrency(-adCostValue),
        },
        {
          detail: 'Przychód po koszcie reklam',
          label: 'Po mediach',
          tone: contributionAfterMedia >= 0 ? 'positive' : 'danger',
          value: formatCurrency(contributionAfterMedia),
        },
        {
          detail: 'Udział kosztu mediów w przychodzie',
          label: 'Koszt / przychód',
          tone: mediaShare !== null && mediaShare > 0.45 ? 'warning' : 'neutral',
          value: formatShare(mediaShare),
        },
      ]}
      steps={[
        {
          id: 'revenue',
          detail: 'punkt startowy',
          kind: 'start',
          label: revenue.label,
          value: revenue.value,
        },
        ...(adCost ? [{
          id: 'ad-cost',
          detail: 'odejmujemy',
          kind: 'decrease' as const,
          label: adCost.label,
          value: -adCost.value,
        }] : []),
        {
          id: 'contribution',
          detail: 'wynik netto mediów',
          kind: 'total',
          label: 'Po koszcie mediów',
          value: contributionAfterMedia,
        },
      ]}
      title="Przychód po odjęciu kosztu mediów"
    />
  );
}

/** |r| below this reads as "no meaningful pattern in this range", not a forced direction. */
const weakCorrelationThreshold = 0.15;

/**
 * Marginal response computed client-side from the same real (x, y) pairs the
 * chart plots — first half of the window vs. second half, both real spend
 * and real attributed-revenue observations. This is deliberately never sent
 * as its own backend field: it is exactly derivable from `points`, so
 * computing it here can never disagree with what's drawn.
 */
function resolveMarginalResponse(points: readonly DriverRelationshipPointView[]): number | null {
  if (points.length < 4) {
    return null;
  }

  const half = Math.floor(points.length / 2);
  const firstHalf = points.slice(0, half);
  const secondHalf = points.slice(half);
  const average = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const deltaX = average(secondHalf.map((point) => point.x)) - average(firstHalf.map((point) => point.x));
  const deltaY = average(secondHalf.map((point) => point.y)) - average(firstHalf.map((point) => point.y));

  return deltaX === 0 ? null : deltaY / deltaX;
}

/**
 * Orders x AOV decomposition, rendered the same way as the cost lens's
 * revenue waterfall: start value, the two effects (each an increase or a
 * decrease depending on sign), and the end value as a running total. This
 * replaces a scatter/correlation view on purpose — see
 * command-center-metrics.contract-data.ts for why correlating orders
 * against AOV directly would have been statistically spurious.
 */
function buildVolumeWaterfall(driverRelationships: DriverRelationships | null) {
  if (!driverRelationships) {
    return null;
  }

  const decomposition = driverRelationships.volume;

  if (decomposition.sampleSize === 0) {
    return null;
  }

  return (
    <CommandDriverBridgeChart
      ariaLabel="Wykres mostkowy: wpływ liczby zamówień i AOV na przychód"
      description="Dekompozycja rozbija zmianę przychodu na dwa realne składniki: ruch wolumenowy oraz zmianę wartości koszyka."
      idPrefix="command-driver-volume"
      metrics={[
        {
          detail: 'Średnia z pierwszej połowy okresu',
          label: 'Start',
          value: formatCurrency(decomposition.startValue),
        },
        {
          detail: decomposition.volumeLabel,
          label: 'Wpływ zamówień',
          tone: decomposition.volumeEffect >= 0 ? 'positive' : 'danger',
          value: formatSignedCurrency(decomposition.volumeEffect),
        },
        {
          detail: decomposition.priceLabel,
          label: 'Wpływ AOV',
          tone: decomposition.priceEffect >= 0 ? 'positive' : 'danger',
          value: formatSignedCurrency(decomposition.priceEffect),
        },
        {
          detail: 'Średnia z drugiej połowy okresu',
          label: 'Koniec',
          tone: decomposition.endValue >= decomposition.startValue ? 'positive' : 'danger',
          value: formatCurrency(decomposition.endValue),
        },
      ]}
      steps={[
        {
          id: 'start',
          detail: 'I połowa',
          kind: 'start',
          label: 'Przychód (I połowa okresu)',
          value: decomposition.startValue,
        },
        {
          id: 'volume',
          detail: 'zamówienia',
          kind: decomposition.volumeEffect >= 0 ? 'increase' as const : 'decrease' as const,
          label: 'Zamówienia',
          value: decomposition.volumeEffect,
        },
        {
          id: 'price',
          detail: 'AOV',
          kind: decomposition.priceEffect >= 0 ? 'increase' as const : 'decrease' as const,
          label: 'AOV',
          value: decomposition.priceEffect,
        },
        {
          id: 'end',
          detail: 'II połowa',
          kind: 'total',
          label: 'Przychód (II połowa okresu)',
          value: decomposition.endValue,
        },
      ]}
      title="Zamówienia i AOV jako źródła zmiany przychodu"
    />
  );
}

function resolveCorrelationCopy(
  relationship: DriverRelationshipView,
): string {
  if (relationship.basis === 'insufficient-data') {
    return `Brakuje stabilnego współczynnika korelacji (n=${relationship.sampleSize}). Pokazujemy punkty dzienne i zwrot z wydatku bez udawania przyczynowości.`;
  }

  const correlation = relationship.coefficient ?? 0;

  if (correlation >= weakCorrelationThreshold) {
    return `Dodatnia relacja w tym zakresie: większy koszt mediów zwykle idzie z większym przychodem z reklam (r=${correlation.toFixed(2)}).`;
  }

  if (correlation <= -weakCorrelationThreshold) {
    return `Ujemna relacja w tym zakresie: wyższy koszt mediów nie dowozi proporcjonalnego przychodu z reklam (r=${correlation.toFixed(2)}).`;
  }

  return `Relacja jest słaba w tym zakresie (r=${correlation.toFixed(2)}). Decyzję budżetową warto oprzeć na kampaniach i jakości danych, nie na samej korelacji.`;
}

function buildUniqueGuides(
  values: readonly number[],
): readonly number[] {
  const rounded = values
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.round(value * 2) / 2);
  const unique = Array.from(new Set(rounded)).sort((left, right) => left - right);

  return unique.slice(0, 4);
}

function buildRoasGuides(
  ratios: readonly number[],
  averageRoas: number | null,
): readonly number[] {
  const validRatios = ratios.filter((value) => Number.isFinite(value) && value > 0);

  if (validRatios.length === 0) {
    return [];
  }

  const minRatio = Math.min(...validRatios);
  const maxRatio = Math.max(...validRatios);
  const center = averageRoas ?? validRatios[Math.floor(validRatios.length / 2)] ?? 1;
  const guides = buildUniqueGuides([
    Math.floor(minRatio * 2) / 2,
    center,
    Math.ceil(maxRatio * 2) / 2,
  ]);

  if (guides.length >= 3) {
    return guides;
  }

  return buildUniqueGuides([
    center - 0.5,
    center,
    center + 0.5,
    ...guides,
  ]);
}

function resolveRegressionLine(
  points: readonly DriverRelationshipPointView[],
  xDomain: readonly [number, number],
): readonly [
  {
    readonly x: number;
    readonly y: number;
  },
  {
    readonly x: number;
    readonly y: number;
  },
] | null {
  if (points.length < 2) {
    return null;
  }

  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);

  if (denominator === 0) {
    return null;
  }

  const numerator = points.reduce((sum, point) => (
    sum + (point.x - meanX) * (point.y - meanY)
  ), 0);
  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  return [
    {
      x: xDomain[0],
      y: slope * xDomain[0] + intercept,
    },
    {
      x: xDomain[1],
      y: slope * xDomain[1] + intercept,
    },
  ];
}

function resolvePointTone(
  ratio: number,
  averageRoas: number | null,
): 'neutral' | 'strong' | 'weak' {
  if (
    averageRoas === null
    || !Number.isFinite(averageRoas)
    || averageRoas === 0
  ) {
    return 'neutral';
  }

  if (ratio >= averageRoas * 1.06) {
    return 'strong';
  }

  if (ratio <= averageRoas * 0.94) {
    return 'weak';
  }

  return 'neutral';
}

function CommandDriverEfficiencyChart({
  relationship,
}: {
  readonly relationship: DriverRelationshipView;
}) {
  const points = relationship.points.filter((point) => (
    Number.isFinite(point.x)
    && Number.isFinite(point.y)
    && point.x > 0
  ));

  if (points.length === 0) {
    return null;
  }

  const totalSpend = points.reduce((sum, point) => sum + point.x, 0);
  const totalRevenue = points.reduce((sum, point) => sum + point.y, 0);
  const averageRoas = totalSpend === 0
    ? null
    : totalRevenue / totalSpend;
  const ratios = points.map((point) => point.y / point.x);
  const roasGuides = buildRoasGuides(ratios, averageRoas);
  const xDomain = clampPositiveDomain(resolveNumberDomain(points.map((point) => point.x), 0.08));
  const yDomain = clampPositiveDomain(resolveNumberDomain([
    ...points.map((point) => point.y),
    ...roasGuides.flatMap((ratio) => [
      ratio * xDomain[0],
      ratio * xDomain[1],
    ]),
  ], 0.08));
  const xTicks = buildAxisTicks(xDomain[0], xDomain[1]);
  const yTicks = buildAxisTicks(yDomain[0], yDomain[1]);
  const plotHeight = efficiencyViewBox.plotBottom - efficiencyViewBox.plotTop;
  const plotWidth = efficiencyViewBox.plotRight - efficiencyViewBox.plotLeft;
  const scaleX = (value: number) => (
    efficiencyViewBox.plotLeft
    + ((value - xDomain[0]) / Math.max(xDomain[1] - xDomain[0], 1)) * plotWidth
  );
  const scaleY = (value: number) => (
    efficiencyViewBox.plotBottom
    - ((value - yDomain[0]) / Math.max(yDomain[1] - yDomain[0], 1)) * plotHeight
  );
  const sortedPoints = [...points].sort((left, right) => left.x - right.x);
  const plottedPoints = sortedPoints.map((point) => ({
    ...point,
    ratio: point.y / point.x,
    tone: resolvePointTone(point.y / point.x, averageRoas),
    xPlot: scaleX(point.x),
    yPlot: scaleY(point.y),
  }));
  const firstPlottedPoint = plottedPoints[0];

  if (!firstPlottedPoint) {
    return null;
  }

  const curvePath = buildBridgePath(plottedPoints.map((point) => ({
    x: point.xPlot,
    y: point.yPlot,
  })));
  const regression = relationship.basis === 'correlation'
    ? resolveRegressionLine(points, xDomain)
    : null;
  const bestPoint = plottedPoints.reduce((best, point) => (
    point.ratio > best.ratio ? point : best
  ), firstPlottedPoint);
  const weakestPoint = plottedPoints.reduce((weakest, point) => (
    point.ratio < weakest.ratio ? point : weakest
  ), firstPlottedPoint);
  const latestPoint = points[points.length - 1];
  const latestRatio = latestPoint
    ? latestPoint.y / latestPoint.x
    : null;
  const marginalResponse = resolveMarginalResponse(points);
  const metrics: readonly DriverMetric[] = [
    {
      detail: 'Przychód z reklam / koszt mediów',
      label: 'Średni zwrot',
      tone: 'positive',
      value: formatRoas(averageRoas),
    },
    {
      detail: 'Druga połowa okresu vs pierwsza',
      label: 'Krańcowe 1 zł',
      tone: marginalResponse !== null && marginalResponse >= 1 ? 'positive' : 'warning',
      value: marginalResponse === null
        ? '—'
        : formatCurrency(marginalResponse),
    },
    {
      detail: bestPoint?.label ?? 'brak punktu',
      label: 'Najlepszy dzień',
      tone: 'positive',
      value: bestPoint ? formatRoas(bestPoint.ratio) : '—',
    },
    {
      detail: relationship.basis === 'correlation' ? 'Pearson dla pokazanych punktów' : 'Za mało danych do Pearson r',
      label: 'Stabilność relacji',
      tone: relationship.basis === 'correlation' ? 'neutral' : 'warning',
      value: relationship.basis === 'correlation' && relationship.coefficient !== null
        ? relationship.coefficient.toFixed(2)
        : 'n/a',
    },
  ];

  return (
    <div
      aria-label="Krzywa efektywności: koszt mediów kontra przychód z reklam"
      className="pd-command-driver-visual pd-command-driver-visual--efficiency"
      role="group"
    >
      <div className="pd-command-driver-visual__copy">
        <h3>Krzywa zwrotu z wydatku mediowego</h3>
        <p>
          Każdy punkt to dzień. Im wyżej przy tym samym koszcie, tym lepszy zwrot;
          linie ROAS pokazują, czy dodatkowy wydatek nadal dowozi przychód.
        </p>
      </div>

      <svg
        aria-hidden="true"
        className="pd-command-driver-efficiency"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${efficiencyViewBox.width} ${efficiencyViewBox.height}`}
      >
        <defs>
          <linearGradient id="command-driver-efficiency-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--pd-data-series-2) 18%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-2) 2%, transparent)" />
          </linearGradient>
          <filter id="command-driver-efficiency-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur result="blur" stdDeviation="5" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          className="pd-command-driver-chart__plot-bg"
          height={plotHeight}
          width={plotWidth}
          x={efficiencyViewBox.plotLeft}
          y={efficiencyViewBox.plotTop}
        />

        {yTicks.map((tick) => {
          const y = scaleY(tick);

          return (
            <g key={`efficiency-y-${tick.toFixed(3)}`}>
              <line
                className="pd-command-driver-chart__grid-line"
                x1={efficiencyViewBox.plotLeft}
                x2={efficiencyViewBox.plotRight}
                y1={y}
                y2={y}
              />
              <text
                className="pd-command-driver-chart__axis-value"
                textAnchor="end"
                x={efficiencyViewBox.plotLeft - 14}
                y={y + 4}
              >
                {formatCompactCurrency(tick)}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => {
          const x = scaleX(tick);

          return (
            <g key={`efficiency-x-${tick.toFixed(3)}`}>
              <line
                className="pd-command-driver-chart__grid-line pd-command-driver-chart__grid-line--vertical"
                x1={x}
                x2={x}
                y1={efficiencyViewBox.plotTop}
                y2={efficiencyViewBox.plotBottom}
              />
              <text
                className="pd-command-driver-chart__axis-value"
                textAnchor="middle"
                x={x}
                y={efficiencyViewBox.plotBottom + 32}
              >
                {formatCompactCurrency(tick)}
              </text>
            </g>
          );
        })}

        {roasGuides.map((ratio) => {
          const x1 = xDomain[0];
          const x2 = xDomain[1];
          const y1 = ratio * x1;
          const y2 = ratio * x2;

          return (
            <g key={`roas-guide-${ratio}`}>
              <line
                className="pd-command-driver-efficiency__roas-guide"
                x1={scaleX(x1)}
                x2={scaleX(x2)}
                y1={scaleY(y1)}
                y2={scaleY(y2)}
              />
              <text
                className="pd-command-driver-efficiency__roas-label"
                textAnchor="end"
                x={efficiencyViewBox.plotRight - 10}
                y={scaleY(y2) - 7}
              >
                ROAS {formatRoas(ratio)}
              </text>
            </g>
          );
        })}

        {regression ? (
          <line
            className="pd-command-driver-efficiency__trend"
            x1={scaleX(regression[0].x)}
            x2={scaleX(regression[1].x)}
            y1={scaleY(regression[0].y)}
            y2={scaleY(regression[1].y)}
          />
        ) : null}

        <path
          className="pd-command-driver-efficiency__area"
          d={`${curvePath} L ${plottedPoints[plottedPoints.length - 1]?.xPlot ?? efficiencyViewBox.plotLeft} ${efficiencyViewBox.plotBottom} L ${plottedPoints[0]?.xPlot ?? efficiencyViewBox.plotLeft} ${efficiencyViewBox.plotBottom} Z`}
        />
        <path
          className="pd-command-driver-efficiency__curve"
          d={curvePath}
        />

        {plottedPoints.map((point) => {
          const isBest = point.id === bestPoint?.id;
          const isWeakest = point.id === weakestPoint?.id;
          const shouldLabel = isBest || isWeakest || point.id === latestPoint?.id;

          return (
            <g
              data-tone={point.tone}
              key={point.id}
            >
              <circle
                className="pd-command-driver-efficiency__point"
                cx={point.xPlot}
                cy={point.yPlot}
                r={isBest || isWeakest ? 7 : 5}
              />
              {shouldLabel ? (
                <text
                  className="pd-command-driver-efficiency__point-label"
                  textAnchor="middle"
                  x={point.xPlot}
                  y={point.yPlot - 14}
                >
                  {isBest ? 'najlepszy' : isWeakest ? 'najsłabszy' : `ostatni ${formatRoas(latestRatio)}`}
                </text>
              ) : null}
            </g>
          );
        })}

        <text
          className="pd-command-driver-chart__axis-title"
          textAnchor="middle"
          transform={`rotate(-90 ${efficiencyViewBox.plotLeft - 66} ${(efficiencyViewBox.plotTop + efficiencyViewBox.plotBottom) / 2})`}
          x={efficiencyViewBox.plotLeft - 66}
          y={(efficiencyViewBox.plotTop + efficiencyViewBox.plotBottom) / 2}
        >
          {relationship.yLabel}
        </text>
        <text
          className="pd-command-driver-chart__axis-title"
          textAnchor="middle"
          x={(efficiencyViewBox.plotLeft + efficiencyViewBox.plotRight) / 2}
          y={efficiencyViewBox.plotBottom + 72}
        >
          {relationship.xLabel}
        </text>
      </svg>

      <ul className="pd-command-driver-visual__metrics">
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

      <p className="pd-command-driver-visual__insight">
        {resolveCorrelationCopy(relationship)}
      </p>
    </div>
  );
}

function buildEfficiencyCorrelation(driverRelationships: DriverRelationships | null) {
  if (!driverRelationships) {
    return null;
  }

  return (
    <CommandDriverEfficiencyChart relationship={driverRelationships.efficiency} />
  );
}

function buildLensVisualization(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
  driverRelationships: DriverRelationships | null,
) {
  if (lens === 'cost') {
    return buildCostWaterfall(records);
  }

  if (lens === 'volume') {
    return buildVolumeWaterfall(driverRelationships);
  }

  return buildEfficiencyCorrelation(driverRelationships);
}

const metricLensTableColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Metryka', sortable: true, width: 220 },
  { align: 'right', id: 'value', label: 'Wynik', sortable: true, width: 160 },
];

function buildMetricLensTableRows(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
): readonly DataRow[] {
  return resolveLensRecords(lens, records).map((record) => ({
    id: record.metricId,
    label: record.label,
    value: formatMetricValue(record.value, record.unit),
  }));
}

function buildRelationshipTableColumns(
  xLabel: string,
  yLabel: string,
): readonly DataColumn[] {
  return [
    { id: 'label', label: 'Punkt', sortable: true, width: 140 },
    { align: 'right', id: 'x', label: xLabel, sortable: true, width: 200 },
    { align: 'right', id: 'y', label: yLabel, sortable: true, width: 200 },
  ];
}

/** Rows built from the exact same `points` the chart plots — a real tabular alternative, never resampled separately. */
function buildRelationshipTableRows(
  points: readonly DriverRelationshipPointView[],
): readonly DataRow[] {
  return points.map((point) => ({
    id: point.id,
    label: point.label,
    x: formatRelationshipValue(point.x),
    y: formatRelationshipValue(point.y),
  }));
}

const decompositionTableColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Krok', sortable: false, width: 220 },
  { align: 'right', id: 'value', label: 'Wartość', sortable: false, width: 180 },
];

/** Rows built from the exact same four figures the waterfall plots. */
function buildDecompositionTableRows(
  decomposition: DriverDecompositionView,
): readonly DataRow[] {
  return [
    { id: 'start', label: 'Przychód (I połowa okresu)', value: currencyFormatter.format(decomposition.startValue) },
    { id: 'volume', label: `Wpływ: ${decomposition.volumeLabel}`, value: currencyFormatter.format(decomposition.volumeEffect) },
    { id: 'price', label: `Wpływ: ${decomposition.priceLabel}`, value: currencyFormatter.format(decomposition.priceEffect) },
    { id: 'end', label: 'Przychód (II połowa okresu)', value: currencyFormatter.format(decomposition.endValue) },
  ];
}

type LensTable = {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly minWidth: number;
  readonly rows: readonly DataRow[];
  readonly sortColumnId: string;
};

function buildLensTable(
  lens: CommandLens,
  records: readonly CommandCenterRecord[],
  driverRelationships: DriverRelationships | null,
): LensTable | null {
  if (lens === 'cost') {
    return {
      ariaLabel: 'Dane liczbowe dla perspektywy: Przychód vs koszty',
      columns: metricLensTableColumns,
      minWidth: 480,
      rows: buildMetricLensTableRows(lens, records),
      sortColumnId: 'value',
    };
  }

  if (!driverRelationships) {
    return null;
  }

  if (lens === 'volume') {
    return {
      ariaLabel: 'Dane liczbowe dla perspektywy: Zamówienia vs AOV',
      columns: decompositionTableColumns,
      minWidth: 420,
      rows: buildDecompositionTableRows(driverRelationships.volume),
      sortColumnId: 'label',
    };
  }

  const relationship = driverRelationships.efficiency;

  return {
    ariaLabel: 'Dane liczbowe dla perspektywy: Koszt vs przychód z reklam',
    columns: buildRelationshipTableColumns(relationship.xLabel, relationship.yLabel),
    minWidth: 560,
    rows: buildRelationshipTableRows(relationship.points),
    sortColumnId: 'x',
  };
}

function buildLensItems(
  records: readonly CommandCenterRecord[],
): readonly {
  readonly disabled: boolean;
  readonly label: string;
  readonly value: string;
}[] {
  return commandLensDefinitions.map((lens: CommandLensDefinition) => ({
    disabled: !isCommandLensAvailable(lens, records),
    label: lens.label,
    value: lens.value,
  }));
}

export function CommandCenterDriversSection({
  activeLens,
  driverRelationships,
  onLensChange,
  records,
}: {
  readonly activeLens: CommandLens;
  readonly driverRelationships: DriverRelationships | null;
  readonly onLensChange: (lens: CommandLens) => void;
  readonly records: readonly CommandCenterRecord[];
}) {
  const lens = findCommandLens(activeLens);
  const visualization = buildLensVisualization(activeLens, records, driverRelationships);
  const table = buildLensTable(activeLens, records, driverRelationships);

  return (
    <section
      aria-labelledby="command-center-sales-cost-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        actions={(
          <Button
            onClick={() => openPapaAssistantForElement(driversElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        )}
        description="Trzy perspektywy na to, co napędza wynik. Metryki o różnych jednostkach nie są sztucznie rysowane na wspólnej osi."
        eyebrow="Drivery wyniku"
        title="Co napędza wynik"
        titleId="command-center-sales-cost-title"
      />

      <div className="pd-command-center-one-page__lens-switch">
        <SegmentedControl
          ariaLabel="Perspektywa analizy wyniku"
          items={buildLensItems(records)}
          onValueChange={(value) => onLensChange(value as CommandLens)}
          size="compact"
          value={activeLens}
        />
        <p>{lens.question}</p>
      </div>

      <div className="pd-command-center-one-page__runtime-main-analysis">
        {visualization ?? (
          <EmptyState
            message="Dla wybranej perspektywy brakuje metryk w bieżącym zakresie danych."
            title="Brak danych dla tej perspektywy"
            variant="empty"
          />
        )}

        {table ? (
          <CommandChartTableFallback
            ariaLabel={table.ariaLabel}
            columns={table.columns}
            emptyMessage="Brak danych dla tej perspektywy."
            minWidth={table.minWidth}
            rows={table.rows}
            sortColumnId={table.sortColumnId}
          />
        ) : null}
      </div>
    </section>
  );
}
