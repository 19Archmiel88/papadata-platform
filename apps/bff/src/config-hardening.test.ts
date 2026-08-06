import assert from "node:assert/strict";
import { test } from "node:test";
import { BffConfigurationError, readBffConfig } from "./config.js";

const validProductionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  API_ORIGIN: "https://api.internal.example",
  BFF_ALLOWED_ORIGINS: "https://app.example.com",
  BFF_PUBLIC_HOSTS: "app.example.com",
  BFF_COOKIE_SECRET: "cookie-active-secret-material-0000000001",
  BFF_COOKIE_PREVIOUS_SECRET: "cookie-previous-secret-material-0000002",
  BFF_CSRF_SECRET: "csrf-secret-material-000000000000000001",
  BFF_INTERNAL_AUTH_ACTIVE_SECRET: "internal-active-secret-material-0000001",
  BFF_INTERNAL_AUTH_PREVIOUS_SECRET: "internal-previous-secret-material-00002",
  BFF_INTERNAL_AUTH_ISSUER: "papadata-bff",
  BFF_INTERNAL_AUTH_AUDIENCE: "papadata-api",
  BFF_SESSION_STORE: "redis-auth-state",
  REDIS_URL: "rediss://default:strong-password@redis.internal:6379",
  REDIS_CA_BASE64: Buffer.from("test-ca-certificate", "utf8").toString("base64"),
};

test("production BFF rejects plaintext Redis", () => {
  assert.throws(
    () => readBffConfig({ ...validProductionEnv, REDIS_URL: "redis://redis.internal:6379" }),
    BffConfigurationError,
  );
});

test("production BFF rejects Redis TLS without a CA", () => {
  const env = { ...validProductionEnv };
  delete env.REDIS_CA_BASE64;
  assert.throws(() => readBffConfig(env), BffConfigurationError);
});

test("BFF rejects wildcard origins and reused secret material", () => {
  assert.throws(
    () => readBffConfig({ ...validProductionEnv, BFF_ALLOWED_ORIGINS: "*" }),
    BffConfigurationError,
  );
  assert.throws(
    () => readBffConfig({
      ...validProductionEnv,
      BFF_CSRF_SECRET: validProductionEnv.BFF_COOKIE_SECRET,
    }),
    BffConfigurationError,
  );
});

test("production BFF enables secure cookies and Cloud Run identity", () => {
  const config = readBffConfig(validProductionEnv);
  assert.equal(config.cookieSecure, true);
  assert.equal(config.upstreamIdentityAudience, "https://api.internal.example");
});

test("production parity keeps production security without cloud metadata", () => {
  const config = readBffConfig({ ...validProductionEnv, NODE_ENV: "production-parity" });
  assert.equal(config.cookieSecure, true);
  assert.equal(config.upstreamIdentityAudience, null);
  assert.match(config.sessionRedisUrl, /^rediss:/u);
});
