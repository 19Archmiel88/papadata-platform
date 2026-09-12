// P0-3 stage 6/16: the ONE canonical release-candidate gate. Certifies a
// SPECIFIC release manifest (artifacts/release-manifest.json, produced by
// tools/build-release-images.mjs or tools/build-release-manifest-from-images.mjs)
// rather than "the repository at some commit" -- the acceptance evidence
// this writes names exact image digests, not just a Git SHA, which is what
// makes "release candidate RC-X passed certified local parity" a provable
// claim instead of an assumption that nothing changed between build and
// deploy.
//
// This reuses the exact same step list as tools/verify-local-production-parity.mjs
// (see tools/lib/production-parity-steps.mjs) so certified mode is held to
// the same bar as dev/build mode -- the only two differences are (1) an
// up-front manifest/dirty/image-existence gate that runs before anything
// else, and (2) the two live e2e suites are pointed at a rendered,
// digest-pinned compose config (tools/render-certified-compose.mjs) with
// PAPADATA_PARITY_NO_BUILD=1, so `docker build` never runs.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  ensureEvidenceDir,
  gitHead,
  readJson,
  root,
  runCommand,
  writeJson,
} from "./backend-gate-common.mjs";
import { buildProductionParitySteps } from "./lib/production-parity-steps.mjs";
import { DEFAULT_MANIFEST_PATH, IMAGE_SERVICES, loadManifest } from "./lib/release-manifest.mjs";
import { validateReleaseManifest } from "./validate-release-manifest.mjs";
import { renderCertifiedCompose } from "./render-certified-compose.mjs";

const RELEASE_CANDIDATE_EVIDENCE_PATH = "artifacts/release-candidate-evidence.json";
const RC_BACKEND_EVIDENCE_PATH = "artifacts/release-candidate-evidence/backend-e2e.json";
const RC_WEB_ARTIFACT_DIR = "artifacts/release-candidate-evidence/web-production-parity";

const args = process.argv.slice(2);
const manifestPath = args.includes("--manifest") ? args[args.indexOf("--manifest") + 1] : DEFAULT_MANIFEST_PATH;
const allowDirty = args.includes("--allow-dirty");

function tail(text, lines = 40) {
  const parts = text.split("\n");
  return parts.length <= lines ? text : parts.slice(-lines).join("\n");
}

