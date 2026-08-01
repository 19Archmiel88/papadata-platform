import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface PageHeaderProps extends BaseComponentProps {
  title: string;
  subtitle: string | null;
  breadcrumbs: Array<{ label: string; href: string | null }>;
  primaryActionId: string | null;
  secondaryActionIds: string[];
}

export type PageHeaderEvent = ComponentEvent<{ type: 'pageheader'; value?: string | number | boolean | null }>;
