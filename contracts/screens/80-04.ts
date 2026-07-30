import type { DecisionsRegistryReadData, ApiProblem } from '../api-schemas';

export interface Screen8004ViewModel { screenId: '80.04'; route: '/app/decisions/rejestr-decyzji'; title: string; data: DecisionsRegistryReadData; readiness: 'ready' | 'partial' | 'stale' | 'unavailable'; errors: ApiProblem[]; allowedOperationIds: Array<'decisions.registry.read'>; }
