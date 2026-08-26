import { Module, type DynamicModule } from "@nestjs/common";
import { CsrfGuard } from "./csrf.guard.js";
import { CsrfController } from "./csrf.controller.js";
import { AuthController } from "./auth.controller.js";
import { ContractAccessController } from "./contract-access.controller.js";
import { ContractAuthController } from "./contract-auth.controller.js";
import { ContractPublicController } from "./contract-public.controller.js";
import { HealthController } from "./health.controller.js";
import { ProxyController } from "./proxy.controller.js";
import type { BffConfig } from "./config.js";
import { createBffSessionStore } from "./session-store.js";
import { BFF_CONFIG } from "./tokens.js";
import { BFF_SESSION_STORE } from "./session-store.js";
import { BffSecurityService } from "./security.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { BffOAuthService } from "./oauth.service.js";
import { BffSessionAssuranceService } from "./session-assurance.service.js";

@Module({})
export class BffAppModule {
  static register(config: BffConfig): DynamicModule {
    return {
      controllers: [
        AuthController,
        ContractAccessController,
        ContractAuthController,
        ContractPublicController,
        CsrfController,
        HealthController,
        ProxyController,
      ],
      module: BffAppModule,
      providers: [
        { provide: BFF_CONFIG, useValue: config },
        {
          provide: BFF_SESSION_STORE,
          useFactory: () => createBffSessionStore(config),
        },
        BffSecurityService,
        BffRateLimitService,
        CloudRunIdentityService,
        BffIdentitySessionService,
        BffOAuthService,
        BffSessionAssuranceService,
        CsrfGuard,
      ],
    };
  }
}
