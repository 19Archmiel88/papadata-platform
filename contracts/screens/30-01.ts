import type { CommandCenterOverviewReadData, ApiProblem } from '../api-schemas';

export interface Screen3001ViewModel { screenId: '30.01'; route: '/app/command-center/widok-glowny'; title: string; data: CommandCenterOverviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.overview.read'>; }
