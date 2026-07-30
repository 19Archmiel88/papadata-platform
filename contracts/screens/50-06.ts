import type { PapaEvidenceReadData, ApiProblem } from '../api-schemas';

export interface Screen5006ViewModel { screenId: '50.06'; route: '/app/papa/dowody'; title: string; data: PapaEvidenceReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.evidence.read'>; }
