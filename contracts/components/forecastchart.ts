import type {
  BaseComponentProps,
  ChartSeries,
  ComponentEvent,
} from '../component-shared';

/**
 * Orchestration contract used by screen/domain specifications.
 * Runtime React props are owned by
 * design-system/components/ForecastChart/ForecastChart.tsx.
 */
export type ForecastChartQualityLevel =
  | 'high'
  | 'medium'
  | 'limited';

export type ForecastChartQuality = {
  readonly label: string;
  readonly description: string;
  readonly level: ForecastChartQualityLevel;
};

export type ForecastChartScenarioTone =
  | 'baseline'
  | 'optimistic'
  | 'conservative';

export type ForecastChartScenario = {
  readonly id: string;
  readonly label: string;
  readonly valueLabel: string;
  readonly description: string;
  readonly tone?: ForecastChartScenarioTone;
};

export type ForecastChartLabels = {
  readonly actual: string;
  readonly confidence: string;
  readonly forecast: string;
  readonly forecastDisclaimer: string;
  readonly horizon: string;
  readonly legend: string;
  readonly quality: string;
  readonly scenarios: string;
  readonly uncertainty: string;
  readonly unavailable: string;
};

export interface ForecastChartProps extends BaseComponentProps {
  readonly actual: ChartSeries;
  readonly ariaLabel: string;
  readonly forecast: ChartSeries;
  readonly lowerBound: ChartSeries;
  readonly upperBound: ChartSeries;
  readonly confidence?: number | null;
  readonly horizonLabel?: string | null;
  readonly labels?: Partial<ForecastChartLabels>;
  readonly quality?: ForecastChartQuality | null;
  readonly scenarios?: readonly ForecastChartScenario[];
  readonly unit?: string | null;
  readonly valueFormatter?: ((value: number) => string) | null;
}

export type ForecastChartEvent = ComponentEvent<{
  type: 'forecastchart';
  value?: string | number | boolean | null;
}>;