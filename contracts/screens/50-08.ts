import type { PapaLabReadData, ApiProblem } from '../api-schemas';

export interface Screen5008ViewModel { screenId: '50.08'; route: '/app/papa/laboratorium-ai'; title: string; data: PapaLabReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.lab.read'>; }
