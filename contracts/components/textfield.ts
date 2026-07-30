import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface TextFieldProps extends BaseComponentProps {
  value: string;
  name: string;
  inputType: 'text' | 'email' | 'url' | 'tel';
  autocomplete: string | null;
  prefix: string | null;
  suffix: string | null;
}

export type TextFieldEvent = ComponentEvent<{ type: 'textfield'; value?: string | number | boolean | null }>;
