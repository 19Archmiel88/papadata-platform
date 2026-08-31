import { describe, expect, it, vi } from "vitest";
import type { FastifyRequest } from "fastify";
import type { AuditService } from "../audit/audit.service.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { ReportController } from "./report.controller.js";
import type { ReportService } from "./report.service.js";

// Faza 9 blocker fix: reports.download is a GET (never covered by
// CommandExecutionInterceptor, which only fires for state-changing
// methods) but is a high-risk, step_up-gated capability that requires a
// success audit -- see audit-coverage-registry.ts's
// explicitSuccessAuditWriters. These tests cover the semantics the task
// spec requires: audit only after real success, never on failure, no
// secrets leaked, canonical correlationId reuse, and an explicit,
// consistent decision about audit-write failure.

describe("ReportController.download success audit", () => {
  it("writes exactly one success audit event after a successful download, with no signed URL/secrets", async () => {
    const append = vi.fn().mockResolvedValue({});
    const signedDownload = vi.fn().mockResolvedValue({
      expiresInSeconds: 300,
      url: "https://storage.example/bucket/report.csv?signature=SUPER-SECRET-SIG-123",
    });
    const controller = new ReportController(
      { signedDownload } as unknown as ReportService,
      { append } as unknown as AuditService,
    );

    const result = await controller.download(
      "11111111-1111-4111-8111-111111111111",
      principal(),
      fakeRequest(),
    );

    expect(result).toEqual({
      expiresInSeconds: 300,
      url: "https://storage.example/bucket/report.csv?signature=SUPER-SECRET-SIG-123",
    });
    expect(append).toHaveBeenCalledOnce();
    const [[event]] = append.mock.calls;
    expect(event).toMatchObject({
      action: "reports.download",
      actorId: "user-a",
      actorType: "user",
      correlationId: "corr-1",
      outcome: "success",
      resourceId: "11111111-1111-4111-8111-111111111111",
      resourceType: "report",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    });
    // The entire recorded event -- not just one field -- must never carry
    // the signed URL or its secret query parameter.
    expect(JSON.stringify(event)).not.toContain("SUPER-SECRET-SIG-123");
    expect(JSON.stringify(event)).not.toContain("storage.example");
    expect(JSON.stringify(event)).not.toContain("signature=");
  });

  it("writes zero audit events when signedDownload fails (audit only fires after real success)", async () => {
    const append = vi.fn().mockResolvedValue({});
    const signedDownload = vi.fn().mockRejectedValue(new Error("Report is not ready"));
    const controller = new ReportController(
      { signedDownload } as unknown as ReportService,
      { append } as unknown as AuditService,
    );

    await expect(controller.download("some-id", principal(), fakeRequest()))
      .rejects.toThrow("Report is not ready");
    expect(append).not.toHaveBeenCalled();
  });

  // §4 (failure semantics): audit-write failure must be a consistent,
  // explicit decision -- not silently swallowed just to return 200. This
  // matches CommandExecutionInterceptor.complete()'s existing, unchanged
  // policy: an audit.append() failure there also propagates and the
  // command's success response is never sent. Extending the same policy
  // here means a security-sensitive download never returns a 200 with a
  // silently-missing audit trail.
  it("propagates when the audit write itself fails, rather than silently returning the signed URL", async () => {
    const append = vi.fn().mockRejectedValue(new Error("audit store unavailable"));
    const signedDownload = vi.fn().mockResolvedValue({ expiresInSeconds: 300, url: "https://storage.example/x" });
    const controller = new ReportController(
      { signedDownload } as unknown as ReportService,
      { append } as unknown as AuditService,
    );

    await expect(controller.download("some-id", principal(), fakeRequest()))
      .rejects.toThrow("audit store unavailable");
    expect(signedDownload).toHaveBeenCalledOnce();
    expect(append).toHaveBeenCalledOnce();
  });

  it("reuses the canonical request-context correlationId rather than minting a second one", async () => {
    const append = vi.fn().mockResolvedValue({});
    const signedDownload = vi.fn().mockResolvedValue({ expiresInSeconds: 60, url: "https://storage.example/x" });
    const controller = new ReportController(
      { signedDownload } as unknown as ReportService,
      { append } as unknown as AuditService,
    );

    await controller.download("some-id", principal(), fakeRequest({ correlationId: "canonical-corr-id" }));

    expect(append).toHaveBeenCalledWith(expect.objectContaining({ correlationId: "canonical-corr-id" }));
  });

  it("falls back to \"unknown\" correlationId if RequestContextInterceptor somehow did not run, rather than throwing", async () => {
    const append = vi.fn().mockResolvedValue({});
    const signedDownload = vi.fn().mockResolvedValue({ expiresInSeconds: 60, url: "https://storage.example/x" });
    const controller = new ReportController(
      { signedDownload } as unknown as ReportService,
      { append } as unknown as AuditService,
    );

    await controller.download("some-id", principal(), { } as unknown as FastifyRequest);

    expect(append).toHaveBeenCalledWith(expect.objectContaining({ correlationId: "unknown" }));
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

function fakeRequest(overrides: { readonly correlationId?: string } = {}): FastifyRequest {
  return {
    correlationId: overrides.correlationId ?? "corr-1",
    operationId: "reports.download",
  } as unknown as FastifyRequest;
}
