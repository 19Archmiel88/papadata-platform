import { describe, expect, it } from 'vitest';

import {
  analyticsStoryFixtureSchema,
  analyticsStoryFixtures,
} from './analyticsFixtures';

describe('Fala 4 analytics fixtures', () => {
  it('waliduje wszystkie fixtures runtime schema i zachowuje tenant/workspace', () => {
    const fixtures = Object.values(analyticsStoryFixtures).map((fixture) =>
      analyticsStoryFixtureSchema.parse(fixture),
    );

    expect(fixtures.length).toBeGreaterThanOrEqual(24);
    expect(
      fixtures.every(
        (fixture) =>
          fixture.commandCenter.meta.tenantId === fixture.context.tenant.tenantId &&
          fixture.commandCenter.meta.workspaceId === fixture.context.activeWorkspace.workspaceId,
      ),
    ).toBe(true);
  });

  it('ma wymagane stany bramy READY, PARTIAL i INVALID dla tego samego KPI', () => {
    expect(analyticsStoryFixtures.default.commandCenter.kpis[0]?.snapshot).toMatchObject({
      metricCode: 'order_count',
      readiness: 'READY',
    });
    expect(analyticsStoryFixtures.partial.commandCenter.kpis[0]?.snapshot).toMatchObject({
      metricCode: 'order_count',
      readiness: 'PARTIAL',
    });
    expect(analyticsStoryFixtures.invalid.commandCenter.kpis[0]?.snapshot).toMatchObject({
      metricCode: 'order_count',
      readiness: 'INVALID',
      value: null,
    });
  });

  it('nie pokazuje modułów bez danych jako aktywnych atrap', () => {
    expect(analyticsStoryFixtures.products_gated.module.status).toBe('GATED');
    expect(analyticsStoryFixtures.marketplace_gated.module.status).toBe('GATED');
    expect(analyticsStoryFixtures.profitability_blocked.module.status).toBe('GATED');
    expect(analyticsStoryFixtures.orders.module.status).toBe('IMPLEMENTED');
  });
});
