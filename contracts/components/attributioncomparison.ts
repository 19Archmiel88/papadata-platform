export type { AttributionComparisonProps } from '../domain-component-contracts';
export interface AttributionComparisonEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
