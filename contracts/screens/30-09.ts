import type { CommandCenterCustomersSummaryReadData, ApiProblem } from '../api-schemas';

export interface Screen3009ViewModel { screenId: '30.09'; route: '/app/command-center/klienci'; title: string; data: CommandCenterCustomersSummaryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.customers-summary.read'>; }
