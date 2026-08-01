import type { OrdersEksportReadData, ApiProblem } from '../api-schemas';

export interface Screen3207ViewModel { screenId: '32.07'; route: '/app/orders/eksport'; title: string; data: OrdersEksportReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.eksport.read'>; }
