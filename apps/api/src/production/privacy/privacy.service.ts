import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PrivacyRepository, ProductionDatabase } from "@papadata/database";
import type { PrivacyRequestType } from "@papadata/contracts";
import { PlatformQueueService } from "../queue/platform-queue.service.js";

const targets = [
  "database",
  "cache",
  "search_index",
  "queue",
  "object_storage",
  "provider",
  "ai",
  "backup",
] as const;

@Injectable()
export class PrivacyService {
  private readonly repository: PrivacyRepository;

  constructor(
    @Inject(ProductionDatabase) private readonly database: ProductionDatabase,
    @Inject(PlatformQueueService) private readonly queue: PlatformQueueService,
  ) {
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

  async recordIdentityVerification(input: {
    tenantId: string;
    subjectReference: string;
    verifiedBy: string;
    verificationMethod: string;
    evidenceReference: string;
    expiresAt: string;
  }): Promise<Record<string, unknown>> {
    const row = await this.database.withTenantWorkspace(
      input.tenantId,
      null,
      async (client) => (await client.query<Record<string, unknown>>(
        `insert into app.privacy_identity_verifications (
           tenant_id,
           subject_reference,
           verification_method,
           evidence_reference,
           verified_by,
           verified_at,
           expires_at
         )
         values ($1, $2, $3, $4, $5, now(), $6)
         returning id, subject_reference, verification_method, verified_at, expires_at`,
        [
          input.tenantId,
          input.subjectReference,
          input.verificationMethod,
          input.evidenceReference,
          input.verifiedBy,
          input.expiresAt,
        ],
      )).rows[0] ?? null,
    );
    if (!row) throw new Error("Identity verification evidence was not saved");
    return row;
  }

  async approve(input: {
    tenantId: string;
    requestId: string;
    approvedBy: string;
    identityVerificationEvidenceId: string;
  }): Promise<Record<string, unknown>> {
    const request = await this.database.withTenantWorkspace(
      input.tenantId,
      null,
      async (client): Promise<Record<string, unknown> | null> => {
        const result = await client.query<Record<string, unknown>>(
          `select request.*
           from app.privacy_requests as request
           join app.privacy_identity_verifications as verification
             on verification.tenant_id::text = request.tenant_id::text
            and verification.subject_reference = request.subject_reference
           where request.tenant_id::text = $1
             and request.id = $2
             and request.status = 'identity_verification_pending'
             and request.legal_hold = false
             and verification.id = $3
             and verification.consumed_at is null
             and verification.expires_at > now()
           for update of request, verification`,
          [
            input.tenantId,
            input.requestId,
            input.identityVerificationEvidenceId,
          ],
        );
        const selected = result.rows[0] ?? null;
        if (!selected) {
          throw new Error(
            "Privacy request cannot be approved without valid identity verification evidence",
          );
        }

        await client.query(
          `update app.privacy_identity_verifications
           set consumed_at = now(), privacy_request_id = $2
           where id = $1`,
          [input.identityVerificationEvidenceId, input.requestId],
        );
        const approved = await client.query<Record<string, unknown>>(
          `update app.privacy_requests
           set status = 'approved',
               identity_verified_at = now(),
               approved_by = $3,
               approved_at = now()
           where tenant_id::text = $1 and id = $2
           returning *`,
          [input.tenantId, input.requestId, input.approvedBy],
        );
        return approved.rows[0] ?? null;
      },
    );

    if (!request) {
      throw new Error("Privacy request approval did not return a row");
    }

    const workspaceId = typeof request.workspace_id === "string"
      ? request.workspace_id
      : null;
    await this.queue.enqueue({
      jobType: "privacy_request",
      tenantId: input.tenantId,
      workspaceId,
      payload: {
        requestId: input.requestId,
        requestType: request.request_type,
        subjectReference: request.subject_reference,
      },
      idempotencyKey: `privacy:${input.requestId}`,
    });
    await this.repository.markQueued({
      tenantId: input.tenantId,
      workspaceId,
      requestId: input.requestId,
    });
    return request;
  }
}
