import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { LegalDocumentsService } from "./legal-documents.service.js";
import { LegalDocumentsController } from "./legal-documents.controller.js";

describe("LegalDocumentsController", () => {
  it("wraps the service's active document in a contract-shaped envelope", async () => {
    const document = {
      body: "Body text.",
      effectiveAt: "2026-01-01T00:00:00.000Z",
      id: "cookie-policy-1",
      title: "Cookie Policy",
      type: "cookie_policy" as const,
      version: "1",
    };
    const service = { readActive: vi.fn(async () => document) } as unknown as LegalDocumentsService;
    const controller = new LegalDocumentsController(service);

    await expect(controller.read("cookie_policy")).resolves.toEqual({ data: { document } });
    expect(service.readActive).toHaveBeenCalledWith("cookie_policy");
  });

  it("returns a null document instead of a 404 when nothing is active", async () => {
    const service = { readActive: vi.fn(async () => null) } as unknown as LegalDocumentsService;
    const controller = new LegalDocumentsController(service);

    await expect(controller.read("cookie_policy")).resolves.toEqual({ data: { document: null } });
  });

  it("propagates the service's rejection of an unsupported type", async () => {
    const service = {
      readActive: vi.fn(async () => {
        throw new BadRequestException("Unsupported legal document type.");
      }),
    } as unknown as LegalDocumentsService;
    const controller = new LegalDocumentsController(service);

    await expect(controller.read("eula")).rejects.toBeInstanceOf(BadRequestException);
  });
});
