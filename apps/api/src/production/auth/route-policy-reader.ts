import type { Reflector } from "@nestjs/core";
import {
  capabilityCatalog,
  type CanonicalCapability,
  type CapabilityDescriptor,
} from "@papadata/contracts";
import type { AuthenticationLevel } from "./request-principal.js";
import {
  auditDeniedAccessMetadataKey,
  authenticatedEndpointMetadataKey,
  externalProviderEndpointMetadataKey,
  infrastructureEndpointMetadataKey,
  publicEndpointMetadataKey,
  requiredAuthLevelMetadataKey,
  requiredCapabilitiesMetadataKey,
} from "./route-policy.js";

const capabilityDescriptorByCapability = new Map(
  capabilityCatalog.map((descriptor) => [descriptor.capability, descriptor]),
);

export const authLevelRank: Record<AuthenticationLevel, number> = {
  session: 1,
  mfa: 2,
  step_up: 3,
};

export type CapabilityRiskClass = CapabilityDescriptor["riskClass"];

const riskClassRank: Record<CapabilityRiskClass, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

// Faza 9 §9: when a route requires several capabilities, the audit
// requirement must track the *strongest* one -- a low-risk capability
// bundled onto the same route as a high/critical one must never quietly
// downgrade the requirement.
export function effectiveRiskClassForCapabilities(
  capabilities: readonly CanonicalCapability[],
): CapabilityRiskClass {
  let effective: CapabilityRiskClass = "low";
  for (const capability of capabilities) {
    const descriptor = capabilityDescriptorByCapability.get(capability);
    if (!descriptor) continue;
    if (riskClassRank[descriptor.riskClass] > riskClassRank[effective]) {
      effective = descriptor.riskClass;
    }
  }
  return effective;
}

// Faza 9 §8: the minimum denied-access audit bar -- centrally derived from
// canonical capability metadata so a *new* high/critical route is audited
// by construction, without anyone having to remember to repeat this fact
// via @AuditDeniedAccess() on every such route. The decorator remains a
// valid, honored opt-IN for routes below this bar that want auditing
// anyway (see e.g. ReportController.create, which decorates a
// medium-risk route) -- this only ever adds coverage, never removes it.
export function requiresDeniedAuditByRiskClass(riskClass: CapabilityRiskClass): boolean {
  return riskClass === "high" || riskClass === "critical";
}

export type EndpointClassification =
  | "authenticated"
  | "external-provider"
  | "infrastructure"
  | "public";

export type EffectiveRoutePolicy =
  | {
      readonly auditDeniedAccess: boolean;
      readonly authLevel: AuthenticationLevel;
      readonly capabilities: readonly CanonicalCapability[];
      readonly classification: "authenticated";
      readonly capabilitySemantics: "all";
      readonly effectiveRiskClass: CapabilityRiskClass;
      readonly explicitAuditDeniedAccess: boolean;
      readonly scopeSource: "principal";
    }
  | {
      readonly auditDeniedAccess: false;
      readonly authLevel: null;
      readonly capabilities: readonly [];
      readonly classification:
        | "external-provider"
        | "infrastructure"
        | "public";
      readonly capabilitySemantics: "none";
      readonly effectiveRiskClass: null;
      readonly explicitAuditDeniedAccess: false;
      readonly scopeSource: "external-provider" | "infrastructure" | "none";
    };

export type RoutePolicyReadResult =
  | {
      readonly policy: EffectiveRoutePolicy;
      readonly valid: true;
    }
  | {
      readonly reason: string;
      readonly valid: false;
    };

export function readRoutePolicy(
  reflector: Reflector,
  handler: Function,
  controller: Function,
): RoutePolicyReadResult {
  const targets = [handler, controller];
  const classifications = [
    reflector.getAllAndOverride<boolean>(
      publicEndpointMetadataKey,
      targets,
    )
      ? "public"
      : null,
    reflector.getAllAndOverride<boolean>(
      infrastructureEndpointMetadataKey,
      targets,
    )
      ? "infrastructure"
      : null,
    reflector.getAllAndOverride<boolean>(
      externalProviderEndpointMetadataKey,
      targets,
    )
      ? "external-provider"
      : null,
    reflector.getAllAndOverride<boolean>(
      authenticatedEndpointMetadataKey,
      targets,
    )
      ? "authenticated"
      : null,
  ].filter((value): value is EndpointClassification => value !== null);

  if (classifications.length !== 1) {
    return {
      reason: "endpoint_policy_classification_required",
      valid: false,
    };
  }

  const [classification] = classifications;

  if (classification === "authenticated") {
    const capabilities =
      reflector.getAllAndOverride<readonly CanonicalCapability[]>(
        requiredCapabilitiesMetadataKey,
        targets,
      ) ?? [];

    if (capabilities.length === 0) {
      return {
        reason: "endpoint_capability_policy_required",
        valid: false,
      };
    }

    if (
      capabilities.some(
        (capability) => !capabilityDescriptorByCapability.has(capability),
      )
    ) {
      return {
        reason: "endpoint_capability_catalog_entry_required",
        valid: false,
      };
    }

    const declaredAuthLevel =
      reflector.getAllAndOverride<AuthenticationLevel>(
        requiredAuthLevelMetadataKey,
        targets,
      ) ?? "session";

    const explicitAuditDeniedAccess =
      reflector.getAllAndOverride<boolean>(
        auditDeniedAccessMetadataKey,
        targets,
      ) ?? false;
    const effectiveRiskClass = effectiveRiskClassForCapabilities(capabilities);

    return {
      policy: {
        // Explicit @AuditDeniedAccess() OR riskClass high/critical --
        // either is sufficient, and the derived half means a new
        // high/critical route is covered without needing the decorator at
        // all. See requiresDeniedAuditByRiskClass above.
        auditDeniedAccess:
          explicitAuditDeniedAccess || requiresDeniedAuditByRiskClass(effectiveRiskClass),
        authLevel: strongestAuthenticationLevel(
          declaredAuthLevel,
          requiredAuthenticationLevelForCapabilities(capabilities),
        ),
        capabilities,
        capabilitySemantics: "all",
        classification,
        effectiveRiskClass,
        explicitAuditDeniedAccess,
        scopeSource: "principal",
      },
      valid: true,
    };
  }

  return {
    policy: {
      auditDeniedAccess: false,
      authLevel: null,
      capabilities: [],
      capabilitySemantics: "none",
      classification,
      effectiveRiskClass: null,
      explicitAuditDeniedAccess: false,
      scopeSource:
        classification === "external-provider"
          ? "external-provider"
          : classification === "infrastructure"
            ? "infrastructure"
            : "none",
    },
    valid: true,
  };
}

export function requiredAuthenticationLevelForCapabilities(
  capabilities: readonly CanonicalCapability[],
): AuthenticationLevel {
  let required: AuthenticationLevel = "session";

  for (const capability of capabilities) {
    const descriptor = capabilityDescriptorByCapability.get(capability);
    if (!descriptor) {
      continue;
    }

    if (descriptor.reauthenticationRequired) {
      required = strongestAuthenticationLevel(required, "step_up");
      continue;
    }

    if (descriptor.mfaRequired) {
      required = strongestAuthenticationLevel(required, "mfa");
    }
  }

  return required;
}

function strongestAuthenticationLevel(
  left: AuthenticationLevel,
  right: AuthenticationLevel,
): AuthenticationLevel {
  return authLevelRank[left] >= authLevelRank[right] ? left : right;
}
