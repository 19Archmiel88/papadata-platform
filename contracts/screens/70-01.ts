import type { BillingSubscriptionReadData, ApiProblem } from '../api-schemas';

export interface Screen7001ViewModel { screenId: '70.01'; route: '/app/billing/subskrypcja'; title: string; data: BillingSubscriptionReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.subscription.read'>; }
