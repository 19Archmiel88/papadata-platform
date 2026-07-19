import {
  createContext,
  useContext,
} from 'react';

import type { AuthUser, Membership, Tenant, Workspace } from '../contracts/auth';
import {
  asAuditEventId,
  asCapability,
  asCorrelationId,
  asOperationId,
  applicationSessionContextSchema,
  auditEventSchema,
  createWorkspaceCacheKey,
  domainContractVersion,
  operationStatusSchema,
  resolveWorkspaceChange,
  validateTenantWorkspacePair,
  type ApplicationSessionContext,
  type AuditEvent,
  type Capability,
  type CorrelationId,
  type Entitlement,
  type OperationStatus,
  type Readiness,
  type Role,
  type TenantId,
  type UserId,
  type WorkspaceCacheKey,
  type WorkspaceChangeResolution,
  type WorkspaceId,
} from '../domain-contracts';
import {
  localAuthMemberships,
  localAuthTenants,
  localAuthUsers,
  localAuthWorkspaces,
} from '../fixtures/auth-domain';

export const foundationCapabilities = {
  auditRead: asCapability('audit:read'),
  billingRead: asCapability('billing:read'),
  commandCenterView: asCapability('command-center:view'),
  datasetRead: asCapability('dataset:read'),
  evidenceRead: asCapability('evidence:read'),
  integrationConnect: asCapability('integration:connect'),
  integrationSync: asCapability('integration:sync'),
  kpiRead: asCapability('kpi:read'),
  recommendationDecide: asCapability('recommendation:decide'),
  workspaceManage: asCapability('workspace:manage'),
} as const satisfies Record<string, Capability>;

export type WorkspaceScope = {
  tenantId: TenantId;
  workspaceId: WorkspaceId;
};

export type WorkspaceRuntimeDecision =
  | {
      accepted: true;
      correlationId: CorrelationId;
    }
  | {
      accepted: false;
      correlationId: CorrelationId;
      reason:
        | 'foreign_tenant'
        | 'foreign_workspace'
        | 'late_response'
        | 'missing_workspace'
        | 'workspace_tenant_mismatch';
    };

export type WorkspaceRequestToken = WorkspaceScope & {
  correlationId: CorrelationId;
  generation: number;
  requestId: string;
};

type WorkspaceRuntimeOptions = {
  actor?: {
    actorId: UserId;
    roles: readonly Role[];
  };
  initialScope: WorkspaceScope;
  now?: () => string;
  tenants?: readonly Pick<Tenant, 'tenantId'>[];
  workspaces?: readonly Pick<Workspace, 'tenantId' | 'workspaceId'>[];
};

type RuntimeCacheEntry = {
  key: string;
  scope: WorkspaceScope;
  value: unknown;
};

type RuntimeDraftEntry = {
  draftId: string;
  scope: WorkspaceScope;
  value: unknown;
};

function formatId(prefix: string, index: number): string {
  return `${prefix}_${index.toString().padStart(4, '0')}`;
}

function sameScope(left: WorkspaceScope, right: WorkspaceScope): boolean {
  return left.tenantId === right.tenantId && left.workspaceId === right.workspaceId;
}

function createAuditEvent(input: {
  actor?: WorkspaceRuntimeOptions['actor'];
  correlationId: CorrelationId;
  eventIndex: number;
  eventType: string;
  occurredAt: string;
  reason?: string;
  result: AuditEvent['result'];
  scope?: WorkspaceScope;
  source: AuditEvent['source'];
}): AuditEvent {
  return auditEventSchema.parse({
    actor: input.actor
      ? {
          actorId: input.actor.actorId,
          roles: [...input.actor.roles],
        }
      : undefined,
    auditEventId: asAuditEventId(formatId('aud_fnd', input.eventIndex)),
    correlationId: input.correlationId,
    eventType: input.eventType,
    occurredAt: input.occurredAt,
    reason: input.reason,
    result: input.result,
    source: input.source,
    tenantId: input.scope?.tenantId,
    workspaceId: input.scope?.workspaceId,
  });
}

export type WorkspaceRuntime = ReturnType<typeof createWorkspaceRuntime>;

