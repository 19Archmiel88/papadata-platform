import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ComboboxProps extends BaseComponentProps {
  value: string | null;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  query: string;
  allowCustom: boolean;
  loading: boolean;
}

export type ComboboxEvent = ComponentEvent<{ type: 'combobox'; value?: string | number | boolean | null }>;
