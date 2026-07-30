import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface DrawerProps extends BaseComponentProps {
  open: boolean;
  title: string;
  side: 'left' | 'right';
  width: number;
  dismissible: boolean;
}

export type DrawerEvent = ComponentEvent<{ type: 'drawer'; value?: string | number | boolean | null }>;
