import "reflect-metadata";
import { Controller, Get, Post, RequestMethod, SetMetadata } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import type { ProductionRouteOperation } from "./route-inventory.js";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
  authenticatedEndpointMetadataKey,
} from "./route-policy.js";
import {
  buildAuditCoverageRegistry,
  checkAuthLevelNotWeakened,
  checkCoverageRegistryEntryIsLive,
  checkDeniedAuditCoverage,
  checkSuccessAuditCoverage,
} from "./audit-coverage-registry.js";

describe("buildAuditCoverageRegistry against the real production route inventory", () => {
  it("has zero violations across every production route (the actual Faza 9 CI gate)", () => {
    const registry = buildAuditCoverageRegistry();

    if (registry.violations.length > 0) {
      // Fail with the full violation list in the message -- a bare
      // "expected 0" is useless for diagnosing which route broke.
      throw new Error(
        `${registry.violations.length} authorization/audit coverage violation(s):\n`
        + registry.violations.map((violation) => `  [${violation.type}] ${violation.httpOperation}: ${violation.message}`).join("\n"),
      );
    }
  });

  it("reports plausible, internally-consistent evidence totals", () => {
    const { entries, evidence } = buildAuditCoverageRegistry();

    expect(evidence.totalRoutes).toBe(entries.length);
    expect(evidence.totalRoutes).toBeGreaterThan(200);
    expect(evidence.authenticatedRoutes).toBeGreaterThan(0);
    expect(evidence.publicRoutes).toBeGreaterThan(0);
    expect(
      evidence.authenticatedRoutes + evidence.publicRoutes + evidence.infrastructureRoutes + evidence.externalProviderRoutes,
    ).toBe(evidence.totalRoutes);
    expect(evidence.unclassified).toBe(0);
    // Zero violations (previous test) implies every required denied audit
    // is actually covered.
    expect(evidence.deniedAuditCovered).toBe(evidence.deniedAuditRequired);
  });

  // Blocker fix regression: required > covered with zero violations was a
  // real logic bug (missing_success_audit didn't exist yet). This locks in
  // the corrected invariant against the real 295-route inventory, not just
  // the adversarial synthetic fixtures below.
  it("never reports successAuditRequired > successAuditCovered (the blocker bug)", () => {
    const { evidence } = buildAuditCoverageRegistry();

    expect(evidence.successAuditCovered).toBe(evidence.successAuditRequired);
    expect(evidence.missingSuccessAudits).toBe(0);
  });

  it("reports.download (reports.download) is SUCCESS_AUDIT_REQUIRED and verified-covered", () => {
    const { entries } = buildAuditCoverageRegistry();
    const entry = entries.find((item) => item.operationId === "reports.download");

    expect(entry).toBeDefined();
    expect(entry?.successAuditDecision).toBe("SUCCESS_AUDIT_REQUIRED");
    expect(entry?.successAuditCovered).toBe(true);
  });

  it("never leaves an authenticated route without both a denied-audit and a success-audit decision (§7, §27 item 9)", () => {
    const { entries } = buildAuditCoverageRegistry();

    for (const entry of entries.filter((item) => item.classification === "authenticated")) {
      expect(entry.deniedAuditDecision, entry.httpOperation).not.toBeNull();
      expect(["DENIED_AUDIT_REQUIRED", "DENIED_AUDIT_NOT_REQUIRED"]).toContain(entry.deniedAuditDecision);
      expect(entry.successAuditDecision, entry.httpOperation).not.toBeNull();
      expect(["SUCCESS_AUDIT_REQUIRED", "SUCCESS_AUDIT_NOT_REQUIRED"]).toContain(entry.successAuditDecision);
    }
  });

  // Faza 9 §26: machine-readable evidence, written as a side effect of the
  // gate test itself so evidence generation never needs its own separate
  // execution path (and therefore never needs its own decision about
  // whether it's allowed to depend on a prior `pnpm build` -- it inherits
  // this file's already-proven dist-independence for free). Deterministic
  // given the working tree: no random data, only a generatedAt/gitHead pair
  // matching the convention already used by artifacts/backend-evidence/
  // validation-results.json.
  it("writes deterministic machine-readable evidence to artifacts/backend-evidence/rbac-audit-coverage.json", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { execSync } = await import("node:child_process");
    const { fileURLToPath } = await import("node:url");
    const { resolve } = await import("node:path");

    const registry = buildAuditCoverageRegistry();
    const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../..");
    const evidenceDir = resolve(repoRoot, "artifacts/backend-evidence");
    const gitHead = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim();

    const evidence = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      gitHead,
      ...registry.evidence,
      violationDetails: registry.violations,
    };

    await mkdir(evidenceDir, { recursive: true });
    await writeFile(
      resolve(evidenceDir, "rbac-audit-coverage.json"),
      `${JSON.stringify(evidence, null, 2)}\n`,
      "utf8",
    );

    expect(registry.violations).toHaveLength(0);
  });
});

