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
  asProviderId,
  integrationCapabilities,
  type SourceRecord,
} from '../integrations/integrationContracts';
import {
  createDefaultIntegrationContext,
  createWave2Runtime,
  type LocalIntegrationRuntime,
} from '../integrations/localIntegrationRuntime';
import {
  dataQualityCapabilities,
  type DatasetId,
} from './dataQualityContracts';
import { LocalDataQualityRuntime } from './localDataQualityRuntime';

export const wave3Period = {
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-19T00:00:00.000Z',
} as const;

function uniqueCapabilities(values: readonly Capability[]): Capability[] {
  return [...new Set(values)];
}

export function withDataQualityAccess(
  context: ApplicationSessionContext,
): ApplicationSessionContext {
  const capabilities = uniqueCapabilities([
    ...context.capabilities,
    integrationCapabilities.backfill,
    integrationCapabilities.connect,
    integrationCapabilities.disconnect,
    integrationCapabilities.read,
    integrationCapabilities.replay,
    integrationCapabilities.sync,
    ...Object.values(dataQualityCapabilities),
  ]);

  return {
    ...context,
    capabilities,
    entitlements: [
      ...context.entitlements,
      {
        capability: integrationCapabilities.connect,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      {
        capability: integrationCapabilities.sync,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      {
        capability: integrationCapabilities.read,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      {
        capability: integrationCapabilities.backfill,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      {
        capability: integrationCapabilities.replay,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      {
        capability: integrationCapabilities.disconnect,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      {
        capability: asCapability('integrations:commerce'),
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      ...Object.values(dataQualityCapabilities).map((capability) => ({
        capability,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      })),
    ],
  };
}

export function createWave3Context(): ApplicationSessionContext {
  return withDataQualityAccess(createDefaultIntegrationContext());
}

export function createForeignWave3Context(): ApplicationSessionContext {
  const context = createApplicationSessionContext({
    tenantId: asTenantId('ten_baltic'),
    userId: asUserId('usr_multi_org'),
    workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
  });

  return withDataQualityAccess(context);
}

export function createReferenceWave3Pipeline(options: {
  payloadPatch?: (payload: Record<string, string | number | boolean>, record: SourceRecord) => Record<string, string | number | boolean>;
} = {}): {
  context: ApplicationSessionContext;
  datasetId: DatasetId;
  integrationRuntime: LocalIntegrationRuntime;
  runtime: LocalDataQualityRuntime;
} {
  const integrationRuntime = createWave2Runtime({ testMode: true });
  const context = createWave3Context();
  const connection = integrationRuntime.createConnection(context, {
    externalAccountRef: 'woo_account_northstar',
    grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
    idempotencyKey: 'idem_wave3_connect',
    providerId: asProviderId('woocommerce'),
    requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
  }).connection;
  const job = integrationRuntime.createSyncJob(context, {
    connectionId: connection.id,
    idempotencyKey: 'idem_wave3_initial_orders',
    range: {
      mode: 'bounded',
      ...wave3Period,
    },
    streams: ['orders'],
    type: 'INITIAL',
  }).job;
  integrationRuntime.runJob(context, job.id);
  const runtime = new LocalDataQualityRuntime();
  const snapshot = integrationRuntime.getSnapshot();
  const result = runtime.processSourceSnapshot(context, {
    ...snapshot,
    currency: 'PLN',
    period: wave3Period,
    payloadResolver: (record: SourceRecord) => {
      const payload = integrationRuntime.getSourcePayloadForPipeline(context, record.id);

      return options.payloadPatch ? options.payloadPatch(payload, record) : payload;
    },
    timezone: 'Europe/Warsaw',
  });

  return {
    context,
    datasetId: result.dataset.id,
    integrationRuntime,
    runtime,
  };
}
