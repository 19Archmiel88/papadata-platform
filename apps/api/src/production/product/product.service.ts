import { Inject } from "@nestjs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductDomainRepository } from "@papadata/database";
import { ProductionDatabase } from "@papadata/database";
import type { RequestPrincipal } from "../auth/request-principal.js";
import type { ProductRecordMutationDto, ProductRecordPatchDto } from "./product.dto.js";

@Injectable()
export class ProductService {
  private readonly repository: ProductDomainRepository;

  constructor(@Inject(ProductionDatabase) database: ProductionDatabase) {
    this.repository = new ProductDomainRepository(database);
  }

  list(principal: RequestPrincipal, domain: string, entityType: string, limit?: number) {
    return this.repository.list({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain,
      entityType,
      ...(limit ? { limit } : {}),
    });
  }

  async find(principal: RequestPrincipal, domain: string, entityType: string, key: string) {
    const record = await this.repository.find({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain,
      entityType,
      externalKey: key,
    });
    if (!record) throw new NotFoundException("Record not found.");
    return record;
  }

  create(
    principal: RequestPrincipal,
    domain: string,
    entityType: string,
    input: ProductRecordMutationDto,
    operationId: string,
    context: MutationContext,
  ) {
    return this.repository.upsert({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain,
      entityType,
      externalKey: input.externalKey,
      status: input.status ?? "active",
      data: input.data,
      actorUserId: principal.userId,
      operationId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
    });
  }

  async patch(
    principal: RequestPrincipal,
    domain: string,
    entityType: string,
    key: string,
    input: ProductRecordPatchDto,
    operationId: string,
    context: MutationContext,
  ) {
    const current = await this.find(principal, domain, entityType, key);
    return this.repository.upsert({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain,
      entityType,
      externalKey: key,
      status: input.status ?? current.status,
      data: { ...current.data, ...input.data },
      actorUserId: principal.userId,
      operationId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
    });
  }

  remove(principal: RequestPrincipal, domain: string, entityType: string, key: string, operationId: string) {
    return this.repository.remove({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain,
      entityType,
      externalKey: key,
      actorUserId: principal.userId,
      operationId,
    });
  }

  search(principal: RequestPrincipal, query: string) {
    return this.repository.search({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      query,
    });
  }

  dashboard(principal: RequestPrincipal) {
    return this.repository.dashboardSummary(principal.tenantId, principal.workspaceId);
  }
}

export type MutationContext = {
  readonly correlationId: string | null;
  readonly idempotencyKey: string | null;
};
