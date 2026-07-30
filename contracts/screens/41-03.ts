import type { DataQualityLineageReadData, ApiProblem } from '../api-schemas';

export interface Screen4103ViewModel { screenId: '41.03'; route: '/app/data-quality/pochodzenie-danych'; title: string; data: DataQualityLineageReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.lineage.read'>; }
