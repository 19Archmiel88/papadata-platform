import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { AuditController } from "./audit.controller.js";
import type { AuditService } from "./audit.service.js";

// Faza 9 §20: the controller has its own chainScope/tenantId cross-check
// *in front of* AuditService.verify()'s own (also-tested, see
// audit.service.test.ts) check -- defense in depth. Tenant A must never be
// able to verify Tenant B's chainScope through this endpoint.
describe("AuditController.verify chain scope isolation", () => {
  it("rejects a chainScope that does not match the caller's own tenantId, without calling AuditService", async () => {
    const verify = vi.fn();
    const controller = new AuditController({ verify } as unknown as AuditService);

    // AuditController.verify is not declared `async` and throws
    // synchronously on mismatch -- see the matching comment in
    // audit.service.test.ts for why this needs an IIFE wrapper.
    await expect(
      (async () => controller.verify(principal({ tenantId: "tenant-a" }), { chainScope: "tenant-b" }))(),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(verify).not.toHaveBeenCalled();
  });

  it("calls AuditService.verify with the caller's own tenantId when chainScope matches", async () => {
    const verify = vi.fn().mockResolvedValue({
      checkedEvents: 0,
      firstInvalidSequence: null,
      latestHash: null,
      valid: true,
    });
    const controller = new AuditController({ verify } as unknown as AuditService);

    await controller.verify(principal({ tenantId: "tenant-a" }), { chainScope: "tenant-a" });

    expect(verify).toHaveBeenCalledWith("tenant-a", "tenant-a");
  });
});

function principal(overrides: Partial<RequestPrincipal> = {}): RequestPrincipal {
  return {
    authLevel: "step_up",
    capabilities: [],
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
    ...overrides,
  };
}
