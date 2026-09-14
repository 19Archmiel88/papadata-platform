import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductionDatabase } from "@papadata/database";
import { AuditService } from "../audit/audit.service.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { LegalDocumentsService } from "../legal-documents/legal-documents.service.js";
import { CookieConsentService } from "./cookie-consent.service.js";

const subjectId = "11111111-1111-4111-8111-111111111111";

type RecordedQuery = { readonly sql: string; readonly params: readonly unknown[] };

// Same fake-ProductionDatabase pattern as audit.service.test.ts: a hand-rolled
// object implementing only withSystem/withTenantWorkspace/withCookieConsentSubject,
// recording every query/params pair so tests can assert on them without a
// real Postgres. Real RLS enforcement (subject isolation, cross-subject
// denial, the narrow anonymous audit shape) is covered separately by
// packages/database/tests/rls-isolation.sql against a real Postgres.
function fakeDatabase(
  queries: RecordedQuery[],
  responder: (sql: string, params: readonly unknown[]) => unknown = () => undefined,
): ProductionDatabase {
  const client = {
    query: async (sql: string, params: readonly unknown[] = []) => {
      queries.push({ params, sql });
      return { rows: [responder(sql, params)].flat().filter(Boolean) };
    },
  };
  return {
    withCookieConsentSubject: async (_subjectId: string, fn: (c: unknown) => unknown) => fn(client),
    withSystem: async (fn: (c: unknown) => unknown) => fn(client),
    withTenantWorkspace: async (
      _tenantId: string,
      _workspaceId: string | null,
      fn: (c: unknown) => unknown,
    ) => fn(client),
  } as unknown as ProductionDatabase;
}

function principal(overrides: Partial<RequestPrincipal> = {}): RequestPrincipal {
  return {
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
    ...overrides,
  };
}

const selection = { analytics: false, marketing: true, preferences: true };

