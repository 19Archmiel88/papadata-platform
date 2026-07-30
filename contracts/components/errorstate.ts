import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ErrorStateProps extends BaseComponentProps {
  errorCode: string;
  title: string;
  message: string;
  correlationId: string | null;
  recoverable: boolean;
  retryActionId: string | null;
}

export type ErrorStateEvent = ComponentEvent<{ type: 'errorstate'; value?: string | number | boolean | null }>;
