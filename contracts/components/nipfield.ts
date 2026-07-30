import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface NipFieldProps extends BaseComponentProps {
  value: string;
  countryCode: 'PL';
  validationState: 'idle' | 'validating' | 'valid' | 'invalid';
  registryName: string | null;
}

export type NipFieldEvent = ComponentEvent<{ type: 'nipfield'; value?: string | number | boolean | null }>;
