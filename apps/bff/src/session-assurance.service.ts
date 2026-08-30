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

  async issueStepUp(
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.applyCorsHeaders(request, reply);
    const session = await this.requireMutableSession(request);

    if (!hasMfaAssurance(session)) {
      throw new ForbiddenException("MFA assurance is required.");
    }

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
      method: "POST",
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
