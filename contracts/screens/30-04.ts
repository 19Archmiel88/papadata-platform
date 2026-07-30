import type { CommandCenterPlanPerformanceReadData, ApiProblem } from '../api-schemas';

export interface Screen3004ViewModel { screenId: '30.04'; route: '/app/command-center/plan-vs-wynik'; title: string; data: CommandCenterPlanPerformanceReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.plan-performance.read'>; }
