import type { ProductsDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen3303ViewModel { screenId: '33.03'; route: '/app/products/szczegoly/:resourceId'; title: string; data: ProductsDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.detail.read'>; }
