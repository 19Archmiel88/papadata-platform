// P0-3: shared library for the release manifest -- the single artifact that
// binds one Git SHA to four immutable image digests (API/BFF/Worker/Web)
// plus the runtime-config and migration identities they were certified
// against. Every tool that produces, renders, or gates on the manifest
// (tools/build-release-images.mjs, tools/build-release-manifest-from-images.mjs,
// tools/validate-release-manifest.mjs, tools/render-certified-compose.mjs,
// tools/verify-release-candidate.mjs) imports this module rather than
// re-deriving these rules, so "what makes a manifest valid" has exactly one
// definition.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readJson, root, sha256 } from "../backend-gate-common.mjs";

export const IMAGE_SERVICES = ["api", "bff", "worker", "web"];
export const MANIFEST_SCHEMA_VERSION = 1;
export const DEFAULT_MANIFEST_PATH = "artifacts/release-manifest.json";
export const DEFAULT_EVIDENCE_PATH = "artifacts/release-candidate-evidence.json";

const DIGEST_RE = /^sha256:[0-9a-f]{64}$/;
const GIT_SHA_RE = /^[0-9a-f]{40}$/;

export function isValidDigest(value) {
  return typeof value === "string" && DIGEST_RE.test(value);
}

async function hashConcatenatedFiles(paths) {
  const hash = createHash("sha256");
  for (const path of [...paths].sort()) {
    hash.update(path);
    hash.update("\0");
    hash.update(await readFile(resolve(root, path)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export async function computeRuntimeConfigIdentity() {
  const contractFile = "config/production-parity-env.contract.json";
  return { contractFile, hash: await sha256(contractFile) };
}

export async function computeMigrationsIdentity() {
  const directory = "packages/database/migrations";
  const entries = await readdir(resolve(root, directory), { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => `${directory}/${entry.name}`)
    .sort();
  return { directory, fileCount: files.length, hash: await hashConcatenatedFiles(files) };
}

export async function computeTerraformIdentity() {
  const files = [
    "infra/terraform/main.tf",
    "infra/terraform/variables.tf",
    "infra/terraform/outputs.tf",
    "infra/terraform/versions.tf",
  ];
  const sourceRevision = gitLastCommitTouching("infra/terraform");
  return { configHash: await hashConcatenatedFiles(files), files, sourceRevision };
}

export async function readApiContractVersion() {
  try {
    const openapi = await readJson("contracts/openapi-1.0.json");
    return openapi?.info?.version ?? null;
  } catch {
    return null;
  }
}

export function gitHeadSha() {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

export function gitLastCommitTouching(path) {
  try {
    const value = execFileSync(
      "git",
      ["log", "-1", "--format=%H", "--", path],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return value || null;
  } catch {
    return null;
  }
}

export function gitIsDirty() {
  const status = execFileSync(
    "git",
    ["status", "--porcelain", "--untracked-files=normal"],
    { cwd: root, encoding: "utf8" },
  ).trim();
  return status.length > 0;
}

// Assembles a manifest from already-known image identities (repository/tag/
// digest per service) -- the part that differs between the local build path
// (tools/build-release-images.mjs, digests minted via an ephemeral local
// registry) and the CI path (tools/build-release-manifest-from-images.mjs,
// digests minted by pushing to GHCR) -- plus the non-image identities, which
// are always derived the same way from the working tree.
export async function assembleManifest({ images, releaseId, gitSha, dirty }) {
  for (const service of IMAGE_SERVICES) {
    const image = images[service];
    if (!image || !isValidDigest(image.digest)) {
      throw new Error(`assembleManifest: missing or invalid digest for service "${service}"`);
    }
  }

  const [runtimeConfig, migrations, terraform, apiContractVersion] = await Promise.all([
    computeRuntimeConfigIdentity(),
    computeMigrationsIdentity(),
    computeTerraformIdentity(),
    readApiContractVersion(),
  ]);

  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    releaseId,
    gitSha,
    dirty,
    createdAt: new Date().toISOString(),
    images: Object.fromEntries(
      IMAGE_SERVICES.map((service) => {
        const image = images[service];
        return [
          service,
          {
            repository: image.repository,
            tag: image.tag,
            digest: image.digest,
            reference: `${image.repository}@${image.digest}`,
          },
        ];
      }),
    ),
    runtimeConfig,
    migrations,
    terraform,
    apiContract: { file: "contracts/openapi-1.0.json", version: apiContractVersion },
  };
}

export async function loadManifest(path = DEFAULT_MANIFEST_PATH) {
  return readJson(path);
}

// Structural validation only -- schema shape, digest format, and internal
// consistency (reference == repository@digest). Does not touch Docker or the
// network; see checkImagesExistLocally/Remote for that. Kept dependency-free
// (no external JSON-schema library) since the shape is small and stable.
export function validateManifestShape(manifest) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };

  check(manifest && typeof manifest === "object", "manifest must be a JSON object");
  if (!manifest || typeof manifest !== "object") return { ok: false, errors };

  check(manifest.schemaVersion === MANIFEST_SCHEMA_VERSION, `schemaVersion must be ${MANIFEST_SCHEMA_VERSION}`);
  check(typeof manifest.releaseId === "string" && manifest.releaseId.length > 0, "releaseId must be a non-empty string");
  check(GIT_SHA_RE.test(manifest.gitSha ?? ""), "gitSha must be a 40-character hex Git SHA");
  check(typeof manifest.dirty === "boolean", "dirty must be a boolean");
  check(typeof manifest.createdAt === "string" && !Number.isNaN(Date.parse(manifest.createdAt)), "createdAt must be an ISO timestamp");

  check(manifest.images && typeof manifest.images === "object", "images must be an object");
  for (const service of IMAGE_SERVICES) {
    const image = manifest.images?.[service];
    const label = `images.${service}`;
    if (!image || typeof image !== "object") {
      errors.push(`${label} is missing`);
      continue;
    }
    check(typeof image.repository === "string" && image.repository.length > 0, `${label}.repository must be a non-empty string`);
    check(typeof image.tag === "string" && image.tag.length > 0, `${label}.tag must be a non-empty string`);
    check(isValidDigest(image.digest), `${label}.digest must match sha256:<64 hex chars>`);
    check(
      typeof image.reference === "string" && image.reference === `${image.repository}@${image.digest}`,
      `${label}.reference must equal "\${repository}@\${digest}" (immutable digest reference, not a mutable tag)`,
    );
    // Defense in depth: a reference is only trustworthy as an immutable
    // artifact identity if it actually carries the digest -- reject any
    // reference that resolves to a bare/mutable tag such as ":latest" with
    // no "@sha256:" suffix, even if some other field were spoofed to match.
    if (typeof image.reference === "string") {
      check(image.reference.includes("@sha256:"), `${label}.reference must be pinned by digest, not a mutable tag`);
    }
  }

  check(manifest.runtimeConfig?.hash && /^[0-9a-f]{64}$/.test(manifest.runtimeConfig.hash), "runtimeConfig.hash must be a sha256 hex digest");
  check(typeof manifest.runtimeConfig?.contractFile === "string", "runtimeConfig.contractFile must be a string");
  check(manifest.migrations?.hash && /^[0-9a-f]{64}$/.test(manifest.migrations.hash), "migrations.hash must be a sha256 hex digest");
  check(Number.isInteger(manifest.migrations?.fileCount) && manifest.migrations.fileCount > 0, "migrations.fileCount must be a positive integer");
  check(manifest.terraform?.configHash && /^[0-9a-f]{64}$/.test(manifest.terraform.configHash), "terraform.configHash must be a sha256 hex digest");

  return { ok: errors.length === 0, errors };
}

// Recomputes the content-derived identities (runtimeConfig/migrations/
// terraform hashes) from the CURRENT working tree and compares them against
// what the manifest claims. Only meaningful when manifest.gitSha equals the
// current HEAD -- comparing against a manifest built from a different commit
// would report false drift, so callers should gate on headMatches first.
export async function checkManifestFreshness(manifest) {
  const headMatches = manifest.gitSha === gitHeadSha();
  if (!headMatches) {
    return { headMatches, runtimeConfigMatches: null, migrationsMatches: null, terraformMatches: null };
  }
  const [runtimeConfig, migrations, terraform] = await Promise.all([
    computeRuntimeConfigIdentity(),
    computeMigrationsIdentity(),
    computeTerraformIdentity(),
  ]);
  return {
    headMatches,
    runtimeConfigMatches: runtimeConfig.hash === manifest.runtimeConfig?.hash,
    migrationsMatches: migrations.hash === manifest.migrations?.hash,
    terraformMatches: terraform.configHash === manifest.terraform?.configHash,
  };
}

function runDocker(args) {
  return execFileSync("docker", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

// Confirms each manifest image is present in the LOCAL Docker image store
// under its exact digest reference. This is the enforcement point for "no
// rebuild fallback": if an image is missing, the answer is "go run the build
// pipeline that produced this manifest," never "build it now."
export function checkImagesExistLocally(manifest) {
  const results = {};
  for (const service of IMAGE_SERVICES) {
    const reference = manifest.images?.[service]?.reference;
    if (!reference) {
      results[service] = { ok: false, detail: "no reference in manifest" };
      continue;
    }
    try {
      runDocker(["image", "inspect", reference]);
      results[service] = { ok: true, reference };
    } catch (error) {
      results[service] = { ok: false, detail: `not present in local Docker image store: ${reference}`, reference };
    }
  }
  return results;
}

// Best-effort remote existence check against the actual registry. Never
// required for the local certification gate (P0-3 stage 12: no GCP/registry
// credentials required for the basic local test) -- callers opt in
// explicitly (e.g. --remote) and must treat "unreachable" as distinct from
// "missing."
export function checkImagesExistRemote(manifest) {
  const results = {};
  for (const service of IMAGE_SERVICES) {
    const reference = manifest.images?.[service]?.reference;
    if (!reference) {
      results[service] = { ok: false, detail: "no reference in manifest" };
      continue;
    }
    try {
      runDocker(["manifest", "inspect", reference]);
      results[service] = { ok: true, reference };
    } catch (error) {
      results[service] = { ok: false, detail: "unreachable-or-missing", reference, error: String(error.message ?? error).split("\n")[0] };
    }
  }
  return results;
}
