import type { IntegrationsDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen4003ViewModel { screenId: '40.03'; route: '/app/integrations/szczegoly-integracji/:resourceId'; title: string; data: IntegrationsDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.detail.read'>; }
