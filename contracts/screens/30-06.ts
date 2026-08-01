import type { CommandCenterSalesSourcesReadData, ApiProblem } from '../api-schemas';

export interface Screen3006ViewModel { screenId: '30.06'; route: '/app/command-center/zrodla-sprzedazy'; title: string; data: CommandCenterSalesSourcesReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.sales-sources.read'>; }
