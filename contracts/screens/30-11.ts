import type { CommandCenterAiRecommendationsReadData, ApiProblem } from '../api-schemas';

export interface Screen3011ViewModel { screenId: '30.11'; route: '/app/command-center/rekomendacje-ai-skrot'; title: string; data: CommandCenterAiRecommendationsReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'command-center.ai-recommendations.read'>; }
