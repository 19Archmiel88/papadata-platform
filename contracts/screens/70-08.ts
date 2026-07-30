import type { BillingChangeCancelReadData, ApiProblem } from '../api-schemas';

export interface Screen7008ViewModel { screenId: '70.08'; route: '/app/billing/zmiana-i-anulowanie'; title: string; data: BillingChangeCancelReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.change-cancel.read'>; }
