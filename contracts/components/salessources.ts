export type { SalesSourcesProps } from '../domain-component-contracts';
export interface SalesSourcesEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
