import type { CustomersCohortsReadData, ApiProblem } from '../api-schemas';

export interface Screen3403ViewModel { screenId: '34.03'; route: '/app/customers/kohorty'; title: string; data: CustomersCohortsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.cohorts.read'>; }
