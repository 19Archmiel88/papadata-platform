import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface NumberFieldProps extends BaseComponentProps {
  value: number | null;
  min: number | null;
  max: number | null;
  step: number;
  unit: string | null;
  precision: number;
}

export type NumberFieldEvent = ComponentEvent<{ type: 'numberfield'; value?: string | number | boolean | null }>;
