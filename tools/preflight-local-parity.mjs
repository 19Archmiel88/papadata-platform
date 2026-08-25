import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { lookup } from "node:dns/promises";
import { readFileSync } from "node:fs";
import os from "node:os";
import { resolve } from "node:path";
import { readJson, repoRoot } from "./lib/production-parity-env.mjs";

const args = new Set(process.argv.slice(2));
const jsonMode = args.has("--json");
const allowRunning = args.has("--allow-running");
const skipDocker = args.has("--skip-docker");
const pkg = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const localContract = await readJson("config/local-production-parity.contract.json");
const expectedNode = pkg.engines.node;
const expectedPnpm = pkg.engines.pnpm;
const checks = [];

record("node", process.versions.node === expectedNode, process.versions.node, `expected ${expectedNode}`, true);
commandVersion("git", ["--version"], true);
commandVersion("openssl", ["version"], true);
commandVersion("corepack", ["--version"], true);
commandVersion("pnpm", ["--version"], true, (value) => value.trim() === expectedPnpm, `expected ${expectedPnpm}`);

if (!skipDocker) {
  commandVersion("docker", ["--version"], true);
  commandVersion("docker", ["compose", "version"], true, (value) => /Docker Compose version/iu.test(value));
  const info = spawnSync("docker", ["info", "--format", "{{json .}}"], { encoding: "utf8" });
  record("docker-daemon", info.status === 0, info.status === 0 ? "reachable" : (info.stderr || "unreachable").trim(), "Docker daemon must be running.", true);
}

const platform = describePlatform();
record("execution-environment", platform.ok, platform.value, platform.note, false);

await checkCanonicalHostname(localContract.canonicalLocalEndpoint.hostname);

const totalGiB = os.totalmem() / (1024 ** 3);
record("system-memory", totalGiB >= 8, `${totalGiB.toFixed(1)} GiB`, "8 GiB minimum recommended; 16 GiB preferred for full parity.", false);

const ports = [4173, 5173, 53001, 54100, 14317, 14318, 55432, 56379, 59000, 59001, 6010];
const edgePortFree = await portIsFree(443);
record(
  "port:443 (LP-6)",
  edgePortFree,
  edgePortFree ? "free" : "unavailable to unprivileged probe",
  edgePortFree
    ? "Canonical HTTPS edge host port is available."
    : "An unprivileged WSL process may receive EACCES for port 443; Docker startup is the authoritative availability check.",
  false,
);
for (const port of ports) {
  const free = await portIsFree(port);
  record(`port:${port}`, free || allowRunning, free ? "free" : "busy", allowRunning ? "Busy port accepted by --allow-running." : "Port must be free before a clean stack start.", !allowRunning);
}

const requiredFailures = checks.filter((check) => check.required && !check.ok);
const output = {
  generatedAt: new Date().toISOString(),
  repo: pkg.name,
  result: requiredFailures.length === 0 ? "pass" : "fail",
  requiredFailures: requiredFailures.map((check) => check.name),
  checks,
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  for (const check of checks) {
    const marker = check.ok ? "OK " : (check.required ? "FAIL" : "WARN");
    console.log(`${marker.padEnd(4)} ${check.name.padEnd(24)} ${check.value}`);
    if (!check.ok && check.note) console.log(`     ${check.note}`);
  }
  console.log(`\nPreflight: ${output.result.toUpperCase()}`);
}

if (requiredFailures.length > 0) process.exitCode = 1;

function record(name, ok, value, note, required) {
  checks.push({ name, ok: Boolean(ok), value: String(value), note: String(note ?? ""), required: Boolean(required) });
}

function commandVersion(command, commandArgs, required, predicate = () => true, expectation = "") {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  const ok = result.status === 0 && predicate(output);
  record(command === "docker" && commandArgs[0] === "compose" ? "docker-compose" : command, ok, output || "not found", expectation || `${command} must be available.`, required);
}

function describePlatform() {
  if (process.platform === "win32") {
    return { ok: false, value: "native Windows", note: "WSL2 Ubuntu is recommended for this repository instead of native Windows execution." };
  }
  if (process.platform !== "linux") {
    return { ok: true, value: process.platform, note: "Linux/WSL2 is the reference execution environment." };
  }
  let proc = "";
  try { proc = readFileSync("/proc/version", "utf8"); } catch {}
  const wsl = /microsoft|wsl/iu.test(proc);
  return {
    ok: true,
    value: wsl ? "WSL2/Linux" : "Linux",
    note: wsl ? "Reference Windows development path detected." : "Native Linux is supported.",
  };
}

async function checkCanonicalHostname(hostname) {
  try {
    const addresses = await lookup(hostname, { all: true });
    const loopback = addresses.some(({ address }) => address === "127.0.0.1" || address === "::1");
    record("canonical-hostname", loopback, addresses.map(({ address }) => address).join(", ") || "resolved", "Expected to resolve to loopback after LP-6 host setup.", false);
  } catch (error) {
    record("canonical-hostname", false, "not resolved", "Expected at LP-0..LP-4; LP-6 must make the canonical host resolve to loopback.", false);
  }
}

function portIsFree(port) {
  return new Promise((resolvePromise) => {
    const server = createServer();
    server.unref();
    server.once("error", () => resolvePromise(false));
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(() => resolvePromise(true));
    });
  });
}
