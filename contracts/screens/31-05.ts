import type { CampaignsBudgetReadData, ApiProblem } from '../api-schemas';

export interface Screen3105ViewModel { screenId: '31.05'; route: '/app/campaigns/budzet'; title: string; data: CampaignsBudgetReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'campaigns.budget.read'>; }
