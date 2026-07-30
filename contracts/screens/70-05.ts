import type { BillingPaymentsReadData, ApiProblem } from '../api-schemas';

export interface Screen7005ViewModel { screenId: '70.05'; route: '/app/billing/platnosci'; title: string; data: BillingPaymentsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.payments.read'>; }
