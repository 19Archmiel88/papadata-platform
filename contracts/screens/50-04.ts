import type { PapaContextBasketReadData, ApiProblem } from '../api-schemas';

export interface Screen5004ViewModel { screenId: '50.04'; route: '/app/papa/context-basket'; title: string; data: PapaContextBasketReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.context-basket.read'>; }
