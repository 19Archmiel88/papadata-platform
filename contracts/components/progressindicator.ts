import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ProgressIndicatorProps extends BaseComponentProps {
  value: number | null;
  max: number;
  label: string;
  indeterminate: boolean;
  showValue: boolean;
}

export type ProgressIndicatorEvent = ComponentEvent<{ type: 'progressindicator'; value?: string | number | boolean | null }>;
