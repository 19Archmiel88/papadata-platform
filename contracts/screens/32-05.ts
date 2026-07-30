import type { OrdersPorownanieZrodelReadData, ApiProblem } from '../api-schemas';

export interface Screen3205ViewModel { screenId: '32.05'; route: '/app/orders/porownanie-zrodel'; title: string; data: OrdersPorownanieZrodelReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.porownanie-zrodel.read'>; }
