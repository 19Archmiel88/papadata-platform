import type { BaseComponentProps, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract for a button-like inline command.
 * Navigation is owned by LinkAction, not TextAction.
 */
export interface TextActionProps extends BaseComponentProps {
  text: string;
  size: 'small' | 'medium';
  tone: 'default' | 'muted' | 'danger';
}

export type TextActionEvent = ComponentEvent<{ type: 'textaction'; value?: string | number | boolean | null }>;
