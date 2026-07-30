import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface MenuProps extends BaseComponentProps {
  open: boolean;
  items: Array<{ id: string; label: string; disabled?: boolean; destructive?: boolean; shortcut?: string }>;
  activeItemId: string | null;
  placement: 'bottom-start' | 'bottom-end' | 'right-start';
}

export type MenuEvent = ComponentEvent<{ type: 'menu'; value?: string | number | boolean | null }>;
