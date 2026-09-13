// P0-3 stage 12: the release manifest validator. Checks manifest schema
// shape, digest format, internal reference consistency, and (by default)
// that all four images actually exist in the local Docker image store --
// with no requirement for registry/GCP credentials (--remote opts into an
// additional best-effort registry check). --strict-fresh additionally
// requires the manifest's Git SHA to equal the current HEAD and its
// content-derived hashes (runtime config, migrations, Terraform) to match
// what the current working tree actually contains, which is what makes
// "this manifest still describes this tree" a checkable fact rather than an
// assumption.
import {
  checkImagesExistLocally,
  checkImagesExistRemote,
  checkManifestFreshness,
  DEFAULT_MANIFEST_PATH,
  loadManifest,
  validateManifestShape,
} from "./lib/release-manifest.mjs";

function parseArgs(argv) {
  const args = { manifestPath: DEFAULT_MANIFEST_PATH, skipImageCheck: false, remote: false, strictFresh: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--manifest") args.manifestPath = argv[++i];
    else if (flag === "--skip-image-check") args.skipImageCheck = true;
    else if (flag === "--remote") args.remote = true;
    else if (flag === "--strict-fresh") args.strictFresh = true;
  }
  return args;
}

export async function validateReleaseManifest({ manifestPath, skipImageCheck, remote, strictFresh }) {
  const errors = [];
  let manifest;
  try {
    manifest = await loadManifest(manifestPath);
  } catch (error) {
    return { result: "fail", errors: [`could not read manifest at ${manifestPath}: ${error.message}`] };
  }

  const shape = validateManifestShape(manifest);
  errors.push(...shape.errors);

  const report = { manifestPath, releaseId: manifest?.releaseId, gitSha: manifest?.gitSha, dirty: manifest?.dirty };

  if (shape.ok && !skipImageCheck) {
    const local = checkImagesExistLocally(manifest);
    report.localImageCheck = local;
    for (const [service, outcome] of Object.entries(local)) {
      if (!outcome.ok) errors.push(`images.${service} not found locally: ${outcome.detail} (no rebuild fallback exists -- run the build pipeline that produced this manifest)`);
    }
  }

  if (shape.ok && remote) {
    const remoteCheck = checkImagesExistRemote(manifest);
    report.remoteImageCheck = remoteCheck;
    for (const [service, outcome] of Object.entries(remoteCheck)) {
      if (!outcome.ok) errors.push(`images.${service} not confirmed in registry: ${outcome.detail}`);
    }
  }

  if (shape.ok && strictFresh) {
    const freshness = await checkManifestFreshness(manifest);
    report.freshness = freshness;
    if (!freshness.headMatches) {
      errors.push(`manifest.gitSha (${manifest.gitSha}) does not match current HEAD -- this manifest cannot be strictly certified against the current working tree`);
    } else {
      if (freshness.runtimeConfigMatches === false) errors.push("runtimeConfig.hash does not match the current runtime-config contract file (manifest is stale)");
      if (freshness.migrationsMatches === false) errors.push("migrations.hash does not match the current migrations directory (manifest is stale)");
      if (freshness.terraformMatches === false) errors.push("terraform.configHash does not match the current Terraform source (manifest is stale)");
    }
  }

  return { result: errors.length ? "fail" : "pass", errors, ...report };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await validateReleaseManifest(args);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.result === "pass" ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
