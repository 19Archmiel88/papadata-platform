import type { CampaignsDiagnosticsReadData, ApiProblem } from '../api-schemas';

export interface Screen3106ViewModel { screenId: '31.06'; route: '/app/campaigns/diagnostyka'; title: string; data: CampaignsDiagnosticsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.diagnostics.read'>; }
