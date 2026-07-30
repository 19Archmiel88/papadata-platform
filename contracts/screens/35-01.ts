import type { TrafficOverviewReadData, ApiProblem } from '../api-schemas';

export interface Screen3501ViewModel { screenId: '35.01'; route: '/app/traffic/przeglad-ruchu'; title: string; data: TrafficOverviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.overview.read'>; }
