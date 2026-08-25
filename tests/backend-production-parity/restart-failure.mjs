import { spawnSync } from "node:child_process";

// Only ever used against the local self-signed edge certificate
// (.runtime/backend-production-parity/edge-tls) to prove web/edge restart
// recovery through the real HTTPS edge -- never against a real external
// host, since this script only ever talks to 127.0.0.1/papadata.localhost.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const chaos = process.argv.includes("--chaos");
const composeArgs = ["compose", "-f", "compose.production-parity.yml", "--env-file", ".env.production-parity"];
const failures = [];
const evidence = [];

assertCommand("docker", ["info"]);
assertCommand("docker", ["compose", "version"]);

// migrate-production and minio-init are one-shot jobs whose success state
// IS "exited" -- restarting/health-checking them the way a long-running
// service works would misreport their normal behaviour as a failure, so
// they're intentionally excluded from every check below.
for (const service of [
  "postgres-production",
  "redis-production",
  "api-production",
  "bff-production",
  "worker-production",
  "web-production",
  "edge",
  "minio",
  "otel-collector",
]) {
  assertRunning(service);
}

await restartAndVerify("bff-production", async () => {
  await waitHttp("http://127.0.0.1:53001/readyz", 200);
});
await restartAndVerify("api-production", async () => {
  await waitHttp("http://127.0.0.1:54100/readyz", 200);
  await waitHttp("http://127.0.0.1:53001/readyz", 200);
});
await restartAndVerify("worker-production", async () => {
  await waitRunning("worker-production");
});
await restartAndVerify("web-production", async () => {
  // Docker's own healthcheck (wget against the container's own index.html)
  // AND a real request through the edge -- the second is not redundant:
  // restarting web-production changes its container IP on the Docker
  // network, and nginx (edge) does not re-resolve upstream DNS on its own,
  // so a stale edge would still report itself "healthy" while actually
  // serving 502s to real traffic. This is a real failure mode found by hand
  // during the 2026-08-21 audit -- see tests/backend-production-parity/README.md.
  await waitDockerHealthy("web-production");
  await waitHttps("https://papadata.localhost/", 200);
});
await restartAndVerify("edge", async () => {
  await waitDockerHealthy("edge");
  await waitHttps("https://papadata.localhost/", 200);
});
await restartAndVerify("minio", async () => {
  // minio has no compose healthcheck; its own liveness endpoint is the only
  // honest way to prove the S3 API is actually serving again, not just that
  // the container process is running.
  await waitHttp("http://127.0.0.1:59000/minio/health/live", 200);
});
await restartAndVerify("otel-collector", async () => {
  // otel-collector-contrib has no health_check extension configured here
  // (see infra/otel/otel-collector-config.yaml), so there is no dedicated
  // status endpoint to poll. The OTLP HTTP receiver port responding at all
  // (any HTTP status, not connection-refused) is the honest ceiling of what
  // can be verified without changing the collector's own config.
  await waitHttpAny("http://127.0.0.1:14318/");
});

if (chaos) {
  await gracefulShutdown("bff-production");
  await gracefulShutdown("api-production");
  await gracefulShutdown("worker-production");

  await dependencyOutage("redis-production", "redis", ["bff-production", "worker-production"]);
  await dependencyOutage("postgres-production", "postgresql", ["api-production", "worker-production"]);
  await dependencyOutage("minio", "storage", ["api-production", "worker-production"]);
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
  const started = performance.now();
  runCompose(["restart", service]);
  try {
    await verifier();
    evidence.push({ action: "restart", service, result: "pass", durationMs: Math.round(performance.now() - started) });
  } catch (error) {
    failures.push(`${service} restart: ${message(error)}`);
  }
}

