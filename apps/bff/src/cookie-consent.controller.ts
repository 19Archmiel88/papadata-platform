import { Body, Controller, Get, HttpCode, Inject, Options, Put, Req, Res } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { signCookieValue, verifySignedCookieValue } from "./cookie-signing.js";
import { signInternalPrincipalToken } from "./internal-principal.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffSecurityService, readHeader } from "./security.service.js";
import { BFF_CONFIG } from "./tokens.js";

// Cookie consent must work before login and survive logout, so it cannot go
// through ProxyController (requires a session) or ContractPublicController's
// static passthrough (never forwards account context). It gets its own
// small controller, matching CsrfController's size/shape: a couple of
// routes, not a generic proxy.
@Controller("api/v1/consent/cookies")
export class CookieConsentController {
  constructor(
    @Inject(BFF_CONFIG) private readonly config: BffConfig,
    @Inject(BffSecurityService) private readonly security: BffSecurityService,
    @Inject(BffRateLimitService) private readonly rateLimit: BffRateLimitService,
    @Inject(CloudRunIdentityService) private readonly cloudRunIdentity: CloudRunIdentityService,
  ) {}

  @Options()
  @HttpCode(204)
  preflight(@Req() request: FastifyRequest, @Res() reply: FastifyReply): void {
    this.security.applyCorsHeaders(request, reply);
    reply.send();
  }

  @Get()
  async read(@Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    await this.rateLimit.consumePublic({ ipAddress: request.ip, route: "cookie-consent" });

    const subjectId = this.resolveSubjectId(request);
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
    const response = await fetch(
      `${this.config.apiOrigin}/v1/consent/cookies?subjectId=${encodeURIComponent(subjectId)}`,
      {
        headers: {
          "x-correlation-id": readHeader(request.headers, "x-correlation-id") ?? randomUUID(),
          ...(upstreamAuthorization ? { authorization: upstreamAuthorization } : {}),
        },
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
      },
    );
    const payload = await response.json().catch(() => null);
    this.setSubjectCookie(reply, subjectId);
    reply.status(response.status).send(payload ?? { error: { code: "UPSTREAM_UNAVAILABLE" } });
  }

  @Put()
  async write(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    this.security.validateOrigin(request);
    await this.rateLimit.consumePublic({ ipAddress: request.ip, route: "cookie-consent" });

    const subjectId = this.resolveSubjectId(request);
    // Optional auth: a real, currently-logged-in browser also gets its
    // consent write attributed to that account -- but this route stays
    // reachable with no session at all. requireSession() throws when
    // missing; that's expected and means "anonymous", not a failure.
    const session = await this.security.requireSession(request).catch(() => null);
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
    const correlationId = readHeader(request.headers, "x-correlation-id") ?? randomUUID();

    const response = await fetch(
      `${this.config.apiOrigin}/v1/consent/cookies?subjectId=${encodeURIComponent(subjectId)}`,
      {
        body: JSON.stringify(body ?? {}),
        headers: {
          "content-type": "application/json",
          "x-correlation-id": correlationId,
          ...(upstreamAuthorization ? { authorization: upstreamAuthorization } : {}),
          ...(session
            ? { [this.config.internalPrincipalHeaderName]: signInternalPrincipalToken(session, this.config, new Date()) }
            : {}),
        },
        method: "PUT",
        redirect: "manual",
        signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
      },
    );
    const payload = await response.json().catch(() => null);
    this.setSubjectCookie(reply, subjectId);
    reply.status(response.status).send(payload ?? { error: { code: "UPSTREAM_UNAVAILABLE" } });
  }

  // Reads the existing signed subject-id cookie if present and valid;
  // otherwise mints a fresh one. The browser never chooses this value --
  // it only ever receives what this method (server-side) produces, signed
  // the same way the session/refresh cookies already are.
  private resolveSubjectId(request: FastifyRequest): string {
    const cookies = request.cookies as Record<string, string | undefined>;
    const secrets = [
      this.config.consentCookieSecret,
      ...(this.config.consentCookiePreviousSecret ? [this.config.consentCookiePreviousSecret] : []),
    ];
    return verifySignedCookieValue(cookies[this.config.consentCookieName], secrets) ?? randomUUID();
  }

  private setSubjectCookie(reply: FastifyReply, subjectId: string): void {
    reply.setCookie(
      this.config.consentCookieName,
      signCookieValue(subjectId, this.config.consentCookieSecret),
      {
        httpOnly: true,
        maxAge: this.config.consentCookieMaxAgeSeconds,
        path: this.config.consentCookiePath,
        sameSite: this.config.cookieSameSite,
        secure: this.config.cookieSecure,
      },
    );
  }
}
