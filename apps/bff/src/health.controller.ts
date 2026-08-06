import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import type { BffConfig } from "./config.js";
import { BFF_CONFIG } from "./tokens.js";

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
