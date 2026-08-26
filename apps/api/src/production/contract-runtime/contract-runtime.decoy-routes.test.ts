import assert from "node:assert/strict";
import { test } from "node:test";
import { ForbiddenException } from "@nestjs/common";
import type { ProductionDatabase } from "@papadata/database";
import { ContractRuntimeService } from "./contract-runtime.service.ts";
import type { IdentityService } from "../identity/identity.service.ts";
import { OAuthProviderConfig } from "../identity/oauth-provider.config.ts";
import type { IntegrationService } from "../integrations/integration.service.ts";
import type { Argon2PasswordService } from "../security/argon2.service.ts";
import type { RequestPrincipal } from "../auth/request-principal.ts";

// These operationIds are real, publicly routed contract endpoints
// (`apps/api/src/production/contract-runtime/generated/identity-access.controller.ts`)
// that have no dedicated handler in ContractRuntimeService. Without an
// explicit rejection they used to fall through to the generic
// ProductDomainRepository upsert and echo back a fake "success" that
// performed no real work — this test proves each one now rejects instead.

const service = new ContractRuntimeService(
  {} as ProductionDatabase,
  {} as IdentityService,
  {} as IntegrationService,
  {} as Argon2PasswordService,
  new OAuthProviderConfig(),
);

const principal: RequestPrincipal = {
  authLevel: "step_up",
  capabilities: ["auth.session.revoke", "auth.mfa.enroll"],
  expiresAt: "2026-01-01T00:00:00.000Z",
  issuedAt: "2026-01-01T00:00:00.000Z",
  issuer: "papadata-bff",
  memberships: [],
  sessionId: "session_decoy_routes_test",
  source: "internal_token",
  stepUpExpiresAt: "2026-01-01T00:00:00.000Z",
  tenantId: "tenant_decoy_routes_test",
  userId: "user_decoy_routes_test",
  workspaceId: "workspace_decoy_routes_test",
};

function authenticatedRequest(operationId: string) {
  return {
    operationId,
    method: "POST" as const,
    servicePath: `/v1/${operationId.replace(/\./gu, "/")}`,
    body: {},
    query: {},
    params: {},
    correlationId: null,
    idempotencyKey: `idem_${operationId}`,
  };
}

function publicRequest(operationId: string) {
  return {
    ...authenticatedRequest(operationId),
    idempotencyKey: null,
  };
}

const decoyAuthenticatedOperations = [
  "auth.account.link",
  "auth.mfa.enroll",
  "auth.mfa.confirm",
  "auth.mfa.verify",
  "auth.reauthenticate",
  "auth.logout",
  "auth.consents.accept",
];

for (const operationId of decoyAuthenticatedOperations) {
  test(`${operationId} rejects instead of faking success via executeAuthenticated`, async () => {
    await assert.rejects(
      () => service.executeAuthenticated(principal, authenticatedRequest(operationId)),
      (error: unknown) => error instanceof ForbiddenException,
    );
  });
}

const decoyPublicOperations = [
  "auth.oauth.start",
  "auth.oauth.callback",
  "auth.registration.finalize",
  "auth.email.verify",
];

for (const operationId of decoyPublicOperations) {
  test(`${operationId} rejects instead of executing via executePublic`, async () => {
    await assert.rejects(
      () => service.executePublic(publicRequest(operationId), { correlationId: null, ipAddress: null }),
      (error: unknown) => error instanceof ForbiddenException,
    );
  });
}
