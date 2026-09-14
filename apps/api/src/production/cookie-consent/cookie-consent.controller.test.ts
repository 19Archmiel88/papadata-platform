import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { internalPrincipalHeaderName, type PrincipalService } from "../auth/principal.service.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import type { CookieConsentService } from "./cookie-consent.service.js";
import { CookieConsentController } from "./cookie-consent.controller.js";

const principal: RequestPrincipal = {
  authLevel: "session",
  capabilities: [],
  expiresAt: "2026-01-01T01:00:00.000Z",
  issuedAt: "2026-01-01T00:00:00.000Z",
  issuer: "papadata-api",
  memberships: [],
  sessionId: "session-1",
  source: "internal_token",
  stepUpExpiresAt: null,
  tenantId: "tenant-1",
  userId: "user-1",
  workspaceId: "workspace-1",
};

function controller(resolve: PrincipalService["resolve"]) {
  const service = {
    write: vi.fn(async () => ({ currentVersion: "1", decision: null })),
  } as unknown as CookieConsentService;
  const principals = { resolve } as unknown as PrincipalService;
  return { instance: new CookieConsentController(service, principals), service };
}

describe("CookieConsentController optional principal handling", () => {
  it("missing internal principal header remains an anonymous write", async () => {
    const resolve = vi.fn(async () => principal);
    const { instance, service } = controller(resolve);

    await instance.write(
      { headers: {} } as never,
      { analytics: false, marketing: false, preferences: false },
      "11111111-1111-4111-8111-111111111111",
      "corr-1",
    );

    expect(resolve).not.toHaveBeenCalled();
    expect(service.write).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      { analytics: false, marketing: false, preferences: false },
      null,
      "corr-1",
    );
  });

  it("invalid supplied internal principal header is rejected instead of downgraded to anonymous", async () => {
    const { instance, service } = controller(vi.fn(async () => null));

    await expect(instance.write(
      { headers: { [internalPrincipalHeaderName]: "invalid" } } as never,
      { analytics: false, marketing: false, preferences: false },
      "11111111-1111-4111-8111-111111111111",
      "corr-2",
    )).rejects.toBeInstanceOf(UnauthorizedException);

    expect(service.write).not.toHaveBeenCalled();
  });
});
