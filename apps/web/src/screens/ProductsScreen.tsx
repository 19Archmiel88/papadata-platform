import {
  AnalyticsModuleScreen,
} from './analytics/AnalyticsModuleScreen';

export type ProductsScreenProps = {
  readonly path?: string;
};

export function ProductsScreen({
  path = '/app/products/przeglad',
}: ProductsScreenProps) {
  return (
    <AnalyticsModuleScreen
      group='products'
      path={path}
    />
  );
}
