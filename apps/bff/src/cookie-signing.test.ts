import { describe, expect, it } from "vitest";
import { signCookieValue, verifySignedCookieValue } from "./cookie-signing.js";

describe("signCookieValue / verifySignedCookieValue", () => {
  it("round-trips a value signed with the same secret", () => {
    const signed = signCookieValue("session-id-123", "secret-a");
    expect(verifySignedCookieValue(signed, ["secret-a"])).toBe("session-id-123");
  });

  it("rejects a value whose signature was tampered with", () => {
    const signed = signCookieValue("session-id-123", "secret-a");
    const [value] = signed.split(".");
    const tampered = `${value}.not-the-real-signature`;
    expect(verifySignedCookieValue(tampered, ["secret-a"])).toBeNull();
  });

  it("rejects a value whose payload was tampered with", () => {
    const signed = signCookieValue("session-id-123", "secret-a");
    const separator = signed.lastIndexOf(".");
    const signature = signed.slice(separator + 1);
    const tampered = `session-id-999.${signature}`;
    expect(verifySignedCookieValue(tampered, ["secret-a"])).toBeNull();
  });

  it("rejects a value signed with a different secret", () => {
    const signed = signCookieValue("session-id-123", "secret-a");
    expect(verifySignedCookieValue(signed, ["secret-b"])).toBeNull();
  });

  it("accepts a value signed with the previous secret during rotation", () => {
    const signed = signCookieValue("session-id-123", "secret-old");
    expect(verifySignedCookieValue(signed, ["secret-new", "secret-old"])).toBe("session-id-123");
  });

  it("returns null for an undefined or malformed input", () => {
    expect(verifySignedCookieValue(undefined, ["secret-a"])).toBeNull();
    expect(verifySignedCookieValue("no-separator-here", ["secret-a"])).toBeNull();
    expect(verifySignedCookieValue(".leading-dot-empty-value", ["secret-a"])).toBeNull();
    expect(verifySignedCookieValue("trailing-dot-empty-signature.", ["secret-a"])).toBeNull();
  });
});
