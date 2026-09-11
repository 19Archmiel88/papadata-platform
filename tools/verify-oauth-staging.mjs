import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const origin = String(process.env.PAPADATA_STAGING_ORIGIN ?? "").replace(/\/$/u, "");
if (!origin.startsWith("https://")) throw new Error("PAPADATA_STAGING_ORIGIN must be an https:// origin");
const failures = [];
const results = [];
const expectedHosts = { google: ["accounts.google.com"], microsoft: ["login.microsoftonline.com"] };
for (const provider of ["google", "microsoft"]) {
  try {
    const response = await fetch(`${origin}/api/v1/auth/oauth/start`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify({ provider, intent: "login", returnTo: "/app" }),
      signal: AbortSignal.timeout(15000),
    });
    const text = await response.text();
    let body; try { body = JSON.parse(text); } catch { body = {}; }
    const candidate = body?.data?.authorizationUrl ?? body?.authorizationUrl ?? body?.data?.url ?? body?.url;
    let host = "";
    try { host = new URL(candidate).hostname.toLowerCase(); } catch {}
    const ok = response.ok && expectedHosts[provider].some((expected) => host === expected || host.endsWith(`.${expected}`));
    if (!ok) failures.push(`${provider}: OAuth start failed or returned unexpected authorization host (status=${response.status}, host=${host || "none"})`);
    if (/client_secret|api[_-]?key|access_token/iu.test(text)) failures.push(`${provider}: response appears to expose secret material`);
    results.push({ provider, status: response.status, authorizationHost: host, ok });
  } catch (error) { failures.push(`${provider}: ${String(error)}`); }
}
const evidence = { generatedAt: new Date().toISOString(), origin, status: failures.length ? "fail" : "pass", results, failures };
const out = resolve(process.cwd(), "artifacts/p1-oauth-staging");
await mkdir(out, { recursive: true });
await writeFile(resolve(out, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (failures.length) process.exitCode = 1;
