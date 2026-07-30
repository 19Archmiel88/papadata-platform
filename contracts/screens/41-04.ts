import type { DataQualitySourceOverlapReadData, ApiProblem } from '../api-schemas';

export interface Screen4104ViewModel { screenId: '41.04'; route: '/app/data-quality/nakladanie-zrodel'; title: string; data: DataQualitySourceOverlapReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.source-overlap.read'>; }
