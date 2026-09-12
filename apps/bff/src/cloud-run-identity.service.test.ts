import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import type { BffConfig } from "./config.js";

function fakeConfig(overrides: Partial<BffConfig> = {}): BffConfig {
  return {
    metadataIdentityEndpoint: "http://identity-emulator.local/identity",
    upstreamIdentityAudience: null,
    upstreamTimeoutMs: 5_000,
    ...overrides,
  } as BffConfig;
}

function jwtWithExpiry(expiresAtSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expiresAtSeconds })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("CloudRunIdentityService.authorizationHeader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns null when upstream identity is not configured (disabled mode)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const service = new CloudRunIdentityService(fakeConfig({ upstreamIdentityAudience: null }));

    const header = await service.authorizationHeader();

    expect(header).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches a token from the metadata endpoint and returns it as a Bearer header when configured", async () => {
    const token = jwtWithExpiry(Math.floor(Date.now() / 1_000) + 3_600);
    const fetchSpy = vi.fn().mockResolvedValue(new Response(token, { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    const service = new CloudRunIdentityService(
      fakeConfig({ upstreamIdentityAudience: "https://api.example" }),
    );

    const header = await service.authorizationHeader();

    expect(header).toBe(`Bearer ${token}`);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(calledUrl.toString()).toContain("audience=https%3A%2F%2Fapi.example");
    expect(calledUrl.toString()).toContain("format=full");
    expect((calledInit.headers as Record<string, string>)["Metadata-Flavor"]).toBe("Google");
  });

  it("caches the token across calls until it is close to expiry", async () => {
    const token = jwtWithExpiry(Math.floor(Date.now() / 1_000) + 3_600);
    const fetchSpy = vi.fn().mockResolvedValue(new Response(token, { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    const service = new CloudRunIdentityService(
      fakeConfig({ upstreamIdentityAudience: "https://api.example" }),
    );

    await service.authorizationHeader();
    await service.authorizationHeader();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("refreshes the token once cached expiry is within 60 seconds", async () => {
    vi.useFakeTimers();
    const shortLived = jwtWithExpiry(Math.floor(Date.now() / 1_000) + 30);
    const refreshed = jwtWithExpiry(Math.floor(Date.now() / 1_000) + 3_600);
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(new Response(shortLived, { status: 200 }))
      .mockResolvedValueOnce(new Response(refreshed, { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    const service = new CloudRunIdentityService(
      fakeConfig({ upstreamIdentityAudience: "https://api.example" }),
    );

    const first = await service.authorizationHeader();
    const second = await service.authorizationHeader();

    expect(first).toBe(`Bearer ${shortLived}`);
    expect(second).toBe(`Bearer ${refreshed}`);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws when the metadata endpoint rejects the request (e.g. missing Metadata-Flavor emulation)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 }));
    vi.stubGlobal("fetch", fetchSpy);
    const service = new CloudRunIdentityService(
      fakeConfig({ upstreamIdentityAudience: "https://api.example" }),
    );

    await expect(service.authorizationHeader()).rejects.toThrow(/403/u);
  });

  it("aborts and throws when the metadata endpoint does not respond within upstreamTimeoutMs", async () => {
    const fetchSpy = vi.fn().mockImplementation((_url: URL, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    vi.stubGlobal("fetch", fetchSpy);
    const service = new CloudRunIdentityService(
      fakeConfig({ upstreamIdentityAudience: "https://api.example", upstreamTimeoutMs: 10 }),
    );

    await expect(service.authorizationHeader()).rejects.toThrow();
  });
});
