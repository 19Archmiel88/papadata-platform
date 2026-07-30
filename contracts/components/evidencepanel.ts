export type { EvidencePanelProps } from '../domain-component-contracts';
export interface EvidencePanelEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
