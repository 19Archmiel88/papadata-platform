import type { SettingsMembershipsReadData, ApiProblem } from '../api-schemas';

export interface Screen6003ViewModel { screenId: '60.03'; route: '/app/settings/czlonkostwa'; title: string; data: SettingsMembershipsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.memberships.read'>; }
