import { Inject } from "@nestjs/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { toIdempotencyKey, toIsoDateTime } from "@papadata/contracts";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  CreateIntegrationConnectionDto,
  StartIntegrationBackfillDto,
  StartIntegrationSyncDto,
} from "../validation/dtos.js";
import { IntegrationService } from "./integration.service.js";

@Controller("v1/integrations")
export class IntegrationController {
  constructor(@Inject(IntegrationService) private readonly service: IntegrationService) {}

  @Get("providers")
  @OperationId("integrations.providers.list")
  @RequireCapabilities("integrations.catalog.read")
  listProviders(): object {
    return { data: this.service.listProviders() };
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
  ): Promise<object> {
    return {
      data: await this.service.createConnection(
        principal.tenantId,
        principal.workspaceId,
        {
          providerId: request.providerId,
          credentialReference: request.credentialReference,
          requestedScopes: request.requestedScopes,
          idempotencyKey: toIdempotencyKey(request.idempotencyKey),
        },
      ),
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
  ): Promise<object> {
    await this.service.disconnect(
      principal.tenantId,
      principal.workspaceId,
      connectionId,
    );
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
