import { describe, expect, it } from "vitest";
import type { ProductionDatabase } from "@papadata/database";
import { LegalDocumentsService } from "./legal-documents.service.js";

type RecordedQuery = { readonly sql: string; readonly params: readonly unknown[] };

// Same fake-ProductionDatabase pattern as cookie-consent.service.test.ts: a
// hand-rolled object implementing only withSystem, recording every
// query/params pair so tests can assert on them without a real Postgres.
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
    withSystem: async (fn: (c: unknown) => unknown) => fn(client),
  } as unknown as ProductionDatabase;
}

describe("LegalDocumentsService", () => {
  it("returns the active document for a canonical type", async () => {
    const queries: RecordedQuery[] = [];
    const db = fakeDatabase(queries, () => ({
      body: "Body text.",
      document_id: "cookie-policy-1",
      document_type: "cookie_policy",
      document_version: "1",
      effective_at: "2026-01-01T00:00:00.000Z",
      title: "Cookie Policy",
    }));
    const service = new LegalDocumentsService(db);

    const document = await service.readActive("cookie_policy");

    expect(document).toEqual({
      body: "Body text.",
      effectiveAt: "2026-01-01T00:00:00.000Z",
      id: "cookie-policy-1",
      title: "Cookie Policy",
      type: "cookie_policy",
      version: "1",
    });
    expect(queries[0]?.sql).toContain("status='active'");
    expect(queries[0]?.params).toEqual(["cookie_policy"]);
  });

  it("returns null when no document is active (superseded rows are never returned since the query filters on status='active')", async () => {
    const db = fakeDatabase([]);
    const service = new LegalDocumentsService(db);

    expect(await service.readActive("cookie_policy")).toBeNull();
  });

  it("rejects an arbitrary client-supplied type instead of querying with it", async () => {
    const queries: RecordedQuery[] = [];
    const db = fakeDatabase(queries);
    const service = new LegalDocumentsService(db);

    await expect(service.readActive("eula")).rejects.toThrow("Unsupported legal document type.");
    expect(queries).toHaveLength(0);
  });

  it("rejects a non-string type", async () => {
    const db = fakeDatabase([]);
    const service = new LegalDocumentsService(db);

    await expect(service.readActive(42)).rejects.toThrow("Unsupported legal document type.");
  });

  describe("activeVersion", () => {
    it("returns the active document's version without fetching its body", async () => {
      const queries: RecordedQuery[] = [];
      const db = fakeDatabase(queries, () => ({ document_version: "2" }));
      const service = new LegalDocumentsService(db);

      expect(await service.activeVersion("cookie_policy")).toBe("2");
      expect(queries[0]?.sql).not.toContain("body");
    });

    it("returns null when there is no active document", async () => {
      const db = fakeDatabase([]);
      const service = new LegalDocumentsService(db);

      expect(await service.activeVersion("cookie_policy")).toBeNull();
    });
  });
});
