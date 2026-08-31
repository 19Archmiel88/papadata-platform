import {
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { signInternalPrincipalToken } from "./internal-principal.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import {
  BFF_SESSION_STORE,
  type BffSessionRecord,
  type BffSessionStore,
} from "./session-store.js";
import {
  BffSecurityService,
  clearAuthCookies,
  readHeader,
} from "./security.service.js";
import { BFF_CONFIG } from "./tokens.js";

@Injectable()
export class BffSessionAssuranceService {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,

    @Inject(BFF_SESSION_STORE)
    private readonly sessions: BffSessionStore,

    @Inject(BffSecurityService)
    private readonly security: BffSecurityService,

    @Inject(BffRateLimitService)
    private readonly rateLimit: BffRateLimitService,

    @Inject(CloudRunIdentityService)
    private readonly cloudRunIdentity: CloudRunIdentityService,
  ) {}

  async confirmMfa(
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.applyCorsHeaders(request, reply);
    const session = await this.requireMutableSession(request);
    const response = await this.callApi({
      body: normalizeBody(body),
      path: "/v1/security/mfa/confirm",
      request,
      session,
    });

    const payload = await readJson(response);
    const data = unwrapData(payload);

    if (!response.ok) {
      sendUpstreamFailure(reply, response, "MFA_CONFIRM_FAILED");
      return;
    }

    if (!isRecord(data) || data.verified !== true) {
      reply.status(403).send({
        error: {
          code: "MFA_CONFIRM_FAILED",
          message: "MFA confirmation failed.",
        },
      });
      return;
    }

    const updatedSession: BffSessionRecord = {
      ...session,
      authLevel: "mfa",
      stepUpExpiresAt: null,
    };

    await this.sessions.saveSession(updatedSession);
    // mfa/confirm only ever fires while confirming a pending TOTP
    // enrollment (first-time or a rotated secret) -- see
    // TotpService's pending -> active state machine -- never as a
    // recurring per-login check against an already-active enrollment. A
    // newly confirmed factor is exactly the "security changed" event that
    // should invalidate any other session that was authenticated under
    // the old one; the session that just proved the new factor stays
    // signed in.
    await this.sessions.revokeAllSessionsForUser(
      session.userId,
      new Date().toISOString(),
      session.sessionId,
    );

    reply.status(200).send({
      data: {
        session: publicSession(updatedSession),
        verified: true,
      },
    });
  }

  // Per-login MFA challenge: elevates a session from authLevel="session" to
  // "mfa" by proving an already-active TOTP factor. Unlike confirmMfa, this
  // is not a "security changed" event (no new/rotated factor, no
  // enrollment state change) so sibling sessions are left alone -- it is
  // simply how every ordinary login proves its second factor.
  async verifyMfa(
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.applyCorsHeaders(request, reply);
    const session = await this.requireMutableSession(request);
    await this.rateLimit.consumeMfaAttempt({
      accountId: session.userId,
      ipAddress: request.ip,
      route: "mfa-verify",
    });

    const response = await this.callApi({
      body: normalizeBody(body),
      path: "/v1/security/mfa/verify",
      request,
      session,
    });

    const payload = await readJson(response);
    const data = unwrapData(payload);

    if (!response.ok) {
      sendUpstreamFailure(reply, response, "MFA_VERIFY_FAILED");
      return;
    }

    if (!isRecord(data) || data.verified !== true) {
      reply.status(403).send({
        error: {
          code: "MFA_VERIFY_FAILED",
          message: "MFA verification failed.",
        },
      });
      return;
    }

    const updatedSession: BffSessionRecord = {
      ...session,
      authLevel: session.authLevel === "session" ? "mfa" : session.authLevel,
    };

    await this.sessions.saveSession(updatedSession);

    reply.status(200).send({
      data: {
        session: publicSession(updatedSession),
        verified: true,
      },
    });
  }

  // Alternate path to the same outcome as verifyMfa when the TOTP device is
  // unavailable -- redeems one of the ten single-use recovery codes issued
  // at enroll time. Also not a "security changed" event on its own (the
  // enrollment itself is untouched), so sibling sessions are left alone;
  // the code's single-use enforcement lives in the database.
  async redeemMfaRecoveryCode(
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.applyCorsHeaders(request, reply);
    const session = await this.requireMutableSession(request);
    await this.rateLimit.consumeMfaAttempt({
      accountId: session.userId,
      ipAddress: request.ip,
      route: "recovery-redeem",
    });

    const response = await this.callApi({
      body: normalizeBody(body),
      path: "/v1/security/mfa/recovery-code/redeem",
      request,
      session,
    });

    const payload = await readJson(response);
    const data = unwrapData(payload);

    if (!response.ok) {
      sendUpstreamFailure(reply, response, "MFA_RECOVERY_REDEEM_FAILED");
      return;
    }

    if (!isRecord(data) || data.verified !== true) {
      reply.status(403).send({
        error: {
          code: "MFA_RECOVERY_REDEEM_FAILED",
          message: "Recovery code is invalid or already used.",
        },
      });
      return;
    }

    const updatedSession: BffSessionRecord = {
      ...session,
      authLevel: session.authLevel === "session" ? "mfa" : session.authLevel,
    };

    await this.sessions.saveSession(updatedSession);

    reply.status(200).send({
      data: {
        session: publicSession(updatedSession),
        verified: true,
      },
    });
  }

  // Disables/revokes the account's MFA enrollment. Requires genuine
  // step-up assurance (not just "mfa"), matching the API's own
  // @RequireAuthLevel("step_up") guard -- checked here too as a fast-fail
  // so an obviously-doomed request never reaches the API. On success,
  // revokes every session for the account INCLUDING the current one and
  // clears cookies: removing the account's only second factor is the most
  // severe self-service security downgrade available, so the safest
  // response is to force a completely fresh login afterward rather than
  // leaving any session's prior elevated trust in place.
  async disableMfa(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    this.security.applyCorsHeaders(request, reply);
    const session = await this.requireMutableSession(request);

    if (!hasStepUpAssurance(session)) {
      // Structured (not text-parsed): mirrors the {error:{code,message}}
      // shape this file uses elsewhere, plus the canonical requiredAuthLevel
      // field BffClient reads directly -- see requiredAuthLevelFromProblem
      // removal in bffClient.ts.
      throw new ForbiddenException({
        error: { code: "STEP_UP_ASSURANCE_REQUIRED", message: "Step-up assurance is required." },
        requiredAuthLevel: "step_up",
      });
    }

    const response = await this.callApi({
      body: {},
      path: "/v1/security/mfa",
      request,
      session,
      method: "DELETE",
    });

    if (!response.ok) {
      sendUpstreamFailure(reply, response, "MFA_DISABLE_FAILED");
      return;
    }

    await this.sessions.revokeAllSessionsForUser(session.userId, new Date().toISOString());
    clearAuthCookies(reply, this.config)
      .status(200)
      .send({ data: { disabled: true, loggedOut: true, revokedAllSessions: true } });
  }

  async issueStepUp(
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.applyCorsHeaders(request, reply);
    const session = await this.requireMutableSession(request);

    if (!hasMfaAssurance(session)) {
      throw new ForbiddenException({
        error: { code: "MFA_ASSURANCE_REQUIRED", message: "MFA assurance is required." },
        requiredAuthLevel: "mfa",
      });
    }

    await this.rateLimit.consumeMfaAttempt({
      accountId: session.userId,
      ipAddress: request.ip,
      route: "step-up",
    });

    const response = await this.callApi({
      body: normalizeBody(body),
      path: "/v1/security/step-up",
      request,
      session,
    });

    const payload = await readJson(response);
    const data = unwrapData(payload);

    if (!response.ok) {
      sendUpstreamFailure(reply, response, "STEP_UP_FAILED");
      return;
    }

    const expiresAt = isRecord(data) && typeof data.expiresAt === "string"
      ? data.expiresAt
      : null;

    if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
      reply.status(502).send({
        error: {
          code: "STEP_UP_FAILED",
          message: "Step-up response is invalid.",
        },
      });
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
        session: publicSession(updatedSession),
        stepUpExpiresAt: expiresAt,
      },
    });
  }

  private async requireMutableSession(
    request: FastifyRequest,
  ): Promise<BffSessionRecord> {
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

    return session;
  }

  private async callApi(input: {
    readonly body: Readonly<Record<string, unknown>>;
    readonly method?: "DELETE" | "POST";
    readonly path: string;
    readonly request: FastifyRequest;
    readonly session: BffSessionRecord;
  }): Promise<Response> {
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
    const headers = new Headers();

    headers.set("content-type", "application/json");
    headers.set(
      "x-correlation-id",
      sanitizeHeaderToken(readHeader(input.request.headers, "x-correlation-id"))
      ?? randomUUID(),
    );
    headers.set(this.config.requestIdHeaderName, randomUUID());
    headers.set(
      this.config.internalPrincipalHeaderName,
      signInternalPrincipalToken(input.session, this.config, new Date()),
    );
    // CommandExecutionInterceptor (apps/api/src/production/commands/command-execution.interceptor.ts)
    // requires Idempotency-Key on every state-changing request that carries
    // a resolved principal -- which this internal call does (the signed
    // principal token above). Without this, every mfa/confirm and step-up
    // call 409s with "A valid Idempotency-Key header is required", found
    // live while proving the invitations flow end-to-end
    // (apps/worker/scripts/verify-invitations-flow.ts) -- MFA confirm/step-up
    // had never actually worked through the BFF. A fresh key per call is
    // correct here: this is a genuinely new command each time, not a retry
    // of a client-supplied one.
    headers.set("idempotency-key", randomUUID());

    if (upstreamAuthorization) {
      headers.set("authorization", upstreamAuthorization);
    }

    return fetch(`${this.config.apiOrigin}${input.path}`, {
      body: JSON.stringify(input.body),
      headers,
      method: input.method ?? "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
    });
  }
}

function hasMfaAssurance(session: BffSessionRecord): boolean {
  if (session.authLevel === "mfa") {
    return true;
  }

  return Boolean(
    session.authLevel === "step_up"
    && session.stepUpExpiresAt
    && Date.parse(session.stepUpExpiresAt) > Date.now(),
  );
}

function hasStepUpAssurance(session: BffSessionRecord): boolean {
  return Boolean(
    session.authLevel === "step_up"
    && session.stepUpExpiresAt
    && Date.parse(session.stepUpExpiresAt) > Date.now(),
  );
}

function normalizeBody(value: unknown): Readonly<Record<string, unknown>> {
  return isRecord(value) ? value : {};
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

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json() as unknown;
  } catch {
    return null;
  }
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && isRecord(value.data)) {
    return value.data;
  }

  return value;
}

function sendUpstreamFailure(
  reply: FastifyReply,
  response: Response,
  code: string,
): void {
  reply.status(response.status >= 400 && response.status < 500 ? response.status : 502).send({
    error: {
      code,
      message: "Session assurance request failed.",
    },
  });
}

function sanitizeHeaderToken(value: string | null): string | null {
  return value && /^[a-zA-Z0-9._:-]{1,128}$/u.test(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
