import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface TextActionProps extends BaseComponentProps {
  text: string;
  href: string | null;
  external: boolean;
  destructive: boolean;
}

export type TextActionEvent = ComponentEvent<{ type: 'textaction'; value?: string | number | boolean | null }>;
