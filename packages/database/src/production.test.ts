import { describe, expect, it } from "vitest";
import { buildPoolConfig, type DatabaseConfig } from "./production.js";

function config(overrides: Partial<DatabaseConfig> = {}): DatabaseConfig {
  return {
    connectionString: "postgresql://papadata_app:secret@postgres-production:5432/papadata",
    max: 10,
    statementTimeoutMs: 30_000,
    sslCaBase64: null,
    ...overrides,
  };
}

describe("buildPoolConfig", () => {
  it("does not request TLS when sslCaBase64 is null", () => {
    const poolConfig = buildPoolConfig(config({ sslCaBase64: null }), "papadata-application");

    expect(poolConfig.ssl).toBeUndefined();
  });

  it("requests verified TLS with the decoded CA when sslCaBase64 is set", () => {
    const caPem = "-----BEGIN CERTIFICATE-----\nfake\n-----END CERTIFICATE-----\n";
    const poolConfig = buildPoolConfig(
      config({ sslCaBase64: Buffer.from(caPem, "utf8").toString("base64") }),
      "papadata-application",
    );

    expect(poolConfig.ssl).toEqual({ ca: caPem, rejectUnauthorized: true });
  });

  it("carries through pool sizing, statement timeout and application name unchanged", () => {
    const poolConfig = buildPoolConfig(
      config({ max: 7, statementTimeoutMs: 12_345 }),
      "papadata-platform-operator",
    );

    expect(poolConfig.max).toBe(7);
    expect(poolConfig.statement_timeout).toBe(12_345);
    expect(poolConfig.application_name).toBe("papadata-platform-operator");
  });
});
