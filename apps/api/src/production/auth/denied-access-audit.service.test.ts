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
