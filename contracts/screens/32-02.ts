import type { OrdersListReadData, ApiProblem } from '../api-schemas';

export interface Screen3202ViewModel { screenId: '32.02'; route: '/app/orders/lista'; title: string; data: OrdersListReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.list.read'>; }
