import type { CommandCenterTrafficSummaryReadData, ApiProblem } from '../api-schemas';

export interface Screen3007ViewModel { screenId: '30.07'; route: '/app/command-center/ruch'; title: string; data: CommandCenterTrafficSummaryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.traffic-summary.read'>; }
