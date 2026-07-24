import { Inject, Injectable } from "@nestjs/common";
import type { CanonicalCapability } from "@papadata/contracts";
import { AuditService } from "../audit/audit.service.js";
import type { AuthenticationLevel, RequestPrincipal } from "./request-principal.js";

@Injectable()
export class DeniedAccessAuditService {
  constructor(
    @Inject(AuditService)
    private readonly audit: AuditService,
  ) {}

  async record(input: {
    readonly auditDeniedAccess: boolean;
    readonly principal: RequestPrincipal | null;
    readonly reason: string;
    readonly request: {
      readonly headers?: Record<string, string | readonly string[] | undefined>;
      readonly method?: string;
      readonly url?: string;
    };
    readonly requiredAuthLevel: AuthenticationLevel | null;
    readonly requiredCapabilities: readonly CanonicalCapability[];
  }): Promise<void> {
    if (!input.auditDeniedAccess) {
      return;
    }

    try {
      await this.audit.append({
        action: "api.access.denied",
        actorId: input.principal?.userId ?? "anonymous",
        actorType: input.principal ? "user" : "system",
        correlationId:
          readHeader(input.request.headers, "x-correlation-id") ?? "unknown",
        metadata: {
          reason: input.reason,
          requiredAuthLevel: input.requiredAuthLevel,
          requiredCapabilities: input.requiredCapabilities,
        },
        outcome: "denied",
        resourceId: [
          input.request.method ?? "UNKNOWN",
          input.request.url ?? "unknown",
        ].join(" "),
        resourceType: "api_endpoint",
        tenantId: input.principal?.tenantId ?? null,
        workspaceId: input.principal?.workspaceId ?? null,
      });
    } catch (error) {
      console.warn("Denied access audit failed", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }
}

function readHeader(
  headers: Record<string, string | readonly string[] | undefined> | undefined,
  name: string,
): string | null {
  const value = headers?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return first && first.length > 0 ? first : null;
}
