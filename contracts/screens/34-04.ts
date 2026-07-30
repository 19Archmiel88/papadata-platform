import type { CustomersPseudonymizedDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen3404ViewModel { screenId: '34.04'; route: '/app/customers/szczegoly-pseudonimizowane/:resourceId'; title: string; data: CustomersPseudonymizedDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.pseudonymized-detail.read'>; }
