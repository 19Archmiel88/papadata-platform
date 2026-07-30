import type { TrafficFunnelStepReadData, ApiProblem } from '../api-schemas';

export interface Screen3504ViewModel { screenId: '35.04'; route: '/app/traffic/lejek-szczegoly-kroku/:resourceId'; title: string; data: TrafficFunnelStepReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'traffic.funnel-step.read'>; }
