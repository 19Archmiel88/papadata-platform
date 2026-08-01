import type { DecisionsMeasurementReadData, ApiProblem } from '../api-schemas';

export interface Screen8007ViewModel { screenId: '80.07'; route: '/app/decisions/pomiar'; title: string; data: DecisionsMeasurementReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.measurement.read'>; }
