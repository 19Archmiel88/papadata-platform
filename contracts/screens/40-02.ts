import type { IntegrationsConnectionWizardReadData, ApiProblem } from '../api-schemas';

export interface Screen4002ViewModel { screenId: '40.02'; route: '/app/integrations/kreator-polaczenia'; title: string; data: IntegrationsConnectionWizardReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'integrations.connection-wizard.read'>; }
