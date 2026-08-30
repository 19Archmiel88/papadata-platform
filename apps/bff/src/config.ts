export type BffRuntimeEnvironment = "local" | "production" | "production-parity" | "test";

export type BffSessionStoreMode = "redis-auth-state" | "test-memory";

export type BffConfig = {
  readonly allowedOrigins: readonly string[];
  readonly apiOrigin: string;
  readonly cookieMaxAgeSeconds: number;
  readonly cookiePath: string;
  readonly cookiePreviousSecret: string | null;
  readonly cookieSameSite: "lax" | "strict";
  readonly cookieSecret: string;
  readonly cookieSecure: boolean;
  readonly csrfCookieMaxAgeSeconds: number;
  readonly csrfCookieName: string;
  readonly csrfHeaderName: string;
  readonly csrfSecret: string;
  readonly internalAuthActiveSecret: string;
  readonly internalAuthAudience: string;
  readonly internalAuthIssuer: string;
  readonly internalAuthPreviousSecret: string | null;
  readonly internalPrincipalHeaderName: string;
  readonly internalTokenTtlSeconds: number;
  readonly maxBodyBytes: number;
  readonly port: number;
  readonly publicHosts: readonly string[];
  readonly rateLimitMax: number;
  readonly rateLimitWindowMs: number;
  readonly redisCaBase64: string | null;
  readonly redisCommandTimeoutMs: number;
  readonly redisConnectTimeoutMs: number;
  readonly refreshCookieName: string;
  readonly refreshCookiePath: string;
  readonly refreshCookiePreviousSecret: string | null;
  readonly refreshCookieSecret: string;
  readonly requestIdHeaderName: string;
  readonly runtimeEnvironment: BffRuntimeEnvironment;
  readonly sessionAbsoluteTtlSeconds: number;
  readonly sessionCookieName: string;
  readonly sessionRedisPrefix: string;
  readonly sessionRedisUrl: string;
  readonly sessionStoreMode: BffSessionStoreMode;
  readonly upstreamTimeoutMs: number;
  readonly upstreamIdentityAudience: string | null;
  readonly metadataIdentityEndpoint: string;
};

const placeholderPattern =
  /^(change-me|replace|replace-me|replace-in-production|replace-with|secret|test|todo|example|local-only)/iu;

export class BffConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BffConfigurationError";
  }
}

