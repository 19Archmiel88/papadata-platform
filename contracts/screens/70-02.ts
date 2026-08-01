import type { BillingUsageLimitsReadData, ApiProblem } from '../api-schemas';

export interface Screen7002ViewModel { screenId: '70.02'; route: '/app/billing/uzycie-i-limity'; title: string; data: BillingUsageLimitsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'billing.usage-limits.read'>; }
