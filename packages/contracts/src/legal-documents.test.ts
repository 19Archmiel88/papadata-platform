import { describe, expect, it } from "vitest";
import {
  isLegalDocumentType,
  isPublishedLegalDocument,
  legalDocumentTypes,
  type PublishedLegalDocument,
} from "./legal-documents.js";

function document(overrides: Partial<PublishedLegalDocument> = {}): PublishedLegalDocument {
  return {
    body: "Body text.",
    effectiveAt: "2026-01-01T00:00:00.000Z",
    id: "cookie-policy-1",
    title: "Cookie Policy",
    type: "cookie_policy",
    version: "1",
    ...overrides,
  };
}

describe("isLegalDocumentType", () => {
  it.each(legalDocumentTypes)("accepts canonical type %s", (type) => {
    expect(isLegalDocumentType(type)).toBe(true);
  });

  it("rejects an arbitrary client-supplied type", () => {
    expect(isLegalDocumentType("cookie_policy; DROP TABLE app.legal_documents")).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(isLegalDocumentType(42)).toBe(false);
  });
});

describe("isPublishedLegalDocument", () => {
  it("valid document shape", () => {
    expect(isPublishedLegalDocument(document())).toBe(true);
  });

  it("rejects an unsupported type", () => {
    expect(isPublishedLegalDocument(document({ type: "eula" as never }))).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { body: _body, ...withoutBody } = document();
    expect(isPublishedLegalDocument(withoutBody)).toBe(false);
  });

  it("rejects null", () => {
    expect(isPublishedLegalDocument(null)).toBe(false);
  });

  it("rejects an array", () => {
    expect(isPublishedLegalDocument([document()])).toBe(false);
  });
});
