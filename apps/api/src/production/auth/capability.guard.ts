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
  type RequestPrincipal,
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

    const scopeMismatch = findRequestScopeMismatch(request, principal);
    if (scopeMismatch) {
      await this.deniedAccessAudit.record({
        auditDeniedAccess: policy.policy.auditDeniedAccess,
        principal,
        reason: scopeMismatch,
        request,
        requiredAuthLevel: policy.policy.authLevel,
        requiredCapabilities: policy.policy.capabilities,
      });
      throw new ForbiddenException("Request scope is outside the principal.");
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
      // policy.policy.authLevel is guaranteed "mfa" or "step_up" here:
      // meetsAuthenticationLevel only fails a principal that is at least
      // "session" (the guard already required a principal above) against a
      // required level of "session", which always passes trivially.
      // Structured (not text-parsed) so ApiProblemFilter can forward a
      // canonical requiredAuthLevel to callers -- see api-problem.filter.ts.
      throw new ForbiddenException({
        message: "Required authentication level is missing.",
        requiredAuthLevel: policy.policy.authLevel,
      });
    }

    return true;
  }
}

function findRequestScopeMismatch(
  request: RequestWithPrincipal,
  principal: RequestPrincipal,
): "request_tenant_scope_mismatch" | "request_workspace_scope_mismatch" | null {
  const tenantIds = collectScopeValues(request, [
    "tenantId",
    "activeTenantId",
  ]);
  if (tenantIds.some((tenantId) => tenantId !== principal.tenantId)) {
    return "request_tenant_scope_mismatch";
  }

  const workspaceIds = collectScopeValues(request, [
    "workspaceId",
    "activeWorkspaceId",
  ]);
  if (
    workspaceIds.some((workspaceId) => workspaceId !== principal.workspaceId)
  ) {
    return "request_workspace_scope_mismatch";
  }

  return null;
}

function collectScopeValues(
  request: RequestWithPrincipal,
  keys: readonly string[],
): readonly string[] {
  const values = new Set<string>();
  const visited = new Set<unknown>();

  for (const source of [request.params, request.query, request.body]) {
    collectScopeValuesFromUnknown(source, keys, values, visited);
  }

  return [...values];
}

function collectScopeValuesFromUnknown(
  value: unknown,
  keys: readonly string[],
  values: Set<string>,
  visited: Set<unknown>,
): void {
  if (!value || typeof value !== "object" || visited.has(value)) {
    return;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      collectScopeValuesFromUnknown(item, keys, values, visited);
    }
    return;
  }

  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (
      keys.includes(entryKey)
      && typeof entryValue === "string"
      && entryValue.length > 0
    ) {
      values.add(entryValue);
      continue;
    }

    collectScopeValuesFromUnknown(entryValue, keys, values, visited);
  }
}
