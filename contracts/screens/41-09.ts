import type { DataQualityReconciliationReadData, ApiProblem } from '../api-schemas';

export interface Screen4109ViewModel { screenId: '41.09'; route: '/app/data-quality/rekoncyliacja'; title: string; data: DataQualityReconciliationReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.reconciliation.read'>; }
