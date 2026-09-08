import type { DateRange } from '../../../../../contracts/ui-contract-types';
import { overviewDayCount } from '../command-center/CommandCenterScreen.data';
import { sampleOrders, type SampleOrder } from './OrdersScreen.data';

export type OrderSource = 'all' | SampleOrder['channel'];
export type OrderQueue =
  | 'all'
  | 'attention'
  | 'processing'
  | 'fulfilled'
  | 'payment_failed'
  | 'refunded';
export const orderQueueLabels: Record<OrderQueue, string> = {
  all: 'Wszystkie',
  attention: 'Wymagają uwagi',
  processing: 'Do wysłania',
  fulfilled: 'Wysłane',
  payment_failed: 'Błąd płatności',
  refunded: 'Ze zwrotem',
};
export const fulfillmentLabel = (order: SampleOrder) =>
  ({
    Fulfilled: 'Wysłane',
    Pending: 'Oczekujące',
    Processing: 'W realizacji',
  })[order.fulfillmentStatus];
export const isOrderLate = (order: SampleOrder) =>
  order.fulfillmentStatus !== 'Fulfilled' && order.slaStatus === 'breached';
export const needsOrderAttention = (order: SampleOrder) =>
  isOrderLate(order) || order.paymentStatus === 'Failed';

export function filterOrderQueue(rows: readonly SampleOrder[], queue: OrderQueue) {
  return rows.filter((order) => {
    switch (queue) {
      case 'attention':
        return needsOrderAttention(order);
      case 'processing':
        return order.fulfillmentStatus !== 'Fulfilled' && order.paymentStatus === 'Paid';
      case 'fulfilled':
        return order.fulfillmentStatus === 'Fulfilled';
      case 'payment_failed':
        return order.paymentStatus === 'Failed';
      case 'refunded':
        return order.refund > 0;
      default:
        return true;
    }
  });
}

export function deriveOrdersAnalysis(
  range: DateRange,
  source: OrderSource = 'all',
  observations: readonly SampleOrder[] = sampleOrders,
) {
  const dayCount = overviewDayCount(range);
  const valid = dayCount > 0 && dayCount <= 366;
  const rows = valid
    ? observations
        .filter((order) => {
          const day = order.date.slice(0, 10);
          return (
            day >= range.from && day <= range.to && (source === 'all' || order.channel === source)
          );
        })
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  return {
    valid,
    rows,
    counts: Object.fromEntries(
      Object.keys(orderQueueLabels).map((queue) => [
        queue,
        filterOrderQueue(rows, queue as OrderQueue).length,
      ]),
    ) as Record<OrderQueue, number>,
    late: rows.filter(isOrderLate),
    gross: Math.round(rows.reduce((sum, order) => sum + order.grossValue, 0) * 100) / 100,
    refunded: Math.round(rows.reduce((sum, order) => sum + order.refund, 0) * 100) / 100,
  };
}
