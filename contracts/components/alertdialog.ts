import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface AlertDialogProps extends BaseComponentProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string | null;
  destructive: boolean;
}

export type AlertDialogEvent = ComponentEvent<{ type: 'alertdialog'; value?: string | number | boolean | null }>;
