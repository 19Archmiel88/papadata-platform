import type { CommandCenterProductsSummaryReadData, ApiProblem } from '../api-schemas';

export interface Screen3008ViewModel { screenId: '30.08'; route: '/app/command-center/produkty'; title: string; data: CommandCenterProductsSummaryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.products-summary.read'>; }
