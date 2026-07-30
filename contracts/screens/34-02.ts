import type { CustomersSegmentsReadData, ApiProblem } from '../api-schemas';

export interface Screen3402ViewModel { screenId: '34.02'; route: '/app/customers/segmenty'; title: string; data: CustomersSegmentsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.segments.read'>; }
