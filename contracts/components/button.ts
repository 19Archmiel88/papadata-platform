import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ButtonProps extends BaseComponentProps {
  text: string;
  buttonType: 'button' | 'submit' | 'reset';
  size: 'sm' | 'md' | 'lg';
  loading: boolean;
  leadingIcon: string | null;
  trailingIcon: string | null;
}

export type ButtonEvent = ComponentEvent<{ type: 'button'; value?: string | number | boolean | null }>;
