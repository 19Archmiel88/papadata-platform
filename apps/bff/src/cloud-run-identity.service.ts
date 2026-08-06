import { Inject, Injectable } from "@nestjs/common";
import type { BffConfig } from "./config.js";
import { BFF_CONFIG } from "./tokens.js";

type CachedToken = {
  readonly value: string;
  readonly expiresAtMs: number;
};

@Injectable()
export class CloudRunIdentityService {
  private cached: CachedToken | null = null;
  private refreshPromise: Promise<CachedToken> | null = null;

  constructor(@Inject(BFF_CONFIG) private readonly config: BffConfig) {}

  async authorizationHeader(): Promise<string | null> {
    if (!this.config.upstreamIdentityAudience) return null;
    const token = await this.getToken();
    return `Bearer ${token}`;
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    if (this.cached && this.cached.expiresAtMs - now > 60_000) {
      return this.cached.value;
    }

    this.refreshPromise ??= this.fetchToken().finally(() => {
      this.refreshPromise = null;
    });
    this.cached = await this.refreshPromise;
    return this.cached.value;
  }

  private async fetchToken(): Promise<CachedToken> {
    const audience = this.config.upstreamIdentityAudience;
    if (!audience) throw new Error("Cloud Run identity audience is not configured.");

    const endpoint = new URL(this.config.metadataIdentityEndpoint);
    endpoint.searchParams.set("audience", audience);
    endpoint.searchParams.set("format", "full");

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort("metadata_timeout"),
      this.config.upstreamTimeoutMs,
    );
    try {
      const response = await fetch(endpoint, {
        headers: { "Metadata-Flavor": "Google" },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Identity metadata request failed: ${response.status}`);
      }
      const token = (await response.text()).trim();
      const expiresAtMs = readJwtExpiry(token) ?? Date.now() + 5 * 60_000;
      return { value: token, expiresAtMs };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function readJwtExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8"),
    ) as { exp?: unknown };
    return typeof parsed.exp === "number" && Number.isFinite(parsed.exp)
      ? parsed.exp * 1_000
      : null;
  } catch {
    return null;
  }
}
