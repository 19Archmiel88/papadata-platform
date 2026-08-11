import { spawnSync } from "node:child_process";

const chaos = process.argv.includes("--chaos");
const composeArgs = ["compose", "-f", "compose.production-parity.yml", "--env-file", ".env.production-parity"];
const failures = [];
const evidence = [];

assertCommand("docker", ["info"]);
assertCommand("docker", ["compose", "version"]);

for (const service of ["postgres-production", "redis-production", "api-production", "bff-production", "worker-production"]) {
  assertRunning(service);
}

await restartAndVerify("bff-production", async () => {
  await waitHttp("http://127.0.0.1:53001/readyz", 200);
});
await restartAndVerify("api-production", async () => {
  await waitHttp("http://127.0.0.1:54000/readyz", 200);
  await waitHttp("http://127.0.0.1:53001/readyz", 200);
});
await restartAndVerify("worker-production", async () => {
  await waitRunning("worker-production");
});

if (chaos) {
  await controlledOutage("redis-production", async () => {
    await waitHealthy("redis-production");
    await waitRunning("bff-production");
    await waitRunning("worker-production");
  });
  await controlledOutage("postgres-production", async () => {
    await waitHealthy("postgres-production");
    runCompose(["restart", "api-production", "worker-production"]);
    await waitHttp("http://127.0.0.1:54000/readyz", 200);
    await waitHttp("http://127.0.0.1:53001/readyz", 200);
    await waitRunning("worker-production");
  });
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  chaos,
  result: failures.length === 0 ? "pass" : "fail",
  evidence,
  failures,
}, null, 2));
if (failures.length > 0) process.exitCode = 1;

async function restartAndVerify(service, verifier) {
  const started = Date.now();
  runCompose(["restart", service]);
  try {
    await verifier();
    evidence.push({ action: "restart", service, result: "pass", durationMs: Date.now() - started });
  } catch (error) {
    failures.push(`${service} restart: ${message(error)}`);
  }
}

async function controlledOutage(service, verifier) {
  const started = Date.now();
  runCompose(["stop", "-t", "10", service]);
  await sleep(1500);
  const stopped = serviceState(service);
  evidence.push({ action: "stop", service, state: stopped });
  runCompose(["up", "-d", service]);
  try {
    await verifier();
    evidence.push({ action: "failure-recovery", service, result: "pass", durationMs: Date.now() - started });
  } catch (error) {
    failures.push(`${service} failure recovery: ${message(error)}`);
  }
}

function assertRunning(service) {
  const state = serviceState(service);
  if (state !== "running") failures.push(`${service} is not running (state=${state}).`);
  evidence.push({ action: "initial-state", service, state });
}

async function waitRunning(service, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (serviceState(service) === "running") return;
    await sleep(1000);
  }
  throw new Error(`${service} did not become running.`);
}

async function waitHealthy(service, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const id = runCompose(["ps", "-q", service], true).trim();
    if (id) {
      const health = runDocker(["inspect", "--format", "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}", id], true).trim();
      if (health === "healthy" || health === "running") return;
    }
    await sleep(1000);
  }
  throw new Error(`${service} did not become healthy.`);
}

async function waitHttp(url, expected, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let last = "no response";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      last = `status ${response.status}`;
      if (response.status === expected) return;
    } catch (error) {
      last = message(error);
    }
    await sleep(1000);
  }
  throw new Error(`${url} did not return ${expected}; last=${last}`);
}

function serviceState(service) {
  const id = runCompose(["ps", "-q", "-a", service], true).trim();
  if (!id) return "missing";
  return runDocker(["inspect", "--format", "{{.State.Status}}", id], true).trim() || "unknown";
}

function runCompose(args, capture = false) {
  return runDocker([...composeArgs, ...args], capture);
}

function runDocker(args, capture = false) {
  const result = spawnSync("docker", args, { encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
  if (result.status !== 0) throw new Error(`docker ${args.join(" ")} failed${result.stderr ? `: ${result.stderr.trim()}` : ""}`);
  return capture ? result.stdout : "";
}

function assertCommand(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} is required.`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function message(error) {
  return error instanceof Error ? error.message : String(error);
}
