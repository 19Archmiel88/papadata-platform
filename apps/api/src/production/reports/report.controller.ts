import { Inject } from "@nestjs/common";
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { CreateReportDto } from "../validation/dtos.js";
import { ReportService } from "./report.service.js";

@Controller("v1/reports")
export class ReportController {
  constructor(@Inject(ReportService) private readonly reports: ReportService) {}

  @Post()
  @OperationId("reports.create")
  @RequireCapabilities("reports.create")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  create(
    @Principal() principal: RequestPrincipal,
    @Body() body: CreateReportDto,
  ): Promise<object> {
    return this.reports.create(principal.tenantId, principal.workspaceId, body);
  }

  @Get(":id")
  @OperationId("reports.get")
  @RequireCapabilities("reports.read")
  find(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Principal() principal: RequestPrincipal,
  ): Promise<object | null> {
    return this.reports.find(principal.tenantId, principal.workspaceId, id);
  }

  @Get(":id/download")
  @OperationId("reports.download")
  @RequireCapabilities("reports.download")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  download(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return this.reports.signedDownload(
      principal.tenantId,
      principal.workspaceId,
      id,
    );
  }
}
