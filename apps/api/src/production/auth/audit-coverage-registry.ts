import { Reflector } from "@nestjs/core";
import type { CanonicalCapability } from "@papadata/contracts";
import { capabilityCatalog } from "@papadata/contracts";
import type { AuthenticationLevel } from "./request-principal.js";
import { listProductionOperations } from "./route-inventory.js";
import { operationIdMetadataKey } from "./route-policy.js";
import {
  authLevelRank,
  effectiveRiskClassForCapabilities,
  readRoutePolicy,
  requiredAuthenticationLevelForCapabilities,
  requiresDeniedAuditByRiskClass,
  type CapabilityRiskClass,
} from "./route-policy-reader.js";

const reflector = new Reflector();

// Faza 9 §7: every authenticated operation gets exactly one denied-audit
// decision and (for state-changing operations, where a generic mechanism
// exists) exactly one success-audit decision. Never UNKNOWN/UNCLASSIFIED.
export type DeniedAuditDecision = "DENIED_AUDIT_NOT_REQUIRED" | "DENIED_AUDIT_REQUIRED";
export type SuccessAuditDecision = "SUCCESS_AUDIT_NOT_REQUIRED" | "SUCCESS_AUDIT_REQUIRED";

export type RouteCoverageEntry = {
  readonly auditDeniedAccessEnabled: boolean;
  readonly capabilities: readonly CanonicalCapability[];
  readonly classification: "authenticated" | "external-provider" | "infrastructure" | "public";
  readonly deniedAuditDecision: DeniedAuditDecision;
  readonly effectiveAuthLevel: "mfa" | "session" | "step_up" | null;
  readonly effectiveRiskClass: CapabilityRiskClass | null;
  readonly httpMethod: string;
  readonly httpOperation: string;
  readonly operationId: string | null;
  readonly path: string;
  readonly successAuditAction: string | null;
  // null when successAuditDecision is null/NOT_REQUIRED; true/false when
  // REQUIRED -- REQUIRED-with-false is exactly what checkSuccessAuditCoverage
  // turns into a hard violation, see below.
  readonly successAuditCovered: boolean | null;
  readonly successAuditDecision: SuccessAuditDecision | null;
};

export type CoverageViolation = {
  readonly httpOperation: string;
  readonly message: string;
  readonly type:
    | "duplicate_operation_id"
    | "invalid_route_policy"
    | "missing_denied_audit"
    | "missing_operation_id"
    | "missing_success_audit"
    | "orphan_capability_operation"
    | "stale_coverage_registry_entry"
    | "weak_auth_level";
};

// Faza 9 §6/§24: independently re-derives what the denied-audit and
// authLevel requirements *should* be from capability metadata and checks
// the route's actual effective policy against them. Exported standalone
// (not inlined into the main scan loop) specifically so a regression test
// can feed it a deliberately-inconsistent input directly -- neither
// violation can actually occur through readRoutePolicy today (both are
// enforced by construction: auditDeniedAccess ORs the derived requirement
// in, and authLevel is strongestAuthenticationLevel(declared, derived)) --
// these checks exist to catch a *future* regression in that derivation,
// and are proven to actually catch one via the adversarial unit tests in
// audit-coverage-registry.test.ts.
export function checkDeniedAuditCoverage(
  httpOperation: string,
  effectiveRiskClass: CapabilityRiskClass,
  auditDeniedAccess: boolean,
): CoverageViolation | null {
  if (!requiresDeniedAuditByRiskClass(effectiveRiskClass) || auditDeniedAccess) return null;
  return {
    httpOperation,
    message: `Risk class ${effectiveRiskClass} requires denied-access audit, but auditDeniedAccess is false.`,
    type: "missing_denied_audit",
  };
}

// Faza 9 blocker fix: `required > covered` with zero violations was a real
// bug in this file, not just a reporting quirk -- an operation with
// SUCCESS_AUDIT_REQUIRED and no verified writer must fail the gate, full
// stop. This is intentionally NOT special-cased per operationId: it's a
// generic check applied to every entry, so reports.download is covered by
// the same rule any future sensitive-read addition would be.
export function checkSuccessAuditCoverage(
  httpOperation: string,
  successAuditDecision: SuccessAuditDecision | null,
  covered: boolean | null,
): CoverageViolation | null {
  if (successAuditDecision !== "SUCCESS_AUDIT_REQUIRED") return null;
  if (covered) return null;
  return {
    httpOperation,
    message: "Operation requires a success audit (SUCCESS_AUDIT_REQUIRED) but has no verified writer.",
    type: "missing_success_audit",
  };
}

