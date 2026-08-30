import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { ProductionDatabase } from "./production.js";
import { PasswordResetRepository } from "./product-domain.js";

// Regression coverage for the P0 Faza 3 fix: app.lookup_password_reset_token
// deliberately no longer joins app.identity_users (FORCE ROW LEVEL SECURITY
// blocked the pre-auth SECURITY DEFINER lookup for every valid token, always
// -- see migration 0040's comment), so findValidToken now does a second,
// identity-scoped hop for the email. Mirrors
// email-verification-repository.test.ts's coverage of the same shape.

describe("PasswordResetRepository.findValidToken", () => {
  it("performs the lookup, then a second identity-scoped hop for the email", async () => {
    const token = "raw-reset-token";
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const calls: string[] = [];

    const queryGlobalReadonly = vi.fn(async (sql: string, params: readonly unknown[]) => {
      calls.push("queryGlobalReadonly");
      expect(sql).toMatch(/app\.lookup_password_reset_token/iu);
      expect(params).toEqual([tokenHash]);
      return [{ user_id: "user-2", identity_key: "identity-key-2", expires_at: "2030-01-01T00:00:00.000Z" }];
    });
    const withIdentity = vi.fn(async (identityKey: string, userId: string | null, op: (client: unknown) => unknown) => {
      calls.push("withIdentity");
      expect(identityKey).toBe("identity-key-2");
      expect(userId).toBe("user-2");
      return op({ query: async () => ({ rows: [{ normalized_email: "reset-user@example.com" }] }) });
    });
    const database = { queryGlobalReadonly, withIdentity } as unknown as ProductionDatabase;
    const repository = new PasswordResetRepository(database);

    const lookup = await repository.findValidToken(token);

    expect(calls).toEqual(["queryGlobalReadonly", "withIdentity"]);
    expect(lookup).toEqual({
      userId: "user-2",
      identityKey: "identity-key-2",
      normalizedEmail: "reset-user@example.com",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });
  });

  it("returns null without a second hop when the token itself isn't found", async () => {
    const queryGlobalReadonly = vi.fn(async () => []);
    const withIdentity = vi.fn();
    const database = { queryGlobalReadonly, withIdentity } as unknown as ProductionDatabase;
    const repository = new PasswordResetRepository(database);

    const lookup = await repository.findValidToken("bogus-token");

    expect(lookup).toBeNull();
    expect(withIdentity).not.toHaveBeenCalled();
  });
});
