// P0-3 stage 17 (CI path): assembles artifacts/release-manifest.json from
// image digests that were already minted elsewhere -- in CI, by
// .github/workflows/release-candidate.yml pushing each service to GHCR
// (the same push/pull/inspect pattern backend-image-release.yml already
// uses). This is the CI-side counterpart to tools/build-release-images.mjs
// (the local path, which mints digests itself via an ephemeral registry);
// both funnel into the same assembleManifest() so "what a valid manifest
// looks like" has one definition regardless of where the digests came from.
//
// Usage:
//   node tools/build-release-manifest-from-images.mjs \
//     --api ghcr.io/org/repo/api:sha256:...  (repository:digest, ":" separated)
//     --bff ghcr.io/org/repo/bff:sha256:...
//     --worker ghcr.io/org/repo/worker:sha256:...
//     --web ghcr.io/org/repo/web:sha256:...
//     --git-sha <40-hex> [--dirty] [--out artifacts/release-manifest.json]
import { assembleManifest, DEFAULT_MANIFEST_PATH, IMAGE_SERVICES, gitHeadSha } from "./lib/release-manifest.mjs";
import { ensureEvidenceDir, writeJson } from "./backend-gate-common.mjs";

function parseArgs(argv) {
  const args = { dirty: false, out: DEFAULT_MANIFEST_PATH };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--dirty") {
      args.dirty = true;
    } else if (flag === "--git-sha") {
      args.gitSha = argv[++i];
    } else if (flag === "--out") {
      args.out = argv[++i];
    } else if (flag.startsWith("--")) {
      const service = flag.slice(2);
      if (IMAGE_SERVICES.includes(service)) args[service] = argv[++i];
    }
  }
  return args;
}

function parseRepositoryDigest(value, service) {
  // Expects "<repository>@sha256:<hex>" (the standard immutable OCI
  // reference form) -- reject anything else outright rather than guessing.
  const atIndex = value.lastIndexOf("@");
  if (atIndex === -1 || !value.slice(atIndex + 1).startsWith("sha256:")) {
    throw new Error(`--${service} must be "<repository>@sha256:<hex>", got: ${value}`);
  }
  return { repository: value.slice(0, atIndex), digest: value.slice(atIndex + 1) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const gitSha = args.gitSha ?? gitHeadSha();
  const images = {};
  for (const service of IMAGE_SERVICES) {
    if (!args[service]) throw new Error(`missing --${service} <repository>@sha256:<hex>`);
    const { repository, digest } = parseRepositoryDigest(args[service], service);
    images[service] = { repository, tag: gitSha, digest };
  }

  const releaseId = `rc-${gitSha.slice(0, 8)}-${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}`;
  const manifest = await assembleManifest({ images, releaseId, gitSha, dirty: args.dirty });

  await ensureEvidenceDir();
  await writeJson(args.out, manifest);
  console.log(`RELEASE_MANIFEST_WRITTEN path=${args.out} releaseId=${releaseId} gitSha=${gitSha} dirty=${args.dirty}`);
}

main().catch((error) => {
  console.error("RELEASE_MANIFEST_BUILD_FAILED", error);
  process.exitCode = 1;
});
