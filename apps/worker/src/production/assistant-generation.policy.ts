import { isAiProviderError } from "@papadata/ai-runtime";
import { resolveMembershipCapabilities, type MembershipAuthorizationInput } from "@papadata/contracts";

export type AssistantGenerationTerminalDecision = "cancel" | "complete" | "fail" | "retry";
export type AssistantGenerationStage =
  | "claim"
  | "authority_check"
  | "provider_creation"
  | "context_preparation"
  | "dlp_redaction"
  | "budget_reservation"
  | "provider_invocation"
  | "stream_handling"
  | "result_persistence"
  | "failure_persistence"
  | "unknown";

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

/**
 * BullMQ attempts are the outer retry budget: once they are exhausted this
 * always fails, regardless of what the error says. Below that ceiling, a
 * classified AiProviderError decides for itself via its explicit
 * `retryable` flag -- terminal provider failures (authentication, forbidden,
 * quota, validation, an invalid response not explicitly marked retryable)
 * must not burn through the remaining attempts just because attempts are
 * still available; they fail immediately so the real cause surfaces instead
 * of being retried into a generic timeout.
 *
 * Deterministic internal/programming failures fail immediately. That covers
 * invalid context shape, budget/refusal persistence constraint violations,
 * and similar errors that another BullMQ attempt cannot repair. Other
 * unknown failures keep the pre-existing outer retry behavior because they
 * may still be transient database or infrastructure failures.
 */
export function decideAssistantGenerationFailure(input: {
  cancelled: boolean;
  attemptsMade: number;
  maxAttempts: number;
  error?: unknown;
  stage?: AssistantGenerationStage;
}): AssistantGenerationTerminalDecision {
  if (input.cancelled) return "cancel";
  const attemptsRemain = input.attemptsMade + 1 < input.maxAttempts;
  if (!attemptsRemain) return "fail";
  if (isAiProviderError(input.error)) {
    return input.error.retryable ? "retry" : "fail";
  }
  if (isDeterministicAssistantGenerationFailure(input.error, input.stage)) return "fail";
  return "retry";
}

/**
 * Safe error_code to persist to assistant_generation_runs. Preserves the
 * real AiProviderError taxonomy code (e.g. AI_PROVIDER_QUOTA) instead of
 * collapsing every provider failure into the generic GENERATION_FAILED, so
 * the actual terminal cause survives past the worker for the API/frontend
 * and for operator triage -- without ever persisting the error message,
 * request/response bodies, or any provider payload.
 */
export function assistantGenerationErrorCode(input: {
  decision: AssistantGenerationTerminalDecision;
  error?: unknown;
  stage?: AssistantGenerationStage;
}): string {
  if (input.decision === "cancel") return "GENERATION_STOPPED";
  if (isAiProviderError(input.error)) return input.error.code;
  if (isDeterministicAssistantGenerationFailure(input.error, input.stage)) {
    return "GENERATION_INTERNAL_ERROR";
  }
  return input.decision === "retry" ? "WORKER_RETRY" : "GENERATION_FAILED";
}

export function assistantGenerationErrorName(error: unknown): string | null {
  if (error instanceof Error && error.name) return error.name;
  if (error && typeof error === "object" && typeof (error as { readonly name?: unknown }).name === "string") {
    return (error as { readonly name: string }).name;
  }
  return null;
}

function isDeterministicAssistantGenerationFailure(
  error: unknown,
  stage: AssistantGenerationStage = "unknown",
): boolean {
  if (error instanceof RangeError || error instanceof TypeError || error instanceof SyntaxError) return true;
  const code = readDatabaseErrorCode(error);
  if (code && deterministicDatabaseErrorCodes.has(code)) return true;
  return stage === "provider_creation" && error instanceof Error;
}

const deterministicDatabaseErrorCodes = new Set([
  "22001", // string_data_right_truncation
  "22P02", // invalid_text_representation
  "23502", // not_null_violation
  "23503", // foreign_key_violation
  "23505", // unique_violation
  "23514", // check_violation
  "42703", // undefined_column
]);

function readDatabaseErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === "string" && /^[0-9A-Z]{5}$/u.test(code) ? code : null;
}
