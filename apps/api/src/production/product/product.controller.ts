import { Inject } from "@nestjs/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { ProductRecordMutationDto, ProductRecordPatchDto, SearchDto } from "./product.dto.js";
import { ProductService } from "./product.service.js";

@Controller("v1")
export class ProductController {
  constructor(@Inject(ProductService) private readonly service: ProductService) {}

  @Get("dashboard/command-center")
  @OperationId("dashboard.command-center.read")
  @RequireCapabilities("analytics.command_center.read")
  async commandCenter(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.dashboard(principal) };
  }

  @Get("metrics")
  @OperationId("analytics.metrics.list")
  @RequireCapabilities("analytics.metrics.read")
  async metrics(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "analytics", "metric_snapshot", 250) };
  }

  @Post("metrics/compare")
  @OperationId("analytics.metrics.compare")
  @RequireCapabilities("analytics.metrics.compare")
  async compareMetrics(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "analytics", "comparison", input, "analytics.metrics.compare", ctx(correlationId, idempotencyKey)) };
  }

  @Get("campaigns")
  @OperationId("campaigns.list")
  @RequireCapabilities("analytics.metrics.read")
  async campaigns(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "marketing", "campaign", 250) };
  }

  @Get("orders")
  @OperationId("orders.list")
  @RequireCapabilities("analytics.metrics.read")
  async orders(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "commerce", "order", 250) };
  }

  @Get("products")
  @OperationId("products.list")
  @RequireCapabilities("analytics.metrics.read")
  async products(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "commerce", "product", 250) };
  }

  @Get("customers")
  @OperationId("customers.list")
  @RequireCapabilities("analytics.metrics.read")
  async customers(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "commerce", "customer", 250) };
  }

  @Get("traffic")
  @OperationId("traffic.list")
  @RequireCapabilities("analytics.metrics.read")
  async traffic(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "analytics", "traffic_snapshot", 250) };
  }

  @Get("workspaces")
  @OperationId("workspaces.list")
  @RequireCapabilities("workspace.read")
  async workspaces(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "access", "workspace", 100) };
  }

  @Patch("workspaces/:key")
  @OperationId("workspaces.update")
  @RequireCapabilities("workspace.manage")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async updateWorkspace(
    @Principal() principal: RequestPrincipal,
    @Param("key") key: string,
    @Body() input: ProductRecordPatchDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.patch(principal, "access", "workspace", key, input, "workspaces.update", ctx(correlationId, idempotencyKey)) };
  }

  @Get("onboarding")
  @OperationId("onboarding.read")
  @RequireCapabilities("workspace.read")
  async onboarding(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "onboarding", "flow", 20) };
  }

  @Put("onboarding")
  @OperationId("onboarding.update")
  @RequireCapabilities("workspace.manage")
  async updateOnboarding(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "onboarding", "flow", input, "onboarding.update", ctx(correlationId, idempotencyKey)) };
  }

  @Get("notifications")
  @OperationId("notifications.list")
  @RequireCapabilities("workspace.read")
  async notifications(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "communication", "notification", 200) };
  }

  @Patch("notifications/:key")
  @OperationId("notifications.update")
  @RequireCapabilities("workspace.read")
  async updateNotification(
    @Principal() principal: RequestPrincipal,
    @Param("key") key: string,
    @Body() input: ProductRecordPatchDto,
    @Headers("x-correlation-id") correlationId?: string,
  ): Promise<object> {
    return { data: await this.service.patch(principal, "communication", "notification", key, input, "notifications.update", ctx(correlationId)) };
  }

  @Get("data-quality/issues")
  @OperationId("data-quality.issues.list")
  @RequireCapabilities("analytics.metrics.read")
  async dataQuality(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "data_quality", "issue", 200) };
  }

  @Post("data-quality/issues")
  @OperationId("data-quality.issues.create")
  @RequireCapabilities("integrations.jobs.manage")
  async createDataQualityIssue(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "data_quality", "issue", input, "data-quality.issues.create", ctx(correlationId, idempotencyKey)) };
  }

  @Get("targets")
  @OperationId("targets.list")
  @RequireCapabilities("analytics.metrics.read")
  async targets(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "planning", "target", 200) };
  }

  @Post("targets")
  @OperationId("targets.create")
  @RequireCapabilities("workspace.manage")
  async createTarget(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "planning", "target", input, "targets.create", ctx(correlationId, idempotencyKey)) };
  }

  @Patch("targets/:key")
  @OperationId("targets.update")
  @RequireCapabilities("workspace.manage")
  async updateTarget(
    @Principal() principal: RequestPrincipal,
    @Param("key") key: string,
    @Body() input: ProductRecordPatchDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.patch(principal, "planning", "target", key, input, "targets.update", ctx(correlationId, idempotencyKey)) };
  }

  @Get("annotations")
  @OperationId("annotations.list")
  @RequireCapabilities("analytics.metrics.read")
  async annotations(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "planning", "annotation", 200) };
  }

  @Post("annotations")
  @OperationId("annotations.create")
  @RequireCapabilities("workspace.manage")
  async createAnnotation(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "planning", "annotation", input, "annotations.create", ctx(correlationId, idempotencyKey)) };
  }

  @Delete("annotations/:key")
  @OperationId("annotations.delete")
  @RequireCapabilities("workspace.manage")
  async deleteAnnotation(@Principal() principal: RequestPrincipal, @Param("key") key: string): Promise<object> {
    return { data: { deleted: await this.service.remove(principal, "planning", "annotation", key, "annotations.delete") } };
  }

  @Get("settings")
  @OperationId("settings.current.read")
  @RequireCapabilities("workspace.read")
  async settings(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "configuration", "setting", 200) };
  }

  @Put("settings")
  @OperationId("settings.update")
  @RequireCapabilities("workspace.manage")
  async updateSettings(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "configuration", "setting", input, "settings.update", ctx(correlationId, idempotencyKey)) };
  }

  @Get("billing/subscription")
  @OperationId("billing.subscription.current.read")
  @RequireCapabilities("billing.read")
  async billing(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "billing", "subscription", 10) };
  }

  @Post("billing/subscription/change-plan")
  @OperationId("billing.subscription.change-plan")
  @RequireCapabilities("billing.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async changePlan(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "billing", "subscription", input, "billing.subscription.change-plan", ctx(correlationId, idempotencyKey)) };
  }

  @Get("ai/history")
  @OperationId("ai.history.list")
  @RequireCapabilities("ai.history.read")
  async aiHistory(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "ai", "run", 200) };
  }

  @Post("ai/runs")
  @OperationId("ai.runs.create")
  @RequireCapabilities("ai.assistant.run")
  async createAiRun(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "ai", "run", input, "ai.runs.create", ctx(correlationId, idempotencyKey)) };
  }

  @Post("ai/actions")
  @OperationId("ai.actions.create")
  @RequireCapabilities("ai.action_proposal.create")
  async createAiAction(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "ai", "action_proposal", input, "ai.actions.create", ctx(correlationId, idempotencyKey)) };
  }

  @Post("ai/actions/:key/approve")
  @OperationId("ai.actions.approve")
  @RequireCapabilities("ai.action_proposal.approve")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async approveAiAction(
    @Principal() principal: RequestPrincipal,
    @Param("key") key: string,
    @Body() input: ProductRecordPatchDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.patch(principal, "ai", "action_proposal", key, { ...input, status: "approved" }, "ai.actions.approve", ctx(correlationId, idempotencyKey)) };
  }

  @Get("support/threads")
  @OperationId("support.threads.list")
  @RequireCapabilities("workspace.read")
  async supportThreads(@Principal() principal: RequestPrincipal): Promise<object> {
    return { data: await this.service.list(principal, "support", "thread", 100) };
  }

  @Post("support/threads")
  @OperationId("support.threads.create")
  @RequireCapabilities("workspace.read")
  async createSupportThread(
    @Principal() principal: RequestPrincipal,
    @Body() input: ProductRecordMutationDto,
    @Headers("x-correlation-id") correlationId?: string,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): Promise<object> {
    return { data: await this.service.create(principal, "support", "thread", input, "support.threads.create", ctx(correlationId, idempotencyKey)) };
  }

  @Get("search")
  @OperationId("search.query")
  @RequireCapabilities("workspace.read")
  async search(@Principal() principal: RequestPrincipal, @Query() query: SearchDto): Promise<object> {
    return { data: await this.service.search(principal, query.query) };
  }
}

function ctx(correlationId?: string, idempotencyKey?: string) {
  return { correlationId: correlationId ?? null, idempotencyKey: idempotencyKey ?? null };
}
