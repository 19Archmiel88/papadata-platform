import { Inject } from "@nestjs/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { toIdempotencyKey, toIsoDateTime } from "@papadata/contracts";
import { AuditService } from "../audit/audit.service.js";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import type { RequestWithContext } from "../observability/request-context.js";
import {
  CreateIntegrationConnectionDto,
  StartIntegrationBackfillDto,
  StartIntegrationSyncDto,
} from "../validation/dtos.js";
import { IntegrationService } from "./integration.service.js";

@Controller("v1/integrations")
export class IntegrationController {
  constructor(
    @Inject(IntegrationService) private readonly service: IntegrationService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get("providers")
  @OperationId("integrations.providers.list")
  @RequireCapabilities("integrations.catalog.read")
  async listProviders(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.listProviders(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get()
  @OperationId("integrations.runtime.read")
  @RequireCapabilities("integrations.connection.read")
  async readRuntime(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.readStatus(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get("status")
  @OperationId("integrations.status.read")
  @RequireCapabilities("integrations.connection.read")
  async readStatus(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.readStatus(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get("catalog")
  @OperationId("integrations.runtime-catalog.read")
  @RequireCapabilities("integrations.catalog.read")
  async readCatalog(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.readCatalog(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get("logs")
  @OperationId("integrations.logs.read")
  @RequireCapabilities("integrations.jobs.read")
  async readLogs(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.readLogs(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get("completeness")
  @OperationId("integrations.completeness.read")
  @RequireCapabilities("integrations.connection.read")
  async readCompleteness(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.readCompleteness(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get("connections")
  @OperationId("integrations.connections.list")
  @RequireCapabilities("integrations.connection.read")
  async listConnections(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.listConnections(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Post("connections")
  @OperationId("integrations.connection.create")
  @RequireCapabilities("integrations.connection.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async createConnection(
    @Principal() principal: RequestPrincipal,
    @Body() request: CreateIntegrationConnectionDto,
    @Req() httpRequest: FastifyRequest,
  ): Promise<object> {
    const connection = await this.service.createConnection(
      principal.tenantId,
      principal.workspaceId,
      {
        providerId: request.providerId,
        credentialReference: request.credentialReference,
        requestedScopes: request.requestedScopes,
        idempotencyKey: toIdempotencyKey(request.idempotencyKey),
      },
    );

    // No try/catch: an audit.append() failure here must fail the request
    // too, matching CommandExecutionInterceptor.complete()'s existing
    // policy (see report.controller.ts's download() for the same
    // reasoning) -- a connect that succeeds with a silently unaudited
    // trail would be a worse outcome than a 500 with no audit gap. This is
    // in addition to CommandExecutionInterceptor's own generic api_command
    // success audit (fires unconditionally for every authenticated POST),
    // which carries no provider/connection detail -- this entry is the one
    // that does.
    const context = httpRequest as unknown as RequestWithContext;
    await this.audit.append({
      action: "integrations.connection.create",
      actorId: principal.userId,
      actorType: "user",
      correlationId: context.correlationId ?? "unknown",
      metadata: {
        provider: request.providerId,
        requestedScopes: request.requestedScopes,
      },
      outcome: "success",
      resourceId: String(connection.connection_id ?? connection.id ?? ""),
      resourceType: "integration_connection",
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
    });

    return { data: connection };
  }

  @Post(":provider/test")
  @OperationId("integrations.provider.test")
  @RequireCapabilities("integrations.credentials.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async testProvider(
    @Param("provider") provider: string,
    @Body() request: Record<string, unknown>,
  ): Promise<object> {
    return {
      data: await this.service.testProviderConnection(provider, request),
    };
  }

  @Delete("connections/:id")
  @OperationId("integrations.connections.disconnect")
  @RequireCapabilities("integrations.connection.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async disconnect(
    @Param("id", new ParseUUIDPipe({ version: "4" })) connectionId: string,
    @Principal() principal: RequestPrincipal,
    @Req() httpRequest: FastifyRequest,
  ): Promise<object> {
    const disconnected = await this.service.disconnect(
      principal.tenantId,
      principal.workspaceId,
      connectionId,
    );

    // No try/catch -- see createConnection() above for why an audit
    // failure here must fail the request rather than be swallowed.
    const context = httpRequest as unknown as RequestWithContext;
    await this.audit.append({
      action: "integrations.connections.disconnect",
      actorId: principal.userId,
      actorType: "user",
      correlationId: context.correlationId ?? "unknown",
      metadata: { provider: disconnected.providerId },
      outcome: "success",
      resourceId: disconnected.connectionId,
      resourceType: "integration_connection",
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
    });

    return { data: { connectionId, status: "disconnected" } };
  }

  @Get("jobs")
  @OperationId("integrations.jobs.list")
  @RequireCapabilities("integrations.jobs.read")
  async listJobs(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.listJobs(
        principal.tenantId,
        principal.workspaceId,
      ),
    };
  }

  @Get("jobs/:id")
  @OperationId("integrations.jobs.get")
  @RequireCapabilities("integrations.jobs.read")
  async findJob(
    @Param("id", new ParseUUIDPipe({ version: "4" })) jobId: string,
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return {
      data: await this.service.findJob(
        principal.tenantId,
        principal.workspaceId,
        jobId,
      ),
    };
  }

  @Post("jobs/:id/retry")
  @OperationId("integrations.jobs.retry")
  @RequireCapabilities("integrations.jobs.manage")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async retryJob(
    @Param("id", new ParseUUIDPipe({ version: "4" })) jobId: string,
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    await this.service.retryJob(
      principal.tenantId,
      principal.workspaceId,
      jobId,
    );
    return { data: { jobId, status: "queued" } };
  }

  @Post("jobs/:id/cancel")
  @OperationId("integrations.jobs.cancel")
  @RequireCapabilities("integrations.jobs.manage")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async cancelJob(
    @Param("id", new ParseUUIDPipe({ version: "4" })) jobId: string,
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    await this.service.cancelJob(
      principal.tenantId,
      principal.workspaceId,
      jobId,
    );
    return { data: { jobId, status: "cancellation_requested" } };
  }

  @Post("connections/:id/sync")
  @OperationId("integrations.sync.connection.start")
  @RequireCapabilities("integrations.sync.run")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async sync(
    @Param("id", new ParseUUIDPipe({ version: "4" })) connectionId: string,
    @Principal() principal: RequestPrincipal,
    @Body() request: StartIntegrationSyncDto,
  ): Promise<object> {
    return {
      data: await this.service.startSync({
        connectionId,
        operation: "incremental_sync",
        providerId: request.providerId,
        request: {
          streams: request.streams,
          idempotencyKey: toIdempotencyKey(request.idempotencyKey),
        },
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      }),
    };
  }

  @Post("connections/:id/backfill")
  @OperationId("integrations.backfill.start")
  @RequireCapabilities("integrations.sync.run")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async backfill(
    @Param("id", new ParseUUIDPipe({ version: "4" })) connectionId: string,
    @Principal() principal: RequestPrincipal,
    @Body() request: StartIntegrationBackfillDto,
  ): Promise<object> {
    return {
      data: await this.service.startSync({
        connectionId,
        operation: "backfill",
        providerId: request.providerId,
        request: {
          streams: request.streams,
          idempotencyKey: toIdempotencyKey(request.idempotencyKey),
          from: toIsoDateTime(request.from),
          to: toIsoDateTime(request.to),
        },
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      }),
    };
  }
}
