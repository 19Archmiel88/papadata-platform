import {
  useRef,
  useState,
} from 'react';
import type {
  PlanTrajectoryPointView,
} from '../../../../../../contracts/api-schemas';
import {
  EmptyState,
} from '../../../design-system';

export type CommandCenterPlanTrajectoryChartProps = {
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

const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 260;
const PLOT_LEFT = 56;
const PLOT_RIGHT = 680;
const PLOT_TOP = 30;
const PLOT_BOTTOM = 216;
const AXIS_LABEL_COUNT = 5;

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

function resolveTooltipX(x: number): number {
  return x > PLOT_RIGHT - 160 ? x - 198 : x + 18;
}

function resolveTooltipY(y: number): number {
  return y < PLOT_TOP + 56 ? y + 22 : y - 76;
}

export function CommandCenterPlanTrajectoryChart({
  trajectory,
}: CommandCenterPlanTrajectoryChartProps) {
  const [visibleSeries, setVisibleSeries] = useState(initialVisibleSeries);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const hoverCloseRef = useRef<number | null>(null);

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
    }, 320);
  }

  function toggleSeries(seriesKey: SeriesKey) {
    setVisibleSeries((current) => ({
      ...current,
      [seriesKey]: !current[seriesKey],
    }));
    setActivePointId(null);
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

  const values = trajectory.flatMap((point) => (
    [point.plan, point.actual, point.forecast].filter(
      (value): value is number => value !== null,
    )
  ));
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(1, ...values);

  function scaleX(index: number): number {
    return trajectory.length <= 1
      ? PLOT_LEFT
      : PLOT_LEFT + (index / (trajectory.length - 1)) * (PLOT_RIGHT - PLOT_LEFT);
  }

  function scaleY(value: number): number {
    if (maxValue === minValue) {
      return (PLOT_TOP + PLOT_BOTTOM) / 2;
    }

    return PLOT_BOTTOM - ((value - minValue) / (maxValue - minValue)) * (PLOT_BOTTOM - PLOT_TOP);
  }

  const planLinePoints = trajectory
    .map((point, index) => `${scaleX(index)},${scaleY(point.plan)}`)
    .join(' ');

  const actualEntries = trajectory
    .map((point, index) => ({ index, point }))
    .filter((entry) => entry.point.actual !== null);
  const actualLinePoints = actualEntries
    .map((entry) => `${scaleX(entry.index)},${scaleY(entry.point.actual as number)}`)
    .join(' ');

  const forecastEntries = trajectory
    .map((point, index) => ({ index, point }))
    .filter((entry) => entry.point.forecast !== null);
  const lastActual = actualEntries[actualEntries.length - 1] ?? null;
  const forecastLinePoints = [
    ...(lastActual
      ? [`${scaleX(lastActual.index)},${scaleY(lastActual.point.actual as number)}`]
      : []),
    ...forecastEntries.map((entry) => `${scaleX(entry.index)},${scaleY(entry.point.forecast as number)}`),
  ].join(' ');

  const chartPoints: readonly ChartPoint[] = [
    ...actualEntries.map((entry) => ({
      id: `actual-${entry.index}`,
      label: dateFormatter.format(new Date(entry.point.date)),
      series: 'actual' as const,
      value: entry.point.actual as number,
      x: scaleX(entry.index),
      y: scaleY(entry.point.actual as number),
    })),
    ...forecastEntries.map((entry) => ({
      id: `forecast-${entry.index}`,
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

  const axisLabelIndexes = Array.from({ length: Math.min(AXIS_LABEL_COUNT, trajectory.length) }, (_unused, step) => {
    const ratio = AXIS_LABEL_COUNT <= 1 ? 0 : step / (AXIS_LABEL_COUNT - 1);
    return Math.round(ratio * (trajectory.length - 1));
  });
  const axisLabels = [...new Set(axisLabelIndexes)].map((index) => ({
    index,
    label: dateFormatter.format(new Date(trajectory[index].date)),
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

      <div className="pd-command-plan-trajectory__chart">
        <svg
          aria-label="Wykres dziennego przychodu, benchmarku i prognozy"
          className="pd-command-plan-trajectory__svg"
          role="img"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        >
          <title>Dzienne tempo przychodu, benchmark i prognoza</title>
          <desc>Pełne wartości wszystkich punktów są dostępne w tabeli otwieranej przyciskiem Pokaż dane benchmarku.</desc>
          <g className="pd-command-plan-trajectory__grid">
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM} />
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={(PLOT_TOP + PLOT_BOTTOM * 2) / 3} y2={(PLOT_TOP + PLOT_BOTTOM * 2) / 3} />
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={(PLOT_TOP * 2 + PLOT_BOTTOM) / 3} y2={(PLOT_TOP * 2 + PLOT_BOTTOM) / 3} />
            <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={PLOT_TOP} y2={PLOT_TOP} />
          </g>

          <g className="pd-command-plan-trajectory__axis">
            {axisLabels.map((entry) => (
              <text key={entry.index} x={scaleX(entry.index)} y={240}>
                {entry.label}
              </text>
            ))}
          </g>

          <polyline
            aria-hidden={!visibleSeries.target}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--target"
            data-visible={visibleSeries.target ? 'true' : 'false'}
            points={planLinePoints}
          />

          <polyline
            aria-hidden={!visibleSeries.actual}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--actual"
            data-visible={visibleSeries.actual ? 'true' : 'false'}
            points={actualLinePoints}
          />

          <polyline
            aria-hidden={!visibleSeries.forecast}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--forecast"
            data-visible={visibleSeries.forecast ? 'true' : 'false'}
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
                  r="34"
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
              <rect height="52" rx="12" width="182" />
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
    </>
  );
}
