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
  readStringField,
} from "../http.js";

export type MetaAdsAdapterConfig = {
  readonly accessToken: string;
  readonly accountId: string;
  readonly apiVersion?: string;
};

export class MetaAdsAdapter implements IntegrationProviderAdapter {
  readonly providerId = "meta_ads" as const;
  readonly requiredScopes = ["ads_read"] as const;
  readonly optionalScopes = [] as const;

  private readonly config: MetaAdsAdapterConfig | null;
  private readonly http: ProviderHttpClient;

  constructor(
    config: MetaAdsAdapterConfig | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.config = config;
    this.http = http;
  }

  isConfigured(): boolean {
    return Boolean(this.config?.accessToken && normalizeAccountId(this.config.accountId));
  }

  async verifyConnection(): Promise<void> {
    if (!this.config) {
      throw new ProviderAdapterError("Meta Ads is not configured", "authentication");
    }
    await this.requestJson(
      `/act_${normalizeAccountId(this.config.accountId)}?fields=id,name,account_status,currency`,
    );
  }

  /**
   * Real page-level resumability (see WooCommerceAdapter.fetch's doc
   * comment for the full rationale). Unlike every other multi-stream
   * provider here, ad_spend and attributed_conversions are not
   * independently paginated at all -- both are just two projections of the
   * same /insights page -- so there is no per-stream index to track, only
   * Graph API's own `paging.next` URL, carried straight through as the
   * resume cursor.
   */
  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    if (!this.config) {
      throw new ProviderAdapterError("Meta Ads is not configured", "authentication");
    }
    const requestedStreams = new Set(request.streams);
    if (
      !requestedStreams.has("ad_spend")
      && !requestedStreams.has("attributed_conversions")
      && !requestedStreams.has("ad_creative_performance")
    ) {
      return {
        records: [],
        nextCheckpoint: request.checkpoint,
        nextPageCursor: null,
        partial: false,
        limitations: [],
      };
    }

    const from = dateOnly(request.from ?? checkpointDate(request.checkpoint))
      ?? dateOnlyDaysAgo(30);
    const to = dateOnly(request.to) ?? new Date().toISOString().slice(0, 10);
    const accountId = normalizeAccountId(this.config.accountId);
    const query = new URLSearchParams({
      access_token: this.config.accessToken,
      fields: [
        "date_start",
        "date_stop",
        "account_id",
        "account_currency",
        "campaign_id",
        "campaign_name",
        "campaign_status",
        "adset_id",
        "adset_name",
        "adset_status",
        "ad_id",
        "ad_name",
        "ad_status",
        "reach",
        "impressions",
        "clicks",
        "spend",
        "actions",
        "action_values",
        "video_play_actions",
        "cost_per_action_type",
      ].join(","),
      level: "ad",
      limit: "500",
      time_increment: "1",
      time_range: JSON.stringify({ since: from, until: to }),
    });

    const url = request.pageCursor ?? `/act_${accountId}/insights?${query.toString()}`;
    const response = await this.requestJson(url);
    const rows = readArrayField(response, "data");
    const nextPageCursor = readPagingNext(response);
    const observedAt = new Date().toISOString();
    const records: ProviderRecord[] = [];

    for (const row of rows) {
      const date = readStringField(row, "date_start") ?? to;
      const campaignId = readStringField(row, "campaign_id") ?? randomUUID();
      const adSetId = readStringField(row, "adset_id") ?? "account";
      const adId = readStringField(row, "ad_id") ?? "aggregate";
      const externalId = `${campaignId}:${adSetId}:${adId}:${date}`;
      if (requestedStreams.has("ad_creative_performance")) {
        records.push({ externalId, observedAt, payload: row, stream: "ad_creative_performance" });
      }
      if (requestedStreams.has("ad_spend")) {
        records.push({
          externalId,
          observedAt,
          payload: row,
          stream: "ad_spend",
        });
      }
      if (requestedStreams.has("attributed_conversions")) {
        records.push({
          externalId,
          observedAt,
          payload: row,
          stream: "attributed_conversions",
        });
      }
    }

    return {
      records,
      nextCheckpoint: nextPageCursor === null ? JSON.stringify({ date: to }) : request.checkpoint,
      nextPageCursor,
      partial: false,
      limitations: [],
    };
  }

  private async requestJson(pathOrUrl: string): Promise<unknown> {
    if (!this.config) {
      throw new ProviderAdapterError("Meta Ads is not configured", "authentication");
    }
    const apiVersion = normalizeApiVersion(this.config.apiVersion ?? "v25.0");
    const url = pathOrUrl.startsWith("https://")
      ? assertMetaUrl(pathOrUrl)
      : `https://graph.facebook.com/${apiVersion}${pathOrUrl}`;
    const response = await this.http.requestJson<unknown>({
      headers: { Accept: "application/json" },
      maxAttempts: 3,
      timeoutMs: 30_000,
      url,
    });
    if (!isRecord(response.data)) {
      throw new ProviderAdapterError(
        "Meta Ads returned an invalid response",
        "validation",
      );
    }
    return response.data;
  }
}

function readPagingNext(value: unknown): string | null {
  if (!isRecord(value) || !isRecord(value.paging)) return null;
  const next = value.paging.next;
  return typeof next === "string" && next.startsWith("https://graph.facebook.com/")
    ? next
    : null;
}

function assertMetaUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "graph.facebook.com") {
    throw new ProviderAdapterError("Meta pagination URL is invalid", "validation");
  }
  return url.toString();
}

function normalizeAccountId(value: string): string {
  return value.trim().replace(/^act_/iu, "").replace(/\D/gu, "");
}

function normalizeApiVersion(value: string): string {
  const match = /^v?(\d+)(?:\.(\d+))?$/iu.exec(value.trim());
  if (!match) {
    throw new ProviderAdapterError("Meta API version is invalid", "validation");
  }
  return `v${match[1]}.${match[2] ?? "0"}`;
}

function dateOnly(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? parsed.toISOString().slice(0, 10)
    : null;
}

function dateOnlyDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function checkpointDate(checkpoint: string | null): string | null {
  if (!checkpoint) return null;
  try {
    const parsed = JSON.parse(checkpoint) as unknown;
    return isRecord(parsed) && typeof parsed.date === "string"
      ? parsed.date
      : null;
  } catch {
    return checkpoint;
  }
}
