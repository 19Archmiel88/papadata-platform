import assert from "node:assert/strict";
import { test } from "node:test";
import { WorkerConfigurationError, readWorkerConfig } from "./config.js";

const validProductionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://papadata_app:app-password@db.internal:5432/papadata",
  SCHEDULER_DATABASE_URL: "postgresql://papadata_platform:platform-password@db.internal:5432/papadata",
  REDIS_URL: "rediss://default:strong-password@redis.internal:6379",
  REDIS_CA_BASE64: Buffer.from("test-ca-certificate", "utf8").toString("base64"),
  PAPADATA_STORAGE_DRIVER: "gcs",
  PAPADATA_STORAGE_BUCKET: "papadata-artifacts",
  GOOGLE_CLOUD_PROJECT: "papadata-production",
};

test("production worker requires separate application and platform roles", () => {
  assert.throws(
    () => readWorkerConfig({
      ...validProductionEnv,
      SCHEDULER_DATABASE_URL: validProductionEnv.DATABASE_URL,
    }),
    WorkerConfigurationError,
  );
  assert.throws(
    () => readWorkerConfig({
      ...validProductionEnv,
      SCHEDULER_DATABASE_URL: "postgresql://papadata_app:other-password@db.internal:5432/papadata",
    }),
    WorkerConfigurationError,
  );
});

test("production worker rejects plaintext Redis and missing CA", () => {
  assert.throws(
    () => readWorkerConfig({ ...validProductionEnv, REDIS_URL: "redis://redis.internal:6379" }),
    WorkerConfigurationError,
  );
  const env = { ...validProductionEnv };
  delete env.REDIS_CA_BASE64;
  assert.throws(() => readWorkerConfig(env), WorkerConfigurationError);
});

test("production worker accepts a distinct platform credential", () => {
  const config = readWorkerConfig(validProductionEnv);
  assert.equal(config.runtimeEnvironment, "production");
  assert.notEqual(config.databaseUrl, config.schedulerDatabaseUrl);
});

test("production worker rejects an unknown storage driver and placeholder MinIO credentials", () => {
  assert.throws(
    () => readWorkerConfig({ ...validProductionEnv, PAPADATA_STORAGE_DRIVER: "filesystem" }),
    WorkerConfigurationError,
  );
  assert.throws(
    () => readWorkerConfig({
      ...validProductionEnv,
      PAPADATA_STORAGE_DRIVER: "minio",
      PAPADATA_STORAGE_ENDPOINT: "https://minio.internal",
      PAPADATA_STORAGE_ACCESS_KEY: "replace-with-access-key",
      PAPADATA_STORAGE_SECRET_KEY: "replace-with-secret-key",
      GOOGLE_CLOUD_PROJECT: undefined,
    }),
    WorkerConfigurationError,
  );
});
