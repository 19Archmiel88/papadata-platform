import { describe, expect, it } from "vitest";
import {
  csvCell,
  platformJobTypes,
  privacyTargetDisposition,
  renderReport,
  reportFormatEnabled,
  schedulerKeyForJob,
  shouldBullMqRetry,
} from "./platform-worker.policy.js";

describe("platform worker critical job contracts", () => {
  it("owns every critical platform job type including durable assistant generation", () => {
    expect(platformJobTypes).toEqual([
      "report",
      "privacy_request",
      "reconciliation",
      "retention",
      "ai_evaluation",
      "stripe_webhook",
      "assistant_generation",
    ]);
  });

  it("keeps report format enablement explicit", () => {
    expect(reportFormatEnabled("json")).toBe(true);
    expect(reportFormatEnabled("csv")).toBe(true);
    expect(reportFormatEnabled("pdf")).toBe(false);
    expect(reportFormatEnabled("xlsx")).toBe(false);
  });

  it("keeps privacy erase external systems verification-pending instead of claiming deletion", () => {
    expect(privacyTargetDisposition("object_storage")).toBe("completed");
    expect(privacyTargetDisposition("queue")).toBe("not_applicable");
    expect(privacyTargetDisposition("database")).toBe("verification_pending");
    expect(privacyTargetDisposition("provider")).toBe("verification_pending");
    expect(privacyTargetDisposition("backup")).toBe("verification_pending");
  });

  it("maps reconciliation and retention to their scheduler completion keys", () => {
    expect(schedulerKeyForJob("reconciliation")).toBe("reconciliation");
    expect(schedulerKeyForJob("retention")).toBe("retention");
    expect(schedulerKeyForJob("ai_evaluation")).toBeNull();
  });

  it("retries provider/worker failures only before the configured final attempt", () => {
    expect(shouldBullMqRetry(0, 5)).toBe(true);
    expect(shouldBullMqRetry(3, 5)).toBe(true);
    expect(shouldBullMqRetry(4, 5)).toBe(false);
  });

  it("owns every recognized platform job type exactly once", () => {
    expect(new Set(platformJobTypes).size).toBe(platformJobTypes.length);
  });
});

describe("csvCell", () => {
  it("renders an empty quoted cell for null and undefined", () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });

  it("passes strings through without re-encoding, only doubling embedded quotes", () => {
    expect(csvCell("PLN")).toBe('"PLN"');
    expect(csvCell('Say "hi"')).toBe('"Say ""hi"""');
  });

  it("JSON-stringifies non-string values instead of using their raw form", () => {
    expect(csvCell(42)).toBe('"42"');
    expect(csvCell({ a: 1 })).toBe('"{""a"":1}"');
  });
});

describe("renderReport", () => {
  const document = {
    reportId: "r1",
    rows: [{
      metric_code: "roas",
      definition_version: 3,
      period_start: "2026-01-01",
      period_end: "2026-01-31",
      currency: "PLN",
      value: "12.5",
      value_kind: "ratio",
      readiness: "ready",
      generated_at: "2026-02-01T00:00:00.000Z",
    }],
  };

  it("renders JSON reports as the full pretty-printed document", () => {
    const { body, contentType } = renderReport("json", document);
    expect(contentType).toBe("application/json");
    expect(JSON.parse(body.toString("utf8"))).toEqual(document);
  });

  it("renders CSV reports with a UTF-8 BOM, the fixed metric-report header, and one quoted row per record", () => {
    const { body, contentType } = renderReport("csv", document);
    expect(contentType).toBe("text/csv; charset=utf-8");
    const text = body.toString("utf8");
    expect(text.charCodeAt(0)).toBe(0xfeff);
    const lines = text.slice(1).trimEnd().split("\n");
    expect(lines[0]).toBe(
      "metric_code,definition_version,period_start,period_end,currency,value,value_kind,readiness,generated_at",
    );
    expect(lines[1]).toBe(
      '"roas","3","2026-01-01","2026-01-31","PLN","12.5","ratio","ready","2026-02-01T00:00:00.000Z"',
    );
  });

  it("only emits the fixed metric-report columns, never leaking unrelated row fields into the export", () => {
    const { body } = renderReport("csv", { rows: [{ metric_code: "x", unexpected_field: "leak" }] });
    expect(body.toString("utf8")).not.toContain("leak");
  });
});
