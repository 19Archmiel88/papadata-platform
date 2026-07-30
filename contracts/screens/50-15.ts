import type { PapaHistoryMemoryReadData, ApiProblem } from '../api-schemas';

export interface Screen5015ViewModel { screenId: '50.15'; route: '/app/papa/historia-i-pamiec-papa'; title: string; data: PapaHistoryMemoryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.history-memory.read'>; }