export function checkCoverageRegistryEntryIsLive(
  operationId: string,
  implementedOperationIds: ReadonlySet<string>,
): CoverageViolation | null {
  if (implementedOperationIds.has(operationId)) return null;
  return {
    httpOperation: operationId,
    message: `sensitiveReadOperationIds names operationId "${operationId}", which does not match any production route.`,
    type: "stale_coverage_registry_entry",
  };
}

export function checkAuthLevelNotWeakened(
  httpOperation: string,
  capabilities: readonly CanonicalCapability[],
  effectiveAuthLevel: AuthenticationLevel,
): CoverageViolation | null {
  const catalogMinimum = requiredAuthenticationLevelForCapabilities(capabilities);
  if (authLevelRank[effectiveAuthLevel] >= authLevelRank[catalogMinimum]) return null;
  return {
    httpOperation,
    message: `Capability catalog requires at least "${catalogMinimum}", but effective authLevel is "${effectiveAuthLevel}".`,
    type: "weak_auth_level",
  };
}

export type AuditCoverageEvidence = {
  readonly authenticatedRoutes: number;
  readonly criticalRiskRoutes: number;
  readonly deniedAuditCovered: number;
  readonly deniedAuditRequired: number;
  readonly externalProviderRoutes: number;
  readonly highRiskRoutes: number;
  readonly infrastructureRoutes: number;
  readonly lowRiskRoutes: number;
  readonly mediumRiskRoutes: number;
  readonly missingSuccessAudits: number;
  readonly publicRoutes: number;
  readonly successAuditCovered: number;
  readonly successAuditRequired: number;
  readonly totalRoutes: number;
  readonly unclassified: number;
  readonly violations: number;
};

export type AuditCoverageRegistry = {
  readonly entries: readonly RouteCoverageEntry[];
  readonly evidence: AuditCoverageEvidence;
  readonly violations: readonly CoverageViolation[];
};

// State-changing methods get generic success+failure audit coverage from
// CommandExecutionInterceptor (apps/api/src/production/commands/
// command-execution.interceptor.ts) *unconditionally* for every
// authenticated request: it fires purely off `principal exists &&
// isStateChanging(method)`, with a mandatory Idempotency-Key (409 if
// missing/malformed) -- there is no per-route opt-out. So for POST/PUT/
// PATCH/DELETE, "does a success audit exist" is centrally derivable from
// the route's own metadata, not something that needs to be repeated per
// route. GET is deliberately never extended into this interceptor (it has
// no idempotency-key/mutation semantics to hang a generic mechanism off
// of) -- a GET that needs a success audit gets one via its own explicit
// writer instead; see explicitSuccessAuditWriters below.
const stateChangingMethods = new Set(["DELETE", "PATCH", "POST", "PUT"]);

// Faza 9 §21/§22: authenticated GET reads generally need no *success*
// audit (nothing mutated). A small number of reads return highly sensitive
// material gated at a high/critical risk class -- flagging them here is a
// deliberate, explicit, hand-maintained decision (the kind of information
// that genuinely cannot be derived from route metadata alone), not an
// automatic inference.
const sensitiveReadOperationIds = new Set<string>([
  "reports.download",
]);

// Reviewed, hand-maintained companion to sensitiveReadOperationIds: an
// operationId only lands here once it has a confirmed, tested
// audit.append() call site outside CommandExecutionInterceptor's generic
// path. checkSuccessAuditCoverage turns any operationId that's in
// sensitiveReadOperationIds but *not* here into a hard gate failure -- see
// report.controller.ts's download() for reports.download's writer, and
// audit-coverage-registry.test.ts's adversarial fixture for what happens
// when these two lists drift apart.
const explicitSuccessAuditWriters = new Set<string>([
  "reports.download",
]);

