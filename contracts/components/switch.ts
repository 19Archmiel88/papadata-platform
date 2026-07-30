import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SwitchProps extends BaseComponentProps {
  checked: boolean;
  name: string;
  helperText: string | null;
  pending: boolean;
}

export type SwitchEvent = ComponentEvent<{ type: 'switch'; value?: string | number | boolean | null }>;
