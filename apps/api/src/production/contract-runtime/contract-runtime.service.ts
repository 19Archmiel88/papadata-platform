import { Inject } from "@nestjs/common";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import {
  IntegrationRepository,
  InvitationRepository,
  ProductDomainRepository,
  ProductionDatabase,
  type InvitationRow,
  type ProductDomainRecord,
} from "@papadata/database";
import {
  entitlementsForMigratedPlan,
  mapBillingStatus,
  migratedCommercialPlans,
  migratedSourcePriorityPolicy,
  resolveAccess,
  resolveBillingTaxDecision,
  resolveKsefReadinessMetadata,
  type BillingVatValidationStatus,
} from "@papadata/contracts";
import type {
  RequestPrincipal,
  RequestPrincipalMembership,
} from "../auth/request-principal.js";
import { IdentityService } from "../identity/identity.service.js";
import { IntegrationService } from "../integrations/integration.service.js";
import { Argon2PasswordService } from "../security/argon2.service.js";
import {
  buildCommandCenterDriversData,
  buildCommandCenterCommittedActionsData,
  buildCommandCenterCustomerSegmentsData,
  buildCommandCenterFunnelData,
  buildCommandCenterKpiOverrides,
  buildCommandCenterPlanPerformanceData,
  buildCommandCenterProductSalesData,
  buildCommandCenterRecommendationsData,
  buildCommandCenterTrafficSourcesData,
  buildCommandCenterWaterfallData,
} from "./command-center-metrics.contract-data.js";
import { CommandCenterMetricInputDataSource } from "./command-center-metric-input-data-source.js";
import type { CommandCenterDataSource } from "./command-center-metrics.real-source.js";
import {
  commandCenterRecord,
  type CommandCenterReadiness,
  type CommandCenterRuntimeRecord,
} from "./command-center-record.js";
import {
  fetchOrderDetail,
  fetchOrdersList,
  type OrdersFilters,
} from "./orders-analytics.real-source.js";
import {
  fetchProductDetail,
  fetchProductsList,
  type ProductsFilters,
} from "./products-analytics.real-source.js";

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

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(IdentityService) private readonly identity: IdentityService,
    @Inject(IntegrationService) private readonly integrations: IntegrationService,
    @Inject(Argon2PasswordService) private readonly passwords: Argon2PasswordService,
  ) {
    this.repository = new ProductDomainRepository(database);
    this.integrationRepository = new IntegrationRepository(database);
    this.commandCenterDataSource = new CommandCenterMetricInputDataSource(
      this.integrationRepository,
    );
    this.invitations = new InvitationRepository(database);
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
          oauth: "configuration_required",
          passwordRecovery: "delivery_provider_required",
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("auth.password.recovery.")
      || request.operationId === "auth.email.resend"
    ) {
      return {
        data: {
          accepted: true,
          disclosureSafe: true,
          deliveryStatus: "provider_configuration_required",
        },
        operationId: request.operationId,
      };
    }

    if (
      request.operationId.startsWith("auth.oauth.")
      || request.operationId === "auth.account.link"
    ) {
      throw new ForbiddenException(
        "OAuth identity linking is disabled until an approved identity provider is configured.",
      );
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
      return {
        data: {
          accepted: false,
          email: invitation.email,
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
      const displayName = requiredPayloadString(payload, "displayName");
      const password = requiredPayloadString(payload, "password");

      const invitation = await this.invitations.findInvitationByToken(invitationId, token);
      if (!isInvitationOpen(invitation)) {
        return {
          data: { accepted: false, status: "signed_invitation_token_required" },
          operationId: request.operationId,
        };
      }

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
          userId: joined.user.userId,
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
        data: this.integrations.listProviders(),
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
      return {
        data: {
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

    if (isExternalAiEffect(request.operationId)) {
      throw new ForbiddenException(
        "External AI side effects remain disabled until live provider approval and revalidation evidence are available.",
      );
    }

    const descriptor = operationDescriptor(request.operationId);
    if (request.method === "GET") {
      const items = await this.repository.list({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
        domain: descriptor.domain,
        entityType: descriptor.entityType,
        limit: readLimit(request.query),
      });
      return {
        data: {
          items: descriptor.domain === "customers"
            ? items.map((item: ProductDomainRecord) => ({
                ...item,
                data: redactCustomerData(item.data),
              }))
            : items,
          operationId: request.operationId,
          query: safeObject(request.query),
          source: items.length > 0 ? "persistent_or_canonical" : "empty",
        },
      };
    }

    const rawPayload = readPayload(request.body);
    assertNoPersistedSecrets(rawPayload);
    const payload = request.operationId.startsWith("billing.")
      ? enrichBillingPayload(rawPayload)
      : rawPayload;
    const externalKey = operationExternalKey(
      payload,
      request.params,
      request.idempotencyKey,
    );
    const current = await this.repository.find({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain: descriptor.domain,
      entityType: descriptor.entityType,
      externalKey,
    });
    const status = statusForOperation(request.operationId, current?.status ?? "active");
    const record = await this.repository.upsert({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      domain: descriptor.domain,
      entityType: descriptor.entityType,
      externalKey,
      status,
      data: {
        ...(current?.data ?? {}),
        ...payload,
        contractOperationId: request.operationId,
        contractServicePath: request.servicePath,
      },
      actorUserId: principal.userId,
      operationId: request.operationId,
      correlationId: request.correlationId,
      idempotencyKey: request.idempotencyKey,
    });
    return {
      data: record,
      operationId: request.operationId,
    };
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
      const planId = optionalRecordString(safeObject(request.query), "plan") ?? "starter";
      const taxCountry = optionalRecordString(safeObject(request.query), "taxCountry");
      const vatId = optionalRecordString(safeObject(request.query), "vatId");
      const currentPlan = migratedCommercialPlans.find((plan) => plan.id === planId)
        ?? migratedCommercialPlans[0];
      const taxDecision = resolveBillingTaxDecision({
        taxCountry,
        vatId,
        isBusinessCustomer: vatId !== null,
        vatValidationStatus: readVatValidationStatus(safeObject(request.query).vatValidationStatus),
      });
      const stored = await this.repository.list({
        tenantId: principal.tenantId,
        workspaceId: principal.workspaceId,
        domain: "billing",
        entityType: "write",
        limit: 20,
      });
      return {
        data: {
          plans: request.operationId === "billing.plans.read" ? migratedCommercialPlans : undefined,
          currentPlan,
          entitlements: entitlementsForMigratedPlan(currentPlan.id),
          billingStatus: stored[0]?.status ?? "TRIAL",
          usage: {
            connectedDataSources: 0,
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
        ),
        operationId: request.operationId,
        implementation: "canonical-dashboard-view-model",
      };
    }

    return null;
  }
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

export async function commandCenterContractData(
  operationId: string,
  repositorySummary: Readonly<Record<string, unknown>>,
  dateRange: RuntimeDateRange | null,
  tenantId: string,
  workspaceId: string,
  integrationRepository: CommandCenterDataSource,
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
    "command-center.variants.read",
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
    "command-center.variants.read": "centerVariantsResult",
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

function operationDescriptor(operationId: string): {
  readonly domain: string;
  readonly entityType: string;
} {
  const [rawDomain = "product", ...segments] = operationId.split(".");
  return {
    domain: rawDomain.replaceAll("-", "_"),
    entityType: (segments.length > 0 ? segments.join("_") : "record")
      .replaceAll("-", "_"),
  };
}

function operationExternalKey(
  payload: Readonly<Record<string, unknown>>,
  params: unknown,
  idempotencyKey: string | null,
): string {
  for (const candidate of [
    payload.resourceId,
    payload.externalKey,
    payload.id,
    firstStringValue(params),
    idempotencyKey,
  ]) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim().slice(0, 240);
    }
  }
  return randomUUID();
}

function statusForOperation(operationId: string, current: string): string {
  if (operationId.endsWith(".approve")) return "approved";
  if (operationId.endsWith(".reject")) return "rejected";
  if (operationId.endsWith(".rollback")) return "rolled_back";
  if (operationId.includes(".activate")) return "active";
  if (operationId.includes(".cancel")) return "cancelled";
  if (operationId.includes(".revoke")) return "revoked";
  if (operationId.includes(".confirm")) return "confirmed";
  return current;
}

function enrichBillingPayload(
  payload: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  const taxCountry = optionalRecordString(payload, "taxCountry");
  const vatId = optionalRecordString(payload, "vatId") ?? optionalRecordString(payload, "nip");
  const taxDecision = resolveBillingTaxDecision({
    taxCountry,
    vatId,
    isBusinessCustomer: optionalRecordBoolean(payload, "isBusinessCustomer") ?? vatId !== null,
    vatValidationStatus: readVatValidationStatus(payload.vatValidationStatus),
  });
  return {
    ...payload,
    taxDecision,
    ksef: resolveKsefReadinessMetadata({ taxCountry: taxDecision.taxCountry }),
  };
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

function firstStringValue(value: unknown): string | null {
  const record = safeObject(value);
  for (const item of Object.values(record)) {
    if (typeof item === "string" && item.trim().length > 0) return item;
  }
  return null;
}

function assertNoPersistedSecrets(value: unknown, path = "body"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoPersistedSecrets(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (/password|secret|access.?token|refresh.?token|authorization|cookie|cvv|card.?number/iu.test(key)) {
      throw new BadRequestException(`Sensitive field cannot be persisted by contract runtime: ${path}.${key}`);
    }
    assertNoPersistedSecrets(item, `${path}.${key}`);
  }
}

function redactCustomerData(
  value: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (/email|phone|address|first.?name|last.?name|full.?name/iu.test(key)) {
      result[key] = typeof item === "string"
        ? `sha256:${createHash("sha256").update(item).digest("hex").slice(0, 20)}`
        : "[REDACTED]";
    } else {
      result[key] = item;
    }
  }
  return result;
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