// Faza 9 §5: capabilityCatalog.operations documents a "METHOD /path" the
// capability is meant to back, but a handful predate routes that were
// never built (or are served by the BFF directly rather than proxied to
// apps/api, which is this registry's whole scan surface) -- an explicit,
// reviewed allowlist per §5's "chyba że istnieje jawnie udokumentowany
// wyjątek", not a silent skip. Each entry names *why* it has no matching
// apps/api route today. Keys are normalized the same way as the scan
// itself (see normalizeHttpOperation) so the catalog can keep writing
// `:id`/`:sessionId`/etc for readability.
const documentedOrphanCapabilityOperations: Readonly<Record<string, string>> = {
  "DELETE /v1/auth/sessions/:param": "auth.session.revoke's own-session-list "
    + "management is handled entirely inside the BFF (BffIdentitySessionService."
    + "revokeSessionById, apps/bff/src/contract-auth.controller.ts's "
    + "DELETE sessions/:sessionId) -- it is never proxied to apps/api, which is "
    + "this registry's scan surface (matches apps/api/src/production only, "
    + "same scope as tools/backend-gate-common.mjs's collectRuntimeOperations).",
  "DELETE /v1/memberships/:param": "Membership removal (as opposed to "
    + "revoking/rejecting an invitation, which is implemented) is not yet a "
    + "built endpoint. Open decision, not built here.",
  "GET /v1/audit/events": "audit.read has no dedicated list endpoint yet -- "
    + "audit access today is exposed only via POST /v1/audit/verify "
    + "(audit.verify) and the contract-runtime GET /v1/settings/audyt "
    + "(settings.audit.read). Flagged as an open decision, not built here "
    + "(would be new product surface, out of Faza 9's regression-gate scope).",
  "GET /v1/auth/sessions": "auth.session.read's session list is served "
    + "entirely by the BFF (BffIdentitySessionService.listSessions, "
    + "apps/bff/src/contract-auth.controller.ts's GET sessions) -- never "
    + "proxied to apps/api. Same BFF-native reasoning as the revoke entry above.",
  "GET /v1/workspaces/:param": "No get-workspace-by-id endpoint exists yet; "
    + "workspace.read is served today via GET /v1/access/workspaces/list and "
    + "GET /v1/workspace/resolve (current-session-scoped, not by arbitrary id). "
    + "Open decision, not built here.",
  "POST /v1/security/jit-grants": "support.jit.request is not yet backed by "
    + "any route (the whole Internal-Support/Operations JIT-grant workflow -- "
    + "request/approve/activate -- is unimplemented; see the .approve and .use "
    + "entries below). Open decision, not built here.",
  "POST /v1/security/jit-grants/:param/activate": "support.jit.use is not yet "
    + "backed by any route -- see the .request entry above.",
  "POST /v1/security/jit-grants/:param/approve": "support.jit.approve is not "
    + "yet backed by any route -- see the .request entry above.",
  "PUT /v1/privacy/consent": "privacy.own_consent.manage is not yet backed by "
    + "any route (self-service consent management is unimplemented). Open "
    + "decision, not built here.",
  "GET /v1/privacy/policies": "privacy.tenant_policy.read is not yet backed "
    + "by any route (tenant privacy-policy configuration is unimplemented). "
    + "Open decision, not built here.",
  "PUT /v1/privacy/policies": "privacy.tenant_policy.manage is not yet backed "
    + "by any route -- see the .read entry above.",
};

// The capability catalog documents operations with placeholder param names
// (e.g. ":id") that don't necessarily match the real route's own param name
// (e.g. ":key", ":connectionId") -- comparing "METHOD /path" strings must
// normalize path *parameters*, not just literal segments, or a cosmetic
// param-name difference reads as a missing route. This is a structural
// normalization of REST path syntax (any `:xxx` segment), not a
// heuristic/fuzzy name match -- §4 forbids the latter, not this.
function normalizeHttpOperation(value: string): string {
  return value.replaceAll(/:[^/]+/gu, ":param");
}

