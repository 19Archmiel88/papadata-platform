import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import type { BffConfig } from "./config.js";
import { BFF_CONFIG } from "./tokens.js";

// Liveness-only contract, deliberately kept in sync with
// apps/api/src/production/health.controller.ts:
//   /healthz  -- the canonical liveness probe (process is up, zero dependency checks).
//   /health   -- a plain alias of /healthz, kept only because
//                tests/backend-production-parity/smoke.mjs, config/backend-release-scope.json
//                and artifacts/backend-evidence/route-map.json already depend on it; not a
//                second, differently-scoped check.
//   /startupz -- process has finished booting (no dependency checks either).
//   /readyz   -- the only endpoint that checks dependencies: proxies the
//                upstream API's own /readyz and only reports "ready" if the
//                API does too (see below).
@Controller()
export class HealthController {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,

    @Inject(CloudRunIdentityService)
    private readonly cloudRunIdentity: CloudRunIdentityService,
  ) {}

  @Get("health")
  health(): object {
    return {
      service: "papadata-bff",
      status: "ok",
    };
  }

  @Get("healthz")
  healthz(): object {
    return {
      service: "papadata-bff",
      status: "alive",
    };
  }

  @Get("startupz")
  startupz(): object {
    return {
      service: "papadata-bff",
      status: "started",
    };
  }

  @Get("readyz")
  async readyz(): Promise<object> {
    try {
      const authorization = await this.cloudRunIdentity.authorizationHeader();
      const response = await fetch(
        `${this.config.apiOrigin}/readyz`,
        {
          headers: authorization ? { authorization } : undefined,
          signal: AbortSignal.timeout(this.config.upstreamTimeoutMs),
        },
      );

      const upstream: unknown = await response.json();

      if (
        !response.ok
        || !isRecord(upstream)
        || upstream.status !== "ready"
      ) {
        throw new Error("Upstream API is not ready.");
      }

      return {
        dependencies: [
          {
            name: "api",
            ready: true,
          },
        ],
        service: "papadata-bff",
        status: "ready",
        upstream,
      };
    } catch {
      throw new ServiceUnavailableException({
        dependencies: [
          {
            name: "api",
            ready: false,
          },
        ],
        error: "Upstream API readiness check failed.",
        service: "papadata-bff",
        status: "not_ready",
      });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
