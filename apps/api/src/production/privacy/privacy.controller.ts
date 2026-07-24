import { Body, Controller, Headers, Param, Post } from "@nestjs/common";
import type { PrivacyRequestType } from "@papadata/contracts";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { PrivacyService } from "./privacy.service.js";

const required = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`Missing header: ${name}`);
  return value;
};

@Controller("v1/privacy")
export class PrivacyController {
  constructor(private readonly privacy: PrivacyService) {}

  @Post("requests")
  @RequireCapabilities("privacy.dsar.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  create(
    @Principal() principal: RequestPrincipal,
    @Headers("x-correlation-id") correlation: string | undefined,
    @Body() body: { subjectReference: string; requestType: PrivacyRequestType },
  ): Promise<object> {
    return this.privacy.create({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      subjectReference: body.subjectReference,
      requestType: body.requestType,
      correlationId: required(correlation, "x-correlation-id"),
    });
  }

  @Post("requests/:id/approve")
  @RequireCapabilities("privacy.deletion.approve")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  approve(
    @Param("id") requestId: string,
    @Principal() principal: RequestPrincipal,
    @Body() body: { identityVerified: boolean },
  ): Promise<object> {
    return this.privacy.approve({
      tenantId: principal.tenantId,
      requestId,
      approvedBy: principal.userId,
      identityVerified: body.identityVerified,
    });
  }
}
