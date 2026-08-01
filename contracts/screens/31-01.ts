import type { CampaignsOverviewReadData, ApiProblem } from '../api-schemas';

export interface Screen3101ViewModel { screenId: '31.01'; route: '/app/campaigns/przeglad'; title: string; data: CampaignsOverviewReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.overview.read'>; }
