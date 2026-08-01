import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface BrandLockupProps extends BaseComponentProps {
  brandName: string;
  tagline: string | null;
  orientation: 'horizontal' | 'vertical';
  size: 'sm' | 'md' | 'lg';
}

export type BrandLockupEvent = ComponentEvent<{ type: 'brandlockup'; value?: string | number | boolean | null }>;
