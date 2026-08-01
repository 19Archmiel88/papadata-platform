import type { DataQualityConflictsReadData, ApiProblem } from '../api-schemas';

export interface Screen4106ViewModel { screenId: '41.06'; route: '/app/data-quality/konflikty'; title: string; data: DataQualityConflictsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.conflicts.read'>; }
