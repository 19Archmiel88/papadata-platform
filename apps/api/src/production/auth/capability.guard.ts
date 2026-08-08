import {
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DeniedAccessAuditService } from "./denied-access-audit.service.js";
import { LivePrincipalAuthorizationService } from "./live-principal-authorization.service.js";
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

    @Inject(LivePrincipalAuthorizationService)
    private readonly liveAuthorization: LivePrincipalAuthorizationService,
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
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const principal = request.principal;

    if (!principal) {
      throw new UnauthorizedException("Request principal is required.");
    }

    const now = new Date();
    const authorization = await this.liveAuthorization.authorize({
      now,
      principal,
      requiredCapabilities: policy.policy.capabilities,
    }).catch((error: unknown) => {
      console.warn("Live authorization lookup failed", {
        error: error instanceof Error ? error.message : "unknown",
      });
      throw new ServiceUnavailableException(
        "Authorization data is unavailable.",
      );
    });

    if (!authorization.allowed) {
      await this.deniedAccessAudit.record({
        auditDeniedAccess: policy.policy.auditDeniedAccess,
        principal,
        reason: authorization.reason,
        request,
        requiredAuthLevel: policy.policy.authLevel,
        requiredCapabilities: policy.policy.capabilities,
      });
      throw new ForbiddenException("Required capability is missing.");
    }

    if (!meetsAuthenticationLevel(principal, policy.policy.authLevel, now)) {
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
