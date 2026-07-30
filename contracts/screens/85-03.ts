import type { HelpResultsReadData, ApiProblem } from '../api-schemas';

export interface Screen8503ViewModel { screenId: '85.03'; route: '/app/help/lista-wynikow'; title: string; data: HelpResultsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'help.results.read'>; }