// Stops `service`, then asserts three things instead of only "it came back":
// (1) the /readyz dependency check for `dependencyName` actually flips to
//     not-ready while the service is down -- proving the readiness endpoint
//     is truthful, not just proving the container restarts;
// (2) every service in `dependents` stays in the "running" state during the
//     outage instead of crash-looping/exiting -- a dependency outage must
//     degrade, not kill, the processes that depend on it;
// (3) on recovery, the dependency flips back to ready AND the wider stack
//     (bff readyz, worker running) is healthy again, not just the one
//     dependency check.
async function dependencyOutage(service, dependencyName, dependents) {
  const started = performance.now();
  runCompose(["stop", "-t", "10", service]);
  await sleep(1500);
  evidence.push({ action: "stop", service, state: serviceState(service) });

  try {
    const blocked = await waitReadyzDependency("http://127.0.0.1:54100/readyz", dependencyName, false);
    evidence.push({
      action: `${dependencyName}-outage-detected`,
      service,
      readyzStatus: blocked.status,
      dependencyReady: blocked.dependency?.ready,
    });
  } catch (error) {
    failures.push(`${service} outage was not reflected in /readyz (${dependencyName}): ${message(error)}`);
  }

  for (const dependent of dependents) {
    const state = serviceState(dependent);
    evidence.push({ action: "during-outage-state", service: dependent, dependsOn: service, state });
    if (state !== "running") {
      failures.push(
        `${dependent} left the "running" state while ${service} was down (state=${state}); it must degrade gracefully, not crash/exit.`,
      );
    }
  }

  runCompose(["up", "-d", service]);
  try {
    const recovered = await waitReadyzDependency("http://127.0.0.1:54100/readyz", dependencyName, true);
    evidence.push({
      action: "failure-recovery",
      service,
      readyzStatus: recovered.status,
      dependencyReady: recovered.dependency?.ready,
      result: "pass",
      durationMs: Math.round(performance.now() - started),
    });
  } catch (error) {
    failures.push(`${service} failure recovery: ${message(error)}`);
  }

  try {
    await waitHttp("http://127.0.0.1:53001/readyz", 200);
    await waitRunning("worker-production");
    evidence.push({ action: "stack-recovery", service, result: "pass" });
  } catch (error) {
    failures.push(`stack did not fully recover after ${service} outage: ${message(error)}`);
  }
}

// Restarting a service is not proof of a *graceful* shutdown by itself -- a
// container that gets SIGKILLed after the compose stop grace period and
// simply restarts cleanly would look identical from the outside. Two real
// signals distinguish "cleanup hooks actually ran" from "docker gave up and
// force-killed it":
//   1. Exit code. All three Nest apps here call `app.enableShutdownHooks()`
//      with no `useProcessExit` option, which -- per @nestjs/core's own
//      `listenToShutdownSignals` -- runs onModuleDestroy/shutdown hooks and
//      then re-raises the *same* signal at itself once hooks are done, so
//      the OS's default disposition terminates the process. That correctly
//      yields exit code 143 (128 + SIGTERM), which is standard container
//      convention for "the app handled the signal", NOT a sign of force-kill.
//      A genuine force-kill after the stop grace period elapses instead
//      yields 137 (128 + SIGKILL); an uncaught error in the shutdown hooks
//      yields 1. So the pass set is {0, 143}, not just {0}.
//   2. Wall-clock time. `docker compose stop -t 10` blocks until the
//      container exits *or* the 10s grace period elapses and SIGKILL fires.
//      If cleanup hooks genuinely ran (rather than the grace period simply
//      timing out into a kill), the command returns comfortably under 10s.
async function gracefulShutdown(service) {
  const started = performance.now();
  const id = runCompose(["ps", "-q", service], true).trim();
  if (!id) {
    failures.push(`${service} graceful shutdown: no running container found to stop.`);
    return;
  }

  const stopStartedAt = performance.now();
  runCompose(["stop", "-t", "10", service]);
  const stopDurationMs = Math.round(performance.now() - stopStartedAt);
  const exitCode = runDocker(["inspect", "--format", "{{.State.ExitCode}}", id], true).trim();
  evidence.push({ action: "graceful-shutdown-stop", service, exitCode, stopDurationMs });
  if (exitCode !== "0" && exitCode !== "143") {
    failures.push(
      `${service} did not shut down cleanly (exit code ${exitCode}); expected 0 (explicit exit) or `
      + "143 (Nest's own SIGTERM-after-hooks convention), got something else -- likely a shutdown hook error.",
    );
  }
  if (stopDurationMs >= 9_000) {
    failures.push(
      `${service} took ${stopDurationMs}ms to stop, right up against the 10s grace period -- `
      + "shutdown hooks likely hung and docker force-killed it via SIGKILL rather than the app exiting on its own.",
    );
  }

  runCompose(["up", "-d", service]);
  try {
    if (service === "worker-production") {
      await waitRunning(service);
    } else {
      const port = service === "bff-production" ? 53001 : 54100;
      await waitHttp(`http://127.0.0.1:${port}/readyz`, 200);
    }
    evidence.push({ action: "graceful-shutdown-recovery", service, result: "pass", durationMs: Math.round(performance.now() - started) });
  } catch (error) {
    failures.push(`${service} did not recover after graceful shutdown: ${message(error)}`);
  }
}

