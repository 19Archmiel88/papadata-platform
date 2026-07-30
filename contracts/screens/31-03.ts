import type { CampaignsDetailReadData, ApiProblem } from '../api-schemas';

export interface Screen3103ViewModel { screenId: '31.03'; route: '/app/campaigns/szczegoly-kampanii/:resourceId'; title: string; data: CampaignsDetailReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.detail.read'>; }
