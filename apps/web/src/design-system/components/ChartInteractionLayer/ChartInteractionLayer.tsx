import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  useId,
} from 'react';

import { Button, TextAction } from '../Button';
import { joinClassNames } from '../Field/fieldUtils';
import './chart-interaction-layer.css';

export type ChartInteractionFilter = {
  readonly description?: string;
  readonly id: string;
  readonly label: string;
};

export type ChartInteractionPoint = {
  readonly detail: string;
  readonly drillDownLabel?: string;
  readonly filterId?: string;
  readonly id: string;
  readonly label: string;
  readonly seriesLabel: string;
  readonly valueLabel: string;
};

export type ChartInteractionLayerLabels = {
  readonly crossFilter: string;
  readonly dateRange: string;
  readonly drillDown: string;
  readonly emptySelection: string;
  readonly filters: string;
  readonly reset: string;
  readonly selection: string;
  readonly tooltip: string;
};

export type ChartInteractionLayerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> & {
  readonly activeFilterId: string;
  readonly children: ReactNode;
  readonly dateRangeLabel: string;
  readonly description?: string | null;
  readonly filters: readonly ChartInteractionFilter[];
  readonly labels?: Partial<ChartInteractionLayerLabels>;
  readonly onDrillDown?: ((point: ChartInteractionPoint) => void) | null;
  readonly onFilterChange: (filterId: string) => void;
  readonly onPointSelect: (pointId: string) => void;
  readonly onReset: () => void;
  readonly points: readonly ChartInteractionPoint[];
  readonly selectedPointId: string;
  readonly title: string;
};

const defaultLabels: ChartInteractionLayerLabels = {
  crossFilter: 'Filtrowanie krzyżowe',
  dateRange: 'Zakres dat',
  drillDown: 'Przejdź w szczegóły',
  emptySelection: 'Brak punktów interakcji',
  filters: 'Filtry wykresu',
  reset: 'Resetuj',
  selection: 'Wybór punktu lub serii',
  tooltip: 'Podpowiedź danych',
};

export function ChartInteractionLayer({
  activeFilterId,
  children,
  className,
  dateRangeLabel,
  description = null,
  filters,
  labels,
  onDrillDown = null,
  onFilterChange,
  onPointSelect,
  onReset,
  points,
  selectedPointId,
  title,
  ...props
}: ChartInteractionLayerProps) {
  const titleId = useId();
  const tooltipId = useId();
  const resolvedLabels: ChartInteractionLayerLabels = {
    ...defaultLabels,
    ...labels,
  };
  const emptyPoint: ChartInteractionPoint = {
    detail: resolvedLabels.emptySelection,
    id: 'empty-selection',
    label: resolvedLabels.emptySelection,
    seriesLabel: resolvedLabels.emptySelection,
    valueLabel: '-',
  };
  const hasPoints = points.length > 0;
  const selectedPoint = points.find((point) => point.id === selectedPointId)
    ?? points[0]
    ?? emptyPoint;
  const activeFilter = filters.find((filter) => filter.id === activeFilterId)
    ?? filters[0];

  return (
    <div
      {...props}
      aria-labelledby={titleId}
      className={joinClassNames(
        'pd-chart-interaction-layer',
        className,
      )}
      data-component="chart-interaction-layer"
      role="group"
    >
      <header className="pd-chart-interaction-layer__header">
        <div>
          <h3 id={titleId}>{title}</h3>

          {description ? (
            <p>{description}</p>
          ) : null}
        </div>

        <dl className="pd-chart-interaction-layer__meta">
          <div>
            <dt>{resolvedLabels.dateRange}</dt>
            <dd>{dateRangeLabel}</dd>
          </div>

          <div>
            <dt>{resolvedLabels.crossFilter}</dt>
            <dd>{activeFilter?.label ?? 'Wszystkie dane'}</dd>
          </div>
        </dl>
      </header>

      <div
        aria-label={resolvedLabels.filters}
        className="pd-chart-interaction-layer__filters"
        role="group"
      >
        {filters.map((filter) => (
          <Button
            aria-label={filter.description ?? filter.label}
            aria-pressed={filter.id === activeFilterId}
            className="pd-chart-interaction-layer__filter-button"
            data-active={filter.id === activeFilterId ? 'true' : undefined}
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            size="small"
            variant={filter.id === activeFilterId ? 'secondary' : 'ghost'}
          >
            {filter.label}
          </Button>
        ))}

        <TextAction
          className="pd-chart-interaction-layer__reset-action"
          onClick={onReset}
          size="small"
          tone="muted"
        >
          {resolvedLabels.reset}
        </TextAction>
      </div>

      <div className="pd-chart-interaction-layer__body">
        <div className="pd-chart-interaction-layer__visualization">
          {children}
        </div>

        <div
          className="pd-chart-interaction-layer__panel"
          data-status={hasPoints ? 'ready' : 'empty'}
        >
          <div
            aria-live="polite"
            className="pd-chart-interaction-layer__tooltip"
            id={tooltipId}
            role="tooltip"
          >
            <span>{resolvedLabels.tooltip}</span>
            <span className="pd-chart-interaction-layer__tooltip-value">
              {selectedPoint.seriesLabel}: {selectedPoint.valueLabel}
            </span>
            <p>{selectedPoint.detail}</p>
          </div>

          <div
            aria-label={resolvedLabels.selection}
            className="pd-chart-interaction-layer__selection"
            role="group"
          >
            {hasPoints ? (
              points.map((point) => (
                <Button
                  aria-describedby={tooltipId}
                  aria-pressed={point.id === selectedPoint.id}
                  className="pd-chart-interaction-layer__point-button"
                  data-active={point.id === selectedPoint.id ? 'true' : undefined}
                  fullWidth
                  key={point.id}
                  onClick={() => onPointSelect(point.id)}
                  onFocus={() => onPointSelect(point.id)}
                  onMouseEnter={() => onPointSelect(point.id)}
                  size="small"
                  variant="ghost"
                >
                  <span>{point.label}</span>
                  <span className="pd-chart-interaction-layer__point-value">
                    {point.valueLabel}
                  </span>
                </Button>
              ))
            ) : (
              <p
                className="pd-chart-interaction-layer__empty"
                data-state="empty-points"
              >
                {resolvedLabels.emptySelection}
              </p>
            )}
          </div>

          {onDrillDown && hasPoints ? (
            <TextAction
              onClick={() => onDrillDown(selectedPoint)}
              size="small"
            >
              {selectedPoint.drillDownLabel ?? resolvedLabels.drillDown}
            </TextAction>
          ) : null}
        </div>
      </div>
    </div>
  );
}
