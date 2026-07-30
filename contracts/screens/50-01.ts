import type { PapaContextPanelReadData, ApiProblem } from '../api-schemas';

export interface Screen5001ViewModel { screenId: '50.01'; route: '/app/papa/panel-kontekstowy-papa'; title: string; data: PapaContextPanelReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'papa.context-panel.read'>; }
