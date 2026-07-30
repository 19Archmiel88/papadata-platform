import type { DataQualityReprocessingReadData, ApiProblem } from '../api-schemas';

export interface Screen4108ViewModel { screenId: '41.08'; route: '/app/data-quality/ponowne-przetwarzanie'; title: string; data: DataQualityReprocessingReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.reprocessing.read'>; }
