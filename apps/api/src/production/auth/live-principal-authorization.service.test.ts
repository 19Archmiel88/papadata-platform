import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { tenantOwnerBootstrapCapabilities } from "@papadata/contracts";
import type { ProductionDatabase } from "@papadata/database";
import { LivePrincipalAuthorizationService } from "./live-principal-authorization.service.js";
import type { RequestPrincipal } from "./request-principal.js";

type TargetRow = {
  readonly tenantStatus: string;
  readonly workspaceStatus: string;
};

type MembershipRow = {
  readonly dataScope: string;
  readonly exactWorkspace: boolean;
  readonly jitExpiresAt: string | null;
  readonly role: string;
  readonly status: string;
};

describe("live principal authorization", () => {
  test("tenant owner bootstrap capabilities exclude platform-only support and audit capabilities", () => {
    assert.equal(tenantOwnerBootstrapCapabilities.includes("billing.manage"), true);
    assert.equal(tenantOwnerBootstrapCapabilities.includes("support.jit.use"), false);
    assert.equal(tenantOwnerBootstrapCapabilities.includes("support.jit.approve"), false);
    assert.equal(tenantOwnerBootstrapCapabilities.includes("audit.verify"), false);
  });

  test("tenant owner is authorized from live database role policy, not token capabilities", async () => {
    const service = serviceWithRows([
      membership({
        dataScope: "tenant",
        exactWorkspace: false,
        role: "Tenant Owner",
      }),
    ]);

    const decision = await service.authorize({
      now: fixedNow,
      principal: principal({ capabilities: [] }),
      requiredCapabilities: ["billing.manage", "workspace.manage"],
    });

    assert.equal(decision.allowed, true);
  });

  test("tenant owner cannot use platform-only audit verification", async () => {
    const service = serviceWithRows([
      membership({
        dataScope: "tenant",
        exactWorkspace: false,
        role: "Tenant Owner",
      }),
    ]);

    const decision = await service.authorize({
      now: fixedNow,
      principal: principal({ capabilities: ["audit.verify"] }),
      requiredCapabilities: ["audit.verify"],
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.reason, "live_capability_missing");
  });

  test("blocked exact workspace membership overrides tenant-owner fallback", async () => {
    const service = serviceWithRows([
      membership({
        dataScope: "workspace",
        exactWorkspace: true,
        role: "Workspace Admin",
        status: "blocked",
      }),
      membership({
        dataScope: "tenant",
        exactWorkspace: false,
        role: "Tenant Owner",
      }),
    ]);

    const decision = await service.authorize({
      now: fixedNow,
      principal: principal(),
      requiredCapabilities: ["workspace.read"],
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.reason, "workspace_membership_not_active");
  });

  test("support JIT requires exact active support_jit membership and future expiry", async () => {
    const future = new Date(fixedNow.getTime() + 60_000).toISOString();
    const expired = new Date(fixedNow.getTime() - 60_000).toISOString();

    const allowed = await serviceWithRows([
      membership({
        dataScope: "support_jit",
        exactWorkspace: true,
        jitExpiresAt: future,
        role: "Internal Support/Operations",
      }),
    ]).authorize({
      now: fixedNow,
      principal: principal(),
      requiredCapabilities: ["audit.verify", "support.jit.use"],
    });

    assert.equal(allowed.allowed, true);

    const denied = await serviceWithRows([
      membership({
        dataScope: "support_jit",
        exactWorkspace: true,
        jitExpiresAt: expired,
        role: "Internal Support/Operations",
      }),
    ]).authorize({
      now: fixedNow,
      principal: principal(),
      requiredCapabilities: ["audit.verify"],
    });

    assert.equal(denied.allowed, false);
    assert.equal(denied.reason, "live_capability_missing");
  });

  test("inactive tenant or workspace denies before role evaluation", async () => {
    const service = serviceWithRows([
      membership({ role: "Tenant Owner", dataScope: "tenant" }),
    ], {
      tenantStatus: "active",
      workspaceStatus: "blocked",
    });

    const decision = await service.authorize({
      now: fixedNow,
      principal: principal(),
      requiredCapabilities: ["workspace.read"],
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.reason, "tenant_or_workspace_not_active");
  });
});

const fixedNow = new Date("2026-08-08T10:00:00.000Z");

function serviceWithRows(
  memberships: readonly MembershipRow[],
  target: TargetRow = { tenantStatus: "active", workspaceStatus: "active" },
): LivePrincipalAuthorizationService {
  const database = {
    async withTenantWorkspace<T>(
      tenantId: string,
      workspaceId: string | null,
      operation: (client: {
        query: <Row extends Record<string, unknown>>(
          text: string,
          values?: readonly unknown[],
        ) => Promise<{ readonly rows: readonly Row[] }>;
      }) => Promise<T>,
    ): Promise<T> {
      assert.equal(tenantId, "tenant-real");
      assert.equal(workspaceId, "workspace-real");
      return operation({
        async query<Row extends Record<string, unknown>>(
          text: string,
        ): Promise<{ readonly rows: readonly Row[] }> {
          if (text.includes("from app.workspaces")) {
            return { rows: [target as unknown as Row] };
          }

          if (text.includes("from app.memberships")) {
            return { rows: memberships as unknown as readonly Row[] };
          }

          throw new Error(`Unexpected query: ${text}`);
        },
      });
    },
  } as unknown as ProductionDatabase;

  return new LivePrincipalAuthorizationService(database);
}

function membership(
  overrides: Partial<MembershipRow> = {},
): MembershipRow {
  return {
    dataScope: "workspace",
    exactWorkspace: true,
    jitExpiresAt: null,
    role: "Analyst",
    status: "active",
    ...overrides,
  };
}

function principal(
  overrides: Partial<RequestPrincipal> = {},
): RequestPrincipal {
  return {
    authLevel: "mfa",
    capabilities: ["reports.read"],
    expiresAt: new Date(fixedNow.getTime() + 60_000).toISOString(),
    issuedAt: fixedNow.toISOString(),
    issuer: "issuer",
    memberships: [
      {
        capabilities: ["reports.read"],
        roles: ["Analyst"],
        tenantId: "tenant-real",
        workspaceId: "workspace-real",
      },
    ],
    sessionId: "session-real",
    source: "internal_token",
    stepUpExpiresAt: new Date(fixedNow.getTime() + 60_000).toISOString(),
    tenantId: "tenant-real",
    userId: "user-real",
    workspaceId: "workspace-real",
    ...overrides,
  };
}
