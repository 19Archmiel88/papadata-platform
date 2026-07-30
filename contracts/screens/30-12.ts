import type { CommandCenterSalesSignalsReadData, ApiProblem } from '../api-schemas';

export interface Screen3012ViewModel { screenId: '30.12'; route: '/app/command-center/sygnaly-sprzedazowe'; title: string; data: CommandCenterSalesSignalsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.sales-signals.read'>; }
