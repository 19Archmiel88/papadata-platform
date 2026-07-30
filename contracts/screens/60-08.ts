import type { SettingsPrivacyReadData, ApiProblem } from '../api-schemas';

export interface Screen6008ViewModel { screenId: '60.08'; route: '/app/settings/prywatnosc'; title: string; data: SettingsPrivacyReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.privacy.read'>; }
