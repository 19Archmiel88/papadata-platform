import type { PapaActionsReadData, ApiProblem } from '../api-schemas';

export interface Screen5013ViewModel { screenId: '50.13'; route: '/app/papa/ai-actions'; title: string; data: PapaActionsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.actions.read'>; }
