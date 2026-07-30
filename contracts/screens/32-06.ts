import type { OrdersRekoncyliacjaSkrotReadData, ApiProblem } from '../api-schemas';

export interface Screen3206ViewModel { screenId: '32.06'; route: '/app/orders/rekoncyliacja-skrot'; title: string; data: OrdersRekoncyliacjaSkrotReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'orders.rekoncyliacja-skrot.read'>; }