// `operations` is injectable (defaults to the real production route
// inventory) purely so regression tests can exercise this validation logic
// against small synthetic fixtures -- see audit-coverage-registry.test.ts.
// `includeOrphanCapabilityCheck` defaults to true for real use (the actual
// CI gate scans the *global* capability catalog for operations with no
// matching route) but must be disabled when testing a tiny synthetic
// fixture in isolation -- otherwise nearly every real catalog operation
// looks "orphaned" simply because the fixture doesn't implement it.
// `sensitiveReadOperationIds`/`explicitSuccessAuditWriters` likewise
// default to the real, reviewed module-level lists and are only ever
// overridden by a test constructing an end-to-end "required but
// uncovered" fixture -- see the blocker-fix regression test.
export function buildAuditCoverageRegistry(
  operations: ReturnType<typeof listProductionOperations> = listProductionOperations(),
  options: {
    readonly explicitSuccessAuditWriters?: ReadonlySet<string>;
    readonly includeOrphanCapabilityCheck?: boolean;
    readonly sensitiveReadOperationIds?: ReadonlySet<string>;
  } = {},
): AuditCoverageRegistry {
  const includeOrphanCapabilityCheck = options.includeOrphanCapabilityCheck ?? true;
  const sensitiveReadOperationIdsInUse = options.sensitiveReadOperationIds ?? sensitiveReadOperationIds;
  const explicitSuccessAuditWritersInUse = options.explicitSuccessAuditWriters ?? explicitSuccessAuditWriters;
  const violations: CoverageViolation[] = [];
  const entries: RouteCoverageEntry[] = [];
  const seenOperationIds = new Map<string, string>();

  const catalogOperationToCapability = new Map<string, CanonicalCapability>();
  for (const descriptor of capabilityCatalog) {
    for (const operation of descriptor.operations) {
      catalogOperationToCapability.set(normalizeHttpOperation(operation), descriptor.capability);
    }
  }
  const implementedHttpOperations = new Set(
    operations.map((operation) => normalizeHttpOperation(operation.httpOperation)),
  );

  for (const operation of operations) {
    const policy = readRoutePolicy(reflector, operation.handler, operation.controller);
    const operationId = Reflect.getMetadata(operationIdMetadataKey, operation.handler) as string | undefined ?? null;

    if (!operationId) {
      violations.push({
        httpOperation: operation.httpOperation,
        message: "Production route has no @OperationId().",
        type: "missing_operation_id",
      });
    } else {
      const existing = seenOperationIds.get(operationId);
      if (existing && existing !== operation.httpOperation) {
        violations.push({
          httpOperation: operation.httpOperation,
          message: `operationId "${operationId}" is also used by ${existing}.`,
          type: "duplicate_operation_id",
        });
      }
      seenOperationIds.set(operationId, operation.httpOperation);
    }

    if (!policy.valid) {
      violations.push({
        httpOperation: operation.httpOperation,
        message: `Invalid route policy: ${policy.reason}`,
        type: "invalid_route_policy",
      });
      entries.push({
        auditDeniedAccessEnabled: false,
        capabilities: [],
        classification: "public",
        deniedAuditDecision: "DENIED_AUDIT_NOT_REQUIRED",
        effectiveAuthLevel: null,
        effectiveRiskClass: null,
        httpMethod: operation.httpMethod,
        httpOperation: operation.httpOperation,
        operationId,
        path: operation.path,
        successAuditAction: null,
        successAuditCovered: null,
        successAuditDecision: null,
      });
      continue;
    }

    const { policy: effective } = policy;
    const catalogCapability = catalogOperationToCapability.get(normalizeHttpOperation(operation.httpOperation));
    if (
      effective.classification === "authenticated"
      && catalogCapability
      && !effective.capabilities.includes(catalogCapability)
    ) {
      violations.push({
        httpOperation: operation.httpOperation,
        message: `capabilityCatalog documents ${catalogCapability} for this route, but the route requires [${effective.capabilities.join(", ")}].`,
        type: "orphan_capability_operation",
      });
    }

    if (effective.classification === "authenticated") {
      const deniedAuditViolation = checkDeniedAuditCoverage(
        operation.httpOperation,
        effectiveRiskClassForCapabilities(effective.capabilities),
        effective.auditDeniedAccess,
      );
      if (deniedAuditViolation) violations.push(deniedAuditViolation);

      const authLevelViolation = checkAuthLevelNotWeakened(
        operation.httpOperation,
        effective.capabilities,
        effective.authLevel,
      );
      if (authLevelViolation) violations.push(authLevelViolation);
    }

    const { covered: successCovered, decision: successDecision } = resolveSuccessAudit(
      operation.httpMethod,
      effective.classification,
      operationId,
      sensitiveReadOperationIdsInUse,
      explicitSuccessAuditWritersInUse,
    );
    const successAuditViolation = checkSuccessAuditCoverage(
      operation.httpOperation,
      successDecision,
      successCovered,
    );
    if (successAuditViolation) violations.push(successAuditViolation);

    entries.push({
      auditDeniedAccessEnabled: effective.auditDeniedAccess,
      capabilities: effective.capabilities,
      classification: effective.classification,
      deniedAuditDecision: effective.classification === "authenticated"
        ? (effective.auditDeniedAccess ? "DENIED_AUDIT_REQUIRED" : "DENIED_AUDIT_NOT_REQUIRED")
        : "DENIED_AUDIT_NOT_REQUIRED",
      effectiveAuthLevel: effective.authLevel,
      effectiveRiskClass: effective.effectiveRiskClass,
      httpMethod: operation.httpMethod,
      httpOperation: operation.httpOperation,
      operationId,
      path: operation.path,
      successAuditAction: successDecision === "SUCCESS_AUDIT_REQUIRED" ? (operationId ?? "unknown") : null,
      successAuditCovered: successCovered,
      successAuditDecision: successDecision,
    });
  }

  if (includeOrphanCapabilityCheck) {
    for (const [catalogOperation, capability] of catalogOperationToCapability) {
      if (implementedHttpOperations.has(catalogOperation)) continue;
      if (catalogOperation in documentedOrphanCapabilityOperations) continue;
      violations.push({
        httpOperation: catalogOperation,
        message: `capabilityCatalog capability ${capability} documents operation "${catalogOperation}", which has no matching production route and no documented exception.`,
        type: "orphan_capability_operation",
      });
    }

    // §27 item 8: a hand-maintained coverage-registry entry (the one thing
    // in this file that names an operationId instead of deriving it) that
    // no longer points at a real operationId is exactly the kind of silent
    // drift this gate exists to catch -- e.g. a route gets renamed/removed
    // and the registry entry is never updated.
    const implementedOperationIds = new Set(seenOperationIds.keys());
    for (const operationId of sensitiveReadOperationIds) {
      const violation = checkCoverageRegistryEntryIsLive(operationId, implementedOperationIds);
      if (violation) violations.push(violation);
    }
  }

  const evidence = summarize(entries, violations);
  return { entries, evidence, violations };
}

