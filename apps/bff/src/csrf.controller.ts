import { Controller, Get, Inject, Req, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import type { FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { BffSecurityService, readHeader } from "./security.service.js";
import { BFF_CONFIG } from "./tokens.js";

@Controller("api")
export class CsrfController {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,

    @Inject(BffSecurityService)
    private readonly security: BffSecurityService,
  ) {}

  @Get("csrf")
  async issue(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    this.security.validateHost(request);
    const session = await this.security.requireSession(request);
    const token = this.security.issueCsrfToken(session);
    const origin = readHeader(request.headers, "origin");

    for (const [header, value] of Object.entries(
      this.security.corsHeaders(origin),
    )) {
      reply.header(header, value);
    }

    reply
      .setCookie(this.config.csrfCookieName, token, {
        httpOnly: false,
        maxAge: this.config.csrfCookieMaxAgeSeconds,
        path: this.config.cookiePath,
        sameSite: this.config.cookieSameSite,
        secure: this.config.cookieSecure,
      })
      .send({ data: { csrfToken: token } });
  }
}
