import type { TrafficFunnelDefinitionsReadData, ApiProblem } from '../api-schemas';

export interface Screen3505ViewModel { screenId: '35.05'; route: '/app/traffic/definicje-lejka'; title: string; data: TrafficFunnelDefinitionsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.funnel-definitions.read'>; }
