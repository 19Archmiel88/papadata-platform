import type { IntegrationsSyncRunReadData, ApiProblem } from '../api-schemas';

export interface Screen4005ViewModel { screenId: '40.05'; route: '/app/integrations/przebieg-synchronizacji'; title: string; data: IntegrationsSyncRunReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.sync-run.read'>; }
