import type { CampaignsAttributionSalesReadData, ApiProblem } from '../api-schemas';

export interface Screen3104ViewModel { screenId: '31.04'; route: '/app/campaigns/atrybucja-i-sprzedaz'; title: string; data: CampaignsAttributionSalesReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.attribution-sales.read'>; }
