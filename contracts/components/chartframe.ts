import type { BaseComponentProps, ChartSeries, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by design-system/components/ChartFrame/ChartFrame.tsx.
 */
export interface ChartFrameProps extends BaseComponentProps {
  title: string;
  subtitle: string | null;
  series: ChartSeries[];
  unit: string;
  dateRangeLabel: string;
  legendPosition: 'top' | 'bottom' | 'hidden';
  dataTableLabel: string;
}

export type ChartFrameEvent = ComponentEvent<{ type: 'chartframe'; value?: string | number | boolean | null }>;
