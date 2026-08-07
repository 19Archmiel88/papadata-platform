import type { BaseComponentProps, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by design-system/components/Button/Button.tsx.
 */
export interface ButtonProps extends BaseComponentProps {
  text: string;
  type: 'button' | 'submit' | 'reset';
  size: 'small' | 'medium' | 'large';
  loading: boolean;
  startIcon: string | null;
  endIcon: string | null;
}

export type ButtonEvent = ComponentEvent<{ type: 'button'; value?: string | number | boolean | null }>;
