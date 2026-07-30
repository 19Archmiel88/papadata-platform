import type { BaseComponentProps, ChartSeries, ComponentEvent } from '../component-shared';

export interface ComparisonChartProps extends BaseComponentProps {
  baseline: ChartSeries;
  comparison: ChartSeries;
  comparisonLabel: string;
  deltaMode: 'absolute' | 'percent';
}

export type ComparisonChartEvent = ComponentEvent<{ type: 'comparisonchart'; value?: string | number | boolean | null }>;
