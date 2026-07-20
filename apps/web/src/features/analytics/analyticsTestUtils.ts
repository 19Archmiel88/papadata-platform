import {
  asCapability,
  asTenantId,
  asUserId,
  asWorkspaceId,
  type ApplicationSessionContext,
  type Capability,
} from '../../domain-contracts';
import { createApplicationSessionContext } from '../../shell';
import {
  createReferenceWave3Pipeline,
} from '../data-quality/dataQualityTestUtils';
import {
  analyticsCapabilities,
  type AnalyticsMetricCode,
} from './analyticsContracts';
import {
  createAnalyticsReadAccessContext,
  LocalAnalyticsRuntime,
} from './localAnalyticsRuntime';

export const wave4Period = {
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-19T00:00:00.000Z',
} as const;

function uniqueCapabilities(values: readonly Capability[]): Capability[] {
  return [...new Set(values)];
}

export function withAnalyticsAccess(
  context: ApplicationSessionContext,
): ApplicationSessionContext {
  return createAnalyticsReadAccessContext({
    ...context,
    capabilities: uniqueCapabilities([
      ...context.capabilities,
      asCapability('analytics:workspace:view'),
      ...Object.values(analyticsCapabilities),
    ]),
  });
}

export function createWave4Context(): ApplicationSessionContext {
  return withAnalyticsAccess(createApplicationSessionContext());
}

export function createForeignWave4Context(): ApplicationSessionContext {
  return withAnalyticsAccess(createApplicationSessionContext({
    tenantId: asTenantId('ten_baltic'),
    userId: asUserId('usr_multi_org'),
    workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
  }));
}

type ReferenceOptions = Parameters<typeof createReferenceWave3Pipeline>[0];

export function createReferenceWave4Analytics(options: {
  metricCodes?: readonly AnalyticsMetricCode[];
  wave3Options?: ReferenceOptions;
} = {}): {
  context: ApplicationSessionContext;
  runtime: LocalAnalyticsRuntime;
} {
  const wave3 = createReferenceWave3Pipeline(options.wave3Options);
  const context = withAnalyticsAccess(wave3.context);
  const runtime = new LocalAnalyticsRuntime();
  runtime.ingestDataQualitySnapshot(context, wave3.runtime.getSnapshot());
  runtime.calculateMetrics(context, {
    currency: context.currency,
    metricCodes: options.metricCodes,
    period: wave4Period,
    timezone: context.timezone,
  });

  return {
    context,
    runtime,
  };
}
