import { describe, expect, it } from "vitest";
import { TestMemoryBffSessionStore, type BffSessionRecord } from "./session-store.js";

function fakeSession(overrides: Partial<BffSessionRecord> = {}): BffSessionRecord {
  const now = Date.now();
  return {
    absoluteExpiresAt: new Date(now + 30 * 24 * 60 * 60 * 1_000).toISOString(),
    activeTenantId: "tenant-1",
    activeWorkspaceId: "workspace-1",
    authLevel: "session",
    capabilities: ["workspace.read"],
    expiresAt: new Date(now + 30 * 60 * 1_000).toISOString(),
    issuedAt: new Date(now).toISOString(),
    memberships: [{
      capabilities: ["workspace.read"],
      roles: ["Analyst"],
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
    }],
    revokedAt: null,
    sessionId: "session-1",
    stepUpExpiresAt: null,
    userAgent: null,
    userId: "user-1",
    ...overrides,
  };
}

describe("TestMemoryBffSessionStore.listSessionsForUser", () => {
  it("returns only active, non-expired sessions for the given user", async () => {
    const store = new TestMemoryBffSessionStore();
    await store.saveSession(fakeSession({ sessionId: "s1", userId: "user-a" }));
    await store.saveSession(fakeSession({ sessionId: "s2", userId: "user-a" }));
    await store.saveSession(fakeSession({ sessionId: "s3", userId: "user-b" }));
    await store.saveSession(fakeSession({
      sessionId: "s4",
      userId: "user-a",
      revokedAt: new Date().toISOString(),
    }));
    await store.saveSession(fakeSession({
      sessionId: "s5",
      userId: "user-a",
      absoluteExpiresAt: new Date(Date.now() - 1_000).toISOString(),
    }));

    const sessions = await store.listSessionsForUser("user-a");

    expect(sessions.map((session) => session.sessionId).sort()).toEqual(["s1", "s2"]);
  });
});

describe("TestMemoryBffSessionStore.revokeAllSessionsForUser", () => {
  it("revokes every session for the user except the one excluded", async () => {
    const store = new TestMemoryBffSessionStore();
    await store.saveSession(fakeSession({ sessionId: "s1", userId: "user-a" }));
    await store.saveSession(fakeSession({ sessionId: "s2", userId: "user-a" }));
    await store.saveSession(fakeSession({ sessionId: "s3", userId: "user-b" }));

    await store.revokeAllSessionsForUser("user-a", new Date().toISOString(), "s1");

    const s1 = await store.findSession("s1");
    const s2 = await store.findSession("s2");
    const s3 = await store.findSession("s3");
    expect(s1?.revokedAt).toBeNull();
    expect(s2?.revokedAt).not.toBeNull();
    expect(s3?.revokedAt).toBeNull();
  });

  it("revokes every session for the user when nothing is excluded", async () => {
    const store = new TestMemoryBffSessionStore();
    await store.saveSession(fakeSession({ sessionId: "s1", userId: "user-a" }));
    await store.saveSession(fakeSession({ sessionId: "s2", userId: "user-a" }));

    await store.revokeAllSessionsForUser("user-a", new Date().toISOString());

    const s1 = await store.findSession("s1");
    const s2 = await store.findSession("s2");
    expect(s1?.revokedAt).not.toBeNull();
    expect(s2?.revokedAt).not.toBeNull();
  });
});

describe("TestMemoryBffSessionStore.compareAndRotateRefreshTokenHash", () => {
  it("rotates on a matching hash and reports missing before any hash is set", async () => {
    const store = new TestMemoryBffSessionStore();

    const beforeSet = await store.compareAndRotateRefreshTokenHash("s1", "hash-a", "hash-b", 3600);
    expect(beforeSet).toBe("missing");

    await store.setRefreshTokenHash("s1", "hash-a", 3600);
    const rotated = await store.compareAndRotateRefreshTokenHash("s1", "hash-a", "hash-b", 3600);
    expect(rotated).toBe("ok");
  });

  it("reports mismatch and does not rotate when the presented hash is wrong", async () => {
    const store = new TestMemoryBffSessionStore();
    await store.setRefreshTokenHash("s1", "hash-a", 3600);

    const result = await store.compareAndRotateRefreshTokenHash("s1", "wrong-hash", "hash-c", 3600);
    expect(result).toBe("mismatch");

    // The stored hash must be untouched by a failed comparison -- a
    // legitimate retry with the correct (still current) hash must still work.
    const retryWithCorrectHash = await store.compareAndRotateRefreshTokenHash("s1", "hash-a", "hash-c", 3600);
    expect(retryWithCorrectHash).toBe("ok");
  });

  it("detects reuse of a superseded token: presenting the old hash again after rotation fails", async () => {
    const store = new TestMemoryBffSessionStore();
    await store.setRefreshTokenHash("s1", "hash-a", 3600);

    const first = await store.compareAndRotateRefreshTokenHash("s1", "hash-a", "hash-b", 3600);
    expect(first).toBe("ok");

    // Simulates a stolen/replayed token: presenting the now-superseded
    // "hash-a" again must not succeed a second time.
    const replay = await store.compareAndRotateRefreshTokenHash("s1", "hash-a", "hash-c", 3600);
    expect(replay).toBe("mismatch");

    // The legitimate current hash ("hash-b") still works.
    const legitimate = await store.compareAndRotateRefreshTokenHash("s1", "hash-b", "hash-c", 3600);
    expect(legitimate).toBe("ok");
  });
});
