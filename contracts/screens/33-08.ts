import type { ProductsImpactReadData, ApiProblem } from '../api-schemas';

export interface Screen3308ViewModel { screenId: '33.08'; route: '/app/products/analiza-wplywu'; title: string; data: ProductsImpactReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.impact.read'>; }
