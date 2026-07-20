import { describe, expect, it } from 'vitest';

import {
  createReferenceWave4Analytics,
  wave4Period,
} from './analyticsTestUtils';

describe('Fala 4 local analytics runtime', () => {
  it('prowadzi canonical data do KPI, MetricSnapshot, projection, Trust Drawer, drill-down i exportu', () => {
    const { context, runtime } = createReferenceWave4Analytics();
    const commandCenter = runtime.getCommandCenterProjection(context);
    const orderCount = commandCenter.kpis.find(
      (kpi) => kpi.snapshot.metricCode === 'order_count',
    );
    const grossRevenue = commandCenter.kpis.find(
      (kpi) => kpi.snapshot.metricCode === 'gross_revenue',
    );

    expect(orderCount?.snapshot).toMatchObject({
      readiness: 'READY',
      value: '2',
      metricDefinitionVersion: 'metric.order-count.v1',
    });
    expect(grossRevenue?.snapshot).toMatchObject({
      readiness: 'READY',
      value: '1150.00',
      currency: 'PLN',
    });
    expect(commandCenter.modules.find((module) => module.moduleId === 'orders')?.status).toBe(
      'IMPLEMENTED',
    );
    expect(commandCenter.modules.find((module) => module.moduleId === 'products')?.status).toBe(
      'GATED',
    );

    if (!orderCount) {
      throw new Error('ORDER_COUNT_SNAPSHOT_MISSING');
    }

    const trust = runtime.openTrustDrawer(context, orderCount.snapshot.id);
    const drillDown = runtime.openDrillDown(context, orderCount.snapshot.id);
    const reconciliation = runtime.getSnapshotReconciliation(
      context,
      orderCount.snapshot.id,
    );
    const exportObject = runtime.requestMetricExport(context, {
      metricSnapshotIds: commandCenter.kpis.map((kpi) => kpi.snapshot.id),
      period: wave4Period,
    });

    expect(trust.definition.kpiId).toBe('order_count');
    expect(trust.lineageLinks.length).toBeGreaterThan(0);
    expect(drillDown.canonicalOrderIds).toHaveLength(2);
    expect(reconciliation.status).toBe('MATCHED');
    expect(exportObject).toMatchObject({
      classification: 'CUSTOMER_CONFIDENTIAL',
      retentionClass: 'R-EXPORT',
      status: 'READY',
    });
  });

  it('utrzymuje ten sam KPI w stanach READY, PARTIAL i INVALID bez zamiany braku na zero', () => {
    const ready = createReferenceWave4Analytics();
    const partial = createReferenceWave4Analytics({
      wave3Options: {
        payloadPatch: (payload, record) =>
          record.externalId === 'woo_order_1001'
            ? {
                ...payload,
                status: 'provider_new_status',
              }
            : payload,
      },
    });
    const invalid = createReferenceWave4Analytics({
      wave3Options: {
        payloadPatch: (payload, record) =>
          record.externalId === 'woo_order_1001'
            ? {
                ...payload,
                currency: 'XYZ',
                gross: false,
              }
            : payload,
      },
    });

    const readyOrderCount = ready.runtime
      .getMetricHistory(ready.context, 'order_count')[0];
    const partialOrderCount = partial.runtime
      .getMetricHistory(partial.context, 'order_count')[0];
    const invalidOrderCount = invalid.runtime
      .getMetricHistory(invalid.context, 'order_count')[0];

    expect(readyOrderCount?.readiness).toBe('READY');
    expect(partialOrderCount?.readiness).toBe('PARTIAL');
    expect(invalidOrderCount?.readiness).toBe('INVALID');
    expect(invalidOrderCount?.value).toBeNull();
    expect(invalidOrderCount?.missingData[0]?.confirmedZero).toBe(false);
  });

  it('obsługuje drivers, comparison, history, alerts, tasks i monitoring', () => {
    const { context, runtime } = createReferenceWave4Analytics({
      wave3Options: {
        payloadPatch: (payload, record) =>
          record.externalId === 'woo_order_1001'
            ? {
                ...payload,
                status: 'provider_new_status',
              }
            : payload,
      },
    });
    const partialSnapshot = runtime.getMetricHistory(context, 'order_count')[0];

    if (!partialSnapshot) {
      throw new Error('PARTIAL_SNAPSHOT_MISSING');
    }

    expect(runtime.getMetricTrend(context, 'order_count')).toHaveLength(2);
    expect(runtime.getMetricDrivers(context, 'order_count')[0]?.label).toBe(
      'Ograniczenie danych',
    );
    expect(runtime.getMetricComparison(context, 'order_count').label).toMatch(/Bieżący/);
    expect(runtime.listAlerts(context).length).toBeGreaterThan(0);
    expect(runtime.listTasks(context).length).toBeGreaterThan(0);
    expect(runtime.getMonitoring().alertCount).toBeGreaterThan(0);
    expect(runtime.getSnapshotEvidence(context, partialSnapshot.id)).toContain(
      'docs/evidence/wave-4/pipeline.md',
    );
  });
});