describe("buildAuditCoverageRegistry adversarial regression coverage (§27)", () => {
  it("#1 authenticated endpoint without any capability -> FAIL (invalid_route_policy)", () => {
    @Controller("v1/synthetic")
    class BrokenController {
      @Get("no-capability")
      @SetMetadata(authenticatedEndpointMetadataKey, true)
      @OperationId("synthetic.no_capability")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(BrokenController, "handler"));

    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "invalid_route_policy" }));
  });

  it("#2 unknown/non-canonical capability -> FAIL (invalid_route_policy)", () => {
    @Controller("v1/synthetic")
    class BrokenController {
      @Get("unknown-capability")
      @SetMetadata(authenticatedEndpointMetadataKey, true)
      @SetMetadata("papadata:route-policy:capabilities", ["not.a.real.capability"])
      @OperationId("synthetic.unknown_capability")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(BrokenController, "handler"));

    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "invalid_route_policy" }));
  });

  it("#3a missing classification -> FAIL (invalid_route_policy)", () => {
    @Controller("v1/synthetic")
    class BrokenController {
      @Get("no-classification")
      @OperationId("synthetic.no_classification")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(BrokenController, "handler"));

    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "invalid_route_policy" }));
  });

  it("#3b conflicting/duplicate classification -> FAIL (invalid_route_policy)", () => {
    @Controller("v1/synthetic")
    class BrokenController {
      @Get("double-classification")
      @SetMetadata("papadata:route-policy:public", true)
      @RequireCapabilities("workspace.read")
      @OperationId("synthetic.double_classification")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(BrokenController, "handler"));

    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "invalid_route_policy" }));
  });

  it("#4a duplicate operationId across two distinct routes -> FAIL", () => {
    @Controller("v1/synthetic")
    class DupeController {
      @Get("one")
      @RequireCapabilities("workspace.read")
      @OperationId("synthetic.duplicate")
      first(): void {}

      @Get("two")
      @RequireCapabilities("workspace.read")
      @OperationId("synthetic.duplicate")
      second(): void {}
    }

    const registry = buildAuditCoverageRegistry([
      ...operationsFor(DupeController, "first"),
      ...operationsFor(DupeController, "second"),
    ]);

    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "duplicate_operation_id" }));
  });

  it("#4b missing operationId -> FAIL", () => {
    @Controller("v1/synthetic")
    class BrokenController {
      @Get("no-operation-id")
      @RequireCapabilities("workspace.read")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(BrokenController, "handler"));

    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "missing_operation_id" }));
  });

  it("#5/#6 checkDeniedAuditCoverage: high/critical risk without audit -> FAIL (deliberately-broken input)", () => {
    // readRoutePolicy can never actually produce this combination (its own
    // auditDeniedAccess computation ORs the derived requirement in) -- this
    // proves the *check itself* still catches it if that derivation were
    // ever broken by a future change.
    expect(checkDeniedAuditCoverage("GET /v1/synthetic/high", "high", false))
      .toMatchObject({ type: "missing_denied_audit" });
    expect(checkDeniedAuditCoverage("GET /v1/synthetic/critical", "critical", false))
      .toMatchObject({ type: "missing_denied_audit" });
  });

  it("checkDeniedAuditCoverage: low/medium risk without audit -> PASS (no violation)", () => {
    expect(checkDeniedAuditCoverage("GET /v1/synthetic/low", "low", false)).toBeNull();
    expect(checkDeniedAuditCoverage("GET /v1/synthetic/medium", "medium", false)).toBeNull();
  });

  it("checkDeniedAuditCoverage: high/critical risk WITH audit -> PASS", () => {
    expect(checkDeniedAuditCoverage("GET /v1/synthetic/high", "high", true)).toBeNull();
    expect(checkDeniedAuditCoverage("GET /v1/synthetic/critical", "critical", true)).toBeNull();
  });

  it("#7 checkAuthLevelNotWeakened: effective level weaker than capability catalog requires -> FAIL (deliberately-broken input)", () => {
    // auth.session.revoke has reauthenticationRequired: true (step_up).
    // A real route can never end up with authLevel "session" here (see the
    // route-policy-reader.test.ts adversarial tests), so this feeds the
    // checker a fabricated inconsistent state directly.
    expect(checkAuthLevelNotWeakened("DELETE /v1/synthetic", ["auth.session.revoke"], "session"))
      .toMatchObject({ type: "weak_auth_level" });
    expect(checkAuthLevelNotWeakened("DELETE /v1/synthetic", ["auth.mfa.manage"], "mfa"))
      .toMatchObject({ type: "weak_auth_level" });
  });

  it("checkAuthLevelNotWeakened: effective level meets or exceeds the requirement -> PASS", () => {
    expect(checkAuthLevelNotWeakened("DELETE /v1/synthetic", ["auth.session.revoke"], "step_up")).toBeNull();
    expect(checkAuthLevelNotWeakened("GET /v1/synthetic", ["workspace.read"], "session")).toBeNull();
  });

  it("#8 checkCoverageRegistryEntryIsLive: coverage entry naming a nonexistent operationId -> FAIL", () => {
    const violation = checkCoverageRegistryEntryIsLive("some.operation.that.does.not.exist", new Set(["reports.download"]));

    expect(violation).toMatchObject({ type: "stale_coverage_registry_entry" });
  });

  it("checkCoverageRegistryEntryIsLive: coverage entry naming a real operationId -> PASS", () => {
    expect(checkCoverageRegistryEntryIsLive("reports.download", new Set(["reports.download"]))).toBeNull();
  });

  // Blocker fix regression (§6 of the follow-up task): the exact bug that
  // was reported -- an operation marked SUCCESS_AUDIT_REQUIRED with no
  // verified writer -- must be a hard violation, never a silent pass.
  it("checkSuccessAuditCoverage: SUCCESS_AUDIT_REQUIRED with no verified coverage -> FAIL", () => {
    expect(checkSuccessAuditCoverage("GET /v1/synthetic/sensitive-read", "SUCCESS_AUDIT_REQUIRED", false))
      .toMatchObject({ type: "missing_success_audit" });
    expect(checkSuccessAuditCoverage("GET /v1/synthetic/sensitive-read", "SUCCESS_AUDIT_REQUIRED", null))
      .toMatchObject({ type: "missing_success_audit" });
  });

  it("checkSuccessAuditCoverage: SUCCESS_AUDIT_REQUIRED with verified coverage -> PASS", () => {
    expect(checkSuccessAuditCoverage("GET /v1/synthetic/sensitive-read", "SUCCESS_AUDIT_REQUIRED", true)).toBeNull();
  });

  it("checkSuccessAuditCoverage: SUCCESS_AUDIT_NOT_REQUIRED or null decision -> PASS regardless of coverage", () => {
    expect(checkSuccessAuditCoverage("GET /v1/synthetic/plain-read", "SUCCESS_AUDIT_NOT_REQUIRED", false)).toBeNull();
    expect(checkSuccessAuditCoverage("GET /v1/synthetic/public", null, false)).toBeNull();
  });

  // §6 of the blocker follow-up, end-to-end: a route whose operationId is
  // declared "requires success audit" (sensitiveReadOperationIds) but has
  // no matching entry in explicitSuccessAuditWriters must fail the *whole
  // gate* through buildAuditCoverageRegistry() itself -- not just the
  // standalone checker function above. This is exactly the bug that
  // shipped as successAuditRequired=102/successAuditCovered=101/
  // violations=0: a required-but-uncovered operation produced no
  // violation. Reproduced here with a synthetic GET route so the fixture
  // doesn't depend on (or risk polluting) the real reports.download entry.
  it("buildAuditCoverageRegistry: an operation requiring success audit with no verified writer fails the whole gate", () => {
    @Controller("v1/synthetic")
    class UncoveredSensitiveReadController {
      @Get("uncovered")
      @RequireCapabilities("reports.download") // riskClass high, matches a real sensitive-read shape
      @RequireAuthLevel("step_up")
      @AuditDeniedAccess()
      @OperationId("synthetic.uncovered_sensitive_read")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(
      operationsFor(UncoveredSensitiveReadController, "handler"),
      {
        // Declared as requiring success audit, but deliberately NOT added
        // to explicitSuccessAuditWriters -- the exact "forgot to build the
        // writer" scenario.
        explicitSuccessAuditWriters: new Set(),
        includeOrphanCapabilityCheck: false,
        sensitiveReadOperationIds: new Set(["synthetic.uncovered_sensitive_read"]),
      },
    );

    expect(registry.violations.length).toBeGreaterThan(0);
    expect(registry.violations).toContainEqual(expect.objectContaining({ type: "missing_success_audit" }));
    const [entry] = registry.entries;
    expect(entry?.successAuditDecision).toBe("SUCCESS_AUDIT_REQUIRED");
    expect(entry?.successAuditCovered).toBe(false);
  });

  it("buildAuditCoverageRegistry: the same operation with a verified writer added produces zero violations", () => {
    @Controller("v1/synthetic")
    class CoveredSensitiveReadController {
      @Get("covered")
      @RequireCapabilities("reports.download")
      @RequireAuthLevel("step_up")
      @AuditDeniedAccess()
      @OperationId("synthetic.covered_sensitive_read")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(
      operationsFor(CoveredSensitiveReadController, "handler"),
      {
        explicitSuccessAuditWriters: new Set(["synthetic.covered_sensitive_read"]),
        includeOrphanCapabilityCheck: false,
        sensitiveReadOperationIds: new Set(["synthetic.covered_sensitive_read"]),
      },
    );

    expect(registry.violations).toHaveLength(0);
    expect(registry.entries[0]?.successAuditCovered).toBe(true);
  });

  it("#9 a well-formed new authenticated route always gets a concrete (non-UNKNOWN) audit decision", () => {
    @Controller("v1/synthetic")
    class NewRouteController {
      @Post("brand-new-mutation")
      @RequireCapabilities("workspace.manage")
      @OperationId("synthetic.brand_new_mutation")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(NewRouteController, "handler"), { includeOrphanCapabilityCheck: false });
    const [entry] = registry.entries;

    expect(entry.deniedAuditDecision).toBe("DENIED_AUDIT_REQUIRED"); // workspace.manage is riskClass "high"
    expect(entry.successAuditDecision).toBe("SUCCESS_AUDIT_REQUIRED"); // POST is state-changing
  });

  it("a low-risk capability bundled with a critical one on the same route still requires denied audit (§9)", () => {
    @Controller("v1/synthetic")
    class BundledController {
      @Get("bundled")
      @RequireCapabilities("workspace.read", "audit.read")
      @OperationId("synthetic.bundled")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(BundledController, "handler"), { includeOrphanCapabilityCheck: false });

    expect(registry.violations).toHaveLength(0);
    expect(registry.entries[0]?.deniedAuditDecision).toBe("DENIED_AUDIT_REQUIRED");
  });

  it("a properly decorated route with an explicit @AuditDeniedAccess() and matching auth level produces zero violations", () => {
    @Controller("v1/synthetic")
    class GoodController {
      @Post("well-formed")
      @RequireCapabilities("workspace.manage")
      @RequireAuthLevel("mfa")
      @AuditDeniedAccess()
      @OperationId("synthetic.well_formed")
      handler(): void {}
    }

    const registry = buildAuditCoverageRegistry(operationsFor(GoodController, "handler"), { includeOrphanCapabilityCheck: false });

    expect(registry.violations).toHaveLength(0);
  });
});

