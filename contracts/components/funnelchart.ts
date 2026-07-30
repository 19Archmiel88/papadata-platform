import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface FunnelChartProps extends BaseComponentProps {
  steps: Array<{ id: string; label: string; value: number; conversionRate: number | null }>;
  orientation: 'vertical' | 'horizontal';
  showDropoff: boolean;
}

export type FunnelChartEvent = ComponentEvent<{ type: 'funnelchart'; value?: string | number | boolean | null }>;
