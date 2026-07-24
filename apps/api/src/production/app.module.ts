import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { AuditController } from "./audit/audit.controller.js";
import { AuditService } from "./audit/audit.service.js";
import { CapabilityGuard } from "./auth/capability.guard.js";
import { DeniedAccessAuditService } from "./auth/denied-access-audit.service.js";
import {
  createPrincipalSessionStore,
  PRINCIPAL_CLOCK,
  PRINCIPAL_SESSION_STORE,
  PrincipalService,
  systemPrincipalClock,
} from "./auth/principal.service.js";
import { ProductionAuthGuard } from "./auth/auth.guard.js";
import { ProductionDatabase } from "@papadata/database";
import { DatabaseModule } from "./database.module.js";
import { HealthController } from "./health.controller.js";
import { IntegrationController } from "./integrations/integration.controller.js";
import {
  createIntegrationCredentialProvider,
  INTEGRATION_CREDENTIAL_PROVIDER,
} from "./integrations/credential-provider.js";
import { IntegrationService } from "./integrations/integration.service.js";
import { WebhookController } from "./integrations/webhook.controller.js";
import { MetricsController } from "./observability/metrics.controller.js";
import { PrivacyController } from "./privacy/privacy.controller.js";
import { PrivacyService } from "./privacy/privacy.service.js";
import { PlatformQueueService } from "./queue/platform-queue.service.js";
import { IntegrationQueueService } from "./queue/queue.service.js";
import { ReadinessController } from "./readiness.controller.js";
import { ReportController } from "./reports/report.controller.js";
import { ReportService } from "./reports/report.service.js";
import { Argon2PasswordService } from "./security/argon2.service.js";
import { InvitationTokenService } from "./security/invitation-token.service.js";
import { SecurityController } from "./security/security.controller.js";
import { StepUpService } from "./security/step-up.service.js";
import { TotpService } from "./security/totp.service.js";
import { ObjectStorageService } from "./storage/object-storage.service.js";

export const productionControllers = [
  HealthController,
  ReadinessController,
  MetricsController,
  IntegrationController,
  WebhookController,
  SecurityController,
  AuditController,
  PrivacyController,
  ReportController,
] as const;

@Module({
  controllers: [...productionControllers],
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  providers: [
    IntegrationService,
    {
      provide: INTEGRATION_CREDENTIAL_PROVIDER,
      inject: [ProductionDatabase],
      useFactory: createIntegrationCredentialProvider,
    },
    IntegrationQueueService,
    PlatformQueueService,
    Argon2PasswordService,
    TotpService,
    StepUpService,
    InvitationTokenService,
    AuditService,
    PrivacyService,
    ReportService,
    ObjectStorageService,
    {
      provide: PRINCIPAL_CLOCK,
      useValue: systemPrincipalClock,
    },
    {
      provide: PRINCIPAL_SESSION_STORE,
      useFactory: createPrincipalSessionStore,
    },
    PrincipalService,
    DeniedAccessAuditService,
    {
      provide: APP_GUARD,
      useClass: ProductionAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CapabilityGuard,
    },
  ],
})
export class ProductionAppModule {}
