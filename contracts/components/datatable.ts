import type { BaseComponentProps, ComponentEvent, DataColumn, DataRow } from '../component-shared';

export interface DataTableProps extends BaseComponentProps {
  columns: DataColumn[];
  rows: DataRow[];
  rowCount: number;
  sort: { columnId: string; direction: 'asc' | 'desc' } | null;
  selectedRowIds: string[];
  loading: boolean;
  emptyMessage: string;
}

export type DataTableEvent = ComponentEvent<{ type: 'datatable'; value?: string | number | boolean | null }>;
