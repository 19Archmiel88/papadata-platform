import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import { Icon } from '../../icons';
import type {
  AnalyticsAction,
  AnalyticsDataState,
} from '../Analytics';
import {
  analyticsStateHasRenderableData,
  resolveAnalyticsDataStateTone,
} from '../Analytics';
import { TextAction } from '../Button';
import { joinClassNames } from '../Field/fieldUtils';
import { Skeleton } from '../Skeleton';
import { StatusBadge } from '../StatusBadge';
import './chart-frame.css';

export type ChartFrameLabels = {
  readonly dataStatus: string;
  readonly freshness: string;
  readonly insight: string;
  readonly source: string;
};

const defaultChartFrameLabels: ChartFrameLabels = {
  dataStatus: 'Status danych',
  freshness: 'Świeżość',
  insight: 'Wniosek',
  source: 'Źródło',
};

export type ChartFrameProps = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'title'
> & {
  readonly actions?: ReactNode;
  readonly alternativeTable?: ReactNode;
  readonly alternativeTableLabel?: string;
  readonly annotation?: ReactNode;
  readonly businessQuestion: string;
  readonly description?: string | null;
  readonly filters?: ReactNode;
  readonly freshnessLabel?: string | null;
  readonly legend?: ReactNode;
  readonly labels?: Partial<ChartFrameLabels>;
  readonly papaAction?: AnalyticsAction | null;
  readonly rangeLabel?: string | null;
  readonly sourceLabel?: string | null;
  readonly stateAction?: AnalyticsAction | null;
  readonly stateMessage?: string | null;
  readonly status: AnalyticsDataState;
  readonly statusLabel: string;
  readonly summary?: ReactNode;
  readonly title: string;
  readonly visualization?: ReactNode;
  readonly visualizationLabel: string;
};

function isCriticalState(status: AnalyticsDataState): boolean {
  return status === 'providerError' || status === 'conflict';
}

export const ChartFrame = forwardRef<HTMLElement, ChartFrameProps>(
  function ChartFrame(
    {
      actions,
      alternativeTable,
      alternativeTableLabel = 'Tabela danych',
      annotation,
      businessQuestion,
      className,
      description = null,
      filters,
      freshnessLabel = null,
      legend,
      labels,
      papaAction = null,
      rangeLabel = null,
      sourceLabel = null,
      stateAction = null,
      stateMessage = null,
      status,
      statusLabel,
      summary,
      title,
      visualization,
      visualizationLabel,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const descriptionId = useId();

    const resolvedLabels: ChartFrameLabels = {
      ...defaultChartFrameLabels,
      ...labels,
    };

    const hasData = analyticsStateHasRenderableData(status);
    const isProcessing = status === 'processing';
    const tone = resolveAnalyticsDataStateTone(status);
    const hasToolbar = Boolean(filters || actions || rangeLabel);
    const criticalState = isCriticalState(status);

    return (
      <section
        {...props}
        ref={ref}
        aria-busy={isProcessing || undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        className={joinClassNames(
          'pd-chart-frame',
          className,
        )}
        data-data-state={status}
      >
        <header className="pd-chart-frame__header">
          <div className="pd-chart-frame__heading">
            <span className="pd-chart-frame__eyebrow">
              {businessQuestion}
            </span>

            <h3 id={titleId}>
              {title}
            </h3>

            {description ? (
              <p id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>

          <StatusBadge
            status={resolvedLabels.dataStatus}
            text={statusLabel}
            tone={tone}
          />
        </header>

        {sourceLabel || freshnessLabel ? (
          <dl className="pd-chart-frame__metadata">
            {sourceLabel ? (
              <div>
                <dt>{resolvedLabels.source}</dt>
                <dd>{sourceLabel}</dd>
              </div>
            ) : null}

            {freshnessLabel ? (
              <div>
                <dt>{resolvedLabels.freshness}</dt>
                <dd>{freshnessLabel}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {hasToolbar ? (
          <div className="pd-chart-frame__toolbar">
            {filters ? (
              <div className="pd-chart-frame__filters">
                {filters}
              </div>
            ) : null}

            {rangeLabel ? (
              <span className="pd-chart-frame__range">
                {rangeLabel}
              </span>
            ) : null}

            {actions ? (
              <div className="pd-chart-frame__actions">
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}

        {isProcessing ? (
          <div
            aria-label={statusLabel}
            className="pd-chart-frame__loading"
            role="status"
          >
            <div className="pd-chart-frame__loading-toolbar">
              <Skeleton
                animated
                height="2rem"
                lines={1}
                shape="rect"
                width="10rem"
              />

              <Skeleton
                animated
                height="2rem"
                lines={1}
                shape="rect"
                width="7rem"
              />
            </div>

            <Skeleton
              animated
              height="12rem"
              lines={1}
              shape="rect"
              width="100%"
            />

            <div className="pd-chart-frame__loading-summary">
              <Skeleton
                animated
                height="0.8rem"
                lines={1}
                shape="text"
                width="34%"
              />

              <Skeleton
                animated
                height="0.9rem"
                lines={2}
                shape="text"
                width="78%"
              />
            </div>
          </div>
        ) : hasData && visualization ? (
          <figure className="pd-chart-frame__figure">
            <div
              aria-label={visualizationLabel}
              className="pd-chart-frame__visualization"
              role="group"
            >
              {visualization}

              {annotation ? (
                <div className="pd-chart-frame__annotation">
                  {annotation}
                </div>
              ) : null}
            </div>

            {legend ? (
              <figcaption className="pd-chart-frame__legend">
                {legend}
              </figcaption>
            ) : null}
          </figure>
        ) : (
          <div
            aria-live={criticalState ? 'assertive' : 'polite'}
            className="pd-chart-frame__state"
            role={criticalState ? 'alert' : 'status'}
          >
            <strong>{statusLabel}</strong>

            <p>
              {stateMessage
                ?? 'Dane nie są obecnie dostępne dla tej wizualizacji.'}
            </p>

            {stateAction ? (
              <TextAction
                onClick={stateAction.onAction}
                size="small"
              >
                {stateAction.label}
              </TextAction>
            ) : null}
          </div>
        )}

        {summary && hasData ? (
          <div className="pd-chart-frame__summary">
            <span>{resolvedLabels.insight}</span>
            <div>{summary}</div>
          </div>
        ) : null}

        {alternativeTable && hasData ? (
          <details className="pd-chart-frame__alternative">
            <summary>
              <Icon
                decorative
                name="data"
                size={16}
              />

              <span>{alternativeTableLabel}</span>
            </summary>

            <div className="pd-chart-frame__alternative-content">
              {alternativeTable}
            </div>
          </details>
        ) : null}

        {papaAction ? (
          <footer className="pd-chart-frame__footer">
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
          </footer>
        ) : null}
      </section>
    );
  },
);

ChartFrame.displayName = 'ChartFrame';