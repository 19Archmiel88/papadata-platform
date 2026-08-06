export type RuntimeEnvironment = "development" | "production" | "test";

export type ProductionConfig = {
  readonly runtimeEnvironment: RuntimeEnvironment;
  readonly port: number;
  readonly databaseUrl: string;
  readonly databasePoolMax: number;
  readonly databaseStatementTimeoutMs: number;
  readonly redisUrl: string;
  readonly redisCaBase64: string | null;
  readonly redisConnectTimeoutMs: number;
  readonly storageDriver: "minio" | "gcs";
  readonly storageBucket: string;
  readonly storageEndpoint: string | null;
  readonly storageAccessKey: string | null;
  readonly storageSecretKey: string | null;
  readonly gcpProjectId: string | null;
  readonly otlpEndpoint: string | null;
  readonly infrastructureAuthToken: string;
  readonly authIssuer: string;
  readonly authAudience: string;
  readonly authActiveSecret: string;
  readonly authPreviousSecret: string | null;
  readonly mfaEncryptionKey: string;
};

export class ProductionConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionConfigurationError";
  }
}

const placeholderPattern =
  /^(change-me|replace|replace-me|replace-in-production|secret|test|todo|example|local-only)/iu;

export function readProductionConfig(
  env: NodeJS.ProcessEnv = process.env,
): ProductionConfig {
  const runtimeEnvironment = readEnvironment(env.NODE_ENV);
  const storageDriver = readEnum(
    env.PAPADATA_STORAGE_DRIVER,
    "PAPADATA_STORAGE_DRIVER",
    ["minio", "gcs"] as const,
    runtimeEnvironment === "production" ? undefined : "minio",
  );
  const redisUrl = readUrl(env.REDIS_URL, "REDIS_URL", ["redis:", "rediss:"]);

  if (runtimeEnvironment === "production" && new URL(redisUrl).protocol !== "rediss:") {
    throw new ProductionConfigurationError(
      "REDIS_URL must use rediss:// in production.",
    );
  }
  const redisCaBase64 = optionalBase64(env.REDIS_CA_BASE64, "REDIS_CA_BASE64");
  if (runtimeEnvironment === "production" && !redisCaBase64) {
    throw new ProductionConfigurationError(
      "REDIS_CA_BASE64 is required for production Redis TLS verification.",
    );
  }

  const storageBucket = requiredText(env, "PAPADATA_STORAGE_BUCKET");
  const storageEndpoint = optionalText(env.PAPADATA_STORAGE_ENDPOINT);
  const storageAccessKey = optionalSecret(env, "PAPADATA_STORAGE_ACCESS_KEY");
  const storageSecretKey = optionalSecret(env, "PAPADATA_STORAGE_SECRET_KEY");
  const gcpProjectId = optionalText(env.GOOGLE_CLOUD_PROJECT);

  if (storageDriver === "gcs") {
    if (!gcpProjectId) {
      throw new ProductionConfigurationError(
        "GOOGLE_CLOUD_PROJECT is required when PAPADATA_STORAGE_DRIVER=gcs.",
      );
    }
    if (storageEndpoint || storageAccessKey || storageSecretKey) {
      throw new ProductionConfigurationError(
        "MinIO endpoint and credentials must not be configured for the GCS driver.",
      );
    }
  } else {
    if (!storageEndpoint || !storageAccessKey || !storageSecretKey) {
      throw new ProductionConfigurationError(
        "PAPADATA_STORAGE_ENDPOINT, PAPADATA_STORAGE_ACCESS_KEY and PAPADATA_STORAGE_SECRET_KEY are required for MinIO.",
      );
    }
  }

  const authActiveSecret = requiredSecret(env, "PAPADATA_API_AUTH_ACTIVE_SECRET", 32);
  const authPreviousSecret = optionalSecret(
    env,
    "PAPADATA_API_AUTH_PREVIOUS_SECRET",
    32,
  );
  if (authPreviousSecret && authPreviousSecret === authActiveSecret) {
    throw new ProductionConfigurationError(
      "PAPADATA_API_AUTH_ACTIVE_SECRET and PAPADATA_API_AUTH_PREVIOUS_SECRET must differ.",
    );
  }

  return {
    runtimeEnvironment,
    port: readInteger(env.API_PORT, "API_PORT", 4000, 1, 65_535),
    databaseUrl: readUrl(env.DATABASE_URL, "DATABASE_URL", ["postgres:", "postgresql:"]),
    databasePoolMax: readInteger(env.DB_POOL_MAX, "DB_POOL_MAX", 20, 1, 100),
    databaseStatementTimeoutMs: readInteger(
      env.DB_STATEMENT_TIMEOUT_MS,
      "DB_STATEMENT_TIMEOUT_MS",
      30_000,
      1_000,
      120_000,
    ),
    redisUrl,
    redisCaBase64,
    redisConnectTimeoutMs: readInteger(
      env.REDIS_CONNECT_TIMEOUT_MS,
      "REDIS_CONNECT_TIMEOUT_MS",
      5_000,
      100,
      30_000,
    ),
    storageDriver,
    storageBucket,
    storageEndpoint,
    storageAccessKey,
    storageSecretKey,
    gcpProjectId,
    otlpEndpoint: optionalUrl(
      env.OTEL_EXPORTER_OTLP_ENDPOINT,
      "OTEL_EXPORTER_OTLP_ENDPOINT",
      ["http:", "https:"],
    ),
    infrastructureAuthToken: requiredSecret(
      env,
      "PAPADATA_INFRASTRUCTURE_AUTH_TOKEN",
      32,
    ),
    authIssuer: requiredText(env, "PAPADATA_API_AUTH_ISSUER"),
    authAudience: requiredText(env, "PAPADATA_API_AUTH_AUDIENCE"),
    authActiveSecret,
    authPreviousSecret,
    mfaEncryptionKey: readMfaKey(env),
  };
}

