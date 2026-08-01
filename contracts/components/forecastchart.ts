import type { BaseComponentProps, ChartSeries, ComponentEvent } from '../component-shared';

export interface ForecastChartProps extends BaseComponentProps {
  actual: ChartSeries;
  forecast: ChartSeries;
  lowerBound: ChartSeries;
  upperBound: ChartSeries;
  confidence: number;
  horizonLabel: string;
}

export type ForecastChartEvent = ComponentEvent<{ type: 'forecastchart'; value?: string | number | boolean | null }>;
