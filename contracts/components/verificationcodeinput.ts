import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface VerificationCodeInputProps extends BaseComponentProps {
  value: string;
  length: number;
  inputMode: 'numeric' | 'text';
  masked: boolean;
  resendAvailableAt: string | null;
}

export type VerificationCodeInputEvent = ComponentEvent<{ type: 'verificationcodeinput'; value?: string | number | boolean | null }>;
