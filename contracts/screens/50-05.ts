import type { PapaAnswerReadData, ApiProblem } from '../api-schemas';

export interface Screen5005ViewModel { screenId: '50.05'; route: '/app/papa/odpowiedz-papa'; title: string; data: PapaAnswerReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.answer.read'>; }
