import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface DetailPanelProps extends BaseComponentProps {
  open: boolean;
  title: string;
  recordId: string;
  sections: Array<{ id: string; title: string; fields: Array<{ label: string; value: string }> }>;
  width: 'sm' | 'md' | 'lg';
}

export type DetailPanelEvent = ComponentEvent<{ type: 'detailpanel'; value?: string | number | boolean | null }>;
