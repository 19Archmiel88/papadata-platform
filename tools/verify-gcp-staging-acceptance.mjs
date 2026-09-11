import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const origin = String(process.env.PAPADATA_STAGING_ORIGIN ?? "").replace(/\/$/u, "");
if (!origin.startsWith("https://")) throw new Error("PAPADATA_STAGING_ORIGIN must be an https:// origin");
const failures = [];
const checks = [];
async function get(path) {
  try {
    const response = await fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    checks.push({ path, status: response.status });
    return response;
  } catch (error) { failures.push(`${path}: ${String(error)}`); return null; }
}
const root = await get("/");
if (!root || root.status >= 400) failures.push("/: web is not healthy through the public load balancer");
if (root) {
  const hsts = root.headers.get("strict-transport-security") ?? "";
  const csp = root.headers.get("content-security-policy") ?? "";
  if (!hsts) failures.push("/: HSTS missing");
  if (!csp.includes("default-src 'self'") || !csp.includes("object-src 'none'")) failures.push("/: production CSP missing required directives");
}
for (const path of ["/login", "/api/csrf"]) {
  const response = await get(path);
  if (!response || response.status >= 400) failures.push(`${path}: public Web/BFF route unavailable through load balancer`);
}
const evidence = { generatedAt: new Date().toISOString(), origin, status: failures.length ? "fail" : "pass", checks, failures };
const out = resolve(process.cwd(), "artifacts/p1-gcp-staging");
await mkdir(out, { recursive: true });
await writeFile(resolve(out, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (failures.length) process.exitCode = 1;
