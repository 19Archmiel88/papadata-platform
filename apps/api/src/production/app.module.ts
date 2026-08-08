import { Module } from "@nestjs/common";
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
} from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ProductionDatabase } from "@papadata/database";
import { AuditController } from "./audit/audit.controller.js";
import { AuditService } from "./audit/audit.service.js";
import { CapabilityGuard } from "./auth/capability.guard.js";
import { DeniedAccessAuditService } from "./auth/denied-access-audit.service.js";
import { LivePrincipalAuthorizationService } from "./auth/live-principal-authorization.service.js";
import {
  createPrincipalSessionStore,
  PRINCIPAL_CLOCK,
  PRINCIPAL_SESSION_STORE,
  PrincipalService,
  systemPrincipalClock,
} from "./auth/principal.service.js";
import { ProductionAuthGuard } from "./auth/auth.guard.js";
import { DatabaseModule } from "./database.module.js";
import { CommandExecutionInterceptor } from "./commands/command-execution.interceptor.js";
import { HealthController } from "./health.controller.js";
import { IntegrationController } from "./integrations/integration.controller.js";
import { IdentityController } from "./identity/identity.controller.js";
import { IdentityService } from "./identity/identity.service.js";
import { ProductController } from "./product/product.controller.js";
import { ProductService } from "./product/product.service.js";
import {
  createIntegrationCredentialProvider,
  INTEGRATION_CREDENTIAL_PROVIDER,
} from "./integrations/credential-provider.js";
import { IntegrationService } from "./integrations/integration.service.js";
import { WebhookController } from "./integrations/webhook.controller.js";
import { WebhookService } from "./integrations/webhook.service.js";
import { ApiProblemFilter } from "./observability/api-problem.filter.js";
import { MetricsController } from "./observability/metrics.controller.js";
import { RequestContextInterceptor } from "./observability/request-context.interceptor.js";
import { RequestMetricsInterceptor } from "./observability/request-metrics.interceptor.js";
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
import { ContractRuntimeService } from "./contract-runtime/contract-runtime.service.js";
import { contractRuntimeControllers } from "./contract-runtime/generated/index.js";

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
  IdentityController,
  ProductController,
  ...contractRuntimeControllers,
] as const;

@Module({
  controllers: [...productionControllers],
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  providers: [
    IntegrationService,
    WebhookService,
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
    IdentityService,
    ProductService,
    ContractRuntimeService,
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
    LivePrincipalAuthorizationService,
    DeniedAccessAuditService,
    {
      provide: APP_GUARD,
      useClass: ProductionAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CapabilityGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommandExecutionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiProblemFilter,
    },
  ],
})
export class ProductionAppModule {}
