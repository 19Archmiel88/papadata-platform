import type { BillingPilotToSubscriptionReadData, ApiProblem } from '../api-schemas';

export interface Screen7009ViewModel { screenId: '70.09'; route: '/app/billing/pilot-do-abonamentu'; title: string; data: BillingPilotToSubscriptionReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.pilot-to-subscription.read'>; }
