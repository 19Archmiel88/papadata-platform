import { createHmac, timingSafeEqual } from "node:crypto";

export function signCookieValue(value: string, secret: string): string {
  return `${value}.${signature(value, secret)}`;
}

export function verifySignedCookieValue(
  signedValue: string | undefined,
  secrets: readonly string[],
): string | null {
  if (!signedValue) {
    return null;
  }

  const separator = signedValue.lastIndexOf(".");

  if (separator <= 0 || separator === signedValue.length - 1) {
    return null;
  }

  const value = signedValue.slice(0, separator);
  const actualSignature = signedValue.slice(separator + 1);

  return secrets.some((secret) =>
    safeEqual(actualSignature, signature(value, secret)),
  )
    ? value
    : null;
}

function signature(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}
