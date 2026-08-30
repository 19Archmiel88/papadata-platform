import { Body, Controller, Delete, Get, Inject, Options, Param, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { BffOAuthService } from "./oauth.service.js";
import { BffSessionAssuranceService } from "./session-assurance.service.js";
import { BffSecurityService } from "./security.service.js";

@Controller("api/v1/auth")
export class ContractAuthController {
  constructor(
    @Inject(BffIdentitySessionService)
    private readonly identitySession: BffIdentitySessionService,

    @Inject(BffSessionAssuranceService)
    private readonly sessionAssurance: BffSessionAssuranceService,

    @Inject(BffOAuthService)
    private readonly oauth: BffOAuthService,

    @Inject(BffSecurityService)
    private readonly security: BffSecurityService,
  ) {}


  @Options("*")
  preflight(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): void {
    this.security.validateHost(request);
    this.security.applyCorsHeaders(request, reply);
    reply.status(204).send();
  }

  @Post("register/email")
  registerEmail(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.identitySession.authenticate("register", request, reply, body);
  }

  @Post("login")
  login(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.identitySession.authenticate("login", request, reply, body);
  }

  @Post("mfa/confirm")
  confirmMfa(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.sessionAssurance.confirmMfa(request, reply, body);
  }

  @Post("step-up")
  issueStepUp(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.sessionAssurance.issueStepUp(request, reply, body);
  }

  @Post("oauth/start")
  startOAuth(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.oauth.start(request, reply, body);
  }

  @Post("oauth/link/start")
  startOAuthLink(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.oauth.startLink(request, reply, body);
  }

  @Post("oauth/reauth/start")
  startOAuthReauth(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.oauth.startReauth(request, reply, body);
  }

  @Post("oauth/callback")
  completeOAuthCallback(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.oauth.callback(request, reply, body);
  }

  @Post("refresh")
  refresh(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.refresh(request, reply);
  }

  @Post("logout")
  logout(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.logout(request, reply);
  }

  @Post("logout-all")
  logoutAll(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.logoutAll(request, reply);
  }

  @Get("session")
  session(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.readSession(request, reply);
  }

  @Get("sessions")
  sessions(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.listSessions(request, reply);
  }

  @Delete("sessions/:sessionId")
  revokeSession(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Param("sessionId") sessionId: string,
  ): Promise<void> {
    return this.identitySession.revokeSessionById(request, reply, sessionId);
  }
}
