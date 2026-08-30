import { createHash } from "node:crypto";
import type { IsoDateTime } from "@papadata/contracts";
import { isRevenueQualifyingStatus } from "../../metrics/metricEngineCore.ts";
import {
  dedupeGa4CanonicalRows,
  readEntity,
  readEntityNumber,
  readEntityString,
  readRowString,
  type CommandCenterDataSource,
} from "./command-center-metrics.real-source.ts";
import {
  resolveMetricWindow,
  type CommandCenterDateRangeInput,
} from "./command-center-metrics.contract-data.ts";

export type TrafficDataSource = Pick<CommandCenterDataSource, "listCanonicalRecords">;

export type RealTrafficRecord = {
  readonly channel: string;
  readonly conversionRate: number;
  readonly conversions: number;
  readonly dimensionKey: string;
  readonly eventQuality: number | null;
  readonly landingPage: string | null;
  readonly revenue: { readonly amount: number; readonly currency: string };
  readonly sessions: number;
  readonly users: number;
};

export type TrafficSummaryRecord = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: IsoDateTime;
  readonly warning: number;
};

export type TrafficDiagnosticFinding = {
  readonly code: string;
  readonly findingId: string;
  readonly message: string;
  readonly severity: "error" | "info" | "warning";
  readonly sourceRef: string | null;
};

export type TrafficFunnelStep = {
  readonly completions: number;
  readonly conversionRate: number;
  readonly entrants: number;
  readonly label: string;
  readonly stepId: string;
};

export type TrafficFilters = {
  readonly search?: string | null;
  readonly source?: readonly string[] | null;
  readonly status?: readonly string[] | null;
};

export type TrafficPageRequest = {
  readonly cursor?: string | null;
  readonly limit?: number | null;
};

export type TrafficReadResult = {
  readonly diagnostics: readonly TrafficDiagnosticFinding[];
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number | null };
  readonly records: readonly RealTrafficRecord[];
  readonly steps: readonly TrafficFunnelStep[];
  readonly summary: TrafficSummaryRecord;
};

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;
const UNKNOWN_CURRENCY = "XXX";

const FUNNEL_STAGES = [
  { eventName: "session_start", label: "Sesja → widok produktu", stepId: "session_start" },
  { eventName: "view_item", label: "Widok produktu → dodanie do koszyka", stepId: "view_item" },
  { eventName: "add_to_cart", label: "Koszyk → rozpoczęcie checkoutu", stepId: "add_to_cart" },
  { eventName: "begin_checkout", label: "Checkout → zakup", stepId: "begin_checkout" },
  { eventName: "purchase", label: "Zakup", stepId: "purchase" },
] as const;

type TrafficBucket = {
  channel: string;
  conversions: number;
  currency: string;
  landingPage: string | null;
  qualityScoreTotal: number;
  qualitySamples: number;
  revenue: number;
  sessions: number;
  users: number;
};

type CanonicalRow = Record<string, unknown>;

