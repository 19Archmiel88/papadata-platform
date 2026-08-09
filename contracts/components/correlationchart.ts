import type {
  BaseComponentProps,
  ComponentEvent,
} from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by
 * design-system/components/CorrelationChart/CorrelationChart.tsx.
 */
export type CorrelationChartVariant =
  | 'scatter'
  | 'relationship'
  | 'driver-analysis';

export type CorrelationChartPointRole =
  | 'standard'
  | 'driver-hypothesis'
  | 'outlier'
  | 'cluster';

/**
 * Backward-compatible alias.
 * Prefer CorrelationChartPointRole in new code.
 */
export type CorrelationPointRole = CorrelationChartPointRole;

export interface CorrelationChartPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly role?: CorrelationChartPointRole;
  readonly clusterId?: string | null;
}

export interface CorrelationChartCluster {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly xRange: readonly [number, number];
  readonly yRange: readonly [number, number];
}

export interface CorrelationChartProps extends Omit<BaseComponentProps, 'variant'> {
  readonly xLabel: string;
  readonly yLabel: string;
  readonly points: readonly CorrelationChartPoint[];
  readonly correlation: number | null;
  readonly trendline: boolean;
  readonly variant?: CorrelationChartVariant;
  readonly clusters?: readonly CorrelationChartCluster[];
  readonly relationshipLabel?: string | null;
  readonly driverHypothesis?: string | null;
  readonly causalEvidenceLabel?: string | null;
}

export type CorrelationChartEvent = ComponentEvent<{
  type: 'correlationchart';
  value?: string | number | boolean | null;
}>;