describe("CookieConsentService", () => {
  let queries: RecordedQuery[];
  let originalVersion: string | undefined;

  beforeEach(() => {
    queries = [];
    originalVersion = process.env.PAPADATA_COOKIE_CONSENT_VERSION;
    process.env.PAPADATA_COOKIE_CONSENT_VERSION = "1";
  });

  afterEach(() => {
    if (originalVersion === undefined) {
      delete process.env.PAPADATA_COOKIE_CONSENT_VERSION;
    } else {
      process.env.PAPADATA_COOKIE_CONSENT_VERSION = originalVersion;
    }
  });

  it("anonymous read without an existing record returns no decision", async () => {
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    const status = await service.read(subjectId);

    expect(status.decision).toBeNull();
    expect(status.currentVersion).toBe("1");
  });

  it("existing subject returns its current consent", async () => {
    const db = fakeDatabase(queries, () => ({
      categories: { analytics: false, marketing: true, necessary: true, preferences: true },
      updated_at: "2026-02-01T00:00:00.000Z",
      version: "1",
    }));
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    const status = await service.read(subjectId);

    expect(status.decision).toEqual({
      categories: { analytics: false, marketing: true, necessary: true, preferences: true },
      decidedAt: "2026-02-01T00:00:00.000Z",
      version: "1",
    });
  });

  it("anonymous create: inserts with null user/tenant/workspace and writes to app.audit_events, not the tenant-scoped audit chain", async () => {
    const db = fakeDatabase(queries, (sql) =>
      sql.startsWith("INSERT INTO app.cookie_consents")
        ? { categories: { ...selection, necessary: true }, inserted: true, updated_at: "2026-01-01T00:00:00.000Z", version: "1" }
        : undefined);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await service.write(subjectId, selection, null, "corr-1");

    const insert = queries.find((q) => q.sql.startsWith("INSERT INTO app.cookie_consents"))!;
    expect(insert.params.slice(0, 5)).toEqual([expect.any(String), subjectId, null, null, null]);
    expect(JSON.parse(insert.params[5] as string)).toEqual({ ...selection, necessary: true });
    expect(insert.params[6]).toBe("1");

    const audit = queries.find((q) => q.sql.startsWith("INSERT INTO app.audit_events"))!;
    expect(audit).toBeDefined();
    expect(audit.params).toContain("cookie_consent.created");
    expect(audit.params).toContain(subjectId);
    // Never routed through the tenant-scoped hash chain for an anonymous
    // write -- there is no advisory-lock/chain-heads call at all.
    expect(queries.some((q) => q.sql.includes("pg_advisory_xact_lock"))).toBe(false);
  });

  it("authenticated update: persists the resolved principal's account context and audits via the canonical AuditService, scoped to the principal's tenant", async () => {
    const db = fakeDatabase(queries, (sql) =>
      sql.startsWith("INSERT INTO app.cookie_consents")
        ? { categories: { ...selection, necessary: true }, inserted: false, updated_at: "2026-01-01T00:00:00.000Z", version: "1" }
        : undefined);
    const append = vi.fn(async () => ({}));
    const audit = { append } as unknown as AuditService;
    const service = new CookieConsentService(db, audit, new LegalDocumentsService(db));

    await service.write(subjectId, selection, principal(), "corr-2");

    const upsert = queries.find((q) => q.sql.startsWith("INSERT INTO app.cookie_consents"))!;
    expect(upsert.params.slice(2, 5)).toEqual(["user-1", "tenant-1", "workspace-1"]);
    expect(append).toHaveBeenCalledWith(expect.objectContaining({
      action: "cookie_consent.updated",
      actorId: "user-1",
      actorType: "user",
      correlationId: "corr-2",
      resourceId: subjectId,
      resourceType: "cookie_consent",
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
    }));
    // No direct write to the anonymous-path table when a principal is present.
    expect(queries.some((q) => q.sql.startsWith("INSERT INTO app.audit_events"))).toBe(false);
  });

  it("version is always the server's current version, never client-supplied", async () => {
    const db = fakeDatabase(queries, (sql) =>
      sql.startsWith("INSERT INTO app.cookie_consents")
        ? { categories: { ...selection, necessary: true }, inserted: true, updated_at: "2026-01-01T00:00:00.000Z", version: "1" }
        : undefined);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    // Even if a caller's body somehow reached write() with a "version"
    // field, the request-shape check below (onlyKeys) rejects it outright
    // -- version is never a client-suppliable field in the first place.
    await service.write(subjectId, selection, null, "corr-3");

    const insert = queries.find((q) => q.sql.startsWith("INSERT INTO app.cookie_consents"))!;
    expect(insert.params[6]).toBe("1");
  });

  it("necessary:false in the request body is rejected (unknown field, since necessary is never client-suppliable)", async () => {
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await expect(
      service.write(subjectId, { ...selection, necessary: false }, null, "corr-4"),
    ).rejects.toThrow();
  });

  it("a client-supplied userId/tenantId/workspaceId in the body cannot spoof account context (rejected as an unknown field)", async () => {
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await expect(
      service.write(subjectId, { ...selection, tenantId: "someone-elses-tenant" }, null, "corr-5"),
    ).rejects.toThrow();
  });

  it("missing category is rejected", async () => {
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await expect(
      service.write(subjectId, { analytics: false, preferences: true }, null, "corr-6"),
    ).rejects.toThrow();
  });

  it("non-boolean category value is rejected", async () => {
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await expect(
      service.write(subjectId, { ...selection, analytics: "yes" }, null, "corr-7"),
    ).rejects.toThrow();
  });

  it("invalid subjectId is rejected", async () => {
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await expect(service.read("not-a-uuid")).rejects.toThrow();
    await expect(service.write("not-a-uuid", selection, null, "corr-8")).rejects.toThrow();
  });

  it("missing cookie consent version is rejected instead of silently falling back", async () => {
    delete process.env.PAPADATA_COOKIE_CONSENT_VERSION;
    const db = fakeDatabase(queries);
    const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

    await expect(service.read(subjectId)).rejects.toThrow("PAPADATA_COOKIE_CONSENT_VERSION is required");
  });

  describe("cookie policy version drift detection", () => {
    // The check runs fire-and-forget after read()/write() resolve (see
    // warnIfCookiePolicyVersionDrifted) so it never adds latency to the
    // response -- these tests flush microtasks with a resolved Promise
    // before asserting on console.warn.
    async function flush(): Promise<void> {
      await Promise.resolve();
      await Promise.resolve();
    }

    it("warns when the active cookie_policy document version does not match the env var", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const db = fakeDatabase(queries, (sql) =>
        sql.includes("app.legal_documents") ? { document_version: "2" } : undefined);
      const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

      await service.read(subjectId);
      await flush();

      expect(warn).toHaveBeenCalledWith(
        "Cookie policy document version does not match PAPADATA_COOKIE_CONSENT_VERSION.",
        { activeVersion: "2", currentVersion: "1" },
      );
      warn.mockRestore();
    });

    it("does not warn when the active document version matches the env var", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const db = fakeDatabase(queries, (sql) =>
        sql.includes("app.legal_documents") ? { document_version: "1" } : undefined);
      const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

      await service.read(subjectId);
      await flush();

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it("does not warn when no cookie_policy document is active yet", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const db = fakeDatabase(queries);
      const service = new CookieConsentService(db, new AuditService(db), new LegalDocumentsService(db));

      await service.read(subjectId);
      await flush();

      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
