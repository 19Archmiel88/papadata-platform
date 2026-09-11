import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const root = resolve(webRoot, "../..");
const compose = ["compose", "-f", "compose.production-parity.yml", "--env-file", ".env.production-parity"];
const artifactDir = resolve(root, "artifacts/web-production-parity");
const origin = process.env.PAPADATA_PARITY_ORIGIN ?? "https://papadata.localhost";
const evidence = { generatedAt: new Date().toISOString(), origin, checks: [], failures: [] };

function record(name, ok, detail = "") {
  evidence.checks.push({ name, ok, detail });
  if (!ok) evidence.failures.push(`${name}: ${detail}`);
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", stdio: options.capture ? "pipe" : "inherit", env: process.env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed (${result.status})${result.stdout ? `\n${result.stdout}` : ""}${result.stderr ? `\n${result.stderr}` : ""}`);
  return result.stdout ?? "";
}
async function waitForPage(page, url, attempts = 30) {
  let last = "";
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10_000 });
      if (response && response.status() < 500) return response;
      last = `status=${response?.status() ?? "none"}`;
    } catch (error) { last = String(error); }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
  }
  throw new Error(`Origin did not recover: ${last}`);
}

let browser;
try {
  await mkdir(artifactDir, { recursive: true });
  run("pnpm", ["prepare:production-parity"]);
  spawnSync("docker", [...compose, "down", "--remove-orphans"], { cwd: root, stdio: "ignore" });
  run("docker", [...compose, "up", "--build", "--wait"]);

  const maps = run("docker", [...compose, "exec", "-T", "web-production", "sh", "-lc", "find /usr/share/nginx/html -type f -name '*.map' -print"], { capture: true }).trim();
  record("artifact-no-source-maps", maps.length === 0, maps || "none");
  const devArtifacts = run("docker", [...compose, "exec", "-T", "web-production", "sh", "-lc", "find /usr/share/nginx/html -type f \\( -name '*.stories.*' -o -name 'vite.config.*' -o -name 'storybook*' \\) -print"], { capture: true }).trim();
  record("artifact-no-dev-storybook-files", devArtifacts.length === 0, devArtifacts || "none");

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const browserErrors = [];
  let captureBrowserErrors = true;
  const collectPageError = (error) => {
    if (captureBrowserErrors) browserErrors.push(`pageerror:${error.message}`);
  };
  const collectConsoleError = (message) => {
    if (!captureBrowserErrors || message.type() !== "error") return;
    const text = message.text();
    // Chromium reports failed HTTP/network fetches as generic console errors.
    // Network availability is asserted separately below, while application
    // exceptions and explicit console.error calls remain release blockers.
    if (/^Failed to load resource:/iu.test(text)) return;
    browserErrors.push(`console:${text}`);
  };
  page.on("pageerror", collectPageError);
  page.on("console", collectConsoleError);

  const rootResponse = await waitForPage(page, `${origin}/`);
  const headers = rootResponse.headers();
  const csp = headers["content-security-policy"] ?? "";
  record("edge-https", rootResponse.url().startsWith("https://"), rootResponse.url());
  record("edge-hsts", Boolean(headers["strict-transport-security"]), headers["strict-transport-security"] ?? "missing");
  record("edge-csp", csp.includes("default-src 'self'") && csp.includes("object-src 'none'") && csp.includes("frame-ancestors 'none'"), csp || "missing");
  record("edge-nosniff", (headers["x-content-type-options"] ?? "").toLowerCase() === "nosniff", headers["x-content-type-options"] ?? "missing");

  for (const path of ["/login", "/register", "/app"]) {
    const response = await waitForPage(page, `${origin}${path}`);
    record(`browser-smoke:${path}`, response.status() < 500, `status=${response.status()}`);
  }

  const apiResponse = await page.goto(`${origin}/api/csrf`, { waitUntil: "domcontentloaded", timeout: 10_000 });
  const apiCsp = apiResponse?.headers()["content-security-policy"] ?? "";
  record("api-own-csp-not-web-csp", Boolean(apiCsp) && apiCsp !== csp, apiCsp || "missing");

  record("browser-console-steady-state", browserErrors.length === 0, browserErrors.join("\n") || "zero application page/console errors");
  browserErrors.length = 0;
  captureBrowserErrors = false;

  run("docker", [...compose, "restart", "web-production"]);
  await waitForPage(page, `${origin}/login`);
  record("restart-web-recovers", true, "web-production restart recovered through edge");

  run("docker", [...compose, "restart", "edge"]);
  await waitForPage(page, `${origin}/login`);
  record("restart-edge-recovers", true, "edge restart recovered");

  run("docker", [...compose, "stop", "web-production"]);
  let outageObserved = false;
  try {
    const response = await page.goto(`${origin}/`, { waitUntil: "domcontentloaded", timeout: 8_000 });
    outageObserved = !response || response.status() >= 500;
  } catch { outageObserved = true; }
  record("chaos-web-outage-observed", outageObserved, outageObserved ? "edge failed closed while web was stopped" : "unexpected successful response");
  run("docker", [...compose, "start", "web-production"]);
  await waitForPage(page, `${origin}/`);
  record("chaos-web-recovery", true, "web recovered without rebuilding stateful services");

  // Do not let deliberately induced 502/504/reset noise from restart/chaos
  // contaminate the steady-state browser-console assertion. Re-open a fresh
  // page after recovery and assert the application itself is quiet again.
  const recoveryErrors = [];
  const recoveryPage = await context.newPage();
  recoveryPage.on("pageerror", (error) => recoveryErrors.push(`pageerror:${error.message}`));
  recoveryPage.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/^Failed to load resource:/iu.test(text)) return;
    recoveryErrors.push(`console:${text}`);
  });
  await waitForPage(recoveryPage, `${origin}/login`);
  await recoveryPage.waitForTimeout(500);
  record("browser-console-after-recovery", recoveryErrors.length === 0, recoveryErrors.join("\n") || "zero application page/console errors after recovery");
  await recoveryPage.close();
  await context.close();
} catch (error) {
  evidence.failures.push(`harness: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
} finally {
  if (browser) await browser.close().catch(() => undefined);
  if (process.env.PAPADATA_KEEP_PARITY_STACK !== "1") {
    spawnSync("docker", [...compose, "down", "--remove-orphans"], { cwd: root, stdio: "inherit" });
  }
  evidence.status = evidence.failures.length === 0 ? "pass" : "fail";
  await mkdir(artifactDir, { recursive: true });
  await writeFile(resolve(artifactDir, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}

console.log(JSON.stringify(evidence, null, 2));
if (evidence.failures.length > 0) process.exitCode = 1;
