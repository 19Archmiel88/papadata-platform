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
