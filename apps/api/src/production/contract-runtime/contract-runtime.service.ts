import {AssistantWorkspaceService} from '../assistant-workspace/assistant-workspace.service.js';
import { SettingsOperationsService } from '../platform-operations/settings-operations.service.js';
import {AccessMailService} from '../access-lifecycle/access-mail.service.js';
import {GusBirCacheService} from '../access-lifecycle/gus-bir-cache.service.js';
import { fetchTrafficPortfolio } from "./traffic-portfolio.real-source.ts";
import { Inject } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AiBudgetGuard, createPapaProviderRuntime } from "@papadata/ai-runtime";
import { GusBirAdapter, readGusBirConfig } from "@papadata/integrations";
import {
  AssistantConversationRepository,
  BillingRepository,
  CompanyLookupAuditRepository,
  EmailVerificationRepository,
  IdentityRepository,
  IntegrationRepository,
  InvitationRepository,
  MetricSnapshotRepository,
  MobilePairingRepository,
  PasswordResetRepository,
  ProductDomainRepository,
  ProductionDatabase,
  type InvitationRow,
} from "@papadata/database";
import {
  entitlementsForMigratedPlan,
  isValidNip,
  mapBillingStatus,
  migratedCommercialPlans,
  migratedSourcePriorityPolicy,
  normalizeNip,
  resolveAccess,
  resolveBillingTaxDecision,
  resolveKsefReadinessMetadata,
  type BillingVatValidationStatus,
} from "@papadata/contracts";
import { lookupCompanyRegistry } from "./company-lookup.real-source.js";
import type {
  RequestPrincipal,
  RequestPrincipalMembership,
} from "../auth/request-principal.js";
import { IdentityService } from "../identity/identity.service.js";
import { OAuthProviderConfig } from "../identity/oauth-provider.config.js";
import { IntegrationService } from "../integrations/integration.service.js";
import { Argon2PasswordService } from "../security/argon2.service.js";
import {
  buildCommandCenterDriversData,
  buildCommandCenterCommittedActionsData,
  buildCommandCenterCustomerSegmentsData,
  buildCommandCenterFunnelData,
  buildCommandCenterKpiOverrides,
  buildCommandCenterOverviewScreenData,
  buildCommandCenterPlanPerformanceData,
  buildCommandCenterProductSalesData,
  buildCommandCenterRecommendationsData,
  buildCommandCenterTrafficSourcesData,
  buildCommandCenterWaterfallData,
  persistCommandCenterMetricSnapshots,
  type MetricSnapshotWriter,
} from "./command-center-metrics.contract-data.js";
import { CommandCenterMetricInputDataSource } from "./command-center-metric-input-data-source.js";
import type { CommandCenterDataSource } from "./command-center-metrics.real-source.js";
import {
  commandCenterRecord,
  type CommandCenterReadiness,
  type CommandCenterRuntimeRecord,
} from "./command-center-record.js";
import {
  buildCampaignDiagnostics,
  buildCampaignRecommendations,
  fetchCampaignDetail,
  fetchCampaignsAttribution,
  fetchCampaignsList,
  type CampaignsFilters,
} from "./campaigns-analytics.real-source.js";
import {
  buildOrdersSourceComparison,
  buildOrdersTimeline,
  fetchOrderDetail,
  fetchOrdersList,
  ordersReconciliationAvailability,
  type OrdersFilters,
} from "./orders-analytics.real-source.js";
import {
  fetchProductDetail,
  fetchProductsList,
  type ProductsFilters,
} from "./products-analytics.real-source.js";
import {
  buildCustomerPortfolio,
  fetchCustomerDetail,
  type CustomerSegment,
  type CustomersFilters,
} from "./customers-analytics.real-source.js";
import {
  fetchTrafficAnalytics,
  type TrafficFilters,
} from "./traffic-analytics.real-source.js";
import {
  capturePapaContext,
  generatePapaAnswer,
  listHistoryRecords,
  listObservationRecords,
  listPapaAnswerRecords,
  saveObservation,
} from "@papadata/papa-runtime";

export type ContractRuntimeRequest = {
  readonly operationId: string;
  readonly method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  readonly servicePath: string;
  readonly body: unknown;
  readonly query: unknown;
  readonly params: unknown;
  readonly correlationId: string | null;
  readonly idempotencyKey: string | null;
};

type AuthContext = {
  readonly correlationId: string | null;
  readonly ipAddress: string | null;
};

@Injectable()
export class ContractRuntimeService {
  private readonly repository: ProductDomainRepository;

  private readonly integrationRepository: IntegrationRepository;

  private readonly commandCenterDataSource: CommandCenterDataSource;

  private readonly invitations: InvitationRepository;

  private readonly identities: IdentityRepository;

  private readonly passwordResets: PasswordResetRepository;

  private readonly emailVerifications: EmailVerificationRepository;

  private readonly assistantConversations: AssistantConversationRepository;

  private readonly metricSnapshots: MetricSnapshotRepository;

  private readonly mobilePairing: MobilePairingRepository;

  private readonly billing: BillingRepository;


  private readonly aiBudgetGuard: AiBudgetGuard;

