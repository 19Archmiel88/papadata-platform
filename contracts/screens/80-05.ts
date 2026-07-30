import type { DecisionsActionBriefReadData, ApiProblem } from '../api-schemas';

export interface Screen8005ViewModel { screenId: '80.05'; route: '/app/decisions/brief-dzialania'; title: string; data: DecisionsActionBriefReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.action-brief.read'>; }
