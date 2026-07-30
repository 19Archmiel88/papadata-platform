import type { SettingsAuditReadData, ApiProblem } from '../api-schemas';

export interface Screen6007ViewModel { screenId: '60.07'; route: '/app/settings/audyt'; title: string; data: SettingsAuditReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.audit.read'>; }
