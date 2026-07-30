export type { CustomerSegmentsProps } from '../domain-component-contracts';
export interface CustomerSegmentsEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
