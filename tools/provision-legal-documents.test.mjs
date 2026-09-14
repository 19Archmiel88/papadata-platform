// Unit tests for tools/provision-legal-documents.mjs.
//
// extractBody/findPlaceholders/validateForPublication/loadDocument are
// tested directly (no DB, real files under docs/legal/). The DB-facing
// idempotency/supersede sequencing is tested against a hand-rolled fake
// Postgres client that records every query -- the same pattern this repo
// already uses for ProductionDatabase in apps/api's *.test.ts files -- so
// this suite needs no real Postgres connection.
//
// Run: node --test tools/provision-legal-documents.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DOCUMENTS,
  extractBody,
  findPlaceholders,
  loadDocument,
  validateForPublication,
  documentId,
  repoRoot,
} from "./provision-legal-documents.mjs";

// --- extractBody -------------------------------------------------------

test("extractBody strips the title/metadata header and keeps section content", () => {
  const markdown = [
    "# Regulamin świadczenia usług PapaData",
    "",
    "**Wersja:** 1.0",
    "**Data publikacji:** 2026-09-14",
    "",
    "## §1. Usługodawca i kontakt",
    "",
    "Treść.",
  ].join("\n");
  const body = extractBody(markdown);
  assert.equal(body, "## §1. Usługodawca i kontakt\n\nTreść.");
});

test("extractBody throws when the document has no section headings", () => {
  assert.throws(() => extractBody("# Tylko tytuł\n\nBrak sekcji."), /no section headings/u);
});

// --- findPlaceholders ----------------------------------------------------

test("findPlaceholders finds every distinct [[..._REQUIRED]] token", () => {
  const text = "Adres: [[REGISTERED_ADDRESS_REQUIRED]]. NIP: [[NIP_REQUIRED]]. Adres ponownie: [[REGISTERED_ADDRESS_REQUIRED]].";
  assert.deepEqual(findPlaceholders(text), ["[[REGISTERED_ADDRESS_REQUIRED]]", "[[NIP_REQUIRED]]"]);
});

test("findPlaceholders returns an empty array when no placeholder remains", () => {
  assert.deepEqual(findPlaceholders("## Section\n\nFully resolved content, no brackets here."), []);
});

test("findPlaceholders does not match unrelated double-bracket text", () => {
  assert.deepEqual(findPlaceholders("See [[some reference]] in the appendix."), []);
});

// --- validateForPublication ---------------------------------------------

test("validateForPublication fails closed when any document still has placeholders", () => {
  const failures = validateForPublication([
    { type: "terms_of_service", version: "1.0", placeholders: ["[[NIP_REQUIRED]]"] },
    { type: "privacy_notice", version: "1.0", placeholders: [] },
  ]);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /terms_of_service v1\.0/u);
  assert.match(failures[0], /NIP_REQUIRED/u);
});

test("validateForPublication passes when no document has placeholders", () => {
  const failures = validateForPublication([
    { type: "terms_of_service", version: "1.0", placeholders: [] },
    { type: "privacy_notice", version: "1.0", placeholders: [] },
  ]);
  assert.deepEqual(failures, []);
});

// --- documentId ------------------------------------------------------------

test("documentId is deterministic and encodes type + version", () => {
  assert.equal(documentId("terms_of_service", "1.0"), "terms_of_service-1.0");
});

// --- loadDocument: real canonical files ----------------------------------

test("loadDocument rejects an unknown document type before touching the filesystem contents", async () => {
  await assert.rejects(
    () => loadDocument({ file: "docs/legal/terms-of-service.pl.md", type: "not_a_real_type", version: "1.0", effectiveAt: "2026-09-14T00:00:00.000Z" }),
    /not a valid legal document type/u,
  );
});

test("loadDocument rejects a blank version", async () => {
  await assert.rejects(
    () => loadDocument({ file: "docs/legal/terms-of-service.pl.md", type: "terms_of_service", version: "  ", effectiveAt: "2026-09-14T00:00:00.000Z" }),
    /version must be a non-empty string/u,
  );
});

test("loadDocument rejects an invalid effective date", async () => {
  await assert.rejects(
    () => loadDocument({ file: "docs/legal/terms-of-service.pl.md", type: "terms_of_service", version: "1.0", effectiveAt: "not-a-date" }),
    /not a valid date/u,
  );
});

test("the canonical Terms of Service file exists, is non-empty, and has a real body", async () => {
  const doc = await loadDocument(DOCUMENTS.find((d) => d.type === "terms_of_service"));
  assert.ok(doc.body.length > 500, "expected substantial section content, not a stub");
});

test("the canonical Privacy Notice file exists, is non-empty, and has a real body", async () => {
  const doc = await loadDocument(DOCUMENTS.find((d) => d.type === "privacy_notice"));
  assert.ok(doc.body.length > 500, "expected substantial section content, not a stub");
});

test("neither canonical document's body contains raw HTML tags (SafeMarkdown never renders raw HTML)", async () => {
  for (const def of DOCUMENTS) {
    const doc = await loadDocument(def);
    assert.doesNotMatch(doc.body, /<[a-z][a-z0-9]*[\s>]/iu, `${def.file} contains what looks like a raw HTML tag`);
  }
});

test("neither canonical document links to a non-HTTPS URL", async () => {
  for (const def of DOCUMENTS) {
    const doc = await loadDocument(def);
    const links = [...doc.body.matchAll(/\]\((\S+)\)/gu)].map((match) => match[1]);
    for (const link of links) assert.match(link, /^https:\/\//u, `${def.file} links to a non-https URL: ${link}`);
  }
});

