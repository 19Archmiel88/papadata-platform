import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { AuditDeniedAccess, OperationId, RequireCapabilities } from "../auth/route-policy.js";
import { SupportTicketsService } from "./support-tickets.service.js";
@Controller("v1/support/tickets")
export class SupportTicketsController {
  constructor(@Inject(SupportTicketsService) private readonly service: SupportTicketsService){}
  @Get()
  @OperationId("support.tickets.read")
  @RequireCapabilities("workspace.read")
  @AuditDeniedAccess()
  async read(@Principal() principal: RequestPrincipal,@Query() query:Record<string,unknown>){return {data:await this.service.list(principal,query)};}
  @Post()
  @OperationId("support.tickets.create")
  @RequireCapabilities("workspace.read")
  @AuditDeniedAccess()
  async create(@Principal() principal: RequestPrincipal,@Body() body:unknown){return {data:await this.service.create(principal,body)};}
  @Get(':id')
  @OperationId('support.tickets.detail')
  @RequireCapabilities('workspace.read')
  @AuditDeniedAccess()
  async detail(@Principal() principal:RequestPrincipal,@Param('id') id:string){return {data:await this.service.read(principal,id)};}
  @Post(':id/commands')
  @OperationId('support.tickets.command')
  @RequireCapabilities('workspace.read')
  @AuditDeniedAccess()
  async command(@Principal() principal:RequestPrincipal,@Param('id') id:string,@Body() body:unknown){return {data:await this.service.command(principal,id,body)};}
}
