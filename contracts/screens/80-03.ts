import type { DecisionsRekomendacjeReadData, ApiProblem } from '../api-schemas';

export interface Screen8003ViewModel { screenId: '80.03'; route: '/app/decisions/rekomendacje'; title: string; data: DecisionsRekomendacjeReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.rekomendacje.read'>; }
