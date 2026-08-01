import type { PapaGovernanceReadData, ApiProblem } from '../api-schemas';

export interface Screen5016ViewModel { screenId: '50.16'; route: '/app/papa/ustawienia-ai-i-governance'; title: string; data: PapaGovernanceReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.governance.read'>; }