async function waitReadyzDependency(
  url,
  dependencyName,
  expectedReady,
  timeoutMs = 60_000,
) {
  // performance.now() is monotonic and immune to system clock jumps
  // (observed live in this WSL2 environment: the wall clock intermittently
  // jumped ~58 minutes mid-poll, which made Date.now()-based deadlines
  // either expire instantly or never expire -- a purely environmental
  // artifact that produced false failures, not a product bug).
  const deadline = performance.now() + timeoutMs;
  let last = "no response";
  while (performance.now() < deadline) {
    try {
      // /readyz gives each dependency check up to 5s internally before it
      // reports the overall result, so the outer request timeout must leave
      // room for that -- a tighter abort here would misreport a slow-but-
      // honest 503 as "no response".
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const body = await response.json();
      const dependency = body.dependencies?.find((item) => item.name === dependencyName);
      last = `status ${response.status} ${dependencyName}.ready=${dependency?.ready}`;
      if (dependency?.ready === expectedReady) {
        return { status: response.status, dependency };
      }
    } catch (error) {
      last = message(error);
    }
    await sleep(1000);
  }
  throw new Error(`${url} did not report ${dependencyName}.ready=${expectedReady}; last=${last}`);
}

function assertRunning(service) {
  const state = serviceState(service);
  if (state !== "running") failures.push(`${service} is not running (state=${state}).`);
  evidence.push({ action: "initial-state", service, state });
}

async function waitRunning(service, timeoutMs = 60_000) {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    if (serviceState(service) === "running") return;
    await sleep(1000);
  }
  throw new Error(`${service} did not become running.`);
}

async function waitHttp(url, expected, timeoutMs = 60_000) {
  // performance.now() is monotonic and immune to system clock jumps
  // (observed live in this WSL2 environment: the wall clock intermittently
  // jumped ~58 minutes mid-poll, which made Date.now()-based deadlines
  // either expire instantly or never expire -- a purely environmental
  // artifact that produced false failures, not a product bug).
  const deadline = performance.now() + timeoutMs;
  let last = "no response";
  while (performance.now() < deadline) {
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

// Same as waitHttp, but through the real HTTPS edge (self-signed cert, see
// the NODE_TLS_REJECT_UNAUTHORIZED note at the top of this file).
async function waitHttps(url, expected, timeoutMs = 60_000) {
  return waitHttp(url, expected, timeoutMs);
}

// Waits for literally any HTTP response (including 4xx/5xx) instead of a
// specific status -- proof the listener accepted a connection and spoke
// HTTP again, for services with no meaningful status code to assert on.
async function waitHttpAny(url, timeoutMs = 60_000) {
  // performance.now() is monotonic and immune to system clock jumps
  // (observed live in this WSL2 environment: the wall clock intermittently
  // jumped ~58 minutes mid-poll, which made Date.now()-based deadlines
  // either expire instantly or never expire -- a purely environmental
  // artifact that produced false failures, not a product bug).
  const deadline = performance.now() + timeoutMs;
  let last = "no response";
  while (performance.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      return response.status;
    } catch (error) {
      last = message(error);
    }
    await sleep(1000);
  }
  throw new Error(`${url} never responded to any HTTP request; last=${last}`);
}

// Polls Docker's own compose healthcheck status (distinct from
// serviceState/"running", which says nothing about whether the service's
// own healthcheck considers it ready) for services that declare one.
async function waitDockerHealthy(service, timeoutMs = 60_000) {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    const id = runCompose(["ps", "-q", service], true).trim();
    if (id) {
      const health = runDocker(
        ["inspect", "--format", "{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}", id],
        true,
      ).trim();
      if (health === "healthy") return;
      if (health === "no-healthcheck") {
        throw new Error(`${service} has no Docker healthcheck configured; use waitHttp/waitRunning instead.`);
      }
    }
    await sleep(1000);
  }
  throw new Error(`${service} did not become healthy.`);
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
