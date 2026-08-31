import "reflect-metadata";
import {
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { CanonicalCapability } from "@papadata/contracts";
import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../audit/audit.service.js";
import { CapabilityGuard } from "./capability.guard.js";
import { DeniedAccessAuditService } from "./denied-access-audit.service.js";
import type {
  LiveAuthorizationDecision,
  LivePrincipalAuthorizationService,
} from "./live-principal-authorization.service.js";
import type { RequestPrincipal, RequestWithPrincipal } from "./request-principal.js";
import {
  AuditDeniedAccess,
  RequireAuthLevel,
  RequireCapabilities,
} from "./route-policy.js";

describe("CapabilityGuard", () => {
  it("allows an authenticated route from live database capabilities", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.read")
      handler(): void {}
    }

    const liveAuthorization = liveAuthorizationMock({
      allowed: true,
      grantedCapabilities: ["workspace.read"],
      reason: null,
      source: "live_database",
    });
    const deniedAccessAudit = deniedAccessAuditMock();
    const guard = createGuard(liveAuthorization, deniedAccessAudit);
    const request = { principal: principal() };

    await expect(guard.canActivate(context(ExampleController, "handler", request)))
      .resolves.toBe(true);
    expect(liveAuthorization.authorize).toHaveBeenCalledOnce();
    expect(deniedAccessAudit.record).not.toHaveBeenCalled();
  });

  it("denies when the request has no principal, and never calls the denied-access audit (§15: anonymous authentication denial is distinct from authenticated authorization denial)", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.read")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const deniedAccessAudit = deniedAccessAuditMock();
    const guard = createGuard(liveAuthorizationMock(), deniedAccessAudit);

    await expect(guard.canActivate(context(ExampleController, "handler", {})))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(deniedAccessAudit.record).not.toHaveBeenCalled();
  });

  // §11 regression: a denial must still be a DENY even when the audit write
  // itself throws. Uses the *real* DeniedAccessAuditService (not the mock
  // used everywhere else in this file) wrapping a failing AuditService, so
  // this exercises the actual try/catch in denied-access-audit.service.ts,
  // not just the guard's own control flow.
  it("§11: authorization denial still results in DENY even when the audit write fails", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.manage")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const failingAppend = vi.fn().mockRejectedValue(new Error("audit store unavailable"));
    const realDeniedAccessAudit = new DeniedAccessAuditService({ append: failingAppend } as unknown as AuditService);
    const liveAuthorization = liveAuthorizationMock({
      allowed: false,
      grantedCapabilities: [],
      reason: "live_capability_missing",
      source: "live_database",
    });
    const guard = createGuard(liveAuthorization, realDeniedAccessAudit);

    await expect(
      guard.canActivate(context(ExampleController, "handler", { principal: principal() })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(failingAppend).toHaveBeenCalledOnce();
  });

  it("§11: a scope-mismatch denial also still results in DENY even when the audit write fails", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.read")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const failingAppend = vi.fn().mockRejectedValue(new Error("audit store unavailable"));
    const realDeniedAccessAudit = new DeniedAccessAuditService({ append: failingAppend } as unknown as AuditService);
    const guard = createGuard(liveAuthorizationMock(), realDeniedAccessAudit);

    await expect(
      guard.canActivate(context(ExampleController, "handler", {
        body: { workspaceId: "workspace-b" },
        principal: principal({ workspaceId: "workspace-a" }),
      })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(failingAppend).toHaveBeenCalledOnce();
  });

  it("fails closed on live authorization lookup errors", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.read")
      handler(): void {}
    }

    const liveAuthorization = {
      authorize: vi.fn().mockRejectedValue(new Error("database down")),
    } as unknown as LivePrincipalAuthorizationService;
    const guard = createGuard(liveAuthorization, deniedAccessAuditMock());

    await expect(
      guard.canActivate(context(ExampleController, "handler", { principal: principal() })),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("records audited denials from missing live capabilities", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.manage")
      @RequireAuthLevel("mfa")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const liveAuthorization = liveAuthorizationMock({
      allowed: false,
      grantedCapabilities: ["workspace.read"],
      reason: "live_capability_missing",
      source: "live_database",
    });
    const deniedAccessAudit = deniedAccessAuditMock();
    const guard = createGuard(liveAuthorization, deniedAccessAudit);

    await expect(
      guard.canActivate(context(ExampleController, "handler", { principal: principal() })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(deniedAccessAudit.record).toHaveBeenCalledWith(expect.objectContaining({
      auditDeniedAccess: true,
      reason: "live_capability_missing",
      requiredCapabilities: ["workspace.manage"],
    }));
  });

  it("uses catalog-derived authLevel even when the route omits RequireAuthLevel, and the 403 carries a structured requiredAuthLevel=step_up", async () => {
    class ExampleController {
      @RequireCapabilities("billing.manage")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const deniedAccessAudit = deniedAccessAuditMock();
    const guard = createGuard(
      liveAuthorizationMock({
        allowed: true,
        grantedCapabilities: ["billing.manage"],
        reason: null,
        source: "live_database",
      }),
      deniedAccessAudit,
    );

    const rejection = await guard.canActivate(context(ExampleController, "handler", {
      principal: principal({
        authLevel: "mfa",
        capabilities: ["billing.manage"],
      }),
    })).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(ForbiddenException);
    expect((rejection as ForbiddenException).getResponse()).toMatchObject({
      requiredAuthLevel: "step_up",
    });

    expect(deniedAccessAudit.record).toHaveBeenCalledWith(expect.objectContaining({
      reason: "auth_level_required",
      requiredAuthLevel: "step_up",
    }));
  });

  it("carries a structured requiredAuthLevel=mfa on the 403 for a route requiring only MFA", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.manage")
      @RequireAuthLevel("mfa")
      handler(): void {}
    }

    const guard = createGuard(
      liveAuthorizationMock({
        allowed: true,
        grantedCapabilities: ["workspace.manage"],
        reason: null,
        source: "live_database",
      }),
      deniedAccessAuditMock(),
    );

    const rejection = await guard.canActivate(context(ExampleController, "handler", {
      principal: principal({ authLevel: "session", capabilities: ["workspace.manage"] }),
    })).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(ForbiddenException);
    expect((rejection as ForbiddenException).getResponse()).toMatchObject({
      requiredAuthLevel: "mfa",
    });
  });

  it("does not attach a requiredAuthLevel to a plain capability-denied 403", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.manage")
      handler(): void {}
    }

    const liveAuthorization = liveAuthorizationMock({
      allowed: false,
      grantedCapabilities: ["workspace.read"],
      reason: "live_capability_missing",
      source: "live_database",
    });
    const guard = createGuard(liveAuthorization, deniedAccessAuditMock());

    const rejection = await guard.canActivate(context(ExampleController, "handler", {
      principal: principal(),
    })).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(ForbiddenException);
    const response = (rejection as ForbiddenException).getResponse();
    expect(
      typeof response === "object" && response !== null && "requiredAuthLevel" in response,
    ).toBe(false);
  });

  it("denies cross-workspace request payloads before live authorization", async () => {
    class ExampleController {
      @RequireCapabilities("workspace.read")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const liveAuthorization = liveAuthorizationMock();
    const deniedAccessAudit = deniedAccessAuditMock();
    const guard = createGuard(liveAuthorization, deniedAccessAudit);

    await expect(
      guard.canActivate(context(ExampleController, "handler", {
        body: { filters: { workspaceId: "workspace-b" } },
        principal: principal({ workspaceId: "workspace-a" }),
      })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(liveAuthorization.authorize).not.toHaveBeenCalled();
    expect(deniedAccessAudit.record).toHaveBeenCalledWith(expect.objectContaining({
      reason: "request_workspace_scope_mismatch",
    }));
  });

  it("denies cross-tenant request parameters before live authorization", async () => {
    class ExampleController {
      @RequireCapabilities("tenant.membership.read")
      @AuditDeniedAccess()
      handler(): void {}
    }

    const liveAuthorization = liveAuthorizationMock();
    const deniedAccessAudit = deniedAccessAuditMock();
    const guard = createGuard(liveAuthorization, deniedAccessAudit);

    await expect(
      guard.canActivate(context(ExampleController, "handler", {
        params: { tenantId: "tenant-b" },
        principal: principal({ tenantId: "tenant-a" }),
      })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(liveAuthorization.authorize).not.toHaveBeenCalled();
    expect(deniedAccessAudit.record).toHaveBeenCalledWith(expect.objectContaining({
      reason: "request_tenant_scope_mismatch",
    }));
  });
});

function createGuard(
  liveAuthorization: LivePrincipalAuthorizationService,
  deniedAccessAudit: DeniedAccessAuditService,
): CapabilityGuard {
  return new CapabilityGuard(
    new Reflector(),
    deniedAccessAudit,
    liveAuthorization,
  );
}

function liveAuthorizationMock(
  decision: LiveAuthorizationDecision = {
    allowed: true,
    grantedCapabilities: ["workspace.read"] as readonly CanonicalCapability[],
    reason: null,
    source: "live_database" as const,
  },
): LivePrincipalAuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue(decision),
  } as unknown as LivePrincipalAuthorizationService;
}

function deniedAccessAuditMock(): DeniedAccessAuditService {
  return {
    record: vi.fn().mockResolvedValue(undefined),
  } as unknown as DeniedAccessAuditService;
}

function context(
  controller: new () => unknown,
  methodName: string,
  request: RequestWithPrincipal,
): ExecutionContext {
  const handler = controller.prototype[methodName] as Function;
  return {
    getClass: () => controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function principal(
  overrides: Partial<RequestPrincipal> = {},
): RequestPrincipal {
  return {
    authLevel: "step_up",
    capabilities: [],
    expiresAt: "2026-08-31T11:00:00.000Z",
    issuedAt: "2026-08-31T10:00:00.000Z",
    issuer: "papadata-bff",
    memberships: [{
      capabilities: [],
      roles: ["Workspace Admin"],
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    }],
    sessionId: "session-a",
    source: "internal_token",
    stepUpExpiresAt: "2026-08-31T10:05:00.000Z",
    tenantId: "tenant-a",
    userId: "user-a",
    workspaceId: "workspace-a",
    ...overrides,
  };
}
