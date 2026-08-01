import type { SettingsWorkspaceReadData, ApiProblem } from '../api-schemas';

export interface Screen6002ViewModel { screenId: '60.02'; route: '/app/settings/workspace'; title: string; data: SettingsWorkspaceReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'settings.workspace.read'>; }
