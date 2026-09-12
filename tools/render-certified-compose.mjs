// P0-3 stage 13: renders a ready-to-run Compose config for the CERTIFIED
// release parity stack -- consuming artifacts/release-manifest.json,
// never building anything.
//
// Rather than hand-maintaining a second, duplicated Compose file, this
// script asks `docker compose config` to do the actual merge of the base
// file (compose.production-parity.yml) with the small image-pinning overlay
// (compose.production-parity.release.yml), then performs one further,
// mechanical step Compose itself cannot express portably: deleting the
// `build:` key Compose still carries over from the base file for the four
// release services, and asserting none remain. That assertion is what makes
// "certified parity cannot build" a checked fact rather than an operator
// convention -- see tools/verify-release-candidate.mjs, which is the only
// thing that should invoke this script before starting the stack.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  checkImagesExistLocally,
  DEFAULT_MANIFEST_PATH,
  IMAGE_SERVICES,
  loadManifest,
  validateManifestShape,
} from "./lib/release-manifest.mjs";
import { root } from "./backend-gate-common.mjs";

const RUNTIME_DIR = resolve(root, ".runtime/release-candidate");
const IMAGES_ENV_PATH = resolve(RUNTIME_DIR, "images.env");
const RENDERED_COMPOSE_PATH = resolve(RUNTIME_DIR, "compose.rendered.json");
const SERVICE_NAME = { api: "api-production", bff: "bff-production", worker: "worker-production", web: "web-production" };
const BASE_ENV_FILE = ".env.production-parity";

export async function renderCertifiedCompose({ manifestPath = DEFAULT_MANIFEST_PATH } = {}) {
  const manifest = await loadManifest(manifestPath);
  const shape = validateManifestShape(manifest);
  if (!shape.ok) {
    throw new Error(`release manifest at ${manifestPath} failed shape validation:\n- ${shape.errors.join("\n- ")}`);
  }

  const localCheck = checkImagesExistLocally(manifest);
  const missing = Object.entries(localCheck).filter(([, outcome]) => !outcome.ok);
  if (missing.length > 0) {
    throw new Error(
      `certified release parity cannot start: the following manifest images are not present in the ` +
      `local Docker image store, and there is no rebuild fallback:\n` +
      missing.map(([service, outcome]) => `- ${service}: ${outcome.detail}`).join("\n") +
      `\nRun the build pipeline that produced ${manifestPath} (tools/build-release-images.mjs) first.`,
    );
  }

  if (!existsSync(resolve(root, BASE_ENV_FILE))) {
    throw new Error(`${BASE_ENV_FILE} does not exist -- run "pnpm prepare:production-parity" first.`);
  }

  await mkdir(RUNTIME_DIR, { recursive: true });

  const imagesEnv = IMAGE_SERVICES.map((service) => {
    const key = `${service.toUpperCase()}_IMAGE`;
    return `${key}=${manifest.images[service].reference}`;
  }).join("\n") + "\n";
  await writeFile(IMAGES_ENV_PATH, imagesEnv);

  const mergedJson = execFileSync(
    "docker",
    [
      "compose",
      "-f", "compose.production-parity.yml",
      "--env-file", BASE_ENV_FILE,
      "-f", "compose.production-parity.release.yml",
      "--env-file", IMAGES_ENV_PATH,
      "config", "--format", "json",
    ],
    { cwd: root, encoding: "utf8" },
  );
  const merged = JSON.parse(mergedJson);

  for (const releaseServiceName of Object.values(SERVICE_NAME)) {
    delete merged.services[releaseServiceName]?.build;
  }

  const stillBuildable = Object.values(SERVICE_NAME).filter((name) => merged.services[name]?.build);
  if (stillBuildable.length > 0) {
    throw new Error(`internal error: certified compose still carries a build: key for ${stillBuildable.join(", ")} -- refusing to render an unsafe config`);
  }

  for (const [service, name] of Object.entries(SERVICE_NAME)) {
    const image = merged.services[name]?.image;
    if (image !== manifest.images[service].reference) {
      throw new Error(`internal error: rendered image for ${name} ("${image}") does not match manifest reference ("${manifest.images[service].reference}")`);
    }
  }

  await writeFile(RENDERED_COMPOSE_PATH, `${JSON.stringify(merged, null, 2)}\n`);
  return { imagesEnvPath: IMAGES_ENV_PATH, renderedComposePath: RENDERED_COMPOSE_PATH, manifest };
}

async function main() {
  const manifestPath = process.argv.includes("--manifest")
    ? process.argv[process.argv.indexOf("--manifest") + 1]
    : DEFAULT_MANIFEST_PATH;
  const { renderedComposePath, manifest } = await renderCertifiedCompose({ manifestPath });
  console.log(`CERTIFIED_COMPOSE_RENDERED path=${renderedComposePath} releaseId=${manifest.releaseId} gitSha=${manifest.gitSha}`);
  for (const service of IMAGE_SERVICES) {
    console.log(`  ${service}: ${manifest.images[service].reference}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("CERTIFIED_COMPOSE_RENDER_FAILED", error.message ?? error);
    process.exitCode = 1;
  });
}
