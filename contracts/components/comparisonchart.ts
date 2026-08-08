import type {
  BaseComponentProps,
  ChartSeries,
  ComponentEvent,
} from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by
 * design-system/components/ComparisonChart/ComparisonChart.tsx.
 */
export interface ComparisonChartProps extends BaseComponentProps {
  baseline: ChartSeries;
  comparison: ChartSeries;
  comparisonLabel: string;
  deltaMode: 'absolute' | 'percent';
  additionalSeries?: ChartSeries[];
  benchmark?: number | null;
  presentation?: 'bar' | 'grouped' | 'ranking';
}

export type ComparisonChartEvent = ComponentEvent<{
  type: 'comparisonchart';
  value?: string | number | boolean | null;
}>;
