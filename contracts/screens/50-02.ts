import type { PapaAssistantShellReadData, ApiProblem } from '../api-schemas';

export interface Screen5002ViewModel { screenId: '50.02'; route: '/app/papa/assistantshell'; title: string; data: PapaAssistantShellReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.assistant-shell.read'>; }
