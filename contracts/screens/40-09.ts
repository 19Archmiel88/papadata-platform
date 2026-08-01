import type { IntegrationsProviderOutageReadData, ApiProblem } from '../api-schemas';

export interface Screen4009ViewModel { screenId: '40.09'; route: '/app/integrations/awaria-providera'; title: string; data: IntegrationsProviderOutageReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.provider-outage.read'>; }
