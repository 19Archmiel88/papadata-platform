import type { OrdersDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen3203ViewModel { screenId: '32.03'; route: '/app/orders/szczegoly/:resourceId'; title: string; data: OrdersDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.detail.read'>; }
