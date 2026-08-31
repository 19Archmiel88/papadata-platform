import { createHmac, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import https from "node:https";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("../..", import.meta.url).pathname);
const evidencePath = resolve(root, "artifacts/backend-evidence/production-parity-e2e.json");
const compose = ["compose", "-f", "compose.production-parity.yml", "--env-file", ".env.production-parity"];
const origin = "https://papadata.localhost";
const host = "papadata.localhost";
const caPath = resolve(root, ".runtime/backend-production-parity/edge-tls/ca.crt");
const results = [];
const startedAt = new Date().toISOString();
let stackStarted = false;

class CookieJar {
  #cookies = new Map();

  store(setCookie) {
    const values = Array.isArray(setCookie)
      ? setCookie
      : typeof setCookie === "string"
        ? [setCookie]
        : [];
    for (const value of values) {
      const first = value.split(";", 1)[0] ?? "";
      const separator = first.indexOf("=");
      if (separator <= 0) continue;
      this.#cookies.set(first.slice(0, separator), first.slice(separator + 1));
    }
  }

  header() {
    return [...this.#cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

try {
  await record("prepare-production-parity", () =>
    run("pnpm", ["prepare:production-parity"], { timeout: 120_000 }));
  await record("verify-production-parity-env", () =>
    run("pnpm", ["verify:production-parity-env"], { timeout: 60_000 }));
  await record("compose-config", () =>
    run("docker", [...compose, "config"], { timeout: 60_000 }));
  assertNoDevRuntimeFallbacks();

  await record("compose-down-before-run", () =>
    run("docker", [...compose, "down", "--remove-orphans"], { timeout: 120_000 }));
  await record("compose-up-build", () =>
    run("docker", [...compose, "up", "--build", "-d"], { timeout: 1_200_000 }));
  stackStarted = true;

  await record("compose-health", waitForComposeHealth);
  await record("direct-readiness", directReadiness);
  await record("edge-health-readiness", edgeHealthReadiness);
  await record("redis-tls-auth", redisTlsAuth);

  const runtime = await record("edge-bff-api-auth-rbac-worker-storage-e2e", authReportFlow);
  await record("rbac-role-matrix-runtime", () => rbacRoleMatrixRuntime(runtime));
  await record("postgres-rls-runtime", () => postgresRlsRuntime(runtime));
  await record("minio-object-runtime", () => minioObjectRuntime(runtime.objectKey));

  // Phase 8 -- browser auth/session runtime: real backend contract checks
  // the frontend's single-flight refresh / logout / session-revoke logic
  // depends on (see the flow functions above for what each proves).
  // client-runtime-parallel-refresh drives the actual production BffClient/
  // AuthRefreshCoordinator code (Blocker 1); auth-concurrent-refresh-race
  // stays as the complementary negative test that bypasses client
  // coordination entirely to confirm backend reuse detection still fires.
  await record("client-runtime-parallel-refresh", clientRuntimeParallelRefreshFlow);
  await record("auth-concurrent-refresh-race-runtime", concurrentRefreshRaceFlow);
  await record("auth-logout-runtime", logoutFlow);
  await record("auth-logout-all-runtime", logoutAllFlow);
  await record("auth-session-revoke-runtime", sessionRevokeFlow);

  await writeEvidence("pass");
  console.log(`PRODUCTION_PARITY_E2E=PASS evidence=${relativeEvidencePath()}`);
} catch (error) {
  await writeEvidence("fail", error);
  console.error(`PRODUCTION_PARITY_E2E=FAIL evidence=${relativeEvidencePath()}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (stackStarted && process.env.PAPADATA_KEEP_PARITY_STACK !== "1") {
    const down = run("docker", [...compose, "down", "--remove-orphans"], {
      allowFailure: true,
      timeout: 180_000,
    });
    results.push({
      id: "compose-down-after-run",
      status: down.status === 0 ? "pass" : "fail",
      output: tail(down.output),
    });
    await writeEvidence(process.exitCode ? "fail" : "pass");
  }
}

async function record(id, action) {
  const started = Date.now();
  try {
    const value = await action();
    const output = value && typeof value === "object" && "output" in value ? value.output : "";
    results.push({ id, status: "pass", durationMs: Date.now() - started, output: tail(output) });
    console.log(`PRODUCTION_PARITY_STEP=PASS id=${id}`);
    return value;
  } catch (error) {
    results.push({
      id,
      status: "fail",
      durationMs: Date.now() - started,
      output: tail(error instanceof Error ? error.message : String(error)),
    });
    console.error(`PRODUCTION_PARITY_STEP=FAIL id=${id}`);
    throw error;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...(options.env ?? {}) },
    maxBuffer: 20 * 1024 * 1024,
    timeout: options.timeout ?? 300_000,
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
  if (result.error) throw new Error(`${command} ${args.join(" ")} failed: ${result.error.message}`);
  if (!options.allowFailure && result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status ?? "no status"}\n${tail(output, 80)}`);
  }
  return { output, status: result.status ?? 1 };
}

function assertNoDevRuntimeFallbacks() {
  const composeText = readFileSync(resolve(root, "compose.production-parity.yml"), "utf8");
  const apiDockerfile = readFileSync(resolve(root, "infra/production/api.Dockerfile"), "utf8");
  const bffDockerfile = readFileSync(resolve(root, "infra/production/bff.Dockerfile"), "utf8");
  const workerDockerfile = readFileSync(resolve(root, "infra/production/worker.Dockerfile"), "utf8");
  const webClient = readFileSync(resolve(root, "apps/web/src/storybook-next/runtime/shared/api/bffClient.ts"), "utf8");
  const forbidden = [
    "PAPADATA_API_QUEUE_DRIVER: test-memory",
    "BFF_SESSION_STORE: test-memory",
    "redis://127.0.0.1:6379",
    "NODE_ENV: development",
  ];
  for (const token of forbidden) {
    if (composeText.includes(token)) throw new Error(`Production-parity compose contains dev fallback: ${token}`);
  }
  if (!apiDockerfile.includes('CMD ["node", "dist/production/main.js"]')) {
    throw new Error("API production Dockerfile does not use dist/production/main.js.");
  }
  if (!bffDockerfile.includes('CMD ["node", "dist/main.js"]')) {
    throw new Error("BFF production Dockerfile does not use dist/main.js.");
  }
  if (!workerDockerfile.includes('CMD ["node", "dist/production/main.js"]')) {
    throw new Error("Worker production Dockerfile does not use dist/production/main.js.");
  }
  // Phase 8 removed the frontend's local auth fallback entirely -- assert
  // it stays removed (this used to instead require it be DEV-gated, back
  // when one still existed).
  const forbiddenLocalAuthFallbackTokens = [
    "LocalClientAccount",
    "loginWithLocalClient",
    "registerWithLocalClient",
    "readLocalClientSession",
    "writeLocalClientState",
    "canUseLocalAuthFallback",
    "isLocalClientRuntimeAvailable",
    "localClientCapabilities",
  ];
  for (const token of forbiddenLocalAuthFallbackTokens) {
    if (webClient.includes(token)) {
      throw new Error(`Web BFF client must not contain a local auth fallback (found "${token}").`);
    }
  }
  return { output: "runtime fallbacks: none" };
}

async function waitForComposeHealth() {
  const deadline = Date.now() + 240_000;
  let last = "";
  while (Date.now() < deadline) {
    const ps = run("docker", [...compose, "ps", "--all", "--format", "json"], {
      allowFailure: true,
      timeout: 30_000,
    });
    last = ps.output;
    const services = parseComposePs(ps.output);
    if (composeReady(services)) return { output: summarizeServices(services) };
    await delay(2_000);
  }
  const logs = run("docker", [...compose, "logs", "--tail", "120"], {
    allowFailure: true,
    timeout: 60_000,
  }).output;
  throw new Error(`Production-parity services did not become ready.\n${last}\n${tail(logs, 120)}`);
}

function parseComposePs(output) {
  const text = output.trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return text.split(/\r?\n/u).flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
  }
}

function composeReady(services) {
  const byName = new Map(services.map((service) => [service.Service, service]));
  for (const name of ["minio-init", "migrate-production"]) {
    const service = byName.get(name);
    if (!service || !["0", 0, undefined].includes(service.ExitCode)) return false;
    if (!["exited", "completed"].includes(String(service.State))) return false;
  }
  for (const name of [
    "postgres-production",
    "redis-production",
    "minio",
    "api-production",
    "bff-production",
    "worker-production",
    "web-production",
    "edge",
  ]) {
    const service = byName.get(name);
    if (!service || String(service.State) !== "running") return false;
    const health = String(service.Health || "");
    if (health && health !== "healthy") return false;
  }
  return true;
}

function summarizeServices(services) {
  return services
    .map((service) => `${service.Service}:${service.State}${service.Health ? `/${service.Health}` : ""}`)
    .join(" ");
}

async function directReadiness() {
  const api = await fetchJson("http://127.0.0.1:54100/readyz");
  const bff = await fetchJson("http://127.0.0.1:53001/readyz", {
    headers: { host },
  });
  if (api.response.status !== 200) throw new Error(`/readyz API returned ${api.response.status}`);
  if (bff.response.status !== 200) throw new Error(`/readyz BFF returned ${bff.response.status}`);
  return { output: JSON.stringify({ api: api.body, bff: bff.body }) };
}

async function edgeHealthReadiness() {
  const rootResponse = await edgeRequest("/", { headers: { accept: "text/html" } });
  if (rootResponse.status !== 200 || !rootResponse.body.includes("<!doctype html")) {
    throw new Error(`Edge web root returned ${rootResponse.status}`);
  }
  const health = await edgeRequest("/healthz");
  const ready = await edgeRequest("/readyz");
  if (health.status !== 200) throw new Error(`Edge /healthz returned ${health.status}`);
  if (ready.status !== 200) throw new Error(`Edge /readyz returned ${ready.status}: ${ready.body}`);
  const readiness = JSON.parse(ready.body);
  return { output: JSON.stringify(readiness) };
}

function redisTlsAuth() {
  return run("docker", [
    ...compose,
    "exec",
    "-T",
    "redis-production",
    "sh",
    "-c",
    'redis-cli --tls --cacert /run/papadata-redis-tls/ca.crt -h 127.0.0.1 -p 6379 --no-auth-warning -a "$REDIS_PASSWORD" ping',
  ]);
}

async function authReportFlow() {
  const jar = new CookieJar();
  const email = `parity-${Date.now()}-${randomUUID().slice(0, 8)}@example.test`;
  const password = "ParityPassword2026!";

  const registration = await edgeJson("/api/v1/auth/register/email", {
    body: {
      displayName: "Production Parity User",
      email,
      organizationName: "PapaData Production Parity",
      password,
      workspaceName: "Parity Workspace",
    },
    jar,
    method: "POST",
  });
  assertStatus(registration, [200, 201], "register");
  const session = unwrap(registration.json).session;
  const userId = requiredString(session?.userId, "session.userId");
  const tenantId = requiredString(session?.activeTenantId, "session.activeTenantId");
  const workspaceId = requiredString(session?.activeWorkspaceId, "session.activeWorkspaceId");

  const sessionRead = await edgeJson("/api/v1/auth/session", { jar, method: "GET" });
  assertStatus(sessionRead, [200], "session");

  const csrf = await issueCsrf(jar);
  const enroll = await edgeJson("/api/v1/security/mfa/enroll", {
    body: { accountName: email },
    headers: {
      "idempotency-key": randomUUID(),
      "x-papadata-csrf": csrf,
    },
    jar,
    method: "POST",
  });
  assertStatus(enroll, [200, 201], "mfa enroll");
  const mfaSecret = requiredString(unwrap(enroll.json).secret, "mfa secret");
  const mfaCode = totp(mfaSecret);
  const confirm = await edgeJson("/api/v1/auth/mfa/confirm", {
    body: { code: mfaCode },
    headers: { "x-papadata-csrf": csrf },
    jar,
    method: "POST",
  });
  assertStatus(confirm, [200], "mfa confirm");
  if (unwrap(confirm.json).verified !== true) throw new Error("MFA confirmation returned verified != true.");
  const mfaCodeIssuedAt = Date.now();

  await seedMetricSnapshot({ tenantId, workspaceId });

  const reportIdempotencyKey = `parity-${randomUUID()}`;
  const report = await edgeJson("/api/v1/reports", {
    body: {
      dateFrom: "2026-08-01T00:00:00.000Z",
      dateTo: "2026-08-03T00:00:00.000Z",
      filters: { source: "production-parity-e2e" },
      format: "json",
      idempotencyKey: reportIdempotencyKey,
      reportType: "production-parity-runtime",
    },
    headers: {
      "idempotency-key": reportIdempotencyKey,
      "x-papadata-csrf": csrf,
    },
    jar,
    method: "POST",
  });
  assertStatus(report, [200, 201], "report create");
  const reportId = requiredString(unwrap(report.json).id, "report id");

  const readyReport = await waitForReportReady(jar, reportId);
  const objectKey = requiredString(readyReport.object_key ?? readyReport.objectKey, "report object_key");

  // Faza 5 added TOTP anti-replay (a code accepted once, by confirm or
  // verify or step-up, cannot be accepted again within its own 30s step --
  // see totp.service.ts's matchStep/advanceTotpStep). The report
  // create+seed+ready-poll above usually takes long enough on its own to
  // land in a later step than mfaCode's, but that's not guaranteed, so
  // wait out any remainder deterministically rather than relying on it.
  await waitForFreshTotpStep(mfaCodeIssuedAt);
  const stepUp = await edgeJson("/api/v1/auth/step-up", {
    body: { code: totp(mfaSecret), operationScope: "reports.download" },
    headers: { "x-papadata-csrf": csrf },
    jar,
    method: "POST",
  });
  assertStatus(stepUp, [200], "step-up");

  const download = await edgeJson(`/api/v1/reports/${encodeURIComponent(reportId)}/download`, {
    jar,
    method: "GET",
  });
  assertStatus(download, [200], "report download");
  requiredString(unwrap(download.json).url, "download url");

  return {
    tenantId,
    userId,
    workspaceId,
    reportId,
    objectKey,
    output: JSON.stringify({ tenantId, userId, workspaceId, reportId, objectKey }),
  };
}

// Phase 8 (browser auth/session runtime) additions below: these exercise
// the real BFF/Redis/API stack directly (bypassing BffClient) to prove the
// backend contracts the frontend's single-flight refresh, logout, and
// session-revoke logic depend on actually hold under concurrency -- not
// just that the frontend calls the right endpoints.

async function registerParityUser(prefix) {
  const jar = new CookieJar();
  const email = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}@example.test`;
  const password = "ParityPassword2026!";
  const registration = await edgeJson("/api/v1/auth/register/email", {
    body: {
      displayName: "Production Parity User",
      email,
      organizationName: `PapaData Parity ${prefix}`,
      password,
      workspaceName: "Parity Workspace",
    },
    jar,
    method: "POST",
  });
  assertStatus(registration, [200, 201], `${prefix} register`);
  return { email, jar, password };
}

async function loginParityUser(email, password) {
  const jar = new CookieJar();
  const login = await edgeJson("/api/v1/auth/login", { body: { email, password }, jar, method: "POST" });
  assertStatus(login, [200, 201], "login");
  return jar;
}

// Runs a redis-cli command inside the redis-production container over its
// TLS listener -- the exact same mechanism proven by redisTlsAuth() above,
// reused here to read/rewrite one session record directly.
function redisCli(command) {
  const result = run("docker", [
    ...compose,
    "exec",
    "-T",
    "redis-production",
    "sh",
    "-c",
    `redis-cli --tls --cacert /run/papadata-redis-tls/ca.crt -h 127.0.0.1 -p 6379 --no-auth-warning -a "$REDIS_PASSWORD" ${command}`,
  ]);
  return result.output.trim();
}

// Forces sessionId's sliding `expiresAt` into the past while leaving
// `absoluteExpiresAt` untouched, directly in Redis -- BffSecurityService's
// requireSession() (used by every ordinary authenticated BFF request,
// including the proxied one the real client hits) rejects on `expiresAt`
// alone, while identity-session.service.ts's refresh() only checks
// `absoluteExpiresAt` (see the comment on RedisBffSessionStore.saveSession).
// This is the controlled way to reach "needs refresh" deterministically,
// instead of waiting out the real ~30 minute sliding TTL. SET ... KEEPTTL
// preserves the key's existing Redis expiry (the absolute ceiling) so this
// doesn't accidentally make the record immortal.
function expireSessionSlidingWindow(sessionId) {
  const key = `papadata:auth:session:${sessionId}`;
  const raw = redisCli(`GET ${shellQuote(key)}`);
  if (!raw) throw new Error(`Session record not found in Redis for sessionId=${sessionId}`);
  const session = JSON.parse(raw);
  session.expiresAt = new Date(Date.now() - 60_000).toISOString();
  const rewritten = JSON.stringify(session);
  redisCli(`SET ${shellQuote(key)} ${shellQuote(rewritten)} KEEPTTL`);

  const verify = JSON.parse(redisCli(`GET ${shellQuote(key)}`));
  if (verify.expiresAt !== session.expiresAt) {
    throw new Error("Failed to rewrite session expiresAt in Redis.");
  }
}

// Section 32 (Blocker 1): drives the *real* production browser-auth-runtime
// code -- BffClient/AuthRefreshCoordinator, imported unmodified from
// apps/web -- against this live stack, via a child process
// (client-runtime/parallel-refresh-client.ts, run with `pnpm exec tsx`).
// This harness only does the setup a real browser can't do to itself
// (forcing the session stale in one controlled step instead of waiting
// ~30 minutes) and the final assertions; the single-flight behavior under
// test lives entirely inside the real client code, not reimplemented here.
async function clientRuntimeParallelRefreshFlow() {
  const { email, jar, password } = await registerParityUser("client-race");

  const sessionRead = await edgeJson("/api/v1/auth/session", { jar, method: "GET" });
  assertStatus(sessionRead, [200], "client-race: pre-race session read");
  const sessionId = requiredString(unwrap(sessionRead.json).sessionId, "sessionId");

  // Fetched while the session is still fresh -- requireSession() (which
  // GET /api/csrf also goes through) would itself reject once expiresAt is
  // in the past, exactly like a real browser tab that cached its CSRF
  // token from earlier in the session rather than fetching a new one after
  // going stale.
  const csrfToken = await issueCsrf(jar);

  expireSessionSlidingWindow(sessionId);

  const scriptPath = resolve(root, "tests/backend-production-parity/client-runtime/parallel-refresh-client.ts");
  const child = run("pnpm", ["exec", "tsx", scriptPath], {
    env: {
      PARITY_CA_PATH: caPath,
      PARITY_COOKIE_HEADER: jar.header(),
      PARITY_CSRF_TOKEN: csrfToken,
      PARITY_HOST: host,
      PARITY_ORIGIN: origin,
    },
    timeout: 60_000,
  });

  const lastLine = child.output.trim().split(/\r?\n/u).filter(Boolean).pop();
  let result;
  try {
    result = JSON.parse(lastLine ?? "");
  } catch {
    throw new Error(`Real client runtime harness did not print a JSON result line.\n${tail(child.output, 40)}`);
  }

  if (result.clientParallelRequests !== 8) {
    throw new Error(`Expected 8 parallel client requests, got ${result.clientParallelRequests}`);
  }
  if (result.clientRefreshCalls !== 1) {
    throw new Error(`Expected exactly 1 POST /api/v1/auth/refresh from the real client runtime, got ${result.clientRefreshCalls}`);
  }
  if (result.clientRequestsSucceeded !== 8) {
    throw new Error(`Expected all 8 real client requests to succeed after the single refresh, got ${result.clientRequestsSucceeded}`);
  }
  if (result.sessionStillValid !== true) {
    throw new Error("Expected the session to still be valid after the real client's single-flight refresh (reuse detection must not have fired).");
  }

  // registerParityUser's password is only known to this scope; confirm the
  // account itself (not just this one session) is unaffected -- a second,
  // completely independent login must also still work.
  const independentJar = await loginParityUser(email, password);
  assertStatus(
    await edgeJson("/api/v1/auth/session", { jar: independentJar, method: "GET" }),
    [200],
    "client-race: independent login after the real-client single-flight test still works",
  );

  console.log(`CLIENT_PARALLEL_REQUESTS=${result.clientParallelRequests}`);
  console.log(`CLIENT_REFRESH_CALLS=${result.clientRefreshCalls}`);
  console.log(`CLIENT_REQUESTS_SUCCEEDED=${result.clientRequestsSucceeded}`);
  console.log(`SESSION_STILL_VALID=${result.sessionStillValid}`);

  return {
    output: JSON.stringify(result),
  };
}

// Section 32: fires several concurrent POST /auth/refresh calls presenting
// the *same* refresh token -- exactly what would reach the backend if a
// browser runtime's single-flight guarantee were ever bypassed. This does
// not assume which specific safe outcome the CAS rotation resolves to
// (a lone winner with benign 401 losers, vs. the documented "any reuse
// looks like theft" policy nuking the whole session family) -- it asserts
// the invariants that must hold either way: no 5xx, never more than one
// live winner, and -- the property that actually matters -- the account
// remains usable afterward via an ordinary fresh login.
async function concurrentRefreshRaceFlow() {
  const { email, jar, password } = await registerParityUser("race");

  const sessionRead = await edgeJson("/api/v1/auth/session", { jar, method: "GET" });
  assertStatus(sessionRead, [200], "race: pre-race session read");

  const csrf = await issueCsrf(jar);
  const raceCookieHeader = jar.header();

  const concurrency = 6;
  const raceResponses = await Promise.all(
    Array.from({ length: concurrency }, () => edgeJson("/api/v1/auth/refresh", {
      headers: { cookie: raceCookieHeader, "x-papadata-csrf": csrf },
      method: "POST",
    })),
  );
  const statuses = raceResponses.map((response) => response.status);
  // The BFF's refresh route is a bare NestJS @Post() with no @HttpCode()
  // override, so its default success status is 201 (Nest's POST default),
  // not 200 -- confirmed against identity-session.service.ts's refresh().
  const isSuccess = (status) => status === 200 || status === 201;

  if (statuses.some((status) => status >= 500)) {
    throw new Error(`Concurrent refresh using the same token must never 5xx, got: ${statuses.join(",")}`);
  }
  const succeeded = raceResponses.filter((response) => isSuccess(response.status));
  if (succeeded.length > 1) {
    throw new Error(`At most one concurrent refresh using the same token may succeed, got ${succeeded.length} (statuses: ${statuses.join(",")})`);
  }
  if (statuses.some((status) => !isSuccess(status) && status !== 401)) {
    throw new Error(`Expected every losing concurrent refresh to be 401, got: ${statuses.join(",")}`);
  }

  if (succeeded.length === 1) jar.store(succeeded[0].headers["set-cookie"]);
  const postRaceRead = await edgeJson("/api/v1/auth/session", { jar, method: "GET" });
  if (postRaceRead.status !== 200 && postRaceRead.status !== 401) {
    throw new Error(`Unexpected post-race session read status ${postRaceRead.status}: ${postRaceRead.body}`);
  }
  const outcome = postRaceRead.status === 200
    ? "single-winner-session-survives"
    : "reuse-detection-revoked-entire-family";

  const recoveryJar = await loginParityUser(email, password);
  const recoveryRead = await edgeJson("/api/v1/auth/session", { jar: recoveryJar, method: "GET" });
  assertStatus(recoveryRead, [200], "race: fresh login after race still works");

  return { output: JSON.stringify({ concurrency, outcome, statuses }) };
}

// Section 33 (first half): logout ends the session; refresh must not
// resurrect it.
async function logoutFlow() {
  const { jar } = await registerParityUser("logout");

  assertStatus(await edgeJson("/api/v1/auth/session", { jar, method: "GET" }), [200], "logout: pre-logout read");

  const csrf = await issueCsrf(jar);
  assertStatus(
    await edgeJson("/api/v1/auth/logout", { headers: { "x-papadata-csrf": csrf }, jar, method: "POST" }),
    [200],
    "logout",
  );

  const afterLogout = await edgeJson("/api/v1/auth/session", { jar, method: "GET" });
  if (afterLogout.status !== 401) throw new Error(`Expected 401 after logout, got ${afterLogout.status}: ${afterLogout.body}`);

  const refreshAfterLogout = await edgeJson("/api/v1/auth/refresh", {
    headers: { "x-papadata-csrf": "no-session-remains" },
    jar,
    method: "POST",
  });
  if (refreshAfterLogout.status !== 401) {
    throw new Error(`Expected refresh after logout to fail with 401 (not resurrect the session), got ${refreshAfterLogout.status}: ${refreshAfterLogout.body}`);
  }

  return { output: "logout: authenticated request -> 401 after logout; refresh does not restore access" };
}

// Section 33 (second half): two devices/sessions for one account;
// logout-all invalidates both.
async function logoutAllFlow() {
  const { email, jar: deviceA, password } = await registerParityUser("logout-all");
  const deviceB = await loginParityUser(email, password);

  assertStatus(await edgeJson("/api/v1/auth/session", { jar: deviceA, method: "GET" }), [200], "logout-all: device A precheck");
  assertStatus(await edgeJson("/api/v1/auth/session", { jar: deviceB, method: "GET" }), [200], "logout-all: device B precheck");

  const csrfA = await issueCsrf(deviceA);
  assertStatus(
    await edgeJson("/api/v1/auth/logout-all", { headers: { "x-papadata-csrf": csrfA }, jar: deviceA, method: "POST" }),
    [200],
    "logout-all",
  );

  const afterA = await edgeJson("/api/v1/auth/session", { jar: deviceA, method: "GET" });
  if (afterA.status !== 401) throw new Error(`Expected device A to be 401 after logout-all, got ${afterA.status}`);
  const afterB = await edgeJson("/api/v1/auth/session", { jar: deviceB, method: "GET" });
  if (afterB.status !== 401) throw new Error(`Expected device B to be 401 after logout-all, got ${afterB.status}`);

  return { output: "logout-all: both devices' sessions invalidated" };
}

// Section 34: device A revokes device B's session (A keeps working, B is
// cut off immediately and cannot refresh back in); revoking A's own
// current session then ends A's own access too.
async function sessionRevokeFlow() {
  const { email, jar: deviceA, password } = await registerParityUser("revoke");
  const deviceB = await loginParityUser(email, password);

  const sessionA = unwrap((await edgeJson("/api/v1/auth/session", { jar: deviceA, method: "GET" })).json);
  const sessionB = unwrap((await edgeJson("/api/v1/auth/session", { jar: deviceB, method: "GET" })).json);
  const sessionIdA = requiredString(sessionA?.sessionId, "device A sessionId");
  const sessionIdB = requiredString(sessionB?.sessionId, "device B sessionId");
  if (sessionIdA === sessionIdB) throw new Error("Expected device A and device B to have distinct sessionIds.");

  const csrfA = await issueCsrf(deviceA);
  assertStatus(
    await edgeJson(`/api/v1/auth/sessions/${encodeURIComponent(sessionIdB)}`, {
      headers: { "x-papadata-csrf": csrfA },
      jar: deviceA,
      method: "DELETE",
    }),
    [200],
    "revoke device B session",
  );

  assertStatus(await edgeJson("/api/v1/auth/session", { jar: deviceA, method: "GET" }), [200], "device A still works after revoking B");
  const afterRevokeB = await edgeJson("/api/v1/auth/session", { jar: deviceB, method: "GET" });
  if (afterRevokeB.status !== 401) throw new Error(`Expected device B to be 401 after being revoked, got ${afterRevokeB.status}`);

  const refreshB = await edgeJson("/api/v1/auth/refresh", {
    headers: { "x-papadata-csrf": "revoked-session" },
    jar: deviceB,
    method: "POST",
  });
  if (refreshB.status !== 401) {
    throw new Error(`Expected device B refresh to fail with 401 after revoke (not restore access), got ${refreshB.status}`);
  }

  const csrfA2 = await issueCsrf(deviceA);
  assertStatus(
    await edgeJson(`/api/v1/auth/sessions/${encodeURIComponent(sessionIdA)}`, {
      headers: { "x-papadata-csrf": csrfA2 },
      jar: deviceA,
      method: "DELETE",
    }),
    [200],
    "revoke own current session",
  );
  const afterSelfRevoke = await edgeJson("/api/v1/auth/session", { jar: deviceA, method: "GET" });
  if (afterSelfRevoke.status !== 401) {
    throw new Error(`Expected device A to be 401 after revoking its own current session, got ${afterSelfRevoke.status}`);
  }

  return { output: "session-revoke: A unaffected by revoking B, B loses access immediately and cannot refresh back in; revoking A's own current session ends A's own access" };
}

async function rbacRoleMatrixRuntime(runtime) {
  assertUuid(runtime.tenantId, "tenantId");
  assertUuid(runtime.userId, "userId");
  assertUuid(runtime.workspaceId, "workspaceId");

  const fixture = seedRbacFixture(runtime);
  const checks = [];

  await expectApiStatus("tenant-owner.same-tenant.allow", await apiAs({
    tenantId: runtime.tenantId,
    userId: runtime.userId,
    workspaceId: runtime.workspaceId,
  }, "/v1/metrics", { method: "GET" }), [200], checks);
  await expectApiStatus("tenant-owner.other-tenant.deny", await apiAs({
    tenantId: fixture.victimTenantId,
    userId: runtime.userId,
    workspaceId: fixture.victimWorkspaceId,
  }, "/v1/metrics", { method: "GET" }), [403], checks);

  await expectApiStatus("workspace-admin.own-workspace.allow", await apiAs(
    fixture.users.workspaceAdmin,
    "/v1/workspaces",
    { method: "GET" },
  ), [200], checks);
  await expectApiStatus("workspace-admin.other-workspace.deny", await apiAs({
    ...fixture.users.workspaceAdmin,
    workspaceId: fixture.workspaceBId,
  }, "/v1/workspaces", { method: "GET" }), [403], checks);

  await expectApiStatus("analyst.analytics-read.allow", await apiAs(
    fixture.users.analyst,
    "/v1/metrics",
    { method: "GET" },
  ), [200], checks);
  await expectApiStatus("analyst.integration-credentials.deny", await apiAs(
    fixture.users.analyst,
    "/v1/integrations/google-ads/test",
    { body: {}, method: "POST" },
  ), [403], checks);

  await expectApiStatus("marketing.integration-write.allow", await apiAs(
    fixture.users.marketingOperator,
    "/v1/data-quality/issues",
    { body: mutationBody("marketing-integration-write"), method: "POST" },
  ), [200, 201], checks);
  await expectApiStatus("marketing.tenant-admin.deny", await apiAs(
    fixture.users.marketingOperator,
    "/v1/security/invitations/token",
    { body: { invitationId: randomUUID(), tokenVersion: 1 }, method: "POST" },
  ), [403], checks);

  await expectApiStatus("viewer.read.allow", await apiAs(
    fixture.users.viewer,
    "/v1/metrics",
    { method: "GET" },
  ), [200], checks);
  await expectApiStatus("viewer.write.deny", await apiAs(
    fixture.users.viewer,
    "/v1/data-quality/issues",
    { body: mutationBody("viewer-write-deny"), method: "POST" },
  ), [403], checks);

  await expectApiStatus("billing.billing.allow", await apiAs(
    fixture.users.billingAdmin,
    "/v1/billing/subscription",
    { method: "GET" },
  ), [200], checks);
  await expectApiStatus("billing.analytics-integration-write.deny", await apiAs(
    fixture.users.billingAdmin,
    "/v1/data-quality/issues",
    { body: mutationBody("billing-write-deny"), method: "POST" },
  ), [403], checks);

  await expectApiStatus("auditor.audit.allow", await apiAs(
    fixture.users.auditor,
    "/v1/settings/audyt",
    { method: "GET" },
  ), [200], checks);
  await expectApiStatus("auditor.business-write.deny", await apiAs(
    fixture.users.auditor,
    "/v1/data-quality/issues",
    { body: mutationBody("auditor-write-deny"), method: "POST" },
  ), [403], checks);

  await expectApiStatus("support-jit.active.allow", await apiAs(
    fixture.users.supportActive,
    "/v1/settings/audyt",
    { method: "GET" },
  ), [200], checks);
  await expectApiStatus("support-jit.expired.deny", await apiAs(
    fixture.users.supportExpired,
    "/v1/settings/audyt",
    { method: "GET" },
  ), [403], checks);

  await expectApiStatus("cross-workspace.body.deny", await apiAs(
    fixture.users.marketingOperator,
    "/v1/data-quality/issues",
    {
      body: {
        ...mutationBody("cross-workspace-deny"),
        workspaceId: fixture.workspaceBId,
      },
      method: "POST",
    },
  ), [403], checks);
  await expectApiStatus("cross-tenant.body.deny", await apiAs(
    fixture.users.marketingOperator,
    "/v1/data-quality/issues",
    {
      body: {
        ...mutationBody("cross-tenant-deny"),
        tenantId: fixture.victimTenantId,
      },
      method: "POST",
    },
  ), [403], checks);

  await expectApiStatus("live-change.viewer-before.deny", await apiAs(
    fixture.users.liveChange,
    "/v1/data-quality/issues",
    { body: mutationBody("live-change-before"), method: "POST" },
  ), [403], checks);
  updateMembershipRole({
    dataScope: "workspace",
    role: "Workspace Admin",
    tenantId: runtime.tenantId,
    userId: fixture.users.liveChange.userId,
    workspaceId: runtime.workspaceId,
  });
  await expectApiStatus("live-change.workspace-admin-after.allow", await apiAs(
    fixture.users.liveChange,
    "/v1/data-quality/issues",
    { body: mutationBody("live-change-after"), method: "POST" },
  ), [200, 201], checks);

  return { output: checks.join(" ") };
}

async function issueCsrf(jar) {
  const response = await edgeJson("/api/csrf", { jar, method: "GET" });
  assertStatus(response, [200], "csrf");
  return requiredString(unwrap(response.json).csrfToken, "csrfToken");
}

async function seedMetricSnapshot({ tenantId, workspaceId }) {
  assertUuid(tenantId, "tenantId");
  assertUuid(workspaceId, "workspaceId");
  const sql = `
insert into app.metric_definitions (
  metric_definition_id,
  metric_code,
  definition_version,
  business_definition,
  formula,
  required_canonical_facts,
  included_statuses,
  excluded_statuses,
  date_policy,
  currency_policy,
  tax_policy,
  refund_policy,
  missing_data_policy,
  readiness_rule,
  test_vectors,
  lifecycle_status
)
values (
  gen_random_uuid(),
  'orders',
  'production-parity-e2e-v1',
  'Production-parity order count fixture.',
  'count(orders)',
  array['orders']::text[],
  array['paid']::text[],
  array[]::text[],
  'ordered_at',
  'not_applicable',
  'gross',
  'exclude_refunded',
  'fail_when_empty',
  'ready when at least one order exists',
  '[]'::jsonb,
  'active'
)
on conflict (metric_code, definition_version) do nothing;

with definition as (
  select metric_code, definition_version
  from app.metric_definitions
  where metric_code = 'orders'
    and definition_version = 'production-parity-e2e-v1'
  limit 1
)
insert into app.metric_snapshots (
  metric_snapshot_id,
  tenant_id,
  workspace_id,
  metric_code,
  definition_version,
  period_start,
  period_end,
  currency,
  value,
  value_kind,
  readiness,
  reason_codes,
  limitations,
  evidence,
  input_hash,
  generated_at
)
select
  gen_random_uuid(),
  '${tenantId}'::uuid,
  '${workspaceId}'::uuid,
  metric_code,
  definition_version,
  '2026-08-01T00:00:00.000Z'::timestamptz,
  '2026-08-02T00:00:00.000Z'::timestamptz,
  null,
  '42',
  'count',
  'ready',
  array[]::text[],
  array['production-parity-e2e']::text[],
  '[{"source":"production-parity-e2e"}]'::jsonb,
  'production-parity-e2e-${randomUUID()}',
  now()
from definition;
`;
  const result = run("docker", [
    ...compose,
    "exec",
    "-T",
    "postgres-production",
    "sh",
    "-c",
    `PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U papadata_migrator -d papadata -v ON_ERROR_STOP=1 -c ${shellQuote(sql)}`,
  ], { timeout: 60_000 });
  if (!/INSERT 0 1/u.test(result.output)) throw new Error(`Metric fixture was not inserted.\n${result.output}`);
}

function seedRbacFixture(runtime) {
  const workspaceBId = randomUUID();
  const victimUserId = randomUUID();
  const victimTenantId = randomUUID();
  const victimWorkspaceId = randomUUID();
  const users = {
    analyst: rbacUser(runtime, "Analyst"),
    auditor: rbacUser(runtime, "Auditor/Security"),
    billingAdmin: rbacUser(runtime, "Billing Admin"),
    liveChange: rbacUser(runtime, "Viewer"),
    marketingOperator: rbacUser(runtime, "Marketing Operator"),
    supportActive: rbacUser(runtime, "Internal Support/Operations"),
    supportExpired: rbacUser(runtime, "Internal Support/Operations"),
    viewer: rbacUser(runtime, "Viewer"),
    workspaceAdmin: rbacUser(runtime, "Workspace Admin"),
  };
  const allUserIds = [
    victimUserId,
    ...Object.values(users).map((user) => user.userId),
  ];

  const userValues = allUserIds.map((userId, index) =>
    `('${userId}'::uuid, 'rbac-${index}-${userId}@example.test', 'RBAC ${index}', 'active', true)`,
  ).join(",\n");

  const membershipValues = [
    membershipValue(runtime.tenantId, runtime.workspaceId, users.workspaceAdmin.userId, "Workspace Admin", "active", "workspace", null),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.analyst.userId, "Analyst", "active", "workspace", null),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.marketingOperator.userId, "Marketing Operator", "active", "workspace", null),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.viewer.userId, "Viewer", "active", "workspace", null),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.billingAdmin.userId, "Billing Admin", "active", "billing", null),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.auditor.userId, "Auditor/Security", "active", "audit", null),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.supportActive.userId, "Internal Support/Operations", "active", "support_jit", "2099-01-01T00:00:00.000Z"),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.supportExpired.userId, "Internal Support/Operations", "active", "support_jit", "2020-01-01T00:00:00.000Z"),
    membershipValue(runtime.tenantId, runtime.workspaceId, users.liveChange.userId, "Viewer", "active", "workspace", null),
  ].join(",\n");

  const sql = `
insert into app.users (user_id, email, full_name, status, email_verified)
values ${userValues}
on conflict (user_id) do nothing;

insert into app.tenants (tenant_id, created_by_user_id, name, status)
values ('${victimTenantId}'::uuid, '${victimUserId}'::uuid, 'RBAC Victim Tenant', 'active')
on conflict (tenant_id) do nothing;

insert into app.workspaces (workspace_id, tenant_id, created_by_user_id, name, status)
values
  ('${workspaceBId}'::uuid, '${runtime.tenantId}'::uuid, '${runtime.userId}'::uuid, 'RBAC Workspace B', 'active'),
  ('${victimWorkspaceId}'::uuid, '${victimTenantId}'::uuid, '${victimUserId}'::uuid, 'RBAC Victim Workspace', 'active')
on conflict (tenant_id, workspace_id) do nothing;

insert into app.memberships (
  membership_id, tenant_id, workspace_id, user_id, role, status, data_scope, jit_expires_at
)
values ${membershipValues}
on conflict (tenant_id, workspace_id, user_id) do update
set role = excluded.role,
    status = excluded.status,
    data_scope = excluded.data_scope,
    jit_expires_at = excluded.jit_expires_at,
    updated_at = now();
`;

  run("docker", [
    ...compose,
    "exec",
    "-T",
    "postgres-production",
    "sh",
    "-c",
    `PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U papadata_migrator -d papadata -v ON_ERROR_STOP=1 -c ${shellQuote(sql)}`,
  ], { timeout: 60_000 });

  return {
    users,
    victimTenantId,
    victimWorkspaceId,
    workspaceBId,
  };
}

function rbacUser(runtime, role) {
  return {
    role,
    tenantId: runtime.tenantId,
    userId: randomUUID(),
    workspaceId: runtime.workspaceId,
  };
}

function membershipValue(
  tenantId,
  workspaceId,
  userId,
  role,
  status,
  dataScope,
  jitExpiresAt,
) {
  return `('${randomUUID()}'::uuid, '${tenantId}'::uuid, '${workspaceId}'::uuid, '${userId}'::uuid, '${role}', '${status}', '${dataScope}', ${jitExpiresAt ? `'${jitExpiresAt}'::timestamptz` : "null"})`;
}

function updateMembershipRole(input) {
  const sql = `
update app.memberships
   set role = '${input.role}',
       data_scope = '${input.dataScope}',
       updated_at = now()
 where tenant_id = '${input.tenantId}'::uuid
   and workspace_id = '${input.workspaceId}'::uuid
   and user_id = '${input.userId}'::uuid;
`;
  const result = run("docker", [
    ...compose,
    "exec",
    "-T",
    "postgres-production",
    "sh",
    "-c",
    `PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U papadata_migrator -d papadata -v ON_ERROR_STOP=1 -c ${shellQuote(sql)}`,
  ], { timeout: 60_000 });
  if (!/UPDATE 1/u.test(result.output)) {
    throw new Error(`Membership role update did not affect one row.\n${result.output}`);
  }
}

async function apiAs(principal, path, options) {
  const sessionId = randomUUID();
  const nowSeconds = Math.floor(Date.now() / 1_000);
  const expiresAt = new Date((nowSeconds + 600) * 1_000).toISOString();
  await saveApiSession({
    activeTenantId: principal.tenantId,
    activeWorkspaceId: principal.workspaceId,
    expiresAt,
    revokedAt: null,
    sessionId,
    userId: principal.userId,
  });

  return fetchJson(`http://127.0.0.1:54100${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(!["GET", "HEAD"].includes(options.method) ? { "idempotency-key": randomUUID() } : {}),
      "x-correlation-id": randomUUID(),
      "x-papadata-internal-principal": signPrincipalToken({
        aud: "papadata-api",
        auth_level: options.authLevel ?? "step_up",
        caps: [],
        exp: nowSeconds + 300,
        iat: nowSeconds,
        iss: "papadata-bff",
        memberships: [{
          capabilities: [],
          roles: [principal.role ?? "Workspace Admin"],
          tenantId: principal.tenantId,
          workspaceId: principal.workspaceId,
        }],
        sid: sessionId,
        step_up_expires_at: new Date((nowSeconds + 300) * 1_000).toISOString(),
        sub: principal.userId,
        tid: principal.tenantId,
        wid: principal.workspaceId,
      }),
    },
    method: options.method,
  });
}

