import { resolveMembershipCapabilities, type MembershipAuthorizationInput } from "@papadata/contracts";

export type AssistantGenerationTerminalDecision = "cancel" | "complete" | "fail" | "retry";

export function assistantGenerationJobId(runId: string): string {
  return `assistant-generation:${runId}`;
}

export function assistantGenerationLeaseDurationMs(configuredMs: number): number {
  return Math.max(30_000, Math.min(configuredMs, 10 * 60_000));
}

export function canRunAssistantGeneration(
  memberships: readonly MembershipAuthorizationInput[],
  now: Date = new Date(),
): boolean {
  const capabilities = new Set(
    memberships.flatMap((membership) => resolveMembershipCapabilities(membership, now)),
  );
  return capabilities.has("ai.assistant.run") && capabilities.has("ai.history.read");
}

export function decideAssistantGenerationFailure(input: {
  cancelled: boolean;
  attemptsMade: number;
  maxAttempts: number;
}): AssistantGenerationTerminalDecision {
  if (input.cancelled) return "cancel";
  return input.attemptsMade + 1 < input.maxAttempts ? "retry" : "fail";
}
