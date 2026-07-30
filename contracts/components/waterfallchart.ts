import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface WaterfallChartProps extends BaseComponentProps {
  items: Array<{ id: string; label: string; value: number; kind: 'start' | 'increase' | 'decrease' | 'total' }>;
  unit: string;
  showCumulative: boolean;
}

export type WaterfallChartEvent = ComponentEvent<{ type: 'waterfallchart'; value?: string | number | boolean | null }>;