function readEnvironment(value: string | undefined): RuntimeEnvironment {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }
  if (value === undefined || value === "local") {
    return "development";
  }
  throw new ProductionConfigurationError(
    "NODE_ENV must be development, test or production.",
  );
}

function requiredText(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new ProductionConfigurationError(`${name} is required.`);
  }
  return value;
}

function optionalText(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function requiredSecret(
  env: NodeJS.ProcessEnv,
  name: string,
  minimumBytes: number,
): string {
  const value = requiredText(env, name);
  validateSecret(name, value, minimumBytes);
  return value;
}

function optionalSecret(
  env: NodeJS.ProcessEnv,
  name: string,
  minimumBytes = 16,
): string | null {
  const value = optionalText(env[name]);
  if (!value) {
    return null;
  }
  validateSecret(name, value, minimumBytes);
  return value;
}

function validateSecret(name: string, value: string, minimumBytes: number): void {
  if (Buffer.byteLength(value, "utf8") < minimumBytes) {
    throw new ProductionConfigurationError(
      `${name} must contain at least ${minimumBytes} bytes.`,
    );
  }
  if (placeholderPattern.test(value)) {
    throw new ProductionConfigurationError(`${name} must not be a placeholder.`);
  }
}

function readMfaKey(env: NodeJS.ProcessEnv): string {
  const value = requiredText(env, "MFA_ENCRYPTION_KEY");
  const decoded = Buffer.from(value, /^[0-9a-f]{64}$/iu.test(value) ? "hex" : "base64");
  if (decoded.length !== 32) {
    throw new ProductionConfigurationError(
      "MFA_ENCRYPTION_KEY must decode to exactly 32 bytes.",
    );
  }
  return value;
}

function readInteger(
  raw: string | undefined,
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  if (!/^\d+$/u.test(raw)) {
    throw new ProductionConfigurationError(`${name} must be an integer.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new ProductionConfigurationError(
      `${name} must be between ${min} and ${max}.`,
    );
  }
  return value;
}

function readEnum<const T extends readonly string[]>(
  raw: string | undefined,
  name: string,
  values: T,
  fallback?: T[number],
): T[number] {
  const value = raw?.trim() || fallback;
  if (!value || !(values as readonly string[]).includes(value)) {
    throw new ProductionConfigurationError(
      `${name} must be one of: ${values.join(", ")}.`,
    );
  }
  return value as T[number];
}

function readUrl(
  raw: string | undefined,
  name: string,
  protocols: readonly string[],
): string {
  const value = raw?.trim();
  if (!value) {
    throw new ProductionConfigurationError(`${name} is required.`);
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ProductionConfigurationError(`${name} must be a valid URL.`);
  }
  if (!protocols.includes(url.protocol)) {
    throw new ProductionConfigurationError(
      `${name} must use one of: ${protocols.join(", ")}.`,
    );
  }
  return value;
}

function optionalUrl(
  raw: string | undefined,
  name: string,
  protocols: readonly string[],
): string | null {
  return raw?.trim() ? readUrl(raw, name, protocols) : null;
}

function optionalBase64(raw: string | undefined, name: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    if (Buffer.from(value, "base64").byteLength === 0) throw new Error("empty");
  } catch {
    throw new ProductionConfigurationError(`${name} must be valid base64.`);
  }
  return value;
}
