import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface TabsProps extends BaseComponentProps {
  items: Array<{ id: string; label: string; disabled?: boolean; badge?: string }>;
  activeId: string;
  activation: 'automatic' | 'manual';
  orientation: 'horizontal' | 'vertical';
}

export type TabsEvent = ComponentEvent<{ type: 'tabs'; value?: string | number | boolean | null }>;