export function readBffConfig(
  env: NodeJS.ProcessEnv = process.env,
): BffConfig {
  const runtimeEnvironment = readRuntimeEnvironment(env.NODE_ENV);
  const productionLike = runtimeEnvironment === "production" || runtimeEnvironment === "production-parity";
  const cookieSecret = readSecret(env, "BFF_COOKIE_SECRET");
  const cookiePreviousSecret = readOptionalSecret(
    env,
    "BFF_COOKIE_PREVIOUS_SECRET",
  );
  const csrfSecret = readSecret(env, "BFF_CSRF_SECRET");
  const internalAuthActiveSecret = readSecret(
    env,
    "BFF_INTERNAL_AUTH_ACTIVE_SECRET",
  );
  const internalAuthPreviousSecret = readOptionalSecret(
    env,
    "BFF_INTERNAL_AUTH_PREVIOUS_SECRET",
  );
  const refreshCookieSecret = readSecret(env, "BFF_REFRESH_COOKIE_SECRET");
  const refreshCookiePreviousSecret = readOptionalSecret(
    env,
    "BFF_REFRESH_COOKIE_PREVIOUS_SECRET",
  );

  assertDistinctSecrets({
    BFF_COOKIE_SECRET: cookieSecret,
    ...(cookiePreviousSecret
      ? { BFF_COOKIE_PREVIOUS_SECRET: cookiePreviousSecret }
      : {}),
    BFF_CSRF_SECRET: csrfSecret,
    BFF_INTERNAL_AUTH_ACTIVE_SECRET: internalAuthActiveSecret,
    ...(internalAuthPreviousSecret
      ? { BFF_INTERNAL_AUTH_PREVIOUS_SECRET: internalAuthPreviousSecret }
      : {}),
    BFF_REFRESH_COOKIE_SECRET: refreshCookieSecret,
    ...(refreshCookiePreviousSecret
      ? { BFF_REFRESH_COOKIE_PREVIOUS_SECRET: refreshCookiePreviousSecret }
      : {}),
  });

  const allowedOrigins = readCsv(env.BFF_ALLOWED_ORIGINS, "BFF_ALLOWED_ORIGINS");
  const publicHosts = readCsv(env.BFF_PUBLIC_HOSTS, "BFF_PUBLIC_HOSTS");
  const sessionStoreMode = readSessionStoreMode(env.BFF_SESSION_STORE);

  if (sessionStoreMode === "test-memory" && runtimeEnvironment !== "test") {
    throw new BffConfigurationError(
      "BFF_SESSION_STORE=test-memory is only allowed when NODE_ENV=test.",
    );
  }

  validateOrigins(allowedOrigins);
  validatePublicHosts(publicHosts);

  const sessionRedisUrl = sessionStoreMode === "redis-auth-state"
    ? readRedisUrl(env.REDIS_URL, runtimeEnvironment)
    : env.REDIS_URL?.trim() || "redis://127.0.0.1:6379";
  const redisCaBase64 = readOptionalBase64(env.REDIS_CA_BASE64, "REDIS_CA_BASE64");
  if (productionLike && !redisCaBase64) {
    throw new BffConfigurationError(
      "REDIS_CA_BASE64 is required for production Redis TLS verification.",
    );
  }

  return {
    allowedOrigins,
    apiOrigin: readOrigin(env.API_ORIGIN, "API_ORIGIN"),
    cookieMaxAgeSeconds: readBoundedInteger(
      env.BFF_SESSION_COOKIE_MAX_AGE_SECONDS,
      "BFF_SESSION_COOKIE_MAX_AGE_SECONDS",
      30 * 60,
      60,
      24 * 60 * 60,
    ),
    cookiePath: env.BFF_SESSION_COOKIE_PATH?.trim() || "/",
    cookiePreviousSecret,
    cookieSameSite: env.BFF_COOKIE_SAME_SITE === "lax" ? "lax" : "strict",
    cookieSecret,
    cookieSecure: productionLike,
    csrfCookieMaxAgeSeconds: readBoundedInteger(
      env.BFF_CSRF_COOKIE_MAX_AGE_SECONDS,
      "BFF_CSRF_COOKIE_MAX_AGE_SECONDS",
      60 * 60,
      60,
      24 * 60 * 60,
    ),
    csrfCookieName: env.BFF_CSRF_COOKIE_NAME?.trim() || "papadata_csrf",
    csrfHeaderName:
      env.BFF_CSRF_HEADER_NAME?.trim().toLowerCase() || "x-papadata-csrf",
    csrfSecret,
    internalAuthActiveSecret,
    internalAuthAudience: readRequiredText(
      env,
      "BFF_INTERNAL_AUTH_AUDIENCE",
    ),
    internalAuthIssuer: readRequiredText(env, "BFF_INTERNAL_AUTH_ISSUER"),
    internalAuthPreviousSecret,
    internalPrincipalHeaderName:
      env.BFF_INTERNAL_PRINCIPAL_HEADER_NAME?.trim().toLowerCase()
      || "x-papadata-internal-principal",
    internalTokenTtlSeconds: readBoundedInteger(
      env.BFF_INTERNAL_TOKEN_TTL_SECONDS,
      "BFF_INTERNAL_TOKEN_TTL_SECONDS",
      120,
      5,
      300,
    ),
    maxBodyBytes: readBoundedInteger(
      env.BFF_MAX_BODY_BYTES,
      "BFF_MAX_BODY_BYTES",
      1_048_576,
      1_024,
      10 * 1_048_576,
    ),
    port: readBoundedInteger(env.BFF_PORT, "BFF_PORT", 3001, 1, 65_535),
    publicHosts,
    rateLimitMax: readBoundedInteger(
      env.BFF_RATE_LIMIT_MAX,
      "BFF_RATE_LIMIT_MAX",
      300,
      1,
      100_000,
    ),
    rateLimitWindowMs: readBoundedInteger(
      env.BFF_RATE_LIMIT_WINDOW_MS,
      "BFF_RATE_LIMIT_WINDOW_MS",
      60_000,
      1_000,
      3_600_000,
    ),
    redisCaBase64,
    redisCommandTimeoutMs: readBoundedInteger(
      env.BFF_REDIS_COMMAND_TIMEOUT_MS,
      "BFF_REDIS_COMMAND_TIMEOUT_MS",
      2_000,
      100,
      30_000,
    ),
    redisConnectTimeoutMs: readBoundedInteger(
      env.BFF_REDIS_CONNECT_TIMEOUT_MS,
      "BFF_REDIS_CONNECT_TIMEOUT_MS",
      3_000,
      100,
      30_000,
    ),
    refreshCookieName: env.BFF_REFRESH_COOKIE_NAME?.trim() || "pd_refresh",
    // Scoped narrowly to the one route that ever reads it, unlike the
    // session cookie's path -- reduces exposure of the long-lived refresh
    // token to any other endpoint.
    refreshCookiePath: env.BFF_REFRESH_COOKIE_PATH?.trim() || "/api/v1/auth/refresh",
    refreshCookiePreviousSecret,
    refreshCookieSecret,
    requestIdHeaderName:
      env.BFF_REQUEST_ID_HEADER_NAME?.trim().toLowerCase() || "x-request-id",
    runtimeEnvironment,
    sessionAbsoluteTtlSeconds: readBoundedInteger(
      env.BFF_SESSION_ABSOLUTE_TTL_SECONDS,
      "BFF_SESSION_ABSOLUTE_TTL_SECONDS",
      30 * 24 * 60 * 60,
      60 * 60,
      90 * 24 * 60 * 60,
    ),
    sessionCookieName: env.BFF_SESSION_COOKIE_NAME?.trim() || "pd_session",
    sessionRedisPrefix: env.BFF_SESSION_REDIS_PREFIX?.trim() || "papadata:auth",
    sessionRedisUrl,
    sessionStoreMode,
    upstreamTimeoutMs: readBoundedInteger(
      env.BFF_UPSTREAM_TIMEOUT_MS,
      "BFF_UPSTREAM_TIMEOUT_MS",
      5_000,
      100,
      30_000,
    ),
    upstreamIdentityAudience: runtimeEnvironment === "production"
      ? readOrigin(
          env.BFF_UPSTREAM_IDENTITY_AUDIENCE?.trim() || env.API_ORIGIN,
          "BFF_UPSTREAM_IDENTITY_AUDIENCE",
        )
      : null,
    metadataIdentityEndpoint: env.BFF_METADATA_IDENTITY_ENDPOINT?.trim()
      || "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity",
  };
}

