import {
  AnalyticsModuleScreen,
} from './analytics/AnalyticsModuleScreen';

export type TrafficScreenProps = {
  readonly path?: string;
};

export function TrafficScreen({
  path = '/app/traffic/przeglad-ruchu',
}: TrafficScreenProps) {
  return (
    <AnalyticsModuleScreen
      group='traffic'
      path={path}
    />
  );
}
