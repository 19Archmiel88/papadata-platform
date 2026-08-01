import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface BreadcrumbsProps extends BaseComponentProps {
  items: Array<{ id: string; label: string; href: string | null; current: boolean }>;
  maxVisible: number;
}

export type BreadcrumbsEvent = ComponentEvent<{ type: 'breadcrumbs'; value?: string | number | boolean | null }>;
