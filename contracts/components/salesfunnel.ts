export type { SalesFunnelProps } from '../domain-component-contracts';
export interface SalesFunnelEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
