import type { PapaActionApprovalReadData, ApiProblem } from '../api-schemas';

export interface Screen5012ViewModel { screenId: '50.12'; route: '/app/papa/ai-action-approval'; title: string; data: PapaActionApprovalReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.action-approval.read'>; }
