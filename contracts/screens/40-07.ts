import type { IntegrationsReconnectReadData, ApiProblem } from '../api-schemas';

export interface Screen4007ViewModel { screenId: '40.07'; route: '/app/integrations/ponowne-polaczenie'; title: string; data: IntegrationsReconnectReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.reconnect.read'>; }
