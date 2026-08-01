import type { ProductsMappingReadData, ApiProblem } from '../api-schemas';

export interface Screen3304ViewModel { screenId: '33.04'; route: '/app/products/mapowanie'; title: string; data: ProductsMappingReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.mapping.read'>; }
