import type { CustomersImpactReadData, ApiProblem } from '../api-schemas';

export interface Screen3407ViewModel { screenId: '34.07'; route: '/app/customers/analiza-wplywu'; title: string; data: CustomersImpactReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.impact.read'>; }
