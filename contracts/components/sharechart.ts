import type {
  BaseComponentProps,
  ComponentEvent,
} from '../component-shared';

/**
 * Orchestration contract for screens, fixtures and product flows.
 *
 * Runtime React API is owned by:
 * apps/web/src/design-system/components/ShareChart/ShareChart.tsx
 */
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

export interface ShareChartProps extends BaseComponentProps {
  readonly display: ShareChartDisplay;
  readonly segments: readonly ShareChartSegment[];
  readonly total: number;
}

export type ShareChartEvent = ComponentEvent<{
  type: 'sharechart';
  value?: string | number | boolean | null;
}>;
