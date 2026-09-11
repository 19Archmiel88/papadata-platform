import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const config = JSON.parse(await readFile(resolve(process.cwd(), "config/github-governance.required.json"), "utf8"));
const repo = process.env.GITHUB_REPOSITORY || process.env.PAPADATA_GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN || process.env.PAPADATA_GITHUB_TOKEN;
if (!repo) throw new Error("GITHUB_REPOSITORY or PAPADATA_GITHUB_REPOSITORY is required");
const headers = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", ...(token ? { authorization: `Bearer ${token}` } : {}) };
const response = await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(config.branch)}`, { headers, signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`GitHub branch API failed: ${response.status}`);
const branch = await response.json();
const failures = [];
if (config.requireProtection && branch.protected !== true) failures.push(`${config.branch}: branch is not protected`);
const contexts = branch.protection?.required_status_checks?.contexts ?? [];
for (const fragment of config.requiredCheckFragments ?? []) {
  if (!contexts.some((context) => String(context).includes(fragment))) failures.push(`required status check missing: ${fragment}`);
}
// Full PR review/conversation-resolution settings are validated by the protected-branch/ruleset admin evidence,
// because GitHub App installations without administration permission cannot always read those endpoints.
const result = { status: failures.length ? "FAIL" : "PASS", branch: config.branch, protected: branch.protected === true, requiredStatusChecks: contexts, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
