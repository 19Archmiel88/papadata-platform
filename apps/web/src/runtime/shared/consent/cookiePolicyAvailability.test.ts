import { describe, expect, it } from "vitest";
import type { PublishedLegalDocument } from "@papadata/contracts";
import { resolveCookiePolicyLinkAvailable } from "./cookiePolicyAvailability";

const document: PublishedLegalDocument = {
  body: "Body text.",
  effectiveAt: "2026-01-01T00:00:00.000Z",
  id: "cookie-policy-1",
  title: "Cookie Policy",
  type: "cookie_policy",
  version: "1",
};

describe("resolveCookiePolicyLinkAvailable", () => {
  it("an active document -> the link is available", () => {
    expect(resolveCookiePolicyLinkAvailable("ready", { document })).toBe(true);
  });

  it("a successful read with no active document -> the link is hidden, not treated as an error", () => {
    expect(resolveCookiePolicyLinkAvailable("ready", { document: null })).toBe(false);
  });

  it("still loading -> the link is hidden (never a disabled/placeholder link)", () => {
    expect(resolveCookiePolicyLinkAvailable("loading", null)).toBe(false);
  });

  it.each(["error", "forbidden", "offline"] as const)(
    "a failed legal-document read (%s) -> the link is hidden, not surfaced as a consent error",
    (remoteState) => {
      expect(resolveCookiePolicyLinkAvailable(remoteState, null)).toBe(false);
    },
  );

  it("ready but the response is missing entirely -> the link is hidden", () => {
    expect(resolveCookiePolicyLinkAvailable("ready", null)).toBe(false);
  });
});