export function createWorkspaceRuntime(options: WorkspaceRuntimeOptions) {
  const tenants = options.tenants ?? localAuthTenants;
  const workspaces = options.workspaces ?? localAuthWorkspaces;
  const now = options.now ?? (() => new Date().toISOString());
  const activeQueries = new Set<string>();
  const streams = new Set<string>();
  const cache = new Map<string, RuntimeCacheEntry>();
  const drafts = new Map<string, RuntimeDraftEntry>();
  const auditEvents: AuditEvent[] = [];
  let eventIndex = 0;
  let generation = 0;
  let requestIndex = 0;
  let currentScope = { ...options.initialScope };

  function nextCorrelationId(): CorrelationId {
    requestIndex += 1;

    return asCorrelationId(formatId('cor_fnd', requestIndex));
  }

  function recordAudit(input: {
    correlationId?: CorrelationId;
    eventType: string;
    reason?: string;
    result: AuditEvent['result'];
    scope?: WorkspaceScope;
    source?: AuditEvent['source'];
  }): AuditEvent {
    eventIndex += 1;
    const event = createAuditEvent({
      actor: options.actor,
      correlationId: input.correlationId ?? nextCorrelationId(),
      eventIndex,
      eventType: input.eventType,
      occurredAt: now(),
      reason: input.reason,
      result: input.result,
      scope: input.scope ?? currentScope,
      source: input.source ?? 'app_shell',
    });
    auditEvents.push(event);

    return event;
  }

  function decisionDenied(
    reason: Exclude<WorkspaceRuntimeDecision, { accepted: true }>['reason'],
    correlationId: CorrelationId,
    scope?: WorkspaceScope,
  ): WorkspaceRuntimeDecision {
    recordAudit({
      correlationId,
      eventType: 'workspace.scope_denied',
      reason,
      result: 'denied',
      scope,
    });

    return {
      accepted: false,
      correlationId,
      reason,
    };
  }

  function assertCurrentScope(scope: WorkspaceScope): WorkspaceRuntimeDecision {
    const correlationId = nextCorrelationId();

    if (scope.tenantId !== currentScope.tenantId) {
      return decisionDenied('foreign_tenant', correlationId, scope);
    }

    if (scope.workspaceId !== currentScope.workspaceId) {
      return decisionDenied('foreign_workspace', correlationId, scope);
    }

    return {
      accepted: true,
      correlationId,
    };
  }

  function makeCacheKey(scope: string, version: string): string {
    return createWorkspaceCacheKey({
      contractVersion: domainContractVersion,
      scope,
      tenantId: currentScope.tenantId,
      version,
      workspaceId: currentScope.workspaceId,
    });
  }

  return {
    acceptOperationStatus(status: OperationStatus): WorkspaceRuntimeDecision {
      const parsed = operationStatusSchema.parse(status);

      if (!parsed.tenantId || !parsed.workspaceId) {
        return decisionDenied('missing_workspace', parsed.correlationId);
      }

      if (parsed.tenantId !== currentScope.tenantId) {
        return decisionDenied('foreign_tenant', parsed.correlationId, {
          tenantId: parsed.tenantId,
          workspaceId: parsed.workspaceId,
        });
      }

      if (parsed.workspaceId !== currentScope.workspaceId) {
        return decisionDenied('foreign_workspace', parsed.correlationId, {
          tenantId: parsed.tenantId,
          workspaceId: parsed.workspaceId,
        });
      }

      return {
        accepted: true,
        correlationId: parsed.correlationId,
      };
    },
    assertAiRetrievalResource(scope: WorkspaceScope): WorkspaceRuntimeDecision {
      const decision = assertCurrentScope(scope);

      if (!decision.accepted) {
        recordAudit({
          correlationId: decision.correlationId,
          eventType: 'ai.retrieval_denied',
          reason: decision.reason,
          result: 'denied',
          scope,
        });
      }

      return decision;
    },
    assertWorkspaceResource(scope: WorkspaceScope): WorkspaceRuntimeDecision {
      return assertCurrentScope(scope);
    },
    beginWorkspaceRequest(): WorkspaceRequestToken {
      const correlationId = nextCorrelationId();
      const requestId = formatId('req_fnd', requestIndex);
      activeQueries.add(requestId);

      return {
        correlationId,
        generation,
        requestId,
        tenantId: currentScope.tenantId,
        workspaceId: currentScope.workspaceId,
      };
    },
    clearScopedState(): void {
      activeQueries.clear();
      streams.clear();
      cache.clear();
      drafts.clear();
    },
    completeWorkspaceRequest(
      token: WorkspaceRequestToken,
      responseScope: WorkspaceScope = token,
    ): WorkspaceRuntimeDecision {
      activeQueries.delete(token.requestId);

      if (token.generation !== generation || !sameScope(token, currentScope)) {
        return decisionDenied('late_response', token.correlationId, responseScope);
      }

      if (!sameScope(responseScope, currentScope)) {
        return decisionDenied(
          responseScope.tenantId !== currentScope.tenantId
            ? 'foreign_tenant'
            : 'foreign_workspace',
          token.correlationId,
          responseScope,
        );
      }

      return {
        accepted: true,
        correlationId: token.correlationId,
      };
    },
    getAuditEvents(): readonly AuditEvent[] {
      return [...auditEvents];
    },
    getCache(scope: string, version: string): unknown {
      const key = createWorkspaceCacheKey({
        contractVersion: domainContractVersion,
        scope,
        tenantId: currentScope.tenantId,
        version,
        workspaceId: currentScope.workspaceId,
      });
      const entry = cache.get(key);

      if (!entry || !sameScope(entry.scope, currentScope)) {
        return undefined;
      }

      return entry.value;
    },
    getDraft(draftId: string): unknown {
      const entry = drafts.get(draftId);

      if (!entry || !sameScope(entry.scope, currentScope)) {
        return undefined;
      }

      return entry.value;
    },
    getGeneration(): number {
      return generation;
    },
    getScope(): WorkspaceScope {
      return { ...currentScope };
    },
    makeCacheKey,
    putCache(scope: string, version: string, value: unknown): string {
      const key = makeCacheKey(scope, version);
      cache.set(key, {
        key,
        scope: { ...currentScope },
        value,
      });

      return key;
    },
    putDraft(draftId: string, value: unknown): void {
      drafts.set(draftId, {
        draftId,
        scope: { ...currentScope },
        value,
      });
    },
    recordAudit,
    registerStream(streamId: string): void {
      streams.add(streamId);
    },
    switchWorkspace(next: WorkspaceScope): WorkspaceChangeResolution {
      const validation = validateTenantWorkspacePair(next, tenants, workspaces);

      if (!validation.ok) {
        const reason =
          validation.errorCode === 'WORKSPACE_TENANT_MISMATCH'
            ? 'workspace_tenant_mismatch'
            : 'missing_workspace';
        decisionDenied(reason, nextCorrelationId(), next);
        throw new Error(validation.errorCode);
      }

      const resolution = resolveWorkspaceChange(currentScope, next);

      if (resolution.changed) {
        generation += 1;
        currentScope = { ...next };
        this.clearScopedState();
        recordAudit({
          eventType: 'auth.workspace_changed',
          reason: 'workspace_switch_resets_scoped_state',
          result: 'success',
          scope: next,
        });
      }

      return resolution;
    },
  };
}

