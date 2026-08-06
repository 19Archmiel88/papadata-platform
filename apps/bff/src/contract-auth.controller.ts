import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BffIdentitySessionService } from "./identity-session.service.js";

@Controller("api/v1/auth")
export class ContractAuthController {
  constructor(private readonly identitySession: BffIdentitySessionService) {}

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
