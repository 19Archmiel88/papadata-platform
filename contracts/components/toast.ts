import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ToastProps extends BaseComponentProps {
  toastId: string;
  title: string | null;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'critical';
  durationMs: number | null;
  actionId: string | null;
}

export type ToastEvent = ComponentEvent<{ type: 'toast'; value?: string | number | boolean | null }>;
