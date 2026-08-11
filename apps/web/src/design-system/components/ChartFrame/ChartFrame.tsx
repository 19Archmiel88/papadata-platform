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
  analyticsStateIsLoading,
  resolveAnalyticsDataStateTone,
} from '../Analytics';
import { TextAction } from '../Button';
import { ChartDataState } from '../ChartDataState';
import { joinClassNames } from '../Field/fieldUtils';
import { StatusBadge } from '../StatusBadge';
import './chart-frame.css';

export type ChartFrameLabels = {
  readonly dataStatus: string;
  readonly freshness: string;
  readonly insight: string;
  readonly range: string;
  readonly source: string;
};

const defaultChartFrameLabels: ChartFrameLabels = {
  dataStatus: 'Status danych',
  freshness: 'Świeżość',
  insight: 'Wniosek',
  range: 'Zakres',
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
    const isProcessing = analyticsStateIsLoading(status);
    const tone = resolveAnalyticsDataStateTone(status);
    const hasContext = Boolean(
      sourceLabel
      || freshnessLabel
      || rangeLabel,
    );
    const hasToolbar = Boolean(filters || actions);
    const hasAlternativeTable = Boolean(alternativeTable && hasData);
    const hasRecommendationLayer = Boolean(annotation && hasData);
    const hasAssistantLayer = Boolean((summary && hasData) || papaAction);
    const hasSupportLayer = hasAssistantLayer || hasRecommendationLayer;
    const assistantContext = [
      sourceLabel,
      rangeLabel,
      freshnessLabel,
    ].filter(Boolean).join(' · ');

    return (
      <div
        className="pd-f0-depth-stage pd-chart-frame-stage"
        data-canvas-root="chart-frame"
        data-has-assistant={hasSupportLayer ? 'true' : undefined}
      >
        <div className="pd-f0-depth-stage__canvas pd-chart-frame-canvas">
          <div
            className="pd-f0-depth-stage__base pd-chart-frame-canvas__base"
            data-shadow="none"
          >
            <section
              {...props}
              ref={ref}
              aria-busy={isProcessing || undefined}
              aria-describedby={description ? descriptionId : undefined}
              aria-labelledby={titleId}
              className={joinClassNames(
                'pd-chart-frame',
                'pd-f0-depth-stage__data-surface',
                className,
              )}
              data-data-state={status}
              data-shadow="none"
              data-surface="data"
              data-visualization-surface="chartframe"
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

                <div className="pd-chart-frame__side">
                  <StatusBadge
                    className="pd-chart-frame__status"
                    status={resolvedLabels.dataStatus}
                    text={statusLabel}
                    tone={tone}
                  />
                </div>

                {hasContext ? (
                  <dl className="pd-chart-frame__metadata">
                    {sourceLabel ? (
                      <div data-field="source">
                        <dt>{resolvedLabels.source}</dt>
                        <dd>{sourceLabel}</dd>
                      </div>
                    ) : null}

                    {freshnessLabel ? (
                      <div data-field="freshness">
                        <dt>{resolvedLabels.freshness}</dt>
                        <dd>{freshnessLabel}</dd>
                      </div>
                    ) : null}

                    {rangeLabel ? (
                      <div data-field="range">
                        <dt>{resolvedLabels.range}</dt>
                        <dd>{rangeLabel}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </header>

              {hasToolbar ? (
                <div className="pd-chart-frame__toolbar">
                  {filters ? (
                    <div className="pd-chart-frame__filters">
                      {filters}
                    </div>
                  ) : null}

                  {actions ? (
                    <div className="pd-chart-frame__actions">
                      {actions}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {hasData && visualization ? (
                <figure className="pd-chart-frame__figure">
                  <div
                    aria-label={visualizationLabel}
                    className="pd-chart-frame__visualization"
                    role="group"
                  >
                    {visualization}
                  </div>

                  {legend ? (
                    <figcaption className="pd-chart-frame__legend">
                      {legend}
                    </figcaption>
                  ) : null}
                </figure>
              ) : (
                <ChartDataState
                  action={stateAction}
                  className="pd-chart-frame__state"
                  message={stateMessage}
                  state={status}
                  title={statusLabel}
                />
              )}
            </section>

            {hasAlternativeTable ? (
              <div
                className="pd-chart-frame-canvas__alternative"
              >
                <details className="pd-chart-frame__alternative">
                  <summary
                    className="pd-inline-action pd-inline-action--small"
                    data-action-kind="disclosure"
                    data-size="small"
                  >
                    <span
                      className="pd-inline-action__content"
                      data-slot="activity-line-owner"
                    >
                      <span className="pd-inline-action__icon">
                        <Icon
                          decorative
                          name="data"
                          size={16}
                        />
                      </span>

                      <span className="pd-inline-action__label">
                        {alternativeTableLabel}
                      </span>

                      <span
                        aria-hidden="true"
                        className="pd-inline-action__activity-line"
                        data-slot="activity-line"
                      />
                    </span>
                  </summary>

                  <div className="pd-chart-frame__alternative-content">
                    {alternativeTable}
                  </div>
                </details>
              </div>
            ) : null}

            {hasSupportLayer ? (
              <div
                className="pd-chart-frame-canvas__support"
                data-has-assistant={hasAssistantLayer ? 'true' : undefined}
                data-has-recommendation={hasRecommendationLayer ? 'true' : undefined}
              >
                {hasAssistantLayer ? (
                  <aside
                    aria-label="Papa Asystent"
                    className="pd-f0-depth-stage__assistant pd-chart-frame-canvas__assistant"
                    data-shadow="raised"
                  >
                    <header className="pd-f0-depth-stage__assistant-header">
                      <Icon
                        decorative
                        name="assistant"
                        size={16}
                      />
                      <div>
                        <span>Papa Asystent</span>
                        <strong>{resolvedLabels.insight}</strong>
                      </div>
                    </header>

                    {assistantContext ? (
                      <div className="pd-f0-depth-stage__assistant-context">
                        <span>Kontekst</span>
                        <strong>{assistantContext}</strong>
                      </div>
                    ) : null}

                    <div className="pd-f0-depth-stage__assistant-thread">
                      {summary && hasData ? (
                        <section>
                          <span>{resolvedLabels.insight}</span>
                          <div className="pd-chart-frame__summary">
                            {summary}
                          </div>
                        </section>
                      ) : null}
                    </div>

                    {papaAction ? (
                      <div className="pd-f0-depth-stage__assistant-composer">
                        <span>Zapytaj o widoczny zakres danych</span>
                        <TextAction
                          className="pd-chart-frame-canvas__assistant-action"
                          onClick={papaAction.onAction}
                          size="small"
                        >
                          {papaAction.label}
                        </TextAction>
                      </div>
                    ) : null}
                  </aside>
                ) : null}

                {hasRecommendationLayer ? (
                  <div
                    className="pd-f0-depth-stage__raised pd-chart-frame-canvas__recommendation"
                    data-shadow="raised"
                  >
                    <span>Panel rekomendacji</span>
                    <div className="pd-chart-frame__annotation">
                      {annotation}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

ChartFrame.displayName = 'ChartFrame';
