// Faza 9 §17/§18: scans every AuditService/AuditRepository/audit.append()
// (and equivalent) call site in the repo for security-sensitive keys
// leaking into audit metadata. Deliberately plain regex/text scanning, not
// structural metadata -- there is no canonical schema for "the shape of a
// metadata object literal" to consult instead (unlike route/capability
// checks, which do have one and must use it -- see route-inventory.ts), so
// this is the appropriate tool for this specific job, not a substitute for
// one.
//
// Lives inside apps/api/src (not tools/) deliberately: this file is
// imported by audit-metadata-safety.test.ts, which `tsc -b` type-checks as
// part of `pnpm --filter @papadata/api build` -- including inside
// infra/production/api.Dockerfile's build, whose Docker build context only
// COPYs apps/api + its declared workspace package dependencies, never the
// repo-root tools/ directory. An earlier version of this file lived in
// tools/ and broke that Docker build for exactly this reason (the lesson
// Faza 9 §30 explicitly calls out re: tsx/dist pitfalls) -- kept in-package
// to stay Docker-build-safe by construction, not by remembering not to
// reach outside apps/api next time.
//
// Pure functions are exported separately from the filesystem-walking entry
// point specifically so a test can exercise the detection logic against
// synthetic fixtures without needing real files.

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

export const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../..");

export type MetadataKeyFinding = {
  readonly key: string;
  readonly pattern: string;
};

export type AuditMetadataViolation = {
  readonly file: string;
  readonly key: string;
  readonly matchedPattern: string;
};

// Case-insensitive; matched against object-literal *keys* only (see
// extractCandidateKeys), not arbitrary substrings of the file, so a key
// named e.g. "tokenCount" or "authorizationScope" still matches --
// deliberately broad per §17's "uwzględnij rozsądne warianty nazw", not
// exact camelCase only. Reviewed manually against every real call site
// found in this repo (see the Faza 9 final report) to confirm zero false
// "this is actually fine" positives before being made a hard gate.
const forbiddenKeyPatterns: readonly RegExp[] = [
  /password/iu,
  /refresh[-_]?token/iu,
  /access[-_]?token/iu,
  /\btoken\b/iu,
  /authorization/iu,
  /\bcookie\b/iu,
  /set[-_]?cookie/iu,
  /client[-_]?secret/iu,
  /\bsecret\b/iu,
  /api[-_]?key/iu,
  /credential/iu,
  /recovery[-_]?code/iu,
  /totp[-_]?secret/iu,
  /\botp\b/iu,
  /raw[-_]?body/iu,
  /request[-_]?body/iu,
];

// Explicit, reviewed non-matches for identifiers that would otherwise trip
// a pattern above but are not actually a secret -- e.g. `credentialReference`
// (an opaque pointer to a secret store, never the secret itself). Kept as a
// narrow, explicit allowlist (not a blanket exemption) so it's reviewable
// in one place.
const knownSafeKeyNames = new Set(["credentialreference"]);

export function findDangerousMetadataKeys(objectLiteralSource: string): readonly MetadataKeyFinding[] {
  const keys = extractCandidateKeys(objectLiteralSource);
  const findings: MetadataKeyFinding[] = [];
  for (const key of keys) {
    if (knownSafeKeyNames.has(key.toLowerCase())) continue;
    const pattern = forbiddenKeyPatterns.find((candidate) => candidate.test(key));
    if (pattern) findings.push({ key, pattern: pattern.source });
  }
  return findings;
}

// Extracts `identifier:` / `"identifier":` / `'identifier':` keys from a
// snippet of object-literal-shaped source text (does not attempt a full
// parse -- callers pass in a bounded snippet, see extractAuditCallBlocks).
function extractCandidateKeys(source: string): readonly string[] {
  const keyPattern = /(?:^|[{,\s])(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:/gmu;
  const keys: string[] = [];
  for (const match of source.matchAll(keyPattern)) {
    const key = match[1] ?? match[2] ?? match[3];
    if (key) keys.push(key);
  }
  return keys;
}

// Beyond the canonical hash-chained `security_audit_events` writer
// (AuditService/AuditRepository.append, matched via `*.append(` below),
// this repo has several other audit-adjacent event writers -- included
// here per §17's "oraz równoważne": IdentityRepository.recordLogin
// (app.identity_audit_events), IntegrationCredentialRepository.
// recordCredentialAccess (app.integration_credential_events), and the two
// AI-runtime event writers. Raw `insert into app.*_events` SQL statements
// (product_domain_events) use positional params rather than a metadata
// object literal and are reviewed manually instead (see the Faza 9 report)
// -- this scanner targets object-literal call sites, which is where a
// stray secret-shaped field would actually get typed by a developer.
const equivalentWriterNames = [
  "recordLogin",
  "recordCredentialAccess",
  "appendAssistantProviderGovernanceEvent",
  "appendAssistantPrivacyRedactionEvent",
];

// Given full file source, finds every `.append(` (or equivalent writer)
// call and returns the source snippet from the call's opening paren up to
// its balanced closing paren, for findDangerousMetadataKeys to scan.
export function extractAuditCallBlocks(fileSource: string): readonly string[] {
  const names = ["(?:audit|this\\.audit)\\.append", ...equivalentWriterNames.map((name) => `(?:\\w+\\.)?${name}`)];
  const callPattern = new RegExp(`\\b(?:${names.join("|")})\\s*\\(`, "gu");
  const blocks: string[] = [];
  for (const match of fileSource.matchAll(callPattern)) {
    const start = match.index + match[0].length - 1; // position of the opening "("
    const end = findMatchingParen(fileSource, start);
    if (end === -1) continue;
    blocks.push(fileSource.slice(start, end + 1));
  }
  return blocks;
}

function findMatchingParen(source: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

// Filesystem entry point: walks apps/ and packages/ (excluding
// node_modules/dist), finds every audit-event writer call site, and
// returns a flat violation list. Deterministic given the working tree (no
// network, no database, no timestamps in the output).
export async function scanRepoForAuditMetadataSafety(root: string = repoRoot): Promise<readonly AuditMetadataViolation[]> {
  const violations: AuditMetadataViolation[] = [];
  for (const dir of ["apps", "packages"]) {
    const files = await collectSourceFiles(join(root, dir));
    for (const file of files) {
      const source = await readFile(file, "utf8");
      const mightCallAWriter = source.includes(".append(")
        || equivalentWriterNames.some((name) => source.includes(name));
      if (!mightCallAWriter) continue;
      for (const block of extractAuditCallBlocks(source)) {
        for (const finding of findDangerousMetadataKeys(block)) {
          violations.push({
            file: file.slice(root.length + 1),
            key: finding.key,
            matchedPattern: finding.pattern,
          });
        }
      }
    }
  }
  return violations;
}

async function collectSourceFiles(dir: string): Promise<readonly string[]> {
  const results: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectSourceFiles(full));
    } else if (
      entry.isFile()
      && (entry.name.endsWith(".ts") || entry.name.endsWith(".mjs"))
      && !entry.name.endsWith(".test.ts")
    ) {
      results.push(full);
    }
  }
  return results;
}
