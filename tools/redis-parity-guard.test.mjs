// P0-2D: Redis is CLASS 2 (infrastructure differs -- local Redis container
// vs Memorystore -- application semantics identical): every consumer uses
// the same client library, the same rediss://+CA-verified TLS negotiation,
// and the same AUTH-via-URL-password scheme in every environment, gated
// only by config (REDIS_URL's protocol / REDIS_CA_BASE64's presence), never
// by a NODE_ENV/runtimeEnvironment branch that could silently run a
// simpler/different code path locally.
//
// This is an executable guard, not just an audit note: it fails the build
// if a future change introduces exactly the kind of environment-gated
// Redis code path that would turn this from a verified Class 2 exception
// into an undetected Class 1 drift (the same class of bug P0-2A found and
// fixed for the BFF's Cloud Run identity hop).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

const REDIS_CONSUMER_FILES = [
  "apps/api/src/production/queue/queue.service.ts",
  "apps/api/src/production/queue/platform-queue.service.ts",
  "apps/api/src/production/readiness.controller.ts",
  "apps/api/src/production/auth/principal.service.ts",
  "apps/api/src/production/access-lifecycle/gus-bir-cache.service.ts",
  "apps/bff/src/session-store.ts",
  "apps/bff/src/rate-limit.service.ts",
  "apps/worker/src/production/sync-dispatch-scheduler.service.ts",
  "apps/worker/src/production/platform-worker.service.ts",
  "apps/worker/src/production/worker.service.ts",
  "apps/worker/src/production/scheduler.service.ts",
  "apps/worker/src/production/provider-rate-limiter.ts",
];

// Matches an environment-conditional branch (however it's spelled) rather
// than the TLS-protocol-conditional branches these files legitimately have
// (e.g. `new URL(url).protocol === "rediss:"`, which is config-driven, not
// environment-driven, and identical in every environment because
// REDIS_URL is always rediss:// wherever it matters -- see P0-1's
// production-parity-env.contract.json).
const ENVIRONMENT_CONDITIONAL_PATTERN = /runtimeEnvironment\s*===|NODE_ENV\s*===\s*["'](?:production|production-parity|development|local)["']|environment\s*===\s*["'](?:production|local|development)["']/u;

for (const file of REDIS_CONSUMER_FILES) {
  test(`Redis parity guard: ${file} has no environment-conditional branch`, async () => {
    const text = await readFile(resolve(repoRoot, file), "utf8");
    const match = text.match(ENVIRONMENT_CONDITIONAL_PATTERN);
    assert.equal(
      match,
      null,
      `${file} contains an environment-conditional branch (${match?.[0]}). If this is a genuine, ` +
      "necessary divergence between production-parity and production, it must be classified the way " +
      "P0-2A classified the BFF Cloud Run identity hop: an explicit capability/config flag (not a bare " +
      "NODE_ENV check), a local emulator/adapter faithfully replicating the same request contract, and " +
      "registration in config/production-parity-env.contract.json's environmentBehaviorExceptions.",
    );
  });
}
