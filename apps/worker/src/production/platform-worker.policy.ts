export const platformJobTypes = [
  "report",
  "privacy_request",
  "reconciliation",
  "retention",
  "ai_evaluation",
  "stripe_webhook",
  "assistant_generation",
] as const;

export function reportFormatEnabled(format: string): boolean {
  return format === "json" || format === "csv";
}

export function privacyTargetDisposition(system: string): "completed" | "not_applicable" | "verification_pending" {
  if (system === "object_storage") return "completed";
  if (["cache", "search_index", "queue"].includes(system)) return "not_applicable";
  return "verification_pending";
}

export function schedulerKeyForJob(jobType: string): "reconciliation" | "retention" | null {
  if (jobType === "reconciliation" || jobType === "retention") return jobType;
  return null;
}

export function shouldBullMqRetry(attemptsMade: number, maxAttempts: number): boolean {
  return attemptsMade + 1 < Math.max(1, maxAttempts);
}

const reportColumns = [
  "metric_code",
  "definition_version",
  "period_start",
  "period_end",
  "currency",
  "value",
  "value_kind",
  "readiness",
  "generated_at",
] as const;

export function csvCell(value: unknown): string {
  const text = value === null || value === undefined
    ? ""
    : typeof value === "string"
      ? value
      : JSON.stringify(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function renderReport(
  format: string,
  document: Record<string, unknown> & { rows: readonly Record<string, unknown>[] },
): { readonly body: Buffer; readonly contentType: string } {
  if (format === "json") {
    return {
      body: Buffer.from(JSON.stringify(document, null, 2), "utf8"),
      contentType: "application/json",
    };
  }

  const lines = [reportColumns.join(",")];
  for (const row of document.rows) {
    lines.push(reportColumns.map((column) => csvCell(row[column])).join(","));
  }
  return {
    body: Buffer.from(`﻿${lines.join("\n")}\n`, "utf8"),
    contentType: "text/csv; charset=utf-8",
  };
}
