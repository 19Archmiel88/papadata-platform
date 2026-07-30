import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SearchFieldProps extends BaseComponentProps {
  query: string;
  placeholder: string;
  loading: boolean;
  resultCount: number | null;
  debounceMs: number;
}

export type SearchFieldEvent = ComponentEvent<{ type: 'searchfield'; value?: string | number | boolean | null }>;
