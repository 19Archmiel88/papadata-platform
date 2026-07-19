import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createWorkspaceCacheKey,
  domainContractVersion,
  type ApplicationSessionContext,
  type Capability,
  type AuditEvent,
  type WorkspaceId,
} from '../domain-contracts';
import { localAuthFixtureNow } from '../fixtures/auth-domain';
import {
  createApplicationSessionContext,
  createWorkspaceRuntime,
  SessionContext,
  type SessionContextValue,
} from './sessionContext';

type SessionContextProviderProps = {
  children: ReactNode;
  initialContext?: ApplicationSessionContext;
};

export function SessionContextProvider({
  children,
  initialContext,
}: SessionContextProviderProps) {
  const [context, setContext] = useState<ApplicationSessionContext>(
    () => initialContext ?? createApplicationSessionContext(),
  );
  const [auditEvents, setAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [runtime] = useState(() => {
    const roles = context.memberships
      .filter((membership) => membership.workspaceId === context.activeWorkspace.workspaceId)
      .map((membership) => membership.role);

    return createWorkspaceRuntime({
      actor: {
        actorId: context.user.userId,
        roles,
      },
      initialScope: {
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      now: () => localAuthFixtureNow,
    });
  });

  const hasCapability = useCallback(
    (capability: Capability) =>
      context.capabilities.includes(capability) &&
      context.entitlements.some(
        (entitlement) =>
          entitlement.capability === capability &&
          entitlement.enabled &&
          entitlement.tenantId === context.tenant.tenantId &&
          (!entitlement.workspaceId ||
            entitlement.workspaceId === context.activeWorkspace.workspaceId),
      ),
    [context],
  );

  const switchWorkspace = useCallback(
    (workspaceId: WorkspaceId) => {
      const resolution = runtime.switchWorkspace({
        tenantId: context.tenant.tenantId,
        workspaceId,
      });

      if (resolution.changed) {
        const nextContext = createApplicationSessionContext({
          correlationId: context.correlationId,
          tenantId: context.tenant.tenantId,
          userId: context.user.userId,
          workspaceId,
        });
        setContext(nextContext);
        setAuditEvents(runtime.getAuditEvents());
      }

      return resolution;
    },
    [context, runtime],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      ...context,
      activeWorkspaceId: context.activeWorkspace.workspaceId,
      auditEvents,
      cacheVersion: domainContractVersion,
      currentTenant: {
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
      hasCapability,
      makeCacheKey: (scope) =>
        createWorkspaceCacheKey({
          contractVersion: domainContractVersion,
          scope: scope.scope,
          tenantId: context.tenant.tenantId,
          version: scope.version,
          workspaceId: context.activeWorkspace.workspaceId,
        }),
      runtime,
      switchWorkspace,
      tenantId: context.tenant.tenantId,
    }),
    [auditEvents, context, hasCapability, runtime, switchWorkspace],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
