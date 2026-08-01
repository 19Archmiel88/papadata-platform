import type { HelpProcedureDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen8504ViewModel { screenId: '85.04'; route: '/app/help/szczegoly-procedury/:resourceId'; title: string; data: HelpProcedureDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'help.procedure-detail.read'>; }
