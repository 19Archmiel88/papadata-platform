import type { CanonicalCapability } from "@papadata/contracts";

export const authenticationLevels = ["session", "mfa", "step_up"] as const;

export type AuthenticationLevel = (typeof authenticationLevels)[number];

export type RequestPrincipalMembership = {
  readonly capabilities: readonly CanonicalCapability[];
  readonly roles: readonly string[];
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type RequestPrincipal = {
  readonly authLevel: AuthenticationLevel;
  readonly capabilities: readonly CanonicalCapability[];
  readonly expiresAt: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly memberships: readonly RequestPrincipalMembership[];
  readonly sessionId: string;
  readonly source: "internal_token";
  readonly stepUpExpiresAt: string | null;
  readonly tenantId: string;
  readonly userId: string;
  readonly workspaceId: string;
};

export type RequestWithPrincipal = {
  readonly headers?: Record<string, string | readonly string[] | undefined>;
  readonly method?: string;
  principal?: RequestPrincipal;
  readonly url?: string;
};

const authLevelRank: Record<AuthenticationLevel, number> = {
  session: 1,
  mfa: 2,
  step_up: 3,
};

export function isAuthenticationLevel(value: string): value is AuthenticationLevel {
  return (authenticationLevels as readonly string[]).includes(value);
}

export function meetsAuthenticationLevel(
  principal: RequestPrincipal,
  required: AuthenticationLevel,
  now: Date,
): boolean {
  if (authLevelRank[principal.authLevel] < authLevelRank[required]) {
    return false;
  }

  if (required !== "step_up") {
    return true;
  }

  return Boolean(
    principal.stepUpExpiresAt
      && Date.parse(principal.stepUpExpiresAt) > now.getTime(),
  );
}

export function hasActiveMembership(principal: RequestPrincipal): boolean {
  return principal.memberships.some(
    (membership) =>
      membership.tenantId === principal.tenantId
      && membership.workspaceId === principal.workspaceId,
  );
}
