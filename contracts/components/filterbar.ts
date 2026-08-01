import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface FilterBarProps extends BaseComponentProps {
  filters: Array<{ id: string; label: string; type: 'select' | 'date' | 'search'; value: string | null }>;
  activeCount: number;
  collapsible: boolean;
}

export type FilterBarEvent = ComponentEvent<{ type: 'filterbar'; value?: string | number | boolean | null }>;
