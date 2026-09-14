import { describe, expect, it } from "vitest";
import {
  isCookieConsentDecisionCurrent,
  type CookieConsentCategories,
  type CookieConsentDecision,
  parseCookieConsentCategories,
} from "./cookie-consent.js";

function decision(overrides: Partial<CookieConsentDecision> = {}): CookieConsentDecision {
  const categories: CookieConsentCategories = {
    analytics: false,
    marketing: false,
    necessary: true,
    preferences: false,
  };
  return {
    categories,
    decidedAt: "2026-01-01T00:00:00.000Z",
    version: "1",
    ...overrides,
  };
}

describe("isCookieConsentDecisionCurrent", () => {
  it("valid current version -> decided", () => {
    expect(isCookieConsentDecisionCurrent(decision({ version: "1" }), "1")).toBe(true);
  });

  it("stale version -> requires fresh decision", () => {
    expect(isCookieConsentDecisionCurrent(decision({ version: "1" }), "2")).toBe(false);
  });

  it("no decision at all -> requires fresh decision", () => {
    expect(isCookieConsentDecisionCurrent(null, "1")).toBe(false);
  });

  it("accept all shape", () => {
    const accepted = decision({
      categories: { analytics: true, marketing: true, necessary: true, preferences: true },
    });
    expect(accepted.categories).toEqual({ analytics: true, marketing: true, necessary: true, preferences: true });
  });

  it("reject optional shape", () => {
    const rejected = decision({
      categories: { analytics: false, marketing: false, necessary: true, preferences: false },
    });
    expect(rejected.categories).toEqual({ analytics: false, marketing: false, necessary: true, preferences: false });
  });

  it("custom shape is preserved exactly", () => {
    const custom = decision({
      categories: { analytics: false, marketing: true, necessary: true, preferences: true },
    });
    expect(custom.categories).toEqual({ analytics: false, marketing: true, necessary: true, preferences: true });
  });

  // necessary:false is rejected by the type system itself, not at runtime --
  // CookieConsentCategories['necessary'] is the literal `true`, so this
  // would be a compile error if uncommented:
  // const invalid: CookieConsentCategories = { analytics: false, marketing: false, necessary: false, preferences: false };
});

describe("parseCookieConsentCategories", () => {
  it("accept all", () => {
    expect(parseCookieConsentCategories({ analytics: true, marketing: true, preferences: true })).toEqual({
      analytics: true, marketing: true, necessary: true, preferences: true,
    });
  });

  it("reject optional", () => {
    expect(parseCookieConsentCategories({ analytics: false, marketing: false, preferences: false })).toEqual({
      analytics: false, marketing: false, necessary: true, preferences: false,
    });
  });

  it("custom selection", () => {
    expect(parseCookieConsentCategories({ analytics: false, marketing: true, preferences: true })).toEqual({
      analytics: false, marketing: true, necessary: true, preferences: true,
    });
  });

  it("missing category rejected", () => {
    expect(() => parseCookieConsentCategories({ analytics: false, marketing: true })).toThrow();
  });

  it("unknown category rejected", () => {
    expect(() => parseCookieConsentCategories({ analytics: false, marketing: true, preferences: true, necessary: true })).toThrow();
  });

  it("invalid value rejected", () => {
    expect(() => parseCookieConsentCategories({ analytics: "yes", marketing: true, preferences: true })).toThrow();
  });
});
