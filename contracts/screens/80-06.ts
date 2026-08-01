import type { DecisionsActionDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen8006ViewModel { screenId: '80.06'; route: '/app/decisions/szczegoly-dzialania/:resourceId'; title: string; data: DecisionsActionDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.action-detail.read'>; }
