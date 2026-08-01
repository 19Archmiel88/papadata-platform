import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface CorrelationChartProps extends BaseComponentProps {
  xLabel: string;
  yLabel: string;
  points: Array<{ id: string; x: number; y: number; label: string }>;
  correlation: number | null;
  trendline: boolean;
}

export type CorrelationChartEvent = ComponentEvent<{ type: 'correlationchart'; value?: string | number | boolean | null }>;