function operationsFor(
  controller: Function,
  methodName: string,
): readonly ProductionRouteOperation[] {
  const controllerPath = readPath(Reflect.getMetadata(PATH_METADATA, controller));
  const prototype = controller.prototype as unknown as Record<string, Function>;
  const handler = prototype[methodName];
  if (!handler) throw new Error(`No such method: ${methodName}`);
  const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod;
  const methodPath = readPath(Reflect.getMetadata(PATH_METADATA, handler));
  const methodNames: Partial<Record<RequestMethod, string>> = {
    [RequestMethod.GET]: "GET",
    [RequestMethod.POST]: "POST",
    [RequestMethod.PUT]: "PUT",
    [RequestMethod.DELETE]: "DELETE",
    [RequestMethod.PATCH]: "PATCH",
  };
  const httpMethod = methodNames[method] ?? "UNKNOWN";
  const path = joinRoutePath(controllerPath, methodPath);
  return [{ controller, handler, httpMethod, httpOperation: `${httpMethod} ${path}`, path }];
}

function readPath(value: unknown): string {
  if (Array.isArray(value)) return readPath(value[0]);
  return typeof value === "string" ? value : "";
}

function joinRoutePath(controllerPath: string, methodPath: string): string {
  const path = [controllerPath, methodPath]
    .filter((part) => part.length > 0)
    .join("/")
    .replaceAll(/\/+/gu, "/");
  return `/${path}`.replace(/\/$/u, "") || "/";
}
