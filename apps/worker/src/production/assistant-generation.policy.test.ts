import { describe, expect, it } from "vitest";
import {
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

  it("retries before the final BullMQ attempt and fails on the last one", () => {
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 0, maxAttempts: 5 })).toBe("retry");
    expect(decideAssistantGenerationFailure({ cancelled: false, attemptsMade: 4, maxAttempts: 5 })).toBe("fail");
    expect(decideAssistantGenerationFailure({ cancelled: true, attemptsMade: 0, maxAttempts: 5 })).toBe("cancel");
  });
});
