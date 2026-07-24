import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import type { FastifyRequest } from "fastify";
import { BFF_CONFIG } from "./tokens.js";
import type { BffConfig } from "./config.js";
import { verifySignedCookieValue } from "./cookie-signing.js";
import {
  BFF_SESSION_STORE,
  type BffSessionRecord,
  type BffSessionStore,
} from "./session-store.js";

@Injectable()
export class BffSecurityService {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,

    @Inject(BFF_SESSION_STORE)
    private readonly sessionStore: BffSessionStore,
  ) {}

  validateHost(request: FastifyRequest): void {
    const host = readHeader(request.headers, "host");

    if (!host || !this.config.publicHosts.includes(host.toLowerCase())) {
      throw new ForbiddenException("Host is not allowed.");
    }
  }

  validateOrigin(request: FastifyRequest): void {
    const origin = readHeader(request.headers, "origin");

    if (!origin || !this.config.allowedOrigins.includes(origin)) {
      throw new ForbiddenException("Origin is not allowed.");
    }
  }

  async requireSession(request: FastifyRequest): Promise<BffSessionRecord> {
    const cookies = request.cookies as Record<string, string | undefined>;
    const sessionId = verifySignedCookieValue(
      cookies[this.config.sessionCookieName],
      [
        this.config.cookieSecret,
        ...(this.config.cookiePreviousSecret
          ? [this.config.cookiePreviousSecret]
          : []),
      ],
    );

    if (!sessionId) {
      throw new UnauthorizedException("Valid session cookie is required.");
    }

    const session = await this.sessionStore.findSession(sessionId);
    const now = Date.now();

    if (
      !session
      || session.sessionId !== sessionId
      || Date.parse(session.expiresAt) <= now
      || session.revokedAt !== null
      || !session.memberships.some(
        (membership) =>
          membership.tenantId === session.activeTenantId
          && membership.workspaceId === session.activeWorkspaceId,
      )
    ) {
      throw new UnauthorizedException("Session is not active.");
    }

    return session;
  }

  issueCsrfToken(session: BffSessionRecord): string {
    const nonce = randomBytes(32).toString("base64url");
    const signature = csrfSignature(
      session.sessionId,
      nonce,
      this.config.csrfSecret,
    );

    return `${nonce}.${signature}`;
  }

  validateCsrf(request: FastifyRequest, session: BffSessionRecord): void {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return;
    }

    const cookies = request.cookies as Record<string, string | undefined>;
    const header = readHeader(request.headers, this.config.csrfHeaderName);
    const cookie = cookies[this.config.csrfCookieName];

    if (!header || !cookie || !safeEqual(header, cookie)) {
      throw new ForbiddenException("CSRF token is invalid.");
    }

    const separator = header.lastIndexOf(".");

    if (separator <= 0 || separator === header.length - 1) {
      throw new ForbiddenException("CSRF token is invalid.");
    }

    const nonce = header.slice(0, separator);
    const signature = header.slice(separator + 1);

    if (
      !safeEqual(
        signature,
        csrfSignature(session.sessionId, nonce, this.config.csrfSecret),
      )
    ) {
      throw new ForbiddenException("CSRF token is invalid.");
    }
  }

  corsHeaders(origin: string | null): Readonly<Record<string, string>> {
    if (!origin || !this.config.allowedOrigins.includes(origin)) {
      return {};
    }

    return {
      "access-control-allow-credentials": "true",
      "access-control-allow-headers":
        "accept, accept-language, content-type, x-correlation-id, x-papadata-csrf",
      "access-control-allow-methods": "GET, HEAD, POST, PUT, PATCH, DELETE",
      "access-control-allow-origin": origin,
      vary: "Origin",
    };
  }
}

export function isStateChangingMethod(method: string): boolean {
  return ["DELETE", "PATCH", "POST", "PUT"].includes(method);
}

export function readHeader(
  headers: FastifyRequest["headers"],
  name: string,
): string | null {
  const value = headers[name.toLowerCase()];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.length > 0 ? first : null;
}

function csrfSignature(
  sessionId: string,
  nonce: string,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(sessionId)
    .update(".")
    .update(nonce)
    .digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}
