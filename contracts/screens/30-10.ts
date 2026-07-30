import type { CommandCenterFunnelReadData, ApiProblem } from '../api-schemas';

export interface Screen3010ViewModel { screenId: '30.10'; route: '/app/command-center/lejek'; title: string; data: CommandCenterFunnelReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.funnel.read'>; }
