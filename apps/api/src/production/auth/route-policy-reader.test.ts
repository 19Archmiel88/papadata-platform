import "reflect-metadata";
import { Controller, Get, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { capabilityCatalog } from "@papadata/contracts";
import { describe, expect, it } from "vitest";
import { listProductionOperations } from "./route-inventory.js";
import {
  AuditDeniedAccess,
  PublicEndpoint,
  RequireAuthLevel,
  RequireCapabilities,
  authenticatedEndpointMetadataKey,
  requiredCapabilitiesMetadataKey,
} from "./route-policy.js";
import { readRoutePolicy } from "./route-policy-reader.js";

const reflector = new Reflector();

describe("readRoutePolicy", () => {
  it("fails closed when an endpoint has no classification", () => {
    class ExampleController {
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_policy_classification_required",
        valid: false,
      });
  });

  it("fails closed when an endpoint has more than one classification", () => {
    @Controller()
    class ExampleController {
      @Get()
      @PublicEndpoint()
      @RequireCapabilities("workspace.read")
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_policy_classification_required",
        valid: false,
      });
  });

  it("fails closed when authenticated metadata has no capabilities", () => {
    class ExampleController {
      @SetMetadata(authenticatedEndpointMetadataKey, true)
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_capability_policy_required",
        valid: false,
      });
  });

  it("fails closed when capability metadata bypasses the canonical decorator", () => {
    class ExampleController {
      @SetMetadata(authenticatedEndpointMetadataKey, true)
      @SetMetadata(requiredCapabilitiesMetadataKey, ["workspace.delete"])
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_capability_catalog_entry_required",
        valid: false,
      });
  });

  it("derives step-up from capability catalog reauthentication requirements", () => {
    class ExampleController {
      @RequireCapabilities("auth.session.revoke")
      @RequireAuthLevel("mfa")
      handler(): void {}
    }

    const result = readRoutePolicy(
      reflector,
      ExampleController.prototype.handler,
      ExampleController,
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.policy.authLevel).toBe("step_up");
    }
  });

  it("derives step-up from critical capability catalog requirements", () => {
    class ExampleController {
      @RequireCapabilities("audit.read")
      handler(): void {}
    }

    const result = readRoutePolicy(
      reflector,
      ExampleController.prototype.handler,
      ExampleController,
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.policy.authLevel).toBe("step_up");
    }
  });

  // Faza 9 §6 regression: an explicit @RequireAuthLevel can only ever
  // strengthen the effective level, never weaken it below what the
  // capability catalog demands -- readRoutePolicy takes the max of the two
  // (see strongestAuthenticationLevel). These deliberately declare the
  // weakest possible level against capabilities that require more, to
  // prove the catalog's requirement always wins.
  it("a route explicitly declaring session cannot weaken a step_up-required capability", () => {
    class ExampleController {
      @RequireCapabilities("auth.session.revoke") // reauthenticationRequired: true
      @RequireAuthLevel("session")
      handler(): void {}
    }

    const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.policy.authLevel).toBe("step_up");
    }
  });

  it("a route explicitly declaring mfa cannot weaken a critical (step_up) capability below step_up", () => {
    class ExampleController {
      @RequireCapabilities("auth.mfa.manage") // riskClass critical -> reauthenticationRequired by default
      @RequireAuthLevel("mfa")
      handler(): void {}
    }

    const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.policy.authLevel).toBe("step_up");
    }
  });

  // Faza 9 §8/§9: denied-access audit requirement is centrally derived from
  // capability riskClass, not solely from a manually-applied
  // @AuditDeniedAccess() -- a new high/critical route is covered by
  // construction. The decorator remains an honored opt-in below that bar.
  describe("auditDeniedAccess derivation from capability riskClass", () => {
    it("auto-requires denied audit for a high-risk capability with no explicit decorator", () => {
      class ExampleController {
        @RequireCapabilities("auth.session.revoke") // riskClass: high
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.effectiveRiskClass).toBe("high");
        expect(result.policy.explicitAuditDeniedAccess).toBe(false);
        expect(result.policy.auditDeniedAccess).toBe(true);
      }
    });

    it("auto-requires denied audit for a critical-risk capability with no explicit decorator", () => {
      class ExampleController {
        @RequireCapabilities("audit.read") // riskClass: critical
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.effectiveRiskClass).toBe("critical");
        expect(result.policy.auditDeniedAccess).toBe(true);
      }
    });

    it("does not require denied audit for a low-risk capability with no explicit decorator", () => {
      class ExampleController {
        @RequireCapabilities("workspace.read") // riskClass: low
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.effectiveRiskClass).toBe("low");
        expect(result.policy.auditDeniedAccess).toBe(false);
      }
    });

    it("does not require denied audit for a medium-risk capability with no explicit decorator", () => {
      class ExampleController {
        @RequireCapabilities("tenant.membership.read") // riskClass: medium
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.effectiveRiskClass).toBe("medium");
        expect(result.policy.auditDeniedAccess).toBe(false);
      }
    });

    it("honors an explicit @AuditDeniedAccess() opt-in on a low-risk route (does not weaken existing behavior)", () => {
      class ExampleController {
        @RequireCapabilities("workspace.read") // riskClass: low
        @AuditDeniedAccess()
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.explicitAuditDeniedAccess).toBe(true);
        expect(result.policy.auditDeniedAccess).toBe(true);
      }
    });

    it("a low-risk capability bundled with a critical one cannot downgrade the audit requirement (§9)", () => {
      class ExampleController {
        @RequireCapabilities("workspace.read", "audit.read") // low + critical
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.effectiveRiskClass).toBe("critical");
        expect(result.policy.auditDeniedAccess).toBe(true);
      }
    });

    it("a low-risk capability bundled with a high-risk one still resolves to high, not low (§9)", () => {
      class ExampleController {
        @RequireCapabilities("workspace.read", "auth.session.revoke") // low + high
        handler(): void {}
      }

      const result = readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController);

      expect(result.valid).toBe(true);
      if (result.valid && result.policy.classification === "authenticated") {
        expect(result.policy.effectiveRiskClass).toBe("high");
        expect(result.policy.auditDeniedAccess).toBe(true);
      }
    });
  });

  it("keeps every production controller route classified and capability-backed", () => {
    const implementedOperations = listProductionOperations();
    const catalogOperations = new Map<string, string>();

    for (const descriptor of capabilityCatalog) {
      for (const operation of descriptor.operations) {
        catalogOperations.set(operation, descriptor.capability);
      }
    }

    expect(implementedOperations.length).toBeGreaterThan(0);

    for (const operation of implementedOperations) {
      const policy = readRoutePolicy(
        reflector,
        operation.handler,
        operation.controller,
      );

      expect(policy, `${operation.httpOperation} must have one valid route policy`)
        .toMatchObject({ valid: true });

      if (!policy.valid || policy.policy.classification !== "authenticated") {
        continue;
      }

      expect(policy.policy.capabilities.length, operation.httpOperation)
        .toBeGreaterThan(0);

      const catalogCapability = catalogOperations.get(operation.httpOperation);
      if (catalogCapability) {
        expect(policy.policy.capabilities, operation.httpOperation)
          .toContain(catalogCapability);
      }
    }
  });
});
