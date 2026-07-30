import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface MetricCardProps extends BaseComponentProps {
  metricId: string;
  title: string;
  value: number | null;
  formattedValue: string;
  delta: number | null;
  target: number | null;
  trend: 'up' | 'down' | 'flat' | 'unknown';
  unit: string;
}

export type MetricCardEvent = ComponentEvent<{ type: 'metriccard'; value?: string | number | boolean | null }>;
