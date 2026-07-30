import type { ProductsOffersReadData, ApiProblem } from '../api-schemas';

export interface Screen3305ViewModel { screenId: '33.05'; route: '/app/products/oferty'; title: string; data: ProductsOffersReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'products.offers.read'>; }
