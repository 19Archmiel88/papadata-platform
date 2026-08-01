import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface InlineNoticeProps extends BaseComponentProps {
  title: string | null;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'critical';
  dismissible: boolean;
}

export type InlineNoticeEvent = ComponentEvent<{ type: 'inlinenotice'; value?: string | number | boolean | null }>;
