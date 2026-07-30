import type { DataQualityCenterReadData, ApiProblem } from '../api-schemas';

export interface Screen4101ViewModel { screenId: '41.01'; route: '/app/data-quality/centrum-jakosci'; title: string; data: DataQualityCenterReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'data-quality.center.read'>; }