async function saveApiSession(session) {
  run("docker", [
    ...compose,
    "exec",
    "-T",
    "-e",
    `SESSION_KEY=papadata:auth:session:${session.sessionId}`,
    "-e",
    `SESSION_VALUE=${JSON.stringify(session)}`,
    "redis-production",
    "sh",
    "-c",
    'redis-cli --tls --cacert /run/papadata-redis-tls/ca.crt -a "$REDIS_PASSWORD" set "$SESSION_KEY" "$SESSION_VALUE" EX 600 >/dev/null',
  ], { timeout: 30_000 });
}

function signPrincipalToken(claims) {
  const header = base64urlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64urlJson(claims);
  const signature = createHmac(
    "sha256",
    productionParityEnv("PAPADATA_API_AUTH_ACTIVE_SECRET"),
  ).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function productionParityEnv(name) {
  const entries = productionParityEnv.entries ??= new Map(
    readFileSync(resolve(root, ".env.production-parity"), "utf8")
      .split(/\r?\n/u)
      .flatMap((line) => {
        const separator = line.indexOf("=");
        return separator > 0
          ? [[line.slice(0, separator), line.slice(separator + 1)]]
          : [];
      }),
  );
  const value = entries.get(name);
  if (!value) throw new Error(`${name} is missing from .env.production-parity.`);
  return value;
}

async function expectApiStatus(label, response, allowed, checks) {
  if (!allowed.includes(response.response.status)) {
    throw new Error(`${label} returned ${response.response.status}: ${JSON.stringify(response.body)}`);
  }
  checks.push(`${label}:${response.response.status}`);
}

function mutationBody(label) {
  return {
    data: { source: "rbac-role-matrix-runtime" },
    externalKey: `${label}-${randomUUID()}`,
  };
}

async function waitForReportReady(jar, reportId) {
  const deadline = Date.now() + 90_000;
  let last = null;
  while (Date.now() < deadline) {
    const response = await edgeJson(`/api/v1/reports/${encodeURIComponent(reportId)}`, {
      jar,
      method: "GET",
    });
    assertStatus(response, [200], "report read");
    const report = unwrap(response.json);
    last = report;
    if (report.status === "ready") return report;
    if (report.status === "failed") throw new Error(`Report failed: ${JSON.stringify(report)}`);
    await delay(2_000);
  }
  throw new Error(`Report did not become ready. Last state: ${JSON.stringify(last)}`);
}

function postgresRlsRuntime(runtime) {
  assertUuid(runtime.tenantId, "tenantId");
  assertUuid(runtime.workspaceId, "workspaceId");
  assertUuid(runtime.reportId, "reportId");
  const sql = `
select set_config('app.tenant_id', '${runtime.tenantId}', false);
select set_config('app.workspace_id', '${runtime.workspaceId}', false);
select count(*) as visible_same_tenant from app.report_requests where id = '${runtime.reportId}'::uuid;
select set_config('app.tenant_id', '00000000-0000-4000-8000-0000000000ff', false);
select set_config('app.workspace_id', '${runtime.workspaceId}', false);
select count(*) as visible_other_tenant from app.report_requests where id = '${runtime.reportId}'::uuid;
`;
  const result = run("docker", [
    ...compose,
    "exec",
    "-T",
    "postgres-production",
    "sh",
    "-c",
    `PGPASSWORD="$PAPADATA_APP_PASSWORD" psql -h 127.0.0.1 -U papadata_app -d papadata -v ON_ERROR_STOP=1 -c ${shellQuote(sql)}`,
  ], { timeout: 60_000 });
  if (!/visible_same_tenant[\s\S]*\n\s*1\s*\n/u.test(result.output)) {
    throw new Error(`RLS same-tenant visibility check failed.\n${result.output}`);
  }
  if (!/visible_other_tenant[\s\S]*\n\s*0\s*\n/u.test(result.output)) {
    throw new Error(`RLS cross-tenant isolation check failed.\n${result.output}`);
  }
  return result;
}

function minioObjectRuntime(objectKey) {
  if (!/^[A-Za-z0-9._:/-]+$/u.test(objectKey)) throw new Error(`Unsafe object key: ${objectKey}`);
  return run("docker", [
    ...compose,
    "run",
    "--rm",
    "--no-deps",
    "-e",
    `OBJECT_KEY=${objectKey}`,
    "minio-init",
    "sh",
    "-c",
    'mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null && mc stat "local/$PAPADATA_STORAGE_BUCKET/$OBJECT_KEY"',
  ], { timeout: 60_000 });
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  return {
    body: text ? JSON.parse(text) : null,
    response,
  };
}

async function edgeJson(path, options) {
  const response = await edgeRequest(path, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.method && !["GET", "HEAD"].includes(options.method) ? { origin } : {}),
      ...(options.jar?.header() ? { cookie: options.jar.header() } : {}),
      ...(options.headers ?? {}),
    },
    method: options.method,
  });
  options.jar?.store(response.headers["set-cookie"]);
  return {
    ...response,
    json: response.body ? JSON.parse(response.body) : null,
  };
}

