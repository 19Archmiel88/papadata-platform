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
import {
  OAuthAccessTokenProvider,
  type RefreshableOAuthCredential,
} from "../oauth.js";

export type GoogleAdsAdapterConfig = RefreshableOAuthCredential & {
  readonly customerId: string;
  readonly developerToken: string;
  readonly loginCustomerId?: string;
  readonly apiVersion?: string;
};

export class GoogleAdsAdapter implements IntegrationProviderAdapter {
  readonly providerId = "google_ads" as const;
  readonly requiredScopes = ["https://www.googleapis.com/auth/adwords"] as const;
  readonly optionalScopes = [] as const;

  private readonly config: GoogleAdsAdapterConfig | null;
  private readonly http: ProviderHttpClient;
  private readonly tokenProvider: OAuthAccessTokenProvider | null;

  constructor(
    config: GoogleAdsAdapterConfig | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.config = config;
    this.http = http;
    this.tokenProvider = config
      ? new OAuthAccessTokenProvider(config, http)
      : null;
  }

  isConfigured(): boolean {
    return Boolean(
      this.config?.customerId
      && this.config.developerToken
      && this.tokenProvider?.isConfigured(),
    );
  }

  async verifyConnection(): Promise<void> {
    await this.searchStream(
      "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1",
    );
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const requestedStreams = new Set(request.streams);
    if (
      !requestedStreams.has("ad_spend")
      && !requestedStreams.has("attributed_conversions")
    ) {
      return {
        records: [],
        nextCheckpoint: request.checkpoint,
        partial: false,
        limitations: [],
      };
    }

    const from = dateOnly(request.from ?? checkpointDate(request.checkpoint))
      ?? dateOnlyDaysAgo(30);
    const to = dateOnly(request.to) ?? dateOnly(new Date().toISOString()) ?? from;
    const query = [
      "SELECT",
      "segments.date,",
      "customer.id,",
      "customer.currency_code,",
      "campaign.id,",
      "campaign.name,",
      "campaign.status,",
      "ad_group.id,",
      "ad_group.name,",
      "ad_group.status,",
      "metrics.cost_micros,",
      "metrics.impressions,",
      "metrics.clicks,",
      "metrics.conversions,",
      "metrics.conversions_value",
      "FROM ad_group",
      `WHERE segments.date BETWEEN '${from}' AND '${to}'`,
      "ORDER BY segments.date ASC, campaign.id ASC, ad_group.id ASC",
    ].join(" ");
    const payload = await this.searchStream(query);
    const records: ProviderRecord[] = [];
    const observedAt = new Date().toISOString();

    for (const envelope of payload) {
      for (const result of readArrayField(envelope, "results")) {
        const date = nestedString(result, "segments", "date") ?? to;
        const campaignId = nestedString(result, "campaign", "id") ?? randomUUID();
        const adGroupId = nestedString(result, "adGroup", "id")
          ?? nestedString(result, "ad_group", "id")
          ?? "account";
        const externalId = `${campaignId}:${adGroupId}:${date}`;

        if (requestedStreams.has("ad_spend")) {
          records.push({
            externalId,
            observedAt,
            payload: result,
            stream: "ad_spend",
          });
        }
        if (requestedStreams.has("attributed_conversions")) {
          records.push({
            externalId,
            observedAt,
            payload: result,
            stream: "attributed_conversions",
          });
        }
      }
    }

    return {
      records,
      nextCheckpoint: JSON.stringify({ date: to }),
      partial: false,
      limitations: [],
    };
  }

  private async searchStream(query: string): Promise<readonly unknown[]> {
    if (!this.config || !this.tokenProvider) {
      throw new ProviderAdapterError(
        "Google Ads is not configured",
        "authentication",
      );
    }
    const token = await this.tokenProvider.getAccessToken();
    const customerId = digitsOnly(this.config.customerId);
    const apiVersion = normalizeApiVersion(this.config.apiVersion ?? "v25");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "developer-token": this.config.developerToken,
    };
    if (this.config.loginCustomerId) {
      headers["login-customer-id"] = digitsOnly(this.config.loginCustomerId);
    }
    const response = await this.http.requestJson<unknown>({
      body: JSON.stringify({ query }),
      headers,
      maxAttempts: 3,
      method: "POST",
      timeoutMs: 30_000,
      url: `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:searchStream`,
    });

    if (!Array.isArray(response.data)) {
      throw new ProviderAdapterError(
        "Google Ads returned an invalid SearchStream response",
        "validation",
      );
    }
    return response.data;
  }
}

function digitsOnly(value: string): string {
  const normalized = value.replace(/\D/gu, "");
  if (!normalized) {
    throw new ProviderAdapterError(
      "Google Ads customer ID is invalid",
      "validation",
    );
  }
  return normalized;
}

function normalizeApiVersion(value: string): string {
  if (!/^v\d+(?:\.\d+)?$/u.test(value)) {
    throw new ProviderAdapterError(
      "Google Ads API version is invalid",
      "validation",
    );
  }
  return value;
}

function nestedString(
  value: unknown,
  objectKey: string,
  fieldKey: string,
): string | null {
  if (!isRecord(value)) return null;
  return readStringField(value[objectKey], fieldKey);
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
