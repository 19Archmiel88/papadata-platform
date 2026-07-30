import type { ProductsPerformanceReadData, ApiProblem } from '../api-schemas';

export interface Screen3306ViewModel { screenId: '33.06'; route: '/app/products/wydajnosc'; title: string; data: ProductsPerformanceReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.performance.read'>; }
