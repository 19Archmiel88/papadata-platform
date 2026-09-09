import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { AuditDeniedAccess, OperationId, RequireCapabilities } from "../auth/route-policy.js";
import { DecisionsService } from "./decisions.service.js";
@Controller("v1/decisions/registry")
export class DecisionsController {
  constructor(@Inject(DecisionsService) private readonly service: DecisionsService) {}
  @Get()
  @OperationId("decisions.workspace-registry.read")
  @RequireCapabilities("workspace.read")
  async read(@Principal() principal: RequestPrincipal) { return {data:await this.service.read(principal)}; }
  @Post("commands")
  @OperationId("decisions.workspace-registry.command")
  @RequireCapabilities("workspace.read", "ai.action_proposal.create")
  @AuditDeniedAccess()
  async command(@Principal() principal: RequestPrincipal, @Body() body: unknown) { return {data:await this.service.command(principal,body)}; }
}
