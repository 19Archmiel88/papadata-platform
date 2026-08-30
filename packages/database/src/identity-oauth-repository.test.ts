import { describe, expect, it, vi } from "vitest";
import type { ProductionDatabase } from "./production.js";
import { IdentityOAuthRepository } from "./product-domain.js";

// Regression coverage for the P0 Faza 3 fix: app.identity_oauth_links now
// stores identity_key directly (migration 0041) instead of requiring
// app.lookup_oauth_link to join app.identity_users -- that join was blocked
// by identity_users' FORCE ROW LEVEL SECURITY, so OAuth login for an
// already-linked account silently found nothing, always. createLink must
// populate the new column or the fix regresses back to an empty column on
// every newly created link.

describe("IdentityOAuthRepository.createLink", () => {
  it("includes identity_key in the insert", async () => {
    const queries: Array<{ readonly sql: string; readonly params: readonly unknown[] }> = [];
    const withIdentity = vi.fn(async (identityKey: string, userId: string | null, op: (client: unknown) => unknown) => {
      expect(identityKey).toBe("identity-key-3");
      expect(userId).toBe("user-3");
      return op({
        query: async (sql: string, params: readonly unknown[]) => {
          queries.push({ sql, params });
          return { rows: [] };
        },
      });
    });
    const database = { withIdentity } as unknown as ProductionDatabase;
    const repository = new IdentityOAuthRepository(database);

    await repository.createLink({
      userId: "user-3",
      identityKey: "identity-key-3",
      provider: "google",
      providerSubjectId: "google-subject-123",
      providerEmail: "linked@example.com",
    });

    expect(queries).toHaveLength(1);
    expect(queries[0]!.sql).toMatch(/insert into app\.identity_oauth_links/iu);
    expect(queries[0]!.sql).toMatch(/identity_key/iu);
    expect(queries[0]!.params).toEqual([
      "user-3",
      "identity-key-3",
      "google",
      "google-subject-123",
      "linked@example.com",
    ]);
  });

  it("findLinkBySubject reads user_id and identity_key straight off the lookup function", async () => {
    const queryGlobalReadonly = vi.fn(async (sql: string, params: readonly unknown[]) => {
      expect(sql).toMatch(/app\.lookup_oauth_link/iu);
      expect(params).toEqual(["google", "google-subject-123"]);
      return [{ user_id: "user-3", identity_key: "identity-key-3" }];
    });
    const database = { queryGlobalReadonly } as unknown as ProductionDatabase;
    const repository = new IdentityOAuthRepository(database);

    const lookup = await repository.findLinkBySubject("google", "google-subject-123");

    expect(lookup).toEqual({ userId: "user-3", identityKey: "identity-key-3" });
  });
});
