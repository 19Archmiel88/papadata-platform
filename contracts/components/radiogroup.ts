import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface RadioGroupProps extends BaseComponentProps {
  value: string | null;
  name: string;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  orientation: 'horizontal' | 'vertical';
}

export type RadioGroupEvent = ComponentEvent<{ type: 'radiogroup'; value?: string | number | boolean | null }>;
