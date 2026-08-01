export type { FunnelStepProps } from '../domain-component-contracts';
export interface FunnelStepEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
