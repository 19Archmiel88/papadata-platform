import type { OrdersOverviewReadData, ApiProblem } from '../api-schemas';

export interface Screen3201ViewModel { screenId: '32.01'; route: '/app/orders/przeglad'; title: string; data: OrdersOverviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.overview.read'>; }
