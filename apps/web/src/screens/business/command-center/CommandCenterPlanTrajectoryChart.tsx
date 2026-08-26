import type {
  CSSProperties,
  WheelEvent as ReactWheelEvent,
} from 'react';
import {
  useId,
  useRef,
  useState,
} from 'react';
import type {
  PlanTrajectoryPointView,
} from '../../../../../../contracts/api-schemas';
import {
  EmptyState,
} from '../../../design-system';
import {
  useChartZoom,
} from '../../../design-system/components/Analytics/useChartZoom';

export type CommandCenterPlanTrajectoryChartProps = {
  readonly forecastTotal: number | null;
  readonly planTotal: number | null;
  readonly trajectory: readonly PlanTrajectoryPointView[];
};

type SeriesKey = 'actual' | 'forecast' | 'target';

type ChartPoint = {
  readonly id: string;
  readonly label: string;
  readonly series: Exclude<SeriesKey, 'target'>;
  readonly value: number;
  readonly x: number;
  readonly y: number;
};

const VIEW_WIDTH = 860;
const VIEW_HEIGHT = 320;
const PLOT_LEFT = 92;
const PLOT_RIGHT = 760;
const PLOT_TOP = 42;
const PLOT_BOTTOM = 260;
const AXIS_LABEL_COUNT = 5;
const Y_AXIS_TICK_COUNT = 5;

const seriesLegend = [
  { id: 'target', label: 'Benchmark' },
  { id: 'actual', label: 'Wykonanie' },
  { id: 'forecast', label: 'Prognoza' },
] as const;

const initialVisibleSeries: Record<SeriesKey, boolean> = {
  actual: true,
  forecast: true,
  target: true,
};

const valueFormatter = new Intl.NumberFormat('pl-PL', {
  currency: 'PLN',
  maximumFractionDigits: 0,
  style: 'currency',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
});

const percentFormatter = new Intl.NumberFormat('pl-PL', {
  maximumFractionDigits: 0,
  style: 'percent',
});

function resolveTooltipX(x: number): number {
  return x > PLOT_RIGHT - 160 ? x - 198 : x + 18;
}

function resolveTooltipY(y: number): number {
  return y < PLOT_TOP + 56 ? y + 22 : y - 76;
}

