export type { DecisionQueueProps } from '../domain-component-contracts';
export interface DecisionQueueEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
