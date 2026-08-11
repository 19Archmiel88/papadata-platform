import type { SemanticStatusTone } from '../../foundations';

export type AnalyticsDataState =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'noData'
  | 'partial'
  | 'stale'
  | 'delayed'
  | 'blocked'
  | 'error'
  | 'unavailable'
  | 'processing'
  | 'conflict'
  | 'providerError';

export type AnalyticsCanonicalDataState =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'noData'
  | 'partial'
  | 'stale'
  | 'delayed'
  | 'blocked'
  | 'error'
  | 'unavailable';

export type AnalyticsTrendDirection =
  | 'up'
  | 'down'
  | 'flat'
  | 'unknown';

export type AnalyticsSignalTone =
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'warning';

export type AnalyticsAction = {
  readonly label: string;
  readonly onAction: () => void;
};

const analyticsDataStateToneMap = {
  ready: 'info',
  loading: 'processing',
  empty: 'neutral',
  noData: 'neutral',
  partial: 'warning',
  stale: 'warning',
  delayed: 'warning',
  blocked: 'critical',
  error: 'critical',
  unavailable: 'neutral',
  processing: 'processing',
  conflict: 'critical',
  providerError: 'critical',
} satisfies Record<AnalyticsDataState, SemanticStatusTone>;

const analyticsCanonicalStateMap = {
  ready: 'ready',
  loading: 'loading',
  empty: 'empty',
  noData: 'noData',
  partial: 'partial',
  stale: 'stale',
  delayed: 'delayed',
  blocked: 'blocked',
  error: 'error',
  unavailable: 'unavailable',
  processing: 'loading',
  conflict: 'blocked',
  providerError: 'error',
} satisfies Record<AnalyticsDataState, AnalyticsCanonicalDataState>;

export function resolveAnalyticsDataStateTone(
  state: AnalyticsDataState,
): SemanticStatusTone {
  return analyticsDataStateToneMap[state];
}

export function normalizeAnalyticsDataState(
  state: AnalyticsDataState,
): AnalyticsCanonicalDataState {
  return analyticsCanonicalStateMap[state];
}

export function analyticsStateIsLoading(
  state: AnalyticsDataState,
): boolean {
  return normalizeAnalyticsDataState(state) === 'loading';
}

export function analyticsStateRequiresAssertiveNotice(
  state: AnalyticsDataState,
): boolean {
  const canonicalState = normalizeAnalyticsDataState(state);

  return canonicalState === 'blocked'
    || canonicalState === 'error';
}

export function analyticsStateHasRenderableData(
  state: AnalyticsDataState,
): boolean {
  const canonicalState = normalizeAnalyticsDataState(state);

  return canonicalState === 'ready'
    || canonicalState === 'partial'
    || canonicalState === 'stale'
    || canonicalState === 'delayed';
}
