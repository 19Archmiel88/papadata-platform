import type { SettingsRolesReadData, ApiProblem } from '../api-schemas';

export interface Screen6004ViewModel { screenId: '60.04'; route: '/app/settings/role-i-uprawnienia'; title: string; data: SettingsRolesReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.roles.read'>; }
