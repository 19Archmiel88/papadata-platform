import type {
  BaseComponentProps,
  ChartSeries,
  ComponentEvent,
} from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by design-system/components/TrendChart/TrendChart.tsx.
 */
export interface TrendChartProps extends BaseComponentProps {
  series: ChartSeries[];
  baseline: number | null;
  showPoints: boolean;
  curve: 'linear' | 'monotone' | 'step';
  unit: string;
}

export type TrendChartEvent = ComponentEvent<{
  type: 'trendchart';
  value?: string | number | boolean | null;
}>;
