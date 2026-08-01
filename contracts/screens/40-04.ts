import type { IntegrationsSyncHistoryReadData, ApiProblem } from '../api-schemas';

export interface Screen4004ViewModel { screenId: '40.04'; route: '/app/integrations/historia-synchronizacji'; title: string; data: IntegrationsSyncHistoryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.sync-history.read'>; }
