import type {
  HTMLAttributes,
} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { joinClassNames } from '../Field/fieldUtils';
import './share-chart.css';

export type ShareChartDisplay =
  | 'donut'
  | 'bar'
  | 'stacked';

export type ShareChartSegment = {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly percent: number;
};

export type ShareChartLabels = {
  readonly legend: string;
  readonly other: string;
  readonly total: string;
  readonly value: string;
  readonly percent: string;
  readonly unavailable: string;
};

export type ShareChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly ariaLabel: string;
  readonly display?: ShareChartDisplay;
  readonly labels?: Partial<ShareChartLabels>;
  readonly maxSegments?: number;
  readonly minimumDonutSegmentPercent?: number;
  readonly percentFormatter?: ((value: number) => string) | null;
  readonly segments: readonly ShareChartSegment[];
  readonly total: number;
  readonly valueFormatter?: ((value: number) => string) | null;
};

type RuntimeSegment = ShareChartSegment & {
  readonly color: string;
  readonly dataKey: string;
  readonly percentLabel: string;
  readonly valueLabel: string;
};

const defaultLabels: ShareChartLabels = {
  legend: 'Segmenty udziału',
  other: 'Pozostałe',
  percent: 'Udział',
  total: 'Razem',
  unavailable: 'Brak segmentów do pokazania.',
  value: 'Wartość',
};

const seriesTokens = [
  'var(--pd-share-series-1)',
  'var(--pd-share-series-2)',
  'var(--pd-share-series-3)',
  'var(--pd-share-series-4)',
  'var(--pd-share-series-5)',
  'var(--pd-share-series-6)',
] as const;

function formatDefaultValue(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDefaultPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value / 100);
}

function resolveSeriesToken(index: number): string {
  return seriesTokens[
    index % seriesTokens.length
  ] ?? seriesTokens[0];
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const percent = Math.abs(value) <= 1
    ? value * 100
    : value;

  return Math.min(
    Math.max(percent, 0),
    100,
  );
}

function resolveTotal(
  segments: readonly ShareChartSegment[],
  total: number,
): number {
  if (
    Number.isFinite(total)
    && total > 0
  ) {
    return total;
  }

  return segments.reduce(
    (sum, segment) => (
      sum + (
        Number.isFinite(segment.value)
          ? Math.max(segment.value, 0)
          : 0
      )
    ),
    0,
  );
}

function normalizeSegments(
  segments: readonly ShareChartSegment[],
  total: number,
  formatValue: (value: number) => string,
  formatPercent: (value: number) => string,
  maxSegments: number,
): readonly RuntimeSegment[] {
  return segments
    .slice(0, Math.max(maxSegments, 1))
    .map((segment, index) => {
      const value = Number.isFinite(segment.value)
        ? Math.max(segment.value, 0)
        : 0;

      const fallbackPercent = total > 0
        ? (value / total) * 100
        : 0;

      const percent = Number.isFinite(segment.percent)
        ? clampPercent(segment.percent)
        : clampPercent(fallbackPercent);

      return {
        ...segment,
        dataKey: `segment${index}`,
        color: resolveSeriesToken(index),
        percent,
        percentLabel: formatPercent(percent),
        value,
        valueLabel: formatValue(value),
      };
    })
    .filter((segment) => (
      segment.value > 0
      || segment.percent > 0
    ));
}

function groupSmallDonutSegments(
  segments: readonly RuntimeSegment[],
  labels: ShareChartLabels,
  formatValue: (value: number) => string,
  formatPercent: (value: number) => string,
  minimumPercent: number,
): readonly RuntimeSegment[] {
  const threshold = Math.max(
    minimumPercent,
    0,
  );

  if (threshold <= 0) {
    return segments;
  }

  const visibleSegments = segments.filter((segment) => (
    segment.percent >= threshold
  ));

  const smallSegments = segments.filter((segment) => (
    segment.percent > 0
    && segment.percent < threshold
  ));

  if (smallSegments.length === 0) {
    return segments;
  }

  const otherValue = smallSegments.reduce(
    (sum, segment) => sum + segment.value,
    0,
  );

  const otherPercent = smallSegments.reduce(
    (sum, segment) => sum + segment.percent,
    0,
  );

  const otherIndex = visibleSegments.length;

  return [
    ...visibleSegments,
    {
      color: resolveSeriesToken(otherIndex),
      dataKey: `segment${otherIndex}`,
      id: 'other',
      label: labels.other,
      percent: otherPercent,
      percentLabel: formatPercent(otherPercent),
      value: otherValue,
      valueLabel: formatValue(otherValue),
    },
  ];
}

