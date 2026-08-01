import type { HelpHomeReadData, ApiProblem } from '../api-schemas';

export interface Screen8501ViewModel { screenId: '85.01'; route: '/app/help/strona-glowna-pomocy'; title: string; data: HelpHomeReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'help.home.read'>; }
