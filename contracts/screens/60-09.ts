import type { SettingsSupportAccessReadData, ApiProblem } from '../api-schemas';

export interface Screen6009ViewModel { screenId: '60.09'; route: '/app/settings/dostep-wsparcia'; title: string; data: SettingsSupportAccessReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.support-access.read'>; }
