import type { HTMLAttributes } from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import { Icon } from '../../icons';
import type {
  AnalyticsAction,
  AnalyticsDataState,
  AnalyticsSignalTone,
  AnalyticsTrendDirection,
} from '../Analytics';
import { resolveAnalyticsDataStateTone } from '../Analytics';
import { TextAction } from '../Button';
import { joinClassNames } from '../Field/fieldUtils';
import { Skeleton } from '../Skeleton';
import { StatusBadge } from '../StatusBadge';
import './metric-card.css';

export type MetricCardLabels = {
  readonly dataStatus: string;
  readonly deviation: string;
  readonly target: string;
};

const defaultMetricCardLabels: MetricCardLabels = {
  dataStatus: 'Status danych',
  deviation: 'Odchylenie',
  target: 'Cel',
};

export type MetricCardDepth =
  | 'default'
  | 'flat'
  | 'hero';

export type MetricCardDensity =
  | 'regular'
  | 'compact';

export type MetricCardEmphasis =
  | 'default'
  | 'alert'
  | 'recommendation';

export type MetricCardLayout =
  | 'default'
  | 'sparkline-aside';

export type MetricCardComparison = {
  readonly direction: AnalyticsTrendDirection;
  readonly label: string;
};

export type MetricCardProps = Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> & {
  readonly comparison?: MetricCardComparison | null;
  readonly definitionChangeLabel?: string | null;
  readonly density?: MetricCardDensity;
  readonly depth?: MetricCardDepth;
  readonly detailAction?: AnalyticsAction | null;
  readonly deviationLabel?: string | null;
  readonly emphasis?: MetricCardEmphasis;
  readonly freshnessLabel?: string | null;
  readonly helpText?: string | null;
  readonly label: string;
  readonly labels?: Partial<MetricCardLabels>;
  readonly layout?: MetricCardLayout;
  readonly metricId: string;
  readonly papaAction?: AnalyticsAction | null;
  readonly progressRatio?: number | null;
  readonly signal?: AnalyticsSignalTone;
  readonly sourceLabel?: string | null;
  readonly sparklinePoints?: readonly number[];
  readonly stateMessage?: string | null;
  readonly status: AnalyticsDataState;
  readonly statusLabel: string;
  readonly targetLabel?: string | null;
  readonly unit?: string | null;
  readonly value: string | null;
};

type SparklineCoordinate = readonly [
  x: number,
  y: number,
];

// Rotating a single up-right arrow reads more crafted than switching between
// three separate unicode glyphs (↗/↘/→), which render with inconsistent
// weight/alignment across platform fonts at this size. 0deg = up-right,
// 90deg clockwise = down-right, -45deg = flat/horizontal.
const trendGlyphRotationMap = {
  up: 0,
  down: 90,
  flat: -45,
  unknown: null,
} satisfies Record<AnalyticsTrendDirection, number | null>;

function TrendGlyph({
  direction,
}: {
  readonly direction: AnalyticsTrendDirection;
}) {
  const rotation = trendGlyphRotationMap[direction];

  if (rotation === null) {
    return <span aria-hidden="true">·</span>;
  }

  return (
    <svg
      aria-hidden="true"
      className="pd-metric-card__trend-glyph"
      focusable="false"
      style={{ transform: `rotate(${rotation}deg)` }}
      viewBox="0 0 12 12"
    >
      <path d="M2.25 9.75 9.75 2.25M9.75 2.25H4.75M9.75 2.25V7.25" />
    </svg>
  );
}

function buildSparklineCoordinates(
  points: readonly number[],
): readonly SparklineCoordinate[] | null {
  if (
    points.length < 2
    || points.some((point) => !Number.isFinite(point))
  ) {
    return null;
  }

  const width = 180;
  const height = 56;
  const padding = 4;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const isFlat = max === min;
  const range = isFlat ? 1 : max - min;

  const drawableWidth = width - padding * 2;
  const drawableHeight = height - padding * 2;
  const step = drawableWidth / (points.length - 1);

  return points.map((point, index) => {
    const x = padding + index * step;

    const ratio = isFlat
      ? 0.5
      : (point - min) / range;

    const y = height - padding - ratio * drawableHeight;

    return [x, y] as const;
  });
}

