import { Body, Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { BffSessionAssuranceService } from "./session-assurance.service.js";

@Controller("api/v1/auth")
export class ContractAuthController {
  constructor(
    @Inject(BffIdentitySessionService)
    private readonly identitySession: BffIdentitySessionService,

    @Inject(BffSessionAssuranceService)
    private readonly sessionAssurance: BffSessionAssuranceService,
  ) {}

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

  @Post("logout")
  logout(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.logout(request, reply);
  }

  @Get("session")
  session(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    return this.identitySession.readSession(request, reply);
  }
}
