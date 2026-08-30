import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { ProductionDatabase } from "./production.js";
import { EmailVerificationRepository, type IdentityUserRow } from "./product-domain.js";

// Regression coverage for the P0 Faza 3 fix: app.lookup_email_verification_token
// deliberately no longer joins app.identity_users (that table has FORCE ROW
// LEVEL SECURITY and blocked the pre-auth SECURITY DEFINER lookup -- see
// migration 0038's comment), so findValidToken now does a second,
// identity-scoped hop for the email. These tests pin that two-hop shape so a
// future edit can't silently drop the second query and regress the bug.

function fakeUser(overrides: Partial<IdentityUserRow> = {}): IdentityUserRow {
  return {
    userId: "user-1",
    identityKey: "identity-key-1",
    normalizedEmail: "user@example.com",
    passwordHash: "hash",
    displayName: "Test User",
    status: "active",
    emailVerifiedAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    ...overrides,
  };
}

describe("EmailVerificationRepository", () => {
  it("createVerificationToken inserts a hashed token scoped to the user's identity", async () => {
    const queries: Array<{ readonly sql: string; readonly params: readonly unknown[] }> = [];
    const withIdentity = vi.fn(async (identityKey: string, userId: string | null, op: (client: unknown) => unknown) => {
      expect(identityKey).toBe("identity-key-1");
      expect(userId).toBe("user-1");
      return op({
        query: async (sql: string, params: readonly unknown[]) => {
          queries.push({ sql, params });
          return { rows: [] };
        },
      });
    });
    const database = { withIdentity } as unknown as ProductionDatabase;
    const repository = new EmailVerificationRepository(database);

    const { token, expiresAt } = await repository.createVerificationToken({
      user: fakeUser(),
      ttlHours: 24,
    });

    expect(token).toMatch(/^[\w-]{32,}$/u);
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect(queries).toHaveLength(1);
    expect(queries[0]!.sql).toMatch(/insert into app\.security_email_verification_tokens/iu);
    const [userId, identityKey, tokenHash] = queries[0]!.params;
    expect(userId).toBe("user-1");
    expect(identityKey).toBe("identity-key-1");
    expect(tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
  });

  it("findValidToken performs the lookup, then a second identity-scoped hop for the email", async () => {
    const token = "raw-token-value";
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const calls: string[] = [];

    const queryGlobalReadonly = vi.fn(async (sql: string, params: readonly unknown[]) => {
      calls.push("queryGlobalReadonly");
      expect(sql).toMatch(/app\.lookup_email_verification_token/iu);
      expect(params).toEqual([tokenHash]);
      return [{ user_id: "user-1", identity_key: "identity-key-1", expires_at: "2030-01-01T00:00:00.000Z" }];
    });
    const withIdentity = vi.fn(async (identityKey: string, userId: string | null, op: (client: unknown) => unknown) => {
      calls.push("withIdentity");
      expect(identityKey).toBe("identity-key-1");
      expect(userId).toBe("user-1");
      return op({
        query: async () => ({ rows: [{ normalized_email: "user@example.com" }] }),
      });
    });
    const database = { queryGlobalReadonly, withIdentity } as unknown as ProductionDatabase;
    const repository = new EmailVerificationRepository(database);

    const lookup = await repository.findValidToken(token);

    // The lookup function no longer discloses the email itself -- the
    // repository must fetch it separately, and only after the first hop.
    expect(calls).toEqual(["queryGlobalReadonly", "withIdentity"]);
    expect(lookup).toEqual({
      userId: "user-1",
      identityKey: "identity-key-1",
      normalizedEmail: "user@example.com",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });
  });

  it("findValidToken returns null without a second hop when the token itself isn't found", async () => {
    const queryGlobalReadonly = vi.fn(async () => []);
    const withIdentity = vi.fn();
    const database = { queryGlobalReadonly, withIdentity } as unknown as ProductionDatabase;
    const repository = new EmailVerificationRepository(database);

    const lookup = await repository.findValidToken("bogus-token");

    expect(lookup).toBeNull();
    expect(withIdentity).not.toHaveBeenCalled();
  });

  it("findValidToken returns null if the second hop can't find the user's email", async () => {
    const queryGlobalReadonly = vi.fn(async () => [
      { user_id: "user-1", identity_key: "identity-key-1", expires_at: "2030-01-01T00:00:00.000Z" },
    ]);
    const withIdentity = vi.fn(async (_key: string, _id: string | null, op: (client: unknown) => unknown) =>
      op({ query: async () => ({ rows: [] }) }));
    const database = { queryGlobalReadonly, withIdentity } as unknown as ProductionDatabase;
    const repository = new EmailVerificationRepository(database);

    const lookup = await repository.findValidToken("some-token");

    expect(lookup).toBeNull();
  });
});
