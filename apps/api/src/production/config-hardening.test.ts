import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ProductionConfigurationError,
  readProductionConfig,
} from "./config.js";

const validProductionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://papadata_app:strong-password@db.internal:5432/papadata",
  REDIS_URL: "rediss://default:strong-password@redis.internal:6379",
  REDIS_CA_BASE64: Buffer.from("test-ca-certificate", "utf8").toString("base64"),
  PAPADATA_STORAGE_DRIVER: "gcs",
  PAPADATA_STORAGE_BUCKET: "papadata-artifacts",
  GOOGLE_CLOUD_PROJECT: "papadata-production",
  PAPADATA_API_AUTH_ACTIVE_SECRET: "api-active-secret-material-000000000001",
  PAPADATA_API_AUTH_PREVIOUS_SECRET: "api-previous-secret-material-00000002",
  PAPADATA_API_AUTH_ISSUER: "papadata-bff",
  PAPADATA_API_AUTH_AUDIENCE: "papadata-api",
  PAPADATA_INFRASTRUCTURE_AUTH_TOKEN: "infrastructure-token-material-0000001",
  MFA_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
};

test("production API rejects plaintext Redis", () => {
  assert.throws(
    () => readProductionConfig({ ...validProductionEnv, REDIS_URL: "redis://redis.internal:6379" }),
    ProductionConfigurationError,
  );
});

test("production API rejects Redis TLS without a CA", () => {
  const env = { ...validProductionEnv };
  delete env.REDIS_CA_BASE64;
  assert.throws(() => readProductionConfig(env), ProductionConfigurationError);
});

test("production API rejects placeholder secrets", () => {
  assert.throws(
    () => readProductionConfig({
      ...validProductionEnv,
      PAPADATA_INFRASTRUCTURE_AUTH_TOKEN: "change-me-change-me-change-me-change-me",
    }),
    ProductionConfigurationError,
  );
});

test("production API accepts a complete hardened configuration", () => {
  const config = readProductionConfig(validProductionEnv);
  assert.equal(config.runtimeEnvironment, "production");
  assert.equal(config.storageDriver, "gcs");
  assert.match(config.redisUrl, /^rediss:/u);
});
