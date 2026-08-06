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

    const correlationId =
      readHeader(input.request.headers, "x-correlation-id") ?? "unknown";
    const resourceId = [
      input.request.method ?? "UNKNOWN",
      input.request.url ?? "unknown",
    ].join(" ");

    if (!input.principal) {
      console.warn("Anonymous API access denied", {
        correlationId,
        reason: input.reason,
        resourceId,
      });
      return;
    }

    try {
      await this.audit.append({
        action: "api.access.denied",
        actorId: input.principal.userId,
        actorType: "user",
        correlationId,
        metadata: {
          reason: input.reason,
          requiredAuthLevel: input.requiredAuthLevel,
          requiredCapabilities: input.requiredCapabilities,
        },
        outcome: "denied",
        resourceId,
        resourceType: "api_endpoint",
        tenantId: input.principal.tenantId,
        workspaceId: input.principal.workspaceId,
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
