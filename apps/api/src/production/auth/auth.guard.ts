import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasActiveMembership, type RequestWithPrincipal } from "./request-principal.js";
import { PrincipalService } from "./principal.service.js";
import { readRoutePolicy } from "./route-policy-reader.js";

@Injectable()
export class ProductionAuthGuard implements CanActivate {
  constructor(
    @Inject(PrincipalService)
    private readonly principalService: PrincipalService,

    @Inject(Reflector)
    private readonly reflector: Reflector,
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

    if (policy.policy.classification === "public") {
      return true;
    }

    if (policy.policy.classification === "external-provider") {
      return true;
    }

    if (policy.policy.classification === "infrastructure") {
      throw new ForbiddenException(
        "Infrastructure endpoint requires internal authentication.",
      );
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const principal = await this.principalService.resolve(request).catch(() => null);

    if (!principal) {
      throw new UnauthorizedException("Valid principal is required.");
    }

    if (!hasActiveMembership(principal)) {
      throw new ForbiddenException("Workspace membership is required.");
    }

    request.principal = principal;
    return true;
  }
}
