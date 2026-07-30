import type { DataQualitySourcePriorityReadData, ApiProblem } from '../api-schemas';

export interface Screen4105ViewModel { screenId: '41.05'; route: '/app/data-quality/nadrzednosc-zrodla'; title: string; data: DataQualitySourcePriorityReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.source-priority.read'>; }
