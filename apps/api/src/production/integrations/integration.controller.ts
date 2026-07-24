import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import type {
  CreateIntegrationConnectionRequest,
  MvpIntegrationCatalogProviderId,
  StartIntegrationBackfillRequest,
  StartIntegrationSyncRequest,
} from "@papadata/contracts";
import {
  AuditDeniedAccess,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { IntegrationService } from "./integration.service.js";

@Controller("v1/integrations")
export class IntegrationController {
  constructor(private readonly service: IntegrationService) {}

  @Get("providers")
  @RequireCapabilities("integrations.catalog.read")
  listProviders(): object {
    return { data: this.service.listProviders() };
  }

  @Get("connections")
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
  @RequireCapabilities("integrations.connection.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async createConnection(
    @Principal() principal: RequestPrincipal,
    @Body() request: CreateIntegrationConnectionRequest,
  ): Promise<object> {
    return {
      data: await this.service.createConnection(
        principal.tenantId,
        principal.workspaceId,
        request,
      ),
    };
  }

  @Delete("connections/:id")
  @RequireCapabilities("integrations.connection.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async disconnect(
    @Param("id") connectionId: string,
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
  @RequireCapabilities("integrations.jobs.read")
  async findJob(
    @Param("id") jobId: string,
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
  @RequireCapabilities("integrations.jobs.manage")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async retryJob(
    @Param("id") jobId: string,
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
  @RequireCapabilities("integrations.jobs.manage")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async cancelJob(
    @Param("id") jobId: string,
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    await this.service.cancelJob(
      principal.tenantId,
      principal.workspaceId,
      jobId,
    );
    return { data: { jobId, status: "cancelled" } };
  }

  @Post("connections/:id/sync")
  @RequireCapabilities("integrations.sync.run")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async sync(
    @Param("id") connectionId: string,
    @Principal() principal: RequestPrincipal,
    @Body() request: StartIntegrationSyncRequest & { providerId: MvpIntegrationCatalogProviderId },
  ): Promise<object> {
    return {
      data: await this.service.startSync({
        connectionId,
        operation: "incremental_sync",
        providerId: request.providerId,
        request,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      }),
    };
  }

  @Post("connections/:id/backfill")
  @RequireCapabilities("integrations.sync.run")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async backfill(
    @Param("id") connectionId: string,
    @Principal() principal: RequestPrincipal,
    @Body() request: StartIntegrationBackfillRequest & { providerId: MvpIntegrationCatalogProviderId },
  ): Promise<object> {
    return {
      data: await this.service.startSync({
        connectionId,
        operation: "backfill",
        providerId: request.providerId,
        request,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      }),
    };
  }
}
