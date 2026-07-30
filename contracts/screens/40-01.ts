import type { IntegrationsCatalogReadData, ApiProblem } from '../api-schemas';

export interface Screen4001ViewModel { screenId: '40.01'; route: '/app/integrations/katalog-integracji'; title: string; data: IntegrationsCatalogReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.catalog.read'>; }
