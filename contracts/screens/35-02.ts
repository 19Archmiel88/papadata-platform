import type { TrafficChannelsReadData, ApiProblem } from '../api-schemas';

export interface Screen3502ViewModel { screenId: '35.02'; route: '/app/traffic/kanaly'; title: string; data: TrafficChannelsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.channels.read'>; }
