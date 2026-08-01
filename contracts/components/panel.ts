import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface PanelProps extends BaseComponentProps {
  title: string | null;
  padding: 'none' | 'sm' | 'md' | 'lg';
  bordered: boolean;
  collapsible: boolean;
  collapsed: boolean;
}

export type PanelEvent = ComponentEvent<{ type: 'panel'; value?: string | number | boolean | null }>;
