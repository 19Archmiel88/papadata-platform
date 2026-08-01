import type { PapaProposalsReadData, ApiProblem } from '../api-schemas';

export interface Screen5011ViewModel { screenId: '50.11'; route: '/app/papa/propozycje-ai'; title: string; data: PapaProposalsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.proposals.read'>; }
