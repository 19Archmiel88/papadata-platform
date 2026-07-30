export type { CohortMatrixProps } from '../domain-component-contracts';
export interface CohortMatrixEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
