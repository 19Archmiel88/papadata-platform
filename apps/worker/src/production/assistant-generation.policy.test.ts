import { AiProviderError, aiProviderErrorMetadata } from "@papadata/ai-runtime";
import { describe, expect, it } from "vitest";
import {
  assistantGenerationErrorCode,
  assistantGenerationJobId,
  assistantGenerationLeaseDurationMs,
  canRunAssistantGeneration,
  decideAssistantGenerationFailure,
} from "./assistant-generation.policy.js";

describe("assistant generation worker policy", () => {
  it("uses a deterministic idempotency key", () => {
    expect(assistantGenerationJobId("run-1")).toBe("assistant-generation:run-1");
  });

  it("bounds worker leases", () => {
    expect(assistantGenerationLeaseDurationMs(1)).toBe(30_000);
    expect(assistantGenerationLeaseDurationMs(90_000)).toBe(90_000);
    expect(assistantGenerationLeaseDurationMs(9_000_000)).toBe(600_000);
  });

  it("allows an active analyst and rejects a viewer", () => {
    expect(canRunAssistantGeneration([{ role: "Analyst", status: "active", dataScope: "workspace", jitExpiresAt: null }])).toBe(true);
    expect(canRunAssistantGeneration([{ role: "Viewer", status: "active", dataScope: "workspace", jitExpiresAt: null }])).toBe(false);
  });

  it("retries before the final BullMQ attempt: an unknown (non-provider) failure retries, then fails on the last one", () => {
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5 })).toBe("retry");
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 4, maxAttempts: 5 })).toBe("fail");
  });

  it("cancels regardless of attempts or error", () => {
    expect(decideAssistantGenerationFailure({ cancelled: true, attemptsMade: 0, maxAttempts: 5 })).toBe("cancel");
    expect(decideAssistantGenerationFailure({
      cancelled: true,
      attemptsMade: 0,
      maxAttempts: 5,
      error: new AiProviderError("AI_PROVIDER_RATE_LIMIT", "rate limited", { retryable: true }),
    })).toBe("cancel");
  });

  it("retries a retryable provider error while attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_UNAVAILABLE", "unavailable", { retryable: true });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("retry");
  });

  it("recognizes branded provider errors even when constructor identity differs", () => {
    const crossPackageProviderError = {
      [Symbol.for("@papadata/ai-runtime/AiProviderError")]: true,
      code: "AI_PROVIDER_RATE_LIMIT",
      status: 429,
      retryable: true,
    };

    expect(aiProviderErrorMetadata(crossPackageProviderError)).toEqual({
      providerErrorCode: "AI_PROVIDER_RATE_LIMIT",
      httpStatus: 429,
      retryable: true,
      upstreamProviderErrorCode: null,
      upstreamProviderErrorParam: null,
      upstreamProviderErrorType: null,
      upstreamProviderRequestId: null,
    });
    expect(decideAssistantGenerationFailure({
      cancelled: false,
      attemptsMade: 0,
      maxAttempts: 5,
      error: crossPackageProviderError,
      stage: "provider_invocation",
    })).toBe("retry");
    expect(assistantGenerationErrorCode({
      decision: "fail",
      error: crossPackageProviderError,
      stage: "provider_invocation",
    })).toBe("AI_PROVIDER_RATE_LIMIT");
  });

  it("fails a retryable provider error once it is the final BullMQ attempt", () => {
    const error = new AiProviderError("AI_PROVIDER_UNAVAILABLE", "unavailable", { retryable: true });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 4, maxAttempts: 5, error })).toBe("fail");
  });

  it("fails authentication failures immediately even though attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_AUTHENTICATION", "authentication failed", { status: 401 });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("fail");
  });

  it("fails forbidden failures immediately even though attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_FORBIDDEN", "forbidden", { status: 403 });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("fail");
  });

  it("fails quota failures immediately even though attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_QUOTA", "quota exhausted", { status: 429 });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("fail");
  });

  it("fails validation failures immediately even though attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_VALIDATION", "request rejected", { status: 400 });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("fail");
  });

  it("fails an invalid response immediately by default", () => {
    const error = new AiProviderError("AI_PROVIDER_INVALID_RESPONSE", "no text output");
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("fail");
  });

  it("retries an invalid response only when explicitly marked retryable", () => {
    const error = new AiProviderError("AI_PROVIDER_INVALID_RESPONSE", "stream ended early", { retryable: true });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("retry");
  });

  it("retries a retryable rate limit failure while attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_RATE_LIMIT", "rate limited", { status: 429, retryable: true });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("retry");
  });

  it("retries a retryable timeout while attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_TIMEOUT", "timed out", { retryable: true });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("retry");
  });

  it("retries a retryable network failure while attempts remain", () => {
    const error = new AiProviderError("AI_PROVIDER_NETWORK", "network request failed", { retryable: true });
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5, error })).toBe("retry");
  });

  it("fails deterministic internal database constraint failures without burning all attempts", () => {
    const error = Object.assign(new Error("redacted"), {
      code: "23514",
      name: "DatabaseError",
    });

    expect(decideAssistantGenerationFailure({
      cancelled: false,
      attemptsMade: 0,
      maxAttempts: 5,
      error,
      stage: "budget_reservation",
    })).toBe("fail");
    expect(assistantGenerationErrorCode({ decision: "fail", error, stage: "budget_reservation" }))
      .toBe("GENERATION_INTERNAL_ERROR");
  });

  it("persists the real AiProviderError taxonomy code instead of collapsing to GENERATION_FAILED", () => {
    expect(assistantGenerationErrorCode({
      decision: "fail",
      error: new AiProviderError("AI_PROVIDER_QUOTA", "quota exhausted", { status: 429 }),
    })).toBe("AI_PROVIDER_QUOTA");
    expect(assistantGenerationErrorCode({
      decision: "fail",
      error: new AiProviderError("AI_PROVIDER_AUTHENTICATION", "authentication failed", { status: 401 }),
    })).toBe("AI_PROVIDER_AUTHENTICATION");
    expect(assistantGenerationErrorCode({
      decision: "fail",
      error: new AiProviderError("AI_PROVIDER_VALIDATION", "request rejected", { status: 400 }),
    })).toBe("AI_PROVIDER_VALIDATION");
    expect(assistantGenerationErrorCode({
      decision: "fail",
      error: new AiProviderError("AI_PROVIDER_RATE_LIMIT", "rate limited", { status: 429, retryable: true }),
    })).toBe("AI_PROVIDER_RATE_LIMIT");
  });

  it("keeps the generic codes for cancellation and unknown failures", () => {
    expect(assistantGenerationErrorCode({ decision: "cancel", error: new Error("boom") })).toBe("GENERATION_STOPPED");
    expect(assistantGenerationErrorCode({ decision: "fail", error: new Error("boom") })).toBe("GENERATION_FAILED");
    expect(assistantGenerationErrorCode({ decision: "retry", error: new Error("boom") })).toBe("WORKER_RETRY");
  });
});