type SuccessAuditResolution = {
  readonly covered: boolean | null;
  readonly decision: SuccessAuditDecision | null;
};

function resolveSuccessAudit(
  httpMethod: string,
  classification: RouteCoverageEntry["classification"],
  operationId: string | null,
  sensitiveReadOperationIdsInUse: ReadonlySet<string>,
  explicitSuccessAuditWritersInUse: ReadonlySet<string>,
): SuccessAuditResolution {
  if (classification !== "authenticated") return { covered: null, decision: null };
  if (stateChangingMethods.has(httpMethod)) {
    // CommandExecutionInterceptor's coverage is unconditional for every
    // authenticated state-changing request -- always covered.
    return { covered: true, decision: "SUCCESS_AUDIT_REQUIRED" };
  }
  if (operationId && sensitiveReadOperationIdsInUse.has(operationId)) {
    return {
      covered: explicitSuccessAuditWritersInUse.has(operationId),
      decision: "SUCCESS_AUDIT_REQUIRED",
    };
  }
  return { covered: null, decision: "SUCCESS_AUDIT_NOT_REQUIRED" };
}

function summarize(
  entries: readonly RouteCoverageEntry[],
  violations: readonly CoverageViolation[],
): AuditCoverageEvidence {
  const count = (predicate: (entry: RouteCoverageEntry) => boolean) =>
    entries.filter(predicate).length;

  return {
    authenticatedRoutes: count((entry) => entry.classification === "authenticated"),
    criticalRiskRoutes: count((entry) => entry.effectiveRiskClass === "critical"),
    deniedAuditCovered: count((entry) => entry.deniedAuditDecision === "DENIED_AUDIT_REQUIRED" && entry.auditDeniedAccessEnabled),
    deniedAuditRequired: count((entry) => entry.deniedAuditDecision === "DENIED_AUDIT_REQUIRED"),
    externalProviderRoutes: count((entry) => entry.classification === "external-provider"),
    highRiskRoutes: count((entry) => entry.effectiveRiskClass === "high"),
    infrastructureRoutes: count((entry) => entry.classification === "infrastructure"),
    lowRiskRoutes: count((entry) => entry.effectiveRiskClass === "low"),
    mediumRiskRoutes: count((entry) => entry.effectiveRiskClass === "medium"),
    publicRoutes: count((entry) => entry.classification === "public"),
    missingSuccessAudits: count((entry) => entry.successAuditDecision === "SUCCESS_AUDIT_REQUIRED"
      && entry.successAuditCovered !== true),
    successAuditCovered: count((entry) => entry.successAuditDecision === "SUCCESS_AUDIT_REQUIRED"
      && entry.successAuditCovered === true),
    successAuditRequired: count((entry) => entry.successAuditDecision === "SUCCESS_AUDIT_REQUIRED"),
    totalRoutes: entries.length,
    unclassified: 0,
    violations: violations.length,
  };
}
