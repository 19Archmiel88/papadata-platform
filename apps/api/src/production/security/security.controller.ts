import { ForbiddenException, Inject } from "@nestjs/common";
import { Body, Controller, Delete, Post } from "@nestjs/common";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import {
  InvitationTokenDto,
  MfaCodeDto,
  MfaEnrollDto,
  RecoveryCodeDto,
  StepUpDto,
} from "../validation/dtos.js";
import { InvitationTokenService } from "./invitation-token.service.js";
import { StepUpService } from "./step-up.service.js";
import { TotpService } from "./totp.service.js";

@Controller("v1/security")
export class SecurityController {
  constructor(
    @Inject(TotpService) private readonly totp: TotpService,
    @Inject(StepUpService) private readonly stepUp: StepUpService,
    @Inject(InvitationTokenService) private readonly invitations: InvitationTokenService,
  ) {}

  @Post("mfa/enroll")
  @OperationId("security.mfa.enroll")
  @RequireCapabilities("auth.mfa.enroll")
  enroll(
    @Principal() principal: RequestPrincipal,
    @Body() body: MfaEnrollDto,
  ): Promise<object> {
    return this.totp.enroll({
      tenantId: principal.tenantId,
      userId: principal.userId,
      accountName: body.accountName,
    });
  }

  @Post("mfa/confirm")
  @OperationId("security.mfa.confirm")
  @RequireCapabilities("auth.mfa.enroll")
  async confirm(
    @Principal() principal: RequestPrincipal,
    @Body() body: MfaCodeDto,
  ): Promise<object> {
    return {
      verified: await this.totp.confirm({
        tenantId: principal.tenantId,
        userId: principal.userId,
        code: body.code,
      }),
    };
  }

  // Per-login MFA challenge: a fresh session starts at authLevel="session"
  // and, unlike mfa/confirm (which only ever fires once, against a
  // "pending" enrollment), this is the route every subsequent login uses
  // to prove an already-active TOTP factor and reach authLevel="mfa". See
  // BffSessionAssuranceService.verifyMfa.
  @Post("mfa/verify")
  @OperationId("security.mfa.verify")
  @RequireCapabilities("auth.mfa.enroll")
  async verify(
    @Principal() principal: RequestPrincipal,
    @Body() body: MfaCodeDto,
  ): Promise<object> {
    return {
      verified: await this.totp.verify({
        tenantId: principal.tenantId,
        userId: principal.userId,
        code: body.code,
      }),
    };
  }

  // Alternate path to the same outcome as mfa/verify when the TOTP device
  // is unavailable -- redeems one of the ten single-use recovery codes
  // issued at enroll time instead of a TOTP code.
  @Post("mfa/recovery-code/redeem")
  @OperationId("security.mfa.recovery-code.redeem")
  @RequireCapabilities("auth.mfa.enroll")
  async redeemRecoveryCode(
    @Principal() principal: RequestPrincipal,
    @Body() body: RecoveryCodeDto,
  ): Promise<object> {
    return {
      verified: await this.totp.redeemRecoveryCode({
        tenantId: principal.tenantId,
        userId: principal.userId,
        code: body.code,
      }),
    };
  }

  // Disables/revokes the account's MFA enrollment. Gated behind step-up
  // (not just mfa), matching the capability catalog's declared severity
  // for auth.mfa.manage ("critical", reauthenticationRequired: true) --
  // removing your own second factor is the most severe self-service
  // security downgrade available.
  @Delete("mfa")
  @OperationId("security.mfa.disable")
  @RequireCapabilities("auth.mfa.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  async disable(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    await this.totp.disable({
      tenantId: principal.tenantId,
      userId: principal.userId,
    });
    return { disabled: true };
  }

  @Post("step-up")
  @OperationId("security.step-up.issue")
  @RequireCapabilities("auth.step_up.issue")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async issueStepUp(
    @Principal() principal: RequestPrincipal,
    @Body() body: StepUpDto,
  ): Promise<object> {
    if (!await this.totp.verify({
      tenantId: principal.tenantId,
      userId: principal.userId,
      code: body.code,
    })) {
      throw new ForbiddenException("MFA verification failed");
    }

    return this.stepUp.issue({
      tenantId: principal.tenantId,
      userId: principal.userId,
      sessionId: principal.sessionId,
      assuranceLevel: "aal2",
      operationScope: body.operationScope,
      targetReference: body.targetReference ?? null,
    });
  }

  @Post("invitations/token")
  @OperationId("security.invitations.token.issue")
  @RequireCapabilities("tenant.membership.manage")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  issueInvitation(
    @Principal() principal: RequestPrincipal,
    @Body() body: InvitationTokenDto,
  ): Promise<object> {
    return this.invitations.issue({
      tenantId: principal.tenantId,
      invitationId: body.invitationId,
      tokenVersion: body.tokenVersion,
    });
  }
}
