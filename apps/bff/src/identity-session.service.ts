import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { signCookieValue, verifySignedCookieValue } from "./cookie-signing.js";
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
    await this.establishSession(request, reply, { displayName, email, memberships, userId });
  }

  // Shared by password login/register and OAuth login/register/
  // accept_invitation: both paths resolve to the exact same
  // {userId, email, displayName, memberships} bootstrap shape, so both
  // must issue the session cookie identically — one real mechanism, not a
  // parallel one for OAuth.
  async establishSession(
    request: FastifyRequest,
    reply: FastifyReply,
    bootstrap: {
      readonly userId: string;
      readonly email: string;
      readonly displayName: string;
      readonly memberships: readonly BffSessionMembership[];
    },
    extraData: Readonly<Record<string, unknown>> = {},
  ): Promise<BffSessionRecord> {
    const active = bootstrap.memberships[0];
    if (!active) throw new UnauthorizedException("No active membership.");
    const now = new Date();
    const issuedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + this.config.cookieMaxAgeSeconds * 1_000).toISOString();
    const absoluteExpiresAt = new Date(
      now.getTime() + this.config.sessionAbsoluteTtlSeconds * 1_000,
    ).toISOString();
    const session: BffSessionRecord = {
      absoluteExpiresAt,
      activeTenantId: active.tenantId,
      activeWorkspaceId: active.workspaceId,
      authLevel: "session",
      capabilities: active.capabilities,
      expiresAt,
      issuedAt,
      memberships: bootstrap.memberships,
      revokedAt: null,
      sessionId: randomUUID(),
      stepUpExpiresAt: null,
      user: { displayName: bootstrap.displayName, email: bootstrap.email },
      userAgent: readHeader(request.headers, "user-agent"),
      userId: bootstrap.userId,
    };
    await this.sessions.saveSession(session);
    const refreshToken = await this.issueRefreshToken(session);
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
      .setCookie(
        this.config.refreshCookieName,
        signCookieValue(refreshToken, this.config.refreshCookieSecret),
        {
          httpOnly: true,
          maxAge: ttlSecondsUntil(absoluteExpiresAt),
          path: this.config.refreshCookiePath,
          sameSite: this.config.cookieSameSite,
          secure: this.config.cookieSecure,
        },
      )
      .send({
        data: {
          ...extraData,
          session: publicSession(session),
          user: {
            userId: bootstrap.userId,
            email: bootstrap.email,
            displayName: bootstrap.displayName,
          },
        },
      });
    return session;
  }

  // Rotates the session's session-cookie and refresh-cookie pair. Deliberately
  // does not go through security.requireSession(): that rejects on a lapsed
  // expiresAt, which is exactly the state a legitimate refresh call arrives
  // in (the sliding window elapsed, the absolute ceiling hasn't) -- refresh
  // has its own, looser validity check against absoluteExpiresAt instead.
  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    await this.rateLimit.consumePublic({ ipAddress: request.ip, route: "refresh" });

    const cookies = request.cookies as Record<string, string | undefined>;
    const sessionId = verifySignedCookieValue(
      cookies[this.config.sessionCookieName],
      this.cookieSecrets(this.config.cookieSecret, this.config.cookiePreviousSecret),
    );
    const presentedRefreshToken = verifySignedCookieValue(
      cookies[this.config.refreshCookieName],
      this.cookieSecrets(this.config.refreshCookieSecret, this.config.refreshCookiePreviousSecret),
    );

    if (!sessionId || !presentedRefreshToken) {
      this.clearAuthCookies(reply);
      throw new UnauthorizedException("Valid session and refresh cookies are required.");
    }

    const session = await this.sessions.findSession(sessionId);
    const now = Date.now();

    if (
      !session
      || session.sessionId !== sessionId
      || session.revokedAt !== null
      || Date.parse(session.absoluteExpiresAt) <= now
    ) {
      this.clearAuthCookies(reply);
      throw new UnauthorizedException("Session cannot be refreshed.");
    }

    // CSRF is still required here: refresh is a state-changing POST, and
    // session.sessionId (needed to check it) is already known at this
    // point even though the session's own sliding expiresAt may have
    // lapsed.
    this.security.validateCsrf(request, session);

    const nextToken = randomBytes(32).toString("base64url");
    const rotation = await this.sessions.compareAndRotateRefreshTokenHash(
      sessionId,
      hashRefreshToken(presentedRefreshToken),
      hashRefreshToken(nextToken),
      ttlSecondsUntil(session.absoluteExpiresAt),
    );

    if (rotation === "mismatch") {
      // The presented token doesn't match the current one on record, which
      // under normal use should never happen (rotation always advances the
      // stored hash together with the cookie) -- this is the reuse signal:
      // either a stolen, already-superseded token is being replayed, or a
      // genuine client bug resent a stale cookie. Either way, the whole
      // session family for this user is revoked rather than trying to
      // guess which of the two is which.
      await this.sessions.revokeAllSessionsForUser(session.userId, new Date().toISOString());
      console.warn("Refresh token reuse detected; revoked all sessions for user.", {
        sessionId,
        userId: session.userId,
      });
      this.clearAuthCookies(reply);
      throw new UnauthorizedException("Refresh token has already been used.");
    }

    if (rotation === "missing") {
      this.clearAuthCookies(reply);
      throw new UnauthorizedException("Session cannot be refreshed.");
    }

    const nextExpiresAt = new Date(now + this.config.cookieMaxAgeSeconds * 1_000).toISOString();
    const nextSession: BffSessionRecord = { ...session, expiresAt: nextExpiresAt };
    await this.sessions.saveSession(nextSession);

    reply
      .setCookie(
        this.config.sessionCookieName,
        signCookieValue(sessionId, this.config.cookieSecret),
        {
          httpOnly: true,
          maxAge: this.config.cookieMaxAgeSeconds,
          path: this.config.cookiePath,
          sameSite: this.config.cookieSameSite,
          secure: this.config.cookieSecure,
        },
      )
      .setCookie(
        this.config.refreshCookieName,
        signCookieValue(nextToken, this.config.refreshCookieSecret),
        {
          httpOnly: true,
          maxAge: ttlSecondsUntil(session.absoluteExpiresAt),
          path: this.config.refreshCookiePath,
          sameSite: this.config.cookieSameSite,
          secure: this.config.cookieSecure,
        },
      )
      .send({ data: { session: publicSession(nextSession) } });
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    const session = await this.security.requireSession(request);
    this.security.validateCsrf(request, session);
    await this.sessions.revokeSession(session.sessionId, new Date().toISOString());
    this.clearAuthCookies(reply).status(200).send({ data: { loggedOut: true } });
  }

  // Revokes every session for the caller's account, including the current
  // one -- "sign out everywhere". See revokeSessionById for revoking a
  // single other session while staying signed in on this one.
  async logoutAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    const session = await this.security.requireSession(request);
    this.security.validateCsrf(request, session);
    await this.sessions.revokeAllSessionsForUser(session.userId, new Date().toISOString());
    this.clearAuthCookies(reply).status(200).send({ data: { loggedOut: true, revokedAllSessions: true } });
  }

  // Lists every active session for the caller's account (multi-device
  // visibility), marking which one issued this request.
  async listSessions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    const session = await this.security.requireSession(request);
    const sessions = await this.sessions.listSessionsForUser(session.userId);
    reply.send({
      data: {
        sessions: sessions
          .slice()
          .sort((left, right) => Date.parse(right.issuedAt) - Date.parse(left.issuedAt))
          .map((candidate) => publicSessionSummary(candidate, session.sessionId)),
      },
    });
  }

  // Revokes one specific OTHER session belonging to the caller's own
  // account. Never accepts a sessionId beyond scoping to session.userId,
  // so a caller can never revoke another user's session by guessing an id.
  async revokeSessionById(
    request: FastifyRequest,
    reply: FastifyReply,
    targetSessionId: string,
  ): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    const session = await this.security.requireSession(request);
    this.security.validateCsrf(request, session);

    if (!targetSessionId) {
      throw new BadRequestException("A session id is required.");
    }

    const target = await this.sessions.findSession(targetSessionId);
    if (!target || target.userId !== session.userId) {
      // Disclosure-safe: identical response whether the id doesn't exist
      // or belongs to someone else, so this can't be used to enumerate
      // other users' session ids.
      throw new ForbiddenException("Session is not available for this account.");
    }

    await this.sessions.revokeSession(targetSessionId, new Date().toISOString());
    reply.status(200).send({ data: { revoked: true, sessionId: targetSessionId } });
  }

  // Mints and persists a fresh refresh token for a session that already
  // exists (initial issuance at establishSession time). Kept separate from
  // the rotation path in refresh() -- that one is a compare-and-swap
  // against an existing hash, this one has no prior hash to compare
  // against yet.
  private async issueRefreshToken(session: BffSessionRecord): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await this.sessions.setRefreshTokenHash(
      session.sessionId,
      hashRefreshToken(token),
      ttlSecondsUntil(session.absoluteExpiresAt),
    );
    return token;
  }

  private cookieSecrets(active: string, previous: string | null): readonly string[] {
    return previous ? [active, previous] : [active];
  }

  private clearAuthCookies(reply: FastifyReply): FastifyReply {
    return reply
      .clearCookie(this.config.sessionCookieName, { path: this.config.cookiePath })
      .clearCookie(this.config.csrfCookieName, { path: this.config.cookiePath })
      .clearCookie(this.config.refreshCookieName, { path: this.config.refreshCookiePath });
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
    rememberDevice,
    ...body
  } = value;
  void fullName;
  void input;
  void rememberDevice;

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
    issuedAt: session.issuedAt,
    memberships: session.memberships,
    sessionId: session.sessionId,
    ...(session.user ? { user: { ...session.user, userId: session.userId } } : {}),
    userId: session.userId,
  };
}

// Deliberately narrower than publicSession: a "your other devices" listing
// has no business disclosing capabilities/memberships/step-up state for
// sessions other than the caller's own current one.
function publicSessionSummary(session: BffSessionRecord, currentSessionId: string): object {
  return {
    current: session.sessionId === currentSessionId,
    expiresAt: session.expiresAt,
    issuedAt: session.issuedAt,
    sessionId: session.sessionId,
    userAgent: session.userAgent,
  };
}

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function ttlSecondsUntil(isoDate: string): number {
  return Math.max(1, Math.floor((Date.parse(isoDate) - Date.now()) / 1_000));
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
