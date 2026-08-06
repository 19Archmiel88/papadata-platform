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
import { BFF_CONFIG } from "./tokens.js";

const publicContractPaths = [
  "api/v1/auth/access/blocked",
  "api/v1/auth/email/resend",
  "api/v1/auth/email/verify",
  "api/v1/auth/oauth/callback",
  "api/v1/auth/oauth/start",
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
    @Inject(BFF_CONFIG) private readonly config: BffConfig,
    private readonly security: BffSecurityService,
    private readonly rateLimit: BffRateLimitService,
    private readonly cloudRunIdentity: CloudRunIdentityService,
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
    } catch {
      reply.status(502).send({
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Public contract operation could not be completed.",
        },
      });
    }
  }
}
