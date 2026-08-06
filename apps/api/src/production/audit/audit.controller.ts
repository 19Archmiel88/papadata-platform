import { Inject } from "@nestjs/common";
import { Body, Controller, ForbiddenException, Post } from "@nestjs/common";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  OperationId,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { VerifyAuditChainDto } from "../validation/dtos.js";
import { AuditService } from "./audit.service.js";

@Controller("v1/audit")
export class AuditController {
  constructor(@Inject(AuditService) private readonly audit: AuditService) {}

  @Post("verify")
  @OperationId("audit.chain.verify")
  @RequireCapabilities("audit.verify")
  @RequireAuthLevel("step_up")
  @AuditDeniedAccess()
  verify(
    @Principal() principal: RequestPrincipal,
    @Body() body: VerifyAuditChainDto,
  ): Promise<object> {
    if (body.chainScope !== principal.tenantId) {
      throw new ForbiddenException(
        "Audit chain scope must match the authenticated tenant.",
      );
    }
    return this.audit.verify(principal.tenantId, body.chainScope);
  }
}
