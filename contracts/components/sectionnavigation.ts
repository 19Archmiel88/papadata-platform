import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SectionNavigationProps extends BaseComponentProps {
  items: Array<{ id: string; label: string; href: string; badge?: string }>;
  activeId: string;
  orientation: 'horizontal' | 'vertical';
}

export type SectionNavigationEvent = ComponentEvent<{ type: 'sectionnavigation'; value?: string | number | boolean | null }>;
