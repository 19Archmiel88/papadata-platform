export type { ReconciliationPanelProps } from '../domain-component-contracts';
export interface ReconciliationPanelEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
