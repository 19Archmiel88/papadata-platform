import type { BaseComponentProps, ChartSeries, ComponentEvent } from '../component-shared';

export interface TrendChartProps extends BaseComponentProps {
  series: ChartSeries[];
  baseline: number | null;
  showPoints: boolean;
  curve: 'linear' | 'monotone' | 'step';
  unit: string;
}

export type TrendChartEvent = ComponentEvent<{ type: 'trendchart'; value?: string | number | boolean | null }>;
