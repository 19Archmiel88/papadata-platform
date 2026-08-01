import type { BillingOverduePaymentReadData, ApiProblem } from '../api-schemas';

export interface Screen7006ViewModel { screenId: '70.06'; route: '/app/billing/zalegla-platnosc'; title: string; data: BillingOverduePaymentReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.overdue-payment.read'>; }
