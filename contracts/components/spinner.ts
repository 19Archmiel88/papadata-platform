import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SpinnerProps extends BaseComponentProps {
  size: number;
  label: string;
  delayMs: number;
}

export type SpinnerEvent = ComponentEvent<{ type: 'spinner'; value?: string | number | boolean | null }>;
