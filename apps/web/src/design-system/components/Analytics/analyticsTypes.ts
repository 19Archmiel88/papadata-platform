import type { SemanticStatusTone } from '../../foundations';

export type AnalyticsDataState =
  | 'ready'
  | 'partial'
  | 'stale'
  | 'processing'
  | 'noData'
  | 'conflict'
  | 'providerError'
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
  ready: 'success',
  partial: 'warning',
  stale: 'warning',
  processing: 'processing',
  noData: 'neutral',
  conflict: 'critical',
  providerError: 'critical',
  unavailable: 'neutral',
} satisfies Record<AnalyticsDataState, SemanticStatusTone>;

export function resolveAnalyticsDataStateTone(
  state: AnalyticsDataState,
): SemanticStatusTone {
  return analyticsDataStateToneMap[state];
}

export function analyticsStateHasRenderableData(
  state: AnalyticsDataState,
): boolean {
  return state === 'ready'
    || state === 'partial'
    || state === 'stale';
}