import type { CustomersIdentityConflictsReadData, ApiProblem } from '../api-schemas';

export interface Screen3405ViewModel { screenId: '34.05'; route: '/app/customers/konflikty-tozsamosci'; title: string; data: CustomersIdentityConflictsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.identity-conflicts.read'>; }
