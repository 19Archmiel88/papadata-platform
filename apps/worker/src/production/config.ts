export type WorkerRuntimeEnvironment = "development" | "production" | "test";

export type WorkerConfig = {
  readonly runtimeEnvironment: WorkerRuntimeEnvironment;
  readonly databaseUrl: string;
  readonly schedulerDatabaseUrl: string;
  readonly redisUrl: string;
  readonly redisCaBase64: string | null;
  readonly workerConcurrency: number;
  readonly platformWorkerConcurrency: number;
  readonly leaseDurationMs: number;
  readonly storageDriver: "minio" | "gcs";
  readonly storageBucket: string;
  readonly storageEndpoint: string | null;
  readonly storageAccessKey: string | null;
  readonly storageSecretKey: string | null;
  readonly gcpProjectId: string | null;
  readonly reconciliationCron: string;
  readonly retentionCron: string;
};

export class WorkerConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerConfigurationError";
  }
}

const placeholderPattern =
  /^(change-me|replace|replace-me|replace-in-production|replace-with|secret|test|todo|example|local-only)/iu;

export function readWorkerConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  const runtimeEnvironment = readEnvironment(env.NODE_ENV);
  const production = runtimeEnvironment === "production";
  const databaseUrl = readUrl(env.DATABASE_URL, "DATABASE_URL", ["postgres:", "postgresql:"]);
  const schedulerDatabaseUrl = env.SCHEDULER_DATABASE_URL?.trim()
    ? readUrl(env.SCHEDULER_DATABASE_URL, "SCHEDULER_DATABASE_URL", ["postgres:", "postgresql:"])
    : production
      ? (() => { throw new WorkerConfigurationError("SCHEDULER_DATABASE_URL is required in production."); })()
      : databaseUrl;

  if (production) {
    const applicationDatabase = new URL(databaseUrl);
    const platformDatabase = new URL(schedulerDatabaseUrl);
    if (applicationDatabase.href === platformDatabase.href) {
      throw new WorkerConfigurationError(
        "SCHEDULER_DATABASE_URL must use a separate platform credential in production.",
      );
    }
    if (
      applicationDatabase.username
      && platformDatabase.username
      && applicationDatabase.username === platformDatabase.username
    ) {
      throw new WorkerConfigurationError(
        "DATABASE_URL and SCHEDULER_DATABASE_URL must use different database roles.",
      );
    }
  }

  const redisUrl = readUrl(env.REDIS_URL, "REDIS_URL", ["redis:", "rediss:"]);
  if (production && new URL(redisUrl).protocol !== "rediss:") {
    throw new WorkerConfigurationError("REDIS_URL must use rediss:// in production.");
  }
  const redisCaBase64 = optionalBase64(env.REDIS_CA_BASE64, "REDIS_CA_BASE64");
  if (production && !redisCaBase64) {
    throw new WorkerConfigurationError("REDIS_CA_BASE64 is required in production.");
  }

  const storageDriver = readStorageDriver(env.PAPADATA_STORAGE_DRIVER, production);
  const storageBucket = requiredText(env, "PAPADATA_STORAGE_BUCKET");
  const storageEndpoint = optionalText(env.PAPADATA_STORAGE_ENDPOINT);
  const storageAccessKey = optionalSecret(env.PAPADATA_STORAGE_ACCESS_KEY, "PAPADATA_STORAGE_ACCESS_KEY", production);
  const storageSecretKey = optionalSecret(env.PAPADATA_STORAGE_SECRET_KEY, "PAPADATA_STORAGE_SECRET_KEY", production);
  const gcpProjectId = optionalText(env.GOOGLE_CLOUD_PROJECT);

  if (storageDriver === "gcs") {
    if (!gcpProjectId) {
      throw new WorkerConfigurationError("GOOGLE_CLOUD_PROJECT is required for GCS.");
    }
    if (storageEndpoint || storageAccessKey || storageSecretKey) {
      throw new WorkerConfigurationError(
        "MinIO endpoint and credentials must not be configured for the GCS driver.",
      );
    }
  } else if (!storageEndpoint || !storageAccessKey || !storageSecretKey) {
    throw new WorkerConfigurationError(
      "MinIO requires PAPADATA_STORAGE_ENDPOINT, PAPADATA_STORAGE_ACCESS_KEY and PAPADATA_STORAGE_SECRET_KEY.",
    );
  }

  return {
    runtimeEnvironment,
    databaseUrl,
    schedulerDatabaseUrl,
    redisUrl,
    redisCaBase64,
    workerConcurrency: integer(env.WORKER_CONCURRENCY, "WORKER_CONCURRENCY", 4, 1, 64),
    platformWorkerConcurrency: integer(
      env.PLATFORM_WORKER_CONCURRENCY,
      "PLATFORM_WORKER_CONCURRENCY",
      4,
      1,
      64,
    ),
    leaseDurationMs: integer(
      env.WORKER_LEASE_DURATION_MS,
      "WORKER_LEASE_DURATION_MS",
      60_000,
      10_000,
      600_000,
    ),
    storageDriver,
    storageBucket,
    storageEndpoint,
    storageAccessKey,
    storageSecretKey,
    gcpProjectId,
    reconciliationCron: env.RECONCILIATION_CRON?.trim() || "0 */6 * * *",
    retentionCron: env.RETENTION_CRON?.trim() || "30 2 * * *",
  };
}

function readEnvironment(value: string | undefined): WorkerRuntimeEnvironment {
  if (value === "production" || value === "test" || value === "development") return value;
  if (!value || value === "local") return "development";
  throw new WorkerConfigurationError("NODE_ENV must be development, test or production.");
}

function readStorageDriver(
  value: string | undefined,
  production: boolean,
): "minio" | "gcs" {
  const normalized = value?.trim() || (production ? "" : "minio");
  if (normalized !== "minio" && normalized !== "gcs") {
    throw new WorkerConfigurationError(
      "PAPADATA_STORAGE_DRIVER must be minio or gcs.",
    );
  }
  return normalized;
}

function requiredText(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new WorkerConfigurationError(`${name} is required.`);
  return value;
}

function optionalText(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function optionalSecret(
  value: string | undefined,
  name: string,
  validatePlaceholder: boolean,
): string | null {
  const normalized = optionalText(value);
  if (normalized && validatePlaceholder && placeholderPattern.test(normalized)) {
    throw new WorkerConfigurationError(`${name} must not be a placeholder.`);
  }
  return normalized;
}

function optionalBase64(value: string | undefined, name: string): string | null {
  const normalized = optionalText(value);
  if (!normalized) return null;
  const canonical = normalized.replace(/\s+/gu, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/u.test(canonical) || canonical.length % 4 !== 0) {
    throw new WorkerConfigurationError(`${name} must be valid base64.`);
  }
  if (Buffer.from(canonical, "base64").byteLength === 0) {
    throw new WorkerConfigurationError(`${name} must be valid base64.`);
  }
  return canonical;
}

function readUrl(raw: string | undefined, name: string, protocols: readonly string[]): string {
  const value = raw?.trim();
  if (!value) throw new WorkerConfigurationError(`${name} is required.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new WorkerConfigurationError(`${name} must be a valid URL.`);
  }
  if (!protocols.includes(url.protocol)) {
    throw new WorkerConfigurationError(`${name} must use ${protocols.join(" or ")}.`);
  }
  return value;
}

function integer(
  raw: string | undefined,
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!raw) return fallback;
  if (!/^\d+$/u.test(raw)) {
    throw new WorkerConfigurationError(`${name} must be an integer.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new WorkerConfigurationError(`${name} must be between ${min} and ${max}.`);
  }
  return value;
}
