import type { BillingAdjustmentsReadData, ApiProblem } from '../api-schemas';

export interface Screen7007ViewModel { screenId: '70.07'; route: '/app/billing/korekty'; title: string; data: BillingAdjustmentsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.adjustments.read'>; }
