import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface BottomSheetProps extends BaseComponentProps {
  open: boolean;
  title: string;
  snapPoint: 'content' | 'half' | 'full';
  dismissible: boolean;
}

export type BottomSheetEvent = ComponentEvent<{ type: 'bottomsheet'; value?: string | number | boolean | null }>;
