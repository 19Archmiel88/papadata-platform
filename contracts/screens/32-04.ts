import type { OrdersOsZdarzenReadData, ApiProblem } from '../api-schemas';

export interface Screen3204ViewModel { screenId: '32.04'; route: '/app/orders/os-zdarzen'; title: string; data: OrdersOsZdarzenReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.os-zdarzen.read'>; }
