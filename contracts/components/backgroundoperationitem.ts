import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface BackgroundOperationItemProps extends BaseComponentProps {
  operationId: string;
  title: string;
  progress: number | null;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string | null;
  errorCode: string | null;
}

export type BackgroundOperationItemEvent = ComponentEvent<{ type: 'backgroundoperationitem'; value?: string | number | boolean | null }>;
