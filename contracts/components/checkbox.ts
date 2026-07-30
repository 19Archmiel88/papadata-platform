import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface CheckboxProps extends BaseComponentProps {
  checked: boolean;
  indeterminate: boolean;
  name: string;
  value: string;
  helperText: string | null;
}

export type CheckboxEvent = ComponentEvent<{ type: 'checkbox'; value?: string | number | boolean | null }>;
