import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CreateReportRequest } from "@papadata/contracts";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { ReportService } from "./report.service.js";
@Controller("v1/reports")
export class ReportController{constructor(private readonly reports:ReportService){}@Post()@RequireCapabilities("reports.create")@RequireAuthLevel("mfa")@AuditDeniedAccess()create(@Principal()principal:RequestPrincipal,@Body()body:CreateReportRequest):Promise<object>{return this.reports.create(principal.tenantId,principal.workspaceId,body);}@Get(":id")@RequireCapabilities("reports.read")find(@Param("id")id:string,@Principal()principal:RequestPrincipal):Promise<object|null>{return this.reports.find(principal.tenantId,principal.workspaceId,id);}@Get(":id/download")@RequireCapabilities("reports.download")@RequireAuthLevel("step_up")@AuditDeniedAccess()download(@Param("id")id:string,@Principal()principal:RequestPrincipal):Promise<object>{return this.reports.signedDownload(principal.tenantId,principal.workspaceId,id);}}
