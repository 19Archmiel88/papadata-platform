import type { SettingsOrganizationReadData, ApiProblem } from '../api-schemas';

export interface Screen6001ViewModel { screenId: '60.01'; route: '/app/settings/organizacja'; title: string; data: SettingsOrganizationReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.organization.read'>; }
