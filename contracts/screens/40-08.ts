import type { IntegrationsDisconnectReadData, ApiProblem } from '../api-schemas';

export interface Screen4008ViewModel { screenId: '40.08'; route: '/app/integrations/odlaczenie'; title: string; data: IntegrationsDisconnectReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.disconnect.read'>; }
