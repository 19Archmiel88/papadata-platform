import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface TooltipProps extends BaseComponentProps {
  content: string;
  placement: 'top' | 'right' | 'bottom' | 'left';
  delayMs: number;
  interactive: boolean;
}

export type TooltipEvent = ComponentEvent<{ type: 'tooltip'; value?: string | number | boolean | null }>;
