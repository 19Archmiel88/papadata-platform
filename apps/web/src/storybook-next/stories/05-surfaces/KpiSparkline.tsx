export type KpiSparklineTrend = 'up' | 'down' | 'flat';
export type KpiSparklineTone = 'positive' | 'negative' | 'neutral' | 'warning';

type KpiSparklineProps = {
  readonly points: readonly number[];
  readonly trend: KpiSparklineTrend;
  readonly tone: KpiSparklineTone;
};

const chartWidth = 128;
const chartHeight = 56;
const chartPadding = 6;
const plotWidth = chartWidth - chartPadding * 2;
const plotHeight = chartHeight - chartPadding * 2;

function scalePoint(
  point: number,
  index: number,
  points: readonly number[],
) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  const x =
    chartPadding +
    (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const y = range === 0
    ? chartPadding + plotHeight / 2
    : chartPadding + ((max - point) / range) * plotHeight;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

function linePath(points: readonly { readonly x: number; readonly y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function areaPath(points: readonly { readonly x: number; readonly y: number }[]) {
  const line = linePath(points);
  const lastPoint = points.at(-1);
  const firstPoint = points[0];

  if (!firstPoint || !lastPoint) {
    return '';
  }

  return `${line} L ${lastPoint.x} ${chartHeight - chartPadding} L ${firstPoint.x} ${chartHeight - chartPadding} Z`;
}

export function KpiSparkline({
  points,
  trend,
  tone,
}: KpiSparklineProps) {
  const sparklinePoints = points.length > 0 ? points : [0];
  const scaledPoints = sparklinePoints.map((point, index) => scalePoint(point, index, sparklinePoints));

  return (
    <div className="pd-s5-kpi-metric__sparkline" data-tone={tone} data-trend={trend} aria-hidden="true">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} focusable="false">
        <path className="pd-s5-kpi-sparkline__area" d={areaPath(scaledPoints)} />
        <path className="pd-s5-kpi-sparkline__line" d={linePath(scaledPoints)} />
      </svg>
    </div>
  );
}
