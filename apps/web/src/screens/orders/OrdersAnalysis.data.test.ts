import { describe, expect, it } from 'vitest';
import { commandCenterDemoRange } from '../../fixtures/command-center/commandCenterDemoSeed';
import { sampleOrders } from './OrdersScreen.data';
import { deriveOrdersAnalysis, filterOrderQueue } from './OrdersAnalysis.data';

describe('Orders analysis scope and work queues', () => {
  it('calculates KPI totals from the same observed orders as the table', () => {
    const result = deriveOrdersAnalysis(commandCenterDemoRange);
    expect(result.counts.all).toBe(sampleOrders.length);
    expect(result.gross).toBe(
      Math.round(sampleOrders.reduce((sum, row) => sum + row.grossValue, 0) * 100) / 100,
    );
    expect(result.refunded).toBe(sampleOrders.reduce((sum, row) => sum + row.refund, 0));
    expect(result.counts.attention).toBe(filterOrderQueue(result.rows, 'attention').length);
  });
  it('combines inclusive dates and source before computing indicators', () => {
    const result = deriveOrdersAnalysis(
      { ...commandCenterDemoRange, from: '2026-08-26', to: '2026-08-26' },
      'BaseLinker',
    );
    expect(result.rows.length).toBeGreaterThan(0);
    expect(
      result.rows.every((row) => row.date.startsWith('2026-08-26') && row.channel === 'BaseLinker'),
    ).toBe(true);
    expect(result.counts.all).toBe(result.rows.length);
  });
  it('does not count shipped orders with a historic breach as an active delay', () => {
    const result = deriveOrdersAnalysis(commandCenterDemoRange, 'all', [
      {
        ...sampleOrders[0],
        fulfillmentStatus: 'Fulfilled',
        paymentStatus: 'Paid',
        slaStatus: 'breached',
      },
    ]);
    expect(result.late).toHaveLength(0);
    expect(result.counts.attention).toBe(0);
    expect(result.counts.fulfilled).toBe(1);
  });
  it('does not send failed payments to the paid dispatch queue or double count attention', () => {
    const result = deriveOrdersAnalysis(commandCenterDemoRange, 'all', [
      {
        ...sampleOrders[0],
        paymentStatus: 'Failed',
        slaStatus: 'breached',
        fulfillmentStatus: 'Pending',
      },
    ]);
    expect(result.counts.attention).toBe(1);
    expect(result.counts.processing).toBe(0);
    expect(result.counts.payment_failed).toBe(1);
  });
  it('returns no observations for invalid and unobserved dates', () => {
    expect(deriveOrdersAnalysis({ ...commandCenterDemoRange, from: '', to: '' }).valid).toBe(false);
    expect(
      deriveOrdersAnalysis({ ...commandCenterDemoRange, from: '2030-01-01', to: '2030-01-02' })
        .rows,
    ).toHaveLength(0);
  });
});
