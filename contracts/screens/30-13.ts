import type { CommandCenterWaterfallReadData, ApiProblem } from '../api-schemas';

export interface Screen3013ViewModel { screenId: '30.13'; route: '/app/command-center/waterfall'; title: string; data: CommandCenterWaterfallReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.waterfall.read'>; }
