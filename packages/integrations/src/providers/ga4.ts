import { createHash } from "node:crypto";
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
    if (request.streams.length === 0 || request.streams.some(stream => !GA4_STREAMS.includes(stream))) {
      throw new ProviderAdapterError("GA4 received an unsupported or empty stream list", "validation");
    }
    // One response is one durable page. A resume cursor pins both dates and
    // stream order; it must never silently restart at offset zero.
    const signature = createHash("sha256").update(JSON.stringify({
      propertyId: this.config?.propertyId, streams: request.streams,
      from: request.from, to: request.to, checkpoint: request.checkpoint,
    })).digest("hex");
    let cursor: ReportCursor;
    if (request.pageCursor) {
      cursor = parseCursor(request.pageCursor, signature, request.streams.length);
    } else {
      let from = dateOnly(request.from ?? checkpointDate(request.checkpoint));
      let to = dateOnly(request.to);
      if (!from || !to) {
        // Relative dates are defined by the property timezone, not the worker
        // timezone. Resolve once and persist the absolute dates in the cursor.
        const probe = await this.runReport({ dateRanges: [{ startDate: "yesterday", endDate: "today" }], metrics: [{ name: "sessions" }], limit: "1" });
        const metadata = isRecord(probe.metadata) ? probe.metadata : {};
        const timezone = readStringField(metadata, "timeZone");
        if (!timezone) throw new ProviderAdapterError("GA4 did not return the property timezone", "validation");
        const today = calendarDate(new Date(), timezone);
        to ??= today;
        from ??= new Date(Date.parse(`${today}T00:00:00Z`) - 30 * 86400000).toISOString().slice(0, 10);
      }
      if (from > to) throw new ProviderAdapterError("GA4 date range is reversed", "validation");
      cursor = { version: 1, signature, from, to, streamIndex: 0, offset: 0 };
    }
    const stream = request.streams[cursor.streamIndex]!;
    const report = await this.runReport(reportBody(stream, cursor.from, cursor.to, cursor.offset));
    const rows = readArrayField(report, "rows");
    const dimensions = headerNames(report, "dimensionHeaders");
    const metrics = headerNames(report, "metricHeaders");
    const metadata = isRecord(report.metadata) ? report.metadata : {};
    const observedAt = new Date().toISOString();
    const rowCount = typeof report.rowCount === "number" ? report.rowCount : null;
    if (rowCount === null || !Number.isSafeInteger(rowCount) || rowCount < 0
      || (rows.length === 0 && rowCount > cursor.offset)) {
      throw new ProviderAdapterError("GA4 returned invalid pagination metadata", "validation");
    }
    const limitations: string[] = [];
    if (metadata.subjectToThresholding === true) limitations.push("GA4 privacy thresholding applies; missing rows are not zero.");
    if (metadata.dataLossFromOtherRow === true) limitations.push("GA4 grouped high-cardinality rows into (other).");
    if (Array.isArray(metadata.samplingMetadatas) && metadata.samplingMetadatas.length > 0) limitations.push("GA4 returned sampled data.");
    const records: ProviderRecord[] = rows.map(row => {
      const payload = normalizeGa4Row(row, dimensions, metrics);
      return {
        stream, externalId: deterministicExternalId(stream, dimensions, payload), observedAt,
        payload: { ...payload, currencyCode: readStringField(metadata, "currencyCode"),
          propertyTimezone: readStringField(metadata, "timeZone"), propertyId: this.config?.propertyId,
          reportDimensions: dimensions, reportLimitations: limitations,
          subjectToThresholding: metadata.subjectToThresholding === true,
          dataLossFromOtherRow: metadata.dataLossFromOtherRow === true,
          sampled: Array.isArray(metadata.samplingMetadatas) && metadata.samplingMetadatas.length > 0 },
      };
    });
    const nextOffset = cursor.offset + rows.length;
    const next: ReportCursor | null = nextOffset < rowCount
      ? { ...cursor, offset: nextOffset }
      : cursor.streamIndex + 1 < request.streams.length
        ? { ...cursor, streamIndex: cursor.streamIndex + 1, offset: 0 } : null;
    return { records, nextCheckpoint: next ? null : JSON.stringify({ date: cursor.to }),
      nextPageCursor: next ? JSON.stringify(next) : null, partial: false, limitations };
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

const GA4_STREAMS: readonly string[] = ["traffic", "events", "conversions", "traffic_breakdown", "event_breakdown"];
const PAGE_SIZE = 100000;
type ReportCursor = { version: 1; signature: string; from: string; to: string; streamIndex: number; offset: number };
function parseCursor(raw: string, signature: string, streamCount: number): ReportCursor {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new ProviderAdapterError("Invalid GA4 resume cursor", "validation"); }
  if (!isRecord(value) || value.version !== 1 || value.signature !== signature
    || typeof value.from !== "string" || dateOnly(value.from) !== value.from
    || typeof value.to !== "string" || dateOnly(value.to) !== value.to || value.from > value.to
    || typeof value.streamIndex !== "number" || !Number.isSafeInteger(value.streamIndex) || value.streamIndex < 0 || value.streamIndex >= streamCount
    || typeof value.offset !== "number" || !Number.isSafeInteger(value.offset) || value.offset < 0) {
    throw new ProviderAdapterError("GA4 cursor does not match the requested report", "validation");
  }
  return value as ReportCursor;
}
function calendarDate(now: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const get = (key: string) => parts.find(part => part.type === key)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch { throw new ProviderAdapterError("GA4 returned an invalid property timezone", "validation"); }
}
function reportBody(stream: string, from: string, to: string, offset = 0): object {
  const isEvent = stream === "events" || stream === "event_breakdown";
  // Old stream dimensions and IDs are unchanged. The new grain lives in
  // separate streams so a backfill cannot double count old and new totals.
  const dimensions = isEvent
    ? ["date", "eventName", ...(stream === "event_breakdown" ? ["sessionDefaultChannelGroup", "deviceCategory", "country"] : [])]
    : stream === "conversions" ? ["date", "sessionDefaultChannelGroup", "sessionSourceMedium"]
      : ["date", "sessionDefaultChannelGroup", "landingPagePlusQueryString", ...(stream === "traffic_breakdown" ? ["deviceCategory", "country"] : [])];
  const metrics = isEvent ? ["eventCount", "totalUsers"]
    : stream === "conversions" ? ["keyEvents", "purchaseRevenue", "transactions"]
      : ["sessions", "totalUsers", "newUsers", "engagedSessions", "keyEvents", "purchaseRevenue", "transactions"];
  return { dateRanges: [{ startDate: from, endDate: to }], limit: String(PAGE_SIZE), offset: String(offset),
    dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })),
    orderBys: dimensions.map(dimensionName => ({ dimension: { dimensionName }, desc: false })) };
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

function deterministicExternalId(
  stream: string,
  dimensions: readonly string[],
  payload: Readonly<Record<string, unknown>>,
): string {
  // Identity is defined by report dimensions, never by metrics. Late GA4
  // updates can change sessions/revenue for the same dimensional row; using
  // metric values in the id would insert a second canonical row instead of
  // updating the existing source record.
  const identity = Object.fromEntries(
    dimensions.map((dimension) => [dimension, payload[dimension] ?? null]),
  );
  const fingerprint = createHash("sha256")
    .update(stableJson(identity))
    .digest("hex")
    .slice(0, 24);
  return `${stream}:${fingerprint}`;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
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
