import type { CustomersPrivacyReadData, ApiProblem } from '../api-schemas';

export interface Screen3406ViewModel { screenId: '34.06'; route: '/app/customers/prywatnosc'; title: string; data: CustomersPrivacyReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'customers.privacy.read'>; }