function formatAxisValue(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1000) {
    return `${new Intl.NumberFormat('pl-PL', {
      maximumFractionDigits: absolute >= 10000 ? 0 : 1,
    }).format(value / 1000)} tys.`;
  }

  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function CommandCenterPlanTrajectoryChart({
  forecastTotal,
  planTotal,
  trajectory,
}: CommandCenterPlanTrajectoryChartProps) {
  // useId() includes colons, which aren't safe inside a CSS/SVG url(#id)
  // reference (some engines need them escaped) — stripped here since these
  // ids are only ever consumed as fragment references, never rendered.
  const gradientIdBase = useId().replace(/:/g, '');
  const actualFillId = `${gradientIdBase}-actual-fill`;
  const forecastFillId = `${gradientIdBase}-forecast-fill`;
  const actualGlowId = `${gradientIdBase}-actual-glow`;
  const forecastGlowId = `${gradientIdBase}-forecast-glow`;

  const [visibleSeries, setVisibleSeries] = useState(initialVisibleSeries);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const hoverCloseRef = useRef<number | null>(null);
  const {
    isZoomed,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    onWheel,
    resetZoom,
    visibleData: visibleTrajectory,
  } = useChartZoom(trajectory, 6);

  function clearHoverClose() {
    if (hoverCloseRef.current !== null) {
      window.clearTimeout(hoverCloseRef.current);
      hoverCloseRef.current = null;
    }
  }

  function showPoint(pointId: string) {
    clearHoverClose();
    setActivePointId(pointId);
  }

  function scheduleHideActivePoint() {
    clearHoverClose();

    hoverCloseRef.current = window.setTimeout(() => {
      setActivePointId(null);
      hoverCloseRef.current = null;
    }, 220);
  }

  function toggleSeries(seriesKey: SeriesKey) {
    setVisibleSeries((current) => ({
      ...current,
      [seriesKey]: !current[seriesKey],
    }));
    setActivePointId(null);
  }

  function handleResetZoom() {
    resetZoom();
    setActivePointId(null);
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (
      !event.shiftKey
      && !event.ctrlKey
      && !event.metaKey
      && !event.altKey
    ) {
      return;
    }

    onWheel(event);
  }

  if (trajectory.length === 0) {
    return (
      <EmptyState
        message="Brak wystarczających danych o przychodzie i benchmarku w wybranym okresie, żeby narysować trajektorię."
        title="Brak danych trajektorii"
        variant="empty"
      />
    );
  }

  const dailyForecastReference = forecastTotal !== null && trajectory.length > 0
    ? forecastTotal / trajectory.length
    : null;
  const dailyPlanReference = planTotal !== null && trajectory.length > 0
    ? planTotal / trajectory.length
    : null;
  const values = [
    ...visibleTrajectory.flatMap((point) => {
      const activeValues: Array<number | null> = [];

      if (visibleSeries.target) {
        activeValues.push(point.plan);
      }

      if (visibleSeries.actual) {
        activeValues.push(point.actual);
      }

      if (visibleSeries.forecast) {
        activeValues.push(point.forecast);
      }

      return activeValues.filter((value): value is number => value !== null);
    }),
    ...(visibleSeries.forecast && dailyForecastReference !== null
      ? [dailyForecastReference]
      : []),
  ];
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(1, ...values);

  function scaleX(index: number): number {
    return visibleTrajectory.length <= 1
      ? PLOT_LEFT
      : PLOT_LEFT + (index / (visibleTrajectory.length - 1)) * (PLOT_RIGHT - PLOT_LEFT);
  }

  function scaleY(value: number): number {
    if (maxValue === minValue) {
      return (PLOT_TOP + PLOT_BOTTOM) / 2;
    }

    return PLOT_BOTTOM - ((value - minValue) / (maxValue - minValue)) * (PLOT_BOTTOM - PLOT_TOP);
  }

  const planLinePoints = visibleTrajectory
    .map((point, index) => `${scaleX(index)},${scaleY(point.plan)}`)
    .join(' ');

  const actualEntries = visibleTrajectory
    .map((point, index) => ({ index, point }))
    .filter((entry) => entry.point.actual !== null);
  const actualLinePoints = actualEntries
    .map((entry) => `${scaleX(entry.index)},${scaleY(entry.point.actual as number)}`)
    .join(' ');

  const forecastEntries = visibleTrajectory
    .map((point, index) => ({ index, point }))
    .filter((entry) => entry.point.forecast !== null);
  const lastActual = actualEntries[actualEntries.length - 1] ?? null;
  const forecastLinePoints = [
    ...(lastActual
      ? [`${scaleX(lastActual.index)},${scaleY(lastActual.point.actual as number)}`]
      : []),
    ...forecastEntries.map((entry) => `${scaleX(entry.index)},${scaleY(entry.point.forecast as number)}`),
  ].join(' ');
  const firstActualEntry = actualEntries[0] ?? null;
  const lastActualEntry = actualEntries.at(-1) ?? null;
  const actualAreaPath = firstActualEntry && lastActualEntry && actualEntries.length > 1
    ? [
        `M ${scaleX(firstActualEntry.index)} ${PLOT_BOTTOM}`,
        ...actualEntries.map((entry) => `L ${scaleX(entry.index)} ${scaleY(entry.point.actual as number)}`),
        `L ${scaleX(lastActualEntry.index)} ${PLOT_BOTTOM}`,
        'Z',
      ].join(' ')
    : null;
  const forecastAreaEntries = [
    ...(lastActual ? [lastActual] : []),
    ...forecastEntries,
  ];
  const firstForecastAreaEntry = forecastAreaEntries[0] ?? null;
  const lastForecastAreaEntry = forecastAreaEntries.at(-1) ?? null;
  const forecastAreaPath = firstForecastAreaEntry && lastForecastAreaEntry && forecastAreaEntries.length > 1
    ? [
        `M ${scaleX(firstForecastAreaEntry.index)} ${PLOT_BOTTOM}`,
        ...forecastAreaEntries.map((entry) => {
          const value = entry.point.forecast ?? entry.point.actual ?? 0;

          return `L ${scaleX(entry.index)} ${scaleY(value)}`;
        }),
        `L ${scaleX(lastForecastAreaEntry.index)} ${PLOT_BOTTOM}`,
        'Z',
      ].join(' ')
    : null;

  const chartPoints: readonly ChartPoint[] = [
    ...actualEntries.map((entry) => ({
      id: `actual-${entry.point.date}`,
      label: dateFormatter.format(new Date(entry.point.date)),
      series: 'actual' as const,
      value: entry.point.actual as number,
      x: scaleX(entry.index),
      y: scaleY(entry.point.actual as number),
    })),
    ...forecastEntries.map((entry) => ({
      id: `forecast-${entry.point.date}`,
      label: dateFormatter.format(new Date(entry.point.date)),
      series: 'forecast' as const,
      value: entry.point.forecast as number,
      x: scaleX(entry.index),
      y: scaleY(entry.point.forecast as number),
    })),
  ];

  const activePoint = chartPoints.find(
    (point) => point.id === activePointId && visibleSeries[point.series],
  ) ?? null;
  const yAxisTicks = Array.from(
    { length: Y_AXIS_TICK_COUNT },
    (_unused, index) => {
      const ratio = Y_AXIS_TICK_COUNT <= 1 ? 0 : index / (Y_AXIS_TICK_COUNT - 1);

      return minValue + (maxValue - minValue) * ratio;
    },
  );
  const visibleStartDate = visibleTrajectory[0]?.date ?? null;
  const visibleEndDate = visibleTrajectory.at(-1)?.date ?? null;
  const visibleStartIndex = visibleStartDate === null
    ? 0
    : Math.max(trajectory.findIndex((point) => point.date === visibleStartDate), 0);
  const visibleEndIndex = visibleEndDate === null
    ? Math.max(trajectory.length - 1, 0)
    : Math.max(trajectory.findIndex((point) => point.date === visibleEndDate), visibleStartIndex);
  const rangeStart = trajectory.length <= 1
    ? 0
    : (visibleStartIndex / (trajectory.length - 1)) * 100;
  const rangeSize = trajectory.length <= 1
    ? 100
    : ((visibleEndIndex - visibleStartIndex + 1) / trajectory.length) * 100;
  const rangeStyle = {
    '--pd-command-plan-range-size': `${Math.min(Math.max(rangeSize, 8), 100)}%`,
    '--pd-command-plan-range-start': `${Math.min(Math.max(rangeStart, 0), 100)}%`,
  } as CSSProperties;

  const axisLabelIndexes = Array.from(
    { length: Math.min(AXIS_LABEL_COUNT, visibleTrajectory.length) },
    (_unused, step) => {
      const ratio = AXIS_LABEL_COUNT <= 1 ? 0 : step / (AXIS_LABEL_COUNT - 1);
      return Math.round(ratio * (visibleTrajectory.length - 1));
    },
  );
  const axisLabels = [...new Set(axisLabelIndexes)].map((index) => ({
    index,
    label: dateFormatter.format(new Date(visibleTrajectory[index].date)),
  }));

  return (
    <>
      <div
        aria-label="Serie wykresu trajektorii"
        className="pd-command-plan-trajectory__legend"
      >
        {seriesLegend.map((item) => (
          <button
            aria-pressed={visibleSeries[item.id]}
            className="pd-command-plan-trajectory__legend-item"
            data-series={item.id}
            key={item.id}
            onClick={() => toggleSeries(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="pd-command-plan-trajectory__zoom-controls">
        <span>Przeciągnij po wykresie = zoom · Shift + scroll = skala · zwykły scroll przewija stronę</span>
        {isZoomed ? (
          <button
            className="pd-command-plan-trajectory__reset"
            onClick={handleResetZoom}
            type="button"
          >
            Reset zoomu
          </button>
        ) : null}
      </div>

      <div
        className="pd-command-plan-trajectory__chart"
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onWheel={handleWheel}
      >
        <svg
          aria-label="Wykres dziennego przychodu, benchmarku i prognozy"
          className="pd-command-plan-trajectory__svg"
          role="img"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        >
          <title>Dzienne tempo przychodu, benchmark i prognoza</title>
          <desc>Hover pokazuje wartości punktów. Przeciągnięcie wybiera zakres, Shift plus scroll zmienia skalę, a pełne wartości są dostępne także w tabeli.</desc>

          <defs>
            <linearGradient id={actualFillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--pd-data-actual)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'var(--pd-data-actual)', stopOpacity: 0 }} />
            </linearGradient>

            <linearGradient id={forecastFillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--pd-data-forecast)', stopOpacity: 0.24 }} />
              <stop offset="100%" style={{ stopColor: 'var(--pd-data-forecast)', stopOpacity: 0 }} />
            </linearGradient>

            <filter height="160%" id={actualGlowId} width="140%" x="-20%" y="-30%">
              <feDropShadow dx="0" dy="1" floodColor="var(--pd-data-actual)" floodOpacity="0.45" stdDeviation="2.5" />
            </filter>

            <filter height="160%" id={forecastGlowId} width="140%" x="-20%" y="-30%">
              <feDropShadow dx="0" dy="1" floodColor="var(--pd-data-forecast)" floodOpacity="0.4" stdDeviation="2.5" />
            </filter>
          </defs>

          <g className="pd-command-plan-trajectory__grid">
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM} />
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={(PLOT_TOP + PLOT_BOTTOM * 2) / 3} y2={(PLOT_TOP + PLOT_BOTTOM * 2) / 3} />
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={(PLOT_TOP * 2 + PLOT_BOTTOM) / 3} y2={(PLOT_TOP * 2 + PLOT_BOTTOM) / 3} />
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={PLOT_TOP} y2={PLOT_TOP} />
          </g>

          <g className="pd-command-plan-trajectory__y-axis">
            <line x1={PLOT_LEFT} x2={PLOT_LEFT} y1={PLOT_TOP} y2={PLOT_BOTTOM} />
            <text className="pd-command-plan-trajectory__axis-caption" x={PLOT_LEFT - 10} y={PLOT_TOP - 16}>
              PLN / dzień
            </text>
            {yAxisTicks.map((value) => (
              <g key={`left-${value}`} transform={`translate(0 ${scaleY(value)})`}>
                <line x1={PLOT_LEFT - 5} x2={PLOT_LEFT} y1="0" y2="0" />
                <text x={PLOT_LEFT - 12} y="4">
                  {formatAxisValue(value)}
                </text>
              </g>
            ))}
          </g>

          <g className="pd-command-plan-trajectory__y-axis pd-command-plan-trajectory__y-axis--benchmark">
            <line x1={PLOT_RIGHT} x2={PLOT_RIGHT} y1={PLOT_TOP} y2={PLOT_BOTTOM} />
            <text className="pd-command-plan-trajectory__axis-caption" x={PLOT_RIGHT + 12} y={PLOT_TOP - 16}>
              vs benchmark
            </text>
            {dailyPlanReference && dailyPlanReference > 0 ? yAxisTicks.map((value) => (
              <g key={`right-${value}`} transform={`translate(0 ${scaleY(value)})`}>
                <line x1={PLOT_RIGHT} x2={PLOT_RIGHT + 5} y1="0" y2="0" />
                <text x={PLOT_RIGHT + 12} y="4">
                  {percentFormatter.format(value / dailyPlanReference)}
                </text>
              </g>
            )) : null}
          </g>

          <g className="pd-command-plan-trajectory__x-axis">
            {axisLabels.map((entry) => (
              <text key={entry.index} x={scaleX(entry.index)} y={294}>
                {entry.label}
              </text>
            ))}
          </g>

          {actualAreaPath ? (
            <path
              aria-hidden="true"
              className="pd-command-plan-trajectory__area pd-command-plan-trajectory__area--actual"
              d={actualAreaPath}
              data-visible={visibleSeries.actual ? 'true' : 'false'}
              fill={`url(#${actualFillId})`}
            />
          ) : null}

          {forecastAreaPath ? (
            <path
              aria-hidden="true"
              className="pd-command-plan-trajectory__area pd-command-plan-trajectory__area--forecast"
              d={forecastAreaPath}
              data-visible={visibleSeries.forecast ? 'true' : 'false'}
              fill={`url(#${forecastFillId})`}
            />
          ) : null}

          <polyline
            aria-hidden={!visibleSeries.target}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--target"
            data-visible={visibleSeries.target ? 'true' : 'false'}
            points={planLinePoints}
          />

          {dailyForecastReference !== null && Number.isFinite(dailyForecastReference) ? (
            <g
              aria-hidden={!visibleSeries.forecast}
              className="pd-command-plan-trajectory__forecast-reference"
              data-visible={visibleSeries.forecast ? 'true' : 'false'}
            >
              <line
                x1={PLOT_LEFT}
                x2={PLOT_RIGHT}
                y1={scaleY(dailyForecastReference)}
                y2={scaleY(dailyForecastReference)}
              />
              <text x={PLOT_RIGHT - 8} y={scaleY(dailyForecastReference) - 8}>
                tempo prognozy {formatAxisValue(dailyForecastReference)}
              </text>
            </g>
          ) : null}

          <polyline
            aria-hidden={!visibleSeries.actual}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--actual"
            data-visible={visibleSeries.actual ? 'true' : 'false'}
            filter={`url(#${actualGlowId})`}
            points={actualLinePoints}
          />

          <polyline
            aria-hidden={!visibleSeries.forecast}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--forecast"
            data-visible={visibleSeries.forecast ? 'true' : 'false'}
            filter={`url(#${forecastGlowId})`}
            points={forecastLinePoints}
          />

          <g className="pd-command-plan-trajectory__points">
            {chartPoints.map((point) => (
              <g
                aria-hidden="true"
                className="pd-command-plan-trajectory__point"
                data-active={activePointId === point.id ? 'true' : 'false'}
                data-series={point.series}
                data-visible={visibleSeries[point.series] ? 'true' : 'false'}
                key={point.id}
                onMouseEnter={() => showPoint(point.id)}
                onMouseLeave={scheduleHideActivePoint}
              >
                <circle
                  className="pd-command-plan-trajectory__hit-area"
                  cx={point.x}
                  cy={point.y}
                  r="28"
                />
                <circle
                  className="pd-command-plan-trajectory__visible-point"
                  cx={point.x}
                  cy={point.y}
                  r={point.series === 'forecast' ? 5 : 4}
                />
              </g>
            ))}
          </g>

          {activePoint ? (
            <g
              className="pd-command-plan-trajectory__tooltip"
              transform={`translate(${resolveTooltipX(activePoint.x)}, ${resolveTooltipY(activePoint.y)})`}
            >
              <rect height="52" rx="9" width="182" />
              <text className="pd-command-plan-trajectory__tooltip-label" x="14" y="22">
                {activePoint.label}
              </text>
              <text className="pd-command-plan-trajectory__tooltip-value" x="14" y="41">
                {valueFormatter.format(activePoint.value)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="pd-command-plan-trajectory__range"
        style={rangeStyle}
      >
        <span />
      </div>
    </>
  );
}
