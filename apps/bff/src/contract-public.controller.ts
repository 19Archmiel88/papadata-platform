import { All, Controller, Inject, Req, Res } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import {
  BffSecurityService,
  isStateChangingMethod,
  readHeader,
} from "./security.service.js";
import { BFF_SESSION_STORE, type BffSessionStore } from "./session-store.js";
import { BFF_CONFIG } from "./tokens.js";

// api/v1/auth/oauth/start and .../callback are deliberately NOT here —
// they now have a real, dedicated handler (BffOAuthService via
// ContractAuthController) instead of this generic pass-through, since
// OAuth login/register must establish a real BFF session cookie the same
// way password login does, which this generic proxy cannot do.
const publicContractPaths = [
  "api/v1/auth/access/blocked",
  "api/v1/auth/email/resend",
  "api/v1/auth/email/verify",
  "api/v1/auth/password/recovery/request",
  "api/v1/auth/password/recovery/token/validate",
  "api/v1/auth/password/reset",
  "api/v1/auth/registration/finalize",
  "api/v1/auth/status",
  "api/v1/company/lookup",
  "api/v1/auth/invitations/accept",
  "api/v1/auth/invitations/validate",
] as const;

@Controller()
export class ContractPublicController {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,

    @Inject(BffSecurityService)
    private readonly security: BffSecurityService,

    @Inject(BffRateLimitService)
    private readonly rateLimit: BffRateLimitService,

    @Inject(CloudRunIdentityService)
    private readonly cloudRunIdentity: CloudRunIdentityService,

    @Inject(BFF_SESSION_STORE)
    private readonly sessions: BffSessionStore,
  ) {}

  @All([...publicContractPaths])
  async forward(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    this.security.validateHost(request);
    const origin = readHeader(request.headers, "origin");
    for (const [header, value] of Object.entries(this.security.corsHeaders(origin))) {
      reply.header(header, value);
    }
    if (request.method === "OPTIONS") {
      reply.status(204).send();
      return;
    }
    if (isStateChangingMethod(request.method)) {
      this.security.validateOrigin(request);
    }
    await this.rateLimit.consumePublic({
      ipAddress: request.ip,
      route: "public-contract",
    });
    const authorization = await this.cloudRunIdentity.authorizationHeader();
    const target = `${this.config.apiOrigin}${request.url.replace(/^\/api/u, "")}`;
    const body = request.method === "GET" || request.method === "HEAD"
      ? undefined
      : JSON.stringify(request.body ?? {});
    try {
      const response = await fetch(target, {
        body,
        headers: {
          accept: readHeader(request.headers, "accept") ?? "application/json",
          ...(body === undefined ? {} : { "content-type": "application/json" }),
          "x-correlation-id": readHeader(request.headers, "x-correlation-id") ?? randomUUID(),
          ...(authorization ? { authorization } : {}),
        },
        method: request.method,
        redirect: "manual",
        signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
      });
      const contentType = response.headers.get("content-type");
      if (contentType) reply.header("content-type", contentType);
      reply.status(response.status);
      const payload = await response.text();
      reply.send(payload.length > 0 ? payload : undefined);

      if (response.ok && request.url.startsWith("/api/v1/auth/password/reset")) {
        await this.revokeSessionsAfterPasswordReset(payload);
      }
    } catch {
      reply.status(502).send({
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Public contract operation could not be completed.",
        },
      });
    }
  }

  // A password reset means the credential an attacker might already have
  // is no longer valid, but any session opened with it still would be --
  // this closes that gap by revoking every session for the account. Best
  // effort and deliberately after the reply has already been sent: the
  // reset itself already fully succeeded on the API side, and this must
  // never turn a real success into a client-visible failure or throw
  // after the response is already on the wire.
  private async revokeSessionsAfterPasswordReset(rawPayload: string): Promise<void> {
    try {
      const parsed = JSON.parse(rawPayload) as unknown;
      const data = isRecord(parsed) && isRecord(parsed.data) ? parsed.data : null;
      const userId = data && typeof data.userId === "string" ? data.userId : null;
      if (data?.accepted === true && userId) {
        await this.sessions.revokeAllSessionsForUser(userId, new Date().toISOString());
      }
    } catch (error) {
      console.error("Failed to revoke sessions after password reset", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
