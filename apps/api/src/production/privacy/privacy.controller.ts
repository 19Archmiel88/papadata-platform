import { Inject } from "@nestjs/common";
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
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
import {
  ApprovePrivacyRequestDto,
  CreatePrivacyRequestDto,
  RecordPrivacyIdentityVerificationDto,
} from "../validation/dtos.js";
import { PrivacyService } from "./privacy.service.js";

@Controller("v1/privacy")
export class PrivacyController {
  constructor(@Inject(PrivacyService) private readonly privacy: PrivacyService) {}

  @Post("requests")
  @OperationId("privacy.requests.create")
  @RequireCapabilities("privacy.dsar.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  create(
    @Principal() principal: RequestPrincipal,
    @Headers("x-correlation-id") correlation: string | undefined,
    @Body() body: CreatePrivacyRequestDto,
  ): Promise<object> {
    if (!correlation) {
      throw new BadRequestException("x-correlation-id is required.");
    }

    return this.privacy.create({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      subjectReference: body.subjectReference,
      requestType: body.requestType,
      correlationId: correlation,
    });
  }

  @Post("identity-verifications")
  @OperationId("privacy.identity-verifications.create")
  @RequireCapabilities("privacy.deletion.approve")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  recordIdentityVerification(
    @Principal() principal: RequestPrincipal,
    @Body() body: RecordPrivacyIdentityVerificationDto,
  ): Promise<object> {
    return this.privacy.recordIdentityVerification({
      tenantId: principal.tenantId,
      subjectReference: body.subjectReference,
      verifiedBy: principal.userId,
      verificationMethod: body.verificationMethod,
      evidenceReference: body.evidenceReference,
      expiresAt: body.expiresAt,
    });
  }

  @Post("requests/:id/approve")
  @OperationId("privacy.requests.approve")
  @RequireCapabilities("privacy.deletion.approve")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  approve(
    @Param("id", new ParseUUIDPipe({ version: "4" })) requestId: string,
    @Principal() principal: RequestPrincipal,
    @Body() body: ApprovePrivacyRequestDto,
  ): Promise<object> {
    return this.privacy.approve({
      tenantId: principal.tenantId,
      requestId,
      approvedBy: principal.userId,
      identityVerificationEvidenceId: body.identityVerificationEvidenceId,
    });
  }
}
