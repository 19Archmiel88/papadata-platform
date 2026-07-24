import { Controller, Get } from "@nestjs/common";
import { ProductionDatabase } from "@papadata/database";
import { PublicEndpoint } from "./auth/route-policy.js";

@Controller()
export class HealthController {
  constructor(private readonly database: ProductionDatabase) {}

  @Get("health")
  @PublicEndpoint()
  health(): object {
    return { status: "ok", service: "papadata-api" };
  }

  @Get("ready")
  @PublicEndpoint()
  async ready(): Promise<object> {
    return {
      status: (await this.database.checkHealth()) ? "ready" : "blocked",
      dependencies: ["postgresql", "redis", "storage", "otel"],
    };
  }
}
