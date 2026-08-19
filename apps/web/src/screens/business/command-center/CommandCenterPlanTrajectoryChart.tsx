import {
  useRef,
  useState,
} from 'react';

type SeriesKey = 'target' | 'actual' | 'forecast';

type ChartPoint = {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly series: Exclude<SeriesKey, 'target'>;
  readonly value: string;
  readonly x: number;
  readonly y: number;
};

const series = [
  {
    id: 'target',
    label: 'Cel okresu',
  },
  {
    id: 'actual',
    label: 'Wykonanie',
  },
  {
    id: 'forecast',
    label: 'Prognoza',
  },
] as const;

const points: readonly ChartPoint[] = [
  {
    id: 'actual-week-1',
    label: 'Tydz. 1',
    note: 'Powyżej tempa bazowego.',
    series: 'actual',
    value: '18 900 zł',
    x: 56,
    y: 194,
  },
  {
    id: 'actual-week-2',
    label: 'Tydz. 2',
    note: 'Utrzymany wzrost kumulacji.',
    series: 'actual',
    value: '39 200 zł',
    x: 206,
    y: 138,
  },
  {
    id: 'actual-week-3',
    label: 'Tydz. 3',
    note: 'Tempo powyżej planu.',
    series: 'actual',
    value: '58 400 zł',
    x: 356,
    y: 82,
  },
  {
    id: 'actual-now',
    label: 'Teraz',
    note: 'Aktualnie 108,6% planu.',
    series: 'actual',
    value: '76 033 zł',
    x: 506,
    y: 42,
  },
  {
    id: 'forecast-end',
    label: 'Koniec',
    note: 'Prognoza 111,2% celu.',
    series: 'forecast',
    value: '77 814 zł',
    x: 670,
    y: 30,
  },
];

const initialVisibleSeries: Record<SeriesKey, boolean> = {
  actual: true,
  forecast: true,
  target: true,
};

function resolveTooltipX(point: ChartPoint): number {
  return point.x > 520 ? point.x - 198 : point.x + 18;
}

function resolveTooltipY(point: ChartPoint): number {
  return point.y < 86 ? point.y + 22 : point.y - 76;
}

export function CommandCenterPlanTrajectoryChart() {
  const [visibleSeries, setVisibleSeries] = useState(initialVisibleSeries);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const hoverCloseRef = useRef<number | null>(null);

  const activePoint = points.find((point) => (
    point.id === hoveredPointId && visibleSeries[point.series]
  )) ?? null;

  function clearHoverClose() {
    if (hoverCloseRef.current !== null) {
      window.clearTimeout(hoverCloseRef.current);
      hoverCloseRef.current = null;
    }
  }

  function showHoverPoint(pointId: string) {
    clearHoverClose();
    setHoveredPointId(pointId);
  }

  function scheduleHoverClose() {
    clearHoverClose();

    hoverCloseRef.current = window.setTimeout(() => {
      setHoveredPointId(null);
      hoverCloseRef.current = null;
    }, 320);
  }

  function toggleSeries(seriesKey: SeriesKey) {
    setVisibleSeries((current) => ({
      ...current,
      [seriesKey]: !current[seriesKey],
    }));
    setHoveredPointId(null);
  }

  return (
    <>
      <div
        aria-label="Serie wykresu trajektorii"
        className="pd-command-plan-trajectory__legend"
      >
        {series.map((item) => (
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
          aria-label="Interaktywny wykres trajektorii celu, wykonania i prognozy"
          className="pd-command-plan-trajectory__svg"
          role="img"
          viewBox="0 0 720 260"
        >
          <g className="pd-command-plan-trajectory__grid">
            <line x1="56" x2="680" y1="216" y2="216" />
            <line x1="56" x2="680" y1="164" y2="164" />
            <line x1="56" x2="680" y1="112" y2="112" />
            <line x1="56" x2="680" y1="60" y2="60" />
          </g>

          <g className="pd-command-plan-trajectory__axis">
            <text x="56" y="240">Tydz. 1</text>
            <text x="206" y="240">Tydz. 2</text>
            <text x="356" y="240">Tydz. 3</text>
            <text x="506" y="240">Teraz</text>
            <text x="650" y="240">Koniec</text>
          </g>

          <polyline
            aria-hidden={!visibleSeries.target}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--target"
            data-visible={visibleSeries.target ? 'true' : 'false'}
            points="56,208 206,158 356,110 506,64 670,64"
          />

          <path
            aria-hidden={!visibleSeries.actual}
            className="pd-command-plan-trajectory__area pd-command-plan-trajectory__area--actual"
            data-visible={visibleSeries.actual ? 'true' : 'false'}
            d="M56 194 L206 138 L356 82 L506 42 L506 216 L56 216 Z"
          />

          <polyline
            aria-hidden={!visibleSeries.actual}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--actual"
            data-visible={visibleSeries.actual ? 'true' : 'false'}
            points="56,194 206,138 356,82 506,42"
          />

          <path
            aria-hidden={!visibleSeries.forecast}
            className="pd-command-plan-trajectory__area pd-command-plan-trajectory__area--forecast"
            data-visible={visibleSeries.forecast ? 'true' : 'false'}
            d="M506 42 L670 30 L670 216 L506 216 Z"
          />

          <polyline
            aria-hidden={!visibleSeries.forecast}
            className="pd-command-plan-trajectory__line pd-command-plan-trajectory__line--forecast"
            data-visible={visibleSeries.forecast ? 'true' : 'false'}
            points="506,42 670,30"
          />

          <g className="pd-command-plan-trajectory__points">
            {points.map((point) => (
              <g
                aria-label={`${point.label}: ${point.value}. ${point.note}`}
                className="pd-command-plan-trajectory__point"
                data-active={hoveredPointId === point.id ? 'true' : 'false'}
                data-series={point.series}
                data-visible={visibleSeries[point.series] ? 'true' : 'false'}
                key={point.id}
                onBlur={scheduleHoverClose}
                onClick={() => showHoverPoint(point.id)}
                onFocus={() => showHoverPoint(point.id)}
                onMouseEnter={() => showHoverPoint(point.id)}
                onMouseLeave={scheduleHoverClose}
                role="button"
                tabIndex={visibleSeries[point.series] ? 0 : -1}
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
              transform={`translate(${resolveTooltipX(activePoint)}, ${resolveTooltipY(activePoint)})`}
            >
              <rect height="66" rx="12" width="182" />
              <text className="pd-command-plan-trajectory__tooltip-label" x="14" y="22">
                {activePoint.label}
              </text>
              <text className="pd-command-plan-trajectory__tooltip-value" x="14" y="41">
                {activePoint.value}
              </text>
              <text className="pd-command-plan-trajectory__tooltip-note" x="14" y="57">
                {activePoint.note}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </>
  );
}
