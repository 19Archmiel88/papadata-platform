import { Inject } from "@nestjs/common";
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AuditService } from "../audit/audit.service.js";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import type { RequestWithContext } from "../observability/request-context.js";
import { CreateReportDto } from "../validation/dtos.js";
import { ReportService } from "./report.service.js";

@Controller("v1/reports")
export class ReportController {
  constructor(
    @Inject(ReportService) private readonly reports: ReportService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

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

  // Faza 9 blocker fix: reports.download is a GET, so it is intentionally
  // never covered by CommandExecutionInterceptor (state-changing methods
  // only -- see command-execution.interceptor.ts's isStateChanging). A
  // sensitive, step_up-gated download of report data still needs a success
  // record, so this writes one explicitly.
  @Get(":id/download")
  @OperationId("reports.download")
  @RequireCapabilities("reports.download")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async download(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Principal() principal: RequestPrincipal,
    @Req() request: FastifyRequest,
  ): Promise<object> {
    // Audit fires only after signedDownload has actually succeeded --
    // never before, and never at all if it throws (the await above would
    // reject and this line is simply never reached; see
    // report.controller.audit.test.ts's failure-path test).
    const result = await this.reports.signedDownload(
      principal.tenantId,
      principal.workspaceId,
      id,
    );

    // request.correlationId is set globally by RequestContextInterceptor
    // (apps/api/src/production/observability/request-context.interceptor.ts)
    // before any handler runs -- reusing it (rather than minting a second
    // one here) is the same pattern CommandExecutionInterceptor's own
    // audit writes already use.
    const context = request as unknown as RequestWithContext;

    // No try/catch: if the audit write itself fails, this request must
    // fail too, matching CommandExecutionInterceptor.complete()'s existing
    // policy (an audit.append() failure there is likewise never swallowed
    // -- it propagates and the command's own success response is never
    // sent). A security-sensitive download getting a *silently unaudited*
    // 200 would be a worse outcome than a 500 with no audit gap. See
    // report.controller.audit.test.ts for the regression test.
    await this.audit.append({
      action: context.operationId ?? "reports.download",
      actorId: principal.userId,
      actorType: "user",
      correlationId: context.correlationId ?? "unknown",
      // reportId only -- never the signed URL, its query parameters,
      // storage credentials, or anything else from `result`.
      metadata: { reportId: id },
      outcome: "success",
      resourceId: id,
      resourceType: "report",
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
    });

    return result;
  }
}
