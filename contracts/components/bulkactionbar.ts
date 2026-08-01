import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface BulkActionBarProps extends BaseComponentProps {
  selectedCount: number;
  availableActions: Array<{ id: string; label: string; destructive?: boolean }>;
  busyActionId: string | null;
}

export type BulkActionBarEvent = ComponentEvent<{ type: 'bulkactionbar'; value?: string | number | boolean | null }>;
