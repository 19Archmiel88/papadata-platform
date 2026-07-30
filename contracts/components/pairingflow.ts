export type { PairingFlowProps } from '../domain-component-contracts';
export interface PairingFlowEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
