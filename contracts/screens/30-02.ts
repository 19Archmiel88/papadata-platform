import type { CommandCenterAttentionQueueReadData, ApiProblem } from '../api-schemas';

export interface Screen3002ViewModel { screenId: '30.02'; route: '/app/command-center/kolejka-uwagi'; title: string; data: CommandCenterAttentionQueueReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.attention.queue.read'>; }
