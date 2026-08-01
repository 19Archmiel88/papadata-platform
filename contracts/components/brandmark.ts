import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface BrandMarkProps extends BaseComponentProps {
  size: number;
  decorative: boolean;
  title: string | null;
}

export type BrandMarkEvent = ComponentEvent<{ type: 'brandmark'; value?: string | number | boolean | null }>;
