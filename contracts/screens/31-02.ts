import type { CampaignsListReadData, ApiProblem } from '../api-schemas';

export interface Screen3102ViewModel { screenId: '31.02'; route: '/app/campaigns/lista-kampanii'; title: string; data: CampaignsListReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.list.read'>; }
