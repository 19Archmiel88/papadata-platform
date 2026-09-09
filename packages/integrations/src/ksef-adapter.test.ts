import { describe, expect, it } from "vitest";
import { KsefAdapter, readKsefConfig } from "./ksef-adapter.js";

const CREATED_AT = "2026-09-09T10:00:00.000Z";
const minutesAfter = (minutes: number): Date => new Date(Date.parse(CREATED_AT) + minutes * 60_000);

describe("readKsefConfig", () => {
  it("defaults to demo mode when KSEF_ENV is unset", () => {
    expect(readKsefConfig({}).env).toBe("demo");
  });

  it("defaults to demo mode for any KSEF_ENV value other than the literal 'production'", () => {
    expect(readKsefConfig({ KSEF_ENV: "Production" } as unknown as NodeJS.ProcessEnv).env).toBe("demo");
  });

  it("switches to production mode only for the exact string 'production'", () => {
    expect(readKsefConfig({ KSEF_ENV: "production" } as unknown as NodeJS.ProcessEnv).env).toBe("production");
  });

  it("never throws on a malformed KSEF_BASE_URL, and treats it as not configured", () => {
    const config = readKsefConfig({ KSEF_ENV: "production", KSEF_BASE_URL: "not-a-url" } as unknown as NodeJS.ProcessEnv);
    expect(config.baseUrl).toBeNull();
  });

  it("rejects a non-HTTPS KSEF_BASE_URL the same way (treated as not configured, not thrown)", () => {
    const config = readKsefConfig({ KSEF_ENV: "production", KSEF_BASE_URL: "http://ksef-test.mf.gov.pl" } as unknown as NodeJS.ProcessEnv);
    expect(config.baseUrl).toBeNull();
  });

  it("normalizes a valid HTTPS KSEF_BASE_URL (origin + path, trailing slash stripped)", () => {
    const config = readKsefConfig({ KSEF_ENV: "production", KSEF_BASE_URL: "https://ksef-test.mf.gov.pl/api/" } as unknown as NodeJS.ProcessEnv);
    expect(config.baseUrl).toBe("https://ksef-test.mf.gov.pl/api");
  });

  it("defaults timeoutMs to 30000 and retryPolicy to 'exponential'", () => {
    const config = readKsefConfig({});
    expect(config.timeoutMs).toBe(30_000);
    expect(config.retryPolicy).toBe("exponential");
  });

  it("honours an explicit KSEF_RETRY_POLICY=none", () => {
    expect(readKsefConfig({ KSEF_RETRY_POLICY: "none" } as unknown as NodeJS.ProcessEnv).retryPolicy).toBe("none");
  });
});

describe("KsefAdapter demo mode -- deterministic lifecycle simulation", () => {
  const demoAdapter = new KsefAdapter(readKsefConfig({ KSEF_ENV: "demo" } as unknown as NodeJS.ProcessEnv));

  it("is deterministic: the same invoice id + createdAt + now always yields the same reference", async () => {
    const first = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(6));
    const second = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(6));
    expect(first).toEqual(second);
  });

  it("starts at 'draft' with no KSeF number, immediately after creation", async () => {
    const result = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(0));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.reference.status).toBe("draft");
    expect(result.reference.ksefNumber).toBeNull();
    expect(result.reference.submittedAt).toBeNull();
    expect(result.reference.acceptedAt).toBeNull();
    expect(result.reference.upoReference).toBeNull();
  });

  it("reaches 'ready_for_ksef' after 2 minutes but before 5", async () => {
    const result = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(3));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.reference.status).toBe("ready_for_ksef");
    expect(result.reference.ksefNumber).toBeNull();
  });

  it("reaches 'submitted' with a demo KSeF number after 5 minutes but before 10", async () => {
    const result = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(6));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.reference.status).toBe("submitted");
    expect(result.reference.ksefNumber).toMatch(/^DEMO-KSEF-/);
    expect(result.reference.submittedAt).toBe(new Date(Date.parse(CREATED_AT) + 5 * 60_000).toISOString());
    expect(result.reference.acceptedAt).toBeNull();
    expect(result.reference.upoReference).toBeNull();
  });

  it("reaches 'accepted' with a demo UPO reference after 10 minutes", async () => {
    const result = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(15));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.reference.status).toBe("accepted");
    expect(result.reference.ksefNumber).toMatch(/^DEMO-KSEF-/);
    expect(result.reference.upoReference).toMatch(/^DEMO-UPO-/);
    expect(result.reference.acceptedAt).toBe(new Date(Date.parse(CREATED_AT) + 10 * 60_000).toISOString());
  });

  it("never fabricates rejected/offline_pending/correction_required -- only the happy path is simulated", async () => {
    const statuses = await Promise.all(
      [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 1440].map(async (minutes) => {
        const result = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: CREATED_AT }, minutesAfter(minutes));
        if (!result.ok) throw new Error("unreachable");
        return result.reference.status;
      }),
    );
    for (const status of statuses) expect(["draft", "ready_for_ksef", "submitted", "accepted"]).toContain(status);
  });

  it("derives a different KSeF/UPO reference for a different invoice id (not a single global constant)", async () => {
    const first = await demoAdapter.statusFor({ localInvoiceId: "in_demoA", createdAt: CREATED_AT }, minutesAfter(15));
    const second = await demoAdapter.statusFor({ localInvoiceId: "in_demoB", createdAt: CREATED_AT }, minutesAfter(15));
    if (!first.ok || !second.ok) throw new Error("unreachable");
    expect(first.reference.ksefNumber).not.toBe(second.reference.ksefNumber);
    expect(first.reference.upoReference).not.toBe(second.reference.upoReference);
  });

  it("falls back to 'draft' rather than throwing when createdAt cannot be parsed", async () => {
    const result = await demoAdapter.statusFor({ localInvoiceId: "in_demo1", createdAt: "" }, minutesAfter(15));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.reference.status).toBe("draft");
  });
});

describe("KsefAdapter production mode -- not implemented in this session", () => {
  it("reports 'not_connected' when KSEF_BASE_URL/KSEF_CERTIFICATE_REF are missing", async () => {
    const adapter = new KsefAdapter(readKsefConfig({ KSEF_ENV: "production" } as unknown as NodeJS.ProcessEnv));
    const result = await adapter.statusFor({ localInvoiceId: "in_prod1", createdAt: CREATED_AT });
    expect(result).toEqual({ ok: false, code: "not_connected", message: expect.any(String) });
  });

  it("reports 'not_implemented' (never a fabricated success) once base URL and certificate are both configured", async () => {
    const adapter = new KsefAdapter(
      readKsefConfig({
        KSEF_ENV: "production",
        KSEF_BASE_URL: "https://ksef.mf.gov.pl",
        KSEF_CERTIFICATE_REF: "arn:demo:cert/example",
      } as unknown as NodeJS.ProcessEnv),
    );
    const result = await adapter.statusFor({ localInvoiceId: "in_prod1", createdAt: CREATED_AT });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.code).toBe("not_implemented");
  });
});
