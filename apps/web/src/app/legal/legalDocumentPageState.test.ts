import { describe, expect, it } from "vitest";
import type { PublishedLegalDocument } from "@papadata/contracts";
import { resolveLegalDocumentScreenState } from "./legalDocumentPageState";

const document: PublishedLegalDocument = {
  body: "Body text.",
  effectiveAt: "2026-01-01T00:00:00.000Z",
  id: "cookie-policy-1",
  title: "Cookie Policy",
  type: "cookie_policy",
  version: "1",
};

describe("resolveLegalDocumentScreenState", () => {
  it("loading remote state -> loading", () => {
    expect(resolveLegalDocumentScreenState("loading", null)).toBe("loading");
  });

  it("ready with a document -> ready", () => {
    expect(resolveLegalDocumentScreenState("ready", { document })).toBe("ready");
  });

  it("ready with no active document -> unavailable, not error", () => {
    expect(resolveLegalDocumentScreenState("ready", { document: null })).toBe("unavailable");
  });

  it("ready but data missing entirely -> unavailable", () => {
    expect(resolveLegalDocumentScreenState("ready", null)).toBe("unavailable");
  });

  it.each(["error", "forbidden", "offline"] as const)("%s remote state -> error", (remoteState) => {
    expect(resolveLegalDocumentScreenState(remoteState, null)).toBe("error");
  });
});