async function main() {
  const startedAt = new Date().toISOString();
  await ensureEvidenceDir();

  // --- Stage 1: certify the manifest itself, before spending any time on
  // the (slow) step chain. Strict-fresh is not optional here: certified
  // local parity is only meaningful when the manifest actually describes
  // the tree it is being run against.
  const manifestCheck = await validateReleaseManifest({
    manifestPath,
    skipImageCheck: false,
    remote: false,
    strictFresh: true,
  });

  if (manifestCheck.result !== "pass") {
    await writeFailureEvidence(startedAt, manifestPath, manifestCheck, { stage: "manifest-validation" });
    console.error("RELEASE_CANDIDATE=FAIL stage=manifest-validation");
    for (const error of manifestCheck.errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  const manifest = await loadManifest(manifestPath);

  // --- Stage 2: dirty gate. A manifest built from a dirty working tree can
  // still exist (tools/build-release-images.mjs does not refuse to build
  // one), but it cannot pass as an OFFICIAL release candidate here.
  if (manifest.dirty && !allowDirty) {
    const detail = {
      stage: "dirty-gate",
      errors: [
        "manifest.dirty is true -- this release manifest was built from an uncommitted working tree and " +
        "cannot be certified as an official release candidate. Commit the change and rebuild the manifest, " +
        "or pass --allow-dirty for an explicit, non-official local experiment.",
      ],
    };
    await writeFailureEvidence(startedAt, manifestPath, manifestCheck, detail);
    console.error("RELEASE_CANDIDATE=FAIL stage=dirty-gate");
    console.error(`  - ${detail.errors[0]}`);
    process.exitCode = 1;
    return;
  }
  if (manifest.dirty && allowDirty) {
    console.warn("WARNING: certifying a DIRTY release manifest because --allow-dirty was passed. This run is not an official release candidate.");
  }

  console.log(`RELEASE_CANDIDATE_MANIFEST_OK releaseId=${manifest.releaseId} gitSha=${manifest.gitSha} dirty=${manifest.dirty}`);
  for (const service of IMAGE_SERVICES) {
    console.log(`  ${service}: ${manifest.images[service].reference}`);
  }

  // --- Stage 3: render the certified, no-build compose config once, up
  // front, so the compose-config step and both e2e steps below all consume
  // the identical rendered file.
  let rendered;
  try {
    rendered = await renderCertifiedCompose({ manifestPath });
  } catch (error) {
    const detail = { stage: "render-certified-compose", errors: [error.message ?? String(error)] };
    await writeFailureEvidence(startedAt, manifestPath, manifestCheck, detail);
    console.error("RELEASE_CANDIDATE=FAIL stage=render-certified-compose");
    console.error(`  - ${detail.errors[0]}`);
    process.exitCode = 1;
    return;
  }

  const steps = buildProductionParitySteps({
    composeArgs: [
      "-f", "compose.production-parity.yml",
      "--env-file", ".env.production-parity",
      "-f", "compose.production-parity.release.yml",
      "--env-file", rendered.imagesEnvPath,
    ],
    e2eEnv: {
      PAPADATA_PARITY_COMPOSE_FILE: rendered.renderedComposePath,
      PAPADATA_PARITY_NO_BUILD: "1",
      PAPADATA_PARITY_EVIDENCE_PATH: RC_BACKEND_EVIDENCE_PATH,
      PAPADATA_PARITY_ARTIFACT_DIR: RC_WEB_ARTIFACT_DIR,
    },
  });

  const results = [];
  for (const step of steps) {
    const before = process.hrtime.bigint();
    const result = runCommand(step.command, step.args, {
      timeout: step.timeout ?? 20 * 60 * 1000,
      ...(step.env ? { env: { ...process.env, ...step.env } } : {}),
    });
    const after = process.hrtime.bigint();
    results.push({ ...step, ...result, durationMs: Number((after - before) / 1_000_000n) });
    const lastLine = result.output.split("\n").filter(Boolean).at(-1) ?? "";
    console.log(`RELEASE_CANDIDATE_STEP=${result.status.toUpperCase()} id=${step.id} ${lastLine}`);
    if (result.status !== "pass") break;
  }

  const overall = results.length === steps.length && results.every((step) => step.status === "pass") ? "pass" : "fail";

  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    startedAt,
    overall,
    manifestPath,
    releaseId: manifest.releaseId,
    gitSha: manifest.gitSha,
    dirty: manifest.dirty,
    allowDirty,
    images: manifest.images,
    runtimeConfig: manifest.runtimeConfig,
    migrations: manifest.migrations,
    terraform: manifest.terraform,
    manifestFreshness: manifestCheck.freshness,
    localImageCheck: manifestCheck.localImageCheck,
    currentGitHead: gitHead(),
    steps: results.map(({ output, ...step }) => ({ ...step, outputTail: tail(output) })),
    referencedEvidence: await collectReferencedEvidence(),
  };

  await writeJson(RELEASE_CANDIDATE_EVIDENCE_PATH, evidence);

  console.log(
    `RELEASE_CANDIDATE=${overall.toUpperCase()} releaseId=${manifest.releaseId} steps=${results.length}/${steps.length} evidence=${RELEASE_CANDIDATE_EVIDENCE_PATH}`,
  );
  if (overall !== "pass") process.exitCode = 1;
}

async function writeFailureEvidence(startedAt, manifestPath, manifestCheck, extra) {
  await writeJson(RELEASE_CANDIDATE_EVIDENCE_PATH, {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    startedAt,
    overall: "fail",
    manifestPath,
    manifestCheck,
    currentGitHead: gitHead(),
    ...extra,
  });
}

async function collectReferencedEvidence() {
  const candidates = [RC_BACKEND_EVIDENCE_PATH, `${RC_WEB_ARTIFACT_DIR}/evidence.json`];
  const referenced = {};
  for (const candidate of candidates) {
    if (!existsSync(resolve(root, candidate))) continue;
    try {
      const parsed = await readJson(candidate);
      referenced[candidate] = {
        status: parsed.status ?? (Array.isArray(parsed.failures) && parsed.failures.length === 0 ? "pass" : "fail"),
        generatedAt: parsed.generatedAt ?? parsed.startedAt ?? null,
      };
    } catch {
      referenced[candidate] = { status: "unreadable" };
    }
  }
  return referenced;
}

main().catch((error) => {
  console.error("RELEASE_CANDIDATE_FAILED", error);
  process.exitCode = 1;
});
