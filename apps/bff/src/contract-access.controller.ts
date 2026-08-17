import { Body, Controller, Inject, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BffIdentitySessionService } from "./identity-session.service.js";

@Controller("api/v1/access")
export class ContractAccessController {
  constructor(
    @Inject(BffIdentitySessionService)
    private readonly identitySession: BffIdentitySessionService,
  ) {}

  @Post("workspace/select")
  selectWorkspace(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() body: unknown,
  ): Promise<void> {
    return this.identitySession.selectWorkspace(request, reply, body);
  }
}
