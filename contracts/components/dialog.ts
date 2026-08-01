import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface DialogProps extends BaseComponentProps {
  open: boolean;
  title: string;
  description: string | null;
  modal: boolean;
  closeOnEscape: boolean;
}

export type DialogEvent = ComponentEvent<{ type: 'dialog'; value?: string | number | boolean | null }>;
