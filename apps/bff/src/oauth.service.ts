import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { signInternalPrincipalToken } from "./internal-principal.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService, readHeader } from "./security.service.js";
import {
  BFF_SESSION_STORE,
  type BffSessionRecord,
  type BffSessionStore,
} from "./session-store.js";
import { BFF_CONFIG } from "./tokens.js";

// Recognized upstream error "detail" strings surfaced as distinct,
// frontend-actionable codes instead of a generic failure — mirrors how the
// upstream ApiProblemFilter puts the thrown Error's message into `detail`.
const knownOAuthErrorDetails = new Set([
  "OAUTH_EMAIL_MISMATCH",
  "OAUTH_TRANSACTION_INVALID",
  "OAUTH_IDENTITY_ALREADY_LINKED",
  "OAUTH_REAUTH_IDENTITY_MISMATCH",
  "OAUTH_REAUTH_CONTEXT_MISSING",
  "OAUTH_LINK_CONTEXT_MISSING",
  "OAUTH_CODE_EXCHANGE_FAILED",
]);

@Injectable()
export class BffOAuthService {
  constructor(
    @Inject(BFF_CONFIG) private readonly config: BffConfig,
    @Inject(BFF_SESSION_STORE) private readonly sessions: BffSessionStore,
    @Inject(BffSecurityService) private readonly security: BffSecurityService,
    @Inject(BffRateLimitService) private readonly rateLimit: BffRateLimitService,
    @Inject(CloudRunIdentityService) private readonly cloudRunIdentity: CloudRunIdentityService,
    @Inject(BffIdentitySessionService) private readonly identitySession: BffIdentitySessionService,
  ) {}

  // Public: login / register / accept_invitation.
  async start(request: FastifyRequest, reply: FastifyReply, body: unknown): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    await this.rateLimit.consumePublic({ ipAddress: request.ip, route: "public-contract" });

