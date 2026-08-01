import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface PaginationProps extends BaseComponentProps {
  page: number;
  pageSize: number;
  total: number | null;
  pageSizeOptions: number[];
}

export type PaginationEvent = ComponentEvent<{ type: 'pagination'; value?: string | number | boolean | null }>;
