import type { ProductsCatalogReadData, ApiProblem } from '../api-schemas';

export interface Screen3302ViewModel { screenId: '33.02'; route: '/app/products/katalog'; title: string; data: ProductsCatalogReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.catalog.read'>; }
