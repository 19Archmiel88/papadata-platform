import { describe, expect, it } from "vitest";
import {
  capabilityCatalog,
  canonicalCapabilities,
  type CanonicalCapability,
} from "./capability-catalog.js";
import {
  authorizationRoles,
  isPlatformOnlyCapability,
  membershipDataScopes,
  membershipStatuses,
  platformOnlyCapabilities,
  resolveMembershipCapabilities,
  tenantOwnerBootstrapCapabilities,
  type AuthorizationRole,
  type MembershipDataScope,
  type MembershipStatus,
} from "./authorization-role-policy.js";

const now = new Date("2026-08-31T10:00:00.000Z");
const future = "2026-08-31T10:05:00.000Z";
const past = "2026-08-31T09:55:00.000Z";

describe("authorization role policy", () => {
  it("has exactly one catalog descriptor per canonical capability", () => {
    expect(capabilityCatalog).toHaveLength(canonicalCapabilities.length);
    expect(new Set(capabilityCatalog.map((item) => item.capability)).size)
      .toBe(canonicalCapabilities.length);
  });

  it("does not assign one catalog operation to multiple capabilities", () => {
    const operationOwners = new Map<string, CanonicalCapability>();

    for (const descriptor of capabilityCatalog) {
      for (const operation of descriptor.operations) {
        const previous = operationOwners.get(operation);
        expect(previous, `${operation} is assigned twice`).toBeUndefined();
        operationOwners.set(operation, descriptor.capability);
      }
    }
  });

  it("keeps Tenant Owner on every non-platform capability and no platform-only capability", () => {
    const capabilities = resolve("Tenant Owner", "tenant", "active");

    expect(capabilities).toEqual(tenantOwnerBootstrapCapabilities);
    expect(capabilities.some(isPlatformOnlyCapability)).toBe(false);
  });

  it.each(membershipStatuses.filter((status) => status !== "active"))(
    "grants no capabilities to %s memberships",
    (status) => {
      for (const role of authorizationRoles) {
        expect(resolve(role, defaultScope(role), status)).toEqual([]);
      }
    },
  );

  it.each(membershipDataScopes)(
    "applies dataScope %s without widening roles",
    (dataScope) => {
      expect(resolve("Tenant Owner", dataScope, "active").length > 0)
        .toBe(dataScope === "tenant");
      expect(resolve("Billing Admin", dataScope, "active").length > 0)
        .toBe(dataScope === "billing" || dataScope === "tenant");
      expect(resolve("Auditor/Security", dataScope, "active").length > 0)
        .toBe(dataScope === "audit" || dataScope === "tenant");
      expect(resolve("Workspace Admin", dataScope, "active").length > 0)
        .toBe(dataScope === "workspace" || dataScope === "assigned_workspace");
    },
  );

  it("keeps role capability boundaries explicit", () => {
    expect(resolve("Viewer", "workspace", "active")).toEqual(expect.arrayContaining([
      "workspace.read",
      "analytics.metrics.read",
      "reports.read",
    ]));
    expect(resolve("Viewer", "workspace", "active")).not.toContain("workspace.manage");

    expect(resolve("Analyst", "workspace", "active")).toContain("analytics.metrics.read");
    expect(resolve("Analyst", "workspace", "active")).not.toContain("integrations.credentials.manage");

    expect(resolve("Marketing Operator", "workspace", "active")).toContain("integrations.sync.run");
    expect(resolve("Marketing Operator", "workspace", "active")).not.toContain("tenant.membership.manage");

    expect(resolve("Billing Admin", "billing", "active")).toEqual(expect.arrayContaining([
      "billing.read",
      "billing.manage",
    ]));
    expect(resolve("Billing Admin", "billing", "active")).not.toContain("analytics.metrics.read");
    expect(resolve("Billing Admin", "billing", "active")).not.toContain("integrations.connection.manage");

    expect(resolve("Auditor/Security", "audit", "active")).toContain("audit.read");
    expect(resolve("Auditor/Security", "audit", "active")).not.toContain("workspace.manage");
  });

  it("requires valid unexpired JIT for support operations", () => {
    expect(resolve("Internal Support/Operations", "support_jit", "active", future))
      .toEqual(expect.arrayContaining(["support.jit.use", "audit.verify"]));
    expect(resolve("Internal Support/Operations", "support_jit", "active", past))
      .toEqual([]);
    expect(resolve("Internal Support/Operations", "tenant", "active", future))
      .toEqual([]);
  });

  it("does not grant platform-only capabilities to ordinary tenant or workspace users", () => {
    for (const role of authorizationRoles.filter((role) => role !== "Internal Support/Operations")) {
      const capabilities = resolve(role, defaultScope(role), "active");
      for (const platformCapability of platformOnlyCapabilities) {
        expect(capabilities).not.toContain(platformCapability);
      }
    }
  });
});

function resolve(
  role: AuthorizationRole,
  dataScope: MembershipDataScope,
  status: MembershipStatus,
  jitExpiresAt: string | null = null,
): readonly CanonicalCapability[] {
  return resolveMembershipCapabilities({
    dataScope,
    jitExpiresAt,
    role,
    status,
  }, now);
}

function defaultScope(role: AuthorizationRole): MembershipDataScope {
  if (role === "Tenant Owner") {
    return "tenant";
  }
  if (role === "Billing Admin") {
    return "billing";
  }
  if (role === "Auditor/Security") {
    return "audit";
  }
  if (role === "Internal Support/Operations") {
    return "support_jit";
  }
  return "workspace";
}
