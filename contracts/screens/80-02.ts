import type { DecisionsObservationsReadData, ApiProblem } from '../api-schemas';

export interface Screen8002ViewModel { screenId: '80.02'; route: '/app/decisions/obserwacje'; title: string; data: DecisionsObservationsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.observations.read'>; }