type ApplicationSessionContextInput = {
  correlationId?: CorrelationId;
  currency?: string;
  locale?: string;
  memberships?: readonly Membership[];
  readiness?: Readiness;
  tenantId?: TenantId;
  timezone?: string;
  userId?: UserId;
  workspaceId?: WorkspaceId;
};

function uniqueCapabilities(capabilities: readonly Capability[]): Capability[] {
  return [...new Set(capabilities)];
}

function capabilitiesForRoles(roles: readonly Role[]): Capability[] {
  const can = foundationCapabilities;

  if (roles.includes('tenant_owner')) {
    return uniqueCapabilities(Object.values(can));
  }

  if (roles.includes('workspace_admin')) {
    return uniqueCapabilities([
      can.commandCenterView,
      can.datasetRead,
      can.evidenceRead,
      can.integrationConnect,
      can.integrationSync,
      can.kpiRead,
      can.recommendationDecide,
      can.workspaceManage,
    ]);
  }

  if (roles.includes('analyst')) {
    return uniqueCapabilities([
      can.commandCenterView,
      can.datasetRead,
      can.evidenceRead,
      can.integrationSync,
      can.kpiRead,
      can.recommendationDecide,
    ]);
  }

  if (roles.includes('internal_support_operations')) {
    return uniqueCapabilities([can.auditRead, can.evidenceRead]);
  }

  return uniqueCapabilities([can.commandCenterView, can.evidenceRead, can.kpiRead]);
}

function entitlementsFromCapabilities(
  capabilities: readonly Capability[],
  scope: WorkspaceScope,
): Entitlement[] {
  return capabilities.map((capability) => ({
    capability,
    enabled: true,
    limitations: [],
    tenantId: scope.tenantId,
    workspaceId:
      capability === foundationCapabilities.billingRead ? undefined : scope.workspaceId,
  }));
}

function workspaceWithReadiness(workspace: Workspace, readiness?: Readiness): Workspace {
  if (!readiness) {
    return workspace;
  }

  return {
    ...workspace,
    readiness,
  };
}

