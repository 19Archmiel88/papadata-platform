import type { BaseComponentProps, ComponentEvent } from '../component-shared';

/**
 * Orchestration contract for the shared analytics data-state language.
 * Runtime React props are owned by design-system/components/ChartDataState/ChartDataState.tsx.
 */
export type ChartDataStateKind =
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

export interface ChartDataStateProps extends BaseComponentProps {
  readonly dataState: ChartDataStateKind;
  readonly title: string;
  readonly message: string;
  readonly actionLabel: string | null;
  readonly hasRenderableData: boolean;
  readonly liveRegion: 'polite' | 'assertive' | null;
}

export type ChartDataStateEvent = ComponentEvent<{
  type: 'chart-data-state';
  value?: ChartDataStateKind | string | boolean | null;
}>;
