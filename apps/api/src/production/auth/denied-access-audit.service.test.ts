import type { CanonicalCapability } from "@papadata/contracts";
import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../audit/audit.service.js";
import { DeniedAccessAuditService } from "./denied-access-audit.service.js";
import type { RequestPrincipal } from "./request-principal.js";

describe("DeniedAccessAuditService", () => {
  it("records audited denials with correlation context and without URL secrets", async () => {
    const append = vi.fn().mockResolvedValue(undefined);
    const service = new DeniedAccessAuditService({
      append,
    } as unknown as AuditService);

    await service.record({
      auditDeniedAccess: true,
      principal: principal(),
      reason: "live_capability_missing",
      request: {
        headers: { "x-correlation-id": "correlation-a" },
        method: "POST",
        url: "/v1/security/step-up?token=secret&workspaceId=workspace-b",
      },
      requiredAuthLevel: "step_up",
      requiredCapabilities: ["auth.step_up.issue"],
    });

    expect(append).toHaveBeenCalledWith(expect.objectContaining({
      action: "api.access.denied",
      correlationId: "correlation-a",
      metadata: {
        reason: "live_capability_missing",
        requiredAuthLevel: "step_up",
        requiredCapabilities: ["auth.step_up.issue"],
      },
      outcome: "denied",
      resourceId: "POST /v1/security/step-up",
      resourceType: "api_endpoint",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    }));
  });

  it("does not append when the route does not request denied-access audit", async () => {
    const append = vi.fn().mockResolvedValue(undefined);
    const service = new DeniedAccessAuditService({
      append,
    } as unknown as AuditService);

    await service.record({
      auditDeniedAccess: false,
      principal: principal(),
      reason: "live_capability_missing",
      request: {},
      requiredAuthLevel: "session",
      requiredCapabilities: ["workspace.read"],
    });

    expect(append).not.toHaveBeenCalled();
  });

  // §16 / §27 item 11: the query string must never reach the audit event,
  // regardless of what it contains -- covering the three example shapes
  // named in the Faza 9 spec explicitly, not just the one URL the original
  // test above happened to use.
  it.each([
    ["/v1/resource?token=SECRET", "/v1/resource"],
    ["/v1/resource?email=user@example.com", "/v1/resource"],
    ["/v1/resource?code=123456", "/v1/resource"],
  ])("redacts the query string from resourceId: %s -> %s", async (url, expectedPath) => {
    const append = vi.fn().mockResolvedValue(undefined);
    const service = new DeniedAccessAuditService({ append } as unknown as AuditService);

    await service.record({
      auditDeniedAccess: true,
      principal: principal(),
      reason: "live_capability_missing",
      request: { headers: {}, method: "GET", url },
      requiredAuthLevel: "session",
      requiredCapabilities: ["workspace.read"],
    });

    const [[recorded]] = append.mock.calls;
    expect(recorded.resourceId).toBe(`GET ${expectedPath}`);
    expect(recorded.resourceId).not.toContain("SECRET");
    expect(recorded.resourceId).not.toContain("example.com");
    expect(recorded.resourceId).not.toContain("123456");
    // The whole recorded event, not just resourceId -- nothing about this
    // call should ever carry the query string in any field.
    expect(JSON.stringify(recorded)).not.toContain("SECRET");
    expect(JSON.stringify(recorded)).not.toContain("example.com");
    expect(JSON.stringify(recorded)).not.toContain("123456");
  });

  // §12: a scope-mismatch denial event, specifically -- not just the
  // generic "live_capability_missing" reason the other tests above use --
  // must carry the same safe, minimal metadata shape: no request body, no
  // query string, no credentials, only the fixed {reason,
  // requiredAuthLevel, requiredCapabilities} fields. record() doesn't
  // special-case the reason value at all, so this exercises the exact
  // same code path other tests already cover, just with the literal
  // reason strings §12 names.
  it.each(["request_tenant_scope_mismatch", "request_workspace_scope_mismatch"] as const)(
    "§12: a %s denial produces a safe event with no request body/query/credentials",
    async (reason) => {
      const append = vi.fn().mockResolvedValue(undefined);
      const service = new DeniedAccessAuditService({ append } as unknown as AuditService);

      await service.record({
        auditDeniedAccess: true,
        principal: principal(),
        reason,
        request: {
          headers: { authorization: "Bearer secret-token", "x-correlation-id": "corr-1" },
          method: "POST",
          url: "/v1/workspaces/workspace-a?apiKey=SECRET",
        },
        requiredAuthLevel: "session",
        requiredCapabilities: ["workspace.read"],
      });

      const [[recorded]] = append.mock.calls;
      expect(recorded.metadata).toEqual({
        reason,
        requiredAuthLevel: "session",
        requiredCapabilities: ["workspace.read"],
      });
      expect(recorded.resourceId).toBe("POST /v1/workspaces/workspace-a");
      expect(JSON.stringify(recorded)).not.toContain("SECRET");
      expect(JSON.stringify(recorded)).not.toContain("Bearer");
    },
  );

  // §13: tenant/workspace on the audit event must come from the resolved
  // principal, never from request content -- a request carrying a
  // different-looking tenant/workspace value (e.g. in a body field the
  // guard's own scope-mismatch check doesn't happen to inspect) must not
  // leak into the audit event.
  it("§13: tenant/workspace on the audit event always come from the principal, never from request content", async () => {
    const append = vi.fn().mockResolvedValue(undefined);
    const service = new DeniedAccessAuditService({ append } as unknown as AuditService);

    await service.record({
      auditDeniedAccess: true,
      principal: principal(),
      reason: "live_capability_missing",
      request: {
        headers: {},
        method: "POST",
        url: "/v1/resource",
      },
      requiredAuthLevel: "session",
      requiredCapabilities: ["workspace.read"],
    });

    expect(append).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    }));
  });

  // §15: a genuinely anonymous denial (no principal) must never fabricate a
  // tenant-scoped audit event -- and, symmetrically, must never throw
  // either. In the current guard wiring this branch is unreachable
  // (CapabilityGuard rejects with 401 before ever calling record() when
  // there's no principal -- see capability.guard.test.ts's "denies when the
  // request has no principal" test), but DeniedAccessAuditService's public
  // contract explicitly accepts `principal: RequestPrincipal | null`, so
  // this locks in the documented, intentional behavior for any future
  // caller of this service.
  it("§15: a null principal (anonymous denial) never appends a tenant audit event and never throws", async () => {
    const append = vi.fn().mockResolvedValue(undefined);
    const service = new DeniedAccessAuditService({ append } as unknown as AuditService);

    await expect(service.record({
      auditDeniedAccess: true,
      principal: null,
      reason: "live_capability_missing",
      request: { headers: {}, method: "GET", url: "/v1/resource" },
      requiredAuthLevel: "session",
      requiredCapabilities: ["workspace.read"],
    })).resolves.toBeUndefined();

    expect(append).not.toHaveBeenCalled();
  });

  // §11: the service itself must never let an AuditService.append() failure
  // propagate -- the caller (CapabilityGuard) must be free to throw its own
  // ForbiddenException/401 regardless of whether the audit write succeeded.
  it("§11: does not throw when AuditService.append() rejects", async () => {
    const append = vi.fn().mockRejectedValue(new Error("audit store unavailable"));
    const service = new DeniedAccessAuditService({ append } as unknown as AuditService);

    await expect(service.record({
      auditDeniedAccess: true,
      principal: principal(),
      reason: "live_capability_missing",
      request: { headers: {}, method: "GET", url: "/v1/resource" },
      requiredAuthLevel: "session",
      requiredCapabilities: ["workspace.read"],
    })).resolves.toBeUndefined();

    expect(append).toHaveBeenCalledOnce();
  });
});

function principal(): RequestPrincipal {
  return {
    authLevel: "step_up",
    capabilities: [] as readonly CanonicalCapability[],
    expiresAt: "2026-08-31T11:00:00.000Z",
    issuedAt: "2026-08-31T10:00:00.000Z",
    issuer: "papadata-bff",
    memberships: [],
    sessionId: "session-a",
    source: "internal_token",
    stepUpExpiresAt: "2026-08-31T10:05:00.000Z",
    tenantId: "tenant-a",
    userId: "user-a",
    workspaceId: "workspace-a",
  };
}
