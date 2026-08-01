import type { TrafficGa4OrdersReadData, ApiProblem } from '../api-schemas';

export interface Screen3506ViewModel { screenId: '35.06'; route: '/app/traffic/ga4-vs-zamowienia'; title: string; data: TrafficGa4OrdersReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.ga4-orders.read'>; }
