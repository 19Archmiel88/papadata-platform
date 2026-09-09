import {currentProductSourcePath} from '../../runtime/app/routing/productRoutes';
import {ordersRouteView,productsRouteView} from '../../runtime/app/routing/commerceRoutes';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { OrdersWorkspaceScreen, type OrdersWorkspaceProps } from '../../screens/orders/OrdersWorkspaceScreen';
import { ProductsWorkspaceScreen, type ProductsWorkspaceProps } from '../../screens/products/ProductsWorkspaceScreen';
import { BusinessOverviewScreen, type BusinessOverviewProps } from '../../screens/command-center/BusinessOverviewScreen';
import { ordersFixture, productsFixture, overviewFixture } from './commerceFixtures';
export function OrdersScenario(props:Partial<OrdersWorkspaceProps>) {
  const {dateRange}=useShellDateRange();return <OrdersWorkspaceScreen initialView={ordersRouteView(currentProductSourcePath())} state="ready" {...props} data={props.data===undefined?ordersFixture(dateRange):props.data}/>;
}
export function ProductsScenario(props:Partial<ProductsWorkspaceProps>) {
  const {dateRange}=useShellDateRange(),{params}=useProductQuery();const asOf=params.get('inventoryAsOf')??dateRange.to;
  return <ProductsWorkspaceScreen initialView={productsRouteView(currentProductSourcePath())} state="ready" {...props} data={props.data===undefined?productsFixture(dateRange,asOf):props.data}/>;
}
export function OverviewScenario(props:Partial<BusinessOverviewProps>) {
  const {dateRange}=useShellDateRange(),{params}=useProductQuery();return <BusinessOverviewScreen state="ready" {...props} data={props.data===undefined?overviewFixture(dateRange,params.get('compare')==='year'?'year':'previous'):props.data}/>;
}
