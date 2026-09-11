import { describe, expect, it } from "vitest";
import {
  platformJobTypes,
  privacyTargetDisposition,
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
});
