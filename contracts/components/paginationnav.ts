import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface PaginationNavProps extends BaseComponentProps {
  cursor: string | null;
  nextCursor: string | null;
  previousCursor: string | null;
  loading: boolean;
}

export type PaginationNavEvent = ComponentEvent<{ type: 'paginationnav'; value?: string | number | boolean | null }>;
