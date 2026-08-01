import type { TrafficFunnelReadData, ApiProblem } from '../api-schemas';

export interface Screen3503ViewModel { screenId: '35.03'; route: '/app/traffic/lejek-widok'; title: string; data: TrafficFunnelReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.funnel.read'>; }
