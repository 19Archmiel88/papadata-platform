import type { TrafficLandingPagesReadData, ApiProblem } from '../api-schemas';

export interface Screen3508ViewModel { screenId: '35.08'; route: '/app/traffic/strony-wejscia'; title: string; data: TrafficLandingPagesReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.landing-pages.read'>; }
