import type { HelpSupportRequestReadData, ApiProblem } from '../api-schemas';

export interface Screen8505ViewModel { screenId: '85.05'; route: '/app/help/zgloszenie-wsparcia/:resourceId'; title: string; data: HelpSupportRequestReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'help.support-request.read'>; }