  private readonly companyLookupAudit: CompanyLookupAuditRepository;

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(IdentityService) private readonly identity: IdentityService,
    @Inject(IntegrationService) private readonly integrations: IntegrationService,
    @Inject(Argon2PasswordService) private readonly passwords: Argon2PasswordService,
    @Inject(OAuthProviderConfig) private readonly oauthConfig: OAuthProviderConfig,
    @Inject(AccessMailService) private readonly accessMail: AccessMailService,
    @Inject(AssistantWorkspaceService) private readonly assistantWorkspace: AssistantWorkspaceService,
    @Inject(GusBirCacheService) private readonly gusBirCache: GusBirCacheService,
    @Inject(SettingsOperationsService) private readonly settingsOperations: SettingsOperationsService,
  ) {
    this.repository = new ProductDomainRepository(database);
    this.integrationRepository = new IntegrationRepository(database);
    this.commandCenterDataSource = new CommandCenterMetricInputDataSource(
      this.integrationRepository,
    );
    this.invitations = new InvitationRepository(database);
    this.identities = new IdentityRepository(database);
    this.passwordResets = new PasswordResetRepository(database);
    this.emailVerifications = new EmailVerificationRepository(database);
    this.assistantConversations = new AssistantConversationRepository(database);
    this.metricSnapshots = new MetricSnapshotRepository(database);
    this.mobilePairing = new MobilePairingRepository(database);
    this.billing = new BillingRepository(database);
    this.aiBudgetGuard = new AiBudgetGuard();
    this.companyLookupAudit = new CompanyLookupAuditRepository(database);
  }

  // Lazy + try/catch, like BillingOperationsService's client() for Stripe --
  // GUS_BIR_MODE=production with a missing/invalid key must fail only the
  // company.lookup request, not crash the whole API at boot.
  private gusBirRuntime(): { readonly adapter: GusBirAdapter; readonly cacheTtlSeconds: number } {
    try {
      const config = readGusBirConfig();
      return { adapter: new GusBirAdapter(config), cacheTtlSeconds: config.cacheTtlSeconds };
    } catch {
      throw new ServiceUnavailableException(
        "GUS/BIR registry lookup configuration is invalid. Contact an administrator.",
      );
    }
  }

  async executePublic(
    request: ContractRuntimeRequest,
    context: AuthContext,
  ): Promise<object> {
    const payload = readPayload(request.body);

    if (request.operationId === "auth.login") {
      const email = requiredPayloadString(payload, "email");
      const password = requiredPayloadString(payload, "password");
      return {
        data: await this.identity.login(
          { email, password },
          context,
        ),
        operationId: request.operationId,
      };
    }

    if (request.operationId === "auth.register.email") {
      const email = requiredPayloadString(payload, "email");
      const password = optionalPayloadString(payload, "password");
      const displayName = optionalPayloadString(payload, "displayName");
      const organizationName = optionalPayloadString(payload, "organizationName");
      const workspaceName = optionalPayloadString(payload, "workspaceName");

      if (!password || !displayName || !organizationName || !workspaceName) {
        return {
          data: {
            accepted: true,
            email,
            requiredFields: [
              "password",
              "displayName",
              "organizationName",
              "workspaceName",
            ],
            status: "registration_details_required",
          },
          operationId: request.operationId,
        };
      }

      return {
        data: await this.identity.register({
          email,
          password,
          displayName,
          organizationName,
          workspaceName,
        }),
        operationId: request.operationId,
      };
    }

    if (request.operationId === "auth.status.read") {
      return {
        data: {
          authentication: "available",
          emailPassword: true,
          oauth: {
            google: this.oauthConfig.statusFor("google"),
            microsoft: this.oauthConfig.statusFor("microsoft"),
          },
          passwordRecovery: this.accessMail.available() ? "email_queue_available" : "configuration_required",
          emailDelivery: this.accessMail.available(),
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "auth.password.recovery.request") {
      return {data:await this.accessMail.enqueue('recover',requiredPayloadString(payload,'email')),operationId:request.operationId};
    }

    if (request.operationId === "auth.password.recovery.token.validate") {
      const token = requiredPayloadString(payload, "token");
      const lookup = await this.passwordResets.findValidToken(token);
      return {
        data: {
          email: lookup?.normalizedEmail ?? null,
          valid: lookup !== null,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "auth.password.reset") {
      const resetToken = requiredPayloadString(payload, "resetToken");
      const newPassword = requiredPayloadString(payload, "newPassword");
      const lookup = await this.passwordResets.findValidToken(resetToken);
      if (!lookup) {
        return {
          data: { accepted: false, status: "invalid_or_expired_token" },
          operationId: request.operationId,
        };
      }

      const newPasswordHash = await this.passwords.hash(newPassword);
      const reset = await this.passwordResets.consumeAndResetPassword({
        lookup,
        newPasswordHash,
        token: resetToken,
      });
      if (!reset) {
        return {
          data: { accepted: false, status: "invalid_or_expired_token" },
          operationId: request.operationId,
        };
      }

      return {
        // userId lets the BFF revoke every existing session for this
        // account after a password reset (see ContractPublicController) --
        // safe to return here since the caller has already proven
        // possession of the (single-use, now-consumed) reset token.
        data: { accepted: true, email: lookup.normalizedEmail, userId: lookup.userId },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "auth.email.resend") {
      return {data:await this.accessMail.enqueue('verify',requiredPayloadString(payload,'email')),operationId:request.operationId};
    }

    if (request.operationId.startsWith("auth.oauth.")) {
      throw new ForbiddenException(
        "OAuth identity linking is disabled until an approved identity provider is configured.",
      );
    }

    if (request.operationId === "auth.email.verify") {
      const token = requiredPayloadString(payload, "token");
      const lookup = await this.emailVerifications.findValidToken(token);
      if (!lookup) {
        return {
          data: { status: "invalid_or_expired_token", verified: false },
          operationId: request.operationId,
        };
      }

      const verified = await this.emailVerifications.consumeAndVerifyEmail({ lookup, token });
      if (!verified) {
        return {
          data: { status: "invalid_or_expired_token", verified: false },
          operationId: request.operationId,
        };
      }

      return {
        data: { email: lookup.normalizedEmail, status: "verified", verified: true },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "auth.registration.finalize") {
      // Public lookup must not enumerate identity IDs or verification state.
      return {data:{finalized:false,status:'authentication_required'},operationId:request.operationId};
    }

    if (request.operationId === "invitation.validate") {
      const invitationId = requiredPayloadString(payload, "invitationId");
      const token = requiredPayloadString(payload, "token");
      const invitation = await this.invitations.findInvitationByToken(invitationId, token);
      if (!isInvitationOpen(invitation)) {
        return {
          data: { accepted: false, status: "signed_invitation_token_required" },
          operationId: request.operationId,
        };
      }
      const existingIdentity = await this.identities.findByEmail(invitation.email);
      return {
        data: {
          accepted: false,
          email: invitation.email,
          // Lets the frontend render "sign in to join" instead of a
          // create-account form when this email already has a PapaData
          // identity elsewhere (e.g. joining a second tenant).
          existingIdentity: existingIdentity !== null,
          role: invitation.role,
          status: "valid",
          tenantName: invitation.tenantName,
          workspaceName: invitation.workspaceName,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "invitation.accept") {
      const invitationId = requiredPayloadString(payload, "invitationId");
      const token = requiredPayloadString(payload, "token");
      const password = requiredPayloadString(payload, "password");

      const invitation = await this.invitations.findInvitationByToken(invitationId, token);
      if (!isInvitationOpen(invitation)) {
        return {
          data: { accepted: false, status: "signed_invitation_token_required" },
          operationId: request.operationId,
        };
      }

      const existingIdentity = await this.identities.findByEmail(invitation.email);

      if (existingIdentity) {
        const validPassword = await this.passwords.verify(existingIdentity.passwordHash, password);
        if (!validPassword) {
          // Deliberately does not touch the invitation token or call any
          // accept method — a failed sign-in attempt must never burn a
          // valid invitation.
          return {
            data: { accepted: false, status: "invalid_credentials" },
            operationId: request.operationId,
          };
        }

        const joined = await this.invitations.acceptInvitationForExistingIdentity({
          identityKey: existingIdentity.identityKey,
          invitation,
          token,
          userId: existingIdentity.userId,
        }).catch((error: unknown) => {
          if (error instanceof Error && error.message === "ALREADY_MEMBER") {
            throw new ConflictException("Already a member of this workspace.");
          }
          throw error;
        });

        if (!joined) {
          return {
            data: { accepted: false, status: "signed_invitation_token_required" },
            operationId: request.operationId,
          };
        }

        return {
          data: {
            accepted: true,
            displayName: existingIdentity.displayName,
            email: existingIdentity.normalizedEmail,
            memberships: [joined.membership],
            outcome: "existing_identity_linked",
            userId: existingIdentity.userId,
          },
          operationId: request.operationId,
        };
      }

      const displayName = requiredPayloadString(payload, "displayName");
      const passwordHash = await this.passwords.hash(password);
      const joined = await this.invitations.acceptInvitation({
        invitation,
        token,
        passwordHash,
        displayName,
      }).catch((error: unknown) => {
        if (error instanceof Error && error.message === "IDENTITY_EMAIL_EXISTS") {
          throw new ConflictException("Account already exists.");
        }
        throw error;
      });

      if (!joined) {
        return {
          data: { accepted: false, status: "signed_invitation_token_required" },
          operationId: request.operationId,
        };
      }

      return {
        data: {
          accepted: true,
          displayName: joined.user.displayName,
          email: joined.user.normalizedEmail,
          memberships: [joined.membership],
          outcome: "new_identity",
          userId: joined.user.userId,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "company.lookup") {
      const query = safeObject(request.query);
      const rawNip = optionalRecordString(query, "nip");
      if (!rawNip) {
        throw new BadRequestException("Query parameter 'nip' is required.");
      }
      if (!isValidNip(rawNip)) {
        throw new BadRequestException("NIP checksum is invalid.");
      }
      const { adapter, cacheTtlSeconds } = this.gusBirRuntime();
      const outcome = await lookupCompanyRegistry({
        nip: normalizeNip(rawNip),
        cache: this.gusBirCache,
        adapter,
        auditRepository: this.companyLookupAudit,
        cacheTtlSeconds,
        correlationId: request.correlationId,
      });
      if (!outcome.ok) {
        // Spec step 5: timeout/limit/no-record/failure all lead the caller
        // (AccessRouter.tsx) back to the existing manual-entry fallback --
        // the exception type just picks the right HTTP status for each.
        if (outcome.code === "not_found") throw new NotFoundException(outcome.message);
        if (outcome.code === "timeout") throw new RequestTimeoutException(outcome.message);
        if (outcome.code === "rate_limited") throw new HttpException(outcome.message, HttpStatus.TOO_MANY_REQUESTS);
        throw new ServiceUnavailableException(outcome.message);
      }
      return {
        data: {
          // The raw adapter payload is never sent to the browser -- it's
          // already durably captured server-side by lookupCompanyRegistry's
          // audit write (app.company_lookup_audit), independent of what the
          // UI receives or how the user later edits the prefilled form.
          normalized: outcome.normalized,
          source: outcome.source,
          retrievedAt: outcome.retrievedAt,
          servedFromCache: outcome.servedFromCache,
        },
        operationId: request.operationId,
      };
    }

    throw new BadRequestException(
      `Public contract operation is not executable: ${request.operationId}`,
    );
  }

  async executeAuthenticated(
    principal: RequestPrincipal,
    request: ContractRuntimeRequest,
  ): Promise<object> {
    const migratedSemanticResult = await this.executeMigratedSemantics(principal, request);
    if (migratedSemanticResult !== null) return migratedSemanticResult;

    if (request.operationId === "auth.session.read") {
      return {
        data: {
          activeTenantId: principal.tenantId,
          activeWorkspaceId: principal.workspaceId,
          authLevel: principal.authLevel,
          capabilities: principal.capabilities,
          memberships: principal.memberships,
          sessionId: principal.sessionId,
          userId: principal.userId,
        },
        operationId: request.operationId,
      };
    }

    // These operationIds are generated, routed contract endpoints with no
    // dedicated handler here — without an explicit rejection they fall
    // through to the generic ProductDomainRepository upsert at the bottom of
    // this method, which would echo back a fake "success" that performs no
    // real work. Each has a real, authoritative implementation elsewhere;
    // callers must use that instead.
    if (request.operationId === "auth.account.link") {
      throw new ForbiddenException(
        "OAuth identity linking is disabled until an approved identity provider is configured.",
      );
    }

    if (
      request.operationId === "auth.mfa.enroll"
      || request.operationId === "auth.mfa.confirm"
      || request.operationId === "auth.mfa.verify"
    ) {
      throw new ForbiddenException(
        `${request.operationId} is not the authoritative MFA path — use /v1/security/mfa/*.`,
      );
    }

    if (request.operationId === "auth.reauthenticate") {
      throw new ForbiddenException(
        "auth.reauthenticate is not the authoritative step-up path — use /v1/security/step-up.",
      );
    }

    if (request.operationId === "auth.logout") {
      throw new ForbiddenException(
        "auth.logout is not executable here — session revocation is handled locally by the BFF.",
      );
    }

    if (request.operationId === "auth.consents.accept") {
      throw new ForbiddenException(
        "Not implemented — no consent-tracking store exists yet for auth.consents.accept.",
      );
    }

    if (
      request.operationId.startsWith("access.")
      || request.operationId === "workspace.resolve"
    ) {
      return {
        data: accessView(principal, request.operationId),
        operationId: request.operationId,
      };
    }

    if (request.operationId === "integrations.catalog.read") {
      return {
        data: await this.integrations.listProviders(
          principal.tenantId,
          principal.workspaceId,
        ),
        operationId: request.operationId,
      };
    }

    if (
      request.operationId === "integrations.read"
      || request.operationId === "integrations.sync-history.read"
      || request.operationId === "integrations.sync-run.read"
    ) {
      const [connections, jobs] = await Promise.all([
        this.integrations.listConnections(principal.tenantId, principal.workspaceId),
        this.integrations.listJobs(principal.tenantId, principal.workspaceId),
      ]);
      return {
        data: { connections, jobs },
        operationId: request.operationId,
      };
    }

    if (request.operationId.startsWith("command-center.")) {
      return {
        data: await commandCenterContractData(
          request.operationId,
          await this.repository.dashboardSummary(
            principal.tenantId,
            principal.workspaceId,
          ),
          readRuntimeDateRange(request.query),
          principal.tenantId,
          principal.workspaceId,
          this.commandCenterDataSource,
          this.metricSnapshots,
        ),
        operationId: request.operationId,
      };
    }

    if (request.operationId === "orders.detail.read") {
      const query = safeObject(request.query);
      const orderId = optionalRecordString(query, "orderId");
      if (!orderId) {
        throw new BadRequestException("Query parameter 'orderId' is required.");
      }
      const generatedAt = new Date().toISOString();
      const record = await fetchOrderDetail({
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        generatedAt,
        orderId,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      if (!record) {
        throw new NotFoundException(`Order not found: ${orderId}`);
      }
      return {
        data: {
          detailResult: {
            completedAt: generatedAt,
            domain: "orders",
            operationId: request.operationId,
          },
          record,
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("orders.")
      && request.operationId !== "orders.write"
    ) {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const result = await fetchOrdersList({
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        filters: readOrdersFilters(query),
        generatedAt,
        page: readPageRequest(query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      const operationExtras = request.operationId === "orders.os-zdarzen.read"
        ? { timeline: buildOrdersTimeline(result.records) }
        : request.operationId === "orders.porownanie-zrodel.read"
          ? { sourceComparison: buildOrdersSourceComparison(result.records) }
          : request.operationId === "orders.rekoncyliacja-skrot.read"
            ? { reconciliation: ordersReconciliationAvailability() }
            : {};
      return {
        data: {
          ...operationExtras,
          pageInfo: result.pageInfo,
          records: result.records,
          [ordersResultKey(request.operationId)]: {
            completedAt: generatedAt,
            domain: "orders",
            operationId: request.operationId,
          },
          summary: result.summary,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "products.detail.read") {
      const query = safeObject(request.query);
      const productId = optionalRecordString(query, "productId");
      if (!productId) {
        throw new BadRequestException("Query parameter 'productId' is required.");
      }
      const generatedAt = new Date().toISOString();
      const record = await fetchProductDetail({
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        generatedAt,
        productId,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      if (!record) {
        throw new NotFoundException(`Product not found: ${productId}`);
      }
      return {
        data: {
          detailResult: {
            completedAt: generatedAt,
            domain: "products",
            operationId: request.operationId,
          },
          record,
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("products.")
      && request.operationId !== "products.write"
      && request.operationId !== "products.mapping.update"
    ) {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const result = await fetchProductsList({
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        filters: readProductsFilters(query),
        generatedAt,
        page: readPageRequest(query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      return {
        data: {
          pageInfo: result.pageInfo,
          records: result.records,
          [productsResultKey(request.operationId)]: {
            completedAt: generatedAt,
            domain: "products",
            operationId: request.operationId,
          },
          summary: result.summary,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "campaigns.detail.read") {
      const query = safeObject(request.query);
      const campaignId = optionalRecordString(query, "campaignId");
      if (!campaignId) {
        throw new BadRequestException("Query parameter 'campaignId' is required.");
      }
      const generatedAt = new Date().toISOString();
      const record = await fetchCampaignDetail({
        campaignId,
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        generatedAt,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      if (!record) {
        throw new NotFoundException(`Campaign not found: ${campaignId}`);
      }
      return {
        data: {
          detailResult: {
            completedAt: generatedAt,
            domain: "campaigns",
            operationId: request.operationId,
          },
          record,
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("campaigns.")
      && request.operationId !== "campaigns.write"
      && request.operationId !== "campaigns.budget.change.propose"
    ) {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const filters = readCampaignsFilters(query);
      const page = readPageRequest(query);
      const dataSource = this.integrationRepository;
      const dateRange = readRuntimeDateRange(request.query);
      const shared = {
        dataSource,
        dateRange,
        filters,
        generatedAt,
        page,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      };

      // campaigns.attribution-sales.read is the only operationId whose base
      // shape differs (it needs the real per-channel attribution rows, not
      // just records/pageInfo/summary) -- everything else shares one fetch.
      if (request.operationId === "campaigns.attribution-sales.read") {
        const result = await fetchCampaignsAttribution(shared);
        return {
          data: {
            attribution: result.attribution,
            pageInfo: result.pageInfo,
            records: result.records,
            [campaignsResultKey(request.operationId)]: {
              completedAt: generatedAt,
              domain: "campaigns",
              operationId: request.operationId,
            },
            summary: result.summary,
          },
          operationId: request.operationId,
        };
      }

      const result = await fetchCampaignsList(shared);
      const extra: Record<string, unknown> = {};
      if (request.operationId === "campaigns.diagnostics.read") {
        extra.diagnostics = buildCampaignDiagnostics(result.records);
      }
      if (
        request.operationId === "campaigns.budget.recommendation.read"
        || request.operationId === "campaigns.recommendations.read"
      ) {
        // Deterministic decision-support rules backed by provider metrics.
        // They explicitly do not claim to be AI or an executable budget plan.
        extra.recommendations = buildCampaignRecommendations(result.records);
      }

      return {
        data: {
          pageInfo: result.pageInfo,
          records: result.records,
          [campaignsResultKey(request.operationId)]: {
            completedAt: generatedAt,
            domain: "campaigns",
            operationId: request.operationId,
          },
          summary: result.summary,
          ...extra,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "customers.pseudonymized-detail.read") {
      const query = safeObject(request.query);
      const customerPseudonym = optionalRecordString(query, "customerPseudonym");
      if (!customerPseudonym) {
        throw new BadRequestException("Query parameter 'customerPseudonym' is required.");
      }
      const generatedAt = new Date().toISOString();
      const record = await fetchCustomerDetail({
        customerPseudonym,
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        generatedAt,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      if (!record) {
        throw new NotFoundException(`Customer not found: ${customerPseudonym}`);
      }
      return {
        data: {
          pseudonymizedDetailResult: {
            completedAt: generatedAt,
            domain: "customers",
            operationId: request.operationId,
          },
          record,
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("customers.")
      && request.operationId !== "customers.write"
    ) {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const portfolio = await buildCustomerPortfolio({
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        filters: readCustomersFilters(query),
        generatedAt,
        page: readPageRequest(query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      // Every customers.*.read list-shaped operationId reads the same
      // portfolio, which already computes segments/pareto/trend/cac/
      // affinity/priorityAlert/cohorts alongside the per-customer records
      // (see customers-analytics.real-source.ts) -- the real /app/customers
      // screen only ever calls customers.overview.read, so these must not
      // be gated to a single, narrower operationId.
      const extra: Record<string, unknown> = {
        scope: portfolio.scope,
        affinity: portfolio.affinity,
        cac: portfolio.cac,
        cohorts: portfolio.cohorts,
        currencyCoverage: portfolio.currencyCoverage,
        pareto: portfolio.pareto,
        portfolioTotals: portfolio.portfolioTotals,
        priorityAlert: portfolio.priorityAlert,
        segments: portfolio.segments,
        trend: portfolio.trend,
      };

      return {
        data: {
          pageInfo: portfolio.pageInfo,
          records: portfolio.records,
          [customersResultKey(request.operationId)]: {
            completedAt: generatedAt,
            domain: "customers",
            operationId: request.operationId,
          },
          summary: portfolio.summary,
          ...extra,
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("traffic.")
      && request.operationId !== "traffic.write"
    ) {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const stepId = request.operationId === "traffic.funnel-step.read"
        ? optionalRecordString(query, "stepId")
        : null;
      if (request.operationId === "traffic.funnel-step.read" && !stepId) {
        throw new BadRequestException("Query parameter 'stepId' is required.");
      }

      const result = await fetchTrafficAnalytics({
        dataSource: this.integrationRepository,
        dateRange: readRuntimeDateRange(request.query),
        filters: readTrafficFilters(query),
        generatedAt,
        operationId: request.operationId,
        page: readPageRequest(query),
        stepId,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      const extra: Record<string, unknown> = {};
      if (request.operationId === "traffic.overview.read") {
        extra.portfolio = await fetchTrafficPortfolio({ dataSource: this.integrationRepository,
          dateRange: readRuntimeDateRange(request.query), generatedAt, tenantId: principal.tenantId, workspaceId: principal.workspaceId,
          filters: { sourceId: optionalRecordString(query, "sourceId"), channel: optionalRecordString(query, "channel"), device: optionalRecordString(query, "device"), country: optionalRecordString(query, "country"), compare: query.compare === "previous" } });
      }
      if (request.operationId === "traffic.event-quality.read") {
        extra.diagnostics = result.diagnostics;
      }
      if (
        request.operationId === "traffic.funnel-definitions.read"
        || request.operationId === "traffic.funnel.read"
        || request.operationId === "traffic.funnel-step.read"
      ) {
        extra.steps = result.steps;
      }

      return {
        data: {
          pageInfo: result.pageInfo,
          records: result.records,
          [trafficResultKey(request.operationId)]: {
            completedAt: generatedAt,
            domain: "traffic",
            operationId: request.operationId,
          },
          summary: result.summary,
          ...extra,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "settings.audit.read") {
      const query = safeObject(request.query);
      const before = optionalRecordString(query, "before") ?? undefined;
      return {
        data: await this.settingsOperations.audit(principal, before),
        implementation: "settings-operations-service",
        operationId: request.operationId,
      };
    }

    if (request.operationId === "settings.memberships.read") {
      return {
        data: {
          items: await this.invitations.listMembersAndInvitations(
            principal.tenantId,
            principal.workspaceId,
          ),
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "invitation.request") {
      const payload = readPayload(request.body);
      const email = requiredPayloadString(payload, "email");
      const role = requiredPayloadString(payload, "role");
      if (!isInvitableRole(role)) {
        throw new BadRequestException(`Role is not invitable: ${role}`);
      }
      const invite = await this.invitations.createInvitation({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
        email,
        role,
        invitedByUserId: principal.userId,
        ttlHours: 24 * 7,
      });
      return {
        data: {
          email,
          expiresAt: invite.expiresAt,
          invitationId: invite.invitationId,
          role,
          token: invite.token,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "invitation.reject") {
      const payload = readPayload(request.body);
      const invitationId = requiredPayloadString(payload, "invitationId");
      await this.invitations.markRevoked(principal.tenantId, principal.workspaceId, invitationId);
      return {
        data: { invitationId, status: "revoked" },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.context.capture") {
      const payload = readPayload(request.body);
      const result = await capturePapaContext({
        captureReason: optionalPayloadString(payload, "captureReason") ?? "context-capture",
        conversationId: optionalPayloadString(payload, "conversationId"),
        idempotencyKey: requireIdempotencyKey(request),
        parentConversationId: optionalPayloadString(payload, "parentConversationId"),
        repository: this.assistantConversations,
        snapshot: readPayloadObject(payload, "snapshot"),
        tenantId: principal.tenantId,
        title: optionalPayloadString(payload, "title") ?? "Papa Asystent",
        userId: principal.userId,
        workspaceId: principal.workspaceId,
      });
      if (!result) {
        throw new NotFoundException(
          `Conversation not found: ${optionalPayloadString(payload, "conversationId")}`,
        );
      }
      return {
        data: {
          contextCaptureResult: {
            completedAt: new Date().toISOString(),
            conversationId: result.conversationId,
            domain: "papa",
            operationId: request.operationId,
            snapshotId: result.snapshotId,
          },
          outcomeId: result.snapshotId,
          status: "applied",
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.answer.generate") {
      const payload = readPayload(request.body);
      const prompt = requiredPayloadString(payload, "prompt");
      const policy = await this.assistantWorkspace.preferences(principal);
      if(!['context','evidence','metrics'].every(tool=>policy.allowedReadTools.includes(tool)))throw new ForbiddenException('Assistant generation is disabled by workspace policy.');
      let providerRuntime: ReturnType<typeof createPapaProviderRuntime>;
      try {
        providerRuntime = createPapaProviderRuntime();
      } catch {
        throw new ServiceUnavailableException("Configured AI provider is unavailable.");
      }
      const result = await generatePapaAnswer({
        historyEnabled: policy.historyEnabled,
        contextDays: policy.contextDays,
        budgetGuard: this.aiBudgetGuard,
        billing: this.billing,
        caseThreadId: optionalPayloadString(payload, "caseThreadId"),
        conversationId: optionalPayloadString(payload, "conversationId"),
        idempotencyKey: requireIdempotencyKey(request),
        parentConversationId: optionalPayloadString(payload, "parentConversationId"),
        prompt,
        provider: providerRuntime.provider,
        modelId: providerRuntime.modelId,
        maxOutputTokens: providerRuntime.nativeStreaming ? 1536 : 512,
        repository: this.assistantConversations,
        tenantId: principal.tenantId,
        userId: principal.userId,
        workspaceId: principal.workspaceId,
      });
      if (!result) {
        throw new NotFoundException(
          `Conversation not found: ${optionalPayloadString(payload, "conversationId")}`,
        );
      }
      return {
        data: {
          answerGenerateResult: {
            caseThreadId: result.caseThreadId,
            completedAt: new Date().toISOString(),
            conversationId: result.conversationId,
            domain: "papa",
            messageId: result.messageId,
            operationId: request.operationId,
          },
          outcomeId: result.messageId,
          record: result.record,
          status: "applied",
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.answer.read") {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const result = await listPapaAnswerRecords({
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        repository: this.assistantConversations,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      return {
        data: {
          answerResult: {
            completedAt: generatedAt,
            domain: "papa",
            operationId: request.operationId,
          },
          pageInfo: { nextCursor: null, total: result.records.length },
          records: result.records,
          summary: result.summary,
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId === "papa.context-panel.read"
      || request.operationId === "papa.assistant-shell.read"
    ) {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const result = await listPapaAnswerRecords({
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        repository: this.assistantConversations,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      return {
        data: {
          [papaResultKey(request.operationId)]: {
            completedAt: generatedAt,
            domain: "papa",
            operationId: request.operationId,
          },
          pageInfo: { nextCursor: null, total: result.records.length },
          records: result.records,
          summary: result.summary,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.observations.read") {
      const query = safeObject(request.query);
      const generatedAt = new Date().toISOString();
      const result = await listObservationRecords({
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        repository: this.assistantConversations,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      return {
        data: {
          observationsResult: {
            completedAt: generatedAt,
            domain: "papa",
            operationId: request.operationId,
          },
          pageInfo: { nextCursor: null, total: result.records.length },
          records: result.records,
          summary: result.summary,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.observation.save") {
      const payload = readPayload(request.body);
      const content = requiredPayloadString(payload, "content");
      const result = await saveObservation({
        content,
        conversationId: optionalPayloadString(payload, "conversationId"),
        idempotencyKey: requireIdempotencyKey(request),
        repository: this.assistantConversations,
        tenantId: principal.tenantId,
        userId: principal.userId,
        workspaceId: principal.workspaceId,
      });
      if (!result) {
        throw new NotFoundException(
          `Conversation not found: ${optionalPayloadString(payload, "conversationId")}`,
        );
      }
      return {
        data: {
          observationSaveResult: {
            completedAt: new Date().toISOString(),
            conversationId: result.conversationId,
            domain: "papa",
            messageId: result.messageId,
            operationId: request.operationId,
          },
          outcomeId: result.messageId,
          record: result.record,
          status: "applied",
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.history-memory.read") {
      const generatedAt = new Date().toISOString();
      const result = await listHistoryRecords({
        limit: readLimit(request.query),
        repository: this.assistantConversations,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });
      return {
        data: {
          historyMemoryResult: {
            completedAt: generatedAt,
            domain: "papa",
            operationId: request.operationId,
          },
          pageInfo: { nextCursor: null, total: result.records.length },
          records: result.records,
          summary: result.summary,
          timeline: result.timeline,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.context-basket.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantContextBasket({
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          contextBasketResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.evidence.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantEvidence({
        caseThreadId: optionalRecordString(query, "caseThreadId"),
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          evidenceResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.lab.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantLab({
        caseThreadId: optionalRecordString(query, "caseThreadId"),
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          labResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.proposals.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantProposals({
        caseThreadId: optionalRecordString(query, "caseThreadId"),
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          proposalsResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.governance.read") {
      const result = await this.assistantConversations.readAssistantGovernance({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          governanceResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.actions.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantActions({
        caseThreadId: optionalRecordString(query, "caseThreadId"),
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          actionsResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.action-approval.read") {
      const result = await this.assistantConversations.readAssistantActionApprovals({
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          actionApprovalResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.report-definition.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantReportDefinitions({
        caseId: optionalRecordString(query, "caseId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          reportDefinitionResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.report-definition.upsert") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.upsertAssistantReportDefinition({
        caseId: optionalPayloadString(payload, "caseId"),
        chartTypes: optionalPayloadArray(payload, "chartTypes"),
        comments: optionalPayloadArray(payload, "comments"),
        createdByUserId: principal.userId,
        dataTables: optionalPayloadArray(payload, "dataTables"),
        dateRange: optionalPapaPayloadObject(payload, "dateRange") ?? {},
        description: optionalPayloadString(payload, "description"),
        filters: optionalPapaPayloadObject(payload, "filters") ?? {},
        idempotencyKey: requireIdempotencyKey(request),
        layout: optionalPayloadArray(payload, "layout"),
        metricSelection: optionalPayloadArray(payload, "metricSelection"),
        metricSnapshotRef: optionalPapaPayloadObject(payload, "metricSnapshotRef"),
        name: requiredPayloadString(payload, "name"),
        ordering: optionalPayloadArray(payload, "ordering"),
        ownerUserId: principal.userId,
        schedule: optionalPapaPayloadObject(payload, "schedule"),
        segmentations: optionalPayloadArray(payload, "segmentations"),
        status: readReportDefinitionStatus(optionalPayloadString(payload, "status")),
        tenantId: principal.tenantId,
        visibility: readReportDefinitionVisibility(optionalPayloadString(payload, "visibility")),
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          reportDefinitionUpsertResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          record: result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.report-definition.duplicate") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.duplicateAssistantReportDefinition({
        createdByUserId: principal.userId,
        idempotencyKey: requireIdempotencyKey(request),
        reportDefinitionId: requiredPayloadString(payload, "reportDefinitionId"),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          record: result,
          reportDefinitionDuplicateResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.report-export.create") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.createAssistantReportExport({
        createdByUserId: principal.userId,
        exportScope: readReportExportScope(optionalPayloadString(payload, "exportScope")),
        format: readReportExportFormat(requiredPayloadString(payload, "format")),
        idempotencyKey: requireIdempotencyKey(request),
        reportDefinitionId: optionalPayloadString(payload, "reportDefinitionId"),
        reportVersionId: optionalPayloadString(payload, "reportVersionId"),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          record: result,
          reportExportResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.report-schedule.upsert") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.upsertAssistantReportSchedule({
        cadence: requiredPayloadString(payload, "cadence"),
        createdByUserId: principal.userId,
        exportFormats: optionalPayloadArray(payload, "exportFormats"),
        idempotencyKey: requireIdempotencyKey(request),
        nextRunAt: null,
        recipients: optionalPayloadArray(payload, "recipients"),
        reportDefinitionId: requiredPayloadString(payload, "reportDefinitionId"),
        status: "active",
        tenantId: principal.tenantId,
        timezone: "Europe/Warsaw",
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          record: result,
          reportScheduleResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.ai.action.validate") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.validateAssistantAction({
        actionProposalId: optionalPayloadString(payload, "actionProposalId"),
        idempotencyKey: requireIdempotencyKey(request),
        operationId: request.operationId,
        tenantId: principal.tenantId,
        userId: principal.userId,
        validationResult: optionalPapaPayloadObject(payload, "validationResult") ?? {
          readOnlyMvp: true,
          validatedAt: new Date().toISOString(),
        },
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          actionValidationResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.ai.action.approve") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.approveAssistantAction({
        actionProposalId: optionalPayloadString(payload, "actionProposalId"),
        exactConsent: requiredPayloadString(payload, "exactConsent"),
        idempotencyKey: requireIdempotencyKey(request),
        operationId: request.operationId,
        tenantId: principal.tenantId,
        userId: principal.userId,
        validationResult: optionalPapaPayloadObject(payload, "validationResult") ?? {
          approvedAt: new Date().toISOString(),
          readOnlyMvp: true,
        },
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          actionApprovalResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.ai.action.reject") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.rejectAssistantAction({
        actionProposalId: optionalPayloadString(payload, "actionProposalId"),
        idempotencyKey: requireIdempotencyKey(request),
        operationId: request.operationId,
        rejectionReason: requiredPayloadString(payload, "rejectionReason"),
        tenantId: principal.tenantId,
        userId: principal.userId,
        validationResult: optionalPapaPayloadObject(payload, "validationResult") ?? {
          readOnlyMvp: true,
          rejectedAt: new Date().toISOString(),
        },
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          actionRejectionResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }


    if (request.operationId === "mobile.invite") {
      const rawToken = randomBytes(32).toString("base64url");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
      const pairing = await this.mobilePairing.createPairingToken({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
        userId: principal.userId,
        tokenHash,
        expiresAt,
      });
      return {
        data: {
          outcomeId: pairing.pairingId,
          status: "pending_pairing",
          changedResourceIds: [pairing.pairingId],
          inviteResult: JSON.stringify({ token: rawToken, expiresAt: pairing.expiresAt }),
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "mobile.device.manage") {
      const payload = readPayload(request.body);
      const action = requiredPayloadString(payload, "action");
      const deviceExternalId = requiredPayloadString(payload, "deviceExternalId");

      if (action === "revoke") {
        const revoked = await this.mobilePairing.revokeDevice({
          tenantId: principal.tenantId,
          workspaceId: principal.workspaceId,
          deviceExternalId,
        });
        if (!revoked) throw new NotFoundException("Mobile device was not found in this workspace.");
        return {
          data: {
            outcomeId: deviceExternalId,
            status: "revoked",
            changedResourceIds: [deviceExternalId],
            deviceManageResult: "revoked",
          },
          operationId: request.operationId,
        };
      }

      if (action !== "pair") {
        throw new BadRequestException("mobile.device.manage action must be pair or revoke.");
      }

      const rawToken = requiredPayloadString(payload, "pairingToken");
      const platformRaw = optionalPayloadString(payload, "platform") ?? "other";
      const platform = platformRaw === "ios" || platformRaw === "android" ? platformRaw : "other";
      const paired = await this.mobilePairing.pairDevice({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
        userId: principal.userId,
        // rawToken is a 256-bit value from randomBytes(32) in the pairing-issue branch above, not a
        // user-chosen password -- it cannot be brute-forced regardless of hash speed. SHA-256 lookup
        // hashing matches this codebase's convention for every other high-entropy token
        // (invitation-token.service.ts, step-up.service.ts, product-domain.ts).
        tokenHash: createHash("sha256").update(rawToken).digest("hex"), // codeql[js/insufficient-password-hash]
        deviceExternalId,
        displayName: optionalPayloadString(payload, "displayName") ?? "PapaData mobile",
        platform,
      });
      if (!paired) throw new ConflictException("Pairing token is invalid, expired or already used.");
      return {
        data: {
          outcomeId: paired.deviceExternalId,
          status: "paired",
          changedResourceIds: [paired.deviceExternalId],
          deviceManageResult: JSON.stringify(paired),
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "mobile.use") {
      const devices = await this.mobilePairing.listDevices({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
        userId: principal.userId,
      });
      return {
        data: {
          records: devices,
          pageInfo: { nextCursor: null, total: devices.length },
          summary: { active: devices.filter((device) => device.revokedAt === null).length, total: devices.length },
          useResult: "mobile_device_inventory",
        },
        operationId: request.operationId,
      };
    }

    if (isExternalAiEffect(request.operationId)) {
      throw new ForbiddenException(
        "External AI side effects remain disabled until live provider approval and revalidation evidence are available.",
      );
    }

    if (request.operationId === "papa.privacy-redaction.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantPrivacyRedactionEvents({
        conversationId: optionalRecordString(query, "conversationId"),
        includeBlocked: optionalRecordString(query, "includeBlocked") === "true",
        limit: readLimit(request.query),
        operationId: optionalRecordString(query, "operationId"),
        stage: optionalRecordString(query, "stage"),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          privacyRedactionResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }


    if (request.operationId === "papa.answer-contract.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantAiAnswerContracts({
        answerMessageId: optionalRecordString(query, "answerMessageId"),
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          answerContractResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.provider-governance.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantProviderGovernanceEvents({
        answerMessageId: optionalRecordString(query, "answerMessageId"),
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        operationId: optionalRecordString(query, "operationId"),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          providerGovernanceResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }


    if (request.operationId === "papa.metric-provenance.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantMetricProvenance({
        conversationId: optionalRecordString(query, "conversationId"),
        limit: readLimit(request.query),
        snapshotId: optionalRecordString(query, "snapshotId"),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          metricProvenanceResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }


    if (request.operationId === "papa.ai.notifications.read") {
      const query = safeObject(request.query);
      const result = await this.assistantConversations.readAssistantAiNotifications({
        caseId: optionalRecordString(query, "caseId"),
        caseThreadId: optionalRecordString(query, "caseThreadId"),
        includeRead: optionalRecordString(query, "includeRead") === "true",
        includeSnoozed: optionalRecordString(query, "includeSnoozed") === "true",
        limit: readLimit(request.query),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          aiNotificationsResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          ...result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.ai.notification.mark-read") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.markAssistantAiNotificationRead({
        notificationId: requiredPayloadString(payload, "notificationId"),
        read: optionalPayloadString(payload, "read") !== "false",
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          aiNotificationReadResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          record: result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.ai.notification.snooze") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.snoozeAssistantAiNotification({
        notificationId: requiredPayloadString(payload, "notificationId"),
        snoozedUntil: requiredPayloadString(payload, "snoozedUntil"),
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          aiNotificationSnoozeResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          record: result,
        },
        operationId: request.operationId,
      };
    }

    if (request.operationId === "papa.ai.notification.unsnooze") {
      const payload = readPayload(request.body);
      const result = await this.assistantConversations.snoozeAssistantAiNotification({
        notificationId: requiredPayloadString(payload, "notificationId"),
        snoozedUntil: null,
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
      });

      return {
        data: {
          aiNotificationUnsnoozeResult: {
            completedAt: new Date().toISOString(),
            domain: "papa",
            operationId: request.operationId,
          },
          record: result,
        },
        operationId: request.operationId,
      };
    }


    if (request.operationId.startsWith("papa.")) {
      if (request.method !== "GET") {
        requireIdempotencyKey(request);
      }

      throw new BadRequestException(
        `Papa operation ${request.operationId} requires a dedicated Papa domain handler and cannot fall through to ProductDomainRepository.`,
      );
    }


    throw new HttpException(
      {
        error: "operation_not_implemented",
        message: `Operation ${request.operationId} has no dedicated production domain handler.`,
        operationId: request.operationId,
      },
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  private async executeMigratedSemantics(
    principal: RequestPrincipal,
    request: ContractRuntimeRequest,
  ): Promise<object | null> {
    const payload = readPayload(request.body);

    if (request.operationId === "access.resolve" || request.operationId === "auth.access.resolve") {
      const tenantCount = new Set(principal.memberships.map((item) => item.tenantId)).size;
      const onboardingValue = payload.onboardingCompletedAt;
      const onboardingCompletedAt = onboardingValue === null
        ? null
        : typeof onboardingValue === "string" && Number.isFinite(Date.parse(onboardingValue))
          ? new Date(onboardingValue)
          : undefined;
      const resolution = resolveAccess({
        billingStatus: mapBillingStatus(optionalRecordString(payload, "billingStatus") ?? "ACTIVE"),
        membershipsCount: principal.memberships.length,
        hasMultipleTenants: tenantCount > 1,
        activeTenantId: principal.tenantId || null,
        securityBlocked: optionalRecordBoolean(payload, "securityBlocked") ?? false,
        ...(onboardingCompletedAt === undefined ? {} : { onboardingCompletedAt }),
        entitlementsWrite: optionalRecordBoolean(payload, "entitlementsWrite") ?? true,
      });
      return {
        data: {
          ...resolution,
          activeTenantId: principal.tenantId,
          activeWorkspaceId: principal.workspaceId,
          memberships: principal.memberships,
        },
        operationId: request.operationId,
        implementation: "migrated-domain-policy",
      };
    }

    if (request.operationId.startsWith("billing.")) {
      if (request.method !== "GET") return null;
      const taxCountry = optionalRecordString(safeObject(request.query), "taxCountry");
      const vatId = optionalRecordString(safeObject(request.query), "vatId");
      // Real, server-owned subscription state -- see BillingRepository's doc
      // comment. This used to read `?plan=` straight off the query string,
      // meaning any authenticated caller could request `?plan=scale` and
      // receive Scale-tier entitlements regardless of what the workspace
      // actually pays for.
      const subscription = await this.billing.readSubscription(
        principal.tenantId,
        principal.workspaceId,
      );
      const currentPlan = migratedCommercialPlans.find((plan) => plan.id === subscription.planId)
        ?? migratedCommercialPlans[0];
      const taxDecision = resolveBillingTaxDecision({
        taxCountry,
        vatId,
        isBusinessCustomer: vatId !== null,
        vatValidationStatus: readVatValidationStatus(safeObject(request.query).vatValidationStatus),
      });
      const [stored, connections] = await Promise.all([
        this.repository.list({
          tenantId: principal.tenantId,
          workspaceId: principal.workspaceId,
          domain: "billing",
          entityType: "write",
          limit: 20,
        }),
        this.integrations.listConnections(principal.tenantId, principal.workspaceId),
      ]);
      return {
        data: {
          plans: request.operationId === "billing.plans.read" ? migratedCommercialPlans : undefined,
          currentPlan,
          entitlements: entitlementsForMigratedPlan(currentPlan.id),
          billingStatus: subscription.status.toUpperCase(),
          usage: {
            connectedDataSources: connections.length,
            maxDataSources: currentPlan.entitlements.maxDataSources,
          },
          taxDecision,
          ksef: resolveKsefReadinessMetadata({ taxCountry: taxDecision.taxCountry }),
          invoices: request.operationId === "billing.invoices.read" ? stored : undefined,
          payments: request.operationId === "billing.payments.read" ? stored : undefined,
          limitations: [
            "Stripe execution and VIES/KSeF live acceptance remain environment-gated.",
          ],
        },
        operationId: request.operationId,
        implementation: "migrated-billing-policy",
      };
    }

    if (request.operationId === "data-quality.source-priority.read") {
      return {
        data: { rules: migratedSourcePriorityPolicy },
        operationId: request.operationId,
        implementation: "migrated-source-priority-policy",
      };
    }

    if (
      request.operationId === "data-quality.readiness.read"
      || request.operationId === "data-quality.center.read"
      || request.operationId === "data-quality.reconciliation.read"
    ) {
      const summary = await this.repository.dashboardSummary(
        principal.tenantId,
        principal.workspaceId,
      );
      return {
        data: {
          ...summary,
          readiness: "partial",
          limitations: [
            "Readiness is derived from persisted canonical/reconciliation state; live provider acceptance remains separate.",
          ],
        },
        operationId: request.operationId,
        implementation: "durable-ingestion-readiness",
      };
    }

    if (request.operationId.startsWith("command-center.")) {
      const summary = await this.repository.dashboardSummary(
        principal.tenantId,
        principal.workspaceId,
      );
      return {
        data: await commandCenterContractData(
          request.operationId,
          summary,
          readRuntimeDateRange(request.query),
          principal.tenantId,
          principal.workspaceId,
          this.commandCenterDataSource,
          this.metricSnapshots,
        ),
        operationId: request.operationId,
        implementation: "canonical-dashboard-view-model",
      };
    }

    return null;
  }
}


function optionalPapaPayloadObject(
  payload: Readonly<Record<string, unknown>>,
  key: string,
): Record<string, unknown> | null {
  const value = payload[key];

  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalPayloadArray(
  payload: Readonly<Record<string, unknown>>,
  key: string,
): readonly unknown[] {
  const value = payload[key];
  return Array.isArray(value) ? value : [];
}

function readReportDefinitionStatus(
  value: string | null,
): "archived" | "draft" | "ready" {
  return value === "ready" || value === "archived" ? value : "draft";
}

function readReportDefinitionVisibility(
  value: string | null,
): "private" | "tenant" | "workspace" {
  return value === "private" || value === "tenant" ? value : "workspace";
}

function readReportExportScope(
  value: string | null,
): "report" | "section" | "table" {
  return value === "section" || value === "table" ? value : "report";
}

function readReportExportFormat(
  value: string,
): "csv" | "pdf" | "xlsx" {
  if (value === "csv" || value === "pdf" || value === "xlsx") return value;
  throw new BadRequestException("Request field \"format\" must be one of: csv, pdf, xlsx.");
}


function accessView(principal: RequestPrincipal, operationId: string): object {
  const memberships = principal.memberships;
  if (operationId === "access.tenants.list") {
    return {
      tenants: uniqueBy(
        memberships.map((item: RequestPrincipalMembership) => ({
          tenantId: item.tenantId,
        })),
        (item: { readonly tenantId: string }) => item.tenantId,
      ),
    };
  }
  if (
    operationId === "access.workspaces.list"
    || operationId === "workspace.resolve"
  ) {
    return {
      activeTenantId: principal.tenantId,
      activeWorkspaceId: principal.workspaceId,
      workspaces: memberships.map((item: RequestPrincipalMembership) => ({
        tenantId: item.tenantId,
        workspaceId: item.workspaceId,
        roles: item.roles,
        capabilities: item.capabilities,
      })),
    };
  }
  return {
    activeTenantId: principal.tenantId,
    activeWorkspaceId: principal.workspaceId,
    memberships,
    userId: principal.userId,
  };
}

type RuntimeDateRange = {
  readonly from: string;
  readonly preset: string | null;
  readonly timezone: string | null;
  readonly to: string;
};

const metricSnapshotWriteLogger = new Logger("CommandCenterMetricSnapshots");

export async function commandCenterContractData(
  operationId: string,
  repositorySummary: Readonly<Record<string, unknown>>,
  dateRange: RuntimeDateRange | null,
  tenantId: string,
  workspaceId: string,
  integrationRepository: CommandCenterDataSource,
  metricSnapshotWriter: MetricSnapshotWriter | null = null,
): Promise<object> {
  const updatedAt = optionalRecordDateString(repositorySummary, "generatedAt")
    ?? new Date().toISOString();
  const sourceReadiness = commandCenterSourceReadiness(repositorySummary.readiness);
  const integrationStreams = collectionLength(repositorySummary.integrationStreams);
  const rawDomainCounts = collectionLength(repositorySummary.domainCounts);
  const domainCounts = rawDomainCounts > 0
    ? rawDomainCounts
    : inferCommandCenterDomainCount(integrationStreams);
  const metricDateRange = dateRange
    ? { from: dateRange.from, timezone: dateRange.timezone, to: dateRange.to }
    : null;
  const sourceRecords: readonly CommandCenterRuntimeRecord[] = [
    commandCenterRecord(
      "11111111-1111-4111-8111-111111111106",
      "Strumienie integracji",
      integrationStreams,
      "number",
      null,
      3,
      sourceReadiness,
    ),
    commandCenterRecord(
      "11111111-1111-4111-8111-111111111107",
      "Domeny z danymi",
      domainCounts,
      "number",
      null,
      6,
      domainCounts > 0 ? "ready" : "partial",
    ),
  ];
  const kpi = commandCenterOperationNeedsKpiRecords(operationId)
    ? await buildCommandCenterKpiOverrides(
        tenantId,
        workspaceId,
        updatedAt,
        integrationRepository,
        metricDateRange,
      )
    : null;
  // Best-effort, fire-and-forget: a KPI request is real traffic touching
  // this tenant/workspace's real data, so it's a natural moment to refresh
  // app.metric_snapshots. Never awaited -- a snapshot write must not add
  // latency to, or fail, the KPI response it rides along with (errors are
  // swallowed to a log line only). This is the request-time half of a real
  // writer; a periodic, traffic-independent writer is still open work.
  if (kpi && metricSnapshotWriter) {
    void persistCommandCenterMetricSnapshots(
      tenantId,
      workspaceId,
      updatedAt,
      integrationRepository,
      metricSnapshotWriter,
      metricDateRange,
    ).catch((error: unknown) => {
      metricSnapshotWriteLogger.error("command-center-metric-snapshot-write-failed", error);
    });
  }
  const kpiRecords: readonly CommandCenterRuntimeRecord[] = kpi
    ? [
        kpi.revenue,
        kpi.cartConversion,
        kpi.roas,
        kpi.orders,
        kpi.aov,
        kpi.adSpend,
        kpi.cpa,
        kpi.ga4Freshness,
        kpi.grossMargin,
      ]
    : [];
  const records: readonly CommandCenterRuntimeRecord[] = [
    ...kpiRecords,
    ...sourceRecords,
  ];
  const ready = records.filter((record) => record.readiness === "ready").length;
  const warning = records.filter((record) => (
    record.readiness === "partial" || record.readiness === "stale"
  )).length;
  const critical = records.filter((record) => record.readiness === "unavailable").length;
  const resultKey = commandCenterResultKey(operationId);
  const planPerformanceExtras = operationId === "command-center.plan-performance.read"
    ? await buildCommandCenterPlanPerformanceData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  const driversExtras = operationId === "command-center.drivers.read"
    ? await buildCommandCenterDriversData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  const trafficSourcesExtras = (
    operationId === "command-center.traffic-summary.read"
    || operationId === "command-center.sales-sources.read"
  )
    ? await buildCommandCenterTrafficSourcesData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  const productSalesExtras = operationId === "command-center.products-summary.read"
    ? await buildCommandCenterProductSalesData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  const customerSegmentsExtras = operationId === "command-center.customers-summary.read"
    ? await buildCommandCenterCustomerSegmentsData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  const funnelExtras = operationId === "command-center.funnel.read"
    ? await buildCommandCenterFunnelData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  const recommendationsExtras = operationId === "command-center.ai-recommendations.read"
    ? buildCommandCenterRecommendationsData(records)
    : null;
  const committedActionsExtras = operationId === "command-center.ai-recommendations.read"
    ? buildCommandCenterCommittedActionsData(records)
    : null;
  const waterfallExtras = operationId === "command-center.waterfall.read"
    ? await buildCommandCenterWaterfallData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;
  // apps/web's CommandCenterScreen is frozen to CommandCenterScreenData
  // (days/decisions/sources/mode/currency/timezone/lastUpdated) -- this is
  // additive to the generic envelope below, not a replacement, so nothing
  // else reading command-center.overview.read's records/summary breaks.
  const overviewScreenExtras = operationId === "command-center.overview.read"
    ? await buildCommandCenterOverviewScreenData(tenantId, workspaceId, updatedAt, integrationRepository, metricDateRange)
    : null;

  return {
    ...(planPerformanceExtras ?? {}),
    ...(driversExtras ?? {}),
    ...(trafficSourcesExtras ?? {}),
    ...(productSalesExtras ?? {}),
    ...(customerSegmentsExtras ?? {}),
    ...(funnelExtras ?? {}),
    ...(recommendationsExtras ?? {}),
    ...(committedActionsExtras ?? {}),
    ...(waterfallExtras ?? {}),
    ...(overviewScreenExtras ?? {}),
    evidencePolicy: "canonical-and-reconciled-only",
    pageInfo: {
      nextCursor: null,
      total: records.length,
    },
    recommendations: recommendationsExtras?.recommendations ?? [],
    records,
    source: "canonical-dashboard-summary",
    dateRange,
    steps: funnelExtras?.steps ?? [],
    summary: {
      critical,
      ready,
      total: records.length,
      updatedAt,
      warning,
    },
    view: operationId,
    waterfall: waterfallExtras?.waterfall ?? [],
    [resultKey]: {
      completedAt: updatedAt,
      domain: "command-center",
      operationId,
    },
  };
}

function commandCenterOperationNeedsKpiRecords(operationId: string): boolean {
  return [
    "command-center.ai-recommendations.read",
    "command-center.attention.queue.read",
    "command-center.kpi.read",
    "command-center.overview.read",
    "command-center.read",
    "command-center.sales-signals.read",
  ].includes(operationId);
}

function readRuntimeDateRange(query: unknown): RuntimeDateRange | null {
  const safeQuery = safeObject(query);
  const from = optionalRecordString(safeQuery, "from");
  const to = optionalRecordString(safeQuery, "to");

  if (!from || !to) {
    return null;
  }

  return {
    from,
    preset: optionalRecordString(safeQuery, "preset"),
    timezone: optionalRecordString(safeQuery, "timezone"),
    to,
  };
}

function commandCenterResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "command-center.ai-recommendations.read": "centerAiRecommendationsResult",
    "command-center.attention.queue.read": "centerAttentionQueueResult",
    "command-center.customers-summary.read": "centerCustomersSummaryResult",
    "command-center.drivers.read": "centerDriversResult",
    "command-center.funnel.read": "centerFunnelResult",
    "command-center.kpi.read": "centerKpiResult",
    "command-center.overview.read": "centerOverviewResult",
    "command-center.plan-performance.read": "centerPlanPerformanceResult",
    "command-center.products-summary.read": "centerProductsSummaryResult",
    "command-center.read": "centerResult",
    "command-center.sales-signals.read": "centerSalesSignalsResult",
    "command-center.sales-sources.read": "centerSalesSourcesResult",
    "command-center.traffic-summary.read": "centerTrafficSummaryResult",
    "command-center.waterfall.read": "centerWaterfallResult",
    "command-center.write": "centerResult",
  };
  return keys[operationId] ?? "centerResult";
}

// Every orders.*.read list-shaped operationId names its envelope's result
// field after its own route segment (a codegen artifact -- see the identical
// pattern in commandCenterResultKey above), except orders.list.read and
// orders.read, which both landed on the generic "resultResult".
function ordersResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "orders.eksport.read": "eksportResult",
    "orders.list.read": "resultResult",
    "orders.os-zdarzen.read": "osZdarzenResult",
    "orders.overview.read": "overviewResult",
    "orders.porownanie-zrodel.read": "porownanieZrodelResult",
    "orders.read": "resultResult",
    "orders.rekoncyliacja-skrot.read": "rekoncyliacjaSkrotResult",
  };
  return keys[operationId] ?? "resultResult";
}

function papaResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "papa.assistant-shell.read": "assistantShellResult",
    "papa.context-panel.read": "contextPanelResult",
  };
  return keys[operationId] ?? "resultResult";
}

function readOrdersFilters(query: Readonly<Record<string, unknown>>): OrdersFilters {
  return {
    search: optionalRecordString(query, "search"),
    source: optionalRecordStringList(query, "source"),
    status: optionalRecordStringList(query, "status"),
  };
}

// Every products.*.read list-shaped operationId names its envelope's result
// field after its own route segment (same codegen artifact as
// ordersResultKey/commandCenterResultKey above), except products.read, which
// lands on the generic "resultResult".
function productsResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "products.catalog.read": "catalogResult",
    "products.gaps.queue.read": "gapsQueueResult",
    "products.impact.read": "impactResult",
    "products.mapping.read": "mappingResult",
    "products.offers.read": "offersResult",
    "products.overview.read": "overviewResult",
    "products.performance.read": "performanceResult",
    "products.read": "resultResult",
  };
  return keys[operationId] ?? "resultResult";
}

function readProductsFilters(query: Readonly<Record<string, unknown>>): ProductsFilters {
  return {
    search: optionalRecordString(query, "search"),
    source: optionalRecordStringList(query, "source"),
    status: optionalRecordStringList(query, "status"),
  };
}

// Every campaigns.*.read list-shaped operationId names its envelope's result
// field after its own route segment (same codegen artifact as
// ordersResultKey/productsResultKey above), except campaigns.list.read and
// campaigns.read, which both land on the generic "resultResult".
function campaignsResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "campaigns.attribution-sales.read": "attributionSalesResult",
    "campaigns.budget.read": "budgetResult",
    "campaigns.budget.recommendation.read": "budgetRecommendationResult",
    "campaigns.diagnostics.read": "diagnosticsResult",
    "campaigns.list.read": "resultResult",
    "campaigns.overview.read": "overviewResult",
    "campaigns.read": "resultResult",
    "campaigns.recommendations.read": "recommendationsResult",
  };
  return keys[operationId] ?? "resultResult";
}

function readCampaignsFilters(query: Readonly<Record<string, unknown>>): CampaignsFilters {
  const channel = optionalRecordStringList(query, "channel");
  return {
    channel: channel as readonly ("googleAds" | "metaAds" | "tiktokAds" | "other")[] | null,
    search: optionalRecordString(query, "search"),
  };
}

// Every customers.*.read list-shaped operationId names its envelope's
// result field after its own route segment (same codegen artifact as
// ordersResultKey/productsResultKey/campaignsResultKey above), except
// customers.list.read and customers.read, which both land on the generic
// "resultResult".
function customersResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "customers.cohorts.read": "cohortsResult",
    "customers.identity-conflicts.read": "identityConflictsResult",
    "customers.impact.read": "impactResult",
    "customers.overview.read": "overviewResult",
    "customers.privacy.read": "privacyResult",
    "customers.read": "resultResult",
    "customers.segment.analyze": "segmentAnalyzeResult",
    "customers.segments.read": "segmentsResult",
  };
  return keys[operationId] ?? "resultResult";
}

function readCustomersFilters(query: Readonly<Record<string, unknown>>): CustomersFilters {
  const segment = optionalRecordStringList(query, "segment");
  const riskStatus = optionalRecordStringList(query, "riskStatus");
  const sortBy = optionalRecordString(query, "sortBy");
  const sortDirection = optionalRecordString(query, "sortDirection");
  if (sortBy && !["ltv", "revenue", "ordersCount", "recencyDays", "customerPseudonym"].includes(sortBy)) throw new BadRequestException("Unsupported customer sort column.");
  if (sortDirection && !["asc", "desc"].includes(sortDirection)) throw new BadRequestException("Unsupported sort direction.");
  return {
    sortBy: sortBy as CustomersFilters["sortBy"],
    sortDirection: sortDirection as CustomersFilters["sortDirection"],
    riskStatus: riskStatus as readonly ("at_risk" | "active" | "lapsed")[] | null,
    search: optionalRecordString(query, "search"),
    segment: segment as readonly CustomerSegment[] | null,
  };
}


function trafficResultKey(operationId: string): string {
  const keys: Readonly<Record<string, string>> = {
    "traffic.channels.read": "channelsResult",
    "traffic.drop.diagnose": "dropDiagnoseResult",
    "traffic.event-quality.read": "eventQualityResult",
    "traffic.funnel-definitions.read": "funnelDefinitionsResult",
    "traffic.funnel-step.read": "funnelStepResult",
    "traffic.funnel.read": "funnelResult",
    "traffic.ga4-orders.read": "ga4OrdersResult",
    "traffic.landing-pages.read": "landingPagesResult",
    "traffic.overview.read": "overviewResult",
    "traffic.read": "resultResult",
  };
  return keys[operationId] ?? "resultResult";
}

function readTrafficFilters(query: Readonly<Record<string, unknown>>): TrafficFilters {
  return {
    search: optionalRecordString(query, "search"),
    source: optionalRecordStringList(query, "source"),
    status: optionalRecordStringList(query, "status"),
  };
}

// Generic page-request reader shared by every domain with cursor/limit
// pagination (orders, products, ...) -- not orders-specific despite living
// alongside readOrdersFilters.
function readPageRequest(query: Readonly<Record<string, unknown>>): { cursor: string | null; limit: number | null } {
  const limitValue = query.limit;
  const parsedLimit = typeof limitValue === "number"
    ? limitValue
    : typeof limitValue === "string" && limitValue.trim().length > 0
      ? Number(limitValue)
      : null;

  return {
    cursor: optionalRecordString(query, "cursor"),
    limit: parsedLimit !== null && Number.isFinite(parsedLimit) ? parsedLimit : null,
  };
}

// Fastify's querystring parser gives an array for repeated keys
// (?status=a&status=b) or a single string, which may itself be
// comma-separated (?status=a,b) -- both are accepted.
function optionalRecordStringList(
  query: Readonly<Record<string, unknown>>,
  key: string,
): readonly string[] | null {
  const value = query[key];
  const raw = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : typeof value === "string"
      ? value.split(",")
      : [];
  const cleaned = raw.map((item) => item.trim()).filter((item) => item.length > 0);
  return cleaned.length > 0 ? cleaned : null;
}

function commandCenterSourceReadiness(value: unknown): CommandCenterReadiness {
  return value === "ready" ? "ready" : "partial";
}

function collectionLength(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return 0;
}

function inferCommandCenterDomainCount(integrationStreams: number): number {
  return Math.min(6, Math.max(0, integrationStreams));
}

function optionalRecordDateString(
  value: Readonly<Record<string, unknown>>,
  key: string,
): string | null {
  const candidate = value[key];
  return typeof candidate === "string" && Number.isFinite(Date.parse(candidate))
    ? candidate
    : null;
}

function requireIdempotencyKey(request: ContractRuntimeRequest): string {
  const value = request.idempotencyKey?.trim();
  if (!value) {
    throw new BadRequestException(
      `Idempotency-Key header is required for ${request.operationId}.`,
    );
  }
  return value;
}

function optionalRecordBoolean(
  value: Readonly<Record<string, unknown>>,
  key: string,
): boolean | null {
  return typeof value[key] === "boolean" ? value[key] : null;
}

function optionalRecordString(
  value: Readonly<Record<string, unknown>>,
  key: string,
): string | null {
  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate.trim()
    : null;
}

function readVatValidationStatus(value: unknown): BillingVatValidationStatus {
  return value === "valid"
    || value === "invalid"
    || value === "unavailable"
    || value === "not_required"
    ? value
    : "unknown";
}

function isExternalAiEffect(operationId: string): boolean {
  return operationId === "papa.ai.action.execute"
    || operationId === "papa.ai.action.rollback";
}

// "Internal Support/Operations" is deliberately excluded -- it's reserved
// for PapaData's own staff (the only role a jit_expires_at may be set for,
// per app.memberships' memberships_jit_only_for_support CHECK), not
// something a tenant admin should be able to grant to an invited teammate.
const INVITABLE_ROLES = [
  "Tenant Owner",
  "Workspace Admin",
  "Analyst",
  "Marketing Operator",
  "Viewer",
  "Billing Admin",
  "Auditor/Security",
] as const;

function isInvitableRole(role: string): boolean {
  return (INVITABLE_ROLES as readonly string[]).includes(role);
}

function isInvitationOpen(
  invitation: InvitationRow | null,
): invitation is InvitationRow {
  return invitation !== null
    && invitation.status === "pending"
    && Date.parse(invitation.expiresAt) > Date.now();
}

function readPayload(body: unknown): Readonly<Record<string, unknown>> {
  const record = safeObject(body);
  const input = record.input;
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return { ...record, ...safeObject(input) };
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return { ...record, ...safeObject(parsed) };
      } catch {
        throw new BadRequestException("Request input is not valid JSON.");
      }
    }
  }
  return record;
}

function safeObject(value: unknown): Readonly<Record<string, unknown>> {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException("Request payload must be an object.");
  }
  return value as Readonly<Record<string, unknown>>;
}

function readPayloadObject(
  payload: Readonly<Record<string, unknown>>,
  key: string,
): Record<string, unknown> {
  const value = payload[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readLimit(query: unknown): number {
  const value = safeObject(query).limit;
  if (value === undefined) return 100;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
    throw new BadRequestException("Query limit must be an integer from 1 to 500.");
  }
  return parsed;
}

function requiredPayloadString(
  payload: Readonly<Record<string, unknown>>,
  key: string,
): string {
  const value = optionalPayloadString(payload, key);
  if (!value) throw new BadRequestException(`Request field is required: ${key}`);
  return value;
}

function optionalPayloadString(
  payload: Readonly<Record<string, unknown>>,
  key: string,
): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function uniqueBy<T>(items: readonly T[], key: (item: T) => string): readonly T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
