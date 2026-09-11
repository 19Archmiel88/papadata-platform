import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const root = resolve(webRoot, "../..");
const staticDir = resolve(webRoot, "storybook-static");
const artifactDir = resolve(root, "artifacts/storybook-acceptance");
const screenshotDir = resolve(artifactDir, "screenshots");
const port = Number(process.env.PAPADATA_STORYBOOK_ACCEPTANCE_PORT ?? 6011);
const origin = `http://127.0.0.1:${port}`;
const axePath = require.resolve("axe-core/axe.min.js");
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];
const evidence = { generatedAt: new Date().toISOString(), storyCount: 0, screenCount: 0, checks: [], failures: [] };
let server;
let browser;

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed (${result.status})`);
}
async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try { if ((await fetch(`${origin}/index.json`)).ok) return; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error("Storybook static server did not start");
}
function safeName(value) { return value.replace(/[^a-z0-9_.-]+/giu, "-").replace(/^-+|-+$/gu, "").slice(0, 150); }
function errorText(error) { return error instanceof Error ? error.stack ?? error.message : String(error); }
const productScreenStoryDirectories = [
  "20-product-shell",
  "25-access-registration-onboarding",
  "30-command-center",
  "31-paid-campaigns",
  "32-orders",
  "33-products",
  "34-customers",
  "35-traffic-funnel",
  "36-decisions",
  "37-help-center",
  "38-settings-governance",
  "39-subscription-billing",
  "40-integrations",
  "40-saved-reports",
  "41-papa-assistant",
];
function isScreenStory(entry) {
  const importPath = String(entry.importPath ?? "").replaceAll("\\", "/");
  return productScreenStoryDirectories.some((directory) =>
    importPath.includes(`/storybook-next/stories/${directory}/`)
  );
}
async function runAxe(page) {
  await page.waitForTimeout(150);
  const hasAxe = await page.evaluate(() => typeof window.axe?.run === "function");
  if (!hasAxe) await page.addScriptTag({ path: axePath });
  let lastBusyError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await page.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
    } catch (error) {
      const message = errorText(error);
      if (!message.includes("Axe is already running")) throw error;
      lastBusyError = error;
      await page.waitForTimeout(100);
    }
  }
  throw new Error(`Axe remained busy after retries: ${errorText(lastBusyError)}`);
}
async function hasVisibleKeyboardFocus(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement) || element === document.body || element === document.documentElement) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
  });
}
async function inspectStory(page, entry, viewport, screenshot) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  const pageErrors = [];
  const consoleErrors = [];
  const onPageError = (error) => pageErrors.push(error.message);
  const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  try {
    const response = await page.goto(`${origin}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=story`, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response || response.status() >= 400) throw new Error(`story returned ${response?.status() ?? "no response"}`);
    const result = await runAxe(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    const focusable = await page.locator('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').count();
    let keyboardFocus = true;
    if (focusable > 0) {
      keyboardFocus = await hasVisibleKeyboardFocus(page);
      if (!keyboardFocus) {
        await page.keyboard.press("Tab");
        keyboardFocus = await hasVisibleKeyboardFocus(page);
      }
    }
    const violations = result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target),
    }));
    if (screenshot) await page.screenshot({ path: resolve(screenshotDir, `${safeName(entry.id)}-${viewport.name}.png`), fullPage: true });
    return { pageErrors, consoleErrors, violations, overflow, keyboardFocus };
  } finally {
    page.off("pageerror", onPageError);
    page.off("console", onConsole);
  }
}
function recordResult(entry, viewportName, result, suffix = "") {
  const prefix = suffix ? `${entry.id}/${viewportName}` : entry.id;
  if (result.pageErrors.length) evidence.failures.push(`${prefix}: page errors: ${result.pageErrors.join(" | ")}`);
  if (result.consoleErrors.length) evidence.failures.push(`${prefix}: console errors: ${result.consoleErrors.join(" | ")}`);
  if (result.violations.length) {
    evidence.failures.push(`${prefix}: axe ${result.violations.map((violation) => {
      const targets = violation.targets.flat().join(", ");
      return `${violation.id}(${violation.nodes})${targets ? ` targets=[${targets}]` : ""}`;
    }).join(", ")}`);
  }
  if (result.overflow) evidence.failures.push(`${prefix}: horizontal overflow${suffix ? "" : " at 1440px"}`);
  if (!result.keyboardFocus) evidence.failures.push(`${prefix}: ${suffix ? "keyboard focus missing" : "first keyboard navigation did not expose visible focus"}`);
}

try {
  await mkdir(screenshotDir, { recursive: true });
  if (!existsSync(resolve(staticDir, "index.json"))) run("pnpm", ["build-storybook"]);
  server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", staticDir], { cwd: root, stdio: "ignore" });
  await waitForServer();
  const index = JSON.parse(await readFile(resolve(staticDir, "index.json"), "utf8"));
  const stories = Object.values(index.entries ?? {}).filter((entry) => entry.type === "story").sort((a, b) => a.id.localeCompare(b.id));
  evidence.storyCount = stories.length;
  const screenStories = stories.filter(isScreenStory);
  evidence.screenCount = screenStories.length;
  if (stories.length === 0) throw new Error("Storybook index contains no stories");

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenStoryIds = new Set(screenStories.map((entry) => entry.id));
  for (const entry of stories) {
    try {
      const screenAcceptance = screenStoryIds.has(entry.id);
      const result = await inspectStory(page, entry, viewports[0], screenAcceptance);
      evidence.checks.push({ storyId: entry.id, viewport: "desktop", ...(screenAcceptance ? { screenAcceptance: true } : {}), ...result });
      recordResult(entry, "desktop", result, screenAcceptance ? "screen" : "");
    } catch (error) {
      evidence.failures.push(`${entry.id}: harness error: ${errorText(error)}`);
    }
  }

  for (const entry of screenStories) {
    // Desktop was already exercised above. Responsive screen acceptance only
    // adds the remaining viewport obligations instead of counting desktop twice.
    for (const viewport of viewports.slice(1)) {
      try {
        const result = await inspectStory(page, entry, viewport, true);
        evidence.checks.push({ storyId: entry.id, viewport: viewport.name, screenAcceptance: true, ...result });
        recordResult(entry, viewport.name, result, "screen");
      } catch (error) {
        evidence.failures.push(`${entry.id}/${viewport.name}: harness error: ${errorText(error)}`);
      }
    }
    try {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(`${origin}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=story`, { waitUntil: "networkidle", timeout: 30_000 });
      const reflowOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      evidence.checks.push({ storyId: entry.id, viewport: "reflow-320", overflow: reflowOverflow });
      if (reflowOverflow) evidence.failures.push(`${entry.id}: WCAG reflow overflow at 320px`);
    } catch (error) {
      evidence.failures.push(`${entry.id}/reflow-320: harness error: ${errorText(error)}`);
    }
  }
  await context.close();
} catch (error) {
  evidence.failures.push(`harness: ${errorText(error)}`);
} finally {
  if (browser) await browser.close().catch(() => undefined);
  if (server) server.kill("SIGTERM");
  evidence.status = evidence.failures.length === 0 ? "pass" : "fail";
  evidence.failureCount = evidence.failures.length;
  await mkdir(artifactDir, { recursive: true });
  await writeFile(resolve(artifactDir, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}

console.log(JSON.stringify({
  status: evidence.status,
  storyCount: evidence.storyCount,
  screenCount: evidence.screenCount,
  failureCount: evidence.failures.length,
  failures: evidence.failures,
}, null, 2));
if (evidence.failures.length > 0) process.exitCode = 1;
