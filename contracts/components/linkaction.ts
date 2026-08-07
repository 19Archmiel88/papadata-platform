import type { BaseComponentProps, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract for semantic navigation rendered by LinkAction.
 * Runtime React props are owned by design-system/components/Button/LinkAction.tsx.
 */
export interface LinkActionProps extends BaseComponentProps {
  text: string;
  href: string;
  external: boolean;
  size: 'small' | 'medium';
  tone: 'default' | 'muted' | 'danger';
}

export type LinkActionEvent = ComponentEvent<{ type: 'linkaction'; href: string }>;