function MetricSparkline({
  points,
}: {
  readonly points: readonly number[];
}) {
  const coordinates = buildSparklineCoordinates(points);

  if (!coordinates) {
    return null;
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (!first || !last) {
    return null;
  }

  const polylinePoints = coordinates
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  const areaPath = [
    `M ${first[0]} 56`,
    ...coordinates.map(([x, y]) => `L ${x} ${y}`),
    `L ${last[0]} 56`,
    'Z',
  ].join(' ');

  return (
    <div
      aria-hidden="true"
      className="pd-metric-card__sparkline"
    >
      <svg
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 180 56"
      >
        <path
          className="pd-metric-card__sparkline-area"
          d={areaPath}
        />

        <polyline
          className="pd-metric-card__sparkline-line"
          points={polylinePoints}
        />
      </svg>
    </div>
  );
}

function MetricShadowBars() {
  return (
    <div
      aria-hidden="true"
      className="pd-metric-card__shadow-bars"
    >
      <span />
      <span />
      <span />
    </div>
  );
}

export const MetricCard = forwardRef<HTMLElement, MetricCardProps>(
  function MetricCard(
    {
      className,
      comparison = null,
      definitionChangeLabel = null,
      density = 'regular',
      depth = 'default',
      detailAction = null,
      deviationLabel = null,
      emphasis = 'default',
      freshnessLabel = null,
      helpText = null,
      label,
      labels,
      layout = 'default',
      metricId,
      papaAction = null,
      progressRatio = null,
      signal = 'neutral',
      sourceLabel = null,
      sparklinePoints = [],
      stateMessage = null,
      status,
      statusLabel,
      targetLabel = null,
      unit = null,
      value,
      ...props
    },
    ref,
  ) {
    const labelId = useId();
    const helpTextId = useId();
    const stateMessageId = useId();

    const resolvedLabels: MetricCardLabels = {
      ...defaultMetricCardLabels,
      ...labels,
    };

    const isProcessing = status === 'processing';
    const hasValue = value !== null && !isProcessing;
    const tone = resolveAnalyticsDataStateTone(status);
    const showStatusBadge = Boolean(statusLabel);
    const showSparkline = sparklinePoints.length > 1 && hasValue;
    const showBenchmarks = Boolean(
      hasValue && (targetLabel || deviationLabel),
    );
    const showMetadata = Boolean(
      sourceLabel
      || freshnessLabel
      || definitionChangeLabel,
    );
    const showActions = Boolean(detailAction || papaAction);
    const progressPercent = hasValue
      && progressRatio !== null
      && Number.isFinite(progressRatio)
      ? Math.min(100, Math.max(0, progressRatio * 100))
      : null;

    const describedBy = !hasValue && !isProcessing && stateMessage
      ? stateMessageId
      : undefined;

    const isHero = depth === 'hero';

    return (
      <article
        {...props}
        ref={ref}
        aria-busy={isProcessing || undefined}
        aria-describedby={describedBy}
        aria-labelledby={labelId}
        className={joinClassNames(
          'pd-metric-card',
          className,
        )}
        data-data-state={status}
        data-density={density}
        data-depth={depth}
        data-emphasis={emphasis}
        data-layout={layout}
        data-metric-id={metricId}
        data-signal={signal}
      >
        <header className="pd-metric-card__header">
          <span className="pd-metric-card__label-group">
            <span
              className="pd-metric-card__label"
              id={labelId}
            >
              {label}
            </span>

            {helpText ? (
              <span className="pd-metric-card__help">
                <button
                  aria-describedby={helpTextId}
                  aria-label={`Wyjaśnienie metryki: ${label}`}
                  className="pd-metric-card__help-trigger"
                  type="button"
                >
                  <Icon
                    decorative
                    name="help"
                    size={16}
                  />
                </button>

                <span
                  className="pd-metric-card__help-popover"
                  id={helpTextId}
                  role="tooltip"
                >
                  {helpText}
                </span>
              </span>
            ) : null}
          </span>

          {showStatusBadge ? (
            <StatusBadge
              status={resolvedLabels.dataStatus}
              text={statusLabel}
              tone={tone}
            />
          ) : null}
        </header>

        <div className="pd-metric-card__value-region">
          {isProcessing ? (
            <Skeleton
              animated
              height={isHero ? '3rem' : '2.4rem'}
              lines={1}
              shape="text"
              width={isHero ? '68%' : '72%'}
            />
          ) : (
            <p className="pd-metric-card__value">
              <span>{value ?? '—'}</span>

              {unit ? (
                <small>{unit}</small>
              ) : null}
            </p>
          )}

          {comparison && hasValue ? (
            <p
              className="pd-metric-card__comparison"
              data-direction={comparison.direction}
            >
              <span aria-hidden="true">
                <TrendGlyph direction={comparison.direction} />
              </span>

              <span>{comparison.label}</span>
            </p>
          ) : null}

          {!hasValue && !isProcessing && stateMessage ? (
            <p
              className="pd-metric-card__state-message"
              id={stateMessageId}
            >
              {stateMessage}
            </p>
          ) : null}
        </div>

        {progressPercent !== null ? (
          <div
            aria-hidden="true"
            className="pd-metric-card__progress"
          >
            <span
              className="pd-metric-card__progress-fill"
              style={{ inlineSize: `${progressPercent}%` }}
            />
          </div>
        ) : null}

        {showSparkline ? (
          <MetricSparkline points={sparklinePoints} />
        ) : null}

        {showBenchmarks ? (
          <dl className="pd-metric-card__benchmarks">
            {targetLabel ? (
              <div>
                <dt>{resolvedLabels.target}</dt>
                <dd>{targetLabel}</dd>
              </div>
            ) : null}

            {deviationLabel ? (
              <div>
                <dt>{resolvedLabels.deviation}</dt>
                <dd>{deviationLabel}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {showMetadata ? (
          <div className="pd-metric-card__metadata">
            {sourceLabel ? (
              <span>{sourceLabel}</span>
            ) : null}

            {freshnessLabel ? (
              <span>{freshnessLabel}</span>
            ) : null}

            {definitionChangeLabel ? (
              <span className="pd-metric-card__definition-change">
                {definitionChangeLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {showActions ? (
          <footer className="pd-metric-card__actions">
            {detailAction ? (
              <TextAction
                startIcon={(
                  <Icon
                    decorative
                    name="data"
                    size={16}
                  />
                )}
                onClick={detailAction.onAction}
                size="small"
                tone="muted"
              >
                {detailAction.label}
              </TextAction>
            ) : null}

            {papaAction ? (
              <TextAction
                startIcon={(
                  <Icon
                    decorative
                    name="assistant"
                    size={16}
                  />
                )}
                onClick={papaAction.onAction}
                size="small"
              >
                {papaAction.label}
              </TextAction>
            ) : null}
          </footer>
        ) : null}

        {isHero ? (
          <MetricShadowBars />
        ) : null}
      </article>
    );
  },
);

MetricCard.displayName = 'MetricCard';
