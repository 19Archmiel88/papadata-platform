import type { IntegrationsSyncScopeReadData, ApiProblem } from '../api-schemas';

export interface Screen4006ViewModel { screenId: '40.06'; route: '/app/integrations/zakres-synchronizacji'; title: string; data: IntegrationsSyncScopeReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.sync-scope.read'>; }
