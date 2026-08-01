import type { HelpProceduresReadData, ApiProblem } from '../api-schemas';

export interface Screen8502ViewModel { screenId: '85.02'; route: '/app/help/procedury/:resourceId'; title: string; data: HelpProceduresReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'help.procedures.read'>; }
