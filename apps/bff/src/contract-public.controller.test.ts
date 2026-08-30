import "reflect-metadata";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";
import { ContractPublicController } from "./contract-public.controller.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService } from "./security.service.js";
import { BFF_CONFIG } from "./tokens.js";

// Regression coverage for a real bug found during the P0 Faza 3 audit:
// ContractPublicController's constructor relied on implicit, type-based
// Nest DI for security/rateLimit/cloudRunIdentity (no explicit @Inject()),
// unlike every other class in this codebase (see ProxyController), which
// resolved to `undefined` at runtime under this repo's actual dev/prod
// runtime (tsx) and made every public/pre-auth route (password recovery,
// invitations, email verify/resend, /auth/status, company lookup) throw
// "Cannot read properties of undefined" on every real call -- confirmed
// live against the running BFF+API stack.
//
// Note on why there are two tests here: reverting the @Inject() fix and
// running it back through Vitest (esbuild's transform) does NOT reproduce
// the failure -- esbuild's decorator-metadata emission differs from the
// tsx/tsc path this bug actually lived in, so the DI-container test below,
// on its own, would not have caught the regression. The source-shape test
// is transform-independent and is the one that actually guards against a
// future @Inject() being dropped; the DI-container test is kept alongside
// it because it's still real, useful coverage that construction succeeds
// and every field is populated as expected.
describe("ContractPublicController source shape", () => {
  it("gives every constructor parameter an explicit @Inject(), matching the rest of this codebase's convention", () => {
    const path = fileURLToPath(new URL("./contract-public.controller.ts", import.meta.url));
    const source = readFileSync(path, "utf8");
    const constructorMatch = source.match(/constructor\(([\s\S]*?)\)\s*\{\}/u);
    expect(constructorMatch, "could not find the constructor to check").not.toBeNull();

    const params = constructorMatch![1]!
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    expect(params.length).toBeGreaterThan(0);
    for (const param of params) {
      expect(param, `constructor parameter "${param}" is missing an explicit @Inject(...)`)
        .toMatch(/^@Inject\(/u);
    }
  });
});

describe("ContractPublicController", () => {
  it("resolves every constructor dependency via Nest DI, none undefined", async () => {
    const fakeConfig = { apiOrigin: "http://api:3001", upstreamTimeoutMs: 5000 };
    const fakeSecurity = { validateHost: vi.fn(), validateOrigin: vi.fn(), corsHeaders: vi.fn(() => ({})) };
    const fakeRateLimit = { consumePublic: vi.fn(async () => undefined) };
    const fakeCloudRunIdentity = { authorizationHeader: vi.fn(async () => null) };

    const moduleRef = await Test.createTestingModule({
      controllers: [ContractPublicController],
      providers: [
        { provide: BFF_CONFIG, useValue: fakeConfig },
        { provide: BffSecurityService, useValue: fakeSecurity },
        { provide: BffRateLimitService, useValue: fakeRateLimit },
        { provide: CloudRunIdentityService, useValue: fakeCloudRunIdentity },
      ],
    }).compile();

    const controller = moduleRef.get(ContractPublicController);

    expect(controller).toBeInstanceOf(ContractPublicController);
    // Reaching into the private fields is deliberate here: this is exactly
    // what silently held `undefined` before the fix, and TypeScript's
    // `private` is compile-time only, so it's the correct site to assert
    // on for a test of the runtime-DI regression specifically.
    expect((controller as unknown as { config: unknown }).config).toBe(fakeConfig);
    expect((controller as unknown as { security: unknown }).security).toBe(fakeSecurity);
    expect((controller as unknown as { rateLimit: unknown }).rateLimit).toBe(fakeRateLimit);
    expect((controller as unknown as { cloudRunIdentity: unknown }).cloudRunIdentity).toBe(fakeCloudRunIdentity);
  });
});
