import type { DecisionsActionLibraryReadData, ApiProblem } from '../api-schemas';

export interface Screen8008ViewModel { screenId: '80.08'; route: '/app/decisions/biblioteka-dzialan'; title: string; data: DecisionsActionLibraryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.action-library.read'>; }
