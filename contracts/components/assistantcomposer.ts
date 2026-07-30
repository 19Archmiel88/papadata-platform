import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface AssistantComposerProps extends BaseComponentProps {
  value: string;
  placeholder: string;
  attachments: Array<{ id: string; name: string; size: number }>;
  contextItemIds: string[];
  submitting: boolean;
}

export type AssistantComposerEvent = ComponentEvent<{ type: 'assistantcomposer'; value?: string | number | boolean | null }>;