function readRuntimeEnvironment(value: string | undefined): BffRuntimeEnvironment {
  if (value === "production") return "production";
  if (value === "production-parity") return "production-parity";
  if (value === "test") return "test";
  if (value === undefined || value === "local" || value === "development") return "local";
  throw new BffConfigurationError(
    "NODE_ENV must be local, development, test, production-parity or production.",
  );
}

function readSessionStoreMode(value: string | undefined): BffSessionStoreMode {
  if (value === "test-memory") return "test-memory";
  if (value === undefined || value === "redis-auth-state") {
    return "redis-auth-state";
  }
  throw new BffConfigurationError(
    "BFF_SESSION_STORE must be redis-auth-state or test-memory.",
  );
}

function readRequiredText(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new BffConfigurationError(`${name} is required.`);
  return value;
}

function readSecret(env: NodeJS.ProcessEnv, name: string): string {
  const value = readRequiredText(env, name);
  if (Buffer.byteLength(value, "utf8") < 32) {
    throw new BffConfigurationError(
      `${name} must have at least 32 bytes of secret material.`,
    );
  }
  if (placeholderPattern.test(value.trim())) {
    throw new BffConfigurationError(`${name} must not use a placeholder.`);
  }
  return value;
}

function readOptionalSecret(
  env: NodeJS.ProcessEnv,
  name: string,
): string | null {
  const value = env[name]?.trim();
  return value ? readSecret(env, name) : null;
}

function assertDistinctSecrets(secrets: Readonly<Record<string, string>>): void {
  const entries = Object.entries(secrets);
  for (let index = 0; index < entries.length; index += 1) {
    const [leftName, leftValue] = entries[index]!;
    for (const [rightName, rightValue] of entries.slice(index + 1)) {
      if (leftValue === rightValue) {
        throw new BffConfigurationError(
          `${leftName} and ${rightName} must use different secret material.`,
        );
      }
    }
  }
}

function readCsv(value: string | undefined, name: string): readonly string[] {
  const values = value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  if (values.length === 0) {
    throw new BffConfigurationError(`${name} must not be empty.`);
  }
  return [...new Set(values)];
}

function validateOrigins(origins: readonly string[]): void {
  for (const origin of origins) {
    if (origin === "*") {
      throw new BffConfigurationError(
        "BFF_ALLOWED_ORIGINS cannot contain wildcard origins.",
      );
    }
    readOrigin(origin, "BFF_ALLOWED_ORIGINS");
  }
}

function validatePublicHosts(hosts: readonly string[]): void {
  for (const host of hosts) {
    if (host.includes("://") || host.includes("/") || host === "*" || !host) {
      throw new BffConfigurationError(
        "BFF_PUBLIC_HOSTS must contain explicit host names without scheme.",
      );
    }
  }
}

function readOrigin(value: string | undefined, name: string): string {
  const raw = value?.trim();
  if (!raw) throw new BffConfigurationError(`${name} is required.`);
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new BffConfigurationError(`${name} must be a valid URL origin.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new BffConfigurationError(`${name} must use HTTP or HTTPS.`);
  }
  return parsed.origin;
}

function readRedisUrl(
  value: string | undefined,
  runtimeEnvironment: BffRuntimeEnvironment,
): string {
  const raw = value?.trim();
  if (!raw) throw new BffConfigurationError("REDIS_URL is required.");
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new BffConfigurationError("REDIS_URL must be a valid URL.");
  }
  if (!["redis:", "rediss:"].includes(parsed.protocol)) {
    throw new BffConfigurationError("REDIS_URL must use redis:// or rediss://.");
  }
  if ((runtimeEnvironment === "production" || runtimeEnvironment === "production-parity") && parsed.protocol !== "rediss:") {
    throw new BffConfigurationError("REDIS_URL must use rediss:// in production.");
  }
  return raw;
}

function readBoundedInteger(
  raw: string | undefined,
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  if (!/^\d+$/u.test(raw)) {
    throw new BffConfigurationError(`${name} must be an integer.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new BffConfigurationError(`${name} must be between ${min} and ${max}.`);
  }
  return value;
}

function readOptionalBase64(value: string | undefined, name: string): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (Buffer.from(normalized, "base64").byteLength === 0) {
    throw new BffConfigurationError(`${name} must be valid base64.`);
  }
  return normalized;
}
