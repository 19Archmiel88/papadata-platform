import type { BaseComponentProps, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract for chart interactions and filters.
 * Runtime React props are owned by design-system/components/ChartInteractionLayer/ChartInteractionLayer.tsx.
 */
export interface ChartInteractionFilter {
  readonly id: string;
  readonly label: string;
  readonly description: string | null;
}

export interface ChartInteractionPoint {
  readonly id: string;
  readonly label: string;
  readonly seriesLabel: string;
  readonly valueLabel: string;
  readonly detail: string;
  readonly filterId: string | null;
  readonly drillDownLabel: string | null;
}

export interface ChartInteractionLayerProps extends BaseComponentProps {
  readonly activeFilterId: string;
  readonly dateRangeLabel: string;
  readonly filters: readonly ChartInteractionFilter[];
  readonly points: readonly ChartInteractionPoint[];
  readonly selectedPointId: string;
  readonly supportsKeyboardFocus: boolean;
  readonly supportsHover: boolean;
  readonly supportsTooltip: boolean;
  readonly supportsSelection: boolean;
  readonly supportsDrillDown: boolean;
  readonly supportsCrossFiltering: boolean;
}

export type ChartInteractionLayerEvent = ComponentEvent<{
  type:
    | 'chart-filter-change'
    | 'chart-point-select'
    | 'chart-reset'
    | 'chart-drill-down';
  value?: string | boolean | null;
}>;
