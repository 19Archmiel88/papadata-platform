import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface DateRangePickerProps extends BaseComponentProps {
  from: string | null;
  to: string | null;
  preset: 'today' | 'last7d' | 'last30d' | 'last90d' | 'monthToDate' | 'custom';
  minDate: string | null;
  maxDate: string | null;
}

export type DateRangePickerEvent = ComponentEvent<{ type: 'daterangepicker'; value?: string | number | boolean | null }>;
