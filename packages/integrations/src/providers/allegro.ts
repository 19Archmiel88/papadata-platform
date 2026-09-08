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

  /**
   * Real page-level resumability (see WooCommerceAdapter.fetch's doc
   * comment for the full rationale) -- one call fetches exactly one page of
   * exactly one stream. Allegro's offset/limit pagination maps the resume
   * cursor to {streamIndex, offset}, mirroring WooCommerce's {streamIndex,
   * page} for the same reason (a single sync request commonly asks for
   * multiple streams together -- see AUTO_SYNC_PROVIDER_STREAMS).
   *
   * The event-cursor lookup (fetchEventCursor) costs its own real API call,
   * so it only runs once this is genuinely the last page of the last
   * stream -- a page result that will keep looping never needs a
   * nextCheckpoint value, since persistFetchedPage only writes it on the
   * final page (see DurableIngestionPipeline.run).
   */
  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const observedAt = new Date().toISOString();
    const limitations = [
      "Allegro change delivery is implemented by cursor-based event polling because the public REST API exposes event journals rather than signed webhooks.",
    ];
    const cursor = parseAllegroPageCursor(request.pageCursor);
    const streamIndex = cursor?.streamIndex ?? 0;
    const offset = cursor?.offset ?? 0;
    const stream = request.streams[streamIndex];

    if (stream === undefined) {
      return {
        records: [],
        nextCheckpoint: await this.fetchEventCursor(request.checkpoint),
        nextPageCursor: null,
        partial: false,
        limitations,
      };
    }

    const records: ProviderRecord[] = [];
    let page: { readonly rows: readonly unknown[]; readonly hasMore: boolean };

    if (stream === "orders") {
      page = await this.fetchOffsetPage(
        "/order/checkout-forms",
        "checkoutForms",
        {
          "lineItems.boughtAt.gte": request.from,
          "lineItems.boughtAt.lte": request.to,
          sort: "+lineItems.boughtAt",
        },
        100,
        offset,
      );
      records.push(...page.rows.map((order) => ({
        stream,
        externalId: readStringField(order, "id") ?? randomUUID(),
        observedAt,
        payload: order,
      })));
    } else if (stream === "products" || stream === "inventory") {
      page = await this.fetchOffsetPage(
        "/sale/offers",
        "offers",
        {
          "publication.marketplace": this.config?.marketplaceId ?? "allegro-pl",
          "publication.status": "ACTIVE",
        },
        1000,
        offset,
      );
      records.push(...page.rows.map((offer) => ({
        stream,
        externalId: readStringField(offer, "id") ?? randomUUID(),
        observedAt,
        payload: offer,
      })));
    } else if (stream === "refunds") {
      page = await this.fetchOffsetPage("/order/refund-claims", "refundClaims", {}, 100, offset);
      records.push(...page.rows.map((claim) => ({
        stream,
        externalId: readStringField(claim, "id") ?? randomUUID(),
        observedAt,
        payload: claim,
      })));
    } else {
      page = { rows: [], hasMore: false };
    }

    const nextStreamIndex = streamIndex + 1;
    const nextPageCursor = page.hasMore
      ? serializeAllegroPageCursor({ streamIndex, offset: offset + page.rows.length })
      : nextStreamIndex < request.streams.length
        ? serializeAllegroPageCursor({ streamIndex: nextStreamIndex, offset: 0 })
        : null;
    const nextCheckpoint = nextPageCursor === null
      ? await this.fetchEventCursor(request.checkpoint)
      : request.checkpoint;

    return {
      records,
      nextCheckpoint,
      nextPageCursor,
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

  private async fetchOffsetPage(
    path: string,
    arrayKey: string,
    parameters: Readonly<Record<string, string | null>>,
    limit: number,
    offset: number,
  ): Promise<{ readonly rows: readonly unknown[]; readonly hasMore: boolean }> {
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    for (const [key, value] of Object.entries(parameters)) {
      if (value) query.append(key, value);
    }
    const response = await this.requestJson(`${path}?${query.toString()}`);
    const rows = readArrayField(response, arrayKey);
    const total = readNumberField(response, "totalCount", "total");
    const hasMore = rows.length > 0
      && rows.length >= limit
      && !(total !== null && offset + rows.length >= total);

    return { rows, hasMore };
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

type AllegroPageCursor = {
  readonly streamIndex: number;
  readonly offset: number;
};

function parseAllegroPageCursor(cursor: string | null): AllegroPageCursor | null {
  if (!cursor) return null;
  try {
    const value = JSON.parse(cursor) as unknown;
    if (
      isRecord(value)
      && typeof value.streamIndex === "number"
      && typeof value.offset === "number"
      && Number.isInteger(value.streamIndex)
      && Number.isInteger(value.offset)
      && value.streamIndex >= 0
      && value.offset >= 0
    ) {
      return { streamIndex: value.streamIndex, offset: value.offset };
    }
  } catch {
    // fall through to null
  }
  return null;
}

function serializeAllegroPageCursor(cursor: AllegroPageCursor): string {
  return JSON.stringify(cursor);
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
