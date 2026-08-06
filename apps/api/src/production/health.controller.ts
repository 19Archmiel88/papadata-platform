import { Controller, Get } from "@nestjs/common";
import { OperationId, PublicEndpoint } from "./auth/route-policy.js";

@Controller()
export class HealthController {
  @Get("health")
  @PublicEndpoint()
  @OperationId("infrastructure.health.live")
  health(): object {
    return { status: "ok", service: "papadata-api" };
  }
}
