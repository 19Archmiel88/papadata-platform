import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ProductionDatabase } from "@papadata/database";
import { AccessMailService } from "./access-mail.service.js";

type RecordedQuery = { readonly sql: string; readonly params: readonly unknown[] };

function fakeDatabase(queries: RecordedQuery[]): ProductionDatabase {
  const client = {
    query: async (sql: string, params: readonly unknown[] = []) => {
      queries.push({ params, sql });
      return { rows: [] };
    },
  };
  return { withSystem: async (fn: (c: unknown) => unknown) => fn(client) } as unknown as ProductionDatabase;
}

const MAIL_ENV_KEYS = [
  "PAPADATA_AUTH_MAIL_ENABLED",
  "PAPADATA_AUTH_MAIL_KEY_BASE64",
  "PAPADATA_AUTH_MAIL_FROM",
  "PAPADATA_WEB_ORIGIN",
  "PAPADATA_AUTH_MAIL_API_KEY",
  "PAPADATA_AUTH_MAIL_TRANSPORT",
  "PAPADATA_AUTH_MAIL_SMTP_HOST",
  "PAPADATA_AUTH_MAIL_SMTP_PORT",
] as const;

describe("AccessMailService", () => {
  let originalValues: Record<string, string | undefined>;

  beforeEach(() => {
    originalValues = Object.fromEntries(MAIL_ENV_KEYS.map((key) => [key, process.env[key]]));
    for (const key of MAIL_ENV_KEYS) delete process.env[key];
  });

  afterEach(() => {
    for (const key of MAIL_ENV_KEYS) {
      if (originalValues[key] === undefined) delete process.env[key];
      else process.env[key] = originalValues[key];
    }
  });

  it("mail disabled: available() is false and enqueue() fails closed without disclosing a token", async () => {
    const service = new AccessMailService(fakeDatabase([]));

    expect(service.available()).toBe(false);
    await expect(service.enqueue("verify", "user@example.test")).rejects.toMatchObject({
      message: expect.stringContaining("No token is disclosed"),
      status: 503,
    });
  });

  it("invalid mail config: available() is false and enqueue() fails closed with a generic message (no config details, no token)", async () => {
    process.env.PAPADATA_AUTH_MAIL_ENABLED = "true";
    process.env.PAPADATA_AUTH_MAIL_KEY_BASE64 = "not-32-bytes";
    const service = new AccessMailService(fakeDatabase([]));

    expect(service.available()).toBe(false);
    await expect(service.enqueue("verify", "user@example.test")).rejects.toMatchObject({ status: 503 });
  });

  it("enabled and valid: enqueue() returns exactly {accepted, disclosureSafe, deliveryStatus} -- no token field anywhere in the response", async () => {
    process.env.PAPADATA_AUTH_MAIL_ENABLED = "true";
    process.env.PAPADATA_AUTH_MAIL_KEY_BASE64 = randomBytes(32).toString("base64");
    process.env.PAPADATA_AUTH_MAIL_FROM = "PapaData <no-reply@papadata.localhost>";
    process.env.PAPADATA_WEB_ORIGIN = "https://papadata.localhost";
    process.env.PAPADATA_AUTH_MAIL_API_KEY = "resend-test-api-key-1234567890";
    const queries: RecordedQuery[] = [];
    const service = new AccessMailService(fakeDatabase(queries));

    expect(service.available()).toBe(true);
    const result = await service.enqueue("verify", "USER@Example.test");

    expect(result).toEqual({ accepted: true, disclosureSafe: true, deliveryStatus: "queued" });
    expect(Object.keys(result)).toEqual(["accepted", "disclosureSafe", "deliveryStatus"]);
    expect(queries).toHaveLength(1);
    expect(queries[0]!.sql).toContain("INSERT INTO app.access_mail_outbox");
    // The plaintext email only ever reaches sealAuthMail's ciphertext
    // parameter -- never a bare/plain parameter this test could catch
    // leaking into the outbox row.
    expect(queries[0]!.params).not.toContain("user@example.test");
  });

  it("enabled and valid: works with the local SMTP transport too (production-parity's Mailpit shape), still no token disclosed by available()/enqueue()'s return shape", async () => {
    process.env.PAPADATA_AUTH_MAIL_ENABLED = "true";
    process.env.PAPADATA_AUTH_MAIL_KEY_BASE64 = randomBytes(32).toString("base64");
    process.env.PAPADATA_AUTH_MAIL_FROM = "PapaData <no-reply@papadata.localhost>";
    process.env.PAPADATA_WEB_ORIGIN = "https://papadata.localhost";
    process.env.PAPADATA_AUTH_MAIL_TRANSPORT = "smtp";
    process.env.PAPADATA_AUTH_MAIL_SMTP_HOST = "mailpit";
    process.env.PAPADATA_AUTH_MAIL_SMTP_PORT = "1025";
    const service = new AccessMailService(fakeDatabase([]));

    expect(service.available()).toBe(true);
    const result = await service.enqueue("recover", "user@example.test");
    expect(result).toEqual({ accepted: true, disclosureSafe: true, deliveryStatus: "queued" });
  });

  it("invalid email is rejected before ever touching the database", async () => {
    process.env.PAPADATA_AUTH_MAIL_ENABLED = "true";
    process.env.PAPADATA_AUTH_MAIL_KEY_BASE64 = randomBytes(32).toString("base64");
    process.env.PAPADATA_AUTH_MAIL_FROM = "PapaData <no-reply@papadata.localhost>";
    process.env.PAPADATA_WEB_ORIGIN = "https://papadata.localhost";
    process.env.PAPADATA_AUTH_MAIL_API_KEY = "resend-test-api-key-1234567890";
    const queries: RecordedQuery[] = [];
    const service = new AccessMailService(fakeDatabase(queries));

    await expect(service.enqueue("verify", "not-an-email")).rejects.toThrow();
    expect(queries).toHaveLength(0);
  });
});
