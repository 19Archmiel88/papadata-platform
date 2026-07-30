import type { TrafficEventQualityReadData, ApiProblem } from '../api-schemas';

export interface Screen3507ViewModel { screenId: '35.07'; route: '/app/traffic/jakosc-zdarzen'; title: string; data: TrafficEventQualityReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.event-quality.read'>; }