function edgeRequest(path, options = {}) {
  if (!existsSync(caPath)) throw new Error(`${caPath} is missing. Run pnpm prepare:production-parity.`);
  const ca = readFileSync(caPath);
  return new Promise((resolveRequest, reject) => {
    const request = https.request({
      ca,
      headers: {
        host,
        "x-correlation-id": randomUUID(),
        ...(options.headers ?? {}),
      },
      hostname: host,
      lookup: (_hostname, options, callback) => {
        if (typeof options === "function") {
          options(null, "127.0.0.1", 4);
          return;
        }
        if (options.all) {
          callback(null, [{ address: "127.0.0.1", family: 4 }]);
          return;
        }
        callback(null, "127.0.0.1", 4);
      },
      method: options.method ?? "GET",
      path,
      port: 443,
      servername: host,
      timeout: 15_000,
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        resolveRequest({
          body: Buffer.concat(chunks).toString("utf8"),
          headers: response.headers,
          status: response.statusCode ?? 0,
        });
      });
    });
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error(`HTTPS request timed out: ${path}`)));
    if (options.body) request.write(options.body);
    request.end();
  });
}

function unwrap(payload) {
  if (payload && typeof payload === "object" && "data" in payload && payload.data && typeof payload.data === "object") {
    return payload.data;
  }
  return payload;
}

