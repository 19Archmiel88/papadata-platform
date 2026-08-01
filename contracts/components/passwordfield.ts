import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface PasswordFieldProps extends BaseComponentProps {
  value: string;
  visible: boolean;
  autocomplete: 'current-password' | 'new-password';
  strength: number | null;
  requirements: Array<{ id: string; label: string; met: boolean }>;
}

export type PasswordFieldEvent = ComponentEvent<{ type: 'passwordfield'; value?: string | number | boolean | null }>;
