import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface PopoverProps extends BaseComponentProps {
  open: boolean;
  placement: 'top' | 'right' | 'bottom' | 'left';
  anchorId: string;
  modal: boolean;
}

export type PopoverEvent = ComponentEvent<{ type: 'popover'; value?: string | number | boolean | null }>;
