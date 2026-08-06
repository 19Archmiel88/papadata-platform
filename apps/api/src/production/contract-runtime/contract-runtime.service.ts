import { Inject } from "@nestjs/common";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import {
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

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(IdentityService) private readonly identity: IdentityService,
    @Inject(IntegrationService) private readonly integrations: IntegrationService,
  ) {
    this.repository = new ProductDomainRepository(database);
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
        data: await this.repository.dashboardSummary(
          principal.tenantId,
          principal.workspaceId,
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
        data: {
          ...summary,
          view: request.operationId,
          evidencePolicy: "canonical-and-reconciled-only",
        },
        operationId: request.operationId,
        implementation: "canonical-dashboard-summary",
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
