import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DeniedAccessAuditService } from "./denied-access-audit.service.js";
import {
  meetsAuthenticationLevel,
  type RequestWithPrincipal,
} from "./request-principal.js";
import { readRoutePolicy } from "./route-policy-reader.js";

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,

    @Inject(DeniedAccessAuditService)
    private readonly deniedAccessAudit: DeniedAccessAuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = readRoutePolicy(
      this.reflector,
      context.getHandler(),
      context.getClass(),
    );

    if (!policy.valid) {
      throw new ForbiddenException(policy.reason);
    }

    if (policy.policy.classification !== "authenticated") {
      if (policy.policy.classification === "infrastructure") {
        throw new ForbiddenException(
          "Infrastructure endpoint requires internal authentication.",
        );
      }

      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const principal = request.principal;

    if (!principal) {
      throw new UnauthorizedException("Request principal is required.");
    }

    const missingCapabilities = policy.policy.capabilities.filter(
      (capability) => !principal.capabilities.includes(capability),
    );

    if (missingCapabilities.length > 0) {
      await this.deniedAccessAudit.record({
        auditDeniedAccess: policy.policy.auditDeniedAccess,
        principal,
        reason: "capability_required",
        request,
        requiredAuthLevel: policy.policy.authLevel,
        requiredCapabilities: policy.policy.capabilities,
      });
      throw new ForbiddenException("Required capability is missing.");
    }

    if (
      !meetsAuthenticationLevel(
        principal,
        policy.policy.authLevel,
        new Date(),
      )
    ) {
      await this.deniedAccessAudit.record({
        auditDeniedAccess: policy.policy.auditDeniedAccess,
        principal,
        reason: "auth_level_required",
        request,
        requiredAuthLevel: policy.policy.authLevel,
        requiredCapabilities: policy.policy.capabilities,
      });
      throw new ForbiddenException(
        "Required authentication level is missing.",
      );
    }

    return true;
  }
}
