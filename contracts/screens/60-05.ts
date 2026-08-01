import type { SettingsAccountSecurityReadData, ApiProblem } from '../api-schemas';

export interface Screen6005ViewModel { screenId: '60.05'; route: '/app/settings/bezpieczenstwo-konta'; title: string; data: SettingsAccountSecurityReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.account-security.read'>; }
