import type { DecisionsRelationsReadData, ApiProblem } from '../api-schemas';

export interface Screen8009ViewModel { screenId: '80.09'; route: '/app/decisions/powiazania-z-modulami-i-sprawami'; title: string; data: DecisionsRelationsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.relations.read'>; }
