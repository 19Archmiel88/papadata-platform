import type { DataQualityDatasetReadData, ApiProblem } from '../api-schemas';

export interface Screen4102ViewModel { screenId: '41.02'; route: '/app/data-quality/zbior-danych'; title: string; data: DataQualityDatasetReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.dataset.read'>; }
