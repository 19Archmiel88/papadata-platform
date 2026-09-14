#!/usr/bin/env node
// Idempotent operator/CI tool that provisions the canonical Markdown legal
// documents in docs/legal/*.pl.md into app.legal_documents. See
// docs/legal/LEGAL-READINESS-REPORT.md for the current publication status.
//
// Deliberately never runs as the application's own runtime credential
// (papadata_app only has SELECT on app.legal_documents -- see
// LegalDocumentsController and migration 0072): this connects with the
// same papadata_platform credential already used by the retention/mail
// platform workers (SCHEDULER_DATABASE_URL), matching PlatformDatabase's
// existing boundary rather than inventing a second admin path.
//
// Usage:
//   node tools/provision-legal-documents.mjs --dry-run   # validate only, no DB connection
//   node tools/provision-legal-documents.mjs             # validate, then provision
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The single source of truth for which canonical files map to which
// document_type/version/effective date. Bump `version` (see
// docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/22-wersjonowanie-i-akceptacja-dokumentow.md's
// patch/minor/major classification) whenever docs/legal/*.pl.md changes in
// a way that requires a new accepted version; never edit body text under an
// already-provisioned version number.
export const DOCUMENTS = [
  {
    file: "docs/legal/terms-of-service.pl.md",
    type: "terms_of_service",
    version: "1.0",
    effectiveAt: "2026-09-14T00:00:00.000Z",
    title: "Regulamin świadczenia usług PapaData",
  },
  {
    file: "docs/legal/privacy-notice.pl.md",
    type: "privacy_notice",
    version: "1.0",
    effectiveAt: "2026-09-14T00:00:00.000Z",
    title: "Polityka prywatności PapaData",
  },
];

const PLACEHOLDER_PATTERN = /\[\[[A-Z0-9_]+_REQUIRED\]\]/g;
const VALID_TYPES = new Set(["cookie_policy", "privacy_notice", "terms_of_service", "data_processing_terms"]);

// The published body is the section content only (from the first "## "
// heading onward) -- the leading "# Title" + "**Wersja:** ..." metadata
// block is stripped because LegalDocumentScreen.tsx already renders
// title/version/effectiveAt itself from separate PublishedLegalDocument
// fields; keeping both would show the same facts twice.
export function extractBody(markdown) {
  const lines = markdown.split("\n");
  const firstSectionIndex = lines.findIndex((line) => line.startsWith("## "));
  if (firstSectionIndex === -1) {
    throw new Error("Document has no section headings (a line starting with '## ') -- nothing to publish as a body.");
  }
  return lines.slice(firstSectionIndex).join("\n").trim();
}

export function findPlaceholders(text) {
  return [...new Set(text.match(PLACEHOLDER_PATTERN) ?? [])];
}

export function documentId(type, version) {
  return `${type}-${version}`;
}

export async function loadDocument(def, root = repoRoot) {
  if (!VALID_TYPES.has(def.type)) {
    throw new Error(`${def.file}: '${def.type}' is not a valid legal document type.`);
  }
  if (!def.version || !def.version.trim()) {
    throw new Error(`${def.file}: version must be a non-empty string.`);
  }
  if (Number.isNaN(Date.parse(def.effectiveAt))) {
    throw new Error(`${def.file}: effectiveAt '${def.effectiveAt}' is not a valid date.`);
  }
  const markdown = await readFile(resolve(root, def.file), "utf8");
  const body = extractBody(markdown);
  if (!body) throw new Error(`${def.file}: body is empty after stripping the title/metadata header.`);
  return {
    ...def,
    body,
    documentId: documentId(def.type, def.version),
    placeholders: findPlaceholders(markdown),
  };
}

// Exported for tests: pure validation, no file I/O, no DB.
export function validateForPublication(documents) {
  const failures = [];
  for (const doc of documents) {
    if (doc.placeholders.length > 0) {
      failures.push(`${doc.type} v${doc.version}: unresolved placeholders: ${doc.placeholders.join(", ")}`);
    }
  }
  return failures;
}

async function provisionOne(client, doc) {
  const existing = await client.query(
    "SELECT title, body, status FROM app.legal_documents WHERE document_type = $1 AND document_version = $2",
    [doc.type, doc.version],
  );
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (row.title === doc.title && row.body === doc.body) {
      return { action: "unchanged", type: doc.type, version: doc.version, status: row.status };
    }
    throw new Error(
      `${doc.type} v${doc.version} already exists in app.legal_documents with different content. `
      + "A published version's text must never be silently overwritten -- bump the version instead.",
    );
  }

  await client.query("BEGIN");
  try {
    // Supersede first, insert second: app.legal_documents has a partial
    // unique index allowing at most one status='active' row per
    // document_type, enforced per-statement (not deferred) -- inserting the
    // new active row before superseding the old one would violate it.
    await client.query(
      "UPDATE app.legal_documents SET status = 'superseded', updated_at = now() "
      + "WHERE document_type = $1 AND status = 'active'",
      [doc.type],
    );
    await client.query(
      `INSERT INTO app.legal_documents
         (document_id, document_type, document_version, title, body, status, effective_at)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)`,
      [doc.documentId, doc.type, doc.version, doc.title, doc.body, doc.effectiveAt],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  return { action: "published", type: doc.type, version: doc.version, status: "active" };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const documents = await Promise.all(DOCUMENTS.map((def) => loadDocument(def)));

  const failures = validateForPublication(documents);
  if (failures.length > 0) {
    console.error("BLOCKED: refusing to provision -- unresolved legal facts remain.");
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error("Fill in the missing operator/legal facts in docs/legal/*.pl.md, then re-run.");
    console.error("See docs/legal/LEGAL-READINESS-REPORT.md, section D/E, for the full list.");
    process.exitCode = 1;
    return;
  }

  console.log("All documents pass placeholder validation:");
  for (const doc of documents) console.log(`  ${doc.type} v${doc.version} (effective ${doc.effectiveAt})`);

  if (dryRun) {
    console.log("Dry run: no database connection was made.");
    return;
  }

  const connectionString = process.env.SCHEDULER_DATABASE_URL;
  if (!connectionString) {
    console.error("SCHEDULER_DATABASE_URL is required to provision (the papadata_platform credential).");
    process.exitCode = 1;
    return;
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    for (const doc of documents) {
      const result = await provisionOne(client, doc);
      console.log(`${result.action}: ${result.type} v${result.version} -> status=${result.status}`);
    }
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
