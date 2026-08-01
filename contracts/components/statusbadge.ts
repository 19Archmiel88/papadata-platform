import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface StatusBadgeProps extends BaseComponentProps {
  status: string;
  text: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'critical';
  icon: string | null;
}

export type StatusBadgeEvent = ComponentEvent<{ type: 'statusbadge'; value?: string | number | boolean | null }>;