function assertStatus(response, allowed, label) {
  if (!allowed.includes(response.status)) {
    throw new Error(`${label} returned ${response.status}: ${response.body}`);
  }
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing ${label}.`);
  }
  return value;
}

function assertUuid(value, label) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value)) {
    throw new Error(`${label} must be a UUID.`);
  }
}

// Blocks until the current 30s TOTP step is strictly newer than the one
// `previousCodeIssuedAtMs` fell in -- a no-op if enough real time has
// already passed, otherwise waits out only the remainder. See the anti-
// replay comment at this function's call site.
async function waitForFreshTotpStep(previousCodeIssuedAtMs) {
  const previousStep = Math.floor(previousCodeIssuedAtMs / 30_000);
  const currentStep = Math.floor(Date.now() / 30_000);
  if (currentStep > previousStep) return;
  const waitMs = (previousStep + 1) * 30_000 - Date.now() + 250;
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, waitMs)));
}

function totp(secret) {
  const key = base32Decode(secret);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = ((digest[offset] & 127) << 24)
    | ((digest[offset + 1] & 255) << 16)
    | ((digest[offset + 2] & 255) << 8)
    | (digest[offset + 3] & 255);
  return String(binary % 1_000_000).padStart(6, "0");
}

function base32Decode(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of value.replace(/=+$/u, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("Invalid base32 secret.");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function tail(value, lines = 30) {
  return String(value ?? "").split(/\r?\n/u).slice(-lines).join("\n").trim();
}

function delay(ms) {
  return new Promise((resolveDelay) => {
    setTimeout(resolveDelay, ms);
  });
}

async function writeEvidence(status, error = null) {
  await mkdir(resolve(root, "artifacts/backend-evidence"), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    startedAt,
    status,
    flow: "Edge -> Web -> BFF -> API -> PostgreSQL/Redis -> Worker -> Object Storage",
    steps: results,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  }, null, 2)}\n`);
}

function relativeEvidencePath() {
  return "artifacts/backend-evidence/production-parity-e2e.json";
}
