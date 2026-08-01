import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface SkeletonProps extends BaseComponentProps {
  shape: 'text' | 'circle' | 'rect';
  width: number | string;
  height: number | string;
  lines: number;
}

export type SkeletonEvent = ComponentEvent<{ type: 'skeleton'; value?: string | number | boolean | null }>;