    const response = await this.callApiPublic("/v1/identity/oauth/start", request, body);
    await relayJson(response, reply, "OAUTH_START_FAILED");
  }

  // Authenticated: link_account / reauth. Both require an active BFF
  // session and forward it as a signed internal principal, exactly like
  // session-assurance.service.ts does for MFA confirm/step-up.
  async startLink(request: FastifyRequest, reply: FastifyReply, body: unknown): Promise<void> {
    await this.startAuthenticated("link/start", request, reply, body, "OAUTH_LINK_START_FAILED");
  }

  async startReauth(request: FastifyRequest, reply: FastifyReply, body: unknown): Promise<void> {
    await this.startAuthenticated("reauth/start", request, reply, body, "OAUTH_REAUTH_START_FAILED");
  }

  private async startAuthenticated(
    path: "link/start" | "reauth/start",
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
    failureCode: string,
  ): Promise<void> {
    this.security.validateHost(request);
    this.security.validateOrigin(request);
    const session = await this.security.requireSession(request);
    this.security.validateCsrf(request, session);
    await this.rateLimit.consumeRequest({
      accountId: session.userId,
      ipAddress: request.ip,
      sessionId: session.sessionId,
      tenantId: session.activeTenantId,
    });

    const response = await this.callApiAuthenticated(`/v1/identity/oauth/${path}`, request, session, body);
    await relayJson(response, reply, failureCode);
  }

  // Handles every intent's callback. No principal is forwarded here — for
  // link_account/reauth the target user was already captured server-side
  // in the transaction at start time, so the callback itself only needs
  // to read the CURRENT session cookie (if any) to know which session to
  // update on a "reauth_confirmed" outcome.
  async callback(request: FastifyRequest, reply: FastifyReply, body: unknown): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);

    const response = await this.callApiPublic("/v1/identity/oauth/callback", request, body);
    const payload = await readJson(response);

    if (!response.ok) {
      const detail = upstreamDetail(payload);
      const code = detail && knownOAuthErrorDetails.has(detail) ? detail : "OAUTH_CALLBACK_FAILED";
      reply.status(response.status >= 400 && response.status < 500 ? response.status : 502).send({
        error: { code, message: detail ?? "OAuth callback failed." },
      });
      return;
    }

    const data = unwrapData(payload);
    if (!isRecord(data) || typeof data.outcome !== "string") {
      reply.status(502).send({ error: { code: "OAUTH_CALLBACK_INVALID", message: "OAuth callback response is invalid." } });
      return;
    }

    // The callback URL only ever carries code/state — this is the only
    // way the frontend landing page learns where to continue afterward,
    // success or not.
    const returnTo = optionalString(data.returnTo);

    if (data.outcome === "authenticated") {
      const userId = optionalString(data.userId);
      const email = optionalString(data.email);
      const displayName = optionalString(data.displayName);
      const memberships = readMemberships(data.memberships);
      if (!userId || !email || !displayName) {
        reply.status(502).send({ error: { code: "OAUTH_CALLBACK_INVALID", message: "OAuth callback response is invalid." } });
        return;
      }
      await this.identitySession.establishSession(
        request,
        reply,
        { displayName, email, memberships, userId },
        { outcome: "authenticated", returnTo },
      );
      return;
    }

    if (data.outcome === "linked") {
      reply.status(200).send({ data: { linked: true, outcome: "linked", provider: optionalString(data.provider), returnTo } });
      return;
    }

    if (data.outcome === "reauth_confirmed") {
      await this.applyReauthConfirmation(request, reply, optionalString(data.expiresAt), returnTo);
      return;
    }

    // Non-authenticating, non-error outcomes (no_linked_account,
    // email_already_registered, invitation_invalid): relay as-is so the
    // frontend can render the matching state without a session change.
    reply.status(200).send({ data });
  }

  private async applyReauthConfirmation(
    request: FastifyRequest,
    reply: FastifyReply,
    expiresAt: string | null,
    returnTo: string | null,
  ): Promise<void> {
    if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
      reply.status(502).send({ error: { code: "OAUTH_CALLBACK_INVALID", message: "Reauth confirmation is invalid." } });
      return;
    }

    let session: BffSessionRecord;
    try {
      session = await this.security.requireSession(request);
    } catch {
      // The reauth flow always starts from an authenticated tab, but the
      // callback redirect is a fresh navigation — if the session cookie
      // is genuinely missing (different browser/profile), fail closed
      // rather than silently doing nothing.
      reply.status(401).send({ error: { code: "OAUTH_REAUTH_NO_SESSION", message: "No active session to reauthenticate." } });
      return;
    }

    const updatedSession: BffSessionRecord = {
      ...session,
      authLevel: "step_up",
      stepUpExpiresAt: expiresAt,
    };
    await this.sessions.saveSession(updatedSession);
    reply.status(200).send({
      data: {
        outcome: "reauth_confirmed",
        returnTo,
        session: publicSession(updatedSession),
        stepUpExpiresAt: expiresAt,
      },
    });
  }

  private async callApiPublic(path: string, request: FastifyRequest, body: unknown): Promise<Response> {
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
    return fetch(`${this.config.apiOrigin}${path}`, {
      body: JSON.stringify(isRecord(body) ? body : {}),
      headers: {
        "content-type": "application/json",
        "x-correlation-id": readHeader(request.headers, "x-correlation-id") ?? randomUUID(),
        ...(upstreamAuthorization ? { authorization: upstreamAuthorization } : {}),
      },
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
    });
  }

  private async callApiAuthenticated(
    path: string,
    request: FastifyRequest,
    session: BffSessionRecord,
    body: unknown,
  ): Promise<Response> {
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
    const headers = new Headers();
    headers.set("content-type", "application/json");
    headers.set("x-correlation-id", readHeader(request.headers, "x-correlation-id") ?? randomUUID());
    headers.set(this.config.requestIdHeaderName, randomUUID());
    headers.set(
      this.config.internalPrincipalHeaderName,
      signInternalPrincipalToken(session, this.config, new Date()),
    );
    headers.set("idempotency-key", randomUUID());
    if (upstreamAuthorization) headers.set("authorization", upstreamAuthorization);

    return fetch(`${this.config.apiOrigin}${path}`, {
      body: JSON.stringify(isRecord(body) ? body : {}),
      headers,
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
    });
  }
}

async function relayJson(response: Response, reply: FastifyReply, failureCode: string): Promise<void> {
  const payload = await readJson(response);
  if (!response.ok) {
    const detail = upstreamDetail(payload);
    reply.status(response.status >= 400 && response.status < 500 ? response.status : 502).send({
      error: { code: detail && knownOAuthErrorDetails.has(detail) ? detail : failureCode, message: detail ?? "Request failed." },
    });
    return;
  }
  reply.status(200).send({ data: unwrapData(payload) });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json() as unknown;
  } catch {
    return null;
  }
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && isRecord(value.data)) return value.data;
  return value;
}

function upstreamDetail(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.detail === "string") return payload.detail;
  if (typeof payload.message === "string") return payload.message;
  return null;
}

function publicSession(session: BffSessionRecord): object {
  return {
    activeTenantId: session.activeTenantId,
    activeWorkspaceId: session.activeWorkspaceId,
    authLevel: session.authLevel,
    capabilities: session.capabilities,
    expiresAt: session.expiresAt,
    memberships: session.memberships,
    sessionId: session.sessionId,
    stepUpExpiresAt: session.stepUpExpiresAt,
    userId: session.userId,
  };
}

function readMemberships(value: unknown): readonly BffSessionRecord["memberships"][number][] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const tenantId = optionalString(item.tenantId);
    const tenantName = optionalString(item.tenantName);
    const workspaceId = optionalString(item.workspaceId);
    const workspaceName = optionalString(item.workspaceName);
    const capabilities = stringArray(item.capabilities);
    const roles = stringArray(item.roles);
    return tenantId && workspaceId && capabilities.length > 0
      ? [{
          tenantId,
          ...(tenantName ? { tenantName } : {}),
          workspaceId,
          ...(workspaceName ? { workspaceName } : {}),
          capabilities,
          roles,
        }]
      : [];
  });
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
