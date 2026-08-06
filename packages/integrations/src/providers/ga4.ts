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
import { OAuthAccessTokenProvider, type RefreshableOAuthCredential } from "../oauth.js";

export type Ga4AdapterConfig = RefreshableOAuthCredential & {
  readonly propertyId: string;
};

export class Ga4Adapter implements IntegrationProviderAdapter {
  readonly providerId = "ga4" as const;
  readonly requiredScopes = ["https://www.googleapis.com/auth/analytics.readonly"] as const;
  readonly optionalScopes = [] as const;

  private readonly config: Ga4AdapterConfig | null;
  private readonly http: ProviderHttpClient;
  private readonly tokenProvider: OAuthAccessTokenProvider | null;

  constructor(
    config: Ga4AdapterConfig | null,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.config = config;
    this.http = http;
    this.tokenProvider = config ? new OAuthAccessTokenProvider(config, http) : null;
  }

  isConfigured(): boolean {
    return Boolean(this.config?.propertyId && this.tokenProvider?.isConfigured());
  }

  async verifyConnection(): Promise<void> {
    await this.runReport({
      dateRanges: [{ startDate: "yesterday", endDate: "today" }],
      metrics: [{ name: "sessions" }],
      limit: "1",
    });
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const from = dateOnly(request.from ?? checkpointDate(request.checkpoint)) ?? "30daysAgo";
    const to = dateOnly(request.to) ?? "today";
    const observedAt = new Date().toISOString();
    const records: ProviderRecord[] = [];

    for (const stream of request.streams) {
      const report = await this.runReport(reportBody(stream, from, to));
      const rows = readArrayField(report, "rows");
      const dimensions = headerNames(report, "dimensionHeaders");
      const metrics = headerNames(report, "metricHeaders");
      for (const row of rows) {
        const payload = normalizeGa4Row(row, dimensions, metrics);
        const date = readStringField(payload, "date") ?? to;
        records.push({
          stream,
          externalId: `${stream}:${date}:${randomUUID()}`,
          observedAt,
          payload,
        });
      }
    }

    return {
      records,
      nextCheckpoint: JSON.stringify({ date: to === "today" ? observedAt.slice(0, 10) : to }),
      partial: false,
      limitations: [],
    };
  }

  private async runReport(body: object): Promise<Record<string, unknown>> {
    if (!this.config || !this.tokenProvider) {
      throw new ProviderAdapterError("GA4 is not configured", "authentication");
    }
    const token = await this.tokenProvider.getAccessToken();
    const propertyId = this.config.propertyId.replace(/^properties\//u, "");
    const response = await this.http.requestJson<unknown>({
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      maxAttempts: 4,
      method: "POST",
      timeoutMs: 30_000,
      url: `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    });
    if (!isRecord(response.data)) {
      throw new ProviderAdapterError("GA4 returned an invalid response", "validation");
    }
    return response.data;
  }
}

function reportBody(stream: string, from: string, to: string): object {
  const base = { dateRanges: [{ startDate: from, endDate: to }], limit: "100000" };
  if (stream === "events") {
    return { ...base, dimensions: [{ name: "date" }, { name: "eventName" }], metrics: [{ name: "eventCount" }, { name: "totalUsers" }] };
  }
  if (stream === "conversions") {
    return { ...base, dimensions: [{ name: "date" }, { name: "sessionSourceMedium" }], metrics: [{ name: "keyEvents" }, { name: "purchaseRevenue" }, { name: "transactions" }] };
  }
  return { ...base, dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "newUsers" }, { name: "engagedSessions" }] };
}

function headerNames(report: Record<string, unknown>, key: string): readonly string[] {
  return readArrayField(report, key).map((header) => readStringField(header, "name") ?? "unknown");
}

function normalizeGa4Row(
  row: unknown,
  dimensionNames: readonly string[],
  metricNames: readonly string[],
): Record<string, unknown> {
  if (!isRecord(row)) return { raw: row };
  const result: Record<string, unknown> = {};
  readArrayField(row, "dimensionValues").forEach((value, index) => {
    result[dimensionNames[index] ?? `dimension_${index}`] = readStringField(value, "value");
  });
  readArrayField(row, "metricValues").forEach((value, index) => {
    result[metricNames[index] ?? `metric_${index}`] = readStringField(value, "value");
  });
  return result;
}

function dateOnly(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) return value;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : null;
}

function checkpointDate(checkpoint: string | null): string | null {
  if (!checkpoint) return null;
  try {
    const parsed = JSON.parse(checkpoint) as unknown;
    return isRecord(parsed) ? readStringField(parsed, "date") : null;
  } catch {
    return checkpoint;
  }
}
