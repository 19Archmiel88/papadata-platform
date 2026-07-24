import type { Reflector } from "@nestjs/core";
import type { CanonicalCapability } from "@papadata/contracts";
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

    return {
      policy: {
        auditDeniedAccess:
          reflector.getAllAndOverride<boolean>(
            auditDeniedAccessMetadataKey,
            targets,
          ) ?? false,
        authLevel:
          reflector.getAllAndOverride<AuthenticationLevel>(
            requiredAuthLevelMetadataKey,
            targets,
          ) ?? "session",
        capabilities,
        capabilitySemantics: "all",
        classification,
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