function buildStackRow(
  segments: readonly RuntimeSegment[],
): Record<string, number | string> {
  return segments.reduce<Record<string, number | string>>(
    (row, segment) => ({
      ...row,
      [segment.dataKey]: segment.percent,
    }),
    {
      label: 'total',
    },
  );
}

function ShareLegend({
  labels,
  segments,
}: {
  readonly labels: ShareChartLabels;
  readonly segments: readonly RuntimeSegment[];
}) {
  return (
    <ol
      aria-label={labels.legend}
      className="pd-share-chart__legend"
    >
      {segments.map((segment) => (
        <li key={segment.id}>
          <span
            aria-hidden="true"
            className="pd-share-chart__swatch"
            style={{
              background: segment.color,
            }}
          />
          <span className="pd-share-chart__legend-label">
            {segment.label}
          </span>
          <span className="pd-share-chart__legend-value">
            {segment.percentLabel}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ShareMeta({
  labels,
  segments,
}: {
  readonly labels: ShareChartLabels;
  readonly segments: readonly RuntimeSegment[];
}) {
  return (
    <dl className="pd-share-chart__meta">
      {segments.map((segment) => (
        <div key={segment.id}>
          <dt>{segment.label}</dt>
          <dd>
            <span>{segment.valueLabel}</span>
            <span>
              {labels.percent}
              {' '}
              {segment.percentLabel}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ShareChart({
  ariaLabel,
  className,
  display = 'donut',
  labels,
  maxSegments = 6,
  minimumDonutSegmentPercent = 3,
  percentFormatter = null,
  segments,
  total,
  valueFormatter = null,
  ...props
}: ShareChartProps) {
  const resolvedLabels: ShareChartLabels = {
    ...defaultLabels,
    ...labels,
  };

  const formatValue = (
    valueFormatter ?? formatDefaultValue
  );

  const formatPercent = (
    percentFormatter ?? formatDefaultPercent
  );

  const resolvedTotal = resolveTotal(
    segments,
    total,
  );

  const normalizedSegments = normalizeSegments(
    segments,
    resolvedTotal,
    formatValue,
    formatPercent,
    maxSegments,
  );

  const runtimeSegments = display === 'donut'
    ? groupSmallDonutSegments(
      normalizedSegments,
      resolvedLabels,
      formatValue,
      formatPercent,
      minimumDonutSegmentPercent,
    )
    : normalizedSegments;

  const hasData = runtimeSegments.length > 0;

  const stackRow = buildStackRow(
    runtimeSegments,
  );

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-share-chart',
        className,
      )}
      data-component="share-chart"
      data-display={display}
      data-series-count={runtimeSegments.length}
      data-single-segment={runtimeSegments.length === 1 ? 'true' : undefined}
      role="group"
    >
      {hasData ? (
        <>
          <div
            className="pd-share-chart__plot"
            data-display={display}
          >
            {display === 'donut' ? (
              <div className="pd-share-chart__donut">
                <ResponsiveContainer
                  debounce={80}
                  height="100%"
                  minWidth={0}
                  width="100%"
                >
                  <PieChart accessibilityLayer>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={runtimeSegments}
                      dataKey="percent"
                      innerRadius="58%"
                      isAnimationActive={false}
                      nameKey="label"
                      outerRadius="78%"
                      paddingAngle={1.4}
                      stroke="var(--pd-surface)"
                      strokeWidth={2}
                    >
                      {runtimeSegments.map((segment) => (
                        <Cell
                          fill={segment.color}
                          key={segment.id}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="pd-share-chart__donut-center">
                  <span>{resolvedLabels.total}</span>
                  <strong>{formatValue(resolvedTotal)}</strong>
                </div>
              </div>
            ) : null}

            {display === 'bar' ? (
              <>
                <div className="pd-share-chart__bar-chart">
                  <ResponsiveContainer
                    debounce={80}
                    height="100%"
                    minWidth={0}
                    width="100%"
                  >
                    <BarChart
                      accessibilityLayer
                      barCategoryGap="28%"
                      data={runtimeSegments}
                      layout="vertical"
                      margin={{
                        bottom: 8,
                        left: 2,
                        right: 36,
                        top: 8,
                      }}
                    >
                      <CartesianGrid
                        horizontal={false}
                        stroke="var(--pd-separator-subtle)"
                        strokeOpacity={0.72}
                        vertical
                      />
                      <XAxis
                        axisLine={false}
                        domain={[0, 100]}
                        tick={{
                          fill: 'var(--pd-text-secondary)',
                          fontSize: 11.5,
                        }}
                        tickFormatter={formatPercent}
                        tickLine={false}
                        tickMargin={10}
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
                      <Bar
                        dataKey="percent"
                        isAnimationActive={false}
                        maxBarSize={22}
                        radius={[0, 7, 7, 0]}
                        stroke="none"
                        strokeWidth={0}
                      >
                        {runtimeSegments.map((segment) => (
                          <Cell
                            fill={segment.color}
                            key={segment.id}
                          />
                        ))}
                        <LabelList
                          dataKey="percentLabel"
                          fill="var(--pd-text-secondary)"
                          fontSize={11}
                          offset={8}
                          position="right"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div
                  aria-hidden="true"
                  className="pd-share-chart__bar-list"
                >
                  {runtimeSegments.map((segment) => (
                    <div
                      className="pd-share-chart__bar-row"
                      key={segment.id}
                    >
                      <div className="pd-share-chart__bar-row-header">
                        <span>{segment.label}</span>
                        <strong>{segment.percentLabel}</strong>
                      </div>
                      <span className="pd-share-chart__bar-track">
                        <span
                          className="pd-share-chart__bar-fill"
                          style={{
                            background: segment.color,
                            inlineSize: `${segment.percent}%`,
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {display === 'stacked' ? (
              <div className="pd-share-chart__stacked-track">
                <ResponsiveContainer
                  debounce={80}
                  height="100%"
                  minWidth={0}
                  width="100%"
                >
                  <BarChart
                    accessibilityLayer
                    data={[stackRow]}
                    layout="vertical"
                    margin={{
                      bottom: 0,
                      left: 0,
                      right: 0,
                      top: 0,
                    }}
                  >
                    <XAxis
                      domain={[0, 100]}
                      hide
                      type="number"
                    />
                    <YAxis
                      dataKey="label"
                      hide
                      type="category"
                    />
                    {runtimeSegments.map((segment, index) => {
                      const isOnly = runtimeSegments.length === 1;
                      const isFirst = index === 0;
                      const isLast = index === runtimeSegments.length - 1;
                      const radius: number | [number, number, number, number] = isOnly
                        ? [8, 8, 8, 8]
                        : isFirst
                          ? [8, 0, 0, 8]
                          : isLast
                            ? [0, 8, 8, 0]
                            : 0;

                      return (
                        <Bar
                          barSize={7}
                          dataKey={segment.dataKey}
                          fill={segment.color}
                          isAnimationActive={false}
                          key={segment.id}
                          radius={radius}
                          stackId="share"
                          stroke="none"
                          strokeWidth={0}
                        />
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>

          <ShareMeta
            labels={resolvedLabels}
            segments={runtimeSegments}
          />

          <ShareLegend
            labels={resolvedLabels}
            segments={runtimeSegments}
          />
        </>
      ) : (
        <p
          className="pd-share-chart__empty"
          role="status"
        >
          {resolvedLabels.unavailable}
        </p>
      )}
    </div>
  );
}
