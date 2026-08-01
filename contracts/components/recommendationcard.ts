export type { RecommendationCardProps } from '../domain-component-contracts';
export interface RecommendationCardEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
