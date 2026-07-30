import type { DecisionsCenterReadData, ApiProblem } from '../api-schemas';

export interface Screen8001ViewModel { screenId: '80.01'; route: '/app/decisions/centrum-decyzji'; title: string; data: DecisionsCenterReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.center.read'>; }
