export type { PlanPerformanceProps } from '../domain-component-contracts';
export interface PlanPerformanceEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
