import type { BaseComponentProps, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by design-system/components/Button/IconButton.tsx.
 */
export interface IconButtonProps extends BaseComponentProps {
  icon: string;
  label: string;
  size: 'small' | 'medium' | 'large';
  pressed: boolean | null;
  loading: boolean;
}

export type IconButtonEvent = ComponentEvent<{ type: 'iconbutton'; value?: string | number | boolean | null }>;
