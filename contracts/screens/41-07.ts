import type { DataQualityManualReviewReadData, ApiProblem } from '../api-schemas';

export interface Screen4107ViewModel { screenId: '41.07'; route: '/app/data-quality/przeglad-reczny'; title: string; data: DataQualityManualReviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.manual-review.read'>; }
