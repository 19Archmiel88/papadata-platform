import type { BillingInvoicesReadData, ApiProblem } from '../api-schemas';

export interface Screen7004ViewModel { screenId: '70.04'; route: '/app/billing/faktury'; title: string; data: BillingInvoicesReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.invoices.read'>; }
