import { Inject } from "@nestjs/common";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import {
  IntegrationRepository,
  ProductDomainRepository,
  ProductionDatabase,
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
import {
  buildCommandCenterDriversData,
  buildCommandCenterKpiOverrides,
  buildCommandCenterPlanPerformanceData,
} from "./command-center-metrics.contract-data.js";
import {
  commandCenterRecord,
  type CommandCenterReadiness,
  type CommandCenterRuntimeRecord,
} from "./command-center-record.js";

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

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(IdentityService) private readonly identity: IdentityService,
    @Inject(IntegrationService) private readonly integrations: IntegrationService,
  ) {
    this.repository = new ProductDomainRepository(database);
    this.integrationRepository = new IntegrationRepository(database);
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

    if (
      request.operationId === "invitation.validate"
      || request.operationId === "invitation.accept"
    ) {
      return {
        data: {
          accepted: false,
          status: "signed_invitation_token_required",
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
          this.integrationRepository,
        ),
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
          this.integrationRepository,
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

async function commandCenterContractData(
  operationId: string,
  repositorySummary: Readonly<Record<string, unknown>>,
  dateRange: RuntimeDateRange | null,
  tenantId: string,
  workspaceId: string,
  integrationRepository: IntegrationRepository,
): Promise<object> {
  const updatedAt = optionalRecordDateString(repositorySummary, "generatedAt")
    ?? new Date().toISOString();
  const sourceReadiness = commandCenterSourceReadiness(repositorySummary.readiness);
  const integrationStreams = collectionLength(repositorySummary.integrationStreams);
  const domainCounts = collectionLength(repositorySummary.domainCounts);
  const metricDateRange = dateRange
    ? { from: dateRange.from, timezone: dateRange.timezone, to: dateRange.to }
    : null;
  const kpi = await buildCommandCenterKpiOverrides(
    tenantId,
    workspaceId,
    updatedAt,
    integrationRepository,
    metricDateRange,
  );
  const records: readonly CommandCenterRuntimeRecord[] = [
    kpi.revenue,
    // No cart-level funnel tracking (GA4 add-to-cart/checkout events) is
    // ingested anywhere in this system today — only orders, refunds,
    // products, inventory, ad spend and attributed conversions. A cart
    // conversion rate has no real source to compute from, so this must read
    // unavailable rather than a plausible-looking literal.
    commandCenterRecord(
      "11111111-1111-4111-8111-111111111102",
      "Konwersja koszyka",
      0,
      "percent",
      null,
      null,
      "unavailable",
    ),
    kpi.roas,
    kpi.orders,
    kpi.aov,
    kpi.adSpend,
    // CPA needs the number of acquisitions attributable to paid media. The
    // current canonical streams carry ad spend and attributed revenue, but
    // not an attributed purchase count, so ad spend / all store orders would
    // be a misleading metric. Keep the slot explicit and unavailable until
    // that source exists.
    commandCenterRecord(
      "11111111-1111-4111-8111-111111111111",
      "CPA",
      0,
      "currency",
      null,
      null,
      "unavailable",
    ),
    // Same story: no GA4 (or any web-analytics) integration stream is
    // ingested today, so "freshness of GA4 events" has nothing real behind
    // it. Showing 0.98/0.91 based on the tenant's unrelated overall
    // readiness flag was fake precision, not a measurement.
    commandCenterRecord(
      "11111111-1111-4111-8111-111111111104",
      "Świeżość eventów GA4",
      0,
      "percent",
      null,
      null,
      "unavailable",
    ),
    // gross margin needs product cost and order-line data; neither is
    // ingested yet (see command-center-metrics.real-source.ts, which leaves
    // productCosts/canonicalOrderLines empty on purpose). No real source,
    // so unavailable rather than a hardcoded percentage.
    commandCenterRecord(
      "11111111-1111-4111-8111-111111111105",
      "Marża brutto",
      0,
      "percent",
      null,
      null,
      "unavailable",
    ),
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

  return {
    ...(planPerformanceExtras ?? {}),
    ...(driversExtras ?? {}),
    evidencePolicy: "canonical-and-reconciled-only",
    pageInfo: {
      nextCursor: null,
      total: records.length,
    },
    // No recommendation-generation engine exists in this system yet — the
    // two entries this used to return unconditionally were the same two
    // fabricated recommendations regardless of what the actual data showed.
    // An empty list is the honest state until a real recommender is wired
    // in; the UI already has an empty state for this.
    recommendations: [],
    records,
    source: "canonical-dashboard-summary",
    dateRange,
    steps: [],
    summary: {
      critical,
      ready,
      total: records.length,
      updatedAt,
      warning,
    },
    view: operationId,
    waterfall: [],
    [resultKey]: {
      completedAt: updatedAt,
      domain: "command-center",
      operationId,
    },
  };
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

function commandCenterSourceReadiness(value: unknown): CommandCenterReadiness {
  return value === "ready" ? "ready" : "partial";
}

function collectionLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
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
