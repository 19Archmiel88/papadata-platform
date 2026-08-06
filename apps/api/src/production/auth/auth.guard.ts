import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { timingSafeEqual } from "node:crypto";
import { readProductionConfig } from "../config.js";
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

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();

    if (policy.policy.classification === "infrastructure") {
      const supplied = readHeader(request, "x-papadata-infrastructure-token");
      const expected = readProductionConfig().infrastructureAuthToken;

      if (!supplied || !safeEqual(supplied, expected)) {
        throw new UnauthorizedException(
          "Valid infrastructure authentication is required.",
        );
      }

      return true;
    }

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

function readHeader(
  request: RequestWithPrincipal,
  name: string,
): string | null {
  const value = request.headers?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.length > 0 ? first : null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}