export async function fetchTrafficAnalytics(options: {
  readonly dataSource: TrafficDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly filters?: TrafficFilters | null;
  readonly generatedAt: string;
  readonly operationId: string;
  readonly page?: TrafficPageRequest | null;
  readonly stepId?: string | null;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<TrafficReadResult> {
  const {
    dataSource,
    dateRange,
    filters,
    generatedAt,
    operationId,
    page,
    stepId,
    tenantId,
    workspaceId,
  } = options;
  const window = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);
  const streams = operationId === "traffic.ga4-orders.read"
    ? ["traffic", "events", "orders"]
    : ["traffic", "events"];
  const rows = await dataSource.listCanonicalRecords(tenantId, workspaceId, {
    businessTimeFrom: window.periodStart,
    businessTimeTo: window.periodEnd,
    streams,
  });

  const trafficRows = dedupeGa4CanonicalRows(rows, "traffic");
  const eventRows = dedupeGa4CanonicalRows(rows, "events");
  const records = operationId === "traffic.ga4-orders.read"
    ? buildGa4OrdersComparison(trafficRows, rows)
    : operationId === "traffic.landing-pages.read"
      ? aggregateTrafficRows(trafficRows, "landing-page")
      : aggregateTrafficRows(trafficRows, "channel");
  const filtered = records.filter((record) => matchesFilters(record, filters));
  const allSteps = buildFunnelSteps(eventRows);
  const steps = operationId === "traffic.funnel-step.read" && stepId
    ? allSteps.filter((entry) => entry.stepId === stepId)
    : allSteps;
  const diagnostics = buildTrafficDiagnostics(trafficRows, eventRows, allSteps);
  const limit = clampLimit(page?.limit);
  const offset = decodeCursor(page?.cursor);
  const pageRecords = filtered.slice(offset, offset + limit);
  const nextOffset = offset + pageRecords.length;

  return {
    diagnostics,
    pageInfo: {
      nextCursor: nextOffset < filtered.length ? encodeCursor(nextOffset) : null,
      total: filtered.length,
    },
    records: pageRecords,
    steps,
    summary: summarizeTraffic(
      operationId === "traffic.ga4-orders.read"
        ? filtered.filter((record) => !record.dimensionKey.startsWith("canonical-orders:"))
        : filtered,
      generatedAt,
    ),
  };
}

function aggregateTrafficRows(
  rows: readonly CanonicalRow[],
  dimension: "channel" | "landing-page",
): readonly RealTrafficRecord[] {
  const buckets = new Map<string, TrafficBucket>();

  for (const row of rows) {
    const entity = readEntity(row.canonical_payload);
    const channel = readEntityString(entity, "channel")
      ?? readEntityString(entity, "source")
      ?? "Nieprzypisany";
    const landingPage = readEntityString(entity, "landingPage");
    const key = dimension === "landing-page"
      ? `${channel}:${landingPage ?? "(not-set)"}`
      : channel;
    const bucket = buckets.get(key) ?? {
      channel,
      conversions: 0,
      currency: readEntityString(entity, "currency") ?? UNKNOWN_CURRENCY,
      landingPage: dimension === "landing-page" ? landingPage : null,
      qualityScoreTotal: 0,
      qualitySamples: 0,
      revenue: 0,
      sessions: 0,
      users: 0,
    };

    bucket.sessions += nonNegative(readEntityNumber(entity, "sessions"));
    bucket.users += nonNegative(readEntityNumber(entity, "users"));
    bucket.conversions += nonNegative(
      readEntityNumber(entity, "transactions") ?? readEntityNumber(entity, "conversions"),
    );
    bucket.revenue += nonNegative(readEntityNumber(entity, "revenue"));
    const quality = canonicalQualityScore(row.canonical_payload);
    if (quality !== null) {
      bucket.qualityScoreTotal += quality;
      bucket.qualitySamples += 1;
    }
    const rowCurrency = readEntityString(entity, "currency");
    if (rowCurrency && bucket.currency !== UNKNOWN_CURRENCY && bucket.currency !== rowCurrency) {
      // Never merge monetary values from different currencies under a false
      // currency label. GA4 usually omits property currency from report rows;
      // XXX explicitly means "currency unavailable/not applicable".
      bucket.currency = UNKNOWN_CURRENCY;
      bucket.revenue = 0;
    }
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([key, bucket]) => toTrafficRecord(key, bucket))
    .sort((a, b) => b.sessions - a.sessions);
}

function buildGa4OrdersComparison(
  trafficRows: readonly CanonicalRow[],
  allRows: readonly CanonicalRow[],
): readonly RealTrafficRecord[] {
  const ga4 = aggregateTrafficRows(trafficRows, "channel");
  const orderBuckets = new Map<string, { orders: number; revenue: number }>();

  for (const row of allRows) {
    if (readRowString(row.stream) !== "orders") continue;
    const entity = readEntity(row.canonical_payload);
    const grossAmount = readEntityNumber(entity, "grossAmount");
    const currency = readEntityString(entity, "currency");
    const status = readEntityString(entity, "status");
    if (grossAmount === null || !currency || !isRevenueQualifyingStatus(status)) continue;
    const bucket = orderBuckets.get(currency) ?? { orders: 0, revenue: 0 };
    bucket.orders += 1;
    bucket.revenue += Math.max(0, grossAmount);
    orderBuckets.set(currency, bucket);
  }

  const orders = [...orderBuckets.entries()].map(([currency, bucket]): RealTrafficRecord => ({
    channel: `Zamówienia canonical (${currency})`,
    conversionRate: 0,
    conversions: bucket.orders,
    dimensionKey: `canonical-orders:${currency}`,
    eventQuality: null,
    landingPage: null,
    revenue: { amount: round2(bucket.revenue), currency },
    sessions: 0,
    users: 0,
  }));

  return [...ga4, ...orders];
}

function buildFunnelSteps(rows: readonly CanonicalRow[]): readonly TrafficFunnelStep[] {
  const usersByEvent = new Map<string, number>();
  for (const row of rows) {
    const entity = readEntity(row.canonical_payload);
    const eventName = readEntityString(entity, "eventName");
    if (!eventName) continue;
    const users = readEntityNumber(entity, "users") ?? readEntityNumber(entity, "eventCount") ?? 0;
    usersByEvent.set(eventName, (usersByEvent.get(eventName) ?? 0) + Math.max(0, users));
  }

  return FUNNEL_STAGES.slice(0, -1).map((stage, index) => {
    const next = FUNNEL_STAGES[index + 1]!;
    const entrants = usersByEvent.get(stage.eventName) ?? 0;
    const completions = usersByEvent.get(next.eventName) ?? 0;
    return {
      completions: roundCount(completions),
      conversionRate: entrants > 0 ? round4(Math.min(1, completions / entrants)) : 0,
      entrants: roundCount(entrants),
      label: stage.label,
      stepId: stage.stepId,
    };
  });
}

function buildTrafficDiagnostics(
  trafficRows: readonly CanonicalRow[],
  eventRows: readonly CanonicalRow[],
  steps: readonly TrafficFunnelStep[],
): readonly TrafficDiagnosticFinding[] {
  const findings: TrafficDiagnosticFinding[] = [];
  if (trafficRows.length === 0) {
    findings.push(finding("GA4_TRAFFIC_MISSING", "error", "Brak kanonicznych rekordów GA4 traffic w wybranym okresie.", "ga4:traffic"));
  }

  const partialTraffic = trafficRows.filter((row) => canonicalQualityScore(row.canonical_payload) !== 1).length;
  if (partialTraffic > 0) {
    findings.push(finding(
      "GA4_TRAFFIC_PARTIAL",
      "warning",
      `${partialTraffic} rekordów GA4 traffic ma niepełną jakość kanoniczną.`,
      "ga4:traffic",
    ));
  }

  const eventNames = new Set(eventRows.map((row) => readEntityString(readEntity(row.canonical_payload), "eventName")).filter(Boolean));
  for (const stage of FUNNEL_STAGES) {
    if (!eventNames.has(stage.eventName)) {
      findings.push(finding(
        "GA4_FUNNEL_EVENT_MISSING",
        "warning",
        `Brak zdarzenia GA4 wymaganego przez lejek: ${stage.eventName}.`,
        `ga4:event:${stage.eventName}`,
      ));
    }
  }

  if (steps.length > 0 && steps.every((step) => step.entrants === 0 && step.completions === 0)) {
    findings.push(finding("GA4_FUNNEL_EMPTY", "warning", "Dane zdarzeń nie pozwalają policzyć lejka w wybranym okresie.", "ga4:events"));
  }

  return findings;
}

function finding(
  code: string,
  severity: TrafficDiagnosticFinding["severity"],
  message: string,
  sourceRef: string | null,
): TrafficDiagnosticFinding {
  return {
    code,
    findingId: deterministicUuid(`${code}:${sourceRef ?? "none"}`),
    message,
    severity,
    sourceRef,
  };
}

function toTrafficRecord(key: string, bucket: TrafficBucket): RealTrafficRecord {
  const eventQuality = bucket.qualitySamples > 0
    ? round4(bucket.qualityScoreTotal / bucket.qualitySamples)
    : null;
  return {
    channel: bucket.channel,
    conversionRate: bucket.sessions > 0 ? round4(bucket.conversions / bucket.sessions) : 0,
    conversions: roundCount(bucket.conversions),
    dimensionKey: key,
    eventQuality,
    landingPage: bucket.landingPage,
    revenue: { amount: round2(bucket.revenue), currency: bucket.currency },
    sessions: roundCount(bucket.sessions),
    users: roundCount(bucket.users),
  };
}

function matchesFilters(record: RealTrafficRecord, filters: TrafficFilters | null | undefined): boolean {
  if (!filters) return true;
  const needle = filters.search?.trim().toLowerCase();
  if (needle) {
    const haystack = `${record.channel} ${record.landingPage ?? ""} ${record.dimensionKey}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (filters.source?.length && !filters.source.some((source) => record.channel.toLowerCase().includes(source.toLowerCase()))) {
    return false;
  }
  if (filters.status?.length) {
    const status = readinessForRecord(record);
    if (!filters.status.includes(status)) return false;
  }
  return true;
}

function summarizeTraffic(records: readonly RealTrafficRecord[], generatedAt: string): TrafficSummaryRecord {
  let ready = 0;
  let warning = 0;
  let critical = 0;
  for (const record of records) {
    const status = readinessForRecord(record);
    if (status === "ready") ready += 1;
    else if (status === "warning") warning += 1;
    else critical += 1;
  }
  return { critical, ready, total: records.length, updatedAt: generatedAt as IsoDateTime, warning };
}

function readinessForRecord(record: RealTrafficRecord): "critical" | "ready" | "warning" {
  if (record.eventQuality === null || record.eventQuality < 0.5) return "critical";
  if (record.eventQuality < 1) return "warning";
  return "ready";
}


function canonicalQualityScore(payload: unknown): number | null {
  if (!isRecord(payload)) return null;
  const quality = payload.quality;
  if (!isRecord(quality)) return null;
  if (quality.status === "valid") return 1;
  if (quality.status === "partial") {
    const missing = Array.isArray(quality.missingFields) ? quality.missingFields.length : 1;
    return round4(Math.max(0, 1 - missing * 0.25));
  }
  return null;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonNegative(value: number | null): number {
  return value === null || !Number.isFinite(value) ? 0 : Math.max(0, value);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function roundCount(value: number): number {
  return Number.isInteger(value) ? value : round4(value);
}

function clampLimit(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return DEFAULT_PAGE_LIMIT;
  return Math.min(MAX_PAGE_LIMIT, Math.round(value));
}

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  const value = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function deterministicUuid(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ["8", "9", "a", "b"][Number.parseInt(hex[16] ?? "0", 16) % 4]!;
  const joined = hex.join("");
  return `${joined.slice(0, 8)}-${joined.slice(8, 12)}-${joined.slice(12, 16)}-${joined.slice(16, 20)}-${joined.slice(20)}`;
}
