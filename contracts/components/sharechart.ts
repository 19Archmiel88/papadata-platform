import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ShareChartProps extends BaseComponentProps {
  segments: Array<{ id: string; label: string; value: number; percent: number }>;
  total: number;
  display: 'donut' | 'bar' | 'stacked';
}

export type ShareChartEvent = ComponentEvent<{ type: 'sharechart'; value?: string | number | boolean | null }>;
