import { Module, type DynamicModule } from "@nestjs/common";
import { CsrfGuard } from "./csrf.guard.js";
import { CsrfController } from "./csrf.controller.js";
import { HealthController } from "./health.controller.js";
import { ProxyController } from "./proxy.controller.js";
import type { BffConfig } from "./config.js";
import { createBffSessionStore } from "./session-store.js";
import { BFF_CONFIG } from "./tokens.js";
import { BFF_SESSION_STORE } from "./session-store.js";
import { BffSecurityService } from "./security.service.js";

@Module({
  controllers: [CsrfController, HealthController, ProxyController],
  providers: [CsrfGuard],
})
export class BffAppModule {
  static register(config: BffConfig): DynamicModule {
    return {
      controllers: [CsrfController, HealthController, ProxyController],
      module: BffAppModule,
      providers: [
        {
          provide: BFF_CONFIG,
          useValue: config,
        },
        {
          provide: BFF_SESSION_STORE,
          useFactory: () => createBffSessionStore(config),
        },
        BffSecurityService,
        CsrfGuard,
      ],
    };
  }
}
