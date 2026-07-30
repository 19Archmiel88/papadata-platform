import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ColumnPickerProps extends BaseComponentProps {
  columns: Array<{ id: string; label: string; visible: boolean; required: boolean }>;
  maxVisible: number | null;
}

export type ColumnPickerEvent = ComponentEvent<{ type: 'columnpicker'; value?: string | number | boolean | null }>;
