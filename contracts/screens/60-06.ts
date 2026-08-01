import type { SettingsSessionsReadData, ApiProblem } from '../api-schemas';

export interface Screen6006ViewModel { screenId: '60.06'; route: '/app/settings/sesje'; title: string; data: SettingsSessionsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.sessions.read'>; }
