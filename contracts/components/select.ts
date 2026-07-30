import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SelectProps extends BaseComponentProps {
  value: string | null;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder: string;
  searchable: boolean;
}

export type SelectEvent = ComponentEvent<{ type: 'select'; value?: string | number | boolean | null }>;
