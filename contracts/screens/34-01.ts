import type { CustomersOverviewReadData, ApiProblem } from '../api-schemas';

export interface Screen3401ViewModel { screenId: '34.01'; route: '/app/customers/przeglad'; title: string; data: CustomersOverviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.overview.read'>; }
