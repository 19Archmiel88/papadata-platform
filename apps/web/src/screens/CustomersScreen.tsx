import {
  AnalyticsModuleScreen,
} from './analytics/AnalyticsModuleScreen';

export type CustomersScreenProps = {
  readonly path?: string;
};

export function CustomersScreen({
  path = '/app/customers/przeglad',
}: CustomersScreenProps) {
  return (
    <AnalyticsModuleScreen
      group='customers'
      path={path}
    />
  );
}
