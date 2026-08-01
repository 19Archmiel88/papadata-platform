import type { PapaObservationsReadData, ApiProblem } from '../api-schemas';

export interface Screen5009ViewModel { screenId: '50.09'; route: '/app/papa/obserwacje'; title: string; data: PapaObservationsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.observations.read'>; }
