import type { CommandCenterDriversReadData, ApiProblem } from '../api-schemas';

export interface Screen3005ViewModel { screenId: '30.05'; route: '/app/command-center/drivery-wyniku'; title: string; data: CommandCenterDriversReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.drivers.read'>; }
