import type { CommandCenterKpiReadData, ApiProblem } from '../api-schemas';

export interface Screen3003ViewModel { screenId: '30.03'; route: '/app/command-center/kpi'; title: string; data: CommandCenterKpiReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.kpi.read'>; }
