import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookVerificationResult } from "@papadata/contracts";

export type WebhookVerificationInput = {
  readonly rawBody: Buffer;
  readonly signature: string;
  readonly timestamp: string;
  readonly eventId: string;
  readonly secret: string;
  readonly now: Date;
  readonly allowedSkewSeconds: number;
  readonly replayDetected: boolean;
  readonly connectionResolved: boolean;
};

export function verifyHmacSha256Webhook(
  input: WebhookVerificationInput,
): WebhookVerificationResult {
  const expected = createHmac("sha256", input.secret)
    .update(input.timestamp)
    .update(".")
    .update(input.rawBody)
    .digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(input.signature, "utf8");
  const signatureValid = left.length === right.length && timingSafeEqual(left, right);
  const timestampMs = new Date(input.timestamp).getTime();
  const timestampValid = Number.isFinite(timestampMs)
    && Math.abs(input.now.getTime() - timestampMs) <= input.allowedSkewSeconds * 1000;
  const valid = signatureValid
    && timestampValid
    && !input.replayDetected
    && input.connectionResolved;
  return {
    valid,
    signatureValid,
    timestampValid,
    replayDetected: input.replayDetected,
    connectionResolved: input.connectionResolved,
    failureReason: valid
      ? null
      : !signatureValid
        ? "invalid_signature"
        : !timestampValid
          ? "invalid_timestamp"
          : input.replayDetected
            ? "replay_detected"
            : "connection_not_resolved",
  };
}
