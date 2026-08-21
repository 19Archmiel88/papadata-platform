import { Controller, Get } from "@nestjs/common";
import { OperationId, PublicEndpoint } from "./auth/route-policy.js";

// Liveness-only contract, deliberately kept in sync with apps/bff/src/health.controller.ts:
//   /healthz  -- the canonical liveness probe (process is up, zero dependency checks).
//   /health   -- a plain alias of /healthz, kept only because
//                tests/backend-production-parity/smoke.mjs, config/backend-release-scope.json
//                and artifacts/backend-evidence/route-map.json already depend on it; not a
//                second, differently-scoped check.
//   /startupz -- see readiness.controller.ts (startup probe).
//   /readyz   -- see readiness.controller.ts (dependency checks: postgresql/redis/storage).
// Before this fix, the API only exposed /health -- BFF exposed both /health
// and /healthz, so the two services' health contracts silently diverged.
@Controller()
export class HealthController {
  @Get("health")
  @PublicEndpoint()
  @OperationId("infrastructure.health.live")
  health(): object {
    return { status: "ok", service: "papadata-api" };
  }

  @Get("healthz")
  @PublicEndpoint()
  @OperationId("infrastructure.health.live.healthz")
  healthz(): object {
    return { status: "alive", service: "papadata-api" };
  }
}
