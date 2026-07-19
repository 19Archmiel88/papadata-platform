import {
  asCorrelationId,
  domainContractVersion,
  errorEnvelopeSchema,
  type Capability,
  type CorrelationId,
  type ErrorEnvelope,
  type OperationStatus,
  type TenantId,
  type WorkspaceId,
} from '../../domain-contracts';
import type {
  WorkspaceRuntime,
  WorkspaceRuntimeDecision,
  WorkspaceScope,
} from '../../shell/sessionContext';

export type ApiClientHeaders = {
  'x-correlation-id': CorrelationId;
  'x-contract-version': typeof domainContractVersion;
  'x-tenant-id': TenantId;
  'x-workspace-id': WorkspaceId;
};

export type ApiClientResult<TValue> =
  | {
      correlationId: CorrelationId;
      status: 'success';
      value: TValue;
    }
  | {
      error: ErrorEnvelope;
      status: 'error';
    };

type WorkspaceResource = WorkspaceScope & {
  resourceId: string;
};

type PapaDataApiClientOptions = {
  runtime: WorkspaceRuntime;
};

const sensitiveKeyPattern = /password|token|secret|mfa|code|cookie/i;

export function redactTelemetryPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactTelemetryPayload(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
    key,
    sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactTelemetryPayload(entry),
  ]);

  return Object.fromEntries(entries);
}

function errorFromDecision(
  decision: Exclude<WorkspaceRuntimeDecision, { accepted: true }>,
): ErrorEnvelope {
  return errorEnvelopeSchema.parse({
    contractVersion: domainContractVersion,
    correlationId: decision.correlationId,
    error: {
      code: decision.reason.toUpperCase(),
      errorClass: 'authorization',
      message: 'Zasób nie należy do aktywnego workspace.',
      retrySafe: false,
    },
    limitations: ['Backend ponownie waliduje tenantId i workspaceId.'],
    status: 'error',
  });
}

export function createApiClientHeaders(
  runtime: WorkspaceRuntime,
  correlationId: CorrelationId = asCorrelationId('cor_api_client'),
): ApiClientHeaders {
  const scope = runtime.getScope();

  return {
    'x-contract-version': domainContractVersion,
    'x-correlation-id': correlationId,
    'x-tenant-id': scope.tenantId,
    'x-workspace-id': scope.workspaceId,
  };
}

export function createPapaDataApiClient({ runtime }: PapaDataApiClientOptions) {
  return {
    createHeaders(correlationId?: CorrelationId): ApiClientHeaders {
      return createApiClientHeaders(runtime, correlationId);
    },
    readWorkspaceResource<TValue extends WorkspaceResource>(
      resource: TValue,
      capability?: Capability,
    ): ApiClientResult<TValue> {
      const token = runtime.beginWorkspaceRequest();
      const decision = runtime.completeWorkspaceRequest(token, resource);

      runtime.recordAudit({
        correlationId: token.correlationId,
        eventType: capability ? 'api.workspace_read_authorized' : 'api.workspace_read',
        reason: capability,
        result: decision.accepted ? 'success' : 'denied',
        scope: resource,
        source: 'api_client',
      });

      if (!decision.accepted) {
        return {
          error: errorFromDecision(decision),
          status: 'error',
        };
      }

      return {
        correlationId: token.correlationId,
        status: 'success',
        value: resource,
      };
    },
    mutateWorkspaceResource<TValue extends WorkspaceResource>(
      resource: TValue,
      capability: Capability,
    ): ApiClientResult<TValue> {
      const token = runtime.beginWorkspaceRequest();
      const decision = runtime.completeWorkspaceRequest(token, resource);

      runtime.recordAudit({
        correlationId: token.correlationId,
        eventType: 'api.workspace_mutation',
        reason: capability,
        result: decision.accepted ? 'success' : 'denied',
        scope: resource,
        source: 'api_client',
      });

      if (!decision.accepted) {
        return {
          error: errorFromDecision(decision),
          status: 'error',
        };
      }

      return {
        correlationId: token.correlationId,
        status: 'success',
        value: resource,
      };
    },
    trackOperation(status: OperationStatus): ApiClientResult<OperationStatus> {
      const decision = runtime.acceptOperationStatus(status);

      if (!decision.accepted) {
        return {
          error: errorFromDecision(decision),
          status: 'error',
        };
      }

      return {
        correlationId: status.correlationId,
        status: 'success',
        value: status,
      };
    },
    reportError(payload: unknown): unknown {
      const redacted = redactTelemetryPayload(payload);
      runtime.recordAudit({
        eventType: 'api.error_reported',
        reason: 'redacted_payload',
        result: 'success',
        source: 'api_client',
      });

      return redacted;
    },
  };
}
