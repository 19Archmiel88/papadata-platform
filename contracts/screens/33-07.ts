import type { ProductsGapsQueueReadData, ApiProblem } from '../api-schemas';

export interface Screen3307ViewModel { screenId: '33.07'; route: '/app/products/kolejka-brakow'; title: string; data: ProductsGapsQueueReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.gaps.queue.read'>; }
