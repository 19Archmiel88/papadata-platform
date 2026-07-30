import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface TextAreaProps extends BaseComponentProps {
  value: string;
  rows: number;
  maxLength: number | null;
  autoResize: boolean;
  characterCount: boolean;
}

export type TextAreaEvent = ComponentEvent<{ type: 'textarea'; value?: string | number | boolean | null }>;
