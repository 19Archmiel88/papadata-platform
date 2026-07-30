export type { SyncTimelineProps } from '../domain-component-contracts';
export interface SyncTimelineEvent { componentId: string; action: string; correlationId: string; payload: Record<string, unknown>; }
