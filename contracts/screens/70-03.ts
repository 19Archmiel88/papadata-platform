import type { BillingPlansReadData, ApiProblem } from '../api-schemas';

export interface Screen7003ViewModel { screenId: '70.03'; route: '/app/billing/plany'; title: string; data: BillingPlansReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.plans.read'>; }
