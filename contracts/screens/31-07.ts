import type { CampaignsRecommendationsReadData, ApiProblem } from '../api-schemas';

export interface Screen3107ViewModel { screenId: '31.07'; route: '/app/campaigns/rekomendacje-kontekst-domenowy'; title: string; data: CampaignsRecommendationsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.recommendations.read'>; }
