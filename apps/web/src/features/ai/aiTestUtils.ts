import {
  asTenantId,
  asUserId,
  asWorkspaceId,
  type ApplicationSessionContext,
  type Capability,
} from '../../domain-contracts';
import { createApplicationSessionContext } from '../../shell';
import {
  createReferenceWave4Analytics,
  wave4Period,
} from '../analytics/analyticsTestUtils';
import {
  aiContextSchema,
  approvedAIUseCases,
  asAIUseCaseId,
  type AIContext,
} from './aiContracts';
import {
  createAIReadAccessContext,
  LocalAIRuntime,
} from './localAiRuntime';

function uniqueCapabilities(values: readonly Capability[]): Capability[] {
  return [...new Set(values)];
}

export function withAIAccess(
  context: ApplicationSessionContext,
): ApplicationSessionContext {
  const aiContext = createAIReadAccessContext(context);

  return {
    ...aiContext,
    capabilities: uniqueCapabilities(aiContext.capabilities),
  };
}

export function createWave5Context(): ApplicationSessionContext {
  return withAIAccess(createApplicationSessionContext());
}

export function createForeignWave5Context(): ApplicationSessionContext {
  return withAIAccess(createApplicationSessionContext({
    tenantId: asTenantId('ten_baltic'),
    userId: asUserId('usr_multi_org'),
    workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
  }));
}

export function createWave5AIContext(
  context: ApplicationSessionContext,
  input: Partial<AIContext> = {},
): AIContext {
  return aiContextSchema.parse({
    currency: context.currency,
    dataScope: 'workspace',
    period: wave4Period,
    readiness: 'READY',
    resourceId: input.resourceId ?? 'command_center',
    resourceType: input.resourceType ?? 'Workspace',
    snapshotId: input.snapshotId ?? null,
    surface: input.surface ?? 'command_center',
    tenantId: context.tenant.tenantId,
    timezone: context.timezone,
    useCaseId: input.useCaseId ?? asAIUseCaseId('uc_command_center_analysis'),
    workspaceId: context.activeWorkspace.workspaceId,
    ...input,
  });
}

export function createReferenceWave5AI(options: {
  useCaseId?: AIContext['useCaseId'];
} = {}) {
  const wave4 = createReferenceWave4Analytics();
  const context = withAIAccess(wave4.context);
  const runtime = new LocalAIRuntime(wave4.runtime);
  const readySnapshot = wave4.runtime
    .getMetricSnapshots(context)
    .find((snapshot) => snapshot.metricCode === 'order_count' && snapshot.readiness === 'READY');
  const aiContext = createWave5AIContext(context, {
    resourceId: readySnapshot?.id ?? 'command_center',
    resourceType: readySnapshot ? 'MetricSnapshot' : 'Workspace',
    snapshotId: readySnapshot?.id ?? null,
    useCaseId: options.useCaseId ?? asAIUseCaseId('uc_command_center_analysis'),
  });
  const result = runtime.runAssistant(context, {
    content: 'Wyjaśnij aktualny Command Center i wskaż evidence.',
    context: aiContext,
    environment: 'local_synthetic',
  });

  return {
    aiContext,
    analyticsRuntime: wave4.runtime,
    context,
    result,
    runtime,
    useCases: approvedAIUseCases,
  };
}
