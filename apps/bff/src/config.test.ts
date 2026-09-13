import { describe, expect, it } from "vitest";
import { readBffConfig, BffConfigurationError } from "./config.js";

// 32+ byte, non-placeholder-looking secrets. Each call site below overrides
// only the ones relevant to that test to keep signal high.
function secret(label: string): string {
  return `${label}-0123456789abcdef0123456789abcdef`;
}

function baseEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    BFF_COOKIE_SECRET: secret("cookie-active"),
    BFF_COOKIE_PREVIOUS_SECRET: secret("cookie-previous"),
    BFF_CSRF_SECRET: secret("csrf"),
    BFF_REFRESH_COOKIE_SECRET: secret("refresh-active"),
    BFF_REFRESH_COOKIE_PREVIOUS_SECRET: secret("refresh-previous"),
    BFF_INTERNAL_AUTH_ACTIVE_SECRET: secret("internal-active"),
    BFF_INTERNAL_AUTH_PREVIOUS_SECRET: secret("internal-previous"),
    BFF_INTERNAL_AUTH_AUDIENCE: "papadata-api",
    BFF_INTERNAL_AUTH_ISSUER: "papadata-bff",
    BFF_ALLOWED_ORIGINS: "https://papadata.localhost",
    BFF_PUBLIC_HOSTS: "papadata.localhost",
    BFF_SESSION_STORE: "test-memory",
    API_ORIGIN: "http://api-production:4000",
    REDIS_URL: "redis://127.0.0.1:6379",
    ...overrides,
  };
}

describe("readBffConfig: upstream identity mode", () => {
  it("defaults to disabled (no identity path) when NODE_ENV is not production and the mode is unset", () => {
    const config = readBffConfig(baseEnv({ NODE_ENV: "test" }));

    expect(config.upstreamIdentityMode).toBe("disabled");
    expect(config.upstreamIdentityAudience).toBeNull();
  });

  it("fails fast when NODE_ENV=production and BFF_UPSTREAM_IDENTITY_MODE is unset", () => {
    expect(() => readBffConfig(baseEnv({ NODE_ENV: "production", BFF_UPSTREAM_IDENTITY_MODE: undefined })))
      .toThrow(BffConfigurationError);
  });

  it("fails fast on an unrecognized BFF_UPSTREAM_IDENTITY_MODE value", () => {
    expect(() => readBffConfig(baseEnv({ BFF_UPSTREAM_IDENTITY_MODE: "sometimes" })))
      .toThrow(/disabled or metadata-server/u);
  });

  it("activates the identity path under NODE_ENV=production when explicitly set to metadata-server", () => {
    const config = readBffConfig(baseEnv({
      NODE_ENV: "production",
      BFF_UPSTREAM_IDENTITY_MODE: "metadata-server",
      BFF_SESSION_STORE: "redis-auth-state",
      REDIS_URL: "rediss://127.0.0.1:6379",
      REDIS_CA_BASE64: Buffer.from("fake-ca").toString("base64"),
    }));

    expect(config.upstreamIdentityMode).toBe("metadata-server");
    expect(config.upstreamIdentityAudience).toBe("http://api-production:4000");
  });

  it("activates the identity path under a non-production NODE_ENV when explicitly set to metadata-server (production-parity's actual case: NODE_ENV=production too, but proves the flag -- not NODE_ENV -- is what gates this)", () => {
    const config = readBffConfig(baseEnv({
      NODE_ENV: "test",
      BFF_UPSTREAM_IDENTITY_MODE: "metadata-server",
    }));

    expect(config.upstreamIdentityMode).toBe("metadata-server");
    expect(config.upstreamIdentityAudience).toBe("http://api-production:4000");
  });

  it("prefers an explicit BFF_UPSTREAM_IDENTITY_AUDIENCE over the API_ORIGIN fallback", () => {
    const config = readBffConfig(baseEnv({
      BFF_UPSTREAM_IDENTITY_MODE: "metadata-server",
      BFF_UPSTREAM_IDENTITY_AUDIENCE: "https://custom-audience.example",
    }));

    expect(config.upstreamIdentityAudience).toBe("https://custom-audience.example");
  });

  it("stays disabled (no audience computed) when the mode is explicitly disabled, even in production", () => {
    const config = readBffConfig(baseEnv({
      NODE_ENV: "production",
      BFF_UPSTREAM_IDENTITY_MODE: "disabled",
      BFF_SESSION_STORE: "redis-auth-state",
      REDIS_URL: "rediss://127.0.0.1:6379",
      REDIS_CA_BASE64: Buffer.from("fake-ca").toString("base64"),
    }));

    expect(config.upstreamIdentityMode).toBe("disabled");
    expect(config.upstreamIdentityAudience).toBeNull();
  });

  it("no longer recognizes production-parity as a distinct NODE_ENV value", () => {
    expect(() => readBffConfig(baseEnv({ NODE_ENV: "production-parity" })))
      .toThrow(/NODE_ENV must be/u);
  });
});
