import { randomUUID } from "node:crypto";
import type {
  IntegrationProviderAdapter,
  ProviderFetchRequest,
  ProviderFetchResult,
  ProviderRecord,
} from "../provider-adapter.js";
import { ProviderAdapterError } from "../provider-adapter.js";
import {
  FetchProviderHttpClient,
  type ProviderHttpClient,
  isRecord,
  readArrayField,
  readNumberField,
  readStringField,
} from "../http.js";
import {
  OAuthAccessTokenProvider,
  type RefreshableOAuthCredential,
} from "../oauth.js";

export type AllegroAdapterConfig = RefreshableOAuthCredential & {
  readonly apiBaseUrl?: string;
  readonly marketplaceId?: string;
};

export class AllegroAdapter implements IntegrationProviderAdapter {
  readonly providerId = "allegro" as const;
  readonly requiredScopes = ["allegro:api:sale:orders:read"] as const;
  readonly optionalScopes = ["allegro:api:sale:offers:read"] as const;

  private readonly config: AllegroAdapterConfig | null;
  private readonly http: ProviderHttpClient;
  private readonly tokenProvider: OAuthAccessTokenProvider | null;

  constructor(
    config: AllegroAdapterConfig | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.config = config;
    this.http = http;
    this.tokenProvider = config
      ? new OAuthAccessTokenProvider(
          {
            ...config,
            tokenUri: config.tokenUri ?? "https://allegro.pl/auth/oauth/token",
          },
          http,
        )
      : null;
  }

  isConfigured(): boolean {
    return this.tokenProvider?.isConfigured() === true;
  }

  async verifyConnection(): Promise<void> {
    await this.requestJson("/me");
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const observedAt = new Date().toISOString();
    const records: ProviderRecord[] = [];
    const limitations = [
      "Allegro change delivery is implemented by cursor-based event polling because the public REST API exposes event journals rather than signed webhooks.",
    ];

    for (const stream of request.streams) {
      if (stream === "orders") {
        const orders = await this.fetchOffsetPages(
          "/order/checkout-forms",
          "checkoutForms",
          {
            "lineItems.boughtAt.gte": request.from,
            "lineItems.boughtAt.lte": request.to,
            sort: "+lineItems.boughtAt",
          },
          100,
        );
        records.push(...orders.map((order) => ({
          stream,
          externalId: readStringField(order, "id") ?? randomUUID(),
          observedAt,
          payload: order,
        })));
        continue;
      }

      if (stream === "products" || stream === "inventory") {
        const offers = await this.fetchOffsetPages(
          "/sale/offers",
          "offers",
          {
            "publication.marketplace": this.config?.marketplaceId ?? "allegro-pl",
            "publication.status": "ACTIVE",
          },
          1000,
        );
        records.push(...offers.map((offer) => ({
          stream,
          externalId: readStringField(offer, "id") ?? randomUUID(),
          observedAt,
          payload: offer,
        })));
        continue;
      }

      if (stream === "refunds") {
        const claims = await this.fetchOffsetPages(
          "/order/refund-claims",
          "refundClaims",
          {},
          100,
        );
        records.push(...claims.map((claim) => ({
          stream,
          externalId: readStringField(claim, "id") ?? randomUUID(),
          observedAt,
          payload: claim,
        })));
      }
    }

    const eventCursor = await this.fetchEventCursor(request.checkpoint);
    return {
      records,
      nextCheckpoint: eventCursor,
      partial: false,
      limitations,
    };
  }

  private async fetchEventCursor(checkpoint: string | null): Promise<string> {
    const query = new URLSearchParams({ limit: "1" });
    const cursor = readCheckpointEventId(checkpoint);
    if (cursor) query.set("from", cursor);
    const response = await this.requestJson(`/order/events?${query.toString()}`);
    const events = readArrayField(response, "events");
    const latest = events.at(-1);
    return JSON.stringify({
      eventId: readStringField(latest, "id") ?? cursor,
      observedAt: new Date().toISOString(),
    });
  }

  private async fetchOffsetPages(
    path: string,
    arrayKey: string,
    parameters: Readonly<Record<string, string | null>>,
    limit: number,
  ): Promise<readonly unknown[]> {
    const rows: unknown[] = [];
    let offset = 0;

    while (offset <= 10_000_000) {
      const query = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      for (const [key, value] of Object.entries(parameters)) {
        if (value) query.append(key, value);
      }
      const response = await this.requestJson(`${path}?${query.toString()}`);
      const page = readArrayField(response, arrayKey);
      rows.push(...page);
      const total = readNumberField(response, "totalCount", "total");
      offset += page.length;

      if (page.length === 0 || page.length < limit || (total !== null && offset >= total)) {
        break;
      }
    }

    return rows;
  }

  private async requestJson(path: string): Promise<unknown> {
    if (!this.config || !this.tokenProvider) {
      throw new ProviderAdapterError(
        "Allegro is not configured",
        "authentication",
      );
    }
    const token = await this.tokenProvider.getAccessToken();
    const base = normalizeAllegroBaseUrl(
      this.config.apiBaseUrl ?? "https://api.allegro.pl",
    );
    const result = await this.http.requestJson<unknown>({
      headers: {
        Accept: "application/vnd.allegro.public.v1+json",
        "Accept-Language": "pl-PL",
        Authorization: `Bearer ${token}`,
      },
      maxAttempts: 3,
      timeoutMs: 20_000,
      url: `${base}${path}`,
    });
    if (!isRecord(result.data)) {
      throw new ProviderAdapterError(
        "Allegro returned an invalid response",
        "validation",
      );
    }
    return result.data;
  }
}

function normalizeAllegroBaseUrl(value: string): string {
  const url = new URL(value);
  const allowedHosts = new Set(["api.allegro.pl", "api.allegro.pl.allegrosandbox.pl"]);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    throw new ProviderAdapterError(
      "Allegro API base URL is not allowed",
      "validation",
    );
  }
  return url.toString().replace(/\/$/u, "");
}

function readCheckpointEventId(checkpoint: string | null): string | null {
  if (!checkpoint) return null;
  try {
    const parsed = JSON.parse(checkpoint) as unknown;
    if (isRecord(parsed) && typeof parsed.eventId === "string") {
      return parsed.eventId;
    }
  } catch {
    return checkpoint.trim() || null;
  }
  return null;
}
