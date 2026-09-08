import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a Stripe webhook's `Stripe-Signature` header against the raw
 * request body, replicating Stripe's own documented scheme
 * (https://docs.stripe.com/webhooks#verify-manually) without depending on
 * the `stripe` SDK: HMAC-SHA256 of `${timestamp}.${rawBody}` under the
 * webhook signing secret, compared to the header's `v1` value.
 *
 * Pure and side-effect-free on purpose: this is the one piece of the Stripe
 * integration that is fully testable without live Stripe credentials (a
 * signed payload can be constructed with any secret), unlike the rest of
 * the billing flow, which needs a real Stripe account.
 */
export function verifyStripeSignature(input: {
  readonly rawBody: string | Buffer;
  readonly signatureHeader: string | null | undefined;
  readonly webhookSecret: string;
  readonly toleranceSeconds?: number;
  readonly now?: () => number;
}): { readonly valid: true } | { readonly valid: false; readonly reason: string } {
  const toleranceSeconds = input.toleranceSeconds ?? 300;
  const nowMs = (input.now ?? Date.now)();

  if (!input.signatureHeader) {
    return { valid: false, reason: "missing_signature_header" };
  }

  const parsed = parseSignatureHeader(input.signatureHeader);
  if (!parsed) {
    return { valid: false, reason: "malformed_signature_header" };
  }

  const ageSeconds = Math.abs(nowMs / 1000 - parsed.timestamp);
  if (ageSeconds > toleranceSeconds) {
    return { valid: false, reason: "timestamp_outside_tolerance" };
  }

  const rawBody = typeof input.rawBody === "string"
    ? Buffer.from(input.rawBody, "utf8")
    : input.rawBody;
  const signedPayload = Buffer.concat([
    Buffer.from(`${parsed.timestamp}.`, "utf8"),
    rawBody,
  ]);
  const expectedHex = createHmac("sha256", input.webhookSecret)
    .update(signedPayload)
    .digest("hex");
  const expected = Buffer.from(expectedHex, "hex");

  const matches = parsed.v1Signatures.some((candidateHex) => {
    if (!/^[0-9a-f]+$/iu.test(candidateHex)) return false;
    const candidate = Buffer.from(candidateHex, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });

  return matches
    ? { valid: true }
    : { valid: false, reason: "signature_mismatch" };
}

function parseSignatureHeader(
  header: string,
): { readonly timestamp: number; readonly v1Signatures: readonly string[] } | null {
  const parts = header.split(",").map((part) => part.trim());
  let timestamp: number | null = null;
  const v1Signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split("=", 2);
    if (key === "t" && value) {
      const parsedTimestamp = Number.parseInt(value, 10);
      if (Number.isFinite(parsedTimestamp)) timestamp = parsedTimestamp;
    } else if (key === "v1" && value) {
      v1Signatures.push(value);
    }
  }

  if (timestamp === null || v1Signatures.length === 0) return null;
  return { timestamp, v1Signatures };
}

export type StripeWebhookEvent = {
  readonly id: string;
  readonly type: string;
  readonly data: { readonly object: Record<string, unknown> };
};

export function parseStripeWebhookEvent(rawBody: string | Buffer): StripeWebhookEvent | null {
  try {
    const parsed = JSON.parse(
      typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"),
    ) as unknown;
    if (
      isRecord(parsed)
      && typeof parsed.id === "string"
      && typeof parsed.type === "string"
      && isRecord(parsed.data)
      && isRecord(parsed.data.object)
    ) {
      return {
        id: parsed.id,
        type: parsed.type,
        data: { object: parsed.data.object },
      };
    }
  } catch {
    // fall through to null
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
