import { Injectable } from "@nestjs/common";
import { PrivacyRepository, ProductionDatabase } from "@papadata/database";
import type { PrivacyRequestType } from "@papadata/contracts";
import { PlatformQueueService } from "../queue/platform-queue.service.js";

const targets = ["database", "cache", "search_index", "queue", "object_storage", "provider", "ai", "backup"] as const;

@Injectable()
export class PrivacyService {
  private readonly repository: PrivacyRepository;

  constructor(database: ProductionDatabase, private readonly queue: PlatformQueueService) {
    this.repository = new PrivacyRepository(database);
  }

  create(input: {
    tenantId: string;
    workspaceId: string | null;
    subjectReference: string;
    requestType: PrivacyRequestType;
    correlationId: string;
  }): Promise<Record<string, unknown>> {
    return this.repository.createRequest({
      ...input,
      dueAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      targets,
    });
  }

  async approve(input: {
    tenantId: string;
    requestId: string;
    approvedBy: string;
    identityVerified: boolean;
  }): Promise<Record<string, unknown>> {
    if (!input.identityVerified) throw new Error("Subject identity must be verified before approval");
    const request = await this.repository.approveRequest(input);
    if (!request) throw new Error("Privacy request cannot be approved");
    await this.queue.enqueue({
      jobType: "privacy_request",
      tenantId: input.tenantId,
      workspaceId: typeof request.workspace_id === "string" ? request.workspace_id : null,
      payload: {
        requestId: input.requestId,
        requestType: request.request_type,
        subjectReference: request.subject_reference,
      },
      idempotencyKey: `privacy:${input.requestId}`,
    });
    await this.repository.markQueued(input.requestId);
    return request;
  }
}
