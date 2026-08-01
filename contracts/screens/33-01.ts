import type { ProductsOverviewReadData, ApiProblem } from '../api-schemas';

export interface Screen3301ViewModel { screenId: '33.01'; route: '/app/products/przeglad'; title: string; data: ProductsOverviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.overview.read'>; }
