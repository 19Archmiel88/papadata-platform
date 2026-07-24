import { applyDecorators, SetMetadata } from "@nestjs/common";
import {
  canonicalCapabilities,
  type CanonicalCapability,
} from "@papadata/contracts";
import type { AuthenticationLevel } from "./request-principal.js";

export const publicEndpointMetadataKey = "papadata:route-policy:public";
export const infrastructureEndpointMetadataKey =
  "papadata:route-policy:infrastructure";
export const externalProviderEndpointMetadataKey =
  "papadata:route-policy:external-provider";
export const authenticatedEndpointMetadataKey =
  "papadata:route-policy:authenticated";
export const requiredCapabilitiesMetadataKey =
  "papadata:route-policy:capabilities";
export const requiredAuthLevelMetadataKey =
  "papadata:route-policy:auth-level";
export const auditDeniedAccessMetadataKey =
  "papadata:route-policy:audit-denied-access";

const canonicalCapabilitySet = new Set<string>(canonicalCapabilities);

export function isCanonicalCapability(
  value: string,
): value is CanonicalCapability {
  return canonicalCapabilitySet.has(value);
}

export function PublicEndpoint(): MethodDecorator {
  return SetMetadata(publicEndpointMetadataKey, true);
}

export function InfrastructureEndpoint(): MethodDecorator {
  return SetMetadata(infrastructureEndpointMetadataKey, true);
}

export function ExternalProviderEndpoint(): MethodDecorator {
  return SetMetadata(externalProviderEndpointMetadataKey, true);
}

export function RequireCapabilities(
  ...capabilities: readonly [CanonicalCapability, ...CanonicalCapability[]]
): MethodDecorator {
  for (const capability of capabilities) {
    if (!isCanonicalCapability(capability)) {
      throw new Error(`Capability is not canonical: ${capability}`);
    }
  }

  return applyDecorators(
    SetMetadata(authenticatedEndpointMetadataKey, true),
    SetMetadata(requiredCapabilitiesMetadataKey, capabilities),
  );
}

export function RequireAuthLevel(level: AuthenticationLevel): MethodDecorator {
  return SetMetadata(requiredAuthLevelMetadataKey, level);
}

export function AuditDeniedAccess(): MethodDecorator {
  return SetMetadata(auditDeniedAccessMetadataKey, true);
}