test("today's DOCUMENTS manifest (both real canonical files) still has unresolved placeholders -- publication must stay blocked until operator facts are supplied", async () => {
  const documents = await Promise.all(DOCUMENTS.map((def) => loadDocument(def)));
  const failures = validateForPublication(documents);
  assert.ok(failures.length > 0, "expected the current drafts to still be blocked by missing operator facts");
});

// --- provisionOne-equivalent sequencing, against a fake Postgres client ---
//
// provisionOne() itself isn't exported (it takes a live pg.Client), so this
// re-implements its exact query sequence against a fake client and asserts
// on that sequence -- the same boundary-testing approach as apps/api's
// fakeDatabase() helpers, just for a plain pg.Client shape instead of
// ProductionDatabase.

function fakeClient(existingRows) {
  const queries = [];
  const rows = new Map(existingRows.map((row) => [`${row.document_type}:${row.document_version}`, row]));
  return {
    queries,
    rowsByKey: rows,
    async query(sql, params = []) {
      queries.push({ sql, params });
      if (sql.startsWith("SELECT title, body, status")) {
        const row = rows.get(`${params[0]}:${params[1]}`);
        return { rows: row ? [row] : [] };
      }
      if (sql.startsWith("UPDATE app.legal_documents SET status = 'superseded'")) {
        for (const [key, row] of rows) {
          if (row.document_type === params[0] && row.status === "active") rows.set(key, { ...row, status: "superseded" });
        }
        return { rows: [] };
      }
      if (sql.startsWith("INSERT INTO app.legal_documents")) {
        const [id, type, version, title, body] = params;
        rows.set(`${type}:${version}`, { document_id: id, document_type: type, document_version: version, title, body, status: "active" });
        return { rows: [] };
      }
      return { rows: [] };
    },
  };
}

async function provisionOneForTest(client, doc) {
  // Mirrors provisionOne()'s exact query sequence/shape.
  const existing = await client.query(
    "SELECT title, body, status FROM app.legal_documents WHERE document_type = $1 AND document_version = $2",
    [doc.type, doc.version],
  );
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (row.title === doc.title && row.body === doc.body) {
      return { action: "unchanged", status: row.status };
    }
    throw new Error(`${doc.type} v${doc.version} already exists with different content.`);
  }
  await client.query(
    "UPDATE app.legal_documents SET status = 'superseded', updated_at = now() WHERE document_type = $1 AND status = 'active'",
    [doc.type],
  );
  await client.query(
    "INSERT INTO app.legal_documents (document_id, document_type, document_version, title, body, status, effective_at) VALUES ($1, $2, $3, $4, $5, 'active', $6)",
    [doc.documentId, doc.type, doc.version, doc.title, doc.body, doc.effectiveAt],
  );
  return { action: "published", status: "active" };
}

test("first publish: no existing row -> supersedes nothing, inserts as active", async () => {
  const client = fakeClient([]);
  const result = await provisionOneForTest(client, {
    type: "terms_of_service", version: "1.0", title: "T", body: "B", documentId: "terms_of_service-1.0", effectiveAt: "2026-09-14T00:00:00.000Z",
  });
  assert.equal(result.action, "published");
  assert.equal(client.rowsByKey.get("terms_of_service:1.0").status, "active");
});

test("publishing a newer version supersedes only the older same-type version, never other types", async () => {
  const client = fakeClient([
    { document_type: "terms_of_service", document_version: "1.0", title: "Old T", body: "Old", status: "active" },
    { document_type: "privacy_notice", document_version: "1.0", title: "P", body: "P body", status: "active" },
  ]);
  await provisionOneForTest(client, {
    type: "terms_of_service", version: "2.0", title: "New T", body: "New", documentId: "terms_of_service-2.0", effectiveAt: "2026-10-01T00:00:00.000Z",
  });
  assert.equal(client.rowsByKey.get("terms_of_service:1.0").status, "superseded");
  assert.equal(client.rowsByKey.get("terms_of_service:2.0").status, "active");
  assert.equal(client.rowsByKey.get("privacy_notice:1.0").status, "active", "unrelated type must not be touched");
});

test("re-provisioning the exact same version with unchanged content is idempotent (no supersede, no insert)", async () => {
  const client = fakeClient([
    { document_type: "terms_of_service", document_version: "1.0", title: "T", body: "B", status: "active" },
  ]);
  const result = await provisionOneForTest(client, {
    type: "terms_of_service", version: "1.0", title: "T", body: "B", documentId: "terms_of_service-1.0", effectiveAt: "2026-09-14T00:00:00.000Z",
  });
  assert.equal(result.action, "unchanged");
  assert.ok(!client.queries.some((q) => q.sql.startsWith("UPDATE")), "idempotent re-run must not supersede anything");
  assert.ok(!client.queries.some((q) => q.sql.startsWith("INSERT")), "idempotent re-run must not insert anything");
});

test("re-using an already-published version number with different content fails loudly instead of overwriting it", async () => {
  const client = fakeClient([
    { document_type: "terms_of_service", document_version: "1.0", title: "T", body: "Original accepted text", status: "active" },
  ]);
  await assert.rejects(
    () => provisionOneForTest(client, {
      type: "terms_of_service", version: "1.0", title: "T", body: "Edited text, same version number", documentId: "terms_of_service-1.0", effectiveAt: "2026-09-14T00:00:00.000Z",
    }),
    /already exists with different content/u,
  );
  assert.equal(client.rowsByKey.get("terms_of_service:1.0").body, "Original accepted text", "must never be overwritten");
});
