import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { signCookieValue } from "./cookie-signing.js";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService, readHeader } from "./security.service.js";
import {
  BFF_SESSION_STORE,
  type BffSessionMembership,
  type BffSessionRecord,
  type BffSessionStore,
} from "./session-store.js";
import { BFF_CONFIG } from "./tokens.js";

type IdentityResponse = {
  readonly data?: {
    readonly userId?: unknown;
    readonly email?: unknown;
    readonly displayName?: unknown;
    readonly memberships?: unknown;
  };
};

@Injectable()
export class BffIdentitySessionService {
  constructor(
    @Inject(BFF_CONFIG) private readonly config: BffConfig,
    @Inject(BFF_SESSION_STORE) private readonly sessions: BffSessionStore,

    @Inject(BffSecurityService)
    private readonly security: BffSecurityService,

    @Inject(BffRateLimitService)
    private readonly rateLimit: BffRateLimitService,

    @Inject(CloudRunIdentityService)
    private readonly cloudRunIdentity: CloudRunIdentityService,
  ) {}

  async authenticate(
    route: "login" | "register",
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    await this.rateLimit.consumePublic({ ipAddress: request.ip, route });
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
    const response = await fetch(`${this.config.apiOrigin}/v1/identity/${route}`, {
      body: JSON.stringify(normalizeIdentityBody(body)),
      headers: {
        "content-type": "application/json",
        "x-correlation-id": readHeader(request.headers, "x-correlation-id") ?? randomUUID(),
        ...(upstreamAuthorization ? { authorization: upstreamAuthorization } : {}),
      },
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
    });
    const payload = await response.json() as IdentityResponse;
    if (!response.ok || !payload.data) {
      reply.status(response.status >= 400 && response.status < 500 ? response.status : 502).send({
        error: { code: route === "login" ? "LOGIN_FAILED" : "REGISTRATION_FAILED" },
      });
      return;
    }
    const userId = readRequiredString(payload.data.userId);
    const email = readRequiredString(payload.data.email);
    const displayName = readRequiredString(payload.data.displayName);
    const memberships = readMemberships(payload.data.memberships);
    const active = memberships[0];
    if (!active) throw new UnauthorizedException("No active membership.");
    const expiresAt = new Date(Date.now() + this.config.cookieMaxAgeSeconds * 1_000).toISOString();
    const session: BffSessionRecord = {
      activeTenantId: active.tenantId,
      activeWorkspaceId: active.workspaceId,
      authLevel: "session",
      capabilities: active.capabilities,
      expiresAt,
      memberships,
      revokedAt: null,
      sessionId: randomUUID(),
      stepUpExpiresAt: null,
      user: { displayName, email },
      userId,
    };
    await this.sessions.saveSession(session);
    reply
      .setCookie(
        this.config.sessionCookieName,
        signCookieValue(session.sessionId, this.config.cookieSecret),
        {
          httpOnly: true,
          maxAge: this.config.cookieMaxAgeSeconds,
          path: this.config.cookiePath,
          sameSite: this.config.cookieSameSite,
          secure: this.config.cookieSecure,
        },
      )
      .send({
        data: {
          session: publicSession(session),
          user: {
            userId,
            email,
            displayName,
          },
        },
      });
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    const session = await this.security.requireSession(request);
    this.security.validateCsrf(request, session);
    await this.sessions.revokeSession(session.sessionId, new Date().toISOString());
    reply
      .status(200)
      .clearCookie(this.config.sessionCookieName, { path: this.config.cookiePath })
      .clearCookie(this.config.csrfCookieName, { path: this.config.cookiePath })
      .send({ data: { loggedOut: true } });
  }

  async readSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    const session = await this.security.requireSession(request);
    reply.send({ data: publicSession(session) });
  }

  async selectWorkspace(
    request: FastifyRequest,
    reply: FastifyReply,
    body: unknown,
  ): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    const session = await this.security.requireSession(request);
    this.security.validateCsrf(request, session);
    const workspaceId = isRecord(body) ? optionalString(body.workspaceId) : null;
    if (!workspaceId) {
      throw new BadRequestException("Workspace selection is invalid.");
    }
    const membership = session.memberships.find((candidate) => (
      candidate.workspaceId === workspaceId
    ));
    if (!membership) {
      throw new ForbiddenException("Workspace is not available for this session.");
    }
    const nextSession: BffSessionRecord = {
      ...session,
      activeTenantId: membership.tenantId,
      activeWorkspaceId: membership.workspaceId,
      capabilities: membership.capabilities,
      stepUpExpiresAt: null,
      authLevel: session.authLevel === "step_up" ? "mfa" : session.authLevel,
    };
    await this.sessions.saveSession(nextSession);
    reply.send({ data: publicSession(nextSession) });
  }
}

export function normalizeIdentityBody(value: unknown): Readonly<Record<string, unknown>> {
  if (!isRecord(value)) return {};
  if (typeof value.input !== "string") return normalizeIdentityFields(value);
  const input = value.input.trim();
  if (!input.startsWith("{") || !input.endsWith("}")) {
    return normalizeIdentityFields(value);
  }
  try {
    const parsed = JSON.parse(input) as unknown;
    return normalizeIdentityFields(isRecord(parsed) ? { ...value, ...parsed } : value);
  } catch {
    return normalizeIdentityFields(value);
  }
}

function normalizeIdentityFields(
  value: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  const displayName = optionalString(value.displayName)
    ?? optionalString(value.fullName);
  const {
    fullName,
    input,
    ...body
  } = value;
  void fullName;
  void input;

  return displayName && !optionalString(body.displayName)
    ? { ...body, displayName }
    : body;
}

function readMemberships(value: unknown): readonly BffSessionMembership[] {
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

function publicSession(session: BffSessionRecord): object {
  return {
    activeTenantId: session.activeTenantId,
    activeWorkspaceId: session.activeWorkspaceId,
    authLevel: session.authLevel,
    capabilities: session.capabilities,
    expiresAt: session.expiresAt,
    memberships: session.memberships,
    sessionId: session.sessionId,
    ...(session.user ? { user: { ...session.user, userId: session.userId } } : {}),
    userId: session.userId,
  };
}

function readRequiredString(value: unknown): string {
  const result = optionalString(value);
  if (!result) throw new UnauthorizedException("Identity response is invalid.");
  return result;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
