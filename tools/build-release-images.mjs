// P0-3 stage 3/4: BUILD ONCE. Builds the four release images (API, BFF,
// Worker, Web) exactly once from the current Git SHA, mints an immutable
// sha256 digest for each via a throwaway local OCI registry (so this needs
// no GHCR/GCP credentials -- see checkImagesExistLocally in
// tools/lib/release-manifest.mjs for why a real registry round-trip, not
// just `docker inspect` on an unpushed image, is what makes the digest a
// genuine content-addressed artifact identity rather than a local-only
// image ID), and writes artifacts/release-manifest.json binding all four
// digests to this Git SHA, the runtime-config contract hash, the migration
// set hash, and the Terraform identity.
//
// This script never runs as part of certified local parity (see
// tools/verify-release-candidate.mjs) -- that gate only ever CONSUMES a
// manifest this script already produced. Building and certifying are
// deliberately two different commands so certified parity can enforce "no
// docker build" as a hard rule.
import { execFileSync } from "node:child_process";
import { gitHeadSha, gitIsDirty, assembleManifest, DEFAULT_MANIFEST_PATH, IMAGE_SERVICES } from "./lib/release-manifest.mjs";
import { ensureEvidenceDir, root, writeJson } from "./backend-gate-common.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const REGISTRY_PORT = Number(process.env.PAPADATA_RELEASE_REGISTRY_PORT ?? 55051);
const REGISTRY_NAME = "papadata-release-registry";
const REGISTRY_HOST = `localhost:${REGISTRY_PORT}`;

// The ephemeral registry above is anonymous and local-only by design -- no
// push or pull against it ever needs real registry credentials. Rather than
// depend on whatever credential helper the operator's Docker CLI happens to
// have configured globally (docker still calls that helper on every push/
// pull unless told otherwise, and a broken or unavailable helper -- e.g. a
// Docker Desktop credential store with no reachable Desktop process -- would
// otherwise fail Build Once for a reason that has nothing to do with this
// script), every docker invocation here runs against an isolated,
// credential-store-free DOCKER_CONFIG scoped to this script alone. This
// changes nothing about the operator's actual Docker CLI configuration.
const DOCKER_CONFIG_DIR = resolve(root, ".runtime/release-candidate/docker-config");

function dockerEnv() {
  return { ...process.env, DOCKER_CONFIG: DOCKER_CONFIG_DIR };
}

function run(command, args, options = {}) {
  console.log(`+ ${command} ${args.join(" ")}`);
  return execFileSync(command, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], env: dockerEnv(), ...options });
}

function runQuiet(command, args, options = {}) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: dockerEnv(), ...options });
}

function startEphemeralRegistry() {
  try {
    runQuiet("docker", ["rm", "-f", REGISTRY_NAME]);
  } catch {
    // Not present -- fine.
  }
  run("docker", [
    "run", "-d", "--name", REGISTRY_NAME,
    "-p", `127.0.0.1:${REGISTRY_PORT}:5000`,
    "registry:2",
  ]);
  // Wait for the registry to accept connections before the first push.
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      runQuiet("docker", ["exec", REGISTRY_NAME, "wget", "-q", "-O", "/dev/null", "http://127.0.0.1:5000/v2/"]);
      return;
    } catch {
      if (Date.now() > deadline) throw new Error("local release registry did not become ready in time");
    }
  }
}

function stopEphemeralRegistry() {
  try {
    runQuiet("docker", ["rm", "-f", REGISTRY_NAME]);
  } catch {
    // Best-effort cleanup only; the minted digests are already resolved and
    // cached in the local Docker image store by this point.
  }
}

function buildAndMintDigest(service, gitSha, releaseId) {
  const repository = `${REGISTRY_HOST}/papadata-${service}`;
  const tag = gitSha;
  const taggedRef = `${repository}:${tag}`;
  run("docker", [
    "build",
    "-f", `infra/production/${service}.Dockerfile`,
    "-t", taggedRef,
    "--label", `papadata.release.id=${releaseId}`,
    "--label", `papadata.release.gitSha=${gitSha}`,
    ".",
  ]);
  run("docker", ["push", taggedRef]);
  run("docker", ["pull", taggedRef]);
  const repoDigestsRaw = runQuiet("docker", ["inspect", "--format", "{{index .RepoDigests 0}}", taggedRef]).trim();
  const digest = repoDigestsRaw.includes("@") ? repoDigestsRaw.slice(repoDigestsRaw.indexOf("@") + 1) : null;
  if (!digest || !digest.startsWith("sha256:")) {
    throw new Error(`could not resolve a pushed digest for ${service} (got: "${repoDigestsRaw}")`);
  }
  return { repository, tag, digest };
}

async function main() {
  const gitSha = gitHeadSha();
  const dirty = gitIsDirty();
  const releaseId = `rc-${gitSha.slice(0, 8)}-${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}`;

  if (dirty) {
    console.warn(
      `WARNING: working tree is dirty at build time. The manifest will record dirty=true.\n` +
      `A dirty release candidate can still be built for local iteration, but ` +
      `verify:release-candidate refuses to certify it as an official release candidate.`,
    );
  }

  console.log(`RELEASE_BUILD_START releaseId=${releaseId} gitSha=${gitSha} dirty=${dirty}`);

  await mkdir(resolve(root, ".runtime/release-candidate"), { recursive: true });
  await mkdir(DOCKER_CONFIG_DIR, { recursive: true });
  await writeFile(resolve(DOCKER_CONFIG_DIR, "config.json"), "{}\n");
  startEphemeralRegistry();

  const images = {};
  try {
    for (const service of IMAGE_SERVICES) {
      images[service] = buildAndMintDigest(service, gitSha, releaseId);
      console.log(`RELEASE_IMAGE_BUILT service=${service} digest=${images[service].digest}`);
    }
  } finally {
    stopEphemeralRegistry();
  }

  const manifest = await assembleManifest({ images, releaseId, gitSha, dirty });
  await ensureEvidenceDir();
  await writeJson(DEFAULT_MANIFEST_PATH, manifest);

  console.log(`RELEASE_MANIFEST_WRITTEN path=${DEFAULT_MANIFEST_PATH} releaseId=${releaseId}`);
  for (const service of IMAGE_SERVICES) {
    console.log(`  ${service}: ${manifest.images[service].reference}`);
  }
}

main().catch((error) => {
  console.error("RELEASE_BUILD_FAILED", error);
  stopEphemeralRegistry();
  process.exitCode = 1;
});
