export type { LineageGraphProps } from '../domain-component-contracts';
export interface LineageGraphEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
