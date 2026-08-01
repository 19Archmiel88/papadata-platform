import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface IconButtonProps extends BaseComponentProps {
  icon: string;
  tooltip: string;
  size: 'sm' | 'md' | 'lg';
  pressed: boolean | null;
  loading: boolean;
}

export type IconButtonEvent = ComponentEvent<{ type: 'iconbutton'; value?: string | number | boolean | null }>;
