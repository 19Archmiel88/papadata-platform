import {
  AnalyticsModuleScreen,
} from './analytics/AnalyticsModuleScreen';

export type OrdersScreenProps = {
  readonly path?: string;
};

export function OrdersScreen({
  path = '/app/orders/przeglad',
}: OrdersScreenProps) {
  return (
    <AnalyticsModuleScreen
      group='orders'
      path={path}
    />
  );
}
