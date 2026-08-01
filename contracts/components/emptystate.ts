import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  message: string;
  illustration: string | null;
  primaryActionId: string | null;
  secondaryActionId: string | null;
}

export type EmptyStateEvent = ComponentEvent<{ type: 'emptystate'; value?: string | number | boolean | null }>;