export function createApplicationSessionContext(
  input: ApplicationSessionContextInput = {},
): ApplicationSessionContext {
  const user = localAuthUsers.find(
    (candidate) => candidate.userId === (input.userId ?? localAuthUsers[0]?.userId),
  );

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const tenantId = input.tenantId ?? localAuthTenants[0]?.tenantId;
  const workspaceId = input.workspaceId ?? localAuthWorkspaces[0]?.workspaceId;

  if (!tenantId || !workspaceId) {
    throw new Error('SESSION_SCOPE_NOT_CONFIGURED');
  }

  const tenant = localAuthTenants.find((candidate) => candidate.tenantId === tenantId);
  const workspace = localAuthWorkspaces.find(
    (candidate) => candidate.workspaceId === workspaceId,
  );

  if (!tenant || !workspace) {
    throw new Error('SESSION_SCOPE_NOT_FOUND');
  }

  const memberships =
    input.memberships ??
    localAuthMemberships.filter(
      (membership) =>
        membership.userId === user.userId &&
        membership.tenantId === tenantId &&
        membership.status === 'active',
    );
  const activeWorkspaceMemberships = memberships.filter(
    (membership) => membership.workspaceId === workspaceId,
  );
  const tenantWideRoles = memberships
    .map((membership) => membership.role)
    .filter((role) => role === 'tenant_owner');
  const roles = [...new Set([
    ...activeWorkspaceMemberships.map((membership) => membership.role),
    ...tenantWideRoles,
  ])];
  const capabilities = capabilitiesForRoles(roles);
  const workspaceIds = new Set(memberships.map((membership) => membership.workspaceId));
  const activeWorkspace = workspaceWithReadiness(workspace, input.readiness);
  const workspaces = localAuthWorkspaces
    .filter(
      (candidate) =>
        candidate.tenantId === tenantId &&
        (workspaceIds.has(candidate.workspaceId) || tenantWideRoles.includes('tenant_owner')),
    )
    .map((candidate) =>
      candidate.workspaceId === workspaceId
        ? activeWorkspace
        : candidate,
    );

  return applicationSessionContextSchema.parse({
    activeWorkspace,
    capabilities,
    contractVersion: domainContractVersion,
    correlationId: input.correlationId ?? asCorrelationId('cor_session_context'),
    currency: input.currency ?? 'PLN',
    entitlements: entitlementsFromCapabilities(capabilities, {
      tenantId,
      workspaceId,
    }),
    featureFlags: {
      commandCenter: true,
      referenceSlice: true,
      workspaceIsolation: true,
    },
    locale: input.locale ?? 'pl-PL',
    memberships,
    tenant,
    timezone: input.timezone ?? 'Europe/Warsaw',
    user: user satisfies AuthUser,
    workspaces,
  });
}

export type CapabilityDecision = {
  allowed: boolean;
  capability: Capability;
  explanation?: string;
};

export type SessionContextValue = ApplicationSessionContext & {
  activeWorkspaceId: WorkspaceId;
  auditEvents: readonly AuditEvent[];
  cacheVersion: string;
  currentTenant: WorkspaceScope;
  hasCapability: (capability: Capability) => boolean;
  makeCacheKey: (scope: Pick<WorkspaceCacheKey, 'scope' | 'version'>) => string;
  runtime: WorkspaceRuntime;
  switchWorkspace: (workspaceId: WorkspaceId) => WorkspaceChangeResolution;
  tenantId: TenantId;
};

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('SessionContextProvider is required');
  }

  return context;
}

export function useWorkspaceContext(): WorkspaceScope {
  const context = useSessionContext();

  return context.currentTenant;
}

export function useCapability(capability: Capability): CapabilityDecision {
  const context = useSessionContext();
  const allowed = context.hasCapability(capability);

  return {
    allowed,
    capability,
    explanation: allowed
      ? undefined
      : 'Brak wymaganej capability dla aktywnego workspace.',
  };
}

export function createOperationStatus(input: {
  correlationId?: CorrelationId;
  operationId?: string;
  readiness?: Readiness;
  scope: WorkspaceScope;
  status: OperationStatus['status'];
}): OperationStatus {
  return operationStatusSchema.parse({
    contractVersion: domainContractVersion,
    correlationId: input.correlationId ?? asCorrelationId('cor_operation_status'),
    limitations: [],
    operationId: asOperationId(input.operationId ?? 'op_reference_sync'),
    readiness: input.readiness,
    status: input.status,
    tenantId: input.scope.tenantId,
    workspaceId: input.scope.workspaceId,
  });
}